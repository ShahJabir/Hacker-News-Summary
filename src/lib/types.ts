export interface AppEnv {
  Bindings: Cloudflare.Env
}

export interface ArticleSummary {
  article: string | null | undefined
  summary: string | null | undefined
}
