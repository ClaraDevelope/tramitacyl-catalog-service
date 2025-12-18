import { BaseParser } from './BaseParser.js';
import { Ayuda } from '../types/Ayuda.js';
import * as cheerio from 'cheerio';

export class JuntaCastillaLeonParser extends BaseParser {
  constructor(config) {
    super(config);
  }

  parse(html) {
    const $ = cheerio.load(html);
    const ayudas = [];
    
    $(this.config.selectors.listItems).each((index, element) => {
      const ayudaData = this.extractAyudaData($, element);
      if (ayudaData) {
        const ayuda = Ayuda.createFromJuntaCastillaLeon(ayudaData);
        ayudas.push(ayuda);
      }
    });
    
    return ayudas;
  }

  extractAyudaData($, element) {
    const $element = $(element);
    
    // Extract title and URL
    const title = this.cleanText(this.extractText($element, this.config.selectors.title));
    const url = this.extractAttribute($element.find(this.config.selectors.link), 'href');
    
    if (!title || !url) {
      console.warn('⚠️  Missing title or URL for item');
      return null;
    }
    
    // Make URL absolute
    const absoluteUrl = url.startsWith('http') ? url : `${this.config.baseUrl}${url}`;
    
    // Extract dates
    const datesElement = $element.find(this.config.selectors.dates);
    const startDate = this.extractStartDate($, datesElement);
    const endDate = this.extractEndDate($, datesElement);
    
    return {
      titulo: title,
      url: absoluteUrl,
      fechaInicio: startDate,
      fechaFin: endDate
    };
  }

  extractStartDate($, datesElement) {
    const startDateText = this.extractText(datesElement, 'strong:contains("Fecha de inicio:")');
    if (startDateText) {
      // Extract date from "Fecha de inicio: DD/MM/YYYY"
      const match = startDateText.match(/(\d{2}\/\d{2}\/\d{4})/);
      return match ? this.parseDate(match[1]) : null;
    }
    return null;
  }

  extractEndDate($, datesElement) {
    const endDateText = this.extractText(datesElement, 'strong:contains("Fecha de fin:")');
    if (endDateText) {
      // Extract date from "Fecha de fin: DD/MM/YYYY"
      const match = endDateText.match(/(\d{2}\/\d{2}\/\d{4})/);
      return match ? this.parseDate(match[1]) : null;
    }
    return null;
  }
}