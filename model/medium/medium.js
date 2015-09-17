'use strict';

import { getYoutubeId } from '../../lib/string-util';
import { find, assign, remove, variation, UPLOAD_HOST } from '../../lib/aws/s3';
import transform from '../../lib/blitline';
import getModels from 'express-waterline';
import url from 'url';
import path from 'path';
import mime from 'mime';

export default {
  identity: 'medium',
  base: 'site-owned',
  public: true,
  attributes: {
    type: {
      type: 'string',
      in: ['hero', 'profile', 'background', 'ad', 'video', 'other'],
      required: true
    },
    subtype: {
      type: 'string'
    },
    filetype: {
      type: 'string'
    },
    name: {
      type: 'string',
      required: true
    },
    src: {
      type: 'string',
      // urlish: true,
      required: true
    },
    description: {
      type: 'string'
    },

    thumbnail: function() {
      let id = getYoutubeId(this.src);
      if (id) return `http://img.youtube.com/vi/${id}/0.jpg`;
      return UPLOAD_HOST + variation('thumb', this.src);
    },

    embed: function() {
      let id = getYoutubeId(this.src);
      if (id) return `https://www.youtube.com/embed/${id}`;
      return this.src;
    },

    toJSON: function() {
      this.embed = this.embed();
      this.thumbnail = this.thumbnail();
      return this;
    }
  },
  lifecycle: {
    beforeCreate: (ins, req) => {
      if (!ins.filetype && ins.type !== 'video') ins.filetype = mime.lookup(ins.src);
    },
    afterCreate: (ins, req) => {
      return assign(ins.src, ins.id, req.flex.site.host)
        .then(({ from, to }) => {
          ins.src = to;
          transform(ins.type, ins.src)
          return ins;
        })
        .then(() => getModels('medium'))
        .then(Media => Media.update({ id: ins.id }, ins))
        .then(() => ins);
    },

    afterDelete: (ins) => {
      let { host, pathname } = url.parse(ins.src, false, true);
      if (host !== 'uploads.flexsites.io') return ins;
      return find(path.dirname(pathname).substr(1))
        .then(remove);
    }
  }
};


// var loopback = require('loopback');
// var aws = require('aws-sdk');
// var crypto = require('crypto');
// var cloudinary = require('cloudinary');

// cloudinary.config('cloudinary://734157931351312:XPnPnmeZ8k-LKzlr3dgie70p3OU@flexsites');

// module.exports = function(Medium){

//   Medium.beforeRemote('create', function(ctx, instance, next){


//     next();
//   });

//   Medium.sign = function(name, type, cb) {
//     var ctx = loopback.getCurrentContext();
//     if(!process.env.S3_KEY || !process.env.S3_USER_FILES || !process.env.S3_SECRET) return cb('Missing AWS credentials');

//     var site = ctx.get('site');
//     if(!site || !site.host) return cb('Invalid host');
//     random(function(err, hash){
//       aws.config.update({accessKeyId: process.env.S3_KEY, secretAccessKey: process.env.S3_SECRET});
//       var filename = site.host+'/'+hash+'.'+name.split('.').pop().toLowerCase();
//       var s3 = new aws.S3();
//       s3.getSignedUrl('putObject', {
//         Bucket: process.env.S3_USER_FILES,
//         Key: filename,
//         Expires: 60,
//         ContentType: type,
//         ACL: 'public-read'
//       }, function(err, data){
//         if(err) return cb(err);
//         cb(err,data);
//       });
//     });
//   };


//   Medium.remoteMethod(
//     'sign',
//     {
//       http: {path: '/sign', verb: 'get'},
//       accepts: [{arg: 'name', type: 'string' }, {arg: 'type', type: 'string' }],
//       returns: {arg: 'signed_request', type: 'string'}
//     }
//   );

//   Medium.cloudinary = function(name, type, cb) {
//     var ctx = loopback.getCurrentContext();
//     // if(!process.env.S3_KEY || !process.env.S3_USER_FILES || !process.env.S3_SECRET) return cb('Missing AWS credentials');

//     var secret = 'XPnPnmeZ8k-LKzlr3dgie70p3OU';

//     // callback, eager, format, public_id, tags, timestamp, transformation, type

//     // var site = ctx.get('site');
//     // if(!site || !site.host) return cb('Invalid host');
//     random(function(err, hash){

//       var params = {
//         // public_id: hash,
//         timestamp: Math.floor(Date.now() / 1000)
//       };

//       var signature = cloudinary.utils.api_sign_request(params, secret);

//       console.log(params.timestamp);
//     });
//   };


//   Medium.remoteMethod(
//     'cloudinary',
//     {
//       http: {path: '/cloudinary', verb: 'get'},
//       accepts: [{arg: 'name', type: 'string' }, {arg: 'type', type: 'string' }],
//       returns: {arg: 'cloudinary_request', type: 'string'}
//     }
//   );
// };

// function random(cb){
//   return crypto.randomBytes(16, function(ex, buf) {
//     cb(ex, buf.toString('hex'));
//   });
// }
