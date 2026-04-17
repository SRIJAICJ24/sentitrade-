import { WebSocket } from "ws";

import { logger } from "./logger";

const clients = new Set<WebSocket>();

export function registerClient(client: WebSocket): void {
  clients.add(client);
}

export function unregisterClient(client: WebSocket): void {
  clients.delete(client);
}

export function broadcast(message: unknown): void {
  const payload = JSON.stringify(message);

  clients.forEach((client) => {
    if (client.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      client.send(payload);
    } catch (error) {
      logger.warn("Failed to broadcast message", { error });
    }
  });
}
