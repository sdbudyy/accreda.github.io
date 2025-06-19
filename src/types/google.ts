// Types for Google APIs
export interface GoogleOAuth2 {
  initTokenClient(config: {
    client_id: string;
    scope: string;
    callback: (response: TokenResponse) => void;
  }): TokenClient;
}

export interface TokenResponse {
  access_token: string;
  error?: string;
}

export interface TokenClient {
  requestAccessToken(): void;
  callback: (response: TokenResponse) => void;
}

export interface GooglePicker {
  Action: {
    PICKED: string;
    CANCEL: string;
  };
  DocsView: any;
  PickerBuilder: any;
}

export interface Google {
  accounts: {
    oauth2: GoogleOAuth2;
  };
  picker: GooglePicker;
}

export interface GapiClient {
  init(config: any): Promise<void>;
  drive: {
    files: {
      get(config: any): Promise<any>;
    };
  };
  load(api: string, version: string): Promise<void>;
}

export interface Gapi {
  load(api: string, callback: (data: any) => void): void;
  client: GapiClient;
  auth: {
    authorize(params: any, callback: (authResult: any) => void): void;
    setToken(token: string | null): void;
  };
}

declare global {
  interface Window {
    google: Google;
    gapi: Gapi;
  }
}

export {}; 