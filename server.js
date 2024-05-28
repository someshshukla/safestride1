const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const twilio = require('twilio');

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Set up email service (e.g., using nodemailer with Gmail SMTP)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-email-password',
  },
});

// Set up Twilio client
const accountSid = 'your-twilio-account-sid';
const authToken = 'your-twilio-auth-token';
const client = twilio(accountSid, authToken);

app.post('/sendAlert', (req, res) => {
  const { sensorData, location } = req.body;

  // Email alert
  const mailOptions = {
    from: 'your-email@gmail.com',
    to: 'recipient-email@example.com',
    subject: 'Emergency Alert',
    text: `Emergency detected! Sensor data: ${JSON.stringify(sensorData)}, Location: ${location.latitude}, ${location.longitude}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
      res.status(500).send('Error sending email');
    } else {
      console.log('Email sent:', info.response);
      res.status(200).send('Alert sent');
    }
  });

  // SMS alert
  client.messages.create({
    body: `Emergency detected! Sensor data: ${JSON.stringify(sensorData)}, Location: ${location.latitude}, ${location.longitude}`,
    from: 'your-twilio-phone-number',
    to: 'recipient-phone-number',
  }).then((message) => {
    console.log('SMS sent:', message.sid);
  }).catch((error) => {
    console.log('Error sending SMS:', error);
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
