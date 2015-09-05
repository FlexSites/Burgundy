'use strict';

import objectPath from 'object-path';

export default {
  identity: 'site-owned',
  base: 'persisted',
  attributes: {
    site: {
      model: 'site',
      required: true
    }
  },
  lifecycle: {
    beforeAccess: (query, { flex: { site } }) => {
      // If there's a siteId in the request, only show related models
      if (site) objectPath.set(query, 'where.site', site.id);
    },

    beforeSave: (instance, { user, flex: { site } }) => {
      if (instance && !instance.id) {
        if (!instance.site) {
          if (!site) throw new Error('Saving object to undefined site');
          instance.site = site.id;
        }
      }
    }

  }
};
