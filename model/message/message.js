export default {
  identity: 'message',
  base: 'site-owned',
  attributes: {
    toEmail: { type: 'String', required: true },
    fromEmail: { type: 'String', required: true },
    type: { type: 'String', required: true },
    body: { type: 'String', required: true }
  },
  acls: [
    {
      model: 'message',
      accessType: 'WRITE',
      principalType: 'ROLE',
      principalId: '$everyone',
      permission: 'ALLOW'
    },
    {
      model: 'message',
      accessType: 'READ',
      principalType: 'ROLE',
      principalId: '$everyone',
      permission: 'DENY'
    },
    {
      accessType: 'READ',
      principalType: 'ROLE',
      principalId: 'siteOwner',
      permission: 'ALLOW'
    }
  ],
  methods: []
};
