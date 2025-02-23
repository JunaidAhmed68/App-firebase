// Import Firebase services
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc ,query, where, collection , getDocs ,addDoc,deleteDoc,orderBy,updateDoc,serverTimestamp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// Your Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyA_JDRXPjOxrMbXdK4Wfj8porvBUIrcF9s",
  authDomain: "users-f6a07.firebaseapp.com",
  projectId: "users-f6a07",
  storageBucket: "users-f6a07.firebasestorage.app",
  messagingSenderId: "324825127020",
  appId: "1:324825127020:web:ffa51f41dbf7d37cb66049"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);




//  msg function
function showMessage(message) {
  const msgModal = document.getElementById("msg-modal");
  const msgText = document.getElementById("msg-text");

  msgText.textContent = message; // Set the message content
  msgModal.style.display = 'block';  // Show the modal

  // Add the fade animation class for smooth appearance and disappearance
  msgModal.classList.add("fade");

  // After 3 seconds, hide the modal again
  setTimeout(() => {
    msgModal.style.display = 'none';
    msgModal.classList.remove("fade");  // Remove animation class for next use
  }, 3000);  // Hide after 3 seconds
}





export {
  createUserWithEmailAndPassword,
  deleteUser ,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
   arrayUnion,
    writeBatch,
  signOut,
  query,
  where,
  getDocs,
  signInWithPopup,
  doc,
  showMessage,
  setDoc,
  getDoc,
  addDoc,
  collection,
  getFirestore,
  arrayRemove,
  auth,
  db,
  getAuth,
  orderBy,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  onAuthStateChanged,
  increment,
  limit,
  onSnapshot
};
