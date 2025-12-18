import { JsonStorage } from '../storage/JsonStorage.js';

export class StorageService {
  constructor(storagePath = './data/ayudas.json') {
    this.storage = new JsonStorage(storagePath);
  }

  async addAyudas(ayudas) {
    return await this.storage.addAyudas(ayudas);
  }

  async getAll() {
    const data = await this.storage.load();
    return data.ayudas;
  }

  async findBy(filters) {
    return await this.storage.findBy(filters);
  }

  async getStats() {
    const data = await this.storage.load();
    const ayudas = data.ayudas;
    
    const stats = {
      total: ayudas.length,
      byOrganismo: {},
      byTipo: {},
      byEstado: {},
      byAmbito: {}
    };
    
    ayudas.forEach(ayuda => {
      // By organismo
      stats.byOrganismo[ayuda.organismo] = (stats.byOrganismo[ayuda.organismo] || 0) + 1;
      
      // By tipo
      stats.byTipo[ayuda.tipo] = (stats.byTipo[ayuda.tipo] || 0) + 1;
      
      // By estado
      stats.byEstado[ayuda.estado] = (stats.byEstado[ayuda.estado] || 0) + 1;
      
      // By ambito
      stats.byAmbito[ayuda.ambito] = (stats.byAmbito[ayuda.ambito] || 0) + 1;
    });
    
    return stats;
  }
}