import pino, { Logger as PinoLogger, LoggerOptions } from 'pino';

/**
 * Singleton pattern for application logging
 * Uses Pino for high-performance structured logging
 */
export class Logger {
  private static instance: Logger | null = null;
  private logger: PinoLogger;

  private constructor(options?: LoggerOptions) {
    const isDevelopment = process.env.NODE_ENV !== 'production';

    const defaultOptions: LoggerOptions = {
      level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
      formatters: {
        level: (label) => {
          return { level: label.toUpperCase() };
        },
      },
      timestamp: pino.stdTimeFunctions.isoTime,
      ...(isDevelopment && {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        },
      }),
    };

    this.logger = pino(options || defaultOptions);
  }

  /**
   * Get the singleton instance of Logger
   * @param options Optional Pino configuration (only used on first instantiation)
   */
  public static getInstance(options?: LoggerOptions): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(options);
    }
    return Logger.instance;
  }

  /**
   * Create a child logger with additional context
   */
  public child(bindings: pino.Bindings): PinoLogger {
    return this.logger.child(bindings);
  }

  /**
   * Log at trace level
   */
  public trace(obj: any, msg?: string): void;
  public trace(msg: string): void;
  public trace(objOrMsg: any, msg?: string): void {
    if (typeof objOrMsg === 'string') {
      this.logger.trace(objOrMsg);
    } else {
      this.logger.trace(objOrMsg, msg);
    }
  }

  /**
   * Log at debug level
   */
  public debug(obj: any, msg?: string): void;
  public debug(msg: string): void;
  public debug(objOrMsg: any, msg?: string): void {
    if (typeof objOrMsg === 'string') {
      this.logger.debug(objOrMsg);
    } else {
      this.logger.debug(objOrMsg, msg);
    }
  }

  /**
   * Log at info level
   */
  public info(obj: any, msg?: string): void;
  public info(msg: string): void;
  public info(objOrMsg: any, msg?: string): void {
    if (typeof objOrMsg === 'string') {
      this.logger.info(objOrMsg);
    } else {
      this.logger.info(objOrMsg, msg);
    }
  }

  /**
   * Log at warn level
   */
  public warn(obj: any, msg?: string): void;
  public warn(msg: string): void;
  public warn(objOrMsg: any, msg?: string): void {
    if (typeof objOrMsg === 'string') {
      this.logger.warn(objOrMsg);
    } else {
      this.logger.warn(objOrMsg, msg);
    }
  }

  /**
   * Log at error level
   */
  public error(obj: any, msg?: string): void;
  public error(msg: string): void;
  public error(objOrMsg: any, msg?: string): void {
    if (typeof objOrMsg === 'string') {
      this.logger.error(objOrMsg);
    } else {
      this.logger.error(objOrMsg, msg);
    }
  }

  /**
   * Log at fatal level
   */
  public fatal(obj: any, msg?: string): void;
  public fatal(msg: string): void;
  public fatal(objOrMsg: any, msg?: string): void {
    if (typeof objOrMsg === 'string') {
      this.logger.fatal(objOrMsg);
    } else {
      this.logger.fatal(objOrMsg, msg);
    }
  }

  /**
   * Get the underlying Pino logger instance
   */
  public getLogger(): PinoLogger {
    return this.logger;
  }

  /**
   * Set the log level
   */
  public setLevel(level: pino.LevelWithSilent): void {
    this.logger.level = level;
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  public static reset(): void {
    Logger.instance = null;
  }
}

// Export a convenience function to get the instance
export const getLogger = () => Logger.getInstance();
