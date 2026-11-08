import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

import "@fontsource/tajawal/400.css";
import "@fontsource/tajawal/500.css";
import "@fontsource/tajawal/700.css";
import "@fontsource/tajawal/800.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource/cormorant-garamond/700.css";
import "@fontsource/jost/600.css";

import "./styles/global.scss";
import "./styles/rtl.scss";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
