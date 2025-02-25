// If UID doesn't exist, redirect to the login page
const uid = localStorage.getItem('uid');
if (!uid) {
    window.location.replace('../../index.html');  
}

// Import necessary Firebase functions
import { auth, signOut, db, collection, getDocs, query, where, doc, arrayUnion, writeBatch, deleteDoc , showMessage } from "../../firebaseConfig.js";

// ----------------------------------- Logout Functionality -----------------------------------
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

// ----------------------------------- Accept Friend Request -----------------------------------
async function acceptFriendRequest(requestId, senderId) {
    const userId = localStorage.getItem('uid');
    if (!userId) return;

    try {
        // Fetch sender's user reference
        const senderQuery = query(collection(db, "users"), where("uid", "==", senderId));
        const senderSnapshot = await getDocs(senderQuery);

        if (senderSnapshot.empty) {
            console.error("Sender not found");
            return;
        }

        const senderRef = senderSnapshot.docs[0].ref; 
        const userRef = doc(db, "users", userId);
        const requestRef = doc(db, "friendRequests", requestId);

        // Batch update
        const batch = writeBatch(db);
        batch.update(userRef, { friends: arrayUnion(senderId) });
        batch.update(senderRef, { friends: arrayUnion(userId) });
        batch.delete(requestRef);

        await batch.commit();
        showMessage("Friend request accepted!");
        fetchFriendRequests(); // Refresh list
    } catch (error) {
        console.error("Error accepting friend request:", error);
        showMessage("Error accepting friend request.");
    }
}

// ----------------------------------- Reject Friend Request -----------------------------------
async function rejectFriendRequest(requestId) {
    try {
        await deleteDoc(doc(db, "friendRequests", requestId));
        showMessage("Friend request rejected.");
        fetchFriendRequests(); // Refresh list
    } catch (error) {
        console.error("Error rejecting friend request:", error);
        showMessage("Error rejecting friend request.");
    }
}

// ----------------------------------- Fetch and Display Friend Requests -----------------------------------
async function fetchFriendRequests() {
    const userId = localStorage.getItem('uid');
    if (!userId) return;

    try {
        const q = query(
            collection(db, "friendRequests"),
            where("receiverId", "==", userId),
            where("status", "==", "pending")
        );
        const requestsSnapshot = await getDocs(q);
        const friendRequestsList = document.getElementById('friend-requests-list');
        friendRequestsList.innerHTML = ''; // Clear previous requests

        if (requestsSnapshot.empty) {
            friendRequestsList.innerHTML = '<p>No friend requests.</p>';
            return;
        }

        const requests = await Promise.all(requestsSnapshot.docs.map(async (doc) => {
            const requestData = doc.data();
            const senderId = requestData.senderId;

            // Fetch sender's data
            const senderQuery = query(collection(db, "users"), where("uid", "==", senderId));
            const senderSnapshot = await getDocs(senderQuery);

            if (senderSnapshot.empty) {
                console.error("Sender not found");
                return null;
            }

            const senderData = senderSnapshot.docs[0].data();
            return { id: doc.id, senderId, senderData };
        }));

        requests.filter(request => request !== null).forEach(({ id, senderId, senderData }) => {
            const requestItem = document.createElement('div');
            requestItem.className = 'friend-request-item';
            requestItem.innerHTML = `
                <div>
                    <img src="${senderData.photoURL || 'https://t4.ftcdn.net/jpg/02/15/84/43/360_F_215844325_ttX9YiIIyeaR7Ne6EaLLjMAmy4GvPC69.jpg'}" 
                        alt="${senderData.displayName}" 
                        style="width: 40px; height: 40px; border-radius: 50%;">
                    <span>${senderData.displayName}</span>
                </div>
                <button class="accept-btn" onclick="acceptFriendRequest('${id}', '${senderId}')">Accept</button>
                <button class="reject-btn" onclick="rejectFriendRequest('${id}')">Reject</button>
            `;
            friendRequestsList.appendChild(requestItem);
        });
    } catch (error) {
        console.error("Error fetching friend requests:", error);
    }
}

// Fetch friend requests on page load
fetchFriendRequests();
window.acceptFriendRequest = acceptFriendRequest;
window.rejectFriendRequest = rejectFriendRequest;


































































































































































































































































































































































































































































































































