import { UserOverlay } from '@/types';
import React, { createContext, Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react';

type ScrollDirection = 'up' | 'down';

interface UIContextValue {
  scrollDirection: ScrollDirection;
  scrollY: number;
  userOverlay: UserOverlay;
  setScrollState: (direction: ScrollDirection, y: number) => void;
  setHomeReclickHandler: (handler: (() => void) | null) => void;
  setUserOverlay: Dispatch<SetStateAction<UserOverlay>>
  triggerHomeReclick: () => void;
}

export const UIContext = createContext<UIContextValue | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>('up');
  const [scrollY, setScrollY] = useState(0);
  const [homeReclickHandler, setHomeReclickHandlerState] = useState<(() => void) | null>(null);
  const [userOverlay, setUserOverlay] = useState<UserOverlay>({
    show: false,
    userId: null,
  })

  const setScrollState = useCallback((direction: ScrollDirection, y: number) => {
    setScrollDirection(direction);
    setScrollY(y);
  }, []);

  const setHomeReclickHandler = useCallback((handler: (() => void) | null) => {
    setHomeReclickHandlerState(() => handler);
  }, []);

  const triggerHomeReclick = useCallback(() => {
    if (homeReclickHandler) {
      homeReclickHandler();
    }
  }, [homeReclickHandler]);

  const value = useMemo<UIContextValue>(
    () => ({
      scrollDirection,
      scrollY,
      userOverlay,
      setScrollState,
      setHomeReclickHandler,
      setUserOverlay,
      triggerHomeReclick,
    }),
    [
      scrollDirection,
      scrollY,
      userOverlay,
      setScrollState,
      setHomeReclickHandler,
      setUserOverlay,
      triggerHomeReclick,
    ]
  );

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
};


