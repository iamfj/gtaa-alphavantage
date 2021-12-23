import { ClientInterface } from '../interfaces/source/clientInterface';

export class FetchClient implements ClientInterface {
  public async fetch<R>(request: () => Promise<R>): Promise<R> {
    return request();
  }
}
