import * as riderTasksService from './riderTasks.service.js';

export async function getTasks(req, res, next) {
  try {
    const tasks = await riderTasksService.getRiderTasks(req.user.id);
    res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
}