/**
 * logger.ts
 * 
 * Centralized logging utility with environment-aware behavior.
 * - Production: Only logs errors and warnings
 * - Development: Logs all messages, includes source info
 * - Tests: Can be configured to suppress or collect logs
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogContext = Record<string, any>;

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  source?: string;
}

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Format log message with context information
 */
function formatMessage(message: string, context?: LogContext, source?: string): string {
  let formatted = isDevelopment && source ? `[${source}] ${message}` : message;
  
  if (context && Object.keys(context).length > 0) {
    formatted += ` | ${JSON.stringify(context)}`;
  }
  
  return formatted;
}

/**
 * Get caller information in development mode
 */
function getCallSource(): string {
  if (!isDevelopment) return '';
  
  const stack = new Error().stack;
  if (!stack) return '';
  
  const lines = stack.split('\n');
  // Skip Error, formatMessage, and current logger function
  const callerLine = lines[4] || lines[3] || '';
  const match = callerLine.match(/at\s+(.+)\s+\(/);
  return match ? match[1] : '';
}

/**
 * Logger class for structured logging
 */
class Logger {
  private history: LogEntry[] = [];
  private maxHistorySize = 100;

  /**
   * Debug level - Development only
   */
  debug(message: string, context?: LogContext): void {
    if (isDevelopment) {
      const source = getCallSource();
      const formatted = formatMessage(message, context, source);
      console.debug(`[DEBUG] ${formatted}`);
      this.recordHistory('debug', message, context, source);
    }
  }

  /**
   * Info level - Development only
   */
  info(message: string, context?: LogContext): void {
    if (isDevelopment) {
      const source = getCallSource();
      const formatted = formatMessage(message, context, source);
      console.info(`[INFO] ${formatted}`);
      this.recordHistory('info', message, context, source);
    }
  }

  /**
   * Warning level - Development and Production
   */
  warn(message: string, context?: LogContext): void {
    const source = isDevelopment ? getCallSource() : undefined;
    const formatted = formatMessage(message, context, source);
    console.warn(`[WARN] ${formatted}`);
    this.recordHistory('warn', message, context, source);
  }

  /**
   * Error level - Development and Production
   */
  error(message: string, error?: Error | LogContext | unknown, context?: LogContext): void {
    let errorContext = context;
    let errorMessage = message;

    // Handle error object
    if (error instanceof Error) {
      errorContext = { ...context, error: error.message, stack: error.stack };
    } else if (typeof error === 'object' && error !== null) {
      errorContext = { ...error, ...context };
    }

    const source = isDevelopment ? getCallSource() : undefined;
    const formatted = formatMessage(errorMessage, errorContext, source);
    console.error(`[ERROR] ${formatted}`);
    this.recordHistory('error', message, errorContext, source);
  }

  /**
   * Get recent log history
   */
  getHistory(level?: LogLevel): LogEntry[] {
    return level ? this.history.filter(entry => entry.level === level) : this.history;
  }

  /**
   * Clear log history
   */
  clearHistory(): void {
    this.history = [];
  }

  /**
   * Record log entry in history
   */
  private recordHistory(level: LogLevel, message: string, context?: LogContext, source?: string): void {
    this.history.push({
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      source
    });

    // Maintain max history size
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(-this.maxHistorySize);
    }
  }

  /**
   * Export history as JSON for debugging
   */
  exportHistory(minLevel: LogLevel = 'debug'): string {
    const levels = ['debug', 'info', 'warn', 'error'];
    const minIndex = levels.indexOf(minLevel);
    
    const filtered = this.history.filter(entry => 
      levels.indexOf(entry.level) >= minIndex
    );

    return JSON.stringify(filtered, null, 2);
  }
}

// Export singleton instance
export const logger = new Logger();

// Also export convenience functions for common cases
export const log = {
  debug: (msg: string, ctx?: LogContext) => logger.debug(msg, ctx),
  info: (msg: string, ctx?: LogContext) => logger.info(msg, ctx),
  warn: (msg: string, ctx?: LogContext) => logger.warn(msg, ctx),
  error: (msg: string, err?: Error | LogContext | unknown, ctx?: LogContext) => logger.error(msg, err, ctx),
  getHistory: (level?: LogLevel) => logger.getHistory(level),
  clearHistory: () => logger.clearHistory(),
  exportHistory: (minLevel?: LogLevel) => logger.exportHistory(minLevel)
};
