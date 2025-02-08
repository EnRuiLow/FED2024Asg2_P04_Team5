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

async function loadFollowData(searchTerm = '') {
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

        // 4. Render the sections with the search term
        renderUsers(followedUsers, otherUsers, searchTerm);
    } catch (error) {
        console.error("Error loading follow data:", error);
        alert("Failed to load follow data. Please try again.");
    }
}

function filterUsers(users, searchTerm) {
    if (!searchTerm) return users; // If no search term, return all users
    return users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
}


function renderUsers(followedUsers, otherUsers, searchTerm = '') {
    const container = document.querySelector('.profile-container');
    const searchAnimation = document.getElementById('searchAnimation');
    
    // Show loading animation
    searchAnimation.style.display = 'block';
    
    // Clear existing content
    container.innerHTML = '';

    // Simulate loading delay (you can remove this if not needed)
    setTimeout(async () => {
        // Hide animation after content loads
        searchAnimation.style.display = 'none';

        // Filter followed users
        const filteredFollowedUsers = filterUsers(followedUsers, searchTerm);
        
        // Render followed users
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
                    <dotlottie-player 
                        src="https://lottie.host/5b6294ef-902c-43d4-8b07-0d342ef5f0a5/6n5YF8S5Hk.json" 
                        background="transparent" 
                        speed="1" 
                        style="width: 200px; height: 200px; margin: 0 auto;"
                        loop 
                        autoplay>
                    </dotlottie-player>
                </div>
            `);
        }

        // Filter other users
        const filteredOtherUsers = filterUsers(otherUsers, searchTerm);
        
        // Render other users
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
                    <dotlottie-player 
                        src="https://lottie.host/3a4d8c1d-1d5e-4a5e-9d5e-1d5e4a5e9d5e/9XKp3W3XpM.json" 
                        background="transparent" 
                        speed="1" 
                        style="width: 200px; height: 200px; margin: 0 auto;"
                        loop 
                        autoplay>
                    </dotlottie-player>
                </div>
            `);
        }
    }, 500); // End of setTimeout
}
function createUserCard(user) {
    const card = document.createElement('div');
    card.className = 'listing-card';

    // Use a transparent 1x1 pixel if the profile picture is missing
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
            loadFollowData(searchTerm); // Pass search term to loadFollowData
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const searchTerm = searchInput.value.trim();
                loadFollowData(searchTerm); // Pass search term to loadFollowData
            }
        });
    } else {
        console.error('Search button or input not found in the DOM.');
    }
});