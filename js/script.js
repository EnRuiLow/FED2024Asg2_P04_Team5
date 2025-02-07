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

// Initialize Firebase Authentication
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app);

// Registration form handler
document.getElementById('registerForm').addEventListener('submit', async function (event) {
  event.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    // Firebase Authentication: Register user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Save user data in Firestore
    await addDoc(collection(db, "users"), {
      uid: userCredential.user.uid,
      name: name,
      email: email,
    });

    alert('Registration successful!');
    window.location.href = 'login.html'; // Redirect to login page
  } catch (error) {
    alert('An error occurred: ' + error.message);
  }
});



// This is for the search bar
document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.querySelector(".search-bar input");
  const productCards = document.querySelectorAll(".product-card");
  const sections = document.querySelectorAll(".section");

  searchInput.addEventListener("input", function () {
      const searchText = searchInput.value.toLowerCase();

      sections.forEach(section => {
          const header = section.querySelector("h2");
          const cards = section.querySelectorAll(".product-card");
          let hasVisibleCard = false;

          cards.forEach(card => {
              const title = card.querySelector("div:nth-of-type(1) b")?.textContent.toLowerCase() || "";
              const descriptions = Array.from(card.querySelectorAll(".description"))
                  .map(desc => desc.textContent.toLowerCase())
                  .join(" ");

              if (title.includes(searchText) || descriptions.includes(searchText)) {
                  card.style.display = "flex"; // Show matching products
                  hasVisibleCard = true;
              } else {
                  card.style.display = "none"; // Hide non-matching products
              }
          });

          // Show or hide the header based on whether any cards are visible
          if (hasVisibleCard) {
              header.style.display = "block";
          } else {
              header.style.display = "none";
          }
      });
  });
});
