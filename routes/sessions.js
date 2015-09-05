
import { NotFound } from '../lib/error';

console.log('sessions loaded');
export default {
  get: (req, res, next) => {
    console.log('session called');
    if (req.user) {

      // Add the isAdmin flag
      req.user.isAdmin = !!req.user.groups.items.find(function(item) {
        return item.name === 'Admin';
      });

      return res.send([ req.user ]);
    }

    next(new NotFound('Session not found'));
  }
}
