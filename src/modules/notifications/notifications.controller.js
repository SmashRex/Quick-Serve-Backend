import * as notificationsService from '../../services/notifications.service.js';

export async function list(req, res, next) {
  try {
    const { unreadOnly } = req.query;
    const notifications = await notificationsService.getNotifications(req.user.role, req.user.id, {
      unreadOnly: unreadOnly === 'true',
    });
    res.status(200).json(notifications);
  } catch (err) {
    next(err);
  }
}

export async function markRead(req, res, next) {
  try {
    const notification = await notificationsService.markAsRead(req.user.role, req.user.id, req.params.id);
    res.status(200).json(notification);
  } catch (err) {
    next(err);
  }
}