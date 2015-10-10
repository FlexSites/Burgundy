import AWS from 'aws-sdk';
import Promise from 'bluebird';
import fs from 'fs';
import path from 'path';
import config from 'config';
import url from 'url';

// import NodeCache from 'node-cache';

// const CACHE_TTL = 30; // 30 minutes
const USER_FILES = process.env.S3_USER_FILES;
export const UPLOAD_HOST = '//uploads.flexsites.io/';

// let cache = new NodeCache();
let params = config.get('aws.s3');
let s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  params: {

    // Bucket: params.bucket,
    Region: params.region,
  },
});


let isLocal = !params.bucket;

let getObject = Promise.promisify(s3.getObject, s3);
let copyObject = Promise.promisify(s3.copyObject, s3);

// let listBuckets = Promise.promisify(s3.listBuckets, s3);
let listObjects = Promise.promisify(s3.listObjects, s3);
let deleteObject = Promise.promisify(s3.deleteObject, s3);
let deleteObjects = Promise.promisify(s3.deleteObjects, s3);
let signUrl = Promise.promisify(s3.getSignedUrl.bind(s3, 'putObject'));
let readFile = Promise.promisify(fs.readFile, fs);

export function get(uri, host, Bucket = params.bucket) {
  let Key = `${host}/public${uri}`;
  if (isLocal) return readFile(path.join(global.__root, '../sites', Key), 'utf8');

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
  return move(to, `${USER_FILES}/${tmp}${USER_FILES}`)
    .then(() => ({ from: tmp, to: UPLOAD_HOST + to }));
}

export function find(Prefix, Bucket = USER_FILES) {
  return listObjects({ Prefix, Bucket })
    .then(({ Contents }) => Contents.map(({ Key }) => Key));
}

export function getPrefix(uri) {
  return path.dirname(getKey(uri));
}

export function getKey(uri) {
  return url.parse(uri, false, true).pathname.substr(1);
}

export function variation(name, src) {
  let { pathname } = url.parse(src, false, true);
  let { dir, ext } = path.parse(pathname);
  return (`${dir}/${name}${ext}`).substr(1);
}

export function remove(Key, Bucket = USER_FILES) {
  if (!Array.isArray(Key)) return deleteObject({ Key, Bucket });
  return deleteObjects({
    Delete: {
      Objects: Key.map(key => ({ Key: key })),
    },
    Bucket: USER_FILES,
  });
}

export function move(Key, CopySource, Bucket) {
  return copyObject({ Key, CopySource, Bucket });
}

export function signUpload(filename, type) {
  return signUrl({
    Bucket: process.env.S3_USER_FILES,
    Key: `${filename}`.toLowerCase(),
    Expires: 60,
    ContentType: type,
    ACL: 'public-read',
  });
}
