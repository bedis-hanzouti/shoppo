const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, name, factureItems) => {
    try {
        var total = 0
        factureItems.map((e) => {
            total += e.price * e.quantity
        })

        var transporter = nodemailer.createTransport({
            host: process.env.HOST,
            secure: false,
            auth: {
                user: process.env.USER,
                pass: process.env.PASS
            },
            tls: { rejectUnauthorized: false }
        });

        var mailOptions = {
            from: process.env.USER,
            to: 'badis.hanzouti.24@eigsi.fr',
            subject: "email from H3B Store about " + subject,
            html: `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Order Confirmation</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f5f5f5;
          }

          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
          }

          h1 {
            font-size: 24px;
            margin-top: 0;
            margin-bottom: 20px;
          }

          p {
            margin-top: 0;
            margin-bottom: 20px;
          }

          .order-details {
            border-collapse: collapse;
            width: 100%;
          }

          .order-details th,
          .order-details td {
            padding: 8px;
            text-align: left;
            border-bottom: 1px solid #dddddd;
          }

          .order-details th {
            background-color: #f5f5f5;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Order Confirmation</h1>
          <p>Dear ${name},</p>
          <p>
            Thank you for your order! We are excited to let you know that your order
            has been received and is being processed.
          </p>
          <h2>Order Details:</h2>
          <table class="order-details">
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              ${factureItems.map((facture) => `
    <tr>
      <td>${facture.productName}</td>
      <td>${facture.quantity}</td>
      <td>${facture.price}</td>
    </tr>
    `).join('')}
             
             
            </tbody>
          </table>
          <p  style="font-weight: bold; color: green;">Total à payer : ${total} DT</p>
          <p>
            We will notify you by email once your order has been shipped. If you
            have any questions or need further assistance, please feel free to
            contact our customer support team.
          </p>
          <p>Thank you for choosing our service!</p>
          <p>Best regards,</p>
          <p>The H3B Team</p>
        </div>
      </body>
    </html>`,
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
        return "mail envoyer "


    } catch (error) {
        throw new error(error)
    }
};

module.exports = sendEmail;