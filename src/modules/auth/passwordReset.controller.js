import * as passwordResetService from '../../services/passwordReset.service.js';

export async function forgotPasswordCustomer(req, res, next) {
  try {
    await passwordResetService.requestPasswordReset('customer', req.body.email);
    res.status(200).json({ message: 'If an account with that email exists, a reset link has been sent.' });
  } catch (err) {
    next(err);
  }
}

export async function forgotPasswordPartner(req, res, next) {
  try {
    await passwordResetService.requestPasswordReset('partner', req.body.email);
    res.status(200).json({ message: 'If an account with that email exists, a reset link has been sent.' });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const result = await passwordResetService.resetPassword(req.body.token, req.body.newPassword);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}