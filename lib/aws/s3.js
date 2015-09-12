import AWS from 'aws-sdk';
import Promise from 'bluebird';
import fs from 'fs';
import path from 'path';
import config from 'config';
import NodeCache from 'node-cache';
import url from 'url';

const CACHE_TTL = 30; // 30 minutes
let cache = new NodeCache();
let params = config.get('aws.s3');
let s3 = new AWS.S3({
  params: {
    Bucket: params.bucket,
    Region: params.region
  }
});

let isLocal = !params.bucket;

let getObject = Promise.promisify(s3.getObject, s3);
let copyObject = Promise.promisify(s3.copyObject, s3);
let signUrl = Promise.promisify(s3.getSignedUrl.bind(s3, 'putObject'));
let readFile = Promise.promisify(fs.readFile, fs);

export function get(uri, host, Bucket=params.bucket) {
  let Key = host + '/public' + uri;
  if (isLocal) return readFile(path.join(__root, '../sites', Key), 'utf8');
  // let value = cache.get(Key);
  // if (value) return value;
  return getObject({ Key, Bucket })
    .then(data => data.Body.toString('utf8'))
    // .then(data => {
    //   cache.set(Key, Promise.resolve(data), CACHE_TTL);
    //   return data;
    // });
}

export function assign(tmp, mediumId, host) {
  tmp = url.parse(tmp).pathname.substr(1);
  let to = `${host}/${mediumId}/original${path.extname(tmp)}`.toLowerCase();
  return move(to, tmp, process.env.S3_USER_FILES)
    .then(() => {
      return { from: tmp, to };
    });
}

export function move(Key, CopySource, Bucket=params.bucket) {
  return copyObject({ Key, CopySource, Bucket });
}

export function signUpload(filename, type) {
  return signUrl({
    Bucket: process.env.S3_USER_FILES,
    Key: `${filename}`.toLowerCase(),
    Expires: 60,
    ContentType: type,
    ACL: 'public-read'
  });
}
