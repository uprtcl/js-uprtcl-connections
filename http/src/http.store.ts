import { CASStore, CidConfig } from '@uprtcl/multiplatform';

import { HttpProvider } from './http.provider';
import { HttpConnection } from './http.connection';
import { Logger } from '@uprtcl/micro-orchestrator';

const store_api = 'store';

export class HttpStore implements CASStore {
  logger = new Logger('Http Store');

  constructor(protected provider: HttpProvider, public cidConfig: CidConfig) {}

  get casID() {
    return `http:${store_api}:${this.provider.pOptions.host}`;
  }

  ready() {
    return Promise.resolve();
  }

  async get(hash: string): Promise<object> {
    return this.provider.getObject<object>(`/get/${hash}`);
  }

  async create(object: object, hash?: string, attempts?: number): Promise<string> {
    this.logger.log('Creating Entity', { object, hash });   
    const result = await this.provider.post(`/data`, {
      id: hash ? hash : '',
      object: object
    });

    if(result.elementIds === undefined) {
      if(attempts && attempts > 0) {
        return await this.create(object, hash, attempts - 1);
      } else {
        throw new Error('Could not create data...');
      }
    } else {
      return result.elementIds[0];
    }    
  }
}
