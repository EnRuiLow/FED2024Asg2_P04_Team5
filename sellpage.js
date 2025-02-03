import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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

const urlParams = new URLSearchParams(window.location.search);
const listingId = urlParams.get("id");

if (!listingId) {
    alert("Invalid listing ID.");
    window.location.href = "index.html";
}

async function fetchListingDetails() {
    const docRef = doc(db, "listings", listingId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        console.log("Listing Data: ", data); 
        document.getElementById("listingTitle").innerText = data.title;
        document.getElementById("listingPrice").innerText = `S$${data.price}`;
        document.getElementById("listingDescription").innerText = data.description;
        document.getElementById("listingImage").src = data.imageUrl;

      
        const createdAt = new Date(data.createdAt.seconds * 1000); 
        const formattedDate = createdAt.toLocaleString(); 
        document.getElementById("listingDate").innerText = `Listed on: ${formattedDate}`;

        
        console.log("Listing ownerId: ", data.ownerId);

       
        const sellerRef = doc(db, "users", data.ownerId); 
        const sellerSnap = await getDoc(sellerRef);

        if (sellerSnap.exists()) {
            const sellerData = sellerSnap.data();
            console.log("Seller Data: ", sellerData); 
            document.getElementById("sellerName").innerText = sellerData.name || `@${data.ownerId}`;
            document.getElementById("sellerRating").innerText = sellerData.rating || "N/A";
            document.getElementById("sellerReviews").innerText = sellerData.reviews || 0;
        } else {
            console.log("Seller document not found.");
            document.getElementById("sellerName").innerText = "Seller not found";
        }
    } else {
        alert("Listing not found.");
        window.location.href = "index.html";
    }
}


fetchListingDetails();

