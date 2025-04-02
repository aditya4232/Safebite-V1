/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ADMIN_USERNAME: string;
  readonly VITE_ADMIN_PASSWORD: string;
  readonly VITE_OPENFOODFACT_API_KEY: string;
  readonly VITE_EDAMAM_APP_ID: string;
  readonly VITE_EDAMAM_APP_KEY: string;
  readonly VITE_CALORIENINJAS_API_KEY: string;
  readonly VITE_FATSECRET_CONSUMER_KEY: string;
  readonly VITE_FATSECRET_CONSUMER_SECRET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare var process: {
  env: {
    readonly VITE_ADMIN_USERNAME: string;
    readonly VITE_ADMIN_PASSWORD: string;
    readonly VITE_OPENFOODFACT_API_KEY: string;
    readonly VITE_EDAMAM_APP_ID: string;
    readonly VITE_EDAMAM_APP_KEY: string;
    readonly VITE_CALORIENINJAS_API_KEY: string;
    readonly VITE_FATSECRET_CONSUMER_KEY: string;
    readonly VITE_FATSECRET_CONSUMER_SECRET: string;
  };
}
