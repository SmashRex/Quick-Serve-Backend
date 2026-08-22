import * as messagesService from './messages.service.js';

export async function getThreadAsCustomer(req, res, next) {
  try {
    const messages = await messagesService.getThread(req.params.id, 'customer', req.user.id);
    res.status(200).json(messages);
  } catch (err) {
    next(err);
  }
}

export async function postMessageAsCustomer(req, res, next) {
  try {
    const message = await messagesService.postMessage(req.params.id, 'customer', req.user.id, req.body.body);
    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
}

export async function getThreadAsPartner(req, res, next) {
  try {
    const messages = await messagesService.getThread(req.params.id, 'partner', req.user.id);
    res.status(200).json(messages);
  } catch (err) {
    next(err);
  }
}

export async function postMessageAsPartner(req, res, next) {
  try {
    const message = await messagesService.postMessage(req.params.id, 'partner', req.user.id, req.body.body);
    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
}