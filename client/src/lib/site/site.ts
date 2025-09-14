type RandomToken = string;

export interface Site {
  sri: RandomToken;
}

const randomToken = () => {
  try {
    const data = globalThis.crypto.getRandomValues(new Uint8Array(9));
    return btoa(String.fromCharCode(...data)).replace(/[/+]/g, '_');
    // eslint-disable-next-line no-unused-vars
  } catch (_) {
    return Math.random().toString(36).slice(2, 12);
  }
};

export const initSite = () => {
  window.site = { sri: randomToken() };
};
