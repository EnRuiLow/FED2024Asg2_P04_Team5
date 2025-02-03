// Import necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, Timestamp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Firebase configuration and initialization
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
const db = getFirestore(app);
const auth = getAuth(app);

// Get references to DOM elements
const sellForm = document.getElementById("sellForm");
const titleInput = document.getElementById("title");
const priceInput = document.getElementById("price");
const descriptionInput = document.getElementById("description");
const imageUrlInput = document.getElementById("imageUrl");

// Form submission handling
sellForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  // Check if the user is authenticated
  const user = auth.currentUser;
  if (!user) {
    alert("You must be logged in to list an item.");
    return;
  }

  const title = titleInput.value;
  const price = priceInput.value;
  const description = descriptionInput.value;
  const imageUrl = imageUrlInput.value;

  if (!imageUrl) {
    alert("Please provide an image URL.");
    return;
  }

  // Set expiry date (30 days from now)
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 30);

  try {
    // Create a new listing with an expiry date
    await addDoc(collection(db, "listings"), {
      title: title,
      price: parseFloat(price),
      description: description,
      imageUrl: imageUrl,
      ownerId: user.uid,
      createdAt: serverTimestamp(),
      expiresAt: Timestamp.fromDate(expiryDate) // Store expiry date in Firestore
    });

    alert("Item listed successfully!");
    sellForm.reset();
  } catch (error) {
    console.error("Error listing item: ", error);
    alert("Failed to list the item. Please try again.");
  }
});

// Check if the user is logged in on page load
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User logged in:", user);
  } else {
    console.log("No user logged in");
  }
});

// 🔥 Delete expired listings when page loads
async function deleteExpiredListings() {
  const now = new Date();
  const querySnapshot = await getDocs(collection(db, "listings"));

  querySnapshot.forEach(async (docSnapshot) => {
    const data = docSnapshot.data();
    if (data.expiresAt && data.expiresAt.toDate() <= now) {
      await deleteDoc(doc(db, "listings", docSnapshot.id));
      console.log(`Deleted expired listing: ${docSnapshot.id}`);
    }
  });
}

// Run cleanup on page load
deleteExpiredListings();



  

  