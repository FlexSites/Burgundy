'use strict';

export default {
  identity: 'persisted',
  base: 'base',
  connection: 'myLocalmongo',
  autoCreatedAt: false,
  migrate: 'safe',
  created: function() {
    return new Date(parseInt(this.id.toString().substring(0, 8), 16) * 1000);
  }
};
