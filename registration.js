// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAw1ITeg1Vgb1r4BEC3j7G_LpaoHMS1v78",
    authDomain: "p04-team5.firebaseapp.com",
    projectId: "p04-team5",
    storageBucket: "p04-team5.firebasestorage.app",
    messagingSenderId: "88767932375",
    appId: "1:88767932375:web:08c1c4fe7cc99688e1cd92",
  };
  
  // Initialize Firebase
  const app = firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();
  
  // Handle form submission
  document.getElementById("registerForm").addEventListener("submit", async function (event) {
    event.preventDefault();
  
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
  
    try {
      // Firebase Authentication: Register user with email and password
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
  
      // Save user data in Firestore
      await db.collection("users").doc(userCredential.user.uid).set({
        name: name,
        email: email,
        uid: userCredential.user.uid,
      });
  
      alert("Registration successful!");
      window.location.href = "index.html"; // Redirect to login page
    } catch (error) {
      alert("An error occurred: " + error.message);
    }
  });
  