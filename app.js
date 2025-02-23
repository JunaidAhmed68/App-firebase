// If UID exists, redirect to the dashboard
const uid = localStorage.getItem('uid');
if (uid) {
  window.location.replace('./dashboard/home/home.html');  // Redirect to the dashboard
}
// // -----------------------------------------------------------------
import { auth } from './firebaseConfig.js';
import {db} from './firebaseConfig.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup , setDoc , doc} from "./firebaseConfig.js";

// --------------------------------------- AddData ---------------------------------------

let addUserData = async (user ,fullName ,phoneNumber ) => {
  try {
    const docRef = await setDoc(doc(db, "users", user.uid), {
      email: user.email,          // User's email
      uid: user.uid,              // User's UID
      displayName: fullName || user.displayName || 'No display name',  // User's display name
      photoURL: user.photoURL || 'https://t4.ftcdn.net/jpg/02/15/84/43/360_F_215844325_ttX9YiIIyeaR7Ne6EaLLjMAmy4GvPC69.jpg',      // User's profile photo URL (optional)
      phoneNumber: phoneNumber|| user.phoneNumber || 'No phone number', // User's phone number (optional)
      createdAt: new Date(),      // Timestamp when the user was created
    });
  } catch (e) {
    console.error("Error adding user data: ", e);
  }
};




// --------------------------------------- Signup ---------------------------------------
document.querySelector("#signup-btn").addEventListener("click", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const fullName = document.getElementById("fullName").value;
  const phoneNumber = document.getElementById("phoneNumber").value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Send verification email
    await sendEmailVerification(user);
    showMessage("Verification email sent! Please check your inbox.");

    // Add user data to Firestore
    await addUserData(user, fullName, phoneNumber);
    
    // Optionally, you can redirect to a "check your email" page
    window.location.replace('./check-email/check_email.html'); // Change to your desired path
  } catch (error) {
    handleAuthErrors(error);
  }
});



// --------------------------------------- login ---------------------------------------
document.querySelector("#login-btn").addEventListener("click", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Check if the user's email is verified
    if (!user.emailVerified) {
      showMessage("Please verify your email before logging in.");
      return; // Stop execution if email is not verified
    }

    // Add user data to Firestore
    await addUserData(user);

    localStorage.setItem("uid", user.uid);
    window.location.replace('./dashboard/home/home.html');
  } catch (error) {
    handleAuthErrors(error);
  }
});







// --------------------------------------- Signup with google ---------------------------------------

document.querySelector("#google-signUp").addEventListener("click", async () => {
  const provider = new GoogleAuthProvider();

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Add user data to Firestore
    await addUserData(user);
    localStorage.setItem("uid", user.uid);
    window.location.replace('./dashboard/home/home.html');
  } catch (error) {
    alert(error.message);
  }
});


// --------------------------------------- show msg Function ---------------------------------------
export function showMessage(message) {
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