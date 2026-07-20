// Firebase JS SDK Modules (CDN links for Web App)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// [NEW CONFIGURATION] Nexis-Websit-88408 Official Keys
const firebaseConfig = {
  apiKey: "AIzaSyCWCOsP_WrK4mEmExs0WLjgYFJEKLzLwdE",
  authDomain: "nexis-websit-88408.firebaseapp.com",
  projectId: "nexis-websit-88408",
  storageBucket: "nexis-websit-88408.firebasestorage.app",
  messagingSenderId: "786217232275",
  appId: "1:786217232275:web:291c67b38553fd1ae6aa66",
  measurementId: "G-DTXPX2KDRJ"
};

// Initialize Firebase App Instance
const app = initializeApp(firebaseConfig);

// Initialize & Export Firestore Database Engine
const db = getFirestore(app);
export { db };
