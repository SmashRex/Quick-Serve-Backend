import * as authService from './auth.service.js';


export async function signup(req, res, next) {
  try {
    const result = await authService.signup(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function verifyEmail(req, res, next) {
  try {
    const result = await authService.verifyEmail(req.query.token);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
export async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    const result = await authService.getCurrentUser(req.user.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function refresh(req, res, next) {
  try {
    const result = await authService.refresh(req.body.refreshToken);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    res.status(200).json({ message: 'Logged out.' });
  } catch (err) {
    next(err);
  }
}