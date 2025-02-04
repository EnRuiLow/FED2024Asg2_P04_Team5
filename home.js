// Import necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, getDocs, deleteDoc, doc, getDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Firebase configuration and initialization
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

let allListings = []; // Store listings for sorting

// Modify loadListings to store data and apply initial filter
async function loadListings() {
    try {
        const querySnapshot = await getDocs(collection(db, "listings"));
        allListings = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        applyCurrentFilterAndRender(); // Initial render
    } catch (error) {
        console.error("Error fetching listings: ", error);
    }
}

// New function to handle sorting and rendering
function applyCurrentFilterAndRender() {
    const filter = document.getElementById('filter').value;
    const sortedListings = [...allListings]; // Create a copy

    switch (filter) {
        case 'recent':
            // Sort by createdAt (ensure your listings have this field)
            sortedListings.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
            break;
        case 'lowToHigh':
            sortedListings.sort((a, b) => a.price - b.price);
            break;
        case 'highToLow':
            sortedListings.sort((a, b) => b.price - a.price);
            break;
        case 'popular':
            // Sort by views, using 0 as fallback for listings without views
            sortedListings.sort((a, b) => (b.views || 0) - (a.views || 0));
            break;
        default:
            sortedListings.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
    }
    renderListings(sortedListings);
}

// Modified rendering function
function renderListings(listings) {
    const listingsContainer = document.querySelector(".product-grid");
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
// Update DOMContentLoaded handler
document.addEventListener("DOMContentLoaded", async function () {
    await deleteExpiredListings();
    await loadListings();
    
    // Add filter event listener
    const filterSelect = document.getElementById('filter');
    filterSelect.addEventListener('change', applyCurrentFilterAndRender);
});

// Delete expired listings when page loads
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

// Run cleanup on page load
document.addEventListener("DOMContentLoaded", function () {
    loadListings();
    deleteExpiredListings(); // Clean up expired listings
});

// Search functionality
document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.querySelector(".search-bar input");

    // Use event delegation, query all cards dynamically every time input changes
    searchInput.addEventListener("input", function () {
        const searchText = searchInput.value.toLowerCase();
        const productCards = document.querySelectorAll(".product-card"); // Re-query all product cards

        productCards.forEach(card => {
            const title = card.querySelector(".product-info h3")?.textContent.toLowerCase() || "";
            const description = card.querySelector(".description")?.textContent.toLowerCase() || "";

            // Check if the title or description includes the search text
            if (title.includes(searchText) || description.includes(searchText)) {
                card.style.display = "flex"; // Show matching products
            } else {
                card.style.display = "none"; // Hide non-matching products
            }
        });
    });
});

// Modify your productCard.addEventListener in renderListings
productCard.addEventListener("click", async () => {
    try {
        // Increment views counter before redirecting
        const listingRef = doc(db, "listings", listing.id);
        await updateDoc(listingRef, {
            views: increment(1)
        });
        window.location.href = `sellpage.html?id=${listing.id}`;
    } 
    catch (error) {
        console.error("Error updating views: ", error);
    }
});

// Carousel scrolling functionality
function scrollCarousel(button, direction) {
    const carousel = button.closest('.product-card').querySelector('.carousel');
    const scrollAmount = carousel.offsetWidth;
    carousel.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
    const productCard = button.closest(".product-card");
    const carouselItems = productCard.querySelectorAll(".carousel img, div:nth-of-type(n+5)");
    const descriptions = productCard.querySelectorAll("div:nth-of-type(n+5)");
    const currentBold = productCard.querySelector("div:nth-of-type(n+5) b");
    let currentIndex = Array.from(descriptions).indexOf(currentBold?.parentElement);

    currentIndex = currentBold ? currentIndex : -1;
    let newIndex = currentIndex + direction;

    if (newIndex >= descriptions.length) newIndex = 0;
    if (newIndex < 0) newIndex = descriptions.length - 1;

    if (currentBold) {
      currentBold.outerHTML = currentBold.innerHTML;
    }

    const newText = descriptions[newIndex];
    newText.innerHTML = `<b>${newText.innerHTML}</b>`;
}



// Function to render products
function renderProducts(filteredProducts) {
    const productGrid = document.getElementById("product-grid");
    productGrid.innerHTML = ""; // Clear existing products
  
    filteredProducts.forEach(product => {
      const productCard = document.createElement("div");
      productCard.className = "product-card";
      productCard.innerHTML = `
        <h3>${product.name}</h3>
        <p>Price: $${product.price}</p>
        <p>Popularity: ${product.popularity}</p>
      `;
      productGrid.appendChild(productCard);
    });
  }

  