// If UID doesn't exist, redirect to the login page
const uid = localStorage.getItem('uid');
if (!uid) {
  window.location.replace('../../index.html');  // Redirect to the login page
}
// import { showMessage } from "../../app.js";
// showMessage("Welcome to the Dashboard!");

// ----------------------------------- logout -----------------------------------
import { auth, signOut , db , collection ,getDoc,doc, getDocs , query,where ,orderBy, showMessage,setDoc} from "../../firebaseConfig.js";
document.querySelector("#logout-btn").addEventListener("click", async () => {
  try {
    await signOut(auth);
    localStorage.removeItem("uid");
      window.location.replace('../../index.html');
  } catch (error) {
    alert(error.message);
  }
});


// Function to send a friend request
window.sendFriendRequest = async function(receiverId) {
  const senderId = localStorage.getItem('uid'); // Get the current user's ID

  if (!senderId) {
      alert("You need to be logged in to send friend requests.");
      return;
  }

  try {
      // Create a unique ID for the friend request
      const requestId = `${senderId}_${receiverId}_${Date.now()}`; // Unique ID based sender, receiver, and timestamp

      // Add a new friend request document
        // Set the friend request document
        await setDoc(doc(db, "friendRequests", requestId), {
          senderId: senderId,
          receiverId: receiverId,
          status: 'pending', // Status can be 'pending', 'accepted', or 'rejected'
          createdAt: new Date() // Timestamp for when the request was sent
      });

      showMessage("Friend request sent successfully!");
  } catch (error) {
      console.error("Error sending friend request: ", error);
      showMessage("Error sending friend request. Please try again.");
  }
};

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
      console.log("Enter a search value");
      return;
    }
    document.querySelector("#cancel").style.display = "block"; // Show cancel button
    document.querySelector("#search-ppls").style.display = "block"; 

    const usersCollection = collection(db, "users");
    const q = query(usersCollection, where(filterType, "==", searchValue));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      showMessage("No matching users found");
      cardDeck.innerHTML = `<p class="text-center text-danger">No matching users found</p>`;
      return;
    }

    querySnapshot.forEach((doc) => {
      let userData = doc.data();
 // <button class="friend-request-btn" onclick="sendFriendRequest('${currentUserUID}', '${doc.id}')">Add Friend</button>
      // Create card HTML
      const cardHTML = `
      <div class="search-item">
      <div>
      <img src="${userData.photoURL !== 'No photo' ? userData.photoURL : 'https://t4.ftcdn.net/jpg/02/15/84/43/360_F_215844325_ttX9YiIIyeaR7Ne6EaLLjMAmy4GvPC69.jpg'}" alt="User Image">
      <span class="username">${userData.displayName}</span>
      </div>
      <button class="friend-request-btn" onclick="sendFriendRequest('${doc.id}')">Add Friend</button>
      </div>
      `;

      // Append card to the card deck
      cardDeck.innerHTML += cardHTML;
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
  };
};




// Function to get all posts
const getAllPosts = async () => {
  try {
    // Order posts by 'createdAt' field in descending order (newest first)
    const q = query(collection(db, "posts"),orderBy("createdAt", "desc"))
    const postsSnapshot = await getDocs(q);
    const allPostDiv = document.getElementById("post-deck");

    // Clear existing posts
    allPostDiv.innerHTML = "";

    for (const postDoc of postsSnapshot.docs) {
      const postData = postDoc.data();

      // Convert Firestore Timestamp to JS Date
      let createdAt = "Unknown date";
      if (postData.createdAt?.toDate) {
        createdAt = postData.createdAt.toDate().toLocaleString(); // Include date and time
      }

      // **Get user data from cache**
      const userData = getUserDataFromObj(postData.uid);
      const displayName = userData.displayName;
      const userProfileImage = userData.userProfileImage;

      // Create a new post card element
      const postCard = document.createElement("div");
      postCard.className = "d-flex justify-content-center my-3";

      postCard.innerHTML = `
        <div class="card shadow-sm" style="width: 800px;"> 
          <div class="card-body">
            <div class="d-flex align-items-center mb-2">
            <img src="${userProfileImage ? userProfileImage : 'https://t4.ftcdn.net/jpg/02/15/84/43/360_F_215844325_ttX9YiIIyeaR7Ne6EaLLjMAmy4GvPC69.jpg'}" 
             alt="User Image" class="rounded-circle" style="width: 40px; height: 40px; margin-right:10px">
              <h5 class="card-title mb-0">${displayName}</h5>
            </div>
            <p class="card-text">${postData.text || 'No description available.'}</p>
            <p class="text-muted" style="font-size: 12px;">Posted on: ${createdAt}</p>
          </div>
        </div>
      `;

      // Append the post card to the post deck
      allPostDiv.appendChild(postCard);
    }
  } catch (error) {
    console.error("Error fetching posts:", error);
  }
};

// Fetch all users and then load posts
fetchAllUsers().then(() => {
  getAllPosts(); // Load posts with cached user data
});
