export default {
  identity: 'ticket',
  base: 'persisted',
  public: true,
  attributes: {
    status: {
      type: 'string',
      required: true
    },
    type: {
      type: 'string'
    },
    price: {
      type: 'number'
    },
    seat: {
      model: 'seat'
    },
    showtime: {
      model: 'showtime'
    }
  }
};
