import config from 'config';

const PORT = config.get('port');
const IS_LOCAL = config.get('isDev');

export default () => {
  var isNotApex = /^.*\..*\..*$/;
  return ({ secure, hostname, protocol, url }, res, next) => {

    let needsSecure = !secure && !IS_LOCAL;
    let needsWWW = hostname !== 'localhost' && !isNotApex.test(hostname);

    // Redirect to secure everywhere but local
    if (needsSecure) protocol += 's';

    // Redirect to 'www' if it's Apex
    if (needsWWW) hostname = `www.${hostname}`;

    // Redirecting
    if (needsSecure || needsWWW) return res.redirect(301, `${protocol}://${hostname}${url}`);

    // No redirect needed
    next();
  };
};
