import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    getDoc,
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

// Get the owner ID from the URL
const urlParams = new URLSearchParams(window.location.search);
const ownerId = urlParams.get('ownerId');  // Use 'ownerId' instead of 'id'
console.log("Full URL:", window.location.href);
console.log("URL Search Params:", window.location.search);
console.log("Owner ID from URL:", ownerId);
console.log("Owner ID:", ownerId);


// Function to fetch seller details from Firestore
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
        const sellerRef = doc(db, "profile", sellerId); // Ensure collection name is "profile"
        const sellerSnap = await getDoc(sellerRef);

        if (sellerSnap.exists()) {
            const sellerData = sellerSnap.data();

            // Update seller info
            const sellerNameElement = document.getElementById("sellerName");
            const sellerProfileLink = document.getElementById("sellerProfileLink");

            sellerNameElement.textContent = sellerData.name || `@${sellerId}`; // Set seller name
            sellerProfileLink.href = `sellerprofile.html?ownerId=${sellerId}`; // Set profile link
            document.getElementById("sellerRating").textContent = sellerData.rating || "N/A";
            document.getElementById("sellerReviews").textContent = sellerData.reviews || 0;
        } else {
            console.error("Seller profile not found.");
        }
    } else {
        alert("Listing not found.");
        window.location.href = "index.html";
    }
}

// Function to display seller details in the profile section
function displaySellerProfile(sellerData) {
    const profileUsername = document.getElementById('profileUsername');
    const profileEmail = document.getElementById('profileEmail');
    const profilePicture = document.getElementById('profilePicture');
    const sellerRating = document.getElementById('sellerRating');
    const sellerReviews = document.getElementById('sellerReviews');

    if (sellerData) {
        profileUsername.textContent = sellerData.name || "Seller Name Not Found";
        profileEmail.textContent = sellerData.email || "No email provided";
        profilePicture.src = sellerData.profilePicture || "default-avatar.jpg";
        sellerRating.textContent = sellerData.rating || "N/A";
        sellerReviews.textContent = sellerData.reviews || 0;
    } else {
        profileUsername.textContent = "Seller Not Found";
        profileEmail.textContent = "No email provided";
    }
}

// Fetch and display seller details when the page loads
async function loadSellerProfile() {
    if (ownerId) {  // Use ownerId directly
        const sellerData = await fetchSellerDetails(ownerId);
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