import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc, // Ensure this is imported
    collection, 
    query, 
    where, 
    getDocs 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { 
    getStorage, 
    ref, 
    uploadBytes, 
    getDownloadURL 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";

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
const storage = getStorage(app);

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

// Function to fetch user profile data
async function fetchUserProfile(uid) {
    // First check the new 'profile' collection
    const profileDocRef = doc(db, "profile", uid);
    const profileDocSnap = await getDoc(profileDocRef);
    
    // If profile doesn't exist, create it from user data
    if (!profileDocSnap.exists()) {
        const userDocRef = doc(db, "users", uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
            // Created profile doc with empty profilePicture
            await setDoc(profileDocRef, {
                name: userDocSnap.data().name,
                email: userDocSnap.data().email,
                profilePicture: ""
            });
            return { ...userDocSnap.data(), profilePicture: "" };
        }
        return null;
    }
    return profileDocSnap.data();
}


document.getElementById("toggleInputBtn").addEventListener("click", function () {
    const inputField = document.getElementById("profilePictureUrl");
    const saveButton = document.getElementById("saveProfilePictureUrl");

    // Toggle display between 'none' and 'block'
    if (inputField.style.display === "none") {
        inputField.style.display = "block";
        saveButton.style.display = "block";
    } else {
        inputField.style.display = "none";
        saveButton.style.display = "none";
    }
});

// Function to update the profile information in the DOM
async function updateProfileInfo(uid) {
    const userData = await fetchUserProfile(uid);
    if (userData) {
        // Update header username
        document.getElementById('username').textContent = userData.name || 'Guest';
        // Update profile section
        displayProfile(userData);
    }
}

// Function to fetch user listings from Firestore
async function fetchUserListings(uid) {
    const listingsRef = collection(db, "listings");
    const q = query(listingsRef, where("userId", "==", uid));
    const querySnapshot = await getDocs(q);
    
    const listings = [];
    querySnapshot.forEach((doc) => {
        listings.push({ id: doc.id, ...doc.data() });
    });
    return listings;
}

// Function to display profile information
function displayProfile(userData) {
    const profileName = document.getElementById('profileUsername');
    const profileEmail = document.getElementById('profileEmail');
    const profilePicture = document.getElementById('profilePicture');
    
    profileName.textContent = userData.name || 'User';
    profileEmail.textContent = userData.email || 'No email provided';

    if (userData.profilePicture) {
        profilePicture.innerHTML = `<img src="${userData.profilePicture}" alt="Profile Picture">`;
    } else {
        profilePicture.innerHTML = `<div class="default-avatar"></div>`;
    }
}

// Function to handle profile picture URL updates
async function saveProfilePictureUrl() {
    const user = auth.currentUser;
    if (!user) {
        alert("You must be logged in to update your profile picture.");
        return;
    }

    const urlInput = document.getElementById('profilePictureUrl');
    const newUrl = urlInput.value.trim();

    if (!newUrl) {
        alert("Please enter a valid URL.");
        return;
    }

    try {
        // Simple URL validation
        new URL(newUrl);
        
        // Update Firestore
        const profileDocRef = doc(db, "profile", user.uid);
        await updateDoc(profileDocRef, { profilePicture: newUrl });

        // Update UI
        const profilePicture = document.getElementById('profilePicture');
        if (profilePicture) {
            profilePicture.innerHTML = `<img src="${newUrl}" alt="Profile Picture">`;
        }

        urlInput.value = ''; // Clear input
        alert("Profile picture updated successfully!");
    } catch (error) {
        console.error("Error updating profile picture:", error);
        alert("Invalid URL or update failed. Please try again.");
    }
}

// Add event listener for the save button
document.getElementById('saveProfilePictureUrl')?.addEventListener('click', saveProfilePictureUrl);

// Function to display user listings
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
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', listingHTML);
    });
}

// Listen for auth state changes and update the profile dynamically
onAuthStateChanged(auth, async (user) => {
    const userInfoElement = document.querySelector("#username");
    if (user) {
        await updateProfileInfo(user.uid); // This now triggers displayProfile()
        // Fetch and display listings
        const listings = await fetchUserListings(user.uid);
        displayListings(listings);
    } else {
        userInfoElement.textContent = "Guest";
    }
});