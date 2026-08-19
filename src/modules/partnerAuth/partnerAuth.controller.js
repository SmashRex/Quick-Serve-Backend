import * as partnerAuthService from './partnerAuth.service.js';

export async function onboard(req, res, next) {
  try {
    const partner = await partnerAuthService.onboardPartner(req.body);
    res.status(201).json(partner);
  } catch (err) {
    next(err);
  }
}

export async function verify(req, res, next) {
  try {
    const result = await partnerAuthService.verifyPartnerEmail(req.query.token);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}