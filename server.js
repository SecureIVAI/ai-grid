import express from 'express';
import multer from 'multer';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import cors from 'cors';
import { Readable } from 'stream';
import path from 'path';

// Get the __dirname equivalent in ES Modules
const __dirname = path.dirname(new URL(import.meta.url).pathname);

dotenv.config(); // Initialize dotenv

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const folderId = '1hKyzcpRkwBnfF3LXFqRs0dUgvCLSvjuI'; // Hardcoded folder id

app.use(cors());

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, 'config', 'credentials.json'),
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const authClient = await auth.getClient();
    const drive = google.drive({ version: 'v3', auth: authClient });

    const fileMetadata = {
      name: req.file.originalname,
      parents: [folderId],
    };

    // Convert Buffer to Readable stream
    const bufferStream = new Readable();
    bufferStream.push(req.file.buffer);
    bufferStream.push(null); // Signal the end of the stream

    const media = {
      mimeType: req.file.mimetype,
      body: bufferStream, // Use the readable stream
    };

    const file = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, webViewLink',
    });

    res.json({ success: true, link: file.data.webViewLink });
  } catch (error) {
    console.error('Google Drive upload error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint to fetch the list of files from Google Drive
app.get('/files', async (req, res) => {
  try {
    const authClient = await auth.getClient();
    const drive = google.drive({ version: 'v3', auth: authClient });

    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'files(id, name, webViewLink)', // Include file ID
    });

    if (!response.data.files || response.data.files.length === 0) {
      return res.json([]); // Return empty array if no files found
    }

    res.json(response.data.files);
  } catch (error) {
    console.error('Error fetching files from Google Drive:', error);
    res.status(500).json({ error: 'Failed to fetch files from Google Drive.' });
  }
});

// Endpoint to get a short-lived access token
app.get('/auth', async (req, res) => {
  try {
    const authClient = await auth.getClient();
    const accessTokenResponse = await authClient.getAccessToken();
    const accessToken = accessTokenResponse.token;
    res.json({ accessToken });
  } catch (error) {
    console.error('Error getting access token:', error);
    res.status(500).json({ error: 'Failed to get access token.' });
  }
});

app.listen(3000, () => console.log('Server started on http://localhost:3000'));

app.delete('/delete/:fileId', async (req, res) => {
  try {
    const authClient = await auth.getClient();
    const drive = google.drive({ version: 'v3', auth: authClient });

    const fileId = req.params.fileId;

    await drive.files.delete({
      fileId: fileId,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
