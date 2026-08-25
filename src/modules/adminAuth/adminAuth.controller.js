import * as adminAuthService from './adminAuth.service.js';

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await adminAuthService.login(email, password);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function reject(req, res, next) {
  try {
    const partner = await adminPartnersService.rejectPartner(req.params.id, req.body.reason);
    res.status(200).json(partner);
  } catch (err) {
    next(err);
  }
}