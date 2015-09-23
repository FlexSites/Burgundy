'use strict';

export default {
  identity: 'persisted',
  base: 'base',
  created: function() {
    return new Date(parseInt(this.id.toString().substring(0, 8), 16) * 1000);
  }
};
