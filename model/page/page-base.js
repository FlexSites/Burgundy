export default {
  identity: 'page-base',
  base: 'site-owned',
  attributes: {
    title: {
      type: 'string',
      required: true
    },
    description: {
      type: 'string',
      required: true
    },
    format: {
      type: 'string',
      required: true
    }
  }
};

