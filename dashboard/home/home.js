// If UID doesn't exist, redirect to the login page
const uid = localStorage.getItem('uid');
if (!uid) {
  window.location.replace('../../index.html');  // Redirect to the login page
}
// import { showMessage } from "../../app.js";
// showMessage("Welcome to the Dashboard!");

// ----------------------------------- logout -----------------------------------
import { auth, signOut , db , collection ,getDoc, getDocs , query,where ,orderBy, showMessage,setDoc, doc, updateDoc, arrayUnion, arrayRemove ,onSnapshot} from "../../firebaseConfig.js";
document.querySelector("#logout-btn").addEventListener("click", async () => {
  try {
    await signOut(auth);
    localStorage.removeItem("uid");
      window.location.replace('../../index.html');
  } catch (error) {
    alert(error.message);
  }
});



<<<<<<< HEAD
=======

>>>>>>> 3b49891 (updated search UI)
// Function to fetch filtered users
const searchUsers = async () => {
  try {
    const searchValue = document.getElementById("search-bar").value;
    const filterType = document.getElementById("filter-options").value;
    const cardDeck = document.getElementById("card-deck");
    document.querySelector("#all-posts-home").style.display = "none"; 

    // Clear previous results
    cardDeck.innerHTML = "";

    if (searchValue === "") {
      showMessage("Enter a search value");
      return;
    }
    
    document.querySelector("#cancel").style.display = "block"; // Show cancel button
    document.querySelector("#search-ppls").style.display = "block"; 

    const currentUserUID = localStorage.getItem("uid"); // Get current user's UID
    const usersCollection = collection(db, "users");
    const q = query(usersCollection, where(filterType, "==", searchValue));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      showMessage("No matching users found");
      cardDeck.innerHTML = `<p class="text-center text-danger">No matching users found</p>`;
      return;
    }

    querySnapshot.forEach(async (doc) => {
      let userData = doc.data();
<<<<<<< HEAD
      let userId = doc.id;
      let buttonText = "Add Friend"; // Default button text
      let buttonClass = "friend-request-btn"; // Default button class
      let buttonDisabled = false;

      if (userId === currentUserUID) {
        return; // Skip showing the current user
      }

      // Check if the user is already a friend
      const userSnapshot = await getDocs(query(collection(db, "users"), where("uid", "==", currentUserUID)));

      if (!userSnapshot.empty) {
        const currentUserData = userSnapshot.docs[0].data();
        if (currentUserData.friends && currentUserData.friends.includes(userId)) {
          buttonText = "Remove Friend";
          buttonClass = "remove-friend-btn";
        }
      }

      // Check if a friend request is pending
      const requestQuery = query(
        collection(db, "friendRequests"),
        where("senderId", "==", currentUserUID),
        where("receiverId", "==", userId),
        where("status", "==", "pending")
      );
      const requestSnapshot = await getDocs(requestQuery);

      if (!requestSnapshot.empty) {
        buttonText = "Pending";
        buttonClass = "pending-request-btn";
        buttonDisabled = true;
      }

      // Create card HTML (Fixed)
      const cardHTML = `
        <div class="search-item">
          <div>
            <img src="${userData.photoURL !== 'No photo' ? userData.photoURL : 'https://t4.ftcdn.net/jpg/02/15/84/43/360_F_215844325_ttX9YiIIyeaR7Ne6EaLLjMAmy4GvPC69.jpg'}" id="imgF-${userData.uid}" alt="User Image">
            <span class="username" id="nameF-${userData.uid}">${userData.displayName}</span>
          </div>
          <button class="${buttonClass}" id="btn-${userId}" ${buttonDisabled ? "disabled" : ""}>
            ${buttonText}
          </button>
        </div>
=======
 // <button class="friend-request-btn" onclick="sendFriendRequest('${currentUserUID}', '${doc.id}')">Add Friend</button>
      // Create card HTML
      const cardHTML = `
      <div class="search-item">
      <div>
      <img src="${userData.photoURL !== 'No photo' ? userData.photoURL : 'https://t4.ftcdn.net/jpg/02/15/84/43/360_F_215844325_ttX9YiIIyeaR7Ne6EaLLjMAmy4GvPC69.jpg'}" alt="User Image">
      <span class="username">${userData.displayName}</span>
      </div>
      <button class="friend-request-btn">Add Friend</button>
      </div>
>>>>>>> 3b49891 (updated search UI)
      `;

      // Append card to the card deck
      cardDeck.innerHTML += cardHTML;

      // Add event listener to open profile
      setTimeout(() => {
        document.getElementById(`imgF-${userData.uid}`).addEventListener("click", () => {
          localStorage.removeItem("friendId"); 
          localStorage.setItem("friendId", userData.uid);
            window.location.href = '../Open Profile/OpenProfile.html';
        });
        document.getElementById(`nameF-${userData.uid}`).addEventListener("click", () => {
          localStorage.removeItem("friendId"); 
          localStorage.setItem("friendId", userData.uid);
            window.location.href = '../Open Profile/OpenProfile.html';
        });
    }, 0);

      // Add event listener for friend request button
      document.getElementById(`btn-${userId}`).addEventListener("click", () => {
        if (buttonText === "Remove Friend") {
          openRemoveFriendModal(userId);
        } else {
          sendFriendRequest(userId);
        }
      });
    });
  } catch (error) {
    console.error("Error fetching users:", error);
  }
};



// Event listener for the search button
document.getElementById("search-btn").addEventListener("click", searchUsers);
document.querySelector("#cancel").addEventListener("click", function () {
  document.querySelector("#all-posts-home").style.display = "block"; 
  this.style.display = "none"; // Hide on click
  document.querySelector("#search-ppls").style.display = "none"; 
  document.querySelector("#card-deck").innerHTML = ""; // Clear the card deck
});



// Store all user data in memory
 let usersCache = {};

// Fetch all users initially and store in memory
 const fetchAllUsers = async () => {
  try {
    const usersCollection = collection(db, "users");
    const usersSnapshot = await getDocs(usersCollection);

    usersSnapshot.forEach((doc) => {
      usersCache[doc.id] = doc.data();
    });

    console.log("User cache loaded:", usersCache);
  } catch (error) {
    console.error("Error fetching all users:", error);
  }
};

// Function to get user data from cache
 const getUserDataFromObj = (uid) => {
  if (!uid || !usersCache[uid]) {
    return { displayName: "Unknown User", userProfileImage: "https://t4.ftcdn.net/jpg/02/15/84/43/360_F_215844325_ttX9YiIIyeaR7Ne6EaLLjMAmy4GvPC69.jpg" };
  }

    return {
    displayName: usersCache[uid].displayName || "Unknown User",
    userProfileImage: usersCache[uid].photoURL || "https://t4.ftcdn.net/jpg/02/15/84/43/360_F_215844325_ttX9YiIIyeaR7Ne6EaLLjMAmy4GvPC69.jpg",
    Id: usersCache[uid].uid || "Unknown ID",
  };
};




<<<<<<< HEAD
// Function to get all posts in real-time
const getAllPosts = () => {
  try {
    // Query posts ordered by 'createdAt' field in descending order
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    
    // Listen for real-time updates
    onSnapshot(q, (snapshot) => {
      const allPostDiv = document.getElementById("post-deck");
      allPostDiv.innerHTML = ""; // Clear existing posts
      
      snapshot.docs.forEach((postDoc) => {
        const postData = postDoc.data();
=======
// Function to get all posts
const getAllPosts = async () => {
  try {
    // Order posts by 'createdAt' field in descending order (newest first)
    const q = query(collection(db, "posts"),orderBy("createdAt", "desc"))
    const postsSnapshot = await getDocs(q);
    const allPostDiv = document.getElementById("post-deck");
>>>>>>> 3b49891 (updated search UI)

        // Convert Firestore Timestamp to JS Date
        let createdAt = "Unknown date";
        if (postData.createdAt?.toDate) {
          createdAt = postData.createdAt.toDate().toLocaleString(); // Include date and time
        }

        // **Get user data from cache**
        const userData = getUserDataFromObj(postData.uid);
        const displayName = userData.displayName;
        const opnID = userData.Id;
        const userProfileImage = userData.userProfileImage;

<<<<<<< HEAD
        // Create a new post card element
        const postCard = document.createElement("div");
        postCard.className = "d-flex justify-content-center my-3";
=======
      // Convert Firestore Timestamp to JS Date
      let createdAt = "Unknown date";
      if (postData.createdAt?.toDate) {
        createdAt = postData.createdAt.toDate().toLocaleString(); // Include date and time
      }
>>>>>>> 3b49891 (updated search UI)

        postCard.innerHTML = `
          <div class="card shadow-sm" style="width: 800px;"> 
            <div class="card-body">
              <div class="d-flex align-items-center mb-2">
                <img src="${userProfileImage || 'https://t4.ftcdn.net/jpg/02/15/84/43/360_F_215844325_ttX9YiIIyeaR7Ne6EaLLjMAmy4GvPC69.jpg'}" id="imgFO-${opnID}" 
                  alt="User Image" class="rounded-circle" style="width: 40px; height: 40px; margin-right:10px">
                <h5 class="card-title mb-0" id="nameFO-${opnID}">${displayName}</h5>
              </div>
              <p class="card-text">${postData.text || 'No description available.'}</p>
              <p class="text-muted" style="font-size: 12px;">Posted on: ${createdAt}</p>
            </div>
          </div>
        `;

        // Append the post card to the post deck
        allPostDiv.appendChild(postCard);

        // Add event listeners for opening profiles
        setTimeout(() => {
          document.getElementById(`imgFO-${opnID}`).addEventListener("click", () => {
            localStorage.removeItem("friendId"); 
            localStorage.setItem("friendId", opnID);
              window.location.href = '../Open Profile/OpenProfile.html';
          });
          document.getElementById(`nameFO-${opnID}`).addEventListener("click", () => {
            localStorage.removeItem("friendId"); 
            localStorage.setItem("friendId", opnID);
              window.location.href = '../Open Profile/OpenProfile.html';
          });
      }, 0);

  
      });
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
  }
};



// Fetch all users and then load posts
fetchAllUsers().then(() => {
  getAllPosts(); // Load posts with cached user data
});
