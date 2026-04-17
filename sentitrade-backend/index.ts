import "dotenv/config";

import express, { Request, Response } from "express";
import http from "http";
import cron from "node-cron";
import { RawData, WebSocket, WebSocketServer } from "ws";

import { runCouncil } from "./src/agents/AgentCouncil";
import { sentimentRouter } from "./src/routes/sentiment";
import { blackSwanRouter } from "./src/routes/blackswan";
import { tradesRouter, recordTradeProposal } from "./src/routes/trades";
import { proposeTrade } from "./src/services/DryRunEngine";
import { explainSignal } from "./src/services/XAIExplainer";
import { registerClient, unregisterClient, broadcast } from "./src/utils/broadcast";
import { logger } from "./src/utils/logger";
import { ExecutionerResult } from "./src/types";

const PORT = Number(process.env.PORT ?? 3001);
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
  });
});

app.use("/api", sentimentRouter);
app.use("/api", blackSwanRouter);
app.use("/api", tradesRouter);

function sendSocketMessage(socket: WebSocket, payload: unknown): void {
  if (socket.readyState !== WebSocket.OPEN) {
    return;
  }

  socket.send(JSON.stringify(payload));
}

type ClientMessage = {
  type?: string;
  payload?: Record<string, unknown>;
  asset?: string;
  direction?: string;
};

function normalizeTradeDirection(direction?: string): ExecutionerResult["action"] | null {
  if (!direction) {
    return null;
  }

  const normalized = direction.toUpperCase();

  if (normalized === "BUY" || normalized === "SELL" || normalized === "HOLD") {
    return normalized;
  }

  return null;
}

async function handleSocketMessage(socket: WebSocket, rawData: RawData): Promise<void> {
  let message: ClientMessage;

  try {
    message = JSON.parse(rawData.toString()) as ClientMessage;
  } catch (error) {
    logger.warn("Failed to parse WebSocket message", { error });
    sendSocketMessage(socket, {
      type: "ERROR",
      timestamp: Date.now(),
      error: "Invalid JSON payload",
    });
    return;
  }

  const asset = typeof message.payload?.asset === "string"
    ? message.payload.asset
    : typeof message.asset === "string"
      ? message.asset
      : "SPY";
  const direction = normalizeTradeDirection(
    typeof message.payload?.direction === "string"
      ? message.payload.direction
      : typeof message.direction === "string"
        ? message.direction
        : undefined,
  );

  switch (message.type) {
    case "SUBSCRIBE_SIGNALS":
      sendSocketMessage(socket, {
        type: "SUBSCRIBED",
        timestamp: Date.now(),
        channel: "signals",
      });
      break;
    case "GET_WHY": {
      const result = await explainSignal(asset);
      sendSocketMessage(socket, {
        type: "WHY_RESULT",
        timestamp: Date.now(),
        data: result,
      });
      break;
    }
    case "RUN_DRY_TRADE": {
      const councilResult = await runCouncil(asset);
      const executionerResult: ExecutionerResult = direction
        ? {
            ...councilResult.executionerProposal,
            action: direction,
            reasoning: `${councilResult.executionerProposal.reasoning} | Manual direction ${direction}`,
          }
        : councilResult.executionerProposal;
      const proposal = proposeTrade(asset, executionerResult);

      recordTradeProposal(proposal);

      broadcast({
        type: "DRY_TRADE_PROPOSAL",
        timestamp: Date.now(),
        data: proposal,
      });
      break;
    }
    default:
      sendSocketMessage(socket, {
        type: "ERROR",
        timestamp: Date.now(),
        error: "Unsupported message type",
      });
  }
}

wss.on("connection", (socket) => {
  registerClient(socket);
  logger.info("Client connected");

  sendSocketMessage(socket, {
    type: "CONNECTED",
    timestamp: Date.now(),
    version: "1.0.0",
  });

  socket.on("message", (message) => {
    void handleSocketMessage(socket, message).catch((error) => {
      logger.error("WebSocket handler failed", { error });
      sendSocketMessage(socket, {
        type: "ERROR",
        timestamp: Date.now(),
        error: "Message handling failed",
      });
    });
  });

  socket.on("close", () => {
    unregisterClient(socket);
    logger.info("Client disconnected");
  });

  socket.on("error", (error) => {
    logger.error("WebSocket client error", { error });
  });
});

const councilTask = cron.schedule("*/1 * * * *", () => {
  void runCouncil("SPY").catch((error) => {
    logger.error("Scheduled council run failed", { error });
  });
});

server.listen(PORT, () => {
  logger.info(`SentiTrade Pro backend listening on port ${PORT}`);
});

function shutdown(signal: string): void {
  logger.info(`Received ${signal}; shutting down gracefully`);
  councilTask.stop();

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.close(1001, "Server shutting down");
    }
  });

  wss.close(() => {
    server.close((error?: Error) => {
      if (error) {
        logger.error("HTTP server shutdown failed", { error });
        process.exit(1);
        return;
      }

      logger.info("Shutdown complete");
      process.exit(0);
    });
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
