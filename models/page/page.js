import { Schema } from 'mongoose';

let ObjectId = Schema.Types.ObjectId;

let dataSchema = new Schema({
  name: String,
  query: String,
})

export default {
  identity: 'page',
  base: 'page-base',
  public: true,
  attributes: {
    url: {
      type: String,
      required: true,
    },
    templateUrl: {
      type: String,
    },
    content: {
      type: String,
    },
    isPublished: {
      type: String,
    },
    isDynamic: {
      type: Boolean,
      default: false,
    },
    data: [dataSchema],
    media: [{
      type: ObjectId,
      ref: 'Medium',
    }],
  },
};
