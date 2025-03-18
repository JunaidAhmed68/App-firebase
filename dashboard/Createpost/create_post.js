// If UID doesn't exist, redirect to the login page
const uid = localStorage.getItem('uid');
if (!uid) {
  window.location.replace('../../index.html');  // Redirect to the login page
}
// ----------------------------------- logout -----------------------------------
import { auth, signOut , db, addDoc , collection ,serverTimestamp, showMessage, getDoc,doc} from "../../firebaseConfig.js";
// Show the confirmation modal when the logout button is clicked
document.querySelector("#logout-btn").addEventListener("click", () => {
  document.getElementById("logout-confirmation-modal").style.display = "block";
});

// Close the modal when the close button is clicked
document.getElementById("close-logout-modal").addEventListener("click", () => {
  document.getElementById("logout-confirmation-modal").style.display = "none";
});

// Close the modal when clicking outside of the modal
window.addEventListener("click", (event) => {
  const logoutModal = document.getElementById("logout-confirmation-modal");
  if (event.target === logoutModal) {
      logoutModal.style.display = "none";
  }
});

// Handle the confirmation of logout
document.getElementById("confirm-logout-action").addEventListener("click", async () => {
  try {
      await signOut(auth);
      localStorage.removeItem("uid");
      window.location.replace('../../index.html');
  } catch (error) {
      showMessage(error.message);
  }
});

// Handle the cancel action
document.getElementById("cancel-logout-action").addEventListener("click", () => {
  document.getElementById("logout-confirmation-modal").style.display = "none";
});



document.getElementById("createPostForm").addEventListener("submit", async function (event) {
  event.preventDefault(); // Prevent default form submission

  const postText = document.getElementById("postText").value;

  if (!postText) {
      showMessage("Please provide text to post!");
      return;
  }

  try {
      const newPostRef = await addDoc(collection(db, "posts"), {
          text: postText,
          uid: uid,
          createdAt: serverTimestamp(),
      });

      showMessage("Post created successfully!");
      document.getElementById("createPostForm").reset();

      // Fetch user details for the newly created post
      const userDoc = await getDoc(doc(db, "users", uid)); 
      const userData = userDoc.exists() ? userDoc.data() : { 
          displayName: "Anonymous", 
          photoURL: "https://t4.ftcdn.net/jpg/02/15/84/43/360_F_215844325_ttX9YiIIyeaR7Ne6EaLLjMAmy4GvPC69.jpg"
      };

      // Format date
      const createdAt = new Date().toLocaleString();

      // Generate unique ID for elements
      const opnID = Math.random().toString(36).substring(7);

      // Create the new post element dynamically
      const postContainer = document.getElementById("post_created");
      postContainer.innerHTML = ""; // Clear previous content to show only the new post
      
      const postCard = document.createElement("div");
      postCard.className = "d-flex justify-content-center my-3 post-card"; 
      
      postCard.innerHTML = `
        <div class="card shadow-sm post-content" style="width: 800px; opacity: 0; transform: translateY(20px);"> 
          <div class="card-body">
            <div class="d-flex align-items-center mb-2">
              <img src="${userData.photoURL}" id="imgFO-${opnID}" 
              alt="User Image" class="rounded-circle" style="width: 40px; height: 40px; margin-right:10px">
              <h5 class="card-title mb-0" id="nameFO-${opnID}">${userData.displayName}</h5>
            </div>
            <p class="card-text">${postText}</p>
            <p class="text-muted" style="font-size: 12px;">Posted on: ${createdAt}</p>
            </div>
            </div>
            `;
            
            postContainer.appendChild(postCard);
            document.getElementById("all-posts-home").style.display="block"  // Show the post container

      // Apply Animation (ensure visibility)
      setTimeout(() => {
          postCard.querySelector(".post-content").style.opacity = "1";
          postCard.querySelector(".post-content").style.transform = "translateY(0)";
      }, 100);
  } catch (error) {
      console.error("Error creating post: ", error);
      showMessage("Error creating post.");
  }
});



