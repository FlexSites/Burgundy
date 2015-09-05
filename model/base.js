'use strict';

import flatten from 'flat';
import { get } from 'object-path';
import getModels from 'express-waterline';

let passThrough = (data) => data;

export default {
  identity: 'base',
  public: false,
  attributes: {
    createdAt: function() {
      return new Date(parseInt(this.id.toString().slice(0, 8), 16) * 1000);
    },

    toJSON: function() {
      if (typeof this.createdAt === 'function') {
        this.createdAt = this.createdAt();
      }

      return this;
    }
  },
  lifecycle: {
    afterAccess: (instance, req) => {
      return getModels('medium')
        .then(Media => {
          if (!instance.mediumIds) return instance;
          return Media
            .find({ where: { id: instance.mediumIds } })
            .then(media => {
              instance.media = media;
              return instance;
            });
        })
    },

    beforeSave: function(instance, req){
      if (!instance) return;

      // Flatten Attributes
      instance = flatten(instance, { delimiter: '_', safe: true });

      // Inject Site ID if it was null
      if (get(this, '_attributes.site') && !instance.site) {
        instance.site = flex.site.id;
      }

      return instance;
    },

    beforeValidate: (req, res, next) => {
      if (req.body.media) delete req.body.media;
      next();
    },
  },
  acl: {
    create: 'siteOwner',
    read: '$everyone',
    update: 'siteOwner',
    delete: 'siteOwner'
  }
};
