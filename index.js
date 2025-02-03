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
let userRewards = null;

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
      await initializeUserRewards(); // Fetch or create reward tracking data

      // Check if the user has already claimed today
      const today = new Date().toDateString();
      const lastClaimedDate = new Date(userRewards.lastClaimed).toDateString();

      if (lastClaimedDate !== today) {
        showCouponPopup(); // Show coupon pop-up
      } else {
        redirectToHome(); // If already claimed, proceed to home.html
      }
      
    } catch (error) {
      alert("Failed to log in: " + error.message);
    }
  });
});

// Track authentication state
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    await initializeUserRewards();
  }
});

// Initialize or fetch user rewards in Firestore
async function initializeUserRewards() {
  if (!currentUser) return;

  const userRef = doc(db, "user_rewards", currentUser.uid);
  const docSnap = await getDoc(userRef);

  if (!docSnap.exists()) {
    // New user reward initialization
    await setDoc(userRef, {
      email: currentUser.email,
      currentDay: 0,
      lastClaimed: "2000-01-01", // Default old date
      totalRewards: 0
    });
  }

  userRewards = (await getDoc(userRef)).data();
}

// Show coupon pop-up if the reward hasn't been claimed today
function showCouponPopup() {
  document.getElementById('couponPopup').style.display = 'flex';
  updateTrackerUI();
}

// Update the UI with the current progress and coupon value
function updateTrackerUI() {
  const progress = (userRewards.currentDay + 1) / couponValues.length * 100;
  document.getElementById('progress').style.width = `${progress}%`;
  document.getElementById('coupon').textContent = 
    `Today's Coupon: $${couponValues[userRewards.currentDay]}`;
}

// Handle reward claim
async function handleClaim() {
  const today = new Date();
  const userRef = doc(db, "user_rewards", currentUser.uid);

  // Update user rewards
  const newDay = (userRewards.currentDay + 1) % couponValues.length;
  const newTotal = userRewards.totalRewards + couponValues[userRewards.currentDay];

  await setDoc(userRef, {
    email: currentUser.email,
    currentDay: newDay,
    lastClaimed: today.toISOString(),
    totalRewards: newTotal
  }, { merge: true });

  alert(`Claimed $${couponValues[userRewards.currentDay]}! Total: $${newTotal}`);
  closeCouponPopup();
  redirectToHome(); // Redirect after claiming
}

// Redirect user to home.html
function redirectToHome() {
  window.location.href = "home.html";
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
