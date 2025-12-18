import crypto from 'crypto';

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
  }

  static createFromJuntaCastillaLeon(rawData) {
    return new Ayuda({
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
    });
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