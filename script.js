// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Your Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyAw1ITeg1Vgb1r4BEC3j7G_LpaoHMS1v78",
  authDomain: "p04-team5.firebaseapp.com",
  projectId: "p04-team5",
  storageBucket: "p04-team5.firebasestorage.app",
  messagingSenderId: "88767932375",
  appId: "1:88767932375:web:08c1c4fe7cc99688e1cd92",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log("Firebase initialized:", app.name);

// Set up Firebase Authentication
const auth = getAuth(app);

// Example: Sign up a user with email and password
createUserWithEmailAndPassword(auth, "user@example.com", "password123")
  .then((userCredential) => {
    console.log("User signed up:", userCredential.user);
  })
  .catch((error) => {
    console.error("Error signing up:", error);
  });

// Initialize Firestore
const db = getFirestore(app);

// Example: Save user data
addDoc(collection(db, "users"), {
  uid: "USER_ID",
  name: "John Doe",
  email: "user@example.com",
  password: "password123",
})
  .then(() => {
    console.log("User data saved!");
  })
  .catch((error) => {
    console.error("Error saving user data:", error);
  });

