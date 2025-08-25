import React, { useCallback, useContext, useEffect } from "react";
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
import NewPost from "./pages/NewPost";
import Auth from "./pages/Auth";
import BottomNavigation from "./components/BottomNavigation";
import "./App.css";
import { UIContext, UIProvider } from "./contexts/UIContext";
import Cookies from "js-cookie";
import OpenPost from "./pages/OpenPost";
import User from "./pages/User";
import UserOverlay from "./components/UserOverlay";
import userActions from "./services/userActions";
import AuthService from "./services/auth";
import getUser from "./services/getUser";
import { FullOverlay } from "./components/fullOverlay";

const AppShell: React.FC = () => {
  const navigate = useNavigate();
  const token = useCallback(() => {
    return Cookies.get("token");
  }, []);
  const ui = useContext(UIContext);
  useEffect(() => {
    if (!token() && !window.location.href.includes("auth")) {
      navigate("/auth");
    } else if (token() && window.location.href.includes("auth")) {
      navigate("/");
    }

    async function validate() {
      const res = await AuthService.chechSession();
      const isAdmin = await getUser.getAdmin();

      if (isAdmin) {
        Cookies.set("isAdmin", `${isAdmin.isAdmin}`);
      }

      if (res) {
        if (res.isValid) {
          return;
        } else {
          Cookies.set("id", "");
          Cookies.set("token", "");
          window.location.reload();
        }
      }
    }
    validate();
  }, []);

  const location = useLocation();
  const hideBottomNav = location.pathname.startsWith("/auth");
  return (
    <div className="app">
      <FullOverlay />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shorts" element={<Shorts />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/newpost" element={<NewPost />} />
          <Route path="/post/:id" element={<OpenPost />} />
          <Route path="/user/:id" element={<User />} />
        </Routes>
      </main>
      {ui?.userOverlay.show && (
        <UserOverlay
          show={ui.userOverlay.show}
          userId={ui.userOverlay.userId}
        />
      )}
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
