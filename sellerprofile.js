import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    getDoc,
    collection,
    query,
    where,
    getDocs
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

// Debugging: Log the full URL and search parameters
console.log("Full URL:", window.location.href);
console.log("URL Search Params:", window.location.search);

// Get the owner ID from the URL
const urlParams = new URLSearchParams(window.location.search);
const ownerId = urlParams.get('ownerId');

// Debugging: Log the ownerId
console.log("Owner ID from URL:", ownerId);

if (!ownerId) {
    console.error("No ownerId found in URL parameters");
    alert("Seller profile cannot be loaded. Missing owner ID.");
    window.location.href = "home.html";
}

// Function to fetch user name
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

// Function to fetch user email
async function fetchUserEmail(uid) {
    const userDocRef = doc(db, "users", uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
        return userDocSnap.data().email; // Get 'email' field from Firestore
    } else {
        console.log("No user document found!");
        return "No email found"; // Default email if user data isn't found
    }
}

// Fetch seller's profile details from Firestore
async function fetchSellerDetails(ownerId) {
    const sellerRef = doc(db, "profile", ownerId);
    const sellerSnap = await getDoc(sellerRef);

    if (sellerSnap.exists()) {
        return sellerSnap.data();
    } else {
        console.error("Seller profile not found.");
        return null;
    }
}

// Fetch seller's listings from Firestore
async function fetchSellerListings(ownerId) {
    const listingsRef = collection(db, "listings");
    const q = query(listingsRef, where("ownerId", "==", ownerId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Display seller's profile information
function displaySellerProfile(sellerData) {
    const profileUsername = document.getElementById('profileUsername');
    const profileEmail = document.getElementById('profileEmail');
    const sellerProfilePicture = document.getElementById('sellerProfilePicture');
    const sellerProfileLink = document.getElementById('sellerProfileLink');
    const sellerRating = document.getElementById('sellerRating');
    const sellerReviews = document.getElementById('sellerReviews');

    if (sellerData) {
        profileUsername.textContent = sellerData.name || "Seller Name Not Found";
        profileEmail.textContent = sellerData.email || "No email provided";
        sellerProfilePicture.src = sellerData.profilePicture || "default-avatar.jpg";
        sellerProfileLink.textContent = sellerData.name || `@${ownerId}`;
        sellerProfileLink.href = `sellerprofile.html?ownerId=${ownerId}`;
        sellerRating.textContent = sellerData.rating || "N/A";
        sellerReviews.textContent = sellerData.reviews || "0";
    } else {
        profileUsername.textContent = "Seller Not Found";
        profileEmail.textContent = "No email provided";
        sellerProfilePicture.src = "default-avatar.jpg";
        sellerProfileLink.textContent = "Seller Not Found";
    }
}

// Display seller's listings
function displayListings(listings) {
    const container = document.getElementById('userListings');
    container.innerHTML = '';

    if (listings.length === 0) {
        container.innerHTML = '<p>No listings found.</p>';
        return;
    }

    listings.forEach(listing => {
        const listingHTML = `
            <div class="listing-card">
                <img src="${listing.imageUrl || 'placeholder-image.jpg'}" class="listing-icon" alt="Listing">
                <div class="listing-content">
                    <h3>${listing.title}</h3>
                    <p>${listing.description}</p>
                    <p>Price: S$${listing.price}</p>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', listingHTML);
    });
}

// Load seller profile and listings
async function loadSellerProfile() {
    if (ownerId) {
        const sellerData = await fetchSellerDetails(ownerId);
        displaySellerProfile(sellerData);

        const listings = await fetchSellerListings(ownerId);
        displayListings(listings);
    }
}

// Check auth state (optional)
onAuthStateChanged(auth, async (user) => {
    const usernameButton = document.getElementById('username');
    if (user) {
        console.log("User is logged in:", user.uid);
        try {
            // Fetch from 'profile' collection first
            const profileRef = doc(db, "profile", user.uid);
            const profileSnap = await getDoc(profileRef);
            
            if (profileSnap.exists()) {
                const profileData = profileSnap.data();
                usernameButton.textContent = profileData.name || "User";
            } else {
                // Fallback to 'users' collection if profile doesn't exist
                const userDocRef = doc(db, "users", user.uid);
                const userDocSnap = await getDoc(userDocRef);
                usernameButton.textContent = userDocSnap.exists() ? userDocSnap.data().name : "User";
            }
        } catch (error) {
            console.error("Error fetching user name:", error);
            usernameButton.textContent = "User";
        }
    } else {
        console.log("User is not logged in.");
        usernameButton.textContent = "Guest"; // Or keep "Loading..." if preferred
    }
});


// Load the seller profile when the page loads
window.onload = loadSellerProfile;