import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const MetadataForm = () => {
  const { audioId } = useParams();
  console.log('AudioId:', audioId);
  const [albumArt, setAlbumArt] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [tags, setTags] = useState('');
  const [category, setCategory] = useState('');
  const [ageRestriction, setAgeRestriction] = useState('Everyone');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!audioId) {
      console.error('No audioId provided');
      setErrorMessage('No audio file selected. Please upload an audio file first.');
    }
  }, [audioId]);

  const handleAlbumArtChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        if (img.width >= 150 && img.height >= 150) {
          setAlbumArt(file);
          setErrorMessage('');
        } else {
          setErrorMessage('Image dimensions should be at least 150px by 150px.');
          setAlbumArt(null);
        }
      };
    }
  };

  const handleFetchTranscription = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/audio/${audioId}/transcription`);
      if (response.data && response.data.transcription) {
        setLyrics(response.data.transcription);
        setSuccessMessage('Transcription fetched successfully!');
      } else {
        setErrorMessage('No transcription available.');
      }
    } catch (error) {
      console.error('Error fetching transcription:', error);
      setErrorMessage('Error fetching transcription. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearForm = () => {
    setAlbumArt(null);
    setTitle('');
    setDescription('');
    setLyrics('');
    setTags('');
    setCategory('');
    setAgeRestriction('Everyone');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('lyrics', lyrics);
    formData.append('tags', tags);
    formData.append('category', category);
    formData.append('ageRestriction', ageRestriction);
    if (albumArt) {
      formData.append('albumArt', albumArt);
    }

    try {
      const response = await axios.post(`http://localhost:5000/api/metadata/${audioId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccessMessage('Metadata saved successfully!');
      clearForm();
      // Handle success (e.g., redirect or clear form)
    } catch (error) {
      setErrorMessage('Error saving metadata: ' + (error.response?.data?.message || error.message));
      console.error('Error details:', error.response?.data || error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <h2 className="text-orange-500 text-3xl mb-6 font-bold">Add Album Art and Metadata</h2>
      {successMessage && (
        <div className="bg-green-500 text-white p-2 rounded mb-4 w-full max-w-2xl">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-500 text-white p-2 rounded mb-4 w-full max-w-2xl">
          {errorMessage}
        </div>
      )}
      <form onSubmit={handleSubmit} className="bg-black p-6 rounded-lg shadow-lg w-full max-w-2xl">
        <div className="mb-4">
          <label className="block text-orange-500 mb-2">Upload Album Art (150px x 150px min):</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleAlbumArtChange} 
            className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-orange-500 focus:outline-none"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-orange-500 mb-2">Title:</label>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-orange-500 focus:outline-none" 
            required 
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-orange-500 mb-2">Description:</label>
          <textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-orange-500 focus:outline-none" 
            required 
          />
        </div>

        <div className="mb-4">
          <label className="block text-orange-500 mb-2">Lyrics/Script:</label>
          <div className="flex items-center mb-2">
            <textarea 
              value={lyrics} 
              onChange={(e) => setLyrics(e.target.value)} 
              className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-orange-500 focus:outline-none" 
            />
            <button 
              type="button" 
              onClick={handleFetchTranscription}
              className="ml-2 bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Fetching...' : 'Fetch Transcription'}
            </button>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-orange-500 mb-2">Tags (comma-separated):</label>
          <input 
            type="text" 
            value={tags} 
            onChange={(e) => setTags(e.target.value)} 
            className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-orange-500 focus:outline-none" 
          />
        </div>

        <div className="mb-4">
          <label className="block text-orange-500 mb-2">Category/Genre:</label>
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)} 
            className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-orange-500 focus:outline-none"
          >
            <option value="">Select a Category</option>
            <option value="Music">Music</option>
            <option value="Podcast">Podcast</option>
            <option value="Audiobook">Audiobook</option>
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-orange-500 mb-2">Age Restriction:</label>
          <select 
            value={ageRestriction} 
            onChange={(e) => setAgeRestriction(e.target.value)} 
            className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-orange-500 focus:outline-none"
          >
            <option value="Everyone">Everyone</option>
            <option value="Below 18">Below 18</option>
          </select>
        </div>

        <button 
          type="submit" 
          className="w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default MetadataForm;
