export default {
  identity: 'post',
  base: 'page-base',
  public: true,
  attributes: {
    publishedDate: {
      type: Date,
    },
    content: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
    },
    previewImage: {
      type: String,
    },
    media: {
      type: [String],
    },
  },
};
