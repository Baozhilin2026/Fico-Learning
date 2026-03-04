// Audio cache service using IndexedDB
const DB_NAME = 'ficoAudioCache'
const STORE_NAME = 'audioFiles'
const DB_VERSION = 1

interface CachedAudio {
  url: string
  blob: Blob
  timestamp: number
}

class AudioCacheService {
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(new Error('Failed to open IndexedDB'))
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME)
        }
      }
    })
  }

  async get(text: string): Promise<string | null> {
    if (!this.db) await this.init()

    return new Promise<string | null>((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.get(this.generateKey(text))

      request.onsuccess = () => {
        const result = request.result as CachedAudio | undefined
        if (result) {
          // Check if cache is still valid (30 days)
          const maxAge = 30 * 24 * 60 * 60 * 1000
          if (Date.now() - result.timestamp < maxAge) {
            const url = URL.createObjectURL(result.blob)
            resolve(url)
          } else {
            // Cache expired, delete it
            this.delete(text)
            resolve(null)
          }
        } else {
          resolve(null)
        }
      }

      request.onerror = () => reject(request.error)
    })
  }

  async set(text: string, blob: Blob): Promise<void> {
    if (!this.db) await this.init()

    return new Promise<void>((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)

      const data: CachedAudio = {
        url: this.generateKey(text),
        blob,
        timestamp: Date.now()
      }

      const request = store.put(data, this.generateKey(text))

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async delete(text: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise<void>((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.delete(this.generateKey(text))

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async clear(): Promise<void> {
    if (!this.db) await this.init()

    return new Promise<void>((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  private generateKey(text: string): string {
    // Simple hash function
    let hash = 0
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return `audio_${Math.abs(hash)}`
  }

  // Get cache size in bytes
  async getSize(): Promise<number> {
    if (!this.db) await this.init()

    return new Promise<number>((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.getAllKeys()

      request.onsuccess = () => {
        // Rough estimation, actual size may vary
        resolve(request.result.length * 50000) // Assume ~50KB per audio
      }

      request.onerror = () => reject(request.error)
    })
  }
}

export const audioCacheService = new AudioCacheService()
