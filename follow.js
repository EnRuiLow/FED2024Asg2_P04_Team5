// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { 
  getAuth, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAw1ITeg1Vgb1r4BEC3j7G_LpaoHMS1v78",
  authDomain: "p04-team5.firebaseapp.com",
  projectId: "p04-team5",
  storageBucket: "p04-team5.firebasestorage.app",
  messagingSenderId: "88767932375",
  appId: "1:88767932375:web:08c1c4fe7cc99688e1cd92",
  measurementId: "G-BKQ9JDGZ9G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Function to fetch followed users
async function getFollowedUsers(userId) {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return userSnap.data().following || [];
  }
  return [];
}

// Function to fetch listings of followed users
async function getListings(followedUsers) {
  if (followedUsers.length === 0) return [];
  const listingsRef = collection(db, "listings");
  const q = query(listingsRef, where("userId", "in", followedUsers));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data());
}

// Function to display listings in the UI
function displayListings(listings) {
  const updatesContainer = document.getElementById("updates");
  updatesContainer.innerHTML = "";
  listings.forEach(listing => {
    const listingElement = document.createElement("div");
    listingElement.classList.add("listing");
    listingElement.innerHTML = `<strong>${listing.username}</strong> recently posted: ${listing.itemName}`;
    updatesContainer.appendChild(listingElement);
  });
}

// Listen for user authentication state
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const followedUsers = await getFollowedUsers(user.uid);
    const listings = await getListings(followedUsers);
    displayListings(listings);
  }
});
