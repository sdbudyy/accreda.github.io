export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
}

export class GoogleDriveService {
  static async initializeGoogleDrive(): Promise<void> {
    if (!window.gapi) {
      throw new Error('Google API client not loaded');
    }

    // First load the client library
    await new Promise<void>((resolve, reject) => {
      window.gapi.load('client', {
        callback: resolve,
        onerror: reject
      });
    });

    // Then initialize the client with your API key
    await window.gapi.client.init({
      apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
      discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
    });

    // Finally load the picker
    await new Promise<void>((resolve, reject) => {
      window.gapi.load('picker', {
        callback: resolve,
        onerror: reject
      });
    });
  }

  static async createPicker(accessToken: string): Promise<GoogleDriveFile | null> {
    return new Promise((resolve) => {
      if (!window.google?.picker) {
        console.error('Picker API not loaded');
        resolve(null);
        return;
      }

      const view = new window.google.picker.DocsView()
        .setIncludeFolders(true)
        .setSelectFolderEnabled(false);

      const picker = new window.google.picker.PickerBuilder()
        .addView(view)
        .setOAuthToken(accessToken)
        .setDeveloperKey(import.meta.env.VITE_GOOGLE_API_KEY)
        .setCallback((data: { action: string; docs?: GoogleDriveFile[] }) => {
          if (data.action === window.google.picker.Action.PICKED && data.docs?.[0]) {
            resolve(data.docs[0]);
          } else if (data.action === window.google.picker.Action.CANCEL) {
            resolve(null);
          }
        })
        .build();

      picker.setVisible(true);
    });
  }

  static async downloadFile(fileId: string, accessToken: string): Promise<string> {
    try {
      const response = await window.gapi.client.drive.files.get({
        fileId,
        alt: 'media',
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      return response.body;
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error instanceof Error ? error : new Error('Failed to download file');
    }
  }
} 