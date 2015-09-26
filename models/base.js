import { get } from 'object-path';

export default {
  identity: 'base',
  public: false,
  virtuals: {
    createdAt: {
      get: function() {
        return new Date(parseInt(this._id.toString().slice(0, 8), 16) * 1000);
      }
    }
  },
  attributes: {
    // toJSON: function() {
    //   if (typeof this.createdAt === 'function') {
    //     this.createdAt = this.createdAt();
    //   }

    //   return this;
    // }
  },
  lifecycle: {

    beforeSave: function(instance, req){

      // Inject Site ID if it was null
      if (get(this, '_attributes.site') && !instance.site) {
        instance.site = req.flex.site.id;
      }

      return instance;
    },

    beforeValidate: (req, res, next) => {
      if (req.body.media) delete req.body.media;
      next();
    }
  },
  acl: {
    create: 'siteOwner',
    read: '$everyone',
    update: 'siteOwner',
    delete: 'siteOwner'
  }
};
