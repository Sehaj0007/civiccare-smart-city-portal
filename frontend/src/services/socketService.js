import io from 'socket.io-client';

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173');

let socket = null;

export const initSocket = (userId) => {
  if (!socket || !socket.connected) {
    socket = io(SOCKET_URL, {
      query: { userId },
      path: '/socket.io',
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinAdminChannel = (department) => {
  if (socket) {
    socket.emit('join-admin-channel', department);
  }
};

export const leaveAdminChannel = (department) => {
  if (socket) {
    socket.emit('leave-admin-channel', department);
  }
};

export const onNewComplaint = (callback) => {
  if (socket) {
    socket.on('new-complaint', callback);
  }
};

export const onComplaintStatusUpdate = (callback) => {
  if (socket) {
    socket.on('complaint-status-updated', callback);
  }
};

export const onComplaintAssigned = (callback) => {
  if (socket) {
    socket.on('complaint-assigned', callback);
  }
};

export const onComplaintEscalated = (callback) => {
  if (socket) {
    socket.on('complaint-escalated', callback);
  }
};

export const onNotification = (callback) => {
  if (socket) {
    socket.on('notification', callback);
  }
};

export const onAdminComplaintUpdate = (callback) => {
  if (socket) {
    socket.on('admin-complaint-updated', callback);
  }
};

export const offNewComplaint = () => {
  if (socket) {
    socket.off('new-complaint');
  }
};

export const offComplaintStatusUpdate = () => {
  if (socket) {
    socket.off('complaint-status-updated');
  }
};

export const offComplaintAssigned = () => {
  if (socket) {
    socket.off('complaint-assigned');
  }
};

export const offComplaintEscalated = () => {
  if (socket) {
    socket.off('complaint-escalated');
  }
};

export const offNotification = () => {
  if (socket) {
    socket.off('notification');
  }
};

export const offAdminComplaintUpdate = () => {
  if (socket) {
    socket.off('admin-complaint-updated');
  }
};
