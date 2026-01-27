import { Server } from 'socket.io';

let io;
const userSockets = new Map(); // Map to store userId -> socketId

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || [
        'http://localhost:5173',
        'http://localhost:3000',
      ],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Middleware for authentication
  io.use((socket, next) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
      socket.userId = userId;
      userSockets.set(userId, socket.id);
      next();
    } else {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected with socket ID: ${socket.id}`);

    // User joins their personal room
    socket.join(`user-${socket.userId}`);

    // Admin joins admin room for department updates
    socket.on('join-admin-channel', (department) => {
      if (department) {
        socket.join(`admin-${department}`);
        console.log(`Admin joined admin-${department}`);
      }
    });

    // Leave admin channel
    socket.on('leave-admin-channel', (department) => {
      if (department) {
        socket.leave(`admin-${department}`);
        console.log(`Admin left admin-${department}`);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`);
      userSockets.delete(socket.userId);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

export const getUserSockets = () => userSockets;

// Emit new complaint to admin dashboard
export const emitNewComplaint = (complaintData, category) => {
  io.to(`admin-${category}`).emit('new-complaint', complaintData);
};

// Emit complaint status update to citizen
export const emitStatusUpdate = (userId, complaintData) => {
  io.to(`user-${userId}`).emit('complaint-status-updated', complaintData);
};

// Emit assignment to citizen
export const emitAssignment = (userId, complaintData) => {
  io.to(`user-${userId}`).emit('complaint-assigned', complaintData);
};

// Emit escalation to citizen
export const emitEscalation = (userId, complaintData) => {
  io.to(`user-${userId}`).emit('complaint-escalated', complaintData);
};

// Emit general notification
export const emitNotification = (userId, notification) => {
  io.to(`user-${userId}`).emit('notification', notification);
};

// Broadcast to all admins in a department
export const emitToAdminChannel = (department, eventName, data) => {
  io.to(`admin-${department}`).emit(eventName, data);
};
