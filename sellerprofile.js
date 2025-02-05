import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    getDoc,
    collection // Add this import
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";


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

// Get the seller ID from the URL
const urlParams = new URLSearchParams(window.location.search);
const sellerId = urlParams.get('id');
console.log("Seller ID from URL:", sellerId);

if (!sellerId) {
    alert("Invalid seller ID.");
    window.location.href = "home.html"; // Redirect to home page if no seller ID is provided
}

// Function to fetch seller details from Firestore
async function fetchSellerDetails(listingId) {
    try {
        // 1. Get the listing document
        const listingDocRef = doc(db, "listings", listingId);
        const listingDocSnap = await getDoc(listingDocRef);

        if (!listingDocSnap.exists()) {
            console.error("Listing not found for ID:", listingId);
            return null;
        }

        // 2. Extract ownerId from the listing
        const listingData = listingDocSnap.data();
        const ownerId = listingData.ownerId; // Ensure this field name matches your listings collection

        if (!ownerId) {
            console.error("No ownerId found in listing:", listingId);
            return null;
        }

        // 3. Get user details using the ownerId
        const sellerDocRef = doc(db, "profiles", ownerId);
        const sellerDocSnap = await getDoc(sellerDocRef);

        if (!sellerDocSnap.exists()) {
            console.error("Profile not found for ID:", sellerId);
            return null;
        }

        return sellerDocSnap.data();
    } catch (error) {
        console.error("Error fetching profile:", error);
        return null;
    }
}

// Function to display seller details in the profile section
function displaySellerProfile(sellerData) {
    const profileUsername = document.getElementById('profileUsername');
    const profileEmail = document.getElementById('profileEmail');

    if (sellerData) {
        // Update the seller's name and email
        profileUsername.textContent = sellerData.name || "Seller Name Not Found";
        profileEmail.textContent = sellerData.email || "No email provided";
    } else {
        // Handle case where seller data is not found
        profileUsername.textContent = "Seller Not Found";
        profileEmail.textContent = "No email provided";
    }
}

// Fetch and display seller details when the page loads
async function loadSellerProfile() {
    if (sellerId) {
        const sellerData = await fetchSellerDetails(sellerId); // sellerId is actually a listing ID
        displaySellerProfile(sellerData);
    }
}

// Listen for auth state changes (optional, if you need to handle authentication)
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User is logged in:", user.uid);
    } else {
        console.log("User is not logged in.");
    }
});

// Load the seller profile when the page loads
window.onload = loadSellerProfile;


