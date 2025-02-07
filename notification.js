// Import necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  onSnapshot,
  updateDoc,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  addDoc,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Firebase configuration and initialization
const firebaseConfig = {
  apiKey: "AIzaSyAw1ITeg1Vgb1r4BEC3j7G_LpaoHMS1v78",
  authDomain: "p04-team5.firebaseapp.com",
  projectId: "p04-team5",
  storageBucket: "p04-team5.appspot.com",
  messagingSenderId: "88767932375",
  appId: "1:88767932375:web:08c1c4fe7cc99688e1cd92",
  measurementId: "G-BKQ9JDGZ9G",
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
    const offerRef = collection(db, "offers");
    const notificationRef = collection(db, "notifications");

    // Combine offers and notifications into a single snapshot listener
    onSnapshot(offerRef, (offerSnapshot) => {
      onSnapshot(notificationRef, (notificationSnapshot) => {
        notificationContainer.innerHTML = ""; // Clear existing notifications

        // Render offers
        offerSnapshot.forEach((doc) => {
          const notification = doc.data();
          const paymentStatus = notification.status === "paid" ? "Paid" : "Unpaid"; // Determine payment status

          // Check if the current user is the seller
          if (notification.sellerId === currentUserId) {
            // Seller's notification (includes payment status and accept/decline buttons)
            const notificationHTML = `
              <div class="notification" data-notification-id="${doc.id}" data-listing-id="${notification.listingId}">
                <div class="message">New offer of S$${notification.offerAmount} for listing ${notification.listingId}.</div>
                <div class="payment-status"><strong>Payment Status:</strong> ${paymentStatus}</div>
                <div class="timestamp">${notification.createdAt.toDate().toLocaleString()}</div>
                ${paymentStatus === "Unpaid" ? `
                  <div class="actions">
                    <button class="accept-button" data-notification-id="${doc.id}" data-listing-id="${notification.listingId}">Accept</button>
                    <button class="decline-button" data-notification-id="${doc.id}" data-listing-id="${notification.listingId}">Decline</button>
                  </div>
                ` : ""}
              </div>
            `;
            notificationContainer.insertAdjacentHTML("beforeend", notificationHTML);
          }

          // Check if the current user is the buyer
          if (notification.buyerId === currentUserId) {
            // Buyer's notification (redirects to payment.html on clicking "Pay")
            const notificationHTML = `
              <div class="notification" data-notification-id="${doc.id}" data-listing-id="${notification.listingId}">
                <div class="message">Your offer of S$${notification.offerAmount} for listing ${notification.listingId} is ${notification.status}</div>
                <div class="timestamp">${notification.createdAt.toDate().toLocaleString()}</div>
                ${notification.status === "accepted" ? `
                  <div class="actions">
                    <button class="pay-now-button" data-notification-id="${doc.id}" data-listing-id="${notification.listingId}">Pay</button>
                  </div>
                ` : ""}
                ${notification.status === "paid" ? `
                  <div class="actions">
                    <button class="confirm-delivery-button" data-notification-id="${doc.id}" data-listing-id="${notification.listingId}">Confirm Delivery</button>
                  </div>
                ` : ""}
              </div>
            `;
            notificationContainer.insertAdjacentHTML("beforeend", notificationHTML);
          }
        });

        // Render notifications
        notificationSnapshot.forEach((doc) => {
          const notification = doc.data();

          // Check if the current user is the buyer
          if (notification.buyerId === currentUserId) {
            const notificationHTML = `
              <div class="notification" data-notification-id="${doc.id}" data-listing-id="${notification.listingId}">
                <div class="message">${notification.message}</div>
                <div class="timestamp">${notification.createdAt.toDate().toLocaleString()}</div>
              </div>
            `;
            notificationContainer.insertAdjacentHTML("beforeend", notificationHTML);
          }
        });

        // Add event listeners to buttons after rendering
        const acceptButtons = document.querySelectorAll(".accept-button");
        const declineButtons = document.querySelectorAll(".decline-button");
        const payButtons = document.querySelectorAll(".pay-now-button");
        const confirmDeliveryButtons = document.querySelectorAll(".confirm-delivery-button");

        acceptButtons.forEach((button) => {
          button.addEventListener("click", (event) => {
            const notificationId = event.target.getAttribute("data-notification-id");
            const listingId = event.target.getAttribute("data-listing-id");
            acceptOffer(notificationId, listingId);
          });
        });

        declineButtons.forEach((button) => {
          button.addEventListener("click", (event) => {
            const notificationId = event.target.getAttribute("data-notification-id");
            const listingId = event.target.getAttribute("data-listing-id");
            declineOffer(notificationId, listingId);
          });
        });

        payButtons.forEach((button) => {
          button.addEventListener("click", (event) => {
            const notificationId = event.target.getAttribute("data-notification-id");
            const listingId = event.target.getAttribute("data-listing-id");
            redirectToPaymentPage(notificationId, listingId);
          });
        });

        confirmDeliveryButtons.forEach((button) => {
          button.addEventListener("click", (event) => {
            const notificationId = event.target.getAttribute("data-notification-id");
            const listingId = event.target.getAttribute("data-listing-id");
            confirmDelivery(notificationId, listingId);
          });
        });
      });
    });
  }
});

// Accept offer
async function acceptOffer(notificationId, listingId) {
  const offerRef = doc(db, "offers", notificationId);
  await updateDoc(offerRef, {
    status: "accepted",
  });
  sendNotification(listingId, "Offer accepted!");
}

// Decline offer
async function declineOffer(notificationId, listingId) {
  const offerRef = doc(db, "offers", notificationId);
  const offerSnap = await getDoc(offerRef);

  if (offerSnap.exists()) {
    const offerData = offerSnap.data();
    const buyerId = offerData.buyerId; // Get the buyer's ID from the offer

    // Delete the offer
    await deleteDoc(offerRef);

    // Send a notification to the buyer
    await sendNotification(buyerId, "Your offer has been declined.", listingId);
  } else {
    console.error("Offer not found!");
  }
}

// Redirect to Payment Page (Instead of marking as paid directly)
function redirectToPaymentPage(notificationId, listingId) {
  window.location.href = `payment.html?id=${listingId}&offerId=${notificationId}`;
}

// Confirm delivery & delete offer document
async function confirmDelivery(notificationId, listingId) {
  const offerRef = doc(db, "offers", notificationId);
  await deleteDoc(offerRef);
  sendNotification(listingId, "Delivery confirmed!");
}

// Send notification
async function sendNotification(buyerId, message, listingId) {
  const notificationRef = collection(db, "notifications");
  await addDoc(notificationRef, {
    buyerId: buyerId, // Send notification to the buyer
    listingId: listingId,
    message: message,
    createdAt: new Date(),
  });
}