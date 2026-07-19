// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Nexis Infinity Firebase Configuration
// (भविष्य में जब आप Firebase Console से प्रोजेक्ट बनाएंगे, तो ये चाबियां वहाँ से बदल सकते हैं)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_PLACEHOLDER",
  authDomain: "nexis-infinity.firebaseapp.com",
  projectId: "nexis-infinity",
  storageBucket: "nexis-infinity.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:12345678:web:abcdef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
