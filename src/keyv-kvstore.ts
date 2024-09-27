import { EventEmitter } from "node:events";
import { KeyValueStore } from "@crawlee/http";
import type { KeyvStoreAdapter, StoredData } from "keyv";

export interface KeyvKvstoreOptions {
  getKeyValueStore: () => Promise<KeyValueStore>;
}

export class KeyvKeyValueStore extends EventEmitter implements KeyvStoreAdapter {
  opts: KeyvKvstoreOptions;
  private _store: Promise<KeyValueStore> | undefined;
  constructor(opts: KeyvKvstoreOptions) {
    super();
    this.opts = opts;
  }
  protected getStore() {
    this._store = this._store || this.opts.getKeyValueStore();
    return this._store;
  }

  async clear(): Promise<void> {
    const store = await this.getStore();
    await store.drop();
    this._store = void 0;
  }

  async delete(key: string): Promise<boolean> {
    const store = await this.getStore();
    const r = await store.recordExists(key);
    if (!r) return false;
    await store.setValue(key, null);
    return true;
  }

  async get<Value>(key: string): Promise<StoredData<Value> | undefined> {
    const store = await this.getStore();
    const value = await store.getValue<StoredData<Value>>(key);
    return value === null ? undefined : value;
  }

  async set(key: string, value: any, ttl?: number): Promise<any> {
    const store = await this.getStore();
    await store.setValue(key, value, {});
    return true;
  }
}
