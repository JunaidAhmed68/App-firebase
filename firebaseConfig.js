// Import Firebase services
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup,sendPasswordResetEmail ,sendEmailVerification ,deleteUser,EmailAuthProvider,reauthenticateWithCredential ,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc ,query, where, collection , getDocs ,addDoc,orderBy,updateDoc,serverTimestamp , arrayUnion, writeBatch, deleteDoc,arrayRemove,increment ,limit,onSnapshot} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

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


// -------------------------------------- error handlor -----------------------------------------
 const handleAuthErrors = (error) => {
  console.error("Auth Error:", error); // Log error for debugging

  let message = "Something went wrong. Please try again.";

  switch (error.code) {
    case "auth/invalid-credential":
      message = "Invalid email or password. Please try again.";
      break;
    case "auth/user-disabled":
      message = "This account has been disabled. Contact support.";
      break;
    case "auth/user-not-found":
      message = "No account found with this email.";
      break;
    case "auth/wrong-password":
      message = "Incorrect password. Please try again.";
      break;
    case "auth/too-many-requests":
      message = "Too many failed attempts. Try again later.";
      break;
    case "auth/network-request-failed":
      message = "Network error. Check your internet connection.";
      break;
    case "auth/internal-error":
      message = "An unexpected error occurred. Please try again later.";
      break;
    case "auth/email-already-in-use":
      message = "This email is already registered. Try logging in.";
      break;
    case "auth/invalid-email":
      message = "Invalid email format. Please enter a valid email.";
      break;
    case "auth/weak-password":
      message = "Password should be at least 6 characters.";
      break;
    case "auth/network-request-failed":
      message = "Network error. Check your internet connection.";
      break;
    case "auth/internal-error":
      message = "An unexpected error occurred. Please try again later.";
      break;
    case "auth/popup-closed-by-user":
      message = "Google sign-in popup closed. Try again.";
      break;
    case "auth/cancelled-popup-request":
      message = "Multiple popups detected. Close extra popups and try again.";
      break;
    case "auth/account-exists-with-different-credential":
      message = "An account already exists with this email using a different sign-in method.";
      break;
    case "auth/credential-already-in-use":
      message = "This Google account is already linked to another account.";
      break;
    case "auth/network-request-failed":
      message = "Network error. Check your internet connection.";
      break;
    case "auth/internal-error":
      message = "An unexpected error occurred. Please try again later.";
      break;
    case "auth/invalid-email":
      message = "Invalid email format. Please enter a valid email.";
      break;
    case "auth/user-not-found":
      message = "No account found with this email. Please check and try again.";
      break;
    case "auth/too-many-requests":
      message = "Too many requests! Please try again later.";
      break;
    case "auth/network-request-failed":
      message = "Network error. Please check your internet connection.";
      break;
    case "auth/internal-error":
      message = "An unexpected error occurred. Please try again later.";
      break
    default:
      message = error.message || "An unknown error occurred. Please try again.";
      break;
  }

  showMessage(message);
};


export {
  handleAuthErrors,
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
  sendPasswordResetEmail,
  sendEmailVerification ,
  reauthenticateWithCredential,
  EmailAuthProvider,
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
