// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBGrno4fYlm_27Uw_DCk5kanLiohHdFRDA",
  authDomain: "prototype-pillai-1.firebaseapp.com",
  projectId: "prototype-pillai-1",
  storageBucket: "prototype-pillai-1.firebasestorage.app",
  messagingSenderId: "868099787759",
  appId: "1:868099787759:web:e459bd5e0fb2504c5c041a",
  measurementId: "G-6WX33NQYGX",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
