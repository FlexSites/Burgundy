import Promise from 'bluebird';
import path from 'path';
import crypto from 'crypto';

import { signUpload } from '../../../../lib/aws/s3';

let random = Promise.promisify(crypto.randomBytes.bind(crypto, 16));

let getFilename = Promise.method(({ query: { mediumId }, flex: { site: { host } } }) => {
  if (mediumId) return `${host}/${mediumId}/original`;
  return random()
      .then(buf => `tmp/${buf.toString('hex')}`);
});

export default {
  get: (req, res, next) => {

    let { name, type } = req.query;

    getFilename(req)
      .then(filename => `${filename}${path.extname(name)}`.toLowerCase())
      .then(filename => signUpload(filename, type)
        .then(data => res.send({ signed_request: data }))
      )
      .catch(next);
  },
};
