import * as disputesService from './disputes.service.js';

export async function createDispute(req, res, next) {
  try {
    const dispute = await disputesService.createDispute(req.user.id, req.params.id, req.body.reason);
    res.status(201).json(dispute);
  } catch (err) {
    next(err);
  }
}