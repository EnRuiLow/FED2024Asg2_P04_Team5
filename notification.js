// Import necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, getDocs, onSnapshot, updateDoc, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

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
                if (notification.sellerId === currentUserId) {
                    // Seller's notification
                    const notificationHTML = `
                        <div class="notification" data-notification-id="${doc.id}" data-listing-id="${notification.listingId}">
                            <div class="message">New offer of S$${notification.offerAmount} for listing ${notification.listingId}</div>
                            <div class="timestamp">${notification.createdAt.toDate().toLocaleString()}</div>
                            <div class="actions">
                                <button class="accept-button" data-notification-id="${doc.id}" data-listing-id="${notification.listingId}">Accept</button>
                                <button class="decline-button" data-notification-id="${doc.id}" data-listing-id="${notification.listingId}">Decline</button>
                            </div>
                        </div>
                    `;
                    notificationContainer.insertAdjacentHTML("beforeend", notificationHTML);
                } else if (notification.buyerId === currentUserId) {
                    // Buyer's notification
                    const notificationHTML = `
                        <div class="notification" data-notification-id="${doc.id}" data-listing-id="${notification.listingId}">
                            <div class="message">Your offer of S$${notification.offerAmount} for listing ${notification.listingId} is ${notification.status}</div>
                            <div class="timestamp">${notification.createdAt.toDate().toLocaleString()}</div>
                            ${notification.status === "accepted" ? `
                                <div class="actions">
                                    <button class="pay-now-button" data-notification-id="${doc.id}" data-listing-id="${notification.listingId}">Pay</button>
                                </div>
                            ` : ""}
                        </div>
                    `;
                    notificationContainer.insertAdjacentHTML("beforeend", notificationHTML);
                }
            });

            // Add event listener to notifications
            const notifications = document.querySelectorAll(".notification");
            notifications.forEach((notification) => {
                notification.addEventListener("click", (event) => {
                    if (event.target.classList.contains("accept-button")) {
                        const notificationId = event.target.getAttribute("data-notification-id");
                        const listingId = event.target.getAttribute("data-listing-id");
                        acceptOffer(notificationId, listingId);
                    } else if (event.target.classList.contains("decline-button")) {
                        const notificationId = event.target.getAttribute("data-notification-id");
                        const listingId = event.target.getAttribute("data-listing-id");
                        declineOffer(notificationId, listingId);
                    } else if (event.target.classList.contains("pay-now-button")) {
                        const notificationId = event.target.getAttribute("data-notification-id");
                        const listingId = event.target.getAttribute("data-listing-id");
                        window.location.href = `payment.html?id=${listingId}&offerId=${notificationId}`;
                    } else {
                        const listingId = notification.getAttribute("data-listing-id");
                        const message = notification.querySelector(".message").textContent;
                        if (message.includes("accepted") && message.includes("Your offer")) {
                            const notificationId = notification.getAttribute("data-notification-id");
                            window.location.href = `payment.html?id=${listingId}&offerId=${notificationId}`;
                        } else {
                            window.location.href = `sellpage.html?id=${listingId}`;
                        }
                    }
                });
            });
        });
    }
});

async function acceptOffer(notificationId, listingId) {
    const offerRef = doc(db, "offers", notificationId);
    await updateDoc(offerRef, {
        status: "accepted"
    });
    sendNotification(listingId, "Offer accepted!");
}

async function declineOffer(notificationId, listingId) {
    const offerRef = doc(db, "offers", notificationId);
    await updateDoc(offerRef, {
        status: "declined"
    });
    sendNotification(listingId, "Offer declined!");
}

async function sendNotification(listingId, message) {
    // Send notification to buyer
    const notificationRef = collection(db, "notifications");
    const newNotificationRef = doc(notificationRef);
    await setDoc(newNotificationRef, {
        listingId: listingId,
        message: message,
        createdAt: new Date()
    });
}
