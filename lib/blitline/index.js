import BlitLine from './connection';
import { signUpload, variation } from '../aws/s3';
import mime from 'mime';

let queue = new BlitLine();

const USER_FILES = process.env.S3_USER_FILES;

export default function (type, src) {
  if (type !== 'hero') return Promise.resolve({src, type});
  return queue.send({
    src,
    functions: [
      {
        name: 'imagga_smart_crop',
        params: {
          resolution: '100x100',
          no_scaling: 0
        },
        save: {
          quality: 75,
          image_identifier: 'THUMB',
          s3_destination: {
            bucket: USER_FILES,
            key: variation('thumb', src)
          }
        }
      }
    ]
  });
}
// 8495 4446 7019 7875

// 8556523446
