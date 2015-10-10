import { merge } from 'lodash';
import jade from 'jade';

export default function(req, res, next) {
    // Ensure the user is logged in.
  if (!req.user || !req.stormpathSession || !req.stormpathSession.user) {
    // Wipe req.user, just in case.
    req.user = undefined;

    var url = `${req.app.get('stormpathLoginUrl')}?next=${encodeURIComponent(req.originalUrl)}`;
    res.redirect(302, url);

    // If this user must be a member of all groups, we'll ensure that is the
    // case.
  } else {
    let groups = [req.flex.site.host];
    var safe = false;

    req.user.getGroups((err, grps) => {
      if (err) {
        render(req.app.get('stormpathUnauthorizedView'), res);
        req.app.get('stormpathLogger').info(`Could not fetch user ${req.user.email}'s groups.`);
      } else {
        // Iterate through each group on the user's account, checking to see
        // whether or not it's one of the required groups.
        grps.each((group, c) => {
          if (groups.indexOf(group.name) > -1 || group.name === 'Admin') {
            safe = true;
            next();
          }

          c();
        },

        // If we get here, it means the user didn't meet the requirements,
        // so we'll send them to the login page with the ?next querystring set.
        () => {
          if (!safe) {
            render(req.app.get('stormpathUnauthorizedView'), res);
            req.app.get('stormpathLogger').info(`User ${req.user.email} attempted to access a protected endpoint but did not meet the group check requirements.`);
          }
        });
      }
    });
  }
}

function render(view, res, options) {
  options = options || {};
  merge(options, res.locals);
  merge(options, res.app.get('stormpathTemplateContext'));

  var renderHandler = res.app.get('stormpathRenderHandler');

  if (renderHandler) {
    renderHandler(view, res, options);
  } else {
    jade.renderFile(view, options, (err, html) => {
      if (err) {
        res.app.get('stormpathLogger').error(`Couldn't render view (${view}) with options (${options}).`);
        throw err;
      }

      res.send(html);
    });
  }
}
