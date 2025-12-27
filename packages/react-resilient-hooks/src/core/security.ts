export type SensitiveFilterFn = (obj: any) => any

const DEFAULT_SENSITIVE_KEYWORDS = ["password","passwd","pwd","token","access_token","refresh_token","auth","authorization"]

export function redactSensitiveFields(obj: any, extraKeys: string[] = [], customKeywords: string[] = []) {
  const keywords = new Set([...DEFAULT_SENSITIVE_KEYWORDS, ...extraKeys, ...customKeywords].map(k => k.toLowerCase()))
  const walk = (v: any): any => {
    if(v===null||v===undefined) return v
    if(typeof v!=="object") return v
    if(Array.isArray(v)) return v.map(walk)
    const out: any = {}
    for(const [k,val] of Object.entries(v)){
      out[k] = keywords.has(k.toLowerCase())?"[REDACTED]":walk(val)
    }
    return out
  }
  return walk(obj)
}