import AWS from 'aws-sdk';
import Promise from 'bluebird';
import fs from 'fs';
import path from 'path';
import config from 'config';
import NodeCache from 'node-cache';

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
let readFile = Promise.promisify(fs.readFile, fs);

export function get(uri, host) {
  let Key = host + '/public' + uri;
  if (isLocal) return readFile(path.join(__root, '../sites', Key), 'utf8');
  let value = cache.get(Key);
  if (value) return value;
  return getObject({ Key })
    .then(data => data.Body.toString('utf8'))
    .then(data => {
      cache.set(Key, Promise.resolve(data), CACHE_TTL);
      return data;
    });
}
