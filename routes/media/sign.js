import aws from 'aws-sdk';
import path from 'path';
import crypto from 'crypto';

var s3 = new aws.S3({
  accessKeyId: process.env.S3_KEY,
  secretAccessKey: process.env.S3_SECRET
});

export default {
  get: (req, res, next) => {

    let { name, type } = req.query;

    if (!process.env.S3_KEY || !process.env.S3_USER_FILES || !process.env.S3_SECRET) return next('Missing AWS credentials');

    let site = req.flex.site;
    if (!site || !site.host) return next('Invalid host');

    random(function(err, hash) {
      var filename = `${site.host}/${hash}.${path.extname(name)}`.toLowerCase();

      s3.getSignedUrl('putObject', {
        Bucket: process.env.S3_USER_FILES,
        Key: filename,
        Expires: 60,
        ContentType: type,
        ACL: 'public-read'
      }, function(err, data) {
        if (err) return next(err);
        res.send({ signed_request: data });
      });
    });
  }
}

function random(cb) {
  return crypto.randomBytes(16, function(ex, buf) {
    cb(ex, buf.toString('hex'));
  });
}
