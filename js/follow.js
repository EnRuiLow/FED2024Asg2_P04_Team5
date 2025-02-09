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
    projectId: "p04-team5",
    storageBucket: "p04-team5.appspot.com",
    messagingSenderId: "88767932375",
    appId: "1:88767932375:web:08c1c4fe7cc99688e1cd92",
    measurementId: "G-BKQ9JDGZ9G"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function loadFollowData(searchTerm = '') {
    const user = auth.currentUser;
    if (!user) {
        window.location.href = 'home.html';
        return;
    }

    try {
        const followingQuery = query(collection(db, "user_following"), where("userEmail", "==", user.email));
        const followingSnapshot = await getDocs(followingQuery);
        const followedEmails = followingSnapshot.docs.map(doc => doc.data().ownerEmail);
        
        const profilesSnapshot = await getDocs(collection(db, "profile"));
        
        const [followedUsers, otherUsers] = profilesSnapshot.docs.reduce((acc, doc) => {
            const userData = doc.data();
            followedEmails.includes(userData.email) ? acc[0].push(userData) : acc[1].push(userData);
            return acc;
        }, [[], []]);

        renderUsers(followedUsers, otherUsers, searchTerm);
    } catch (error) {
        console.error("Error loading follow data:", error);
        alert("Failed to load follow data. Please try again.");
    }
}

function filterUsers(users, searchTerm) {
    if (!searchTerm) return users;
    return users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
}

function renderUsers(followedUsers, otherUsers, searchTerm = '') {
    const container = document.querySelector('.profile-container');
    
    container.innerHTML = '';

    setTimeout(async () => {
        const filteredFollowedUsers = filterUsers(followedUsers, searchTerm);
        
        if (filteredFollowedUsers.length > 0) {
            container.insertAdjacentHTML('beforeend', '<h2>Following</h2>');
            const followingContainer = document.createElement('div');
            followingContainer.className = 'listings-container';
            filteredFollowedUsers.forEach(user => {
                followingContainer.appendChild(createUserCard(user));
            });
            container.appendChild(followingContainer);
        } else if (searchTerm) {
            container.insertAdjacentHTML('beforeend', `
                <div class="empty-state">
                    <h3>No followed users match your search</h3>
                </div>
            `);
        }

        const filteredOtherUsers = filterUsers(otherUsers, searchTerm);
        
        if (filteredOtherUsers.length > 0) {
            container.insertAdjacentHTML('beforeend', '<h2>Users</h2>');
            const usersContainer = document.createElement('div');
            usersContainer.className = 'listings-container';
            filteredOtherUsers.forEach(user => {
                usersContainer.appendChild(createUserCard(user));
            });
            container.appendChild(usersContainer);
        } else if (!searchTerm) {
            container.insertAdjacentHTML('beforeend', `
                <div class="empty-state">
                    <h3>No users to display</h3>
                </div>
            `);
        }
    }, 500);
}

function createUserCard(user) {
    const card = document.createElement('div');
    card.className = 'listing-card';

    const profileImage = user.profilePicture ? user.profilePicture : 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

    card.innerHTML = `
        <img src="${profileImage}" class="listing-icon">
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

// Wait for the DOM to load before attaching event listeners
document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');

    if (searchButton && searchInput) {
        searchButton.addEventListener('click', () => {
            const searchTerm = searchInput.value.trim();
            loadFollowData(searchTerm);
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const searchTerm = searchInput.value.trim();
                loadFollowData(searchTerm);
            }
        });
    } else {
        console.error('Search button or input not found in the DOM.');
    }
});
