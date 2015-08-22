export default {
  identity: 'dynamic-page',
  base: 'site-owned',
  public: true,
  attributes: {
    url: {
      type: 'string',
      required: true
    },
    templateUrl: {
      type: 'string'
    },
    title: {
      type: 'string',
      required: true
    },
    description: {
      type: 'string',
      required: true
    }
  },
  acls: [
    {
      principalType: 'ROLE',
      principalId: '$everyone',
      permission: 'DENY'
    },
    {
      accessType: 'READ',
      principalType: 'ROLE',
      principalId: '$everyone',
      permission: 'ALLOW'
    },
    {
      principalType: 'ROLE',
      principalId: 'admin',
      permission: 'ALLOW'
    }
  ],
  methods: []
};

