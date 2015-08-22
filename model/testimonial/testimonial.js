export default {
  identity: 'testimonial',
  base: 'site-owned',
  public: true,
  attributes: {
    quote: { type: 'String', required: true },
    author: { type: 'String', required: true },
    company: { type: 'String', required: true },
  }
};
