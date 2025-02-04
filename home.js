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

let allListings = []; // Store listings for sorting

// Function to fetch user's name from Firestore
async function fetchUserName(uid) {
    const userDocRef = doc(db, "users", uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
        return userDocSnap.data().name;
    } else {
        console.log("No user document found!");
        return "Guest";
    }
}

// Listen for auth state changes and update the username dynamically
onAuthStateChanged(auth, async (user) => {
    const userInfoElement = document.querySelector("#username");
    if (user && userInfoElement) {
        const userName = await fetchUserName(user.uid);
        userInfoElement.textContent = userName;
    } else if (userInfoElement) {
        userInfoElement.textContent = "Guest";
    }
});

// Load listings from Firestore and ensure products appear only once
async function loadListings() {
    try {
        const querySnapshot = await getDocs(collection(db, "listings"));
        allListings = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Sort all listings by creation date (newest first)
        const sortedByDate = [...allListings].sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);

        // Get the top 3 viewed listings for "Popular Choice"
        const sortedByViews = [...allListings].sort((a, b) => (b.views || 0) - (a.views || 0));
        const popularListings = sortedByViews.slice(0, 3);

        // Remove popular listings from the Recently Listed pool
        const remainingForRecent = sortedByDate.filter(listing => !popularListings.includes(listing));

        // Get the first 5 remaining listings for "Recently Listed"
        const recentListings = remainingForRecent.slice(0, 5);

        // Render the "Popular Choices" section
        renderListings(popularListings, ".section:nth-of-type(1) .product-grid");

        // Render the "Recently Listed" section
        renderListings(recentListings, ".section:nth-of-type(2) .product-grid");

        // Apply the filter to the rest of the listings
        const remainingListings = remainingForRecent.slice(5);
        applyCurrentFilterAndRender(remainingListings);

    } catch (error) {
        console.error("Error fetching listings: ", error);
    }
}

// Apply the selected filter and render listings
function applyCurrentFilterAndRender(listings) {
    const filter = document.getElementById('filter').value;
    let sortedListings = [...listings];

    if (sortedListings.length === 0) {
        renderListings([]);
        return;
    }

    let topViewed = sortedListings.reduce((max, current) => 
        (max.views || 0) > (current.views || 0) ? max : current, sortedListings[0]);

    sortedListings = sortedListings.filter(product => product !== topViewed);

    switch (filter) {
        case 'recent':
            sortedListings.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
            break;
        case 'lowToHigh':
            sortedListings.sort((a, b) => a.price - b.price);
            break;
        case 'highToLow':
            sortedListings.sort((a, b) => b.price - a.price);
            break;
        case 'popular':
            sortedListings.sort((a, b) => (b.views || 0) - (a.views || 0));
            break;
        default:
            sortedListings.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
    }

    sortedListings.unshift(topViewed);
    renderListings(sortedListings, ".section:nth-of-type(3) .product-grid");
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
    filterSelect.addEventListener('change', () => applyCurrentFilterAndRender(allListings));
});
