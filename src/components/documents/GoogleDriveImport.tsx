import React, { useEffect, useCallback } from 'react';
import { GoogleDriveService, GoogleDriveFile } from '../../utils/GoogleDriveService';
import { initializeGoogleAuth, getAccessToken } from '../../utils/googleAuth';
import toast from 'react-hot-toast';

// Use Vite's import.meta.env for environment variables
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string; // <-- Set in .env file
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY as string; // <-- Set in .env file
const SCOPE = 'https://www.googleapis.com/auth/drive.readonly';

interface GoogleDriveImportProps {
  onFilePicked: (file: GoogleDriveFile, content: string) => void;
}

const GoogleDriveImport: React.FC<GoogleDriveImportProps> = ({ onFilePicked }) => {
  useEffect(() => {
    // Load both required scripts
    const loadScripts = async () => {
      try {
        // First load the Google API Client script
        const gapiScript = document.createElement('script');
        gapiScript.src = 'https://apis.google.com/js/api.js';
        gapiScript.async = true;
        document.body.appendChild(gapiScript);

        await new Promise<void>((resolve) => {
          gapiScript.onload = () => resolve();
        });

        // Then load the Google Identity Services script
        const gisScript = document.createElement('script');
        gisScript.src = 'https://accounts.google.com/gsi/client';
        gisScript.async = true;
        gisScript.defer = true;
        document.body.appendChild(gisScript);

        await new Promise<void>((resolve) => {
          gisScript.onload = () => resolve();
        });

        // Initialize auth after both scripts are loaded
        initializeGoogleAuth();
      } catch (error) {
        console.error('Failed to load Google API scripts:', error);
        toast.error('Failed to initialize Google Drive integration');
      }
    };

    loadScripts();

    return () => {
      // Clean up scripts on unmount
      const scripts = document.querySelectorAll('script[src*="google"]');
      scripts.forEach(script => script.remove());
    };
  }, []);

  const handleImport = useCallback(async () => {
    try {
      // Initialize Google Drive API
      await GoogleDriveService.initializeGoogleDrive();
      
      // Get access token using Google Identity Services
      const accessToken = await getAccessToken();
      
      // Create and show the picker
      const file = await GoogleDriveService.createPicker(accessToken);
      
      if (file) {
        // Download the file content
        const content = await GoogleDriveService.downloadFile(file.id, accessToken);
        onFilePicked(file, content);
        toast.success('File imported successfully');
      }
    } catch (error) {
      console.error('Error importing from Google Drive:', error);
      toast.error('Failed to import file from Google Drive');
    }
  }, [onFilePicked]);

  return (
    <button
      className="w-full text-left px-4 py-2 hover:bg-slate-100"
      onClick={handleImport}
      type="button"
    >
      Import from Google Drive
    </button>
  );
};

export default GoogleDriveImport;

// ---
// To use in production, add the following to your .env file at the project root:
// VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
// VITE_GOOGLE_API_KEY=your-google-api-key
// --- 