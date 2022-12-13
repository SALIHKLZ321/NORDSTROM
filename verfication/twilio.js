


const accountSid ="AC68d1efa570ef66ae9994e50333197e6d"
const authToken ="eaf3d8b2ca62790dce8a2fca42471d38"
const sessionId ="VA9d1dfea7ba91384551410e5b814972c9"

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