
/// <reference types="vite/client" />

// Add Deno type declaration for Supabase Edge Functions
interface DenoNamespace {
  env: {
    get(key: string): string | undefined;
  };
}

declare const Deno: DenoNamespace;
