import mongoose, { Schema } from 'mongoose';

let ObjectId = Schema.Types.ObjectId;

export default {
  identity: 'event',
  base: 'site-owned',
  public: true,
  types: {
    referencedBy: function(value){
      return Array.isArray(value) && value.filter(val => {
        return /[a-f0-9]{24}/.test(val);
      });
    }
  },
  attributes: {
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'general'
    },
    enabled: {
      type: Date
    },
    dayofshow: {
      type: Number,
      default: 0
    },
    doorTime: {
      type: Date
    },
    description: {
      type: String
    },
    facebook: {
      type: String
    },
    link: {
      type: String
    },
    video: {
      type: String
    },
    entertainers: [{
      type: ObjectId,
      ref: 'Entertainer'
    }],
    pricingTiers: [{
      filter: {
        type: String
      },
      sections: [{
        id: {
          type: String,
          required: true
        },
        price: {
          type: Number,
          required: true
        }
      }]
    }],
    showtimes: {
      type: ObjectId,
      ref: 'Showtime'
    },
    venue: {
      type: ObjectId,
      ref: 'Venue'
    },
    media: [{
      type: ObjectId,
      ref: 'Medium'
    }],
  }
};
