import * as adminPartnersService from './adminPartners.service.js';

export async function approve(req, res, next) {
  try {
    const partner = await adminPartnersService.approvePartner(req.params.id, req.body.maxTurnaroundHours);
    res.status(200).json(partner);
  } catch (err) {
    next(err);
  }
}