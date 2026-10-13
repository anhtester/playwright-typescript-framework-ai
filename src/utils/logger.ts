import fs from 'node:fs';
import path from 'node:path';
import { env } from './env.config';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const PRIORITY: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };
const LOG_DIR = path.resolve(__dirname, '../../reports/logs');
const LOG_FILE = path.join(LOG_DIR, 'execution.log');

function isLogLevel(value: string): value is LogLevel {
  return value in PRIORITY;
}

const minLevel: LogLevel = isLogLevel(env.logLevel) ? env.logLevel : 'info';

/**
 * Logger ghi JSON Lines vào reports/logs/execution.log — mỗi dòng có worker để lọc theo luồng.
 * CHỈ ghi file, KHÔNG ghi console: stdout trong test bị allure-playwright đính thành attachment "stdout".
 */
export class Logger {
  constructor(private readonly scope: string) {}

  debug(message: string, meta?: Record<string, unknown>): void {
    this.write('debug', message, meta);
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.write('info', message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.write('warn', message, meta);
  }

  error(message: string, meta?: Record<string, unknown>): void {
    this.write('error', message, meta);
  }

  private write(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
    if (PRIORITY[level] < PRIORITY[minLevel]) {
      return;
    }
    const entry = {
      time: new Date().toISOString(),
      level,
      worker: process.env.TEST_WORKER_INDEX ?? 'main',
      scope: this.scope,
      message,
      ...(meta && { meta }),
    };
    fs.mkdirSync(LOG_DIR, { recursive: true });
    fs.appendFileSync(LOG_FILE, `${JSON.stringify(entry)}\n`, 'utf8');
  }
}

export function createLogger(scope: string): Logger {
  return new Logger(scope);
}
