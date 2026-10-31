export type ResourceCache = {
  load: <T>(url: string, fetcher: (url: string) => Promise<T>) => Promise<T>
}

export function createResourceCache(): ResourceCache {
  const cache = new Map<string, Promise<unknown>>()

  return {
    load<T>(url: string, fetcher: (url: string) => Promise<T>): Promise<T> {
      const cached = cache.get(url) as Promise<T> | undefined
      if (cached) return cached

      const pending = fetcher(url).catch((error: unknown) => {
        cache.delete(url)
        throw error
      })
      cache.set(url, pending)
      return pending
    },
  }
}
