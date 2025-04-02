import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Provider } from "react-redux";
import { store } from "./state/store"; // ✅ adjust path if needed

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(

  <Provider store={store}> {/* ✅ Wrap with Redux provider */}
    <App />
  </Provider>

);
