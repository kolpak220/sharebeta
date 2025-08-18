import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Grid3X3, Plus } from 'lucide-react';
import styles from './BottomNavigation.module.css';
import { UIContext } from '../contexts/UIContext';

const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [hidden, setHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const ui = useContext(UIContext);

  const navItems = [
    { key: 'home', path: '/', icon: Home, aria: 'Home' },
    { key: 'compose', action: 'compose', icon: Plus, aria: 'Create' },
    { key: 'shorts', path: '/shorts', icon: Grid3X3, aria: 'Shorts' }
  ] as const;

  useEffect(() => {
    setHidden((ui?.scrollDirection === 'down') && (ui?.scrollY ?? 0) > 20);
  }, [ui?.scrollDirection, ui?.scrollY]);

  return (
    <nav
      className={`${styles.bottomNav} glass-dark ${
        (hidden ? styles.hidden : "") ||
        (ui?.userOverlay.show ? styles.hidden : "")
      }`}
    >
      {navItems.map((item) => {
        const IconComponent = item.icon;
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
                if (item.path === "/" && location.pathname === "/") {
                  ui?.triggerHomeReclick();
                } else {
                  navigate(item.path);
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
