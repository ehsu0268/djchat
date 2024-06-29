//import React from 'react'
import { createRoot } from "react-dom/client";
import * as React from "react";
//import * as ReactDOM from "react-dom";

import "./theme/main.css";

import App from "./App";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
