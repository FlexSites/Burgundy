
import objectPath from 'object-path';
import { Schema } from 'mongoose';

let ObjectId = Schema.Types.ObjectId;

export default {
  identity: 'site-owned',
  base: 'persisted',
  attributes: {
    site: {
      type: ObjectId,
      ref: 'Site',
      required: true,
    },
  },
  lifecycle: {
    beforeAccess: (query, { flex }) => {
      let { site } = flex;

      // If there's a siteId in the request, only show related models
      objectPath.set(query, 'where.site', site.id || site._id);
    },

    beforeCreate: (instance, { flex }) => {
      let { site } = flex;
      if (instance && !instance.id) {
        if (!instance.site) {
          if (!site) throw new Error('Saving object to undefined site');
          instance.site = site.id;
        }
      }
    },

  },
};
