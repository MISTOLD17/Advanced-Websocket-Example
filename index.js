let express = require("express"); // Import the express library
let app = express(); // Create an express application
let httpServer = require("http").createServer(app); // Create an HTTP server
let io = require("socket.io")(httpServer); // Attach socket.io to the HTTP server

let connections = []; // Array to track connected clients

io.on("connect", (socket) => { // When a new client connects
    connections.push(socket); // Add client to connections array
    console.log(`${socket.id} has connected`); // Log connection

    socket.on("draw", (data) => { // When draw event is received
        connections.forEach(con => { // Broadcast draw event to other clients
            if (con.id !== socket.id)
                con.emit("ondrawing", { x: data.x, y: data.y });
        });
    });

    socket.on('down', (data) => { // When down event is received 
        connections.forEach(con => { // Broadcast down event to other clients
            if (con.id != socket.id) {
                con.emit('ondown', { x: data.x, y: data.y });
            }
        });
    });

    // Chat message event
    socket.on("chatMessage", (msg) => { // When chat message is received
        connections.forEach(con => { // Broadcast chat message to all clients
            con.emit("chatMessage", msg);
        });
    });

    socket.on("disconnect", (reason) => { // When client disconnects
        console.log(`${socket.id} has disconnected`); // Log disconnection
        connections = connections.filter((con) => con.id !== socket.id); // Remove client from connections array
    });
});

app.use(express.static("public")); // Serve static files from the public directory

let PORT = process.env.PORT || 8080; // Define port to listen on
httpServer.listen(PORT, () => console.log(`Server started on port ${PORT}`)); // Start server and log port
