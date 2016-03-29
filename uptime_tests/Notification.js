var  Notification = function(configuration){

    var nodemailer, fromEmail, pass, toEmail, transporter, mailOptions;

    var initialize = function() {
        nodemailer = require('nodemailer');
        fromEmail = configuration.getConfigParams().notifyEmail;
        pass = configuration.getConfigParams().emailPass;
        toEmail = configuration.getConfigParams().toEmail;

        // create reusable transporter object using SMTP transport
        transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: fromEmail,
                pass: pass
            }
        });

        // setup e-mail data
        mailOptions = {
            from: 'Octoblu Uptime <' + fromEmail + '>', // sender address
            to: '<' + toEmail + '>' // list of receivers
        };
    };

    initialize();

    // send mail with defined transport object
    this.sendNotification = function(subject, text){
        mailOptions.subject = subject;
        mailOptions.text = text;
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                console.log(error);
            }else{
                console.log('Message sent: ' + info.response);
            }
        });
    };

    configuration.subscribeToUpdates(initialize)
};

module.exports = Notification;