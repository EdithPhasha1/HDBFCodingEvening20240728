// Global variables to store current user, all users, and messages
let currentUser = "";
let users = [];
let messages = [];

// Load data from local storage
function loadFromLocalStorage() {
  try {
    const storedUsers = localStorage.getItem("chatUsers");
    const storedMessages = localStorage.getItem("chatMessages");
    if (storedUsers) users = JSON.parse(storedUsers);
    if (storedMessages) messages = JSON.parse(storedMessages);
  } catch (error) {
    console.error("Error loading from local storage:", error);
    // Initialize with empty arrays if there's an error
    users = [];
    messages = [];
  }
}

// Save data to local storage
function saveToLocalStorage() {
  try {
    localStorage.setItem("chatUsers", JSON.stringify(users));
    localStorage.setItem("chatMessages", JSON.stringify(messages));
  } catch (error) {
    console.error("Error saving to local storage:", error);
  }
}

// Sanitize input to prevent XSS attacks
function sanitizeInput(input) {
  const div = document.createElement("div");
  div.textContent = input;
  return div.innerHTML;
}

// Update UI with current users and messages
function updateUI() {
  // Update user list
  const userList = document.getElementById("user-list");
  userList.innerHTML = "";
  users.forEach((user) => {
    const li = document.createElement("li");
    li.textContent = sanitizeInput(user);
    userList.appendChild(li);
  });

  // Update messages
  const messagesDiv = document.getElementById("messages");
  messagesDiv.innerHTML = "";
  messages.forEach((msg) => {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message");
    messageDiv.innerHTML = `
            <strong>${sanitizeInput(msg.user)}:</strong> ${sanitizeInput(
      msg.text
    )}
            <span class="timestamp">${new Date(
              msg.timestamp
            ).toLocaleTimeString()}</span>
        `;
    messagesDiv.appendChild(messageDiv);
  });
  // Scroll to the bottom of the messages
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Event listener for joining the chat
document.getElementById("join-chat").addEventListener("click", () => {
  const usernameInput = document.getElementById("username-input");
  currentUser = usernameInput.value.trim();
  if (currentUser && currentUser.length <= 20) {
    if (!users.includes(currentUser)) {
      users.push(currentUser);
      document.getElementById("login-screen").style.display = "none";
      document.getElementById("chat-screen").style.display = "block";
      updateUI();
      saveToLocalStorage();
    } else {
      alert("Username already taken. Please choose another.");
    }
  } else {
    alert("Please enter a valid username (max 20 characters).");
  }
});

// Event listener for sending a message
document.getElementById("send-message").addEventListener("click", sendMessage);
document.getElementById("message-input").addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

function sendMessage() {
  const messageInput = document.getElementById("message-input");
  const messageText = messageInput.value.trim();
  if (messageText && messageText.length <= 500) {
    messages.push({
      user: currentUser,
      text: messageText,
      timestamp: Date.now(),
    });
    messageInput.value = "";
    updateUI();
    saveToLocalStorage();
  } else if (messageText.length > 500) {
    alert("Message is too long. Maximum 500 characters allowed.");
  }
}

// Simulate real-time updates
let lastUpdateTime = 0;
function checkForUpdates() {
  const currentTime = Date.now();
  if (currentTime - lastUpdateTime >= 2000) {
    loadFromLocalStorage();
    updateUI();
    lastUpdateTime = currentTime;
  }
  requestAnimationFrame(checkForUpdates);
}
checkForUpdates();

// Initial load of data and UI update
loadFromLocalStorage();
updateUI();

// Bonus: "User is typing" feature
let typingTimer;
document.getElementById("message-input").addEventListener("input", () => {
  clearTimeout(typingTimer);
  document.getElementById("typing-indicator").textContent = `${sanitizeInput(
    currentUser
  )} is typing...`;
  typingTimer = setTimeout(() => {
    document.getElementById("typing-indicator").textContent = "";
  }, 1000);
});

// Bonus: Allow users to change their username
document.getElementById("change-username").addEventListener("click", () => {
  const newUsername = prompt("Enter new username:");
  if (newUsername && newUsername.trim() && newUsername.length <= 20) {
    if (!users.includes(newUsername)) {
      const index = users.indexOf(currentUser);
      if (index > -1) {
        users[index] = newUsername;
      }
      currentUser = newUsername;
      updateUI();
      saveToLocalStorage();
    } else {
      alert("Username already taken. Please choose another.");
    }
  } else if (newUsername) {
    alert("Please enter a valid username (max 20 characters).");
  }
});
