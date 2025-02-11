
// If UID doesn't exist, redirect to the login page
const uid = localStorage.getItem('uid');
if (!uid) {
  window.location.replace('../../index.html');  // Redirect to the login page
}

// ----------------------------------- logout -----------------------------------
import { auth, signOut , db , collection , getDocs , query,where } from "../../firebaseConfig.js";
document.querySelector("#logout-btn").addEventListener("click", async () => {
  try {
    await signOut(auth);
    localStorage.removeItem("uid");
      window.location.replace('../../index.html');
  } catch (error) {
    alert(error.message);
  }
});




// // If UID doesn't exist, redirect to the login page
// const uid = localStorage.getItem('uid');
// if (!uid) {
//   window.location.replace('../index.html');  // Redirect to the login page
// }
// showMessage("Welcome to the Dashboard!");
// // --------------------------------------- show msg Function ---------------------------------------
// function showMessage(message) {
//   const msgModal = document.getElementById("msg-modal");
//   const msgText = document.getElementById("msg-text");

//   msgText.textContent = message; // Set the message content
//   msgModal.style.display = 'block';  // Show the modal
  
//   // Add the fade animation class for smooth appearance and disappearance
//   msgModal.classList.add("fade");

//   // After 3 seconds, hide the modal again
//   setTimeout(() => {
//     msgModal.style.display = 'none';
//     msgModal.classList.remove("fade");  // Remove animation class for next use
//   }, 3000);  // Hide after 3 seconds
// }

// // ----------------------------------- logout -----------------------------------
// import { auth, signOut , db , collection , getDocs , query,where } from "../../firebaseConfig.js";
// document.querySelector("#logout-btn").addEventListener("click", async () => {
//   try {
//     await signOut(auth);
//     localStorage.removeItem("uid");
//     showMessage("Logged out successfully!");
//     setTimeout(() => {
//       window.location.replace('../index.html');
//     }, 3000);
//   } catch (error) {
//     alert(error.message);
//   }
// });



// async function getTotalUsers() {
//   const usersCollection = collection(db, "users"); // Collection name 'users'
//   const usersSnapshot = await getDocs(usersCollection);
//   document.querySelector("#card-text").innerText= usersSnapshot.size;  // Return the number of documents in the 'users' collection
// }
// await getTotalUsers();










// // Function to fetch filtered users
// const searchUsers = async () => {
//   try {
//     const searchValue = document.getElementById("search-bar").value.trim();
//     const filterType = document.getElementById("filter-options").value;
//     const cardDeck = document.getElementById("card-deck");

//     // Clear previous results
//     cardDeck.innerHTML = "";

//     if (searchValue === "") {
//       console.log("Enter a search value");
//       return;
//     }
//     document.querySelector("#cancel").style.display = "block"; // Show cancel button
//     const usersCollection = collection(db, "users");
//     const q = query(usersCollection, where(filterType, "==", searchValue));
//     const querySnapshot = await getDocs(q);

//     if (querySnapshot.empty) {
//       console.log("No matching users found");
//       cardDeck.innerHTML = `<p class="text-center text-danger">No matching users found</p>`;
//       return;
//     }

//     querySnapshot.forEach((doc) => {
//       let userData = doc.data();

//       // Create card HTML
//       const cardHTML = `
//         <div class="col-md-4 mb-3">
//           <div class="card">
//             <div class="card-body text-center">
//               <img src="${userData.photoURL !== 'No photo' ? userData.photoURL : 'https://t4.ftcdn.net/jpg/02/15/84/43/360_F_215844325_ttX9YiIIyeaR7Ne6EaLLjMAmy4GvPC69.jpg'}" 
//                    alt="User Image" class="rounded-circle" style="width: 80px; height: 80px;">
//               <h5 class="card-title mt-2">${userData.displayName}</h5>
//               <p class="card-text"><strong>Email:</strong> ${userData.email}</p>
//               <p class="card-text"><strong>Phone:</strong> ${userData.phoneNumber}</p>
//               <p class="card-text"><strong>User ID:</strong> ${doc.id}</p>
//               <p class="card-text"><strong>Joined:</strong> ${userData.createdAt ? new Date(userData.createdAt.seconds * 1000).toLocaleDateString() : "N/A"}</p>
//             </div>
//           </div>
//         </div>
//       `;

//       // Append card to the card deck
//       cardDeck.innerHTML += cardHTML;
//     });
//   } catch (error) {
//     console.error("Error fetching users:", error);
//   }
// };

// // Event listener for the search button
// document.getElementById("search-btn").addEventListener("click", searchUsers);
// document.querySelector("#cancel").addEventListener("click", function () {
//   this.style.display = "none"; // Hide on click
//   document.querySelector("#card-deck").innerHTML = ""; // Clear the card deck
// });
