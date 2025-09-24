import { StorageProvider } from "./types"

export class LocalStorageProvider implements StorageProvider {
  async getItem<T = unknown>(key: string): Promise<T | null> {
    try {
      const raw = localStorage.getItem(key)
      if (!raw) return null
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  }

  async setItem<T = unknown>(key: string, value: T): Promise<void> {
    localStorage.setItem(key, JSON.stringify(value))
  }

  async removeItem(key: string): Promise<void> {
    localStorage.removeItem(key)
  }
}

export class EncryptedLocalStorageProvider implements StorageProvider {
  private key: CryptoKey | undefined;
  private prefix = "enc_v1_"

  constructor(passphrase: string) {
    EncryptedLocalStorageProvider.deriveKeyFromPassphrase(passphrase).then(({ key }) => {
      this.key = key;
    });
  }

  static async deriveKeyFromPassphrase(passphrase: string, salt?: BufferSource) {
    const enc = new TextEncoder()
    const pwKey = await crypto.subtle.importKey("raw", enc.encode(passphrase), "PBKDF2", false, ["deriveKey"])
    const s = salt ?? crypto.getRandomValues(new Uint8Array(16))
    const key = await crypto.subtle.deriveKey(
      { name: "PBKDF2", salt: s, iterations: 100000, hash: "SHA-256" },
      pwKey,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    )
    return { key, salt: s }
  }

  static async createFromPassphrase(passphrase: string) {
    const { key, salt } = await EncryptedLocalStorageProvider.deriveKeyFromPassphrase(passphrase)
    const provider = new EncryptedLocalStorageProvider(passphrase)
    provider.key = key;
    localStorage.setItem("__rrh_enc_salt__", JSON.stringify(Array.from(new Uint8Array(salt as ArrayBuffer))))
    return provider
  }

  static async createFromPassphraseWithStoredSalt(passphrase: string) {
    const raw = localStorage.getItem("__rrh_enc_salt__")
    let salt: BufferSource | undefined
    if (raw) salt = new Uint8Array(JSON.parse(raw)).buffer;
    const { key } = await EncryptedLocalStorageProvider.deriveKeyFromPassphrase(passphrase, salt)
    const provider = new EncryptedLocalStorageProvider(passphrase);
    provider.key = key;
    return provider
  }

  private async encryptObject<T>(obj: T) {
    if (!this.key) {
      throw new Error('Key is not derived yet');
    }
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const enc = new TextEncoder()
    const data = enc.encode(JSON.stringify(obj))
    const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, this.key, data)
    return { iv: Array.from(iv), data: Array.from(new Uint8Array(ct)) }
  }

  private async decryptObject<T>(payload: { iv: number[]; data: number[] }) {
    if (!this.key) {
      throw new Error('Key is not derived yet');
    }
    const iv = new Uint8Array(payload.iv)
    const ct = new Uint8Array(payload.data)
    const dec = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, this.key, ct)
    const decStr = new TextDecoder().decode(dec)
    return JSON.parse(decStr) as T
  }

  async getItem<T = unknown>(key: string): Promise<T | null> {
    try {
      const raw = localStorage.getItem(this.prefix + key)
      if (!raw) return null
      const payload = JSON.parse(raw)
      return await this.decryptObject<T>(payload)
    } catch {
      return null
    }
  }

  async setItem<T = unknown>(key: string, value: T): Promise<void> {
    const payload = await this.encryptObject(value)
    localStorage.setItem(this.prefix + key, JSON.stringify(payload))
  }

  async removeItem(key: string): Promise<void> {
    localStorage.removeItem(this.prefix + key)
  }
}