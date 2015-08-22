export default {
  identity: 'showtime',
  base: 'persisted',
  public: true,
  attributes: {
    date: {
      type: 'date',
      required: true
    },
    tickets: {
      collection: 'ticket',
      via: 'showtime'
    },
    event: {
      model: 'event'
    }
  }
};
