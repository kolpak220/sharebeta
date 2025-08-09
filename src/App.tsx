import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Shorts from './pages/Shorts';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import BottomNavigation from './components/BottomNavigation';
import './App.css';
import { UIProvider } from './contexts/UIContext';

const AppShell: React.FC = () => {
  const location = useLocation();
  const hideBottomNav = location.pathname.startsWith('/auth');
  return (
    <div className="app">
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shorts" element={<Shorts />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </main>
      {!hideBottomNav && <BottomNavigation />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <UIProvider>
        <AppShell />
      </UIProvider>
    </Router>
  );
};

export default App;