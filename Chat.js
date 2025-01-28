// Initialize Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, doc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

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
const auth = getAuth(app);

// DOM Elements
const chatList = document.getElementById('chatList');
const messageContainer = document.getElementById('messages');
const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');

// Function to toggle sidebar visibility
const toggleSidebar = () => {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('open');
};

// Function to send a message
const sendMessage = async (chatId, userId, message) => {
  try {
    // Send the message to the user's chat sub-collection
    const messagesRef = collection(db, `users/${userId}/chats/${chatId}/messages`);
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

// Function to listen for new messages in the current chat
const listenForMessages = (userId, chatId, callback) => {
  const messagesRef = collection(db, `users/${userId}/chats/${chatId}/messages`);
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

// Function to load a chat room and display its messages
const loadChatRoom = (userId, chatId) => {
  listenForMessages(userId, chatId, renderMessages);
};

// Function to open a specific chat room
const openChat = (chatId) => {
  const userId = auth.currentUser?.uid;
  if (userId) {
    loadChatRoom(userId, chatId);
  }
};

// Function to create a new chat room between two users
const createChatRoom = async (user1Id, user2Id) => {
  try {
    // Create a new chat room document for user1
    const chatRef1 = doc(db, `users/${user1Id}/chats`, `${user1Id}_${user2Id}`);
    await addDoc(collection(db, `users/${user1Id}/chats/${chatRef1.id}/messages`), {
      userId: user1Id,
      message: "Chat started",
      timestamp: serverTimestamp(),
    });

    // Create a new chat room document for user2
    const chatRef2 = doc(db, `users/${user2Id}/chats`, `${user2Id}_${user1Id}`);
    await addDoc(collection(db, `users/${user2Id}/chats/${chatRef2.id}/messages`), {
      userId: user2Id,
      message: "Chat started",
      timestamp: serverTimestamp(),
    });

    console.log("Chat rooms created successfully!");
  } catch (error) {
    console.error("Error creating chat room:", error);
  }
};

// Attach event listener to the form
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const chatId = "chatRoom1"; // Assume chatId is provided from user input
  const userId = auth.currentUser?.uid;
  const message = messageInput.value;

  if (message.trim() !== "" && userId) {
    sendMessage(chatId, userId, message);
    messageInput.value = ""; // Clear the input field
  }
});

// Wait for user authentication
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Render chat list if user is authenticated
    chatList.innerHTML = ""; // Clear previous chats
    // Assume you have a function to load user's chats
    // populateChatList(user.uid);

    // Open a default chat (chatRoom1) if the user is logged in
    openChat("chatRoom1");
  } else {
    alert("Please log in to use the chat.");
    window.location.href = "login.html"; // Redirect if not logged in
  }
});







