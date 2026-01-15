import { JuntaCastillaLeonScraper } from '../scrapers/JuntaCastillaLeonScraper.js';
import { JuntaCastillaLeonParser } from '../parsers/JuntaCastillaLeonParser.js';
import { HttpClient } from '../utils/httpClient.js';
import { SOURCES } from '../config/sources.js';
import { StorageService } from './StorageService.js';
import { ProceduresRepo } from './proceduresRepo.js';
import { testSupabaseConnection } from '../infra/supabaseClient.js';
import chalk from 'chalk';

export class ScrapingService {
  constructor(storageService, options = {}) {
    this.storageService = storageService;
    this.httpClient = new HttpClient();
    this.scrapers = {
      'junta-cyl': new JuntaCastillaLeonScraper(this.httpClient)
    };
    this.parsers = {
      'junta-cyl': new JuntaCastillaLeonParser(SOURCES['junta-cyl'])
    };
    
    // Check if JSON backup is enabled
    this.saveLocalJson = options.saveLocalJson === true;
    
    // Enriquecimiento con IA
    this.useAi = options.useAi === true || process.env.USE_AI_ENRICHMENT === 'true';
    this.aiConfig = {
      enabled: this.useAi,
      provider: process.env.AI_PROVIDER || 'openai',
      apiKey: process.env.AI_API_KEY,
      model: process.env.AI_MODEL || 'gpt-3.5-turbo',
      maxTokens: parseInt(process.env.AI_MAX_TOKENS) || 500,
      temperature: parseFloat(process.env.AI_TEMPERATURE) || 0.1
    };
    
    // Initialize Supabase repository for primary storage (only if env vars are set)
    this.useSupabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (this.useSupabase) {
      // Load Supabase modules dynamically only when needed
      this.supabaseRepo = new ProceduresRepo();
      testSupabaseConnection();
    } else {
      console.log(chalk.yellow('⚠️  Supabase credentials not found, using local JSON storage only'));
    }
    
    if (this.useAi) {
      console.log(chalk.blue('🤖 AI enrichment enabled'));
    } else {
      console.log(chalk.blue('📝 Using deterministic tagging'));
    }
  }

  async runScraping(options = {}) {
    const startTime = Date.now();
    const { source = 'junta-cyl', filters = {}, updateStorage = true } = options;
    
    console.log(chalk.blue(`🚀 Starting scraping for source: ${source}`));
    
    try {
      // Step 1: Scrape HTML data
      const htmlPages = await this.scrapers[source].scrape();
      console.log(chalk.green(`✅ Scraped ${htmlPages.length} pages`));
      
      // Step 2: Parse HTML to extract ayudas
      const allAyudas = [];
      const enrichmentOptions = {
        useAi: this.useAi,
        aiConfig: this.aiConfig
      };
      
      for (const html of htmlPages) {
        const ayudas = await this.parsers[source].parse(html, enrichmentOptions);
        allAyudas.push(...ayudas);
      }
      
      console.log(chalk.green(`✅ Parsed ${allAyudas.length} ayudas`));
      
      // Step 3: Apply filters
      const filteredAyudas = this.applyFilters(allAyudas, filters);
      console.log(chalk.blue(`🔍 Filtered to ${filteredAyudas.length} ayudas`));
      
      // Step 4: Update storage if requested
      let storageResult = null;
      if (updateStorage) {
        if (this.useSupabase) {
          // Primary storage: Supabase
          console.log(chalk.blue('📤 Sending data to Supabase...'));
          const supabaseResult = await this.supabaseRepo.upsertProcedures(filteredAyudas);
          console.log(chalk.green(`✅ Supabase updated: ${supabaseResult.inserted} inserted, ${supabaseResult.updated} updated, ${supabaseResult.failed} failed`));
          
          storageResult = {
            metadata: {
              nuevas: supabaseResult.inserted,
              actualizadas: supabaseResult.updated,
              failed: supabaseResult.failed
            }
          };
        } else {
          // Fallback to JSON when Supabase not configured
          console.log(chalk.yellow('💾 Using local JSON storage (Supabase not configured)'));
        }

        // Always create JSON backup if requested
        if (this.saveLocalJson || !this.useSupabase) {
          console.log(chalk.blue('💾 Saving to local JSON...'));
          try {
            const jsonResult = await this.storageService.addAyudas(filteredAyudas);
            console.log(chalk.green(`✅ Local JSON saved: ${jsonResult.metadata.nuevas} new, ${jsonResult.metadata.actualizadas} updated`));
            
            // Use JSON result if Supabase wasn't used
            if (!this.useSupabase) {
              storageResult = jsonResult;
            }
          } catch (error) {
            console.error(chalk.red(`❌ Local JSON save failed: ${error.message}`));
            // If JSON save fails when explicitly requested, exit with error
            if (this.saveLocalJson) {
              process.exit(1);
            }
          }
        }
      }
      
      const duration = Date.now() - startTime;
      
      return {
        success: true,
        data: {
          ayudas: filteredAyudas,
          total: filteredAyudas.length,
          nuevas: storageResult?.metadata.nuevas || 0,
          actualizadas: storageResult?.metadata.actualizadas || 0,
          failed: storageResult?.metadata.failed || 0
        },
        metadata: {
          source,
          timestamp: new Date().toISOString(),
          duration,
          processed: htmlPages.length,
          errors: []
        }
      };
      
    } catch (error) {
      console.error(chalk.red(`❌ Scraping failed: ${error.message}`));
      return {
        success: false,
        error: error.message,
        metadata: {
          source,
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime,
          errors: [error.message]
        }
      };
    }
  }

  applyFilters(ayudas, filters) {
    let results = ayudas;
    
    if (filters.tipo) {
      results = results.filter(a => a.tipo === filters.tipo);
    }
    
    if (filters.ambito) {
      results = results.filter(a => a.ambito === filters.ambito);
    }
    
    if (filters.estado) {
      results = results.filter(a => a.estado === filters.estado);
    }
    
    if (filters.fechaDesde) {
      const desde = new Date(filters.fechaDesde);
      results = results.filter(a => new Date(a.fechaPublicacion) >= desde);
    }
    
    if (filters.fechaHasta) {
      const hasta = new Date(filters.fechaHasta);
      results = results.filter(a => new Date(a.fechaPublicacion) <= hasta);
    }
    
    if (filters.palabrasClave && filters.palabrasClave.length > 0) {
      results = results.filter(a => 
        filters.palabrasClave.some(keyword => 
          a.titulo.toLowerCase().includes(keyword.toLowerCase()) ||
          a.descripcion.toLowerCase().includes(keyword.toLowerCase())
        )
      );
    }
    
    return results;
  }
}