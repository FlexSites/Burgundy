import BlitLine from './connection';
import { variation, UPLOAD_HOST } from '../aws/s3';
import Promise from 'bluebird';

let queue = new BlitLine();

const USER_FILES = process.env.S3_USER_FILES;

export default function(ins) {
  let { type, src } = ins;
  if (ins.thumbnail) return Promise.resolve(ins);
  ins.thumbnail = UPLOAD_HOST + variation('thumb', src);
  return queue.send({
    src,
    functions: [
      {
        name: 'imagga_smart_crop',
        params: {
          resolution: '120x120',
          no_scaling: 0,
        },
        save: {
          quality: 80,
          image_identifier: 'THUMB',
          s3_destination: {
            bucket: USER_FILES,
            key: variation('thumb', src),
          },
        },
      },
    ],
  });
}

// 8495 4446 7019 7875

// 8556523446
