import * as devicesService from './devices.service.js';

export async function register(req, res, next) {
  try {
    const { pushToken, platform } = req.body;
    const result = await devicesService.registerDevice(req.user.role, req.user.id, pushToken, platform);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}