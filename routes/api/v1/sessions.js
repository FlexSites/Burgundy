
import { NotFound } from '../../../lib/error';

export default {
  get: (req, res, next) => {
    if (req.user) {

      // Add the isAdmin flag
      req.user.isAdmin = !!req.user.groups.items.find(item => {
        return item.name === 'Admin';
      });

      return res.send([ req.user ]);
    }

    next(new NotFound('Session not found'));
  },
}
