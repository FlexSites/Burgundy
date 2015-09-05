import objectPath from 'object-path';

export default {
  identity: 'site',
  base: 'persisted',
  public: true,
  attributes: {
    name: {
      type: 'string',
      required: true
    },
    type: {
      type: 'string',
      required: true
    },
    repo: {
      type: 'string',
      required: true
    },
    host: {
      type: 'string',
      required: true
    },
    analytics: {
      type: 'string',
      required: true
    },
    title: {
      type: 'string'
    },
    isSinglePageApp: {
      type: 'boolean',
      defaultsTo: false
    },
    styles: {
      type: 'array'
    },
    scripts: {
      type: 'array'
    },
    description: {
      type: 'string',
      required: true
    },
    keywords: {
      type: 'string',
      required: true
    },
    redirects: {
      type: 'array'
    },
    contact_email: {
      type: 'string'
    },
    contact_phone: {
      type: 'string'
    },
    testimonials: {
      collection: 'testimonial',
      via: 'site'
    },
    pages: {
      collection: 'page',
      via: 'site'
    }
  },
  lifecycle: {
    beforeAccess: (query, { user }) => {
      if (!user) return;

      let hosts = user.groups.items.map(group => group.name);

      if (!~hosts.indexOf('Admin')) objectPath.set(query, 'filter.where.host', hosts);
    },
    beforeUpdate: (instance, { user }) => {
      [
        'testimonials',
        'pages',
      ].forEach(key => {
        let val = instance[key];
        if (!val || !val.length) delete instance[key];
      });

      return instance;
    }
  }
};
