/**
 * Extractor de keywords para ayudas públicas
 * Normaliza texto y extrae términos relevantes para búsqueda
 */

/**
 * @typedef {Object} KeywordOptions
 * @property {number} [maxKeywords]
 * @property {number} [minLength]
 * @property {boolean} [includeNumbers]
 * @property {string[]} [customStopwords]
 */

/**
 * Stopwords básicas en español
 */
const DEFAULT_STOPWORDS = new Set([
  // Artículos, preposiciones, conjunciones
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'lo',
  'de', 'del', 'a', 'ante', 'bajo', 'con', 'contra', 'desde', 'durante',
  'en', 'entre', 'hacia', 'hasta', 'mediante', 'para', 'por', 'según',
  'sin', 'sobre', 'tras', 'versus', 'y', 'o', 'pero', 'mas', 'ni',
  'aunque', 'sino', 'que', 'quien', 'cuyo', 'cuya',
  
  // Pronombres y demostrativos
  'yo', 'tú', 'él', 'ella', 'nosotros', 'vosotros', 'ellos', 'ellas',
  'me', 'te', 'se', 'nos', 'os', 'mi', 'tu', 'su', 'nuestro', 'vuestro',
  'este', 'ese', 'aquel', 'esta', 'esa', 'aquella', 'esto', 'eso', 'aquello',
  
  // Verbos comunes y auxiliares
  'ser', 'estar', 'haber', 'tener', 'hacer', 'poder', 'decir', 'ir', 'ver',
  'dar', 'saber', 'querer', 'llegar', 'pasar', 'deber', 'creer', 'volver',
  'parecer', 'quedar', 'sentir', 'tratar', 'dejar', 'existir', 'seguir',
  'encontrar', 'llamar', 'saber', 'venir', 'pensar', 'vivir', 'hablar',
  'llegar', 'pensar', 'creer', 'querer', 'deber', 'poder', 'hacer',
  
  // Adverbios y conectores comunes
  'muy', 'más', 'menos', 'tan', 'tanto', 'tanto como', 'como', 'así',
  'también', 'tampoco', 'sí', 'no', 'jamás', 'nunca', 'siempre', 'a veces',
  'aquí', 'allí', 'ahí', 'donde', 'cuando', 'como', 'por qué', 'para qué',
  'además', 'incluso', 'incluso si', 'por eso', 'por lo tanto', 'sin embargo',
  
  // Palabras muy comunes en ayudas/subvenciones (conservar algunas para búsqueda)
  'subvención', 'beca', 'convocatoria', 'solicitud', 'solicitar',
  'presentar', 'plazo', 'fecha', 'año', 'meses', 'días', 'hasta', 'desde',
  'público', 'pública', 'gobierno', 'administración', 'junta', 'castilla',
  'león', 'trámite', 'procedimiento', 'documentación', 'requisito', 'cumplir',
  
  // Números y ordinales comunes
  'primero', 'segundo', 'tercero', 'cuarto', 'quinto', 'sexto', 'séptimo',
  'octavo', 'noveno', 'décimo', 'uno', 'dos', 'tres', 'cuatro', 'cinco',
  
  // Otros términos genéricos
  'nuevo', 'nueva', 'nuevos', 'nuevas', 'general', 'generales', 'distinto',
  'diferente', 'varios', 'varias', 'cada', 'todo', 'todos', 'todas', 'otro',
  'otra', 'otros', 'otras', 'mismo', 'misma', 'mismos', 'mismas', 'propio',
  'propia', 'propios', 'propias', 'solo', 'sola', 'sólo', 'único', 'única'
]);

/**
 * Normaliza texto para procesamiento
 */
export function normalizeText(text) {
  if (!text) return '';
  
  return text
    // Convertir a minúsculas
    .toLowerCase()
    // Eliminar acentos y caracteres especiales
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Eliminar caracteres no alfanuméricos excepto espacios
    .replace(/[^a-z0-9\s]/g, ' ')
    // Eliminar espacios múltiples
    .replace(/\s+/g, ' ')
    // Eliminar espacios al inicio y final
    .trim();
}

/**
 * Divide texto en tokens
 */
export function tokenizeText(text) {
  const normalized = normalizeText(text);
  return normalized.split(/\s+/).filter(token => token.length > 0);
}

/**
 * Filtra stopwords de un array de tokens
 */
export function filterStopwords(tokens, additionalStopwords = new Set()) {
  const allStopwords = new Set([...DEFAULT_STOPWORDS, ...additionalStopwords]);
  return tokens.filter(token => !allStopwords.has(token));
}

/**
 * Filtra tokens por longitud y contenido
 */
export function filterTokens(tokens, options) {
  const minLength = options.minLength || 3;
  const includeNumbers = options.includeNumbers || false;
  
  return tokens.filter(token => {
    // Longitud mínima
    if (token.length < minLength) return false;
    
    // Excluir números puros a menos que se solicite incluirlos
    if (!includeNumbers && /^\d+$/.test(token)) return false;
    
    // Excluir tokens que son solo caracteres especiales o dígitos sueltos
    if (/^[^\w]+$/.test(token)) return false;
    
    return true;
  });
}

/**
 * Extrae términos compuestos relevantes
 */
export function extractCompoundTerms(tokens) {
  const compoundTerms = [];
  
  // Términos compuestos de 2 palabras comunes en ayudas
  const compoundPatterns = [
    /\b(familia\s+numerosa|familia\s+monoparental|discapacidad\s+reconocida|dependencia\s+reconocida)\b/g,
    /\b(ingreso\s+mínimo|renta\s+mínima|salario\s+mínimo|IPREM|SMI)\b/g,
    /\b(castilla\s+león|junta\s+castilla|castilla\s+leon)\b/g,
    /\b(bono\s+social|ayuda\s+alquiler|subvención)\b/g,
    /\b(crianza\s+terneros|modernización\s+explotaciones|mejora\s+instalaciones)\b/g,
    /\b(cambio\s+climático|desarrollo\s+sostenible|economía\s+circular)\b/g,
    /\b(innovación|investigación|desarrollo)\b/g,
    /\b(formación\s+profesional|competencias\s+digitales|transformación\s+digital)\b/g
  ];
  
  const originalText = tokens.join(' ');
  
  for (const pattern of compoundPatterns) {
    const matches = originalText.match(pattern);
    if (matches) {
      compoundTerms.push(...matches);
    }
  }
  
  return compoundTerms;
}

/**
 * Calcula frecuencia de tokens y extrae los más relevantes
 */
export function calculateTokenFrequency(tokens) {
  const frequency = new Map();
  
  for (const token of tokens) {
    frequency.set(token, (frequency.get(token) || 0) + 1);
  }
  
  return frequency;
}

/**
 * Ordena keywords por relevancia (frecuencia y longitud)
 */
export function sortKeywordsByRelevance(keywords) {
  return Array.from(keywords.entries())
    .sort((a, b) => {
      // Primero por frecuencia (más frecuente primero)
      if (b[1] !== a[1]) {
        return b[1] - a[1];
      }
      // Si misma frecuencia, priorizar palabras más largas (específicas)
      return b[0].length - a[0].length;
    })
    .map(([keyword]) => keyword);
}

/**
 * Extrae keywords de texto con opciones configurables
 */
export function computeKeywords(text, options = {}) {
  const {
    maxKeywords = 30,
    minLength = 3,
    includeNumbers = false,
    customStopwords = []
  } = options;
  
  // 1. Tokenizar texto
  let tokens = tokenizeText(text);
  
  // 2. Extraer términos compuestos primero
  const compoundTerms = extractCompoundTerms(tokens);
  const normalizedCompounds = compoundTerms.map(term => normalizeText(term));
  
  // 3. Filtrar stopwords
  const customStopwordsSet = new Set(customStopwords);
  tokens = filterStopwords(tokens, customStopwordsSet);
  
  // 4. Filtrar por longitud y contenido
  tokens = filterTokens(tokens, { minLength, includeNumbers });
  
  // 5. Calcular frecuencia
  const frequency = calculateTokenFrequency(tokens);
  
  // 6. Ordenar por relevancia
  const sortedKeywords = sortKeywordsByRelevance(frequency);
  
  // 7. Añadir términos compuestos normalizados al principio (son más específicos)
  const finalKeywords = [
    ...normalizedCompounds.filter(term => term.split(' ').length >= 2),
    ...sortedKeywords
  ];
  
  // 8. Eliminar duplicados y limitar cantidad
  const uniqueKeywords = Array.from(new Set(finalKeywords));
  
  return uniqueKeywords.slice(0, maxKeywords);
}

/**
 * Extrae keywords de múltiples campos de texto
 */
export function computeKeywordsFromFields(fields, options = {}) {
  // Combinar todos los campos de texto
  const combinedText = Object.values(fields)
    .filter(Boolean)
    .join(' ');
  
  return computeKeywords(combinedText, options);
}

/**
 * Extrae keywords específicas para ayudas y subvenciones
 */
export function computeAidKeywords(title, description, scope, options) {
  return computeKeywordsFromFields(
    { title, description, scope },
    options
  );
}

// Exportación por defecto de la función principal
export default computeKeywords;