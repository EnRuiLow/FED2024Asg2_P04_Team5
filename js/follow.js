import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { 
    getFirestore,
    doc,
    getDoc,
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Complete Firebase Config (same as sellerprofile.js)
const firebaseConfig = {
    apiKey: "AIzaSyAw1ITeg1Vgb1r4BEC3j7G_LpaoHMS1v78",
    authDomain: "p04-team5.firebaseapp.com",
    projectId: "p04-team5", // This was missing in your error
    storageBucket: "p04-team5.appspot.com",
    messagingSenderId: "88767932375",
    appId: "1:88767932375:web:08c1c4fe7cc99688e1cd92",
    measurementId: "G-BKQ9JDGZ9G"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function loadFollowData() {
    const user = auth.currentUser;
    if (!user) {
        window.location.href = 'home.html';
        return;
    }

    try {
        // 1. Get all followed users
        const followingQuery = query(collection(db, "user_following"), where("userEmail", "==", user.email));
        const followingSnapshot = await getDocs(followingQuery);
        const followedEmails = followingSnapshot.docs.map(doc => doc.data().ownerEmail);
        
        // 2. Get all users from profile collection
        const profilesSnapshot = await getDocs(collection(db, "profile"));
        
        // 3. Separate into followed and others
        const [followedUsers, otherUsers] = profilesSnapshot.docs.reduce((acc, doc) => {
            const userData = doc.data();
            followedEmails.includes(userData.email) ? acc[0].push(userData) : acc[1].push(userData);
            return acc;
        }, [[], []]);

        // 4. Render the sections
        renderUsers(followedUsers, otherUsers);
    } catch (error) {
        console.error("Error loading follow data:", error);
        alert("Failed to load follow data. Please try again.");
    }
}

function renderUsers(followedUsers, otherUsers) {
    const container = document.querySelector('.profile-container');
    
    // Clear existing content
    container.innerHTML = '';
    
    // Render followed users
    if (followedUsers.length > 0) {
        container.insertAdjacentHTML('beforeend', '<h2>Following</h2>');
        const followingContainer = document.createElement('div');
        followingContainer.className = 'listings-container';
        followedUsers.forEach(user => {
            followingContainer.appendChild(createUserCard(user));
        });
        container.appendChild(followingContainer);
    }
    
    // Render other users
    container.insertAdjacentHTML('beforeend', '<h2>Users</h2>');
    const usersContainer = document.createElement('div');
    usersContainer.className = 'listings-container';
    otherUsers.forEach(user => {
        usersContainer.appendChild(createUserCard(user));
    });
    container.appendChild(usersContainer);
}

function createUserCard(user) {
    const card = document.createElement('div');
    card.className = 'listing-card';
    card.innerHTML = `
        <img src="${user.profilePicture || 'default-avatar.jpg'}" 
             class="listing-icon" 
             alt="${user.name}'s profile">
        <div class="listing-content">
            <h3>${user.name}</h3>
            <p>${user.email}</p>
        </div>
    `;
    return card;
}

// Auth state listener
onAuthStateChanged(auth, (user) => {
    const usernameButton = document.getElementById('username');
    if (user) {
        getDoc(doc(db, "users", user.uid))
            .then(doc => {
                usernameButton.textContent = doc.exists() ? doc.data().name : "User";
            });
        loadFollowData();
    } else {
        usernameButton.textContent = "Guest";
    }
});