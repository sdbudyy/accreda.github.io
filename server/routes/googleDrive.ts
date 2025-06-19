import express from 'express';
import axios from 'axios';

const router = express.Router();

router.post('/google-drive/download', async (req, res) => {
  const { fileId, oauthToken } = req.body;
  try {
    // Get file metadata to determine MIME type and name
    const metaResp = await axios.get(
      `https://www.googleapis.com/drive/v3/files/${fileId}?fields=name,mimeType`,
      { headers: { Authorization: `Bearer ${oauthToken}` } }
    );
    const { name, mimeType } = metaResp.data;

    // Download file content
    const fileResp = await axios.get(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: { Authorization: `Bearer ${oauthToken}` },
        responseType: 'stream',
      }
    );

    res.setHeader('Content-Disposition', `attachment; filename="${name}"`);
    res.setHeader('Content-Type', mimeType);
    fileResp.data.pipe(res);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

export default router; 