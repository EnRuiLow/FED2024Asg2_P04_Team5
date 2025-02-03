// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc 
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

// Coupon values
const couponValues = [1, 2, 3, 4, 5, 5, 5];

let currentUser = null;
let userData = null;

// Login form submission
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      alert("Login successful!");
      currentUser = userCredential.user;
      await initializeUserData();

      // After successful authentication, redirect to home.html
      window.location.href = "home.html";

    } catch (error) {
      alert("Failed to log in: " + error.message);
    }
  });
});

// Track authentication state
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    await initializeUserData();
  }
});

// Initialize user data in Firestore
async function initializeUserData() {
  const userRef = doc(db, "users", currentUser.uid);
  const docSnap = await getDoc(userRef);

  if (!docSnap.exists()) {
    // New user initialization
    await setDoc(userRef, {
      currentDay: 0,
      lastClaimed: "2000-01-01", // Default old date
      totalRewards: 0
    });
  }

  userData = (await getDoc(userRef)).data();
}

// Update the UI with the current progress and coupon value
function updateTrackerUI() {
  const progress = (userData.currentDay + 1) / couponValues.length * 100;
  document.getElementById('progress').style.width = `${progress}%`;
  document.getElementById('coupon').textContent = 
    `Today's Coupon: $${couponValues[userData.currentDay]}`;
}

// Handle reward claim
async function handleClaim() {
  const today = new Date();
  const userRef = doc(db, "users", currentUser.uid);

  // Update user data
  const newDay = (userData.currentDay + 1) % couponValues.length;
  const newTotal = userData.totalRewards + couponValues[userData.currentDay];

  await setDoc(userRef, {
    currentDay: newDay,
    lastClaimed: today.toISOString(),
    totalRewards: newTotal
  }, { merge: true });

  alert(`Claimed $${couponValues[userData.currentDay]}! Total: $${newTotal}`);
}

// Event listeners
document.getElementById('claimButton').addEventListener('click', handleClaim);
document.getElementById('couponPopup').addEventListener('click', (e) => {
  if (e.target === document.getElementById('couponPopup')) closeCouponPopup();
});

// Close the coupon pop-up
function closeCouponPopup() {
  document.getElementById('couponPopup').style.display = 'none';
}
