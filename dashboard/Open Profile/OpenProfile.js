// If UID doesn't exist, redirect to the login page
const uid = localStorage.getItem('friendId');
if (!uid) {
  window.location.replace('../../index.html');  // Redirect to the login page
}


// ----------------------------------- imprts -----------------------------------
import { auth, signOut , db , collection ,orderBy, getDocs , query,where ,deleteDoc ,doc ,updateDoc,getDoc,  serverTimestamp,showMessage, 
} from "../../firebaseConfig.js";


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
};







// Fetch all users and store in cache
fetchAllUsers().then(() => {
  // Call the function to populate the profile after fetching users
  infoProfile();
});

// Ensure that you have a reference to the post container
const myPostDiv = document.getElementById('posts-container'); // reference to the container

let getTheirPosts = async () => {
  try {

    const q = query(collection(db, "posts"), where("uid", "==", uid),orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    document.getElementById('total-posts').textContent = querySnapshot.docs.length; // Update the total posts count

    // Clear previous posts
    myPostDiv.innerHTML = ''; 

    querySnapshot.forEach((post) => {
      const postData = post.data();
      console.log(post.id, postData);

      // Convert Firestore Timestamp to JS Date
      let createdAt = "Unknown date";
      if (postData.createdAt?.toDate) {
        createdAt = postData.createdAt.toDate().toLocaleString();
      }

      // Create the card div
      const postCard = document.createElement('div');
      postCard.classList.add('card', 'shadow-sm');
      postCard.style.marginBottom = '5px';

      postCard.innerHTML = `
        <div class="card-body">
          <p class="card-text">${postData.text || 'No description available.'}</p>
          <p class="text-muted" style="font-size: 12px;">Posted on: ${createdAt}</p>
        </div>
      `;
      // Append the post card to the container
      myPostDiv.appendChild(postCard);
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
  }
};


// Call the function to load the posts for the current user
getTheirPosts();












// ---------------- friends count ----------------
async function getFriendsCount() {
    const userId = localStorage.getItem('uid'); // Get current user ID
    if (!userId) return;

    try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const userData = userSnap.data();
            const friendsCount = userData.friends ? userData.friends.length : 0;
            console.log(`Total Friends: ${friendsCount}`);

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
  const userData = getUserDataFromObj(uid); // Fixed function name

  // Update the profile information in the HTML
  document.getElementById('profile-name').textContent = userData.displayName;
  document.getElementById('profile-email').textContent = userData.email;

  // Update the profile picture
  const profilePicture = document.querySelector('#Profile_Picture');
  profilePicture.src = userData.userProfileImage;
};


















const hamburgerIcon = document.getElementById("hamburger-icon");
const sidebar = document.getElementById("sidebar");
const mainContent = document.querySelector(".main-content");

hamburgerIcon.addEventListener("click", () => {
  sidebar.classList.toggle("hide");
  mainContent.classList.toggle("expanded");
});


