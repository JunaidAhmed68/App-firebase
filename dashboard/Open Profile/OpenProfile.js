// If UID doesn't exist, redirect to the login page
const uid_f = localStorage.getItem('friendId');
const uid = localStorage.getItem('uid');
if (!uid) {
  window.location.replace('../../index.html');  // Redirect to the login page
}


// ----------------------------------- imprts -----------------------------------
import { auth, signOut , db , collection ,orderBy, getDocs , query,where ,deleteDoc ,doc ,updateDoc,getDoc,  serverTimestamp,showMessage, setDoc,arrayRemove ,writeBatch,arrayUnion,onSnapshot
} from "../../firebaseConfig.js";



// Function to check if friend exists in user's friend list
async function checkFriendStatus(){

  if (!uid || !uid_f) return;

  try {
    if (uid==uid_f) {
        document.getElementById("send-req-btn").style.display = "none";
        document.getElementById("remove-frnd-btn").style.display = "none";
        document.getElementById("send-req-btn-pending").style.display = "none";
        document.getElementById("accept-remove-req-btns").style.display = "none";
        return;
       }
      

       const q = query(collection(db, "friendRequests"), where("receiverId", "==", uid),where ("senderId", "==", uid_f), where("status", "==", "pending"));
       const requestSnapshoT = await getDocs(q);
       
      if (!requestSnapshoT.empty) {
        document.getElementById("send-req-btn").style.display = "none";
        document.getElementById("remove-frnd-btn").style.display = "none";
        document.getElementById("send-req-btn-pending").style.display = "none";
        document.getElementById("send-req-text").style.display = "block";
        document.getElementById("accept-remove-req-btns").style.display = "flex";
        return;
      }






      // Check if my friend request is pending
      const requestQuery = query(
        collection(db, "friendRequests"),
        where("senderId", "==", uid),
        where("receiverId", "==", uid_f),
        where("status", "==", "pending")
      );
      const requestSnapshot = await getDocs(requestQuery);

      if (!requestSnapshot.empty) {
        document.getElementById("send-req-btn").style.display = "none";
        document.getElementById("remove-frnd-btn").style.display = "none";
        document.getElementById("accept-remove-req-btns").style.display = "none";
        document.getElementById("send-req-btn-pending").style.display = "block";
        return;
      }


      // Fetch current user data
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
          const userData = userSnap.data();
          const friendsArray = userData.friends || []; // Ensure it's an array
          
          // Check if friendId exists in the friends array
          if (friendsArray.includes(uid_f)) {
            document.getElementById("accept-remove-req-btns").style.display = "none";
            document.getElementById("send-req-btn").style.display = "none";
            document.getElementById("send-req-text").style.display = "none";
            document.getElementById("remove-frnd-btn").style.display = "block";
          } else {
            document.getElementById("accept-remove-req-btns").style.display = "none";
            document.getElementById("send-req-text").style.display = "none";
            document.getElementById("send-req-btn").style.display = "block";
            document.getElementById("remove-frnd-btn").style.display = "none";
            
          }
        }
  } catch (error) {
      console.error("Error checking friend status:", error);
  }
}

// Call the function on page load
checkFriendStatus();








// Accept Friend Request
async function acceptFriendRequest() {
  try {
      const requestQuery = query(
          collection(db, "friendRequests"),
          where("receiverId", "==", uid), // You are the receiver
          where("senderId", "==", uid_f), // Friend is the sender
          where("status", "==", "pending")
      );

      const requestSnapshot = await getDocs(requestQuery);

      if (requestSnapshot.empty) {
          showMessage("No pending request found.");
          return;
      }

      const requestDoc = requestSnapshot.docs[0]; // Get the first matching request
      const requestId = requestDoc.id; // Get the correct request ID

      const userRef = doc(db, "users", uid);
      const senderRef = doc(db, "users", uid_f);
      const requestRef = doc(db, "friendRequests", requestId);

      const batch = writeBatch(db);
      batch.update(userRef, { friends: arrayUnion(uid_f) });
      batch.update(senderRef, { friends: arrayUnion(uid) });
      batch.delete(requestRef);

      await batch.commit();
      showMessage("Friend request accepted!");
      checkFriendStatus(); // Refresh the UI
      getFriendsCount(); // Update friend count
  } catch (error) {
      console.error("Error accepting friend request:", error);
      showMessage("Error accepting friend request.");
  }
}


// Reject Friend Request
async function rejectFriendRequest() {
  try {
      const requestQuery = query(
          collection(db, "friendRequests"),
          where("receiverId", "==", uid),
          where("senderId", "==", uid_f),
          where("status", "==", "pending")
      );

      const requestSnapshot = await getDocs(requestQuery);

      if (requestSnapshot.empty) {
          showMessage("No pending request found.");
          return;
      }

      const requestDoc = requestSnapshot.docs[0]; // Get the first matching request
      const requestId = requestDoc.id; // Get the correct request ID

      await deleteDoc(doc(db, "friendRequests", requestId));

      showMessage("Friend request rejected.");
      checkFriendStatus(); // Refresh the UI
  } catch (error) {
      console.error("Error rejecting friend request:", error);
      showMessage("Error rejecting friend request.");
  }
}



document.getElementById("accept-req-btn").addEventListener("click", async () => {
  await acceptFriendRequest();
});

document.getElementById("remove-req-btn").addEventListener("click", async () => {
  await rejectFriendRequest();
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
      checkFriendStatus(); // Refresh the friend status
    } catch (error) {
      console.error("Error sending friend request: ", error);
      showMessage("Error sending friend request. Please try again.");
    }
  };


  // ---------------------- remove friend -----------------------------------------
window.removeFriend = async function (friendId) {
    const currentUserUID = localStorage.getItem("uid");
    closeRemoveFriendModal(); // Close the modal after deletion
    if (!currentUserUID) return;
    
    try {
      const userRef = doc(db, "users", currentUserUID);
      const friendRef = doc(db, "users", friendId);
  
      await updateDoc(userRef, {
        friends: arrayRemove(friendId)
      });
  
      await updateDoc(friendRef, {
        friends: arrayRemove(currentUserUID)
      });
  
      showMessage("Friend removed successfully.");
      checkFriendStatus(); // Refresh the friend status
      getFriendsCount(); // Refresh the friends count
    } catch (error) {
      console.error("Error removing friend:", error);
    }
  }
let currentRemoveId_del=''; // Variable to store the current post ID
// Function to open the delete confirmation modal
window.openRemoveFriendModal = (receiverId) => {
  currentRemoveId_del = receiverId; // Store the
  document.getElementById("removeFriendModal").style.display = "block"; // Show the modal
  document.querySelector("#closeRemoveFriendModal").addEventListener("click", closeRemoveFriendModal); // Close the modal if close button is clicked
  document.querySelector("#cancelRemoveFriendBtn").addEventListener("click", closeRemoveFriendModal); // Close the modal if close button is clicked
};

// Function to close the delete confirmation modal
const closeRemoveFriendModal = () => {
    document.querySelector("#removeFriendModal").style.display = "none"; // Hide the modal
  };
    
// Event listener for the delete button
document.getElementById("confirmRemoveFriendBtn").addEventListener("click", async () => {
  await removeFriend(currentRemoveId_del); // Call the delete function with the current task ID
});
document.getElementById("remove-frnd-btn").addEventListener("click", async () => {
  await openRemoveFriendModal(uid_f); // Call the delete function with the current task ID
});
document.getElementById("send-req-btn").addEventListener("click", async () => {
  await sendFriendRequest(uid_f); // Call the delete function with the current task ID
});





















async function showFriendsModal() {
  const userId = localStorage.getItem("friendId"); // Get logged-in user's UID
  const friendsList = document.getElementById("userList");
  friendsList.innerHTML = `<p>Loading...</p>`; // Show loading text

  // Reference to the user's document in Firestore
  const userDocRef = doc(db, "users", userId);

  // Fetch user's friends array
  onSnapshot(userDocRef, (docSnap) => {
    friendsList.innerHTML = ""; // Clear loading text

    if (!docSnap.exists()) {
      friendsList.innerHTML = `<p>User not found</p>`;
      return;
    }

    const userData = docSnap.data();
    const friendsArray = userData.friends || []; // Ensure it's an array

    if (friendsArray.length === 0) {
      friendsList.innerHTML = `<p>No friends found</p>`;
      return;
    }

    friendsArray.forEach(async (friendId) => {
      // Fetch friend's data
      const friendDocRef = doc(db, "users", friendId);
      try {
        const friendSnap = await getDoc(friendDocRef);
        if (friendSnap.exists()) {
          const friendData = friendSnap.data();
          const friendName = friendData.displayName || "Unknown";
          const friendPhoto =
            friendData.photoURL ||
            "https://t4.ftcdn.net/jpg/02/15/84/43/360_F_215844325_ttX9YiIIyeaR7Ne6EaLLjMAmy4GvPC69.jpg";

          // Create friend list item
          const friendItem = document.createElement("li");
          friendItem.classList.add("list-group-item", "d-flex", "align-items-center", "justify-content-between");

          friendItem.innerHTML = `
              <div class="friend-info">
                  <img src="${friendPhoto}" alt="${friendName}'s profile picture" class="friend-avatar" id="id${friendId}">
                  <span class="friend-name">${friendName}</span>
              </div>
              <div class="friend-actions">
                  <button class="btn btn-chat">Chat</button>
                  <button class="btn btn-add">Add</button>
                  <button class="btn btn-pen">Pending</button>
              </div>
          `;
          friendsList.appendChild(friendItem);

          // Get logged-in user ID
          const currentUserId = localStorage.getItem("uid");

          // Check friendship status
          checkisFriendOrMe(currentUserId, friendId, friendItem);
          
          // Event listeners for navigation
          friendItem.querySelector(".friend-name").addEventListener("click", () => {
            localStorage.setItem("friendId", friendId);
            window.location.href = "../Open Profile/OpenProfile.html";
          });

          friendItem.querySelector(".friend-avatar").addEventListener("click", () => {
            localStorage.setItem("friendId", friendId);
            window.location.href = "../Open Profile/OpenProfile.html";
          });

          friendItem.querySelector(".btn-chat").addEventListener("click", () => {
            localStorage.setItem("ChatfriendId", friendId);
            localStorage.setItem("ChatfriendName", friendName);
            localStorage.setItem("ChatfriendPhoto", friendPhoto);
            window.location.href = "../Chat/chat.html";
          });
          friendItem.querySelector(".btn-add").addEventListener("click", () => {
            sendFriendRequest(friendId);
            friendItem.querySelector(".btn-add").style.display = "none";
            checkisFriendOrMe(currentUserId, friendId, friendItem);


          });
        }
      } catch (error) {
        console.error("Error fetching friend data: ", error);
      }
    });
  }, (error) => {
    console.error("Error fetching user data: ", error);
    friendsList.innerHTML = `<p>Error loading friends</p>`;
  });
}

// _____________________________ CHECK FRIEND STATUS FUNCTION _______________________________

async function checkisFriendOrMe(currentUserId, friendId, friendItem) {
  try {
    const chatBtn = friendItem.querySelector(".btn-chat");
    const addBtn = friendItem.querySelector(".btn-add");
    const penBtn = friendItem.querySelector(".btn-pen");
    
    chatBtn.style.display = "none";
    addBtn.style.display = "none";
    penBtn.style.display = "none";
    if (currentUserId === friendId) {
      // If it's the same user, hide both buttons
      chatBtn.style.display = "none";
      addBtn.style.display = "none";
      penBtn.style.display = "none";
      
      return;
    }

    // Fetch current user data
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      const friendsArray = userData.friends || [];

      if (friendsArray.includes(friendId)) {
        // Already friends -> Show Chat, Hide Add
        chatBtn.style.display = "block";
        addBtn.style.display = "none";
        penBtn.style.display = "none";
        return
      } 
      // Check if my friend request is pending
      const requestQuery = query(
        collection(db, "friendRequests"),
        where("senderId", "==", uid),
        where("receiverId", "==", friendId),
        where("status", "==", "pending")
      );
      const requestSnapshot = await getDocs(requestQuery);

      if (!requestSnapshot.empty) {
        chatBtn.style.display = "none";
        addBtn.style.display = "none";
        penBtn.style.display = "block";
        return

      }
      
      
      else {
        // Not friends -> Hide Chat, Show Add
        chatBtn.style.display = "none";
        addBtn.style.display = "block";
      }
    }
  } catch (error) {
    console.error("Error checking friend status:", error);
  }
}


function showUserModal() {
  document.getElementById("userModal").style.display = "flex";
  showFriendsModal();
}

function hideUserModal() {
  document.getElementById("userModal").style.display = "none";
}


// Automatically remove the backdrop when the modal closes
document.getElementById("closeShowFriendsM").addEventListener("click", hideUserModal);



// document.querySelector("#profile-friends").addEventListener("click",
//   showUserModal);
  
  document.getElementById("confirmRemoveFriendBtn").addEventListener("click", async () => {
    await removeFriend(currentRemoveId_del); // Call the delete function with the current task ID
  });
  document.getElementById("profile-friends").addEventListener("click", async () => {
    const myFrndOrNot = await isMyFriend();
    if(myFrndOrNot){
       showUserModal(); // Call the delete function with the current task ID
    }else{
      showMessage("You are not friend with this user");
    }
  });
// document.querySelector("#profile-friends").addEventListener({}




































// Store all user data in memory
 let usersCache = {};

// Fetch all users initially and store in memory
 const fetchAllUsers = async () => {
  try {
    const usersCollection = collection(db, "users");
    const usersSnapshot = await getDocs(usersCollection,orderBy("createdAt", "desc"));

    usersSnapshot.forEach((doc) => {
      usersCache[doc.id] = doc.data();
    });
  } catch (error) {
    console.error("Error fetching all users:", error);
  }
};

// Function to get user data from cache
 const getUserDataFromObj = (uid) => {
  if (!uid || !usersCache[uid]) {
    return { displayName: "Unknown User", userProfileImage: "https://t4.ftcdn.net/jpg/02/15/84/43/360_F_215844325_ttX9YiIIyeaR7Ne6EaLLjMAmy4GvPC69.jpg" };
  }
 document.querySelector("#titleName").innerHTML= usersCache[uid].displayName;
 // Select favicon link tag
const favicon = document.getElementById("favicon");

// Set favicon to profile picture or default image
favicon.href = usersCache[uid].photoURL || "https://t4.ftcdn.net/jpg/02/15/84/43/360_F_215844325_ttX9YiIIyeaR7Ne6EaLLjMAmy4GvPC69.jpg";

    return {
    displayName: usersCache[uid].displayName || "Unknown User",
    userProfileImage: usersCache[uid].photoURL || "https://t4.ftcdn.net/jpg/02/15/84/43/360_F_215844325_ttX9YiIIyeaR7Ne6EaLLjMAmy4GvPC69.jpg",
    email: usersCache[uid].email || "Unknown email",
  };
}







// Fetch all users and store in cache
fetchAllUsers().then(() => {
  // Call the function to populate the profile after fetching users
  infoProfile();
});


async function isMyFriend() {
  try {

          // Fetch current user data
          const userRef = doc(db, "users", uid);
          const userSnap = await getDoc(userRef);
    
          if (userSnap.exists()) {
              const userData = userSnap.data();
              const friendsArray = userData.friends || []; // Ensure it's an array
              
              const typeOfAcc = userData.accountType 
              // Check if friendId exists in the friends array
              if (friendsArray.includes(uid_f) || typeOfAcc === "public") {
                return true;
              }
            }
            return false;
    
  } catch (error) {
    console.error("Error is my frnd fun:", error);

  }
}



// Ensure that you have a reference to the post container
const myPostDivMain = document.getElementById('my-Allposts'); // reference to the container
const myPostDiv = document.getElementById('posts-container'); // reference to the container

let getTheirPosts = async () => {
  try {
    const accTypQ = query(collection(db, "users"), where("uid", "==", uid_f));
    const accTypSnap = await getDocs(accTypQ);

    if (accTypSnap.empty) {
      console.error("User not found");
      return;
    }

    const accountType = accTypSnap.docs[0].data().accountType || "public";
    const isFriend = await isMyFriend(); // Check if the user is a friend

    if (accountType === "private" && !isFriend && uid_f !== uid) {
      showPrivateAccountMessage();
    } else {
      showPublicPosts();
    }
  } catch (error) {
    console.error("Error fetching posts:", error);
  }
};

// ✅ Function to show private account message
function showPrivateAccountMessage() {
  myPostDivMain.innerHTML = `
    <div class="alert alert-warning" role="alert">
      This user's posts are private.
      <br>
      You need to be friends with this user to see their posts and friends.
    </div>
  `;
}

// ✅ Function to fetch and display public posts
async function showPublicPosts() {
  try {
    const q = query(collection(db, "posts"), where("uid", "==", uid_f), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    document.getElementById('total-posts').textContent = querySnapshot.docs.length; // Update total posts count

    myPostDiv.innerHTML = ''; // Clear previous posts

    querySnapshot.forEach((post) => {
      const postData = post.data();
      console.log(post.id, postData);

      let createdAt = "Unknown date";
      if (postData.createdAt?.toDate) {
        createdAt = postData.createdAt.toDate().toLocaleString();
      }

      // Create post card
      const postCard = document.createElement('div');
      postCard.classList.add('card', 'shadow-sm');
      postCard.style.marginBottom = '5px';

      postCard.innerHTML = `
        <div class="card-body">
          <p class="card-text">${postData.text || 'No description available.'}</p>
          <p class="text-muted" style="font-size: 12px;">Posted on: ${createdAt}</p>
        </div>
      `;

      myPostDiv.appendChild(postCard);
    });
  } catch (error) {
    console.error("Error fetching public posts:", error);
  }
}



// Call the function to load the posts for the current user
getTheirPosts();












// ---------------- friends count ----------------
async function getFriendsCount() {
    const userId = localStorage.getItem('friendId'); // Get current user ID
    if (!userId) return;

    try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const userData = userSnap.data();
            const friendsCount = userData.friends ? userData.friends.length : 0;
            console.log(`Total Friends: ${await friendsCount}`);

            document.getElementById('total-frnds').textContent = `${friendsCount
               || 0}`;
        } else {
            console.log("User not found");
            return 0;
        }
    } catch (error) {
        console.error("Error fetching friends count: ", error);
        return 0;
    }
}


getFriendsCount();

// Function to populate profile information
const infoProfile = () => {
  // Get user data from cache
  const userData = getUserDataFromObj(uid_f); // Fixed function name

  // Update the profile information in the HTML
  document.getElementById('profile-name').textContent = userData.displayName;
  document.getElementById('profile-email').textContent = userData.email;

  // Update the profile picture
  const profilePicture = document.querySelector('#Profile_Picture');
  profilePicture.src = userData.userProfileImage;
};
infoProfile()





