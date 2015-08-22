export default {
  identity: 'seat',
  base: 'persisted',
  public: true,
  attributes: {
    row: {
      type: 'string',
      required: true
    },
    number: {
      type: 'string',
      required: true
    },
    section: {
      model: 'section'
    }
  }
};
