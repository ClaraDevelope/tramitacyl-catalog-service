export class BaseParser {
  constructor(config) {
    this.config = config;
  }

  parse(html) {
    throw new Error('parse() method must be implemented by subclass');
  }

  extractText(element, selector = null) {
    if (!element) return null;
    
    if (selector) {
      const found = element.find(selector);
      return found.length > 0 ? found.text().trim() : null;
    }
    
    return element.text().trim();
  }

  extractAttribute(element, attribute) {
    if (!element) return null;
    return element.attr(attribute) || null;
  }

  parseDate(dateString) {
    if (!dateString) return null;
    
    // Handle DD/MM/YYYY format
    const match = dateString.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (match) {
      const [, day, month, year] = match;
      return new Date(`${year}-${month}-${day}T00:00:00.000Z`);
    }
    
    return null;
  }

  cleanText(text) {
    if (!text) return null;
    return text.replace(/\s+/g, ' ').trim();
  }
}