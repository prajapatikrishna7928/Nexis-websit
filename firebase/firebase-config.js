import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js"; // Auth Module

const firebaseConfig = {
  apiKey: "AIzaSyCWCOsP_WrK4mEmExs0WLjgYFJEKLzLwdE",
  authDomain: "nexis-websit-88408.firebaseapp.com",
  projectId: "nexis-websit-88408",
  storageBucket: "nexis-websit-88408.firebasestorage.app",
  messagingSenderId: "786217232275",
  appId: "1:786217232275:web:291c67b38553fd1ae6aa66",
  measurementId: "G-DTXPX2KDRJ"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app); // Auth Export Kiya
