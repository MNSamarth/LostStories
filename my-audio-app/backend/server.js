const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
console.log('fs is defined:', !!fs);
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

//const __filename = fileURLToPath(import.meta.url);
const __dirname = path.resolve();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);  // Exit the process if unable to connect to MongoDB
  });

// Define the Audio model
const audioSchema = new mongoose.Schema({
  filename: String,
  path: String,
  uploadDate: { type: Date, default: Date.now },
  metadata: {
    albumArt: String,
    title: String,
    description: String,
    lyrics: String,
    tags: [String],
    category: String,
    ageRestriction: String
  }
});

const Audio = mongoose.model('Audio', audioSchema);

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// File filter for audio uploads
const audioFileFilter = (req, file, cb) => {
  if (file.mimetype === 'audio/mpeg' || file.mimetype === 'audio/wav') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only MP3 and WAV are allowed.'), false);
  }
};

// File filter for album art uploads
const albumArtFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images are allowed for album art.'), false);
  }
};

// Multer middleware for audio uploads
const audioUpload = multer({ 
  storage: storage,
  fileFilter: audioFileFilter
});

// Multer middleware for metadata (album art) uploads
const metadataUpload = multer({
  storage: storage,
  fileFilter: albumArtFileFilter
});

const upload = multer({ storage: storage });

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir);
}

// Existing audio upload route
app.post('/api/upload', upload.single('audio'), async (req, res) => {
  console.log('Upload route accessed');
  try {
    console.log('fs in upload route:', typeof fs);
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    console.log('File received:', req.file);

    const newAudio = new Audio({
      filename: req.file.originalname,
      path: req.file.path,
    });
    
    console.log('Attempting to save audio to database:', newAudio);
    const savedAudio = await newAudio.save();
    console.log('Audio saved to database:', savedAudio);

    // Send file for transcription
    const formData = new FormData();
    try {
      console.log('Attempting to create read stream for file:', req.file.path);
      const fileStream = fs.createReadStream(req.file.path);
      formData.append('file', fileStream);
      console.log('Read stream created successfully');
    } catch (fsError) {
      console.error('Error creating read stream:', fsError);
      return res.status(500).json({ message: 'Error processing file', error: fsError.message });
    }
    
    console.log('Sending file for transcription');
    const transcriptionResponse = await axios.post('http://localhost:5001/transcribe', formData, {
      headers: {
        ...formData.getHeaders(),
        'Content-Type': 'multipart/form-data'
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    console.log('Transcription received:', transcriptionResponse.data);

    // Update audio document with transcription
    savedAudio.metadata = { lyrics: transcriptionResponse.data.transcription };
    await savedAudio.save();

    res.status(201).json({ message: 'Audio uploaded and transcribed successfully', audio: savedAudio });
  } catch (error) {
    console.error('Detailed error in /api/upload:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Error uploading audio', error: error.message });
  }
});

// New route to save metadata
app.post('/api/metadata/:id', metadataUpload.single('albumArt'), async (req, res) => {
  try {
    const audioId = req.params.id;
    const { title, description, lyrics, tags, category, ageRestriction } = req.body;

    const updatedAudio = await Audio.findByIdAndUpdate(audioId, {
      metadata: {
        albumArt: req.file ? req.file.path : undefined,
        title,
        description,
        lyrics,
        tags: tags.split(',').map(tag => tag.trim()),
        category,
        ageRestriction
      }
    }, { new: true });

    if (!updatedAudio) {
      return res.status(404).json({ message: 'Audio not found' });
    }

    res.json(updatedAudio);
  } catch (error) {
    console.error('Error saving metadata:', error);
    res.status(500).json({ message: 'Error saving metadata', error: error.message });
  }
});

// Get all audios route
app.get('/api/audios', async (req, res) => {
  try {
    const audios = await Audio.find().sort({ uploadDate: -1 });
    res.json(audios);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching audios', error: error.message });
  }
});

app.get('/api/audio/:id/transcription', async (req, res) => {
  console.log('Transcription request received for audio ID:', req.params.id);
  try {
    const audio = await Audio.findById(req.params.id);
    console.log('Audio found:', audio);
    if (!audio) {
      console.log('Audio not found');
      return res.status(404).json({ message: 'Audio not found' });
    }
    if (!audio.metadata || !audio.metadata.lyrics) {
      console.log('Transcription not available');
      return res.status(404).json({ message: 'Transcription not available' });
    }
    console.log('Sending transcription');
    res.json({ transcription: audio.metadata.lyrics });
  } catch (error) {
    console.error('Error fetching transcription:', error);
    res.status(500).json({ message: 'Error fetching transcription', error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


