import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  collection, 
  getDocs 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Firebase configuration and initialization
const firebaseConfig = { /* same as before */ };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Main function to load and display users
async function loadUsers() {
  const user = auth.currentUser;
  if (!user) {
    window.location.href = 'home.html';
    return;
  }

  try {
    // Get followed users
    const followDoc = await getDoc(doc(db, "user_following", user.uid));
    const followedIds = followDoc.exists() ? [followDoc.data().ownerId] : [];

    // Get all users from profile collection
    const profilesSnapshot = await getDocs(collection(db, "profile"));
    const allUsers = profilesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Separate users into followed and others
    const [followedUsers, otherUsers] = allUsers.reduce((acc, user) => {
      followedIds.includes(user.id) ? acc[0].push(user) : acc[1].push(user);
      return acc;
    }, [[], []]);

    // Render sections
    renderUserSections(followedUsers, otherUsers);
  } catch (error) {
    console.error("Error loading users:", error);
    alert("Failed to load users. Please try again.");
  }
}

function renderUserSections(followedUsers, otherUsers) {
  const main = document.querySelector('.profile-container');
  main.innerHTML = '';

  // Following Section
  if (followedUsers.length > 0) {
    main.insertAdjacentHTML('beforeend', '<h2>Following</h2>');
    const followingContainer = document.createElement('div');
    followingContainer.className = 'listings-container';
    followedUsers.forEach(user => {
      followingContainer.appendChild(createUserCard(user));
    });
    main.appendChild(followingContainer);
  }

  // All Users Section
  main.insertAdjacentHTML('beforeend', '<h2>All Users</h2>');
  const usersContainer = document.createElement('div');
  usersContainer.className = 'listings-container';
  otherUsers.forEach(user => {
    usersContainer.appendChild(createUserCard(user));
  });
  main.appendChild(usersContainer);
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

// Auth state handling
onAuthStateChanged(auth, (user) => {
  const usernameButton = document.getElementById('username');
  if (user) {
    getDoc(doc(db, "users", user.uid))
      .then(doc => {
        usernameButton.textContent = doc.exists() ? doc.data().name : "User";
      });
    loadUsers();
  } else {
    usernameButton.textContent = "Guest";
  }
});