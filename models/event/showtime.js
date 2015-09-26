import moment from 'moment';

export default {
  identity: 'showtime',
  base: 'persisted',
  public: true,
  virtuals: {
    formats: {
      get: function() {
        let m = moment(this.date);
        return {
          month: m.format('MMM'),
          date: m.format('D'),
          time: m.format('H:mm'),
          short: m.format('M/D/YY'),
          abbr: m.format('MMM. D'),
          med: m.format('dddd MMMM D')
        };
      }
    }
  },
  attributes: {
    datetime: {
      type: Date,
      required: true
    },
    tickets: [{
      ref: 'Ticket',
      type: String
    }],
    event: {
      ref: 'Event',
      type: String,
    }
  }
};
