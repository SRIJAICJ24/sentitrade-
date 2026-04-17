import winston from "winston";

const logFormat = winston.format.printf(
  ({ level, message, timestamp, stack }) =>
    `${timestamp} [${level}] ${stack ?? message}`,
);

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    process.env.NODE_ENV === "production"
      ? winston.format.json()
      : winston.format.colorize({ all: true }),
    process.env.NODE_ENV === "production"
      ? winston.format.uncolorize()
      : logFormat,
  ),
  transports: [new winston.transports.Console()],
});
