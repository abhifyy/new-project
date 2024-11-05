const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/send-email', (req, res) => {
    const { firstName, lastName, phone, email, address1, address2, city, state, zipCode, hoaApproval, cityApproval, material, fenceLength } = req.body;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'your-email@gmail.com',
            pass: 'your-email-password'
        }
    });

    const mailOptions = {
        from: 'your-email@gmail.com',
        to: 'your-email@gmail.com',
        subject: 'New Quote Request',
        text: `You have a new quote request from ${firstName} ${lastName}.
        Phone: ${phone}
        Email: ${email}
        Address: ${address1}, ${address2}, ${city}, ${state}, ${zipCode}
        HOA Approval: ${hoaApproval}
        City Approval: ${cityApproval}
        Material: ${material}
        Fence Length: ${fenceLength} meters`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).send(error.toString());
        }
        res.status(200).send('Email sent: ' + info.response);
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});