const sgMail = require('@sendgrid/mail')
var fs = require('fs')
sgMail.setApiKey(process.env.SGRID_KEY);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'alimento.lucknow@gmail.com',
        subject: 'Thanks for joining in!',
        text: `Welcome to the Alimento, ${name}. We hope that you will enjoy the most delicious food.`
    })
}
//suyashgautam@@14
const sendForgotPasswordLink = (email, name, link) => {
    sgMail.send({
        to: email,
        from: 'alimento.lucknow@gmail.com',
        subject: 'Forgot password for you Alimento account',
        text: `Hi ${name}, 
        Click on the following link to reset your password. Remember this link will be active only for 15 mins.
        Link: ${link}
        `
    })
}

const sendGoodByeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'alimento.lucknow@gmail.com',
        subject: `Goodbye ${name}`,
        text: `We are sad to see you going ${name}, Please let us know what we could have done better.`
    })
}

const sendInvoice = (email, invoice) => {
    const msg = {
      to: email,
      from: 'alimento.lucknow@gmail.com',
      subject: 'Your Invoice for your recent order',
      text: 'Thank You for ordering from Alimento. Here is your invoice for your latest order',
      attachments: [
        {
          content: invoice,
          filename: "Invoice.pdf",
          type: "application/pdf",
          disposition: "attachment"
        }
      ]
    };
    sgMail.send(msg).catch(err => {
        console.log(err);
    });
}

const orderCancelled = (email, oid, name, r_id) => {
    sgMail.send({
        to: email,
        from: 'alimento.lucknow@gmail.com',
        subject: `Sorry ${name}`,
        text: `Apologies, your order: ${oid} has been cancelled by the restaurant. We are currently checking with restaurant to understand what happened. A Refund will be initiated in next 2-3 days.`
    })
}

const orderDelievered = (email, name, oid, r_id) => {
    sgMail.send({
        to: email,
        from: 'alimento.lucknow@gmail.com',
        subject: `Hi ${name}`,
        text: `Thank you for ordering from Alimento. Your Order: ${oid} has been delievered by the delievery agent.`,
        html: `<style>
            .button {
                font-family: sans-serif;
                text-align: center;
                vertical-align: center;
                background-color: #009da5;
                width: 250px;
                padding: 10px;
                border-radius: 4px;
                overflow: hidden; 
            }
          
            .button a {
                color: #fff;
                text-decoration:  none;
            }
            </style>
                <p>Thank you for ordering from Alimento. Your Order: ${oid} has been delievered by the delievery agent.</p>
                <p>Dont forget to give your valuable ratings.</p>
                <table>
                    <tr><td><a href="http://localhost:3000/restaurant/${r_id}"><button>Add Ratings</button></a></td></tr>
                </table>`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendGoodByeEmail,
    sendForgotPasswordLink,
    orderDelievered,
    orderCancelled,
    sendInvoice
}