import React, { useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, Grid3X3, Plus, User, Search, X, RotateCw } from "lucide-react";
import styles from "./BottomNavigation.module.css";
import { UIContext } from "../contexts/UIContext";

const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const ui = useContext(UIContext);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshTimerRef = useRef<number | null>(null);

  const hidden = ui?.bottomNavHidden;

  const navItems = [
    { key: "home", path: "/", icon: Home, aria: "Home" },
    { key: "search", path: "/", icon: Search, aria: "Search" },
    { key: "compose", path: "/newpost", icon: Plus, aria: "Create" },
    { key: "shorts", path: "/shorts", icon: Grid3X3, aria: "Shorts" },
    { key: "profile", path: "/profile", icon: User, aria: "Profile" },
  ] as const;

  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        window.clearTimeout(refreshTimerRef.current);
      }
    };
  }, []);

  if (
    [
      "/terms-of-service",
      "/privacy-policy",
      "/edit-profile",
      "/change-password",
      "/logout",
      "/user",
      "/profile",
      "/view-post",
    ].includes(location.pathname)
  )
    return;

  if (ui?.commentsModal.isOpen || ui?.isFullScreen) {
    return;
  }

  return (
    <nav
      className={`${styles.bottomNav} glass-dark ${
        hidden ? styles.hidden : ""
      }`}
    >
      {navItems.map((item) => {
        let IconComponent = item.icon;
        if (ui?.searchOpen && item.key === "search") {
          IconComponent = X;
        }
        if (
          !ui?.searchOpen &&
          item.key === "home" &&
          location.pathname === "/"
        ) {
          IconComponent = RotateCw;
        }
        return (
          <button
            key={item.key}
            className={`${styles.navItem} ${
              "path" in item && item.path && location.pathname === item.path
                ? styles.active
                : ""
            }`}
            onClick={() => {
              if ("action" in item && item.action === "compose") {
                // Reserved for future compose modal
                return;
              }
              if ("path" in item && item.path) {
                if (item.key === "home" && location.pathname === "/") {
                  if (ui?.searchOpen) {
                    ui?.toggleSearchOpen();
                  } else {
                    setIsRefreshing(true);
                    ui?.triggerHomeReclick();
                    if (refreshTimerRef.current) {
                      window.clearTimeout(refreshTimerRef.current);
                    }
                    refreshTimerRef.current = window.setTimeout(() => {
                      setIsRefreshing(false);
                    }, 850);
                  }
                } else if (item.key === "profile") {
                  ui?.toggleProfileOverlay();
                } else {
                  navigate(item.path);
                  if (item.key === "search") {
                    ui?.toggleSearchOpen();
                  } else {
                    if (ui?.searchOpen) {
                      ui?.toggleSearchOpen();
                    }
                  }
                }
              }
            }}
            aria-label={item.aria}
          >
            <IconComponent
              className={`${styles.navIcon} ${
                !ui?.searchOpen &&
                item.key === "home" &&
                location.pathname === "/" &&
                isRefreshing
                  ? styles.rotateOnce
                  : ""
              }`}
              size={22}
            />
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNavigation;
