import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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

// Function to fetch user's name from Firestore
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

// Listen for auth state changes and update the username dynamically
onAuthStateChanged(auth, async (user) => {
    const userInfoElement = document.querySelector("#username"); // Ensure the element has this ID in HTML
    if (user && userInfoElement) {
        const userName = await fetchUserName(user.uid);
        userInfoElement.textContent = userName;
    } else if (userInfoElement) {
        userInfoElement.textContent = "Guest";
    }
});