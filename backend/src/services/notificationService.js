import Notification from '../../models/Notification.js';
import { io } from '../../config/socketIO.js';

// Send notification
export const sendNotification = async (recipientId, notificationData) => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      ...notificationData,
    });

    // Emit real-time notification via Socket.io
    io.to(`user_${recipientId}`).emit('new_notification', {
      id: notification._id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      priority: notification.priority,
      createdAt: notification.createdAt,
    });

    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

// Send bulk notifications
export const sendBulkNotifications = async (recipientIds, notificationData) => {
  try {
    const notifications = await Notification.insertMany(
      recipientIds.map(id => ({
        recipient: id,
        ...notificationData,
      }))
    );

    // Emit to all recipients
    recipientIds.forEach(recipientId => {
      io.to(`user_${recipientId}`).emit('new_notification', {
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
      });
    });

    return notifications;
  } catch (error) {
    console.error('Error sending bulk notifications:', error);
  }
};

// Get notifications for a user
export const getUserNotifications = async (userId, unreadOnly = false, limit = 20) => {
  try {
    let query = { recipient: userId };
    if (unreadOnly) {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);

    return notifications;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

// Mark notification as read
export const markAsRead = async (notificationId) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      {
        read: true,
        readAt: new Date(),
      },
      { new: true }
    );

    return notification;
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

// Mark all notifications as read
export const markAllAsRead = async (userId) => {
  try {
    const result = await Notification.updateMany(
      { recipient: userId, read: false },
      {
        read: true,
        readAt: new Date(),
      }
    );

    return result;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
  }
};

// Send SLA warning notifications
export const sendSLAWarnings = async () => {
  try {
    const Complaint = require('../../models/Complaint.js').default;
    
    // Find complaints approaching SLA deadline
    const now = new Date();
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    const complaints = await Complaint.find({
      status: { $ne: 'RESOLVED' },
      'sla.deadline': { $lte: twoHoursLater, $gte: now },
    });

    for (const complaint of complaints) {
      const assignedTeamId = complaint.assignedTeamId;
      
      if (assignedTeamId) {
        const Team = require('../../models/Team.js').default;
        const team = await Team.findById(assignedTeamId);

        if (team && team.members.length > 0) {
          await sendBulkNotifications(team.members, {
            type: 'SLA_WARNING',
            title: 'SLA Warning',
            message: `Complaint ${complaint.trackingId} is approaching SLA deadline.`,
            priority: 'HIGH',
            relatedComplaint: complaint._id,
          });
        }
      }
    }
  } catch (error) {
    console.error('Error sending SLA warnings:', error);
  }
};

// Send overdue alerts
export const sendOverdueAlerts = async () => {
  try {
    const Complaint = require('../../models/Complaint.js').default;
    const User = require('../../models/User.js').default;
    
    // Find overdue complaints
    const complaints = await Complaint.find({
      status: { $ne: 'RESOLVED' },
      'sla.isOverdue': true,
    });

    // Get supervisors
    const supervisors = await User.find({ role: 'SUPERVISOR' });

    if (supervisors.length > 0) {
      await sendBulkNotifications(
        supervisors.map(s => s._id),
        {
          type: 'OVERDUE_ALERT',
          title: 'Overdue Complaints Alert',
          message: `There are ${complaints.length} overdue complaints requiring attention.`,
          priority: 'URGENT',
        }
      );
    }
  } catch (error) {
    console.error('Error sending overdue alerts:', error);
  }
};

// Performance notification
export const sendPerformanceNotification = async (adminId, performanceData) => {
  try {
    await sendNotification(adminId, {
      type: 'PERFORMANCE_ALERT',
      title: 'Performance Update',
      message: `Your team's SLA compliance rate is ${performanceData.slaComplianceRate}%.`,
      priority: performanceData.slaComplianceRate < 80 ? 'HIGH' : 'LOW',
      metadata: performanceData,
    });
  } catch (error) {
    console.error('Error sending performance notification:', error);
  }
};
