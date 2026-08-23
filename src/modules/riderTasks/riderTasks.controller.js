import * as riderTasksService from './riderTasks.service.js';

export async function getTasks(req, res, next) {
  try {
    const tasks = await riderTasksService.getRiderTasks(req.user.id);
    res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
}

export async function uploadProof(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.', error: 'Bad Request', statusCode: 400 });
    }
    const result = await riderTasksService.uploadProof(
      req.user.id,
      req.params.orderId,
      req.body.itemId,
      req.file.buffer,
      req.file.originalname
    );
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(req, res, next) {
  try {
    const order = await riderTasksService.updateOrderStatus(
      req.user.id,
      req.params.orderId,
      req.body.status
    );
    res.status(200).json(order);
  } catch (err) {
    next(err);
  }
}

export async function updateAvailability(req, res, next) {
  try {
    const result = await riderTasksService.updateRiderAvailability(req.user.id, req.body.status);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
