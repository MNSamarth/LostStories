import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AudioUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadedAudios, setUploadedAudios] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAudios();
  }, []);

  const fetchAudios = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/audios');
      setUploadedAudios(response.data);
    } catch (error) {
      console.error('Error fetching audios:', error);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && (selectedFile.type === 'audio/mpeg' || selectedFile.type === 'audio/wav')) {
      setSelectedFile(selectedFile);
      setErrorMessage('');
    } else {
      setErrorMessage('Please select an MP3 or WAV file');
      setSelectedFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('No file selected or file is not valid.');
    } else {
      try {
        const formData = new FormData();
        formData.append('audio', selectedFile);

        console.log('Sending file:', selectedFile); // Log file being sent

        const response = await axios.post('http://localhost:5000/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        console.log('Upload response:', response.data); // Log successful response
        // Navigate to MetaDataForm with the uploaded audio's ID
        navigate(`/metadata/${response.data.audio._id}`);
      } catch (error) {
        console.error('Error details:', error.response ? error.response.data : error); // Log detailed error
        setErrorMessage('Error uploading file. Please try again.');
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <h2 className="text-orange-500 text-3xl mb-6 font-bold">Upload Your Audio File</h2>
      <form onSubmit={handleSubmit} className="bg-black p-8 rounded-xl shadow-lg w-full max-w-md mb-8">
        <div className="mb-6">
          <label className="block text-orange-500 mb-2">Select an MP3 or WAV file:</label>
          <input
            type="file"
            accept=".mp3,.wav"
            onChange={handleFileChange}
            className="w-full p-2 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
        {selectedFile && <p className="text-gray-400 mb-4">Selected File: {selectedFile.name}</p>}
        <button
          type="submit"
          className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
        >
          Upload
        </button>
      </form>

      <div className="w-full max-w-md">
        <h3 className="text-orange-500 text-xl mb-4 font-bold">Uploaded Audios</h3>
        <ul className="bg-black rounded-xl shadow-lg p-4">
          {uploadedAudios.map((audio) => (
            <li key={audio._id} className="text-white mb-2">
              {audio.filename} - {new Date(audio.uploadDate).toLocaleString()}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AudioUpload;
