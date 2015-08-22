export default {
  identity: 'page',
  base: 'page-base',
  public: true,
  attributes: {
    url: {
      type: 'string',
      required: true
    },
    templateUrl: {
      type: 'string'
    },
    content: {
      type: 'string'
    },
    isPublished: {
      type: 'string'
    },
    media: {
      type: 'array'
    }
  }
};

