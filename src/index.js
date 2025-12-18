#!/usr/bin/env node

import 'dotenv/config';

import { Command } from 'commander';
import chalk from 'chalk';
import { ScrapingService } from './services/ScrapingService.js';
import { StorageService } from './services/StorageService.js';

const program = new Command();

// Main function that can be imported and used programmatically
export async function runScraping(options = {}) {
  const {
    source = 'junta-cyl',
    filters = {},
    output = 'json',
    filePath = './data/ayudas.json',
    updateStorage = true,
    maxRetries = 3,
    timeout = 10000,
    saveLocalJson = process.env.SAVE_LOCAL_JSON === 'true'
  } = options;

  // Initialize services
  const storageService = new StorageService(filePath);
  const scrapingService = new ScrapingService(storageService, { saveLocalJson });

  console.log(chalk.blue('🔧 Initializing scraping service...'));
  
  // Run scraping
  const result = await scrapingService.runScraping({
    source,
    filters,
    updateStorage
  });

  // Handle output
  if (output === 'console') {
    printResults(result);
  } else if (output === 'file' && updateStorage) {
    console.log(chalk.green(`💾 Results saved to ${filePath}`));
  }

  return result;
}

// CLI setup
program
  .name('scraper-ayudas')
  .description('Scraper de ayudas y convocatorias públicas')
  .version('1.0.0');

program
  .command('scrape')
  .description('Ejecuta el scraping de ayudas')
  .option('-s, --source <source>', 'Fuente a scrapear (junta-cyl)', 'junta-cyl')
  .option('-t, --tipo <tipo>', 'Filtrar por tipo (subvencion, beca, ayuda)')
  .option('-a, --ambito <ambito>', 'Filtrar por ámbito (cultura, educacion, empleo)')
  .option('-e, --estado <estado>', 'Filtrar por estado (abierta, cerrada)')
  .option('--fecha-desde <fecha>', 'Fecha desde (DD/MM/YYYY)')
  .option('--fecha-hasta <fecha>', 'Fecha hasta (DD/MM/YYYY)')
  .option('--output <output>', 'Formato de salida (json, console)', 'json')
  .option('--file-path <path>', 'Ruta del archivo JSON', './data/ayudas.json')
  .option('--no-storage', 'No actualizar almacenamiento')
  .option('--max-retries <number>', 'Máximo de reintentos', '3')
  .option('--timeout <number>', 'Timeout en milisegundos', '10000')
  .action(async (options) => {
    try {
      const filters = {
        tipo: options.tipo,
        ambito: options.ambito,
        estado: options.estado,
        fechaDesde: options.fechaDesde,
        fechaHasta: options.fechaHasta
      };

      const result = await runScraping({
        source: options.source,
        filters,
        output: options.output,
        filePath: options.filePath,
        updateStorage: options.storage,
        maxRetries: parseInt(options.maxRetries),
        timeout: parseInt(options.timeout)
      });

      if (!result.success) {
        console.error(chalk.red('❌ Scraping failed'));
        process.exit(1);
      }

    } catch (error) {
      console.error(chalk.red(`❌ Error: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('stats')
  .description('Muestra estadísticas de las ayudas almacenadas')
  .option('--file-path <path>', 'Ruta del archivo JSON', './data/ayudas.json')
  .action(async (options) => {
    try {
      const storageService = new StorageService(options.filePath);
      const stats = await storageService.getStats();
      
      console.log(chalk.blue('📊 Estadísticas de Ayudas:'));
      console.log(chalk.white(`Total: ${stats.total}`));
      
      console.log(chalk.yellow('\nPor Organismo:'));
      Object.entries(stats.byOrganismo).forEach(([org, count]) => {
        console.log(chalk.white(`  ${org}: ${count}`));
      });
      
      console.log(chalk.yellow('\nPor Tipo:'));
      Object.entries(stats.byTipo).forEach(([tipo, count]) => {
        console.log(chalk.white(`  ${tipo}: ${count}`));
      });
      
      console.log(chalk.yellow('\nPor Estado:'));
      Object.entries(stats.byEstado).forEach(([estado, count]) => {
        console.log(chalk.white(`  ${estado}: ${count}`));
      });
      
    } catch (error) {
      console.error(chalk.red(`❌ Error: ${error.message}`));
      process.exit(1);
    }
  });

// Helper function to print results
function printResults(result) {
  if (!result.success) {
    console.error(chalk.red('❌ Error:', result.error));
    return;
  }

console.log(chalk.green('✅ Scraping completed successfully!'));
      console.log(chalk.white(`📊 Total ayudas: ${result.data.total}`));
      console.log(chalk.blue(`🆕 Nuevas: ${result.data.nuevas}`));
      console.log(chalk.yellow(`🔄 Actualizadas: ${result.data.actualizadas}`));
      if (result.data.failed > 0) {
        console.log(chalk.red(`❌ Failed: ${result.data.failed}`));
      }
      console.log(chalk.gray(`⏱️  Duration: ${result.metadata.duration}ms`));
  
  console.log(chalk.blue('\n📋 Ayudas encontradas:'));
  result.data.ayudas.forEach((ayuda, index) => {
    console.log(chalk.white(`${index + 1}. ${ayuda.titulo}`));
    console.log(chalk.gray(`   📅 ${ayuda.fechaPublicacion} - ${ayuda.fechaLimite || 'Sin fecha límite'}`));
    console.log(chalk.gray(`   🏢 ${ayuda.organismo} | 📁 ${ayuda.tipo} | 🎯 ${ayuda.ambito} | ✅ ${ayuda.estado}`));
    console.log(chalk.gray(`   🔗 ${ayuda.url}`));
    console.log('');
  });
}


program.parse(process.argv);

export default runScraping;