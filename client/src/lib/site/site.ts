import { randomToken } from '@/lib/common';

type RandomToken = string;

export interface Site {
  sri: RandomToken;
}

export const initSite = () => {
  window.site = { sri: randomToken() };
};
