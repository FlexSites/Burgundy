
import augmentDocs from '../middleware/augment-docs';
import getModels from '../lib/db';

let api;

export default {
  get: (req, res) => {
    if (api) return res.send(api);
    getModels()
      .then(models => res.send(api = augmentDocs(api, models)));
  },
}
