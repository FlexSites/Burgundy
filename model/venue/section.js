import { Schema } from 'mongoose';

let ObjectId = Schema.Types.ObjectId;

export default {
  identity: 'section',
  base: 'persisted',
  public: true,
  attributes: {
    type: {
      type: String,
      default: 'GA'
    },
    identity: {
      type: String,
      required: true
    },
    color: {
      type: String
    },
    seatCount: {
      type: Number
    },
    venue: {
      ref: 'Venue',
      type: ObjectId
    },
    seat: {
      ref: 'Seat',
      type: ObjectId
    }
  }
};
