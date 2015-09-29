import { send, contactTemplate } from '../../lib/MailService';
import debug from 'debug';

let log = debug('flexsites:model:contactMessage');

export default {
  identity: 'contact-message',
  base: 'message',
  public: true,
  attributes: {
    name: { type: 'String', required: true },
    phone: { type: 'String' },
    email: { type: 'String' }
  },
  lifecycle: {
    beforeCreate: (ins, req) => {
      let site = req.flex.site;
      ins.toEmail = site.contact.email;
      ins.subject = 'New Message from ' + ins.name;
      ins.type = 'contact';
      ins.fromEmail = ins.email;
    },

    afterCreate: (ins, { flex: { site } }) => {
      return contactTemplate({
          name: ins.name,
          email: ins.email,
          phone: ins.phone,
          title: ins.subject,
          body: ins.body,
          host: site.host,
          from: 'FlexSites.io <contact@flexsites.io>',
          to: ins.toEmail,
          subject: ins.subject,
          'h:Reply-To': ins.email
        })
        .then(email => {
          return send(email)
          .then(status => {
            log('send mail responded: %o', { message: status.message });
            return status;
          });
        });
    }
  }
};
