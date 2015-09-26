import { Schema } from 'mongoose';

let ObjectId = Schema.Types.ObjectId;

export default {
  identity: 'seat',
  base: 'persisted',
  public: true,
  attributes: {
    row: {
      type: String,
      required: true
    },
    number: {
      type: String,
      required: true
    },
    section: {
      type: ObjectId,
      ref: 'Section'
    }
  }
};
