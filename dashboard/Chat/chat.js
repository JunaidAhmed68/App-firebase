// If UID doesn't exist, redirect to the login page
const islogin = localStorage.getItem('uid');
if (!islogin) {
  window.location.replace('../../index.html');  // Redirect to the login page
}


// ----------------------------------- logout -----------------------------------
import { auth, signOut , db , collection ,orderBy, getDocs , query,where ,deleteDoc ,doc ,updateDoc,getDoc,  serverTimestamp,showMessage, deleteUser ,getAuth,reauthenticateWithCredential, limit,EmailAuthProvider  ,onAuthStateChanged,  increment, setDoc,onSnapshot, addDoc
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


// Global variables for chat and friend requests
let currentConversationId = null;
let currentFriendId = null;

// DOM elements
const friendRequestsContainer = document.querySelector(
  "#friendRequestsContainer"
);
const conversationList = document.querySelector("#conversationList");
const chatContainer = document.querySelector("#chatContainer");
const chatFriendPhoto = document.querySelector("#chatFriendPhoto");
const chatFriendName = document.querySelector("#chatFriendName");
const closeChatBtn = document.querySelector("#closeChatBtn");
const chatMessages = document.querySelector("#chatMessages");
const messageInput = document.querySelector("#messageInput");
const sendMessageBtn = document.querySelector("#sendMessageBtn");
const friendsListContainer = document.querySelector("#friendsListContainer"); 


// ------------------------------
function displayMessage(msg) {
  const messageClass = msg.sender === islogin ? "sent" : "received";
  return `
      <div class="message ${messageClass}">
          <div class="text">${msg.text}</div>
          <div class="time" style="font-size:smaller;" >${msg.createdAt.toDate().toLocaleTimeString()}</div>
      </div>
  `;
}

// 1. Friend Request Handling
// ------------------------------
async function loadFriends() {
  try {
      // Get logged-in user's document
      const userDocRef = doc(db, "users", islogin);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
          console.error("User document not found.");
          return;
      }

      // Extract and clean friends array
      const userData = userDocSnap.data();
      let friendsArray = userData.friends || []; 
      friendsArray = friendsArray.filter(uid => uid.trim() !== ""); // Remove empty values

      if (friendsArray.length === 0) {
          friendsListContainer.innerHTML = "<p>No friends found.</p>";
          return;
      }

      // Firestore only allows "in" for up to 10 items, so handle cases where >10 friends
      let friendsHTML = "";
      const chunkSize = 10; 

      for (let i = 0; i < friendsArray.length; i += chunkSize) {
          const chunk = friendsArray.slice(i, i + chunkSize);
          const q = query(collection(db, "users"), where("uid", "in", chunk));
          const querySnapshot = await getDocs(q);

          querySnapshot.forEach((doc) => {
              const friendData = doc.data();
              const friendId = friendData.uid;
              const friendName = friendData.displayName || "Friend";
              const friendPhoto = friendData.photoURL || "https://t4.ftcdn.net/jpg/02/15/84/43/360_F_215844325_ttX9YiIIyeaR7Ne6EaLLjMAmy4GvPC69.jpg";

              friendsHTML += `
              <div class="friend-item" data-friendid="${friendId}" data-friendname="${friendName}" data-friendphoto="${friendPhoto}">
                  <img src="${friendPhoto}" class="profile-pic" alt="${friendName}" id="img-${friendId}">
                  <div class="friend-info">
                      <h4 id="name-${friendId}">${friendName}</h4>
                      <button class="message-btn" data-friendid="${friendId}" data-friendname="${friendName}" data-friendphoto="${friendPhoto}">Message</button>
                  </div>
              </div>
          `;
          
          setTimeout(() => {
              document.getElementById(`img-${friendId}`).addEventListener("click", () => {
                  localStorage.setItem("friendId", friendId);
                  window.location.href='../Open Profile/OpenProfile.html';
              });
          
              document.getElementById(`name-${friendId}`).addEventListener("click", () => {
                  localStorage.removeItem("friendId");
                  localStorage.setItem("friendId", friendId);
                  window.location.href='../Open Profile/OpenProfile.html';
              });
          }, 0);
          
          });
      }

      friendsListContainer.innerHTML = friendsHTML;

  } catch (error) {
      console.error("Error loading friends:", error);
  }
}

// Event delegation for Message button
friendsListContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("message-btn")) {
      const friendId = e.target.getAttribute("data-friendid");
      const friendName = e.target.getAttribute("data-friendname");
      const friendPhoto = e.target.getAttribute("data-friendphoto");

      startConversation(friendId, friendName, friendPhoto);
  }
});

// Load default chat screen
function showDefaultChatScreen() {
  chatContainer.innerHTML = `
      <div class="default-chat-screen" style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%;">
          <h2>Start a conversation</h2>
          <p>Select a friend to begin chatting</p>
      </div>
  `;
}

// Start or load conversation
async function startConversation(friendId, friendName, friendPhoto) {
  try {
      // Check if conversation exists
      const convQuery = query(
          collection(db, "conversations"),
          where("participants", "array-contains", islogin)
      );
      const querySnapshot = await getDocs(convQuery);

      let conversationId = null;

      querySnapshot.forEach((doc) => {
          const convData = doc.data();
          if (convData.participants.includes(friendId)) {
              conversationId = doc.id;
          }
      });

      // If conversation doesn't exist, create one
      if (!conversationId) {
          const conversationRef = await addDoc(collection(db, "conversations"), {
              participants: [islogin, friendId],
              friendName: friendName,
              friendPhoto: friendPhoto,
              createdAt: serverTimestamp(),
          });
          conversationId = conversationRef.id;
      }

      // Open chat
      openChat(conversationId, friendName, friendId, friendPhoto);

  } catch (error) {
      console.error("Error starting conversation:", error);
  }
}

// Open the chat UI
function openChat(conversationId, friendName, friendId, friendPhoto) {
  currentConversationId = conversationId;
  currentFriendId = friendId;

  chatContainer.innerHTML = `
      <div class="chat-header">
          <img src="${friendPhoto}"   id="imgF-${friendId}"  class="profile-pic" alt="${friendName}">
          <h3  id="nameF-${friendId}" >${friendName}</h3>
      </div>
      <div class="chat-messages" id="chatMessages"></div>
      <div class="chat-input">
          <input type="text" id="messageInput" placeholder="Type a message...">
          <button id="sendMessageBtn">Send</button>
      </div>
  `;
  setTimeout(() => {
    document.getElementById(`imgF-${friendId}`).addEventListener("click", () => {
        localStorage.setItem("friendId", friendId);
        window.location.href='../Open Profile/OpenProfile.html';
    });

    document.getElementById(`nameF-${friendId}`).addEventListener("click", () => {
        localStorage.removeItem("friendId");
        localStorage.setItem("friendId", friendId);
        window.location.href='../Open Profile/OpenProfile.html';
    });
   }, 0);
  loadConversationMessages(conversationId);

  // Event listener for sending messages
  document.getElementById("sendMessageBtn").addEventListener("click", sendMessage);
  document.getElementById("messageInput").addEventListener("keydown", (e) => {
      if (e.key === "Enter") sendMessage();
  });
}

// Load conversation messages
function loadConversationMessages(conversationId) {
  const messagesQuery = query(
      collection(db, "conversations", conversationId, "messages"),
      orderBy("createdAt")
  );

  onSnapshot(messagesQuery, (snapshot) => {
      let messagesHTML = "";
      snapshot.forEach((msgDoc) => {
          const msgData = msgDoc.data();
          messagesHTML += displayMessage(msgData);
      });
      document.getElementById("chatMessages").innerHTML = messagesHTML;
      document.getElementById("chatMessages").scrollTop = document.getElementById("chatMessages").scrollHeight;
  });
}

// Send message function
async function sendMessage() {
  const text = document.getElementById("messageInput").value.trim();
  if (text && currentConversationId) {
      try {
          await addDoc(
              collection(db, "conversations", currentConversationId, "messages"),
              {
                  text: text,
                  sender: islogin,
                  createdAt: serverTimestamp(),
              }
          );
          document.getElementById("messageInput").value = "";
      } catch (error) {
          console.error("Error sending message:", error);
      }
  }
}

// Load Friends & Default Chat UI on page load
loadFriends();
showDefaultChatScreen();
const hamburgerIcon = document.getElementById("hamburger-icon");
const sidebar = document.getElementById("sidebar");
const mainContent = document.querySelector(".main-content");

hamburgerIcon.addEventListener("click", () => {
  sidebar.classList.toggle("hide");
  mainContent.classList.toggle("expanded");
});