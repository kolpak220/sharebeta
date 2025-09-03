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
import AuthService from "./services/auth";
import getUser from "./services/getUser";
import { FullOverlay } from "./components/FullOverlay";
import Subs from "./pages/Subs";
import TermsOfService from "./pages/TermsOfService";
import ProfileOverlay from "./components/ProfileOverlay";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ChangePassword from "./pages/ChangePassword";
import Logout from "./pages/Logout";
import EditProfile from "./pages/EditProfile";

const AppShell: React.FC = () => {
  const navigate = useNavigate();
  const token = Cookies.get("token");
  const ui = useContext(UIContext);
  const location = useLocation();

  const doesAnyHistoryEntryExist = location.key !== "default";

  useEffect(() => {
    if (
      !token &&
      !window.location.href.includes("auth") &&
      !window.location.href.includes("terms")
    ) {
      navigate("/auth");
    } else if (token && window.location.href.includes("auth")) {
      navigate("/");
    }

    async function validate() {
      const res = await AuthService.checkSession();
      const isAdmin = await getUser.getAdmin();

      if (isAdmin) {
        Cookies.set("isAdmin", `${isAdmin.isAdmin}`);
      }

      if (res) {
        if (res.isValid) {
          return;
        } else if (location.pathname.includes("terms")) {
          return;
        } else {
          Cookies.set("id", "");
          Cookies.set("token", "");
          window.location.reload();
        }
      }
    }
    validate();

    const handleBackButton = (event: PopStateEvent) => {
      event.preventDefault();
      if (doesAnyHistoryEntryExist) {
        navigate(-1);
      } else {
        navigate("/");
      }
    };

    // Add event listener for popstate (back button)
    window.addEventListener("popstate", handleBackButton);

    return () => {
      // Cleanup event listener
      window.removeEventListener("popstate", handleBackButton);
    };
  }, []);

  const hideBottomNav = location.pathname.startsWith("/auth");
  return (
    <div className="app">
      {/* <FullOverlay /> */}

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shorts" element={<Shorts />} />
          <Route path="/subs/:mode/:id" element={<Subs />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/logout" element={<Logout />} />

          <Route path="/newpost" element={<NewPost />} />
          <Route path="/post/:id" element={<OpenPost />} />
          <Route path="/user/:id" element={<User />} />
        </Routes>
      </main>
      <ProfileOverlay />

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
