import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { Provider } from "react-redux";
import store from "./redux/store";
import { ConfigProvider } from "antd";

// Prevent zooming: pinch, double-tap, and ctrl+wheel (desktop & mobile)
(() => {
  if (typeof window === "undefined") return;

  // Block pinch-zoom
  window.addEventListener(
    "touchmove",
    (event) => {
      if ((event as TouchEvent).scale && (event as TouchEvent).scale !== 1) {
        event.preventDefault();
      }
    },
    { passive: false }
  );

  // Block double-tap zoom
  let lastTouchEnd = 0;
  window.addEventListener(
    "touchend",
    (event) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    },
    { passive: false }
  );

  // Block ctrl + wheel zoom (desktop browsers)
  window.addEventListener(
    "wheel",
    (event) => {
      if ((event as WheelEvent).ctrlKey) {
        event.preventDefault();
      }
    },
    { passive: false }
  );

  // iOS: prevent gesturestart zoom
  window.addEventListener(
    "gesturestart",
    (event) => {
      event.preventDefault();
    },
    { passive: false as unknown as AddEventListenerOptions }
  );
})();

createRoot(document.getElementById("root")!).render(
  <ConfigProvider
    theme={{
      token: {
        colorBgElevated: "#000",
        colorText: "#fff",
      },
      components: {
        Button: {
          colorPrimaryBg: "#fff",
          colorText: "#000",
        },
      },
    }}
  >
    <Provider store={store}>
      <StrictMode>
        <App />
      </StrictMode>
    </Provider>
  </ConfigProvider>
);
