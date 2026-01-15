import axios from 'axios';
import chalk from 'chalk';

export class SupabaseRestClient {
  constructor() {
    this.supabaseUrl = process.env.SUPABASE_URL;
    this.serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!this.supabaseUrl) {
      console.error(chalk.red('❌ SUPABASE_URL environment variable is required'));
      process.exit(1);
    }

    if (!this.serviceKey) {
      console.error(chalk.red('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required'));
      process.exit(1);
    }

    // Initialize axios instance with Supabase headers
    this.client = axios.create({
      baseURL: `${this.supabaseUrl}/rest/v1`,
      headers: {
        'apikey': this.serviceKey,
        'Authorization': `Bearer ${this.serviceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    });

    console.log(chalk.green('✅ Supabase REST client initialized'));
  }

  async testConnection() {
    try {
      const response = await this.client.get('/catalog_procedures', {
        params: { limit: 1, select: 'count' }
      });
      
      console.log(chalk.green('✅ Supabase connection verified'));
      return true;
    } catch (error) {
      console.error(chalk.red(`❌ Supabase connection test failed: ${error.response?.data?.message || error.message}`));
      process.exit(1);
    }
  }

  async upsertProcedures(items) {
    const batchSize = 100;
    const results = {
      total: items.length,
      inserted: 0,
      updated: 0,
      failed: 0,
      batches: []
    };

    console.log(chalk.blue(`🔄 Processing ${items.length} items in batches of ${batchSize}`));

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(items.length / batchSize);

      console.log(chalk.blue(`📦 Processing batch ${batchNum}/${totalBatches} (${batch.length} items)`));

      try {
        const batchResult = await this.processBatch(batch);
        results.inserted += batchResult.inserted;
        results.updated += batchResult.updated;
        results.failed += batchResult.failed;
        results.batches.push({
          batch: batchNum,
          ...batchResult
        });

        console.log(chalk.green(`✅ Batch ${batchNum} complete: +${batchResult.inserted} ~${batchResult.updated} ❌${batchResult.failed}`));
      } catch (error) {
        results.failed += batch.length;
        console.error(chalk.red(`❌ Batch ${batchNum} failed: ${error.response?.data?.message || error.message}`));
        throw error;
      }
    }

    return results;
  }

  async processBatch(batch) {
    const procedures = batch.map(item => this.mapAyudaToProcedure(item));
    
    // Deduplicate within batch to avoid sending duplicate (source, source_id) pairs
    const uniqueItems = [];
    const seenKeys = new Set();
    
    for (const item of procedures) {
      const key = `${item.source}|${item.source_id}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        uniqueItems.push(item);
      }
    }
    
    try {
      const response = await this.client.post('/catalog_procedures?on_conflict=source,source_id', uniqueItems, {
        headers: {
          'Prefer': 'return=representation,resolution=merge-duplicates'
        }
      });

      // All successful items are returned in the response
      return {
        inserted: response.data.length,
        updated: 0, // With merge-duplicates, we can't distinguish inserts vs updates
        failed: 0,
        items: response.data
      };
    } catch (error) {
      if (error.response) {
        throw new Error(`Supabase API error: ${error.response.data?.message || JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }

  mapAyudaToProcedure(ayuda) {
    const deadlineResult = this.parseDeadlineDate(ayuda.fechaLimite);
    const publishedResult = this.parsePublishedDate(ayuda.fechaPublicacion);

    return {
      source: 'junta_cyl',
      source_id: ayuda.id, // Keep original ayuda.id unchanged
      title: ayuda.titulo,
      summary: ayuda.descripcion || ayuda.titulo,
      url: ayuda.url,
      scope: ayuda.tipo,
      authority: ayuda.organismo,
      territory: ayuda.source === 'junta-cyl' ? 'Castilla y León' : null,
      deadline_text: deadlineResult.text,
      deadline_date: deadlineResult.date,
      published_at: publishedResult.date,
      // Nuevos campos de enriquecimiento
      tags: ayuda.tags || [],
      keywords: ayuda.keywords || [],
      raw: ayuda
    };
  }

  parseDeadlineDate(fechaLimite) {
    if (!fechaLimite) {
      return { date: null, text: null };
    }

    // If it's already in ISO format, return as is
    if (fechaLimite.includes('T') && !isNaN(new Date(fechaLimite))) {
      return { 
        date: fechaLimite, 
        text: new Date(fechaLimite).toLocaleDateString('es-ES')
      };
    }

    // Try to parse DD/MM/YYYY format
    const dateMatch = fechaLimite.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (dateMatch) {
      const [, day, month, year] = dateMatch;
      const date = new Date(`${year}-${month}-${day}`);
      
      if (!isNaN(date)) {
        return { 
          date: date.toISOString(), 
          text: fechaLimite 
        };
      }
    }

    // If we can't parse, return null date with original text
    return { date: null, text: fechaLimite };
  }

  parsePublishedDate(fechaPublicacion) {
    if (!fechaPublicacion) {
      return { date: null };
    }

    // If it's already in ISO format and valid, return as is
    if (fechaPublicacion.includes('T') && !isNaN(new Date(fechaPublicacion))) {
      return { date: fechaPublicacion };
    }

    // Try to parse various formats
    const dateMatch = fechaPublicacion.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (dateMatch) {
      const [, day, month, year] = dateMatch;
      const date = new Date(`${year}-${month}-${day}`);
      
      if (!isNaN(date)) {
        return { date: date.toISOString() };
      }
    }

    return { date: null };
  }
}

export async function testSupabaseConnection() {
  const client = new SupabaseRestClient();
  return await client.testConnection();
}