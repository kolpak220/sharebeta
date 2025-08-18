import React, { useCallback, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import Home from "./pages/Home";
import Shorts from "./pages/Shorts";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import BottomNavigation from "./components/BottomNavigation";
import "./App.css";
import { UIProvider } from "./contexts/UIContext";
import Cookies from "js-cookie";
import User from "./pages/User";

const AppShell: React.FC = () => {
  const navigate = useNavigate();
  const token = useCallback(() => {
    return Cookies.get("token");
  }, []);
  useEffect(() => {
    if (!token() && !window.location.href.includes("auth")) {
      navigate("/auth");
    } else if (token() && window.location.href.includes("auth")) {
      navigate("/");
    }
  }, []);

  const location = useLocation();
  const hideBottomNav = location.pathname.startsWith("/auth");
  return (
    <div className="app">
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shorts" element={<Shorts />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/user/:id" element={<User />}/>
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
