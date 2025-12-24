const AbstractEmailProvider = require("./AbstractEmailProvider");

const SibApiV3Sdk = require('sib-api-v3-sdk');
const defaultClient = SibApiV3Sdk.ApiClient.instance;

const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;


var apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();



class BrevoEmailProvider extends AbstractEmailProvider{
    sendResetPasswordEmail(to, resetLink){
        const sendSmtpEmail = {
            to: [{
                email: to,
            }],
            templateId: 1,
            params: {
                resetPasswordLink: resetLink,
            },
        };
        this.sendEmail(sendSmtpEmail);
    }
    sendEmail(emailData){
        apiInstance.sendTransacEmail(emailData).then(function(data) {
          console.log('API called successfully. Returned data: ' + data);
        }, function(error) {
          console.error(error);
        });
    }
}
module.exports = BrevoEmailProvider;