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
