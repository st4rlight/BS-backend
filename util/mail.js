const nodemailer = require('nodemailer');
var mail= {};

mail.sendmsg = function(receiver, msg, callback){
    nodemailer.createTestAccount((err, account) => {
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: 'smtp.163.com',
            secureConnection: true,
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: 'st4rlight@163.com', // generated ethereal user
                pass: 'q745230865zcz' // generated ethereal password
            }
        });

        // setup email data with unicode symbols
        let mailOptions = {
            from: 'st4rlight@163.com', // sender address
            to: receiver, // list of receivers
            subject: '【寒来暑往】验证码', // Subject line
            text: msg, // plain text body
            html: '<b>' + msg + '</b>' // html body
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                callback(false, info)
            }
            else
                callback(true, info);
        
            //  console.log('Message sent: %s', info.messageId);
            // Preview only available when sending through an Ethereal account
            //  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

            // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
            // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
        });
    });
}


module.exports = mail;