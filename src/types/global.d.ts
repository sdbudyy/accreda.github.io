import type { Google, Gapi } from './google';

declare global {
  interface Window {
    google: Google;
    gapi: Gapi;
    OneDrive?: any;
  }
}

export {}; 