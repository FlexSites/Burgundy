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
  lifecycle: {
    beforeAccess: (query, { user, flex: { site } }) => {
      if (!user) return;
      if (site.type === 'entertainer') set(query, 'filter.where.website', site.host);
    }
  }
};
