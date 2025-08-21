import { UserOverlay } from "@/types";
import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";

type ScrollDirection = "up" | "down";

interface UIContextValue {
  scrollDirection: ScrollDirection;
  scrollY: number;
  userOverlay: UserOverlay;
  setScrollState: (direction: ScrollDirection, y: number) => void;
  setHomeReclickHandler: (handler: (() => void) | null) => void;
  setUserOverlay: Dispatch<SetStateAction<UserOverlay>>;
  triggerHomeReclick: () => void;
  isFullScreen: boolean;
  toggleFullScreen: () => void;
  searchOpen: boolean;
  searchValue: string;
  toggleSearchOpen: () => void;
  setSearch: (value: string) => void;
}

export const UIContext = createContext<UIContextValue | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>("up");
  const [scrollY, setScrollY] = useState(0);
  const [homeReclickHandler, setHomeReclickHandlerState] = useState<
    (() => void) | null
  >(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const setScrollState = useCallback(
    (direction: ScrollDirection, y: number) => {
      setScrollDirection(direction);
      setScrollY(y);
    },
    []
  );
  const [userOverlay, setUserOverlay] = useState<UserOverlay>({
    show: false,
    userId: null,
  });

  const setHomeReclickHandler = useCallback((handler: (() => void) | null) => {
    setHomeReclickHandlerState(() => handler);
  }, []);

  const triggerHomeReclick = useCallback(() => {
    if (homeReclickHandler) {
      homeReclickHandler();
    }
  }, [homeReclickHandler]);
  const toggleFullScreen = () => {

    setIsFullScreen((prev) => !prev);
  };

  const toggleSearchOpen = () => {
    setSearchOpen((prev) => !prev);
  };
  const setSearch = (value: string) => {
    setSearchValue(value);
  };

  const value = useMemo<UIContextValue>(
    () => ({
      scrollDirection,
      scrollY,
      setScrollState,
      setHomeReclickHandler,
      triggerHomeReclick,
      isFullScreen,
      toggleFullScreen,
      searchOpen,
      searchValue,
      toggleSearchOpen,
      setSearch,
      userOverlay,
      setUserOverlay,
    }),
    [
      userOverlay,
      setUserOverlay,
      scrollDirection,
      scrollY,
      setScrollState,
      setHomeReclickHandler,
      triggerHomeReclick,
      isFullScreen,
      toggleFullScreen,
      searchOpen,
      searchValue,
      toggleSearchOpen,
      setSearch,
    ]
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};
