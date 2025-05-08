/// <reference types="vite/client" />
interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    // more env vars…  
    readonly [key: string]: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }