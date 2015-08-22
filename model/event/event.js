export default {
  identity: 'event',
  base: 'site-owned',
  public: true,
  attributes: {
    identity: {
      type: 'string',
      required: true
    },
    type: {
      type: 'string',
      default: 'general'
    },
    enabled: {
      type: 'date'
    },
    dayofshow: {
      type: 'number',
      default: 0
    },
    doorTime: {
      type: 'date'
    },
    description: {
      type: 'string'
    },
    facebook: {
      type: 'string'
    },
    link: {
      type: 'string'
    },
    video: {
      type: 'string'
    },
    pricingTiers: [
      {
        filter: {
          type: 'string'
        },
        sections: [
          {
            id: {
              type:"string",
              required: true
            },
            price: {
              type: 'number',
              required: true
            }
          }
        ]
      }
    ],
    showtimes: {
      collection: 'showtime',
      via: 'event'
    },
    venue: {
      model: 'venue'
    },
    media: {
      type: 'array',
      model: 'Medium'
    }
  }
};
