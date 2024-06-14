// Get the canvas element
let canvas = document.getElementById("canvas");
// Set canvas dimensions to match window size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Connect to the Socket.io server
let socket = io.connect('http://localhost:8080/');
// Get the 2D drawing context for the canvas
let drawing = canvas.getContext("2d");

// Variables to store mouse coordinates and drawing state
let x; // Mouse x-coordinate
let y; // Mouse y-coordinate
let painting = false; // Indicates whether mouse is being pressed

// When mouse button is pressed down on canvas
canvas.onmousedown = (e) => {
    // Capture mouse coordinates
    x = e.clientX;
    y = e.clientY;
    // Start drawing and emit 'down' event with coordinates
    painting = true;
    socket.emit('down', { x, y });
    drawing.moveTo(x, y);
};

// When mouse button is released
canvas.onmouseup = () => {
    // Stop drawing and begin new path
    painting = false;
    drawing.beginPath();
};

// When mouse is moved
canvas.onmousemove = (e) => {
    // Update mouse coordinates
    x = e.clientX;
    y = e.clientY;

    // If mouse is being pressed down, draw line and emit 'draw' event
    if (painting) {
        socket.emit("draw", { x: x, y: y });
        drawing.lineTo(x, y);
        drawing.stroke();
    }
};

// When 'ondrawing' event is received from server
socket.on('ondrawing', ({ x, y }) => {
    // Draw line to received coordinates
    drawing.lineTo(x, y);
    drawing.stroke();
});

// When 'ondown' event is received from server
socket.on('ondown', ({ x, y }) => {
    // Start new path to avoid connecting lines from different strokes
    drawing.beginPath();
    drawing.moveTo(x, y);
});

// Function to send chat message
function sendMessage() {
    // Get message input element
    let input = document.getElementById('messageInput');
    // Get message value
    let msg = input.value;
    // If message is not empty, emit 'chatMessage' event with message
    if (msg.trim() !== "") {
        socket.emit("chatMessage", msg);
        // Clear input field
        input.value = "";
    }
}

// When 'chatMessage' event is received from server
socket.on("chatMessage", (msg) => {
    // Get messages div
    let messagesDiv = document.getElementById("messages");
    // Create new div for message
    let messageElement = document.createElement("div");
    // Set text content of div to received message
    messageElement.textContent = msg;
    // Append message div to messages div
    messagesDiv.appendChild(messageElement);
    // Scroll to bottom of messages div
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});
