import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { Provider } from "react-redux";
import store from "./redux/store";
import { ConfigProvider } from "antd";

createRoot(document.getElementById("root")!).render(
  <ConfigProvider
    theme={{
      token: {
        colorBgElevated: "#000",
        colorText: "#fff",
      },
      components: {
        Button: {
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
