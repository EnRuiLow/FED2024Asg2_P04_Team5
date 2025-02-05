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
    const userDocRef = doc(db, "users", uid);
    const userDocSnap = await getDoc(userDocRef);
    
    console.log("Fetched user data:", userDocSnap.data()); // Add this line
    
    if (userDocSnap.exists()) {
        return userDocSnap.data();
    } else {
        console.log("No user document found!");
        return null;
    }
}

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
        profilePicture.innerHTML = `
            <div class="default-avatar"></div>
            <input type="file" id="profilePictureUpload" accept="image/*" style="display: none;">
            <button onclick="document.getElementById('profilePictureUpload').click()">Upload Picture</button>
        `;
        setupProfilePictureUpload();
    }
}

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

// Function to handle profile picture upload
function setupProfilePictureUpload() {
    const uploadInput = document.getElementById('profilePictureUpload');
    if (!uploadInput) return;

    uploadInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const user = auth.currentUser;
        if (!user) {
            alert("You must be logged in to upload a profile picture.");
            return;
        }

        try {
            // Create a reference to the user's profile picture in Firebase Storage
            const storageRef = ref(storage, `profile-pictures/${user.uid}`);

            // Upload the new file to Firebase Storage (this will overwrite the existing file)
            await uploadBytes(storageRef, file);

            // Get the download URL of the uploaded file
            const downloadURL = await getDownloadURL(storageRef);

            // Update the user's profile in Firestore with the new profile picture URL
            const userDocRef = doc(db, "users", user.uid);
            await setDoc(userDocRef, { profilePicture: downloadURL }, { merge: true });

            // Update the profile picture display in the DOM
            const profilePicture = document.getElementById('profilePicture');
            profilePicture.innerHTML = `<img src="${downloadURL}" alt="Profile Picture">`;

            alert("Profile picture updated successfully!");
        } catch (error) {
            console.error("Error uploading profile picture:", error);
            alert("Failed to upload profile picture. Please try again.");
        }
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