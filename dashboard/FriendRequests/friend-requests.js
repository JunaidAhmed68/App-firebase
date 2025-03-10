// If UID doesn't exist, redirect to the login page
const uid = localStorage.getItem('uid');
if (!uid) {
    window.location.replace('../../index.html');  
}

// Import Firebase functions
import { auth, signOut, db, collection, onSnapshot, query, where, doc, arrayUnion, writeBatch, deleteDoc, showMessage , getDocs} from "../../firebaseConfig.js";

// Logout Functionality
document.querySelector("#logout-btn").addEventListener("click", async () => {
    try {
        await signOut(auth);
        localStorage.removeItem("uid");
        showMessage("Logged out successfully!");
        setTimeout(() => window.location.replace('../../index.html'), 3000);
    } catch (error) {
        alert(error.message);
    }
});

// Accept Friend Request
async function acceptFriendRequest(requestId, senderId) {
    try {
        const userRef = doc(db, "users", uid);
        const senderRef = doc(db, "users", senderId);
        const requestRef = doc(db, "friendRequests", requestId);
        
        const batch = writeBatch(db);
        batch.update(userRef, { friends: arrayUnion(senderId) });
        batch.update(senderRef, { friends: arrayUnion(uid) });
        batch.delete(requestRef);
        
        await batch.commit();
        showMessage("Friend request accepted!");
    } catch (error) {
        console.error("Error accepting friend request:", error);
        showMessage("Error accepting friend request.");
    }
}

// Reject Friend Request
async function rejectFriendRequest(requestId) {
    try {
        await deleteDoc(doc(db, "friendRequests", requestId));
        showMessage("Friend request rejected.");
    } catch (error) {
        console.error("Error rejecting friend request:", error);
        showMessage("Error rejecting friend request.");
    }
}

// Real-time Friend Requests Listener
const friendRequestsList = document.getElementById('friend-requests-list');
const q = query(collection(db, "friendRequests"), where("receiverId", "==", uid), where("status", "==", "pending"));

onSnapshot(q, async (snapshot) => {
    friendRequestsList.innerHTML = snapshot.empty ? '<p>No friend requests.</p>' : '';
    
    snapshot.forEach(async (doc) => {
        const requestData = doc.data();
        const senderId = requestData.senderId;
        const senderSnapshot = await getDocs(query(collection(db, "users"), where("uid", "==", senderId)));
        
        if (!senderSnapshot.empty) {
            const senderData = senderSnapshot.docs[0].data();
            const requestItem = document.createElement('div');
            requestItem.className = 'friend-request-item';
            requestItem.innerHTML = `
                <div class="picnname" >
                    <img src="${senderData.photoURL || 'https://t4.ftcdn.net/jpg/02/15/84/43/360_F_215844325_ttX9YiIIyeaR7Ne6EaLLjMAmy4GvPC69.jpg'}" 
                        alt="${senderData.displayName}" id="imgF-${senderId}"
                        style="width: 40px; height: 40px; border-radius: 50%;">
                    <span id="nameF-${senderId} class="nameOfP" ">${senderData.displayName}</span>
                </div>
                <div class="msg-text-req" >
                    <span class="friend-request-text">wants to be your friend</span>
                </div>
                <div class="msg-text-req-btns" >
                    <button class="accept-btn" onclick="acceptFriendRequest('${doc.id}', '${senderId}')">Accept</button>
                    <button class="reject-btn" onclick="rejectFriendRequest('${doc.id}')">X</button>
                </div>
            `;
            friendRequestsList.appendChild(requestItem);

            setTimeout(() => {
                document.getElementById(`imgF-${senderId}`).addEventListener("click", () => {
                    localStorage.setItem("friendId", senderId);
                    window.location.href = '../Open Profile/OpenProfile.html';
                });
                document.getElementById(`nameF-${senderId}`).addEventListener("click", () => {
                    localStorage.setItem("friendId", senderId);
                    window.location.href = '../Open Profile/OpenProfile.html';
                });
            }, 0);
        }
    });
});

window.acceptFriendRequest = acceptFriendRequest;
window.rejectFriendRequest = rejectFriendRequest;
