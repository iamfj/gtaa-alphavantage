export interface ClientInterface {
  fetch<R>(request: () => Promise<R>): Promise<R>;
}