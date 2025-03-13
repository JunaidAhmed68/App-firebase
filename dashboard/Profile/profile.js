// If UID doesn't exist, redirect to the login page
const uid = localStorage.getItem('uid');
if (!uid) {
  window.location.replace('../../index.html');  // Redirect to the login page
}


// ----------------------------------- logout -----------------------------------
import { auth, signOut , db , collection ,orderBy, getDocs , query,where ,deleteDoc ,doc ,updateDoc,getDoc,  serverTimestamp,showMessage, deleteUser ,getAuth,reauthenticateWithCredential,onSnapshot ,EmailAuthProvider,handleAuthErrors
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

function showFriendsModal() {
  const userId = localStorage.getItem("uid"); // Get logged-in user's UID
  const friendsList = document.getElementById("friendsList");
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

      // Loop through each friend ID in the friends array
      friendsArray.forEach((friendId) => {
          // Fetch friend's data
          const friendDocRef = doc(db, "users", friendId);
          getDoc(friendDocRef).then((friendSnap) => {
              if (friendSnap.exists()) {
                  const friendData = friendSnap.data();
                  const friendName = friendData.displayName || "Unknown";
                  const friendPhoto = friendData.photoURL || 'https://t4.ftcdn.net/jpg/02/15/84/43/360_F_215844325_ttX9YiIIyeaR7Ne6EaLLjMAmy4GvPC69.jpg';

                  // Create friend list item
                  const friendItem = document.createElement("li");
                  friendItem.classList.add("list-group-item", "d-flex", "align-items-center", "justify-content-between");

                  friendItem.innerHTML = `
                      <div class="d-flex align-items-center">
                          <img src="${friendPhoto}" alt="${friendName}" class="rounded-circle" style="width: 40px; height: 40px; margin-right: 10px;">
                          <span>${friendName}</span>
                      </div>
                      <div>
                          <button class="btn btn-primary btn-sm" onclick="startChat('${friendId}')">Chat</button>
                          <button class="btn btn-danger btn-sm" onclick="removeFriend('${userId}', '${friendId}')">Remove</button>
                      </div>
                  `;
                  friendsList.appendChild(friendItem);
              }
          }).catch((error) => {
              console.error("Error fetching friend data: ", error);
          });
      });
  }, (error) => {
      console.error("Error fetching user data: ", error);
      friendsList.innerHTML = `<p>Error loading friends</p>`;
  });

  // Show the modal
  var modal = new bootstrap.Modal(document.getElementById('friendsModal'));
  removeModalBackdrop();
  modal.show();
}
function removeModalBackdrop() {
  document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
  document.body.classList.remove('modal-open');
  document.body.style.overflow = ''; // Restore scrolling
}

// Automatically remove the backdrop when the modal closes
document.getElementById("friendsModal").addEventListener("hidden.bs.modal", removeModalBackdrop);


document.querySelector("#profile-friends").addEventListener("click", showFriendsModal);

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
    const q = query(collection(db, "posts"), where("uid", "==", uid), orderBy("createdAt", "desc"));
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
      postCard.classList.add('card', 'shadow-sm', 'position-relative');
      postCard.style.marginBottom = '5px';

      postCard.innerHTML = `
        <div class="card-body">
          <p class="card-text">${postData.text || 'No description available.'}</p>
          <p class="text-muted" style="font-size: 12px;">Posted on: ${createdAt}</p>
          
          <!-- 3-dot menu button -->
          <div class="dropdown position-absolute top-0 end-0 m-2">
            <button class="btn btn-light btn-sm menu-btn" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="fas fa-ellipsis-v"></i>
            </button>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item edit-btn" id="edit-${post.id}" href="#">Edit</a></li>
              <li><a class="dropdown-item text-danger delete-btn" id="delete-${post.id}" href="#">Delete</a></li>
            </ul>
          </div>
        </div>
      `;

      // Append the post card to the container
      myPostDiv.appendChild(postCard);
    });

    // ✅ Select all edit buttons and add event listeners
    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", (event) => {
        event.preventDefault();
        const postId = btn.id.replace("edit-", ""); // Extract post ID
        const postText = btn.closest(".card-body").querySelector(".card-text").textContent;
        updatePost(postId, postText);
      });
    });

    // ✅ Select all delete buttons and add event listeners
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", (event) => {
        event.preventDefault();
        const postId = btn.id.replace("delete-", ""); // Extract post ID
        openDeleteModal(postId);
      });
    });

  } catch (error) {
    console.error("Error fetching posts:", error);
  }
};

// Call function to load the posts
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
// Get modal and elements
const bioModal = document.getElementById('myModal-bio');
const cancelBtnBio = document.getElementById('cancelBtn-bio');
const saveBioBtn = document.getElementById('savePostBtn');
const bioTextInput = document.getElementById('editPostText');
const viewBioBtn = document.getElementById('bio-btn');
const bioDisplay = document.getElementById('bio-display'); // Bio text container
const chkValidBio = document.getElementById('valid-bio'); // Bio text container


// Open Bio Modal Function
const openBioModal = async () => {
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      bioTextInput.value = userData.bio || ''; // Pre-fill with existing bio
    }

    bioModal.style.display = 'flex'; // Show modal
  } catch (error) {
    console.error("Error fetching user bio:", error);
  }
};

// Save Bio Function
const saveBio = async () => {
  const newBio = bioTextInput.value.trim();
   if (newBio.length>130) {
    chkValidBio.style.display = "block";
    return;
   }
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, { bio: newBio });

    showMessage("Bio updated successfully!");
    bioModal.style.display = 'none'; // Close modal

    // Update UI
    if (newBio) {
      bioDisplay.textContent = newBio; // Show updated bio
      bioDisplay.style.display = "block"; // Make sure bio text is visible
      viewBioBtn.style.display = "none"; // Hide "Add Bio" button
    } else {
      viewBioBtn.style.display = "block"; // Show "Add Bio" button
    }
  } catch (error) {
    console.error("Error updating bio:", error);
    showMessage("Failed to update bio.");
  }
};

// Event Listeners
viewBioBtn.addEventListener("click", openBioModal);
cancelBtnBio.addEventListener("click", () => bioModal.style.display = 'none');
saveBioBtn.addEventListener("click", saveBio);

// Check and Show Bio on Page Load
const checkAndShowBio = async () => {
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      const userBio = userData.bio || null;

      if (userBio) {
        bioDisplay.textContent = userBio; 
        bioDisplay.style.display = "block"; // Show bio text
        viewBioBtn.style.display = "none"; // Hide button
      } else {
        viewBioBtn.style.display = "block"; // Show "Add Bio" button
      }
    }
  } catch (error) {
    console.error("Error fetching user bio:", error);
  }
};

// Call function on page load
checkAndShowBio();







const hamburgerIcon = document.getElementById("hamburger-icon");
const sidebar = document.getElementById("sidebar");
const mainContent = document.querySelector(".main-content");

hamburgerIcon.addEventListener("click", () => {
  sidebar.classList.toggle("hide");
  mainContent.classList.toggle("expanded");
});


const editBtn_edt_profile = document.getElementById("edt-pro-btn");
const modal_edt_profile = document.getElementById("editProfileModal");
const overlay = document.getElementById("modalOverlay");
const closeBtn_edt_profile = document.getElementById("close-btn-EDIT-PRO");
const profilePicInput = document.getElementById("profile-pic-input");
const profilePicPreview = document.getElementById("profile-pic-preview");
const usernameInput = document.getElementById("username-inp");
const bioInput = document.getElementById("bio-inp");
const saveBtn_profile = document.getElementById("save-profile-btn");

// Open Modal
editBtn_edt_profile.addEventListener("click", async () => {
    modal_edt_profile.style.display = "block";
    overlay.style.display = "block";

    // Fetch current user data from Firestore
    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("uid", "==", uid));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((docSnap) => {
            const userData = docSnap.data();
            usernameInput.value = userData.displayName || "";
            bioInput.value = userData.bio || "";
            profilePicPreview.src = userData.photoURL || "default-profile.png";
        });
    } catch (error) {
        console.error("Error fetching user data:", error);
    }
});

// Close Modal
closeBtn_edt_profile.addEventListener("click", () => {
    modal_edt_profile.style.display = "none";
    overlay.style.display = "none";
    document.getElementById("cancel-dlt-Acc").style.display = "none";
});

// Close when clicking outside modal
overlay.addEventListener("click", () => {
    modal_edt_profile.style.display = "none";
    overlay.style.display = "none";
});

// Preview Profile Picture
profilePicInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            profilePicPreview.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Upload Image to Cloudinary and Update Firestore
saveBtn_profile.addEventListener("click", async () => {
    const newUsername = usernameInput.value.trim();
    const newBio = bioInput.value.trim();
    let file = profilePicInput.files[0];

    try {
        let imageUrl = profilePicPreview.src; // Keep the old image if no new file is uploaded

        // If a new image is selected, upload it to Cloudinary
        if (file) {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", "profileURL"); // Cloudinary preset

            const response = await fetch("https://api.cloudinary.com/v1_1/dbqf9udic/image/upload", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            if (!data.secure_url) throw new Error("Image upload failed!");

            imageUrl = data.secure_url;
        }

        // Update Firestore with new username, bio, and profile picture
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("uid", "==", uid));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach(async (docSnap) => {
            await updateDoc(doc(db, "users", docSnap.id), {
                displayName: newUsername,
                bio: newBio,
                photoURL: imageUrl,
            });
        });

        showMessage("Profile updated successfully!");

        // Close modal
        modal_edt_profile.style.display = "none";
        overlay.style.display = "none";

        // Update displayed profile info
        document.getElementById("Profile_Picture").src = imageUrl;
        document.getElementById("profile-name").innerText = newUsername;
        document.getElementById("bio-display").innerText = newBio;

    } catch (error) {
        console.error("Error updating profile:", error);
        alert("Failed to update profile. Try again.");
    }
});




// Dropdown Toggle
const threeDots = document.getElementById("three-dots-menu");
const dropdownMenu = document.getElementById("dropdown-menu");
const deleteProfileBtn = document.getElementById("delete-profile-btn");

threeDots.addEventListener("click", () => {
  dropdownMenu.style.display = dropdownMenu.style.display === "block" ? "none" : "block";
});

window.addEventListener("click", (e) => {
  if (e.target !== threeDots && !dropdownMenu.contains(e.target)) {
    dropdownMenu.style.display = "none";
  }
});
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("confirmModal");
  const closeBtn = document.querySelector(".close");
  const cancelBtn = document.getElementById("cancelBtn-acc");

  // Open modal
  document.querySelector("#delete-profile-btn").addEventListener("click", () => {
      modal.style.display = "flex";
  });

  // Close modal
  closeBtn.addEventListener("click", () => {
      modal.style.display = "none";
  });

  cancelBtn.addEventListener("click", () => {
      modal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
      if (e.target === modal) {
          modal.style.display = "none";
      }
  });
});

// DELETE ACCOUNT FUNCTION
async function deleteAccount() {
  const password = document.getElementById("confirmPassword").value;
  const errorMessage = document.getElementById("error-message");

  if (!password) {
      errorMessage.style.display = "block";
      return;
  }

  try {
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user found.");

      const credentials = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credentials);

      // Delete user document from Firestore
      const userDocRef = doc(db, "users", user.uid);
      await deleteDoc(userDocRef);

      // Delete all posts associated with the user
      const postsQuery = query(collection(db, "posts"), where("uid", "==", user.uid));
      const postsSnapshot = await getDocs(postsQuery);

      const deletePostPromises = postsSnapshot.docs.map((docSnap) => deleteDoc(doc(db, "posts", docSnap.id)));
      await Promise.all(deletePostPromises);

      // Delete user from Firebase Authentication
      await deleteUser(user);
      console.log("User deleted successfully.");

      // Remove UID from localStorage
      localStorage.removeItem("uid");

      // Hide modal and show success message
      document.getElementById("confirmModal").style.display = "none";
      showMessage("Your account has been deleted successfully.");

      // Redirect to home page
      window.location.replace("../../index.html");
  } catch (error) {
      console.error("Error deleting user:", error);
      handleAuthErrors(error);
      }
}

document.querySelector(".deleteB").addEventListener("click", deleteAccount);


