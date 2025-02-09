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
  storageBucket: "p04-team5.appspot.com",
  messagingSenderId: "88767932375",
  appId: "1:88767932375:web:08c1c4fe7cc99688e1cd92",
  measurementId: "G-BKQ9JDGZ9G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Wheel probabilities
const wheelProbabilities = [
  { value: 0, chance: 20 },
  { value: 1, chance: 45 },
  { value: 2, chance: 28 },
  { value: 4, chance: 5 },
  { value: 8, chance: 2 }
];

let currentUser = null;
let userRewards = null;

// Track authentication state
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    await initializeUserRewards();
  } else {
    currentUser = null;
  }
});

// Login form submission
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      currentUser = userCredential.user;
      await initializeUserRewards();

      const today = new Date().toDateString();
      const lastClaimedDate = new Date(userRewards.lastClaimed).toDateString();

      if (lastClaimedDate !== today) {
        showTokenPopup();
      } else {
        redirectToHome();
      }
      
    } catch (error) {
      alert("Failed to log in: " + error.message);
    }
  });
});

// Initialize or fetch user rewards in Firestore
async function initializeUserRewards() {
  if (!currentUser) {
    console.error("No user is currently logged in.");
    return;
  }

  const userRef = doc(db, "user_rewards", currentUser.uid);
  const docSnap = await getDoc(userRef);

  if (!docSnap.exists()) {
    await setDoc(userRef, {
      email: currentUser.email,
      lastClaimed: "2000-01-01",
      totalRewards: 0
    });
  }

  userRewards = (await getDoc(userRef)).data();
}

// Token Popup Functions
function showTokenPopup() {
  document.getElementById('tokenPopup').style.display = 'flex';
}

function closeTokenPopup() {
  document.getElementById('tokenPopup').style.display = 'none';
}

// Wheel Popup Functions
function showWheelPopup() {
  document.getElementById('wheelPopup').style.display = 'flex';
}

function closeWheelPopup() {
  document.getElementById('wheelPopup').style.display = 'none';
}

// Event Listeners
document.getElementById('claimTokenBtn').addEventListener('click', async () => {
  closeTokenPopup();
  showWheelPopup();
});

document.getElementById('spinWheelBtn').addEventListener('click', async () => {
  if (!currentUser) {
    console.error("No user is currently logged in.");
    return;
  }

  const reward = calculateReward();
  const userRef = doc(db, "user_rewards", currentUser.uid);
  
  // Update total earnings
  const newTotal = userRewards.totalRewards + reward;
  await setDoc(userRef, {
    totalRewards: newTotal,
    lastClaimed: new Date().toISOString()
  }, { merge: true });

  // Show result and redirect
  const spinResult = document.getElementById('spinResult');
  spinResult.textContent = `Congratulations, you earned $${reward}! Happy spending!`;
  
  setTimeout(() => {
    closeWheelPopup();
    redirectToHome();
  }, 3000);
});

// Reward calculation function
function calculateReward() {
  const random = Math.random() * 100;
  let cumulative = 0;
  
  for (const { value, chance } of wheelProbabilities) {
    cumulative += chance;
    if (random <= cumulative) return value;
  }
  return 0;
}

document.getElementById('spinWheelBtn').addEventListener('click', async () => {
  if (!currentUser) {
    console.error("No user is currently logged in.");
    return;
  }

  const reward = calculateReward();
  const userRef = doc(db, "user_rewards", currentUser.uid);
  
  // Update total earnings
  const newTotal = userRewards.totalRewards + reward;
  await setDoc(userRef, {
    totalRewards: newTotal,
    lastClaimed: new Date().toISOString()
  }, { merge: true });

  // Spin the wheel
  const wheelInner = document.querySelector('.wheel-inner');
  const spinResult = document.getElementById('spinResult');
  
  // Calculate the rotation based on the reward
  const rotation = 360 * 5 + (reward * 72); // 5 full spins + segment rotation
  wheelInner.style.transform = `rotate(${rotation}deg)`;

  // Show result and redirect
  setTimeout(() => {
    spinResult.textContent = `Congratulations, you earned $${reward}! Happy spending!`;
    
    setTimeout(() => {
      closeWheelPopup();
      redirectToHome();
    }, 3000);
  }, 5000); // Wait for the spin to finish
});

// Redirect user to home.html
function redirectToHome() {
  window.location.href = "html/home.html";
}

