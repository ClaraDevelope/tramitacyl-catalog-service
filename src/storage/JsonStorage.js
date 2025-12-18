import fs from 'fs/promises';
import path from 'path';

export class JsonStorage {
  constructor(filePath = './data/ayudas.json') {
    this.filePath = path.resolve(filePath);
    this.ensureDataDirectory();
  }

  async ensureDataDirectory() {
    const dir = path.dirname(this.filePath);
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  async load() {
    try {
      const data = await fs.readFile(this.filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return { ayudas: [], metadata: { lastUpdated: null, total: 0 } };
      }
      throw error;
    }
  }

  async save(data) {
    const dataToSave = {
      ...data,
      metadata: {
        ...data.metadata,
        lastUpdated: new Date().toISOString(),
        total: data.ayudas?.length || 0
      }
    };
    
    await fs.writeFile(this.filePath, JSON.stringify(dataToSave, null, 2), 'utf8');
    return dataToSave;
  }

  async addAyudas(newAyudas) {
    const existingData = await this.load();
    const existingIds = new Set(existingData.ayudas.map(a => a.id));
    
    const nuevas = newAyudas.filter(ayuda => !existingIds.has(ayuda.id));
    const actualizadas = [];
    
    // Check for updates
    newAyudas.forEach(ayuda => {
      if (existingIds.has(ayuda.id)) {
        const existing = existingData.ayudas.find(a => a.id === ayuda.id);
        if (this.hasChanges(existing, ayuda)) {
          actualizadas.push(ayuda);
        }
      }
    });
    
    // Merge data
    const mergedAyudas = [
      ...existingData.ayudas.filter(a => !actualizadas.find(ua => ua.id === a.id)),
      ...nuevas,
      ...actualizadas
    ];
    
    const result = {
      ayudas: mergedAyudas,
      metadata: {
        ...existingData.metadata,
        nuevas: nuevas.length,
        actualizadas: actualizadas.length
      }
    };
    
    return await this.save(result);
  }

  hasChanges(existing, nueva) {
    return (
      existing.titulo !== nueva.titulo ||
      existing.fechaLimite !== nueva.fechaLimite ||
      existing.estado !== nueva.estado
    );
  }

  async findBy(filters = {}) {
    const data = await this.load();
    let results = data.ayudas;
    
    if (filters.organismo) {
      results = results.filter(a => a.organismo === filters.organismo);
    }
    
    if (filters.tipo) {
      results = results.filter(a => a.tipo === filters.tipo);
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
    
    return results;
  }
}