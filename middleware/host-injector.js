import { set } from 'object-path';

export default () => (req, res, next) => {
  let host = /^(?:https?:\/\/)?(?:www|local|test)?\.?(.*)$/.exec(req.hostname)[1];
  if (host === 'host') host = process.env.OVERRIDE_HOST || 'flexsites.io';
  set(req, 'flex.host', host);
  next();
};
