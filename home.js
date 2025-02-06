// Import necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, getDocs, deleteDoc, doc, getDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Firebase configuration and initialization
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
const db = getFirestore(app);
const auth = getAuth(app);

let allListings = [];
let popularListings = [];
let recentListings = [];
let remainingListings = [];

// ... (existing auth and user functions remain unchanged)

async function loadListings() {
    try {
        const querySnapshot = await getDocs(collection(db, "listings"));
        allListings = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Determine Popular Choices (top 3 by views)
        const sortedByViews = [...allListings].sort((a, b) => (b.views || 0) - (a.views || 0));
        popularListings = sortedByViews.slice(0, 3);

        // Determine Recently Listed (next 5 by date, excluding Popular)
        const sortedByDate = [...allListings].sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
        const remainingForRecent = sortedByDate.filter(listing => !popularListings.includes(listing));
        recentListings = remainingForRecent.slice(0, 5);
        remainingListings = remainingForRecent.slice(5);

        applyCurrentFilterAndRender(); // Apply initial filter to all sections

    } catch (error) {
        console.error("Error fetching listings: ", error);
    }
}

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

function applyCurrentFilterAndRender() {
    const filter = document.getElementById('filter').value;

    // Sort and render each section based on the current filter
    renderSortedSection(popularListings, ".section:nth-of-type(1) .product-grid", filter);
    renderSortedSection(recentListings, ".section:nth-of-type(2) .product-grid", filter);
    renderSortedRemainingSection(remainingListings, ".section:nth-of-type(3) .product-grid", filter);
}

function renderSortedSection(listings, gridSelector, filter) {
    const sorted = [...listings];
    sortByFilter(sorted, filter);
    renderListings(sorted, gridSelector);
}

function renderSortedRemainingSection(listings, gridSelector, filter) {
    if (listings.length === 0) {
        renderListings([], gridSelector);
        return;
    }

    // Preserve topViewed product logic for the third section
    const topViewed = [...listings].reduce((max, current) => 
        (max.views || 0) > (current.views || 0) ? max : current, listings[0]);
    const remaining = listings.filter(product => product !== topViewed);
    
    sortByFilter(remaining, filter);
    const sorted = [topViewed, ...remaining];
    renderListings(sorted, gridSelector);
}

function sortByFilter(listings, filter) {
    switch (filter) {
        case 'recent':
            listings.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
            break;
        case 'lowToHigh':
            listings.sort((a, b) => a.price - b.price);
            break;
        case 'highToLow':
            listings.sort((a, b) => b.price - a.price);
            break;
        case 'popular':
            listings.sort((a, b) => (b.views || 0) - (a.views || 0));
            break;
        default:
            listings.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
    }
}

// Render listings dynamically
function renderListings(listings, gridSelector) {
    const listingsContainer = document.querySelector(gridSelector);
    listingsContainer.innerHTML = "";

    listings.forEach(listing => {
        const productCard = document.createElement("div");
        productCard.classList.add("product-card");
        
        productCard.innerHTML = `
            <div class="carousel">
                <img src="${listing.imageUrl}" alt="${listing.title}" onerror="this.src='placeholder.jpg'">
            </div>
            <div class="product-info">
                <h3>${listing.title}</h3>
                <p>$${listing.price.toFixed(2)}</p>
                <p class="description">${listing.description}</p>
            </div>
            <button class="buy-button">Buy Now</button>
        `;

        // This is about the clicking into product, meaning more views
        productCard.addEventListener("click", async () => {
            try {
                const listingRef = doc(db, "listings", listing.id);
                await updateDoc(listingRef, {
                    views: increment(1)
                });
                window.location.href = `sellpage.html?id=${listing.id}`;
            } catch (error) {
                console.error("Error updating views: ", error);
            }
        });

        listingsContainer.appendChild(productCard);
    });
}

// Delete expired listings
async function deleteExpiredListings() {
    const now = new Date();
    const querySnapshot = await getDocs(collection(db, "listings"));
  
    querySnapshot.forEach(async (docSnapshot) => {
      const data = docSnapshot.data();
      if (data.expiresAt && data.expiresAt.toDate() <= now) {
        await deleteDoc(doc(db, "listings", docSnapshot.id));
        console.log(`Deleted expired listing: ${docSnapshot.id}`);
      }
    });
}

// Search functionality
document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.querySelector(".search-bar input");

    searchInput.addEventListener("input", function () {
        const searchText = searchInput.value.toLowerCase();
        const productCards = document.querySelectorAll(".product-card");

        productCards.forEach(card => {
            const title = card.querySelector(".product-info h3")?.textContent.toLowerCase() || "";
            const description = card.querySelector(".description")?.textContent.toLowerCase() || "";

            if (title.includes(searchText) || description.includes(searchText)) {
                card.style.display = "flex";
            } else {
                card.style.display = "none";
            }
        });
    });
});

// Initialize and load listings on page load
document.addEventListener("DOMContentLoaded", async function () {
    await deleteExpiredListings();
    await loadListings();
    
    const filterSelect = document.getElementById('filter');
    filterSelect.addEventListener('change', () => applyCurrentFilterAndRender());
});

