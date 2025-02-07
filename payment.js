document.addEventListener("DOMContentLoaded", async () => {
    const db = firebase.firestore();
    const auth = firebase.auth();

    // Extract listingId and offerId from URL
    const urlParams = new URLSearchParams(window.location.search);
    const listingId = urlParams.get("id");
    const offerId = urlParams.get("offerId"); 

    if (!listingId || !offerId) {
        window.location.href = "home.html";
        return;
    }

    let totalAmount = 0;
    let rewardsUsable = 0;
    let itemName = "Unknown Item"; 

    try {
        // Fetch offer details from Firestore (offers -> offerId)
        const offerRef = db.collection("offers").doc(offerId);
        const offerSnap = await offerRef.get();

        if (!offerSnap.exists) {
            console.error("Offer not found");
            document.getElementById("listing-name").textContent = "Offer not found";
            return;
        }

        const offerData = offerSnap.data();
        totalAmount = offerData.offerAmount || 0; 

        // Fetch listing details to get the item name
        const listingRef = db.collection("listings").doc(listingId);
        const listingSnap = await listingRef.get();
        if (listingSnap.exists) {
            const listingData = listingSnap.data();
            itemName = listingData.title || "Unknown Item"; 
        }

        // Fixed platform tax
        const platformTax = 0.50;

        // Wait for authentication to get user ID
        auth.onAuthStateChanged(async (user) => {
            if (!user) return;

            // Fetch buyer's username
            const userRef = db.collection("users").doc(user.uid);
            const userSnap = await userRef.get();
            if (userSnap.exists) {
                const userName = userSnap.data().name || "Guest";
                document.getElementById("username").textContent = userName; 
            }

            // Fetch buyer's total rewards
            const rewardsRef = db.collection("user_rewards").doc(user.uid);
            const rewardsSnap = await rewardsRef.get();
            if (rewardsSnap.exists) {
                const totalRewards = rewardsSnap.data().totalRewards || 0;
                rewardsUsable = Math.min(totalRewards, totalAmount - 2); 
            }

            // Calculate final amount due
            const amountDue = (totalAmount + platformTax - rewardsUsable).toFixed(2);

            // Populate UI
            document.getElementById("listing-name").textContent = `Item: ${itemName}`;
            document.getElementById("total-amount").textContent = `Total Amount: $${totalAmount.toFixed(2)}`;
            document.getElementById("platform-tax").textContent = `Platform Tax: $${platformTax.toFixed(2)}`;
            document.getElementById("rewards-usable").textContent = `Rewards Usable: $${rewardsUsable.toFixed(2)}`;
            document.getElementById("amount-due").textContent = `Amount Due: $${amountDue}`;
        });
    } catch (error) {
        console.error("Error fetching offer, listing, or rewards:", error);
    }

    // Payment processing
    document.getElementById("payment-form").addEventListener("submit", async (event) => {
        event.preventDefault();

        console.log("Processing payment...");

        // Simulate payment delay
        setTimeout(async () => {
            console.log("Payment successful!");

            const user = firebase.auth().currentUser;
            if (!user) return;

            // Deduct rewards from buyer
            const rewardsRef = db.collection("user_rewards").doc(user.uid);
            await rewardsRef.update({ totalRewards: firebase.firestore.FieldValue.increment(-rewardsUsable) });

            // Notify seller
            const listingRef = db.collection("listings").doc(listingId);
            const listingSnap = await listingRef.get();
            if (listingSnap.exists) {
                const ownerId = listingSnap.data().ownerId;

                if (ownerId !== undefined) {
                    // Delete accepted offer notification
                    const notificationRef = db.collection("notifications");
                    const querySnapshot = await notificationRef.where("listingId", "==", listingId).where("sellerId", "==", ownerId).get();
                    querySnapshot.forEach((doc) => {
                        notificationRef.doc(doc.id).delete();
                    });

                    // Create new notification
                    await db.collection("notifications").add({
                        listingId: listingId,
                        message: "Buyer has paid for the listing",
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        sellerId: ownerId
                    });
                } else {
                    console.error("Seller ID is undefined");
                }
            }

        }, 2000);
    });
});