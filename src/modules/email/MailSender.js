const BrevoEmailProvider = require("./providers/BrevoEmailProvider");

class MailSender {
    constructor(provider){
        this.provider = provider;
    }
    sendResetPasswordEmail(email, token){
        const link = `${process.env.APP_DOMAIN}/resetpass/${token}`;
        this.provider.sendResetPasswordEmail(email, link);
    }
}

module.exports = {
    defaultSender: new MailSender(new BrevoEmailProvider())
}