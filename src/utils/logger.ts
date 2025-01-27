import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type LogLevel = 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  details?: any;
}

class Logger {
  private static instance: Logger;
  private readonly maxLogs = 1000; // Keep last 1000 logs

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private async saveLog(entry: LogEntry) {
    try {
      const logs = await this.getLogs();
      logs.push(entry);
      
      // Keep only the last maxLogs entries
      if (logs.length > this.maxLogs) {
        logs.splice(0, logs.length - this.maxLogs);
      }
      
      await AsyncStorage.setItem('app_logs', JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to save log:', error);
    }
  }

  async getLogs(): Promise<LogEntry[]> {
    try {
      const logs = await AsyncStorage.getItem('app_logs');
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      console.error('Failed to get logs:', error);
      return [];
    }
  }

  private createLogEntry(level: LogLevel, message: string, details?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      details: details ? JSON.stringify(details) : undefined
    };
  }

  async info(message: string, details?: any) {
    const entry = this.createLogEntry('INFO', message, details);
    console.log(`[INFO] ${message}`, details || '');
    await this.saveLog(entry);
  }

  async warn(message: string, details?: any) {
    const entry = this.createLogEntry('WARNING', message, details);
    console.warn(`[WARNING] ${message}`, details || '');
    await this.saveLog(entry);
  }

  async error(message: string, error?: any) {
    const entry = this.createLogEntry('ERROR', message, {
      error: error?.message || error,
      stack: error?.stack,
      platform: Platform.OS
    });
    console.error(`[ERROR] ${message}`, error || '');
    await this.saveLog(entry);
  }

  async debug(message: string, details?: any) {
    if (__DEV__) {
      const entry = this.createLogEntry('DEBUG', message, details);
      console.debug(`[DEBUG] ${message}`, details || '');
      await this.saveLog(entry);
    }
  }

  async clearLogs() {
    try {
      await AsyncStorage.removeItem('app_logs');
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  }
}

export const logger = Logger.getInstance();