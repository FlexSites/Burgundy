import { Schema } from 'mongoose';
import { slugify } from '../../lib/string-util';

let ObjectId = Schema.Types.ObjectId;

export default {
  identity: 'venue',
  base: 'site-owned',
  public: true,
  attributes: {
    name: { type: String, required: true },
    shortName: { type: String, required: true },
    address: {
      street: { type: String, required: true },
      suite: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zip: { type: Number, required: true },
    },
    phone: { type: Number },
    email: { type: String, required: true },
    geo: {
      type: Number,
    },
    brand: { type: String },
    description: { type: String },
    sections: [{
      ref: 'Section',
      type: ObjectId,
    }],
    media: [{
      ref: 'Medium',
      type: ObjectId,
    }],
  },
  virtuals: {
    identifier: {
      get() {
        return slugify(this.address.city);
      },
    },
  },
};
