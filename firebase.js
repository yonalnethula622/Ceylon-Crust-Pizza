
// ============================================
// CEYLON CRUST ORDER
// FIREBASE CONFIGURATION
// ============================================

// FIREBASE APP
import { initializeApp } from
  "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";

// FIRESTORE DATABASE
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

// FIREBASE AUTHENTICATION
import {
  getAuth,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  onAuthStateChanged
} from
  "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";


// ============================================
// FIREBASE CONFIGURATION
// ============================================

const firebaseConfig = {
  apiKey: "AIzaSyDdkQBV6MzSdwpp0icpBRzm_uADWAK9Nwo",
  authDomain: "ceylon-crust-order.firebaseapp.com",
  projectId: "ceylon-crust-order",
  storageBucket: "ceylon-crust-order.firebasestorage.app",
  messagingSenderId: "401112865099",
  appId: "1:401112865099:web:cf680e2d7d3de887b770ce"
};


// ============================================
// INITIALIZE FIREBASE
// ============================================

const app = initializeApp(firebaseConfig);


// ============================================
// FIRESTORE DATABASE
// ============================================

const db = getFirestore(app);


// ============================================
// AUTHENTICATION
// ============================================

const auth = getAuth(app);


// ============================================
// EXPORT EVERYTHING
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

console.log("Ceylon Crust Firebase Connected");
