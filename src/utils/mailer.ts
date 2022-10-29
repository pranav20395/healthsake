import nodemailer from "nodemailer";

export const sendEmail = async ({email, otp}: { email: string, otp: string }) => {

    const testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });

    const mailOptions = {
        from: '"Admin" <guntupalli20378@iiitd.ac.in>',
        to: email,
        subject: 'OTP Email',
        html: `<h1>Here's your OTP: ${otp}</h1>`,
    };

    const mail = await transporter.sendMail(mailOptions);

    console.log("Message sent: %s", nodemailer.getTestMessageUrl(mail));
};