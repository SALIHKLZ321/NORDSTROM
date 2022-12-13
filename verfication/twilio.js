


const accountSid =process.env.TWILIO_ACCOUNT_SID
const authToken =process.env.TWILIO_TOKEN_AUTH
const sessionId =process.env.TWILIO_SESSION_SID

module.exports.sendSms = (phone)=>{
 const client = require('twilio')(accountSid, authToken);
 

    client.verify.v2.services(sessionId)
                    .verifications
                    .create({to: `+91${phone}`, channel: 'sms'})
                    .then(verification => console.log(verification.status));
                }




module.exports.verfiySms = (phone ,otp)=>{
 const client = require('twilio')(accountSid, authToken);
    return new Promise((resolve, reject) => {
      client.verify.v2
        .services(sessionId)
        .verificationChecks.create({ to: `+91${phone}`, code: otp })
        .then((verification_check) => {
            resolve(verification_check)
        });
    });

}