import ApiError from '../utils/ApiError.js';

export function authorizeTier(...allowedTiers) {
  return (req, res, next) => {
    if (!req.user || !allowedTiers.includes(req.user.roleTier)) {
      return next(new ApiError(403, 'Your admin role does not permit this action.'));
    }
    next();
  };
}