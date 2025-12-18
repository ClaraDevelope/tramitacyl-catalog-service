import { SupabaseRestClient } from '../infra/supabaseClient.js';
import chalk from 'chalk';

export class ProceduresRepo {
  constructor() {
    this.client = new SupabaseRestClient();
  }

  async upsertProcedures(items) {
    return await this.client.upsertProcedures(items);
  }

  async upsertProcedure(item) {
    return await this.client.upsertProcedures([item]);
  }
}