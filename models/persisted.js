
export default {
  identity: 'persisted',
  base: 'base',
  created() {
    return new Date(parseInt(this.id.toString().substring(0, 8), 16) * 1000);
  },
};
