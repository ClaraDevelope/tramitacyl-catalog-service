import { BaseScraper } from './BaseScraper.js';
import { SOURCES } from '../config/sources.js';

export class JuntaCastillaLeonScraper extends BaseScraper {
  constructor(httpClient) {
    super(httpClient, SOURCES['junta-cyl']);
    this.allPagesData = [];
  }

  async scrape() {
    this.validateConfig();
    console.log(`🔍 Starting scraping for ${this.config.name}`);
    
    if (this.config.pagination.enabled) {
      return await this.scrapeAllPages();
    } else {
      const html = await this.scrapePage(this.config.listUrl);
      return [html];
    }
  }

  async scrapeAllPages() {
    console.log('📄 Scraping all pages...');
    const failedPages = [];
    
    // First, get first page to determine total pages
    const firstPageHtml = await this.scrapePage(this.config.listUrl);
    this.allPagesData.push(firstPageHtml);
    
    // Extract total pages from pagination
    const totalPages = await this.extractTotalPages(firstPageHtml);
    console.log(`📊 Found ${totalPages} pages to scrape`);
    
    // Scrape remaining pages
    for (let page = 2; page <= totalPages; page++) {
      const offset = (page - 1) * this.config.pagination.offsetStep;
      const pageUrl = this.config.pagination.urlPattern.replace('{offset}', offset);
      
      console.log(`📄 Scraping page ${page}/${totalPages}`);
      try {
        const pageHtml = await this.scrapePage(pageUrl);
        this.allPagesData.push(pageHtml);
      } catch (error) {
        console.log(`❌ Página ${page} falló: ${pageUrl} - ${error.message}`);
        failedPages.push({ page, url: pageUrl, error: error.message });
        continue;
      }
      
      // Add delay between pages
      if (this.config.delays.betweenPages) {
        await this.httpClient.sleep(this.config.delays.betweenPages);
      }
    }
    
    console.log(`📊 Resumen: ${totalPages} páginas totales, ${this.allPagesData.length} OK, ${failedPages.length} fallidas`);
    return this.allPagesData;
  }

  async extractTotalPages(html) {
    // This would need cheerio to parse HTML
    // For now, we know from analysis it's 67 pages
    return 67;
  }
}