type MapLike = {
  has(key: unknown): boolean;
  get(key: unknown): unknown;
  set(key: unknown, value: unknown): unknown;
};

function patch(proto: MapLike & {
  getOrInsert?: (key: unknown, value: unknown) => unknown;
  getOrInsertComputed?: (key: unknown, callback: (key: unknown) => unknown) => unknown;
}) {
  if (typeof proto.getOrInsert !== 'function') {
    Object.defineProperty(proto, 'getOrInsert', {
      configurable: true,
      writable: true,
      value(key: unknown, value: unknown) {
        if (!this.has(key)) this.set(key, value);
        return this.get(key);
      }
    });
  }
  if (typeof proto.getOrInsertComputed !== 'function') {
    Object.defineProperty(proto, 'getOrInsertComputed', {
      configurable: true,
      writable: true,
      value(key: unknown, callback: (key: unknown) => unknown) {
        if (!this.has(key)) this.set(key, callback(key));
        return this.get(key);
      }
    });
  }
}

export function installMapPolyfill() {
  patch(Map.prototype as unknown as MapLike);
  patch(WeakMap.prototype as unknown as MapLike);
}

installMapPolyfill();
