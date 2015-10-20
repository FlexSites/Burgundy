import { clearTemplate } from '../lib/render/data';

export default {
  get: (req, res) => {
    clearTemplate(req);
    res.send({ message: `Template for site ${req.hostname} cleared successfully` });
  },
}
