import { Schema } from 'mongoose';
import moment from 'moment';

let ObjectId = Schema.Types.ObjectId;

export default {
  identity: 'event',
  base: 'site-owned',
  public: true,
  virtuals: {
    video: {
      get() {
        if (this.media) {
          let video = this.media.find(element => element.type === 'video');
          if (video) return video.src;
        }
      },
    },
    priceRange: {
      get() {
        let prices = this.pricingTiers.reduce((prev, curr) => {
          return prev.concat(curr.sections.map(section => section.price));
        }, []);

        prices = prices
          .filter(v => ~prices.indexOf(v))
          .sort();
        let low = prices[0];
        let high = prices[prices.length - 1];
        let str = `$${low}`;
        if (!low) str = 'Free';
        if (low !== high) str += ` - $${high}`;
        return str;
      },
    },
    dateRange: {
      get() {
        if (this.showtimes && this.showtimes.length && this.showtimes[0].date) {
          let shows = this.showtimes
            .sort((a, b) => moment(a.date).isBefore(b.date));

          if (!shows.length) return '';

          let start = shows[0]
            , end = shows[shows.length - 1];

          // let start = shows[0].formats.abbr, end = shows[shows.length-1].formats.abbr;
          let str = start.formats.abbr;

          if (start.short !== end.short) {
            str += '-';
            if (start.month !== end.month) return str + end.abbr;
            str += end.date;
          }

          return str;
        }
      },
    },
  },
  attributes: {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: 'general',
    },
    enabled: {
      type: Date,
    },
    dayofshow: {
      type: Number,
      default: 0,
    },
    doorTime: {
      type: Date,
    },
    description: {
      type: String,
    },
    facebook: {
      type: String,
    },
    link: {
      type: String,
    },
    entertainers: [{
      type: ObjectId,
      ref: 'Entertainer',
    }],
    pricingTiers: [{
      filter: {
        type: String,
      },
      sections: [{
        id: {
          type: ObjectId,
          ref: 'Section',
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      }],
    }],
    showtimes: [{
      type: ObjectId,
      ref: 'Showtime',
    }],
    venue: {
      type: ObjectId,
      ref: 'Venue',
    },
    media: [{
      type: ObjectId,
      ref: 'Medium',
    }],
  },
};
