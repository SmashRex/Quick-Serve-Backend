import * as addressesService from './addresses.service.js';

export async function create(req, res, next) {
  try {
    const address = await addressesService.createAddress(req.user.id, req.body);
    res.status(201).json(address);
  } catch (err) {
    next(err);
  }
}

export async function list(req, res, next) {
  try {
    const addresses = await addressesService.listAddresses(req.user.id);
    res.status(200).json(addresses);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const address = await addressesService.updateAddress(req.user.id, req.params.id, req.body);
    res.status(200).json(address);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const result = await addressesService.deleteAddress(req.user.id, req.params.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}