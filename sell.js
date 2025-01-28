// Import necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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
const imageUrlInput = document.getElementById("imageUrl"); // Input for the image URL instead of file upload

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
  const imageUrl = imageUrlInput.value; // Get the image URL from the input

  if (!imageUrl) {
    alert("Please provide an image URL.");
    return;
  }

  try {
    // Create a new listing in Firestore with the image URL
    await addDoc(collection(db, "listings"), {
      title: title,
      price: parseFloat(price),
      description: description,
      imageUrl: imageUrl,  // Save the image URL in Firestore
      ownerId: user.uid,   // Use the current user's ID
      createdAt: serverTimestamp()  // Add timestamp for listing creation
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


  

  