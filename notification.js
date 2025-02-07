// Import necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, getDocs, onSnapshot } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { doc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Firebase configuration and initialization
const firebaseConfig = {
  apiKey: "AIzaSyAw1ITeg1Vgb1r4BEC3j7G_LpaoHMS1v78",
  authDomain: "p04-team5.firebaseapp.com",
  projectId: "p04-team5",
  storageBucket: "p04-team5.appspot.com",
  messagingSenderId: "88767932375",
  appId: "1:88767932375:web:08c1c4fe7cc99688e1cd92",
  measurementId: "G-BKQ9JDGZ9G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let currentUserId = null;

// Listen for auth state changes and update the username dynamically
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUserId = user.uid; // Store current user ID

        // Fetch user's name from Firestore
        const userDocRef = doc(db, "users", currentUserId);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const userName = userDocSnap.data().name; // Get 'name' field from Firestore
            document.getElementById("username").textContent = userName;
        } else {
            console.log("No user document found!");
            document.getElementById("username").textContent = "Guest"; // Default name if user data isn't found
        }

        // Display notifications
        const notificationContainer = document.getElementById("notification-container");
        const notificationRef = collection(db, "offers");
        onSnapshot(notificationRef, (querySnapshot) => {
            notificationContainer.innerHTML = "";
            querySnapshot.forEach((doc) => {
                const notification = doc.data();
                if (notification.sellerId === currentUserId || notification.buyerId === currentUserId) {
                    const notificationHTML = `
                        <div class="notification" data-listing-id="${notification.listingId}">
                            <div class="message">New offer of S$${notification.offerAmount} for listing ${notification.listingId}</div>
                            <div class="timestamp">${notification.createdAt.toDate().toLocaleString()}</div>
                        </div>
                    `;
                    notificationContainer.insertAdjacentHTML("beforeend", notificationHTML);
                }
            });

            // Add event listener to notifications
            const notifications = document.querySelectorAll(".notification");
            notifications.forEach((notification) => {
                notification.addEventListener("click", () => {
                    const listingId = notification.getAttribute("data-listing-id");
                    window.location.href = `sellpage.html?id=${listingId}`;
                });
            });
        });
    }
});