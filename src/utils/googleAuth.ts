import type { Google, Gapi, TokenClient, TokenResponse } from '../types/google';

// Types for Google APIs
interface GoogleOAuth2 {
  initTokenClient(config: {
    client_id: string;
    scope: string;
    callback: (response: TokenResponse) => void;
  }): TokenClient;
}

interface GooglePicker {
  Action: {
    PICKED: string;
    CANCEL: string;
  };
  DocsView: any;
  PickerBuilder: any;
}

interface GapiClient {
  init(config: any): Promise<void>;
  drive: {
    files: {
      get(config: any): Promise<any>;
    };
  };
  load(api: string, version: string): Promise<void>;
}

declare global {
  interface Window {
    google: Google;
    gapi: Gapi;
  }
}

let tokenClient: TokenClient | null = null;

const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

export const initializeGoogleAuth = (): void => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  
  if (!clientId) {
    throw new Error('Google Client ID not found in environment variables');
  }

  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: SCOPES,
    callback: () => {}, // We'll handle the callback in the component
  });
};

export const getAccessToken = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(new Error('Token client not initialized'));
      return;
    }

    tokenClient.callback = (response: TokenResponse) => {
      if (response.error) {
        reject(new Error(response.error));
      } else {
        resolve(response.access_token);
      }
    };

    tokenClient.requestAccessToken();
  });
};

export { tokenClient }; 