/// <reference types="vite/client" />

export {};

declare global {
  interface Window {
    site: {
      sri: string;
    };
  }
  type Timeout = ReturnType<typeof setTimeout>;
}
