const { createLogger, transports, format } = require("winston");
const { combine, timestamp, printf } = format;

const path = require("path");
const logsDirectory = path.join(__dirname, "../logs");
const DailyRotateFile = require("winston-daily-rotate-file");

const logger = createLogger({
  level: "dev",
  format: combine(
    timestamp(),
    printf(({ level, message, timestamp }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ level, message, timestamp }) => {
          return `${timestamp} [${level.toUpperCase()}]: ${message}`;
        })
      ),
    }),
    new DailyRotateFile({
      filename: path.join(logsDirectory, "app-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxSize: "5m",
      maxFiles: "7d",
      level: "info",
      format: format.combine(format.timestamp(), format.json()),
    }),
  ],
});

module.exports = logger;
