import { set } from 'object-path';

export default {
  identity: 'entertainer',
  base: 'persisted',
  public: true,
  attributes: {
    identity: {
      type: 'string',
      required: true
    },
    credits: {
      type: 'string',
      required: true
    },
    description: {
      type: 'string',
      required: true
    },
    facebook: {
      type: 'string'
    },
    website: {
      type: 'string'
    },
    media: {
      type: 'array'
    },
    siteId: {
      type: 'string'
    }
  },
  middleware: {
    beforeAccess: (req, res, next) => {
      if (!req.user) return next();
      if (req.flex.site.type === 'entertainer') set(req, 'query.filter.where.website', req.flex.site.host);
      next();
    }
  }
};
