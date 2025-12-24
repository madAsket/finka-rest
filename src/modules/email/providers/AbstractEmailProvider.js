
class AbstractEmailProvider {
    sendEmail(emailData){
        throw new Error("Not implemented");
    }
}

module.exports = AbstractEmailProvider;