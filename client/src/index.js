import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Firebase initialization
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAfCyeG-bmBaNCo8mNJWxf79dvjKADJ6GE",
  authDomain: "goodcontent-428917.firebaseapp.com",
  projectId: "goodcontent-428917",
  storageBucket: "goodcontent-428917.appspot.com",
  messagingSenderId: "995017216459",
  appId: "1:995017216459:web:ae6c4d8f57c1a3876fe64e",
  measurementId: "G-0TQNW5JQ46"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
