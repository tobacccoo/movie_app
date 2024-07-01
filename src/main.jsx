import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.scss";
import { store } from "./store/store.js";
import { Provider } from "react-redux";

ReactDOM.createRoot(document.getElementById("root")).render(
  // Provider is a component that redux provides us so that we can warp
  // our app component inside it so that we can use redux store anywhere
  // in our app.
  <Provider store={store}>
    <App />
  </Provider>
);
