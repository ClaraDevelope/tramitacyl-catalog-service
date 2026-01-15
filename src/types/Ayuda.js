import crypto from 'crypto';
import { computeTags } from '../tags/taggingRules.js';
import { computeAidKeywords } from '../tags/keywordExtractor.js';
import { aiSuggest } from '../tags/aiEnrich.js';

export class Ayuda {
  constructor(data) {
    this.id = data.id;
    this.titulo = data.titulo;
    this.organismo = data.organismo;
    this.tipo = data.tipo;
    this.ambito = data.ambito;
    this.fechaPublicacion = data.fechaPublicacion;
    this.fechaLimite = data.fechaLimite;
    this.descripcion = data.descripcion;
    this.url = data.url;
    this.requisitos = data.requisitos || [];
    this.importe = data.importe || { min: null, max: null, moneda: 'EUR' };
    this.estado = data.estado;
    this.fechaScraping = new Date().toISOString();
    
    // Nuevos campos de enriquecimiento
    this.tags = data.tags || [];
    this.keywords = data.keywords || [];
  }

  static async createFromJuntaCastillaLeon(rawData, enrichmentOptions = {}) {
    const {
      useAi = false,
      aiConfig = null
    } = enrichmentOptions;

    // Crear objeto base de ayuda
    const baseData = {
      id: this.generateId(rawData.titulo, rawData.url),
      titulo: rawData.titulo,
      organismo: 'Junta de Castilla y León',
      tipo: this.inferTipo(rawData.titulo),
      ambito: this.inferAmbito(rawData.titulo),
      fechaPublicacion: rawData.fechaInicio,
      fechaLimite: rawData.fechaFin,
      descripcion: rawData.titulo,
      url: rawData.url,
      estado: this.inferEstado(rawData.fechaFin)
    };

    // Enriquecer con tags y keywords
    const enrichedData = await this.enrichWithData(baseData, rawData, useAi, aiConfig);

    return new Ayuda(enrichedData);
  }

  /**
   * Enriquece el objeto con tags y keywords
   */
  static async enrichWithData(baseData, rawData, useAi = false, aiConfig = null) {
    // Input para tagging
    const tagInput = {
      title: baseData.titulo,
      summary: baseData.descripcion,
      scope: baseData.ambito,
      tipo: baseData.tipo,
      ambito: baseData.ambito,
      raw: rawData
    };

    let tags = [];
    let keywords = [];

    try {
      if (useAi && aiConfig) {
        // Usar IA si está habilitada
        const aiSuggestions = await aiSuggest(tagInput, aiConfig);
        tags = aiSuggestions.tags || [];
        keywords = aiSuggestions.keywords || [];
      } else {
        // Usar métodos deterministas
        tags = computeTags(tagInput);
        keywords = computeAidKeywords(
          baseData.titulo,
          baseData.descripcion,
          baseData.ambito
        );
      }
    } catch (error) {
      console.warn('⚠️ Error en enriquecimiento, usando fallback:', error.message);
      // Fallback a métodos deterministas
      tags = computeTags(tagInput);
      keywords = computeAidKeywords(
        baseData.titulo,
        baseData.descripcion,
        baseData.ambito
      );
    }

    return {
      ...baseData,
      tags,
      keywords
    };
  }

  static generateId(titulo, url) {
    const hash = crypto.createHash('md5');
    hash.update(`${titulo}-${url}`);
    return `junta-cyl-${hash.digest('hex').substring(0, 8)}`;
  }

  static inferEstado(fechaFin) {
    if (!fechaFin) return 'desconocido';
    const hoy = new Date();
    const limite = new Date(fechaFin);
    return limite >= hoy ? 'abierta' : 'cerrada';
  }

  static inferTipo(titulo) {
    const tituloLower = titulo.toLowerCase();
    if (tituloLower.includes('subvenció')) return 'subvencion';
    if (tituloLower.includes('beca')) return 'beca';
    if (tituloLower.includes('ayuda')) return 'ayuda';
    if (tituloLower.includes('contrato')) return 'contrato';
    return 'otro';
  }

  static inferAmbito(titulo) {
    const tituloLower = titulo.toLowerCase();
    if (tituloLower.includes('cultura')) return 'cultura';
    if (tituloLower.includes('educació')) return 'educacion';
    if (tituloLower.includes('empleo')) return 'empleo';
    if (tituloLower.includes('agrícola') || tituloLower.includes('ganader')) return 'agricultura';
    if (tituloLower.includes('salud')) return 'salud';
    if (tituloLower.includes('vivienda')) return 'vivienda';
    return 'general';
  }
}