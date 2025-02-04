// Firebase initialization using global objects
const firebaseConfig = {
  apiKey: "AIzaSyAw1ITeg1Vgb1r4BEC3j7G_LpaoHMS1v78",
  authDomain: "p04-team5.firebaseapp.com",
  projectId: "p04-team5",
  storageBucket: "p04-team5.appspot.com",
  messagingSenderId: "88767932375",
  appId: "1:88767932375:web:08c1c4fe7cc99688e1cd92",
  measurementId: "G-BKQ9JDGZ9G"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

const urlParams = new URLSearchParams(window.location.search);
const listingId = urlParams.get("id");
// DOM Elements
const chatList = document.getElementById("chatList");
const messageContainer = document.getElementById("messages");
const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");
const chatTitle = document.getElementById("chat-title");

let currentUserId = null;
let currentChatId = null;
let unreadMessages = {}; // Track unread messages for each chat

// Function to toggle sidebar visibility
const toggleSidebar = () => {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.toggle("open");
};


const renderChatRoom = async (chatId, otherUserId) => {
  const otherUserRef = doc(db, "users", otherUserId);
  const otherUserSnap = await getDoc(otherUserRef);

  let participantName = otherUserId; // Default to UID if name is unavailable
  if (otherUserSnap.exists()) {
    const otherUserData = otherUserSnap.data();
    participantName = otherUserData.name || `@${otherUserId}`;
  }

  const chatItem = document.createElement("div");
  chatItem.classList.add("chat-item");
  chatItem.innerHTML = `<p>${participantName}</p>`;
  chatItem.addEventListener("click", () => loadChatRoom(chatId));
  chatList.appendChild(chatItem);
};

// Function to load a chatroom and display its messages
const loadChatRoom = async (chatId) => {
  currentChatId = chatId;
  const chatRef = doc(db, "chats", chatId);
  const chatSnap = await getDoc(chatRef);

  if (chatSnap.exists()) {
    const chatData = chatSnap.data();
    const otherUserId = chatData.participants.find((id) => id !== currentUserId);
    const otherUserRef = doc(db, "users", otherUserId);
    const otherUserSnap = await getDoc(otherUserRef);

    if (otherUserSnap.exists()) {
      const otherUserData = otherUserSnap.data();
      chatTitle.innerText = `Chat with ${otherUserData.name || `@${otherUserId}`}`;
    }

    // Mark messages as read
    unreadMessages[chatId] = 0;
    updateUnreadBadges();

    // Load messages
    listenForMessages(chatId, renderMessages);
  }
};

// Function to listen for new messages in a chatroom
const listenForMessages = (chatId, callback) => {
  const messagesRef = collection(db, `chats/${chatId}/messages`);
  const q = query(messagesRef, orderBy("timestamp", "asc"));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(messages);

    // Update unread messages if the chat is not active
    if (chatId !== currentChatId) {
      unreadMessages[chatId] = (unreadMessages[chatId] || 0) + 1;
      updateUnreadBadges();
    }
  });
};

// Function to render messages in the chat UI
// Cache user names to avoid repeated Firestore queries
const userCache = {};

// Function to get user name from Firestore or cache
const getUserName = async (userId) => {
  if (userCache[userId]) {
    return userCache[userId]; // Return cached name
  }

  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    const userName = userSnap.data().name || `@${userId}`;
    userCache[userId] = userName; // Store in cache
    return userName;
  }

  return `@${userId}`; 
};

// Function to render messages in the chat UI
const renderMessages = async (messages) => {
  messageContainer.innerHTML = ""; // Clear existing messages

  for (const msg of messages) {
    const senderName = await getUserName(msg.userId);

    const messageElement = document.createElement("div");
    messageElement.classList.add("message");
    messageElement.innerHTML = `
      <p><strong>${senderName}:</strong> ${msg.message}</p>
      <small>${msg.timestamp?.toDate() ? new Date(msg.timestamp.toDate()).toLocaleString() : "Sending..."}</small>
    `;
    messageContainer.appendChild(messageElement);
  }

  // Scroll to the bottom
  messageContainer.scrollTop = messageContainer.scrollHeight;
};


// Function to update unread message badges
const updateUnreadBadges = () => {
  const chatItems = document.querySelectorAll(".chat-item");
  chatItems.forEach((item) => {
    const chatId = item.dataset.chatId;
    const badge = item.querySelector(".unread-badge");
    if (unreadMessages[chatId] > 0) {
      if (!badge) {
        const badgeElement = document.createElement("span");
        badgeElement.classList.add("unread-badge");
        badgeElement.innerText = unreadMessages[chatId];
        item.appendChild(badgeElement);
      } else {
        badge.innerText = unreadMessages[chatId];
      }
    } else if (badge) {
      badge.remove();
    }
  });
};

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

// Attach event listener to the form
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = messageInput.value;

  if (message.trim() !== "" && currentChatId && currentUserId) {
    sendMessage(currentChatId, currentUserId, message);
    messageInput.value = ""; // Clear the input field
  }
});

// Wait for user authentication
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUserId = user.uid;

    // Fetch and render the user's chatrooms
    const chatsRef = collection(db, "chats");
    const q = query(chatsRef, where("participants", "array-contains", currentUserId)); 

    onSnapshot(q, (snapshot) => {
      chatList.innerHTML = ""; // Clear previous chats
      snapshot.forEach((doc) => {
        const chatData = doc.data();
        const otherUserId = chatData.participants.find((id) => id !== currentUserId);
        renderChatRoom(doc.id, otherUserId);
      });
    });
  } else {
    alert("Please log in to use the chat.");
    window.location.href = "index.html"; // Redirect if not logged in
  }
});
