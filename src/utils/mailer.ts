import nodemailer from "nodemailer";

export const sendEmail = async ({
  email,
  otp,
}: {
  email: string;
  otp: string;
}) => {
  let mailConfig = {};

  if (process.env.NODE_ENV === "production") {
    mailConfig = {
      host: "smtp.mail.me.com",
      port: 587,
      secure: true,
      auth: {
        user: "no-reply-healthsake@gjd.one",
        pass: process.env.EMAIL_PASS,
      },
    };
  } else {
    const testAccount = await nodemailer.createTestAccount();
    mailConfig = {
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    };
  }

  const transporter = nodemailer.createTransport(mailConfig);

  const mailOptions = {
    from: '"Admin - Health Sake" <no-reply-healthsake@gjd.one>',
    to: email,
    subject: "OTP Email",
    html: `<h1>Here's your OTP: ${otp}</h1>`,
  };

  const mail = await transporter.sendMail(mailOptions);

  console.log("Message sent: %s", nodemailer.getTestMessageUrl(mail));
};
