// Import necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, Timestamp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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

  const title = titleInput.value.trim();
  const price = priceInput.value.trim();
  const description = descriptionInput.value.trim();
  const imageUrl = imageUrlInput.value.trim();

  // Validate price format
  const priceRegex = /^\d+(\.\d{1,2})?$/; // Allows 5, 5.9, 5.99
  if (!priceRegex.test(price)) {
    alert("Please enter a valid price with up to two decimal places (e.g., 5, 5.9, 5.99)");
    return;
  }

  // Convert to float and validate numerical value
  let priceNumber = parseFloat(price);
  if (isNaN(priceNumber) || priceNumber <= 0) {
    alert("Please enter a valid positive number for price");
    return;
  }

  // Round to 2 decimal places
  priceNumber = Math.round(priceNumber * 100) / 100;

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
      price: priceNumber,
      description: description,
      imageUrl: imageUrl,
      ownerId: user.uid,
      createdAt: serverTimestamp(),
      expiresAt: Timestamp.fromDate(expiryDate)
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