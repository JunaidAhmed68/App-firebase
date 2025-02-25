import { auth , sendEmailVerification,showMessage } from '../firebaseConfig.js'; // Import your Firebase configuration

// Function to resend verification email
const resendVerificationEmail = async () => {
    const user = auth.currentUser ; // Get the currently signed-in user
    if (user) {
        try {
            await sendEmailVerification(user);
            showMessage("Verification email resent! Please check your inbox.");
        } catch (error) {
            handleAuthErrors(error);
        }
    } else {
        showMessage("No user is signed in.");
    }
};

// Add an event listener to the resend button
document.getElementById("resend-verification-btn").addEventListener("click", resendVerificationEmail);


// Function to handle authentication errors
const handleAuthErrors = (error) => {
    console.error("Auth Error:", error); // Log error for debugging
    showMessage("An error occurred while resending the verification email. Please try again.");
};