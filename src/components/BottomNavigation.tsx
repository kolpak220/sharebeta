import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, Grid3X3, Plus, User, Search, X } from "lucide-react";
import styles from "./BottomNavigation.module.css";
import { UIContext } from "../contexts/UIContext";

const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [hidden, setHidden] = useState(false);
  const ui = useContext(UIContext);

  const navItems = [
    { key: "home", path: "/", icon: Home, aria: "Home" },
    { key: "search", path: "/", icon: Search, aria: "Search" },
    { key: "compose", path: "/newpost", icon: Plus, aria: "Create" },
    { key: "shorts", path: "/shorts", icon: Grid3X3, aria: "Shorts" },
    { key: "profile", path: "/profile", icon: User, aria: "Profile" },
  ] as const;

  useEffect(() => {
    setHidden(ui?.scrollDirection === "down" && (ui?.scrollY ?? 0) > 10);
  }, [ui?.scrollDirection, ui?.scrollY]);

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
                    ui?.triggerHomeReclick();
                  }
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
            <IconComponent className={styles.navIcon} size={22} />
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNavigation;
