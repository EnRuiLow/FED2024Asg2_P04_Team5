// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  orderBy, 
  onSnapshot 
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAw1ITeg1Vgb1r4BEC3j7G_LpaoHMS1v78",
  authDomain: "p04-team5.firebaseapp.com",
  projectId: "p04-team5",
  storageBucket: "p04-team5.firebasestorage.app",
  messagingSenderId: "88767932375",
  appId: "1:88767932375:web:08c1c4fe7cc99688e1cd92",
  measurementId: "G-BKQ9JDGZ9G",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM Elements
const messageContainer = document.getElementById("messages");
const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");

// Function to send a message
const sendMessage = async (chatId, userId, message) => {
  try {
    const messagesRef = collection(db, `chats/${chatId}/messages`);
    await addDoc(messagesRef, {
      userId,
      message,
      timestamp: serverTimestamp(),
    });
    console.log("Message sent successfully!");
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

// Function to listen for new messages
const listenForMessages = (chatId, callback) => {
  const messagesRef = collection(db, `chats/${chatId}/messages`);
  const q = query(messagesRef, orderBy("timestamp", "asc"));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(messages);
  });
};

// Function to render messages in the chat UI
const renderMessages = (messages) => {
  messageContainer.innerHTML = ""; // Clear existing messages
  messages.forEach((msg) => {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message");
    messageElement.innerHTML = `
      <p><strong>${msg.userId}:</strong> ${msg.message}</p>
      <small>${msg.timestamp?.toDate() ? new Date(msg.timestamp.toDate()).toLocaleString() : "Sending..."}</small>
    `;
    messageContainer.appendChild(messageElement);
  });
  // Scroll to the bottom
  messageContainer.scrollTop = messageContainer.scrollHeight;
};

// Attach event listener to the form
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const chatId = "chatRoom1"; // Hardcoded chat room ID
  const userId = "user123";   // Replace with your user authentication ID
  const message = messageInput.value;

  if (message.trim() !== "") {
    sendMessage(chatId, userId, message);
    messageInput.value = ""; // Clear the input field
  }
});

// Start listening for messages
listenForMessages("chatRoom1", renderMessages);



