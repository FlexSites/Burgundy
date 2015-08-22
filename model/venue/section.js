export default {
  identity: 'section',
  base: 'persisted',
  public: true,
  attributes: {
    type: {
      type: 'string',
      default: 'GA'
    },
    identity: {
      type: 'string',
      required: true
    },
    color: {
      type: 'string'
    },
    seatCount: {
      type: 'number'
    },
    venue: {
      model: 'venue'
    },
    seat: {
      collection: 'seat',
      via: 'section'
    }
  }
};
