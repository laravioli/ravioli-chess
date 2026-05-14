/// <reference types="vite/client" />

export {};

declare global {
  interface Window {
    site: {
      sri: string;
    };
  }
  type Callback = () => void;
  type Timeout = ReturnType<typeof setTimeout>;
  type Nullable<T> = T | undefined | null;
  declare const site: Window['site'];
}

declare global {
  interface Window {
    __TANSTACK_QUERY_CLIENT__: import('@tanstack/query-core').QueryClient;
  }
}
