import { Schema } from 'mongoose';

let ObjectId = Schema.Types.ObjectId;

export default {
  identity: 'venue',
  base: 'site-owned',
  public: true,
  attributes: {
    name: { type: String, required: true },
    shortidentity: { type: String, required: true },
    address: {
      street: { type: String, required: true },
      suite: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zip: { type: Number, required: true }
    },
    phone: { type: Number },
    email: { type: String, required: true },
    geo: {
      type: Number
    },
    brand: { type: String },
    description: { type: String },
    sections: [{
      ref: 'Section',
      type: ObjectId
    }],
    events: [{
      ref: 'Event',
      type: ObjectId
    }],
    media: [{
      ref: 'Medium',
      type: ObjectId
    }]
  }
};
