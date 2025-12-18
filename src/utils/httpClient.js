import axios from 'axios';
import chalk from 'chalk';

export class HttpClient {
  constructor(options = {}) {
    this.client = axios.create({
      timeout: options.timeout || 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      ...options
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    this.client.interceptors.request.use(
      (config) => {
        console.log(chalk.blue(`📡 Request: ${config.method?.toUpperCase()} ${config.url}`));
        return config;
      },
      (error) => {
        console.error(chalk.red(`❌ Request error: ${error.message}`));
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        console.log(chalk.green(`✅ Response: ${response.status} ${response.config.url}`));
        return response;
      },
      (error) => {
        console.error(chalk.red(`❌ Response error: ${error.message}`));
        return Promise.reject(error);
      }
    );
  }

  async get(url, options = {}) {
    try {
      const response = await this.client.get(url, options);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(`HTTP ${error.response.status}: ${error.response.statusText}`);
      } else if (error.request) {
        throw new Error('No response received from server');
      } else {
        throw error;
      }
    }
  }

  async getWithRetry(url, maxRetries = 3, delay = 1000) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.get(url);
      } catch (error) {
        lastError = error;
        console.log(chalk.yellow(`⚠️  Attempt ${attempt} failed. Retrying in ${delay}ms...`));
        
        if (attempt < maxRetries) {
          await this.sleep(delay);
          delay *= 2; // Exponential backoff
        }
      }
    }
    
    throw lastError;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}