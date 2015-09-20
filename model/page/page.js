import { Schema } from 'mongoose';

let ObjectId = Schema.Types.ObjectId;

export default {
  identity: 'page',
  base: 'page-base',
  public: true,
  attributes: {
    url: {
      type: String,
      required: true
    },
    templateUrl: {
      type: String
    },
    content: {
      type: String
    },
    isPublished: {
      type: String
    },
    media: [{
      type: ObjectId,
      ref: 'Medium'
    }]
  }
};

