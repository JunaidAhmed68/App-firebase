// If UID doesn't exist, redirect to the login page
const uid = localStorage.getItem('uid');
if (!uid) {
  window.location.replace('../../index.html');  // Redirect to the login page
}


// ----------------------------------- logout -----------------------------------
import { auth, signOut , db , collection ,orderBy, getDocs , query,where ,deleteDoc ,doc ,updateDoc,  serverTimestamp,showMessage, 
} from "../../firebaseConfig.js";

document.querySelector("#logout-btn").addEventListener("click", async () => {
  try {
    await signOut(auth);
    localStorage.removeItem("uid");
    window.location.replace('../../index.html');
  } catch (error) {
    showMessage(error.message);
  }
});

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

    return {
    displayName: usersCache[uid].displayName || "Unknown User",
    userProfileImage: usersCache[uid].photoURL || "https://t4.ftcdn.net/jpg/02/15/84/43/360_F_215844325_ttX9YiIIyeaR7Ne6EaLLjMAmy4GvPC69.jpg",
    email: usersCache[uid].email || "Unknown email",
  };
};

// Function to populate profile information
const infoProfile = () => {
  // Get user data from cache
  const userData = getUserDataFromObj(uid); // Fixed function name

  // Update the profile information in the HTML
  document.getElementById('profile-name').textContent = userData.displayName;
  document.getElementById('profile-email').textContent = userData.email;
  document.getElementById('profile-friends').textContent = `Friends: ${userData.friendsCount || 0}`;

  // Update the profile picture
  const profilePicture = document.querySelector('#Profile_Picture');
  profilePicture.src = userData.userProfileImage;
};


// Function to delete the post
const deletePost = async (postId) => {
  try {
    const postRef = doc(db, "posts", postId);
    await deleteDoc(postRef);  // Delete the post from Firestore
    showMessage("Post deleted successfully!");
    getMyPosts(); // Reload the posts after deletion
  } catch (error) {
    console.error("Error deleting post:", error);
    showMessage("There was an error deleting the post.");
  }
};

// Get modal and elements
const modal = document.getElementById('myModal');
const cancelBtn = document.getElementById('cancelBtn');
const savePostBtn = document.getElementById('savePostBtn');
const postTextInput = document.getElementById('editPostText');
const bodyContent = document.querySelector('.main-content'); // Or select any content you want to blur

let currentPostId = ''; // Variable to store the post ID for editing

// Function to update the post
const updatePost = async (postId, currentText) => {
  // Store the post ID to use later
  currentPostId = postId;
  
  // Open the modal and populate the text area with the current post text
  postTextInput.value = currentText || ''; // Fill textarea with current text
  modal.style.display = 'flex'; // Show modal  
  // Close modal when cancel button is clicked
  cancelBtn.addEventListener('click', () => {
    modal.style.display = 'none'; // Hide modal
    bodyContent.style.filter = 'none'; // Remove blur from background content
  });

  // Save updated text when Save button is clicked
  savePostBtn.addEventListener('click', async () => {
    const newPostText = postTextInput.value.trim();

    if (newPostText === "") {

      showMessage("Post text cannot be empty.");
      return; // Stop if user doesn't provide new text
    }

    try {
      // Update the post in Firestore
      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, {
        text: newPostText, // New post text
        createdAt: serverTimestamp() // Optionally track when the post was updated
      });

      // Close modal and remove blur from background
      modal.style.display = 'none';
      bodyContent.style.filter = 'none';

      showMessage("Post updated successfully!");
      getMyPosts(); // Reload the posts after update
    } catch (error) {
      console.error("Error updating post:", error);
      showMessage("There was an error updating the post.");
    }
  });
};






// Fetch all users and store in cache
fetchAllUsers().then(() => {
  // Call the function to populate the profile after fetching users
  infoProfile();
});

// Ensure that you have a reference to the post container
const myPostDiv = document.getElementById('posts-container'); // reference to the container

let getMyPosts = async () => {
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
      postCard.style.width = '800px';
      postCard.style.marginBottom = '5px';

      postCard.innerHTML = `
        <div class="card-body">
          <p class="card-text">${postData.text || 'No description available.'}</p>
          <p class="text-muted" style="font-size: 12px;">Posted on: ${createdAt}</p>
        </div>
      `;

      // Create edit button
      const editBtn = document.createElement('button');
      editBtn.textContent = 'Edit';
      editBtn.classList.add('update-btn', 'btn', 'btn-primary');
      editBtn.addEventListener("click", () => updatePost(post.id, postData.text));

      // Create delete button
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.classList.add('update-btn', 'btn', 'btn-danger', 'ms-2');
      deleteBtn.addEventListener("click", () => openDeleteModal(post.id));

      // Append buttons to the card body
      postCard.querySelector('.card-body').appendChild(editBtn);
      postCard.querySelector('.card-body').appendChild(deleteBtn);

      // Append the post card to the container
      myPostDiv.appendChild(postCard);
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
  }
};


// Call the function to load the posts for the current user
getMyPosts();



let currentPostId_del=''; // Variable to store the current post ID
// Function to open the delete confirmation modal
const openDeleteModal = (postId) => {
  currentPostId_del = postId; // Store the
  document.getElementById("deleteModal").style.display = "block"; // Show the modal
  document.querySelector("#closeDeleteModal").addEventListener("click", closeDeleteModal); // Close the modal if close button is clicked
  document.querySelector("#cancelDeleteBtn").addEventListener("click", closeDeleteModal); // Close the modal if close button is clicked
};

// Function to close the delete confirmation modal
const closeDeleteModal = () => {
    document.getElementById("deleteModal").style.display = "none"; // Hide the modal
  };
    
// Event listener for the delete button
document.getElementById("confirmDeleteBtn").addEventListener("click", async () => {
  await deletePost(currentPostId_del); // Call the delete function with the current task ID
  closeDeleteModal(); // Close the modal after deletion
});
