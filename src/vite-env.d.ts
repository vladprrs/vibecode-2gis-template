/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MAPGL_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}