export default {
  identity: 'venue',
  base: 'site-owned',
  public: true,
  attributes: {
    identity: { type: 'String', required: true },
    shortidentity: { type: 'String', required: true },
    address: {
      street: { type: 'String', required: true },
      suite: { type: 'String' },
      city: { type: 'String', required: true },
      state: { type: 'String', required: true },
      zip: { type: 'Number', required: true }
    },
    phone: { type: 'Number' },
    email: { type: 'String', required: true },
    geo: {
      type: 'geopoint'
    },
    brand: { type: 'String' },
    description: { type: 'String' },
    sections: {
      collection: 'section',
      via: 'venue'
    },
    // events: {
    //   collection: 'event',
    //   via: 'venue'
    // },
    // media: {
    //   type: 'array'
    // }
  }
};
