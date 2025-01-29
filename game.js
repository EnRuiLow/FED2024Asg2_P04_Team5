const couponValues = [1, 2, 3, 4, 5, 5, 5]; // Daily coupon values
let currentDay = parseInt(localStorage.getItem("currentDay")) || 0;

// Select elements
const progressEl = document.getElementById('progress');
const couponEl = document.getElementById('coupon');
const nextDayButton = document.getElementById('nextDay');

// Get stored dates
const lastClaimed = localStorage.getItem("lastClaimed");
const lastLogin = localStorage.getItem("lastLogin");
const today = new Date().toDateString();

// Function to update UI
function updateTracker() {
    const couponValue = couponValues[currentDay];
    progressEl.style.width = `${(currentDay + 1) / couponValues.length * 100}%`;
    couponEl.textContent = `Today's Coupon: $${couponValue}`;

    // Disable button if already claimed today
    if (lastClaimed === today) {
        nextDayButton.disabled = true;
        nextDayButton.textContent = "Claimed Today!";
    } else {
        nextDayButton.disabled = false;
        nextDayButton.textContent = "Claim Coupon";
    }
}

// First login check
if (lastLogin !== today) {
    alert("Welcome back! Claim your daily coupon.");
    localStorage.setItem("lastLogin", today);
    
    // Disable claim button immediately upon login
    localStorage.setItem("lastClaimed", today);
    nextDayButton.disabled = true;
    nextDayButton.textContent = "Claimed Today!";
}

// Handle claiming coupon
nextDayButton.addEventListener('click', () => {
    if (lastClaimed !== today) {
        if (currentDay < couponValues.length - 1) {
            currentDay++;
        } else {
            currentDay = 0; // Reset after 7 days
        }

        localStorage.setItem("currentDay", currentDay);
        localStorage.setItem("lastClaimed", today);
        updateTracker();
        alert(`You claimed $${couponValues[currentDay]}! Come back tomorrow for more.`);
    }
});

// Initialize UI
updateTracker();

