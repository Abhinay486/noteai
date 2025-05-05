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

const App = () => {
  const { user, isAuth } = UserData();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user}/>
        <Routes>
          <Route path="/" element={isAuth ? <Home /> : <Navigate to="/login" />} />
          <Route path="/notes" element={isAuth ? <Notes /> : <Navigate to="/login" />} />
          <Route path="/settings" element={isAuth ? <SettingsPage /> : <Navigate to="/login" />} />
          <Route path="/profile" element={isAuth ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/login" element={!isAuth ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!isAuth ? <Register /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;