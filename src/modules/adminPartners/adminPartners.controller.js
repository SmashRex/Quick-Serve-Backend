import * as adminPartnersService from './adminPartners.service.js';

export async function approve(req, res, next) {
  try {
    const partner = await adminPartnersService.approvePartner(req.params.id, req.body.maxTurnaroundHours);
    res.status(200).json(partner);
  } catch (err) {
    next(err);
  }
}

export async function list(req, res, next) {
  try {
    const { status, page, limit } = req.query;
    const result = await adminPartnersService.listPartners({
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
    const partner = await adminPartnersService.getPartnerById(req.params.id);
    res.status(200).json(partner);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const partner = await adminPartnersService.updatePartner(req.params.id, req.body);
    res.status(200).json(partner);
  } catch (err) {
    next(err);
  }
}