// If UID doesn't exist, redirect to the login page
const uid = localStorage.getItem('uid');
if (!uid) {
  window.location.replace('../../index.html');  // Redirect to the login page
}
// ----------------------------------- logout -----------------------------------
import { auth, signOut , db, addDoc , collection ,serverTimestamp, showMessage} from "../../firebaseConfig.js";
document.querySelector("#logout-btn").addEventListener("click", async () => {
  try {
    await signOut(auth);
    localStorage.removeItem("uid");
      window.location.replace('../../index.html');
  } catch (error) {
    alert(error.message);
  }
});


document.getElementById("createPostForm").addEventListener("submit", async function (event) {
  event.preventDefault(); // Prevent the default form submission

  const postText = document.getElementById("postText").value;

  // Check if at least one of the fields is filled
  if (!postText) {
      showMessage("Please provide text to post!")
      return;
  }

  try {
      // Add the post data to Firestore
      await addDoc(collection(db, "posts"),{
        text: postText,
        uid: uid,
        createdAt:serverTimestamp(),
      });   
         showMessage("Post created successfully!")
      document.getElementById("createPostForm").reset(); // Reset the form
  } catch (error) {
      console.error("Error creating post: ", error);
      showMessage("Error creating post.")
  }
});
