#!/usr/bin/env node

/* MIT License
 *
 * Copyright (c) 2025 Mike Chambers
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    transports: ["websocket", "polling"],
    maxHttpBufferSize: 50 * 1024 * 1024,
});

const PORT = 3005;
// Track clients by application
const applicationClients = {};

// Helper function for timestamped logging
function log(message, data = null) {
    const timestamp = new Date().toISOString();
    if (data) {
        // Limit data size in logs to prevent huge outputs
        const dataStr = JSON.stringify(data, null, 2);
        const truncated = dataStr.length > 1000 ? dataStr.substring(0, 1000) + '... [truncated]' : dataStr;
        console.log(`[${timestamp}] ${message}`, truncated);
    } else {
        console.log(`[${timestamp}] ${message}`);
    }
}

// Track command flow
let commandCounter = 0;

io.on("connection", (socket) => {
    log(`User connected: ${socket.id}`);
    log(`Connection details:`, {
        transport: socket.conn.transport.name,
        remoteAddress: socket.handshake.address,
        headers: socket.handshake.headers['user-agent'],
        query: socket.handshake.query
    });

    socket.on("register", ({ application }) => {
        try {
            log(`REGISTER: Client ${socket.id} registering for application: ${application}`);

            // Store the application preference with this socket
            socket.data.application = application;

            // Register this client for this application
            if (!applicationClients[application]) {
                applicationClients[application] = new Set();
                log(`REGISTER: Created new client set for application: ${application}`);
            }
            applicationClients[application].add(socket.id);

            log(`REGISTER: Application '${application}' now has ${applicationClients[application].size} clients`);
            log(`REGISTER: All registered applications:`, Object.keys(applicationClients));

            // Optionally confirm registration
            socket.emit("registration_response", {
                type: "registration",
                status: "success",
                message: `Registered for ${application}`,
            });
            log(`REGISTER: Sent success response to ${socket.id}`);
        } catch (error) {
            log(`REGISTER ERROR: Failed to register ${socket.id} for ${application}:`, error.message);
        }
    });

    socket.on("command_packet_response", ({ packet }) => {
        try {
            log(`RESPONSE: Received response packet from ${socket.id}`);
            log(`RESPONSE: Packet contents:`, packet);

            const senderId = packet.senderId;

            if (senderId) {
                const senderSocket = io.sockets.sockets.get(senderId);
                if (senderSocket) {
                    io.to(senderId).emit("packet_response", packet);
                    log(`RESPONSE: Successfully sent response to original sender ${senderId}`);
                } else {
                    log(`RESPONSE WARNING: Sender ${senderId} is no longer connected`);
                }
            } else {
                log(`RESPONSE ERROR: No sender ID provided in packet`);
            }
        } catch (error) {
            log(`RESPONSE ERROR: Failed to handle response:`, error.message);
        }
    });

    socket.on("command_packet", ({ application, command }) => {
        const commandId = ++commandCounter;
        try {
            log(`COMMAND #${commandId}: Received from ${socket.id} for application '${application}'`);
            log(`COMMAND #${commandId}: Command details:`, command);

            // Check if there are any clients for this application
            if (!applicationClients[application] || applicationClients[application].size === 0) {
                log(`COMMAND #${commandId} WARNING: No clients registered for application '${application}'`);
                log(`COMMAND #${commandId}: Available applications:`, Object.keys(applicationClients));
            }

            // Process the command
            let packet = {
                senderId: socket.id,
                application: application,
                command: command,
                commandId: commandId,
                timestamp: new Date().toISOString()
            };

            const sent = sendToApplication(packet);
            if (sent) {
                log(`COMMAND #${commandId}: Successfully forwarded to application '${application}'`);
            } else {
                log(`COMMAND #${commandId} ERROR: Failed to forward - no recipients`);
                // Send error response back to sender
                socket.emit('command_error', {
                    error: `No clients registered for application: ${application}`,
                    commandId: commandId
                });
            }
        } catch (error) {
            log(`COMMAND #${commandId} ERROR: Failed to process command:`, error.message);
            socket.emit('command_error', {
                error: error.message,
                commandId: commandId
            });
        }
    });

    socket.on("disconnect", () => {
        log(`DISCONNECT: User ${socket.id} disconnecting`);
        log(`DISCONNECT: Socket was registered for application: ${socket.data.application || 'none'}`);

        // Remove this client from all application registrations
        let removedFrom = [];
        for (const app in applicationClients) {
            if (applicationClients[app].has(socket.id)) {
                applicationClients[app].delete(socket.id);
                removedFrom.push(app);
                log(`DISCONNECT: Removed ${socket.id} from application '${app}'`);

                // Clean up empty sets
                if (applicationClients[app].size === 0) {
                    delete applicationClients[app];
                    log(`DISCONNECT: Application '${app}' has no more clients, removing from registry`);
                } else {
                    log(`DISCONNECT: Application '${app}' still has ${applicationClients[app].size} clients`);
                }
            }
        }

        if (removedFrom.length === 0) {
            log(`DISCONNECT: Client ${socket.id} was not registered to any application`);
        }

        log(`DISCONNECT: Current registered applications:`, Object.keys(applicationClients));
    });
});

// Add a function to send messages to clients by application
function sendToApplication(packet) {
    let application = packet.application;
    const commandId = packet.commandId || 'unknown';

    try {
        if (applicationClients[application]) {
            const clientCount = applicationClients[application].size;
            log(`FORWARD #${commandId}: Sending to ${clientCount} clients for application '${application}'`);

            let senderId = packet.senderId;
            let successCount = 0;

            // Loop through all client IDs for this application
            applicationClients[application].forEach((clientId) => {
                try {
                    const clientSocket = io.sockets.sockets.get(clientId);
                    if (clientSocket && clientSocket.connected) {
                        io.to(clientId).emit("command_packet", packet);
                        log(`FORWARD #${commandId}: Sent to client ${clientId}`);
                        successCount++;
                    } else {
                        log(`FORWARD #${commandId} WARNING: Client ${clientId} is not connected`);
                    }
                } catch (error) {
                    log(`FORWARD #${commandId} ERROR: Failed to send to ${clientId}:`, error.message);
                }
            });

            log(`FORWARD #${commandId}: Successfully sent to ${successCount}/${clientCount} clients`);
            return successCount > 0;
        }
        log(`FORWARD #${commandId} WARNING: No clients registered for application '${application}'`);
        log(`FORWARD #${commandId}: Available applications with clients:`,
            Object.entries(applicationClients).map(([app, clients]) => `${app}: ${clients.size} clients`)
        );
        return false;
    } catch (error) {
        log(`FORWARD #${commandId} ERROR: Failed to send to application:`, error.message);
        return false;
    }
}

// Example: Use this function elsewhere in your code
// sendToApplication('photoshop', { message: 'Update available' });

server.listen(PORT, () => {
    log(`========================================`);
    log(`adb-mcp Command proxy server started`);
    log(`WebSocket URL: ws://localhost:${PORT}`);
    log(`Timestamp: ${new Date().toISOString()}`);
    log(`Process ID: ${process.pid}`);
    log(`Node version: ${process.version}`);
    log(`========================================`);
});

// Log uncaught errors
process.on('uncaughtException', (error) => {
    log('FATAL ERROR: Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    log('FATAL ERROR: Unhandled Rejection at:', promise, 'reason:', reason);
});
