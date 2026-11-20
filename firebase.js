
// ============================================
// CEYLON CRUST PIZZA
// NEW FIREBASE CONNECTION
// ============================================

// FIREBASE APP
import { initializeApp } from
  "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";

// FIRESTORE
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp
} from
  "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";

// AUTHENTICATION
import {
  getAuth,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  onAuthStateChanged
} from
  "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

// ============================================
// NEW FIREBASE CONFIGURATION
// ============================================

const firebaseConfig = {
  apiKey: "AIzaSyCiSTF2wkYTdM8raL0TnQBTQPNiTqfJw6Y",
  authDomain: "ceylon-crust-order-new-4.firebaseapp.com",
  projectId: "ceylon-crust-order-new-4",
  storageBucket: "ceylon-crust-order-new-4.firebasestorage.app",
  messagingSenderId: "780548601176",
  appId: "1:780548601176:web:09e84cddcc86361b82212d"
};

// ============================================
// INITIALIZE FIREBASE
// ============================================

const app = initializeApp(firebaseConfig);

// FIRESTORE DATABASE
const db = getFirestore(app);

// AUTHENTICATION
const auth = getAuth(app);

// ============================================
// EXPORT FUNCTIONS
// ============================================

export {
  app,
  db,
  auth,

  // Firestore
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,

  // Authentication
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  onAuthStateChanged
};

console.log("Ceylon Crust Pizza: New Firebase Connected!");
