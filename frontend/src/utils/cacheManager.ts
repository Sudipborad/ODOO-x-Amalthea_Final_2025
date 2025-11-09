type CacheInvalidationCallback = () => void;

class CacheManager {
  private callbacks: Set<CacheInvalidationCallback> = new Set();

  subscribe(callback: CacheInvalidationCallback) {
    console.log('Cache manager: New subscription added. Total:', this.callbacks.size + 1);
    this.callbacks.add(callback);
    return () => {
      console.log('Cache manager: Subscription removed. Total:', this.callbacks.size - 1);
      this.callbacks.delete(callback);
    };
  }

  invalidateAll() {
    console.log('Cache manager: Invalidating all caches. Callbacks:', this.callbacks.size);
    this.callbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Cache invalidation callback error:', error);
      }
    });
  }
}

export const cacheManager = new CacheManager();