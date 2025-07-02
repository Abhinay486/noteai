import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserData } from './context/UserContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Notes from './pages/Notes';
import SettingsPage from './pages/Settings';
import Profile from './pages/Profile';
import ImageUpload from './pages/ImageUpload';
import ChatBot from './pages/ChatBot';

const App = () => {
  const { user, isAuth, loading, fetchUser } = UserData();

  if (loading) {
    // Prevent rendering until auth is checked
    return null;
  }

  return (
    <>
      {user && user._id && (
        <div
          style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}
          aria-label="AI ChatBot"
          role="complementary"
        >
          <ChatBot userId={user._id} onNoteAdded={fetchUser} />
        </div>
      )}
      <Router>
        <div className="min-h-screen bg-gray-50">
          {isAuth && <div className="bg-blue-500 text-white p-4 text-center">Welcome, {user.name}!</div>}
          <Navbar user={user} />
          <Routes>
            <Route path="/" element={isAuth ? <Home /> : <Navigate to="/login" />} />
            <Route path="/notes" element={isAuth ? <Notes /> : <Navigate to="/login" />} />
            <Route path="/settings" element={isAuth ? <SettingsPage /> : <Navigate to="/login" />} />
            <Route path="/profile" element={isAuth ? <Profile /> : <Navigate to="/login" />} />
            <Route path="/image-upload" element={isAuth ? <ImageUpload userId={user._id} /> : <Navigate to="/login" />} />
            <Route path="/login" element={!isAuth ? <Login /> : <Navigate to="/" />} />
            <Route path="/register" element={!isAuth ? <Register /> : <Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </>
  );
};

export default App;