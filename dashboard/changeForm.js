// active class for the current page
const navLinks = document.querySelectorAll(".nav-link");
navLinks.forEach((link) => {
  link.addEventListener("click", function (event) {
    // Check if the clicked link is the Logout button
    if (this.id === "logout-btn") {
      // Prevent default behavior for the Logout button
      event.preventDefault();
      // Handle logout logic here (e.g., clear session, redirect to login page, etc.)
      console.log("Logout clicked"); // Replace with actual logout logic
    } else {
      // Navigate to the appropriate page based on the link clicked
      switch (this.id) {
        case "notifications":
          window.location.href = "../Notification/notification.html"; // Adjust the path as necessary
          break;
        case "create-post":
          window.location.href = "../Createpost/create_post.html"; // Adjust the path as necessary
          break;
        case "friend-requests":
          window.location.href = "../FriendRequests/friend-requests.html"; // Adjust the path as necessary
          break;
        case "chat":
          window.location.href = "../Chat/chat.html"; // Adjust the path as necessary
          break;
        case "profile":
          window.location.href = "../Profile/profile.html"; // Adjust the path as necessary
          break;
        case "home":
          window.location.href = "../Home/home.html"; // Adjust the path as necessary
          break;
        default:
          break;
      }
    }

    // Remove 'active' class from all links
    navLinks.forEach((nav) => nav.classList.remove("active"));

    // Add 'active' class to the clicked link
    this.classList.add("active");
  });
});

