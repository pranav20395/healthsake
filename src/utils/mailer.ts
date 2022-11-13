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
      secure: false,
      tls: {
        ciphers: "SSLv3",
        rejectUnauthorized: false,
      },
      auth: {
        user: "guntupallijaideep@icloud.com",
        pass: process.env.EMAIL_PASS,
      },
      debug: true,
      logger: true,
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
    html: `<div
    style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2; background-color: #1f2937; color:#eee">
    <div style="margin:50px auto;width:70%;padding:20px 0">
        <div style="border-bottom:1px solid #545FDB">
            <a href="https://192.168.2.239/" style="font-size:1.4em;color: #eee;text-decoration:none;font-weight:600"
                target="_blank">
                <img src="https://192.168.2.239/_next/static/media/stethoscope.29330117.svg" alt="HealthSake Logo"
                    width="20">
                HealthSake</a>
        </div>
        <p style="font-size:1.1em">Hi,</p>
        <p>Thank you for choosing HealthSake Portal. Use the following OTP to complete your Register / Login
            procedures. OTP is
            valid
            for 2 minutes</p>
        <h2
            style="background: #545FDB;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">
            ${otp}</h2>
        <p style="font-size:0.9em;">Regards,<br />HealthSake</p>
        <hr style="border:none;border-top:1px solid #545FDB" />
        <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
            <p>HealthSake</p>
            <p>IIIT Delhi</p>
        </div>
    </div>
</div>`,
  };

  const mail = await transporter.sendMail(mailOptions);

  console.log("Message sent: %s", nodemailer.getTestMessageUrl(mail));
};
