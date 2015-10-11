import { set } from 'object-path';

export default {
  identity: 'entertainer',
  base: 'persisted',
  public: true,
  attributes: {
    name: {
      type: String,
      required: true,
    },
    credits: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    facebook: {
      type: String,
    },
    website: {
      type: String,
    },
    media: {
      type: [String],
    },
    siteId: {
      type: String,
    },
    events: {
      type: [String],
    },
  },
  lifecycle: {
    beforeAccess: (query, { user, flex: { site } }) => {
      if (site.type === 'entertainer') set(query, 'where.website', site.host);
    },
  },
};
