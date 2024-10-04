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
  static async generateKey(key: string): Promise<string> {
    let _key = key.replace(/[^a-zA-Z0-9!\-_.'()]/g, "").slice(0, 255);
    if (_key !== key) {
      const { default: fnv1a } = await import("@sindresorhus/fnv1a");
      const keyHash = fnv1a(_key, { size: 32 }).toString(16);
      _key = `${_key.slice(0, 255 - keyHash.length)}.${keyHash}`;
    }
    return _key;
  }
  generateKey(key: string): Promise<string> {
    return KeyvKeyValueStore.generateKey(key);
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
    key = await this.generateKey(key);
    const store = await this.getStore();
    const r = await store.recordExists(key);
    if (!r) return false;
    await store.setValue(key, null);
    return true;
  }

  async get<Value>(key: string): Promise<StoredData<Value> | undefined> {
    key = await this.generateKey(key);
    const store = await this.getStore();
    const value = await store.getValue<StoredData<Value>>(key);
    return value === null ? undefined : value;
  }

  async set(key: string, value: any, ttl?: number): Promise<any> {
    key = await this.generateKey(key);
    const store = await this.getStore();
    try {
      await store.setValue(key, value, {});
    } catch {
      return false;
    }
    return true;
  }
}
