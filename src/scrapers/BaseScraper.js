export class BaseScraper {
  constructor(httpClient, config) {
    this.httpClient = httpClient;
    this.config = config;
  }

  async scrape() {
    throw new Error('scrape() method must be implemented by subclass');
  }

  async scrapePage(url) {
    const html = await this.httpClient.getWithRetry(url);
    return html;
  }

  async scrapeAllPages() {
    throw new Error('scrapeAllPages() method must be implemented by subclass');
  }

  validateConfig() {
    if (!this.config.baseUrl || !this.config.listUrl) {
      throw new Error('Invalid scraper configuration');
    }
  }
}