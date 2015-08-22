'use strict';

import express from 'express';
import { get } from 'object-path';
import acl from '../acl';
import queryBuilder from './query-builder';
import { singularize } from '../../lib/string-util';

export default function(app) {

  let router = express.Router({ mergeParams: true });

  // Resource Injection
  router.use((req, res, next) => {
    let model = app.get('models')[singularize(req.params.resource || '')];
    if (model) req.model = req.Model = model;
    else if (req.params.version) return next(new Error(`Resource "${singularize(req.params.resource || '')}" not found.`));
    next();
  });

  // Body Formatting
  router.use(({ body, Model, flex, params }, res, next) => {
    if (body) {
      // Flatten Attributes
      body = flatten(body);

      // Inject Site ID if it was null
      if (get(Model, '_attributes.site') && !body.site) {
        body.site = flex.site.id;
      }
    }

    next();
  });

  router.use(acl(app));
  router.use('/:id?', queryBuilder(app));

  return router;
}


function flatten(obj) {
  var toReturn = {};

  for (var i in obj) {
    if (!obj.hasOwnProperty(i)) continue;

    if (typeof obj[i] === 'object') {
      var flatObject = flatten(obj[i]);
      for (var x in flatObject) {
        if (!flatObject.hasOwnProperty(x)) continue;

        toReturn[i + '_' + x] = flatObject[x];
      }
    } else {
      toReturn[i] = obj[i];
    }
  }

  return toReturn;
}
