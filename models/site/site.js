import objectPath from 'object-path';
import { Schema } from 'mongoose';

let ObjectId = Schema.Types.ObjectId;

export default {
  identity: 'site',
  base: 'persisted',
  public: true,
  attributes: {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    repo: {
      type: String,
      required: true,
    },
    host: {
      type: String,
      required: true,
    },
    analytics: {
      type: String,
      required: true,
    },
    title: {
      type: String,
    },
    isSinglePageApp: {
      type: Boolean,
      defaultsTo: false,
    },
    styles: {
      type: [String],
    },
    scripts: {
      type: [String],
    },
    description: {
      type: String,
      required: true,
    },
    keywords: {
      type: String,
      required: true,
    },
    redirects: {
      type: [String],
    },
    contact_email: {
      type: String,
    },
    contact_phone: {
      type: String,
    },
    testimonials: {
      ref: 'Testimonial',
      type: ObjectId,
    },
    pages: {
      ref: 'Page',
      type: ObjectId,
    },
    events: {
      ref: 'Event',
      type: ObjectId,
    },
  },
  lifecycle: {
    beforeAccess: (query, { user }) => {
      if (!user) return;

      let hosts = user.groups.items.map(group => group.name);

      if (!~hosts.indexOf('Admin')) objectPath.set(query, 'where.host.$in', hosts);
    },

    beforeUpdate: (instance) => {
      [
        'testimonials',
        'pages',
      ].forEach(key => {
        let val = instance[key];
        if (!val || !val.length) delete instance[key];
      });

      return instance;
    },
  },
};
