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

    // Add user data to Firestore
    localStorage.setItem("uid", user.uid);
    await addUserData(user, fullName, phoneNumber).then(() => {
      window.location.replace('./dashboard/home/home.html');
    });
  } catch (error) {
    alert(error.message);
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

    // Add user data to Firestore
    await addUserData(user);

    localStorage.setItem("uid", user.uid);
    window.location.replace('./dashboard/home/home.html');
    } catch (error) {
    alert(error.message);
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
