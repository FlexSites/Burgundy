import getModels from '../../lib/db';

export default {
  get: (req, res, next) => {
    getModels()
      .then(Object.keys)
      .then(res.send.bind(res))
      .catch(next);
  },
}
