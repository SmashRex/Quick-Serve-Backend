import * as adminDisputesService from './adminDisputes.service.js';

export async function list(req, res, next) {
  try {
    const { status, page, limit } = req.query;
    const result = await adminDisputesService.listDisputes({
      status,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? Math.min(Math.max(parseInt(limit, 10), 1), 100) : 20,
    });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const dispute = await adminDisputesService.getDisputeById(req.params.id);
    res.status(200).json(dispute);
  } catch (err) {
    next(err);
  }
}

export async function resolve(req, res, next) {
  try {
    const dispute = await adminDisputesService.resolveDispute(req.params.id, req.body.resolutionNote, req.user.id);
    res.status(200).json(dispute);
  } catch (err) {
    next(err);
  }
}