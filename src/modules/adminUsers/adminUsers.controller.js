import * as adminUsersService from './adminUsers.service.js';

export async function create(req, res, next) {
  try {
    const admin = await adminUsersService.createAdmin(req.body);
    res.status(201).json(admin);
  } catch (err) {
    next(err);
  }
}