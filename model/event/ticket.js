import { Schema } from 'mongoose';

let ObjectId = Schema.Types.ObjectId;

export default {
  identity: 'ticket',
  base: 'persisted',
  public: true,
  attributes: {
    status: {
      type: String,
      required: true
    },
    type: {
      type: String
    },
    price: {
      type: Number
    },
    seat: {
      ref: 'Seat',
      type: ObjectId
    },
    showtime: {
      type: ObjectId,
      ref: 'Showtime'
    }
  }
};
