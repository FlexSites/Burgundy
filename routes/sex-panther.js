import { clearTemplate } from '../lib/api-util';

export default {
  get: (req, res) => {
    clearTemplate(req);
    res.send({ message: `Template for site ${req.hostname} cleared successfully` });
  },
}
