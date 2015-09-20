export default {
  identity: 'showtime',
  base: 'persisted',
  public: true,
  attributes: {
    date: {
      type: Date,
      required: true
    },
    tickets: {
      ref: 'Ticket',
      type: String
    },
    event: {
      ref: 'Event',
      type: String,
    }
  }
};
