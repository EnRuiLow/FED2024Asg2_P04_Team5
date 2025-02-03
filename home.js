// Import necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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

// Function to fetch and display listings
async function loadListings() {
    const listingsContainer = document.querySelector(".product-grid"); // Adjust selector if needed
    listingsContainer.innerHTML = ""; // Clear existing products

    try {
        const querySnapshot = await getDocs(collection(db, "listings"));
        querySnapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data();
            const productCard = document.createElement("div");
            productCard.classList.add("product-card");

            // Add product card HTML structure
            productCard.innerHTML = `
                <div class="carousel">
                    <img src="${data.imageUrl}" alt="${data.title}" onerror="this.src='placeholder.jpg'">
                </div>
                <div class="product-info">
                    <h3>${data.title}</h3>
                    <p>$${data.price.toFixed(2)}</p>
                    <p class="description">${data.description}</p>
                </div>
                <button class="buy-button">Buy Now</button>
            `;

            // Set up click event for redirecting to the 'sellpage.html' with product ID
            productCard.addEventListener("click", function () {
                // Redirect to sellpage.html with query params or localStorage (whichever works for your use case)
                window.location.href = `sellpage.html?id=${docSnapshot.id}`;
            });

            listingsContainer.appendChild(productCard);
        });
    } catch (error) {
        console.error("Error fetching listings: ", error);
    }
}

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
            // Correct selector to target title and description properly
            const title = card.querySelector(".product-info h3")?.textContent.toLowerCase() || "";  // Get title from <h3>
            const description = card.querySelector(".description")?.textContent.toLowerCase() || "";  // Get description

            // Check if the title or description includes the search text
            if (title.includes(searchText) || description.includes(searchText)) {
                card.style.display = "flex"; // Show matching products
            } else {
                card.style.display = "none"; // Hide non-matching products
            }
        });
    });
});


// Carousel scrolling functionality
function scrollCarousel(button, direction) {
    const carousel = button.closest('.product-card').querySelector('.carousel');
    const scrollAmount = carousel.offsetWidth;
    carousel.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
    const productCard = button.closest(".product-card");
    const carouselItems = productCard.querySelectorAll(".carousel img, div:nth-of-type(n+5)"); // Combine images and descriptions
    const descriptions = productCard.querySelectorAll("div:nth-of-type(n+5)");
    const currentBold = productCard.querySelector("div:nth-of-type(n+5) b");
    let currentIndex = Array.from(descriptions).indexOf(currentBold?.parentElement);

    // Determine the new index
    currentIndex = currentBold ? currentIndex : -1;
    let newIndex = currentIndex + direction;

    // Wrap around if out of bounds
    if (newIndex >= descriptions.length) newIndex = 0;
    if (newIndex < 0) newIndex = descriptions.length -1;

    // Clear existing bolded text
    if (currentBold) {
      currentBold.outerHTML = currentBold.innerHTML; // Remove <b>
    }

    // Bold the new text
    const newText = descriptions[newIndex];
    newText.innerHTML = `<b>${newText.innerHTML}</b>`;
}

