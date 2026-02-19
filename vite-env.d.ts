/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MATRIX_SERVER_URL: string;
  readonly VITE_MATRIX_SERVER_NAME: string;
  readonly VITE_ORG_ROOM_ALIAS: string;
  readonly VITE_TEMPLATES_ROOM_ALIAS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
