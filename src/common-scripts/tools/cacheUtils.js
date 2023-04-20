export const CacheUtils = {
    // 存储接口地址
    cache: {},

    clear(key) {
        if (key) {
            const cancel = this.cache[key];
            if (cancel && typeof cancel === 'function') {
                cancel();
                delete this.cache[key]
            }
            return
        }

        Object.keys(this.cache).forEach(cacheKey => {
            const cancel = this.cache[cacheKey];
            cancel();
            delete this.cache[cacheKey]
        })
    }
}