export default {
  identity: 'dynamic-page',
  base: 'site-owned',
  public: true,
  attributes: {
    url: {
      type: String,
      required: true
    },
    templateUrl: {
      type: String
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
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

