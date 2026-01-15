import { isTag } from './tags.js';
import { computeKeywords } from './keywordExtractor.js';
import { computeTags } from './taggingRules.js';

/**
 * Módulo opcional de enriquecimiento con IA
 * Proporciona sugerencias de tags y keywords sin romper el determinismo
 */
class AiEnrich {
  constructor(config = {}) {
    // Comprobar si hay configuración de IA disponible
    this.config = {
      enabled: false, // Desactivado por defecto
      provider: 'openai',
      model: 'gpt-3.5-turbo',
      maxTokens: 500,
      temperature: 0.1, // Baja temperatura para más consistencia
      ...config
    };
    
    this.enabled = this.config.enabled && this.validateConfig();
    
    if (!this.enabled) {
      console.log('🤖 IA enrichment disabled - missing or invalid configuration');
    }
  }

  /**
   * Valida que la configuración de IA sea válida
   */
  validateConfig() {
    if (!this.config.enabled) return false;
    
    // Si está habilitado, verificar que tengamos API key
    if (this.config.provider === 'openai') {
      return !!(process.env.OPENAI_API_KEY || this.config.apiKey);
    }
    
    if (this.config.provider === 'anthropic') {
      return !!(process.env.ANTHROPIC_API_KEY || this.config.apiKey);
    }
    
    // Para local u otros providers, asumimos que la configuración es válida
    return true;
  }

  /**
   * Genera sugerencias usando IA si está disponible
   */
  async suggestTagsAndKeywords(input) {
    // Si IA no está habilitada, devolver fallback
    if (!this.enabled) {
      return this.generateFallbackSuggestions(input);
    }

    try {
      const suggestions = await this.callAiService(input);
      return {
        ...suggestions,
        source: 'ai'
      };
    } catch (error) {
      console.warn('🤖 AI enrichment failed, using fallback:', error.message);
      return this.generateFallbackSuggestions(input);
    }
  }

  /**
   * Llama al servicio de IA (implementación genérica)
   */
  async callAiService(input) {
    if (this.config.provider === 'openai') {
      return this.callOpenAI(input);
    }
    
    if (this.config.provider === 'anthropic') {
      return this.callAnthropic(input);
    }
    
    throw new Error(`Unsupported AI provider: ${this.config.provider}`);
  }

  /**
   * Implementación para OpenAI
   */
  async callOpenAI(input) {
    const apiKey = this.config.apiKey || process.env.OPENAI_API_KEY;
    
    const prompt = this.buildPrompt(input);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: `Eres un experto en ayudas y subvenciones públicas en España. Analiza el texto y extrae tags y keywords relevantes.

Responde ÚNICAMENTE en formato JSON con esta estructura exacta:
{
  "tags": ["tag1", "tag2", "tag3"],
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "confidence": 0.8
}

Tags válidos: employment, training, education, housing, family, care, health, disability, energy, transport, entrepreneurship, social_support, digital_inclusion, age_under_18, age_under_30, age_under_35, age_under_45, age_over_45, age_over_55, age_over_65, unemployed, jobseeker_registered, long_term_unemployed, employee, self_employed, new_self_employed, business_creation, student, low_income, income_below_iprem, income_below_smi, risk_of_exclusion, social_vulnerability, large_family, single_parent, dependent_person_care, children_under_3, children_under_12, birth_or_adoption, disability_recognized, dependency_recognized, chronic_illness, castilla_y_leon_specific, municipal_scope, provincial_scope, rural_area, depopulation_area, online_available, in_person_available, electronic_processing_preferred, appointment_required

Solo incluye tags que estén explícitamente mencionados en el texto. No infieras atributos del usuario.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    try {
      const parsed = JSON.parse(content);
      return this.validateAndCleanSuggestions(parsed);
    } catch {
      throw new Error('Invalid JSON response from AI');
    }
  }

  /**
   * Implementación para Anthropic
   */
  async callAnthropic(input) {
    const apiKey = this.config.apiKey || process.env.ANTHROPIC_API_KEY;
    
    const prompt = this.buildPrompt(input);
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.config.model || 'claude-3-haiku-20240307',
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        messages: [
          {
            role: 'user',
            content: `Eres un experto en ayudas y subvenciones públicas en España. Analiza el siguiente texto y extrae tags y keywords relevantes.

Texto: ${prompt}

Responde ÚNICAMENTE en formato JSON con esta estructura exacta:
{
  "tags": ["tag1", "tag2", "tag3"],
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "confidence": 0.8
}

Tags válidos: employment, training, education, housing, family, care, health, disability, energy, transport, entrepreneurship, social_support, digital_inclusion, age_under_18, age_under_30, age_under_35, age_under_45, age_over_45, age_over_55, age_over_65, unemployed, jobseeker_registered, long_term_unemployed, employee, self_employed, new_self_employed, business_creation, student, low_income, income_below_iprem, income_below_smi, risk_of_exclusion, social_vulnerability, large_family, single_parent, dependent_person_care, children_under_3, children_under_12, birth_or_adoption, disability_recognized, dependency_recognized, chronic_illness, castilla_y_leon_specific, municipal_scope, provincial_scope, rural_area, depopulation_area, online_available, in_person_available, electronic_processing_preferred, appointment_required

Solo incluye tags que estén explícitamente mencionados en el texto. No infieras atributos del usuario.`
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.content[0]?.text;
    
    try {
      const parsed = JSON.parse(content);
      return this.validateAndCleanSuggestions(parsed);
    } catch {
      throw new Error('Invalid JSON response from AI');
    }
  }

  /**
   * Construye el prompt para la IA
   */
  buildPrompt(input) {
    const sections = [];
    
    if (input.title) sections.push(`Título: ${input.title}`);
    if (input.description || input.summary) sections.push(`Descripción: ${input.description || input.summary}`);
    if (input.scope) sections.push(`Ámbito: ${input.scope}`);
    if (input.tipo) sections.push(`Tipo: ${input.tipo}`);
    if (input.ambito) sections.push(`Categoría: ${input.ambito}`);
    
    return sections.join('\n\n');
  }

  /**
   * Valida y limpia las sugerencias de la IA
   */
  validateAndCleanSuggestions(suggestions) {
    // Validar tags: solo mantener los que están en la lista cerrada
    let tags = [];
    if (Array.isArray(suggestions?.tags)) {
      tags = suggestions.tags.filter((tag) => isTag(tag));
    }

    // Validar keywords: normalizar y deduplicar
    let keywords = [];
    if (Array.isArray(suggestions?.keywords)) {
      keywords = computeKeywords(
        suggestions.keywords.join(' '),
        { maxKeywords: 20, minLength: 2 }
      );
    }

    return {
      tags,
      keywords,
      confidence: typeof suggestions?.confidence === 'number' ? suggestions.confidence : 0.5
    };
  }

  /**
   * Genera sugerencias sin usar IA (fallback determinista)
   */
  generateFallbackSuggestions(input) {
    // Usar los métodos deterministas existentes
    const tags = computeTags(input);
    const keywords = computeKeywordsFromFields({
      title: input.title,
      description: input.description || input.summary,
      scope: input.scope
    });

    return {
      tags,
      keywords,
      confidence: 0.9, // Alta confianza en métodos deterministas
      source: 'fallback'
    };
  }

  /**
   * Verifica si el módulo está habilitado
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * Obtiene configuración actual (sin API keys)
   */
  getConfig() {
    return {
      enabled: this.config.enabled,
      provider: this.config.provider,
      model: this.config.model,
      maxTokens: this.config.maxTokens,
      temperature: this.config.temperature
    };
  }
}

/**
 * Función helper para extraer keywords de múltiples campos
 */
function computeKeywordsFromFields(fields) {
  const text = Object.values(fields)
    .filter(Boolean)
    .join(' ');
  
  return computeKeywords(text, { maxKeywords: 20 });
}

/**
 * Función principal para enriquecimiento con IA
 */
export async function aiSuggest(input, config) {
  const aiEnrich = new AiEnrich(config);
  return await aiEnrich.suggestTagsAndKeywords(input);
}

/**
 * Crea una instancia configurada de AiEnrich
 */
export function createAiEnrich(config) {
  return new AiEnrich(config);
}

// Exportar la clase explícitamente
export { AiEnrich };

// Exportación por defecto
export default AiEnrich;