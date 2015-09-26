export default {
  identity: 'page-base',
  base: 'site-owned',
  attributes: {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    format: {
      type: String,
      required: true
    }
  }
};

