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

document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.querySelector(".search-bar input");
    const productCards = document.querySelectorAll(".product-card");

    searchInput.addEventListener("input", function () {
        const searchText = searchInput.value.toLowerCase();

        productCards.forEach(card => {
            const title = card.querySelector("div:nth-of-type(1) b")?.textContent.toLowerCase() || "";
            const descriptions = Array.from(card.querySelectorAll(".description"))
                .map(desc => desc.textContent.toLowerCase())
                .join(" ");

            if (title.includes(searchText) || descriptions.includes(searchText)) {
                card.style.display = "flex"; // Show matching products
            } else {
                card.style.display = "none"; // Hide non-matching products
            }
        });
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.querySelector(".search-bar input");
    const productCards = document.querySelectorAll(".product-card");
    const sections = document.querySelectorAll(".section");

    searchInput.addEventListener("input", function () {
        const searchText = searchInput.value.toLowerCase();

        sections.forEach(section => {
            const header = section.querySelector("h2");
            const cards = section.querySelectorAll(".product-card");
            let hasVisibleCard = false;

            cards.forEach(card => {
                const title = card.querySelector("div:nth-of-type(1) b")?.textContent.toLowerCase() || "";
                const descriptions = Array.from(card.querySelectorAll(".description"))
                    .map(desc => desc.textContent.toLowerCase())
                    .join(" ");

                if (title.includes(searchText) || descriptions.includes(searchText)) {
                    card.style.display = "flex"; // Show matching products
                    hasVisibleCard = true;
                } else {
                    card.style.display = "none"; // Hide non-matching products
                }
            });

            // Show or hide the header based on whether any cards are visible
            if (hasVisibleCard) {
                header.style.display = "block";
            } else {
                header.style.display = "none";
            }
        });
    });
});
// Import necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const productCard = document.createElement("div");
            productCard.classList.add("product-card");

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

            listingsContainer.appendChild(productCard);
        });
    } catch (error) {
        console.error("Error fetching listings: ", error);
    }
}

// Load products on page load
document.addEventListener("DOMContentLoaded", loadListings);

//  Delete expired listings when page loads
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
  deleteExpiredListings();