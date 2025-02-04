import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAw1ITeg1Vgb1r4BEC3j7G_LpaoHMS1v78",
  authDomain: "p04-team5.firebaseapp.com",
  projectId: "p04-team5",
  storageBucket: "p04-team5.appspot.com",
  messagingSenderId: "88767932375",
  appId: "1:88767932375:web:08c1c4fe7cc99688e1cd92",
  measurementId: "G-BKQ9JDGZ9G"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const urlParams = new URLSearchParams(window.location.search);
const listingId = urlParams.get("id");

if (!listingId) {
    alert("Invalid listing ID.");
    window.location.href = "index.html";
}

let currentUserId = null;
let sellerId = null;

// Function to fetch user's name from Firestore
async function fetchUserName(uid) {
    const userDocRef = doc(db, "users", uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
        return userDocSnap.data().name; // Get 'name' field from Firestore
    } else {
        console.log("No user document found!");
        return "Guest"; // Default name if user data isn't found
    }
}

// Listen for auth state changes and update the username dynamically
onAuthStateChanged(auth, async (user) => {
    const userInfoElement = document.querySelector("#username"); // Ensure the element has this ID in HTML
    if (user && userInfoElement) {
        const userName = await fetchUserName(user.uid);
        userInfoElement.textContent = userName;
    } else if (userInfoElement) {
        userInfoElement.textContent = "Guest";
    }
});


// Fetch listing details and seller info
async function fetchListingDetails() {
    const docRef = doc(db, "listings", listingId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        document.getElementById("listingTitle").innerText = data.title;
        document.getElementById("listingPrice").innerText = `S$${data.price}`;
        document.getElementById("listingDescription").innerText = data.description;
        document.getElementById("listingImage").src = data.imageUrl;

        // Fetch seller details
        sellerId = data.ownerId; // Store seller ID
        const sellerRef = doc(db, "users", sellerId);
        const sellerSnap = await getDoc(sellerRef);

        if (sellerSnap.exists()) {
            const sellerData = sellerSnap.data();
            document.getElementById("sellerName").innerText = sellerData.name || `@${sellerId}`;
            document.getElementById("sellerRating").innerText = sellerData.rating || "N/A";
            document.getElementById("sellerReviews").innerText = sellerData.reviews || 0;
        }
    } else {
        alert("Listing not found.");
        window.location.href = "index.html";
    }
}

// Function to create a chatroom between the current user and the seller
async function createChatRoom() {
    if (!currentUserId || !sellerId) {
        alert("Error: User or seller information is missing.");
        return;
    }

    if (currentUserId === sellerId) {
        alert("You cannot chat with yourself.");
        return;
    }

    try {
        // Create a unique chat ID (combine user IDs in alphabetical order)
        const chatId = [currentUserId, sellerId].sort().join("_");

        // Check if the chatroom already exists
        const chatRef = doc(db, `chats`, chatId);
        const chatSnap = await getDoc(chatRef);

        if (!chatSnap.exists()) {
            // Create a new chatroom
            await setDoc(chatRef, {
                participants: [currentUserId, sellerId],
                createdAt: new Date(),
            });
            console.log("Chatroom created successfully!");
        }

        // Redirect to the chat page with the chat ID
        window.location.href = `chat.html?chatId=${chatId}`;
    } catch (error) {
        console.error("Error creating chatroom:", error);
        alert("An error occurred while creating the chatroom.");
    }
}

// Attach event listener to the "Chat with Seller" button
document.getElementById("chatButton").addEventListener("click", createChatRoom);

// Wait for user authentication
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUserId = user.uid; // Store current user ID
        fetchListingDetails();
    } else {
        alert("Please log in to chat with the seller.");
        window.location.href = "index.html"; // Redirect to login page
    }
});