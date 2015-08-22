'use strict';

import express from 'express';

export default function(app) {

  let router = express.Router({ mergeParams: true });

  router.route('/')
    .get(readMiddleware)
    .post((req, res, next) => req.model.middleware.beforeValidate(req, res, next),
    ({ model, body }, res, next) => {
      model.create(body)
        .then(res.json.bind(res))
        .catch(next);
    });

  router.route('/count')
    .get(({ model }, res, next) => {
      model
        .then((count) => res.json({ count }))
        .catch(next);
    });

  router.route('/:id')
    .get(readMiddleware)
    .put((req, res, next) => req.model.middleware.beforeValidate(req, res, next),
    ({ model, params, body }, res, next) => {
      model.update({ id: params.id }, body)
        .then(body => Array.isArray(body) ? body[0] : body)
        .then(res.json.bind(res))
        .catch(next);
    })
    .delete(({ model, params }, res, next) => {
      model.destroy({ id: params.id })
        .then(body => Array.isArray(body) ? body[0] : body)
        .then(res.json.bind(res))
        .catch(next);
    });

  return router;
}

function readMiddleware({ model }, res, next) {
  model.then(res.json.bind(res))
    .catch(next);
}

