import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import AudioUpload from './components/AudioUpload';
import MetadataForm from './components/MetadataForm';


function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Default route - Login Screen */}
          <Route path="/login" element={<Login />} />

          {/* Audio Upload Screen */}
          <Route path="/upload" element={<AudioUpload />} />

          {/* Metadata Form Screen */}
          <Route path="/metadata/:audioId" element={<MetadataForm />} />

          {/* Redirect root or any unknown paths to the login screen */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
