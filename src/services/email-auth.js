const express = require('express');
const router = express.Router();
const User = require("../models/users");
const fs = require('fs');
const path = require('path');
const mailgun = require("mailgun-js");

const DOMAIN = "mail.ddks.live";
const mg = mailgun({ apiKey: process.env.MAILGUN_API_KEY, domain: DOMAIN });

// If Somebody nerdy or Geeky Seeing This and Smiling to see this API key,
// wanna say that, yes, You are like me, Connect with me on any social media.
// but Hey Badass, this API key works on (allowlist IPs Only).

async function sendMail(name, link, email) {
    let data = {
        from: "CoPanda <copanda@mail.ddks.live>",
        to: email,
        subject: "CoPanda Verification Mail",
        template: "copandamail",
        'h:X-Mailgun-Variables': {
            NAME: name,
            LINK: link
        }
    };

    mg.messages().send(data, function (error, body) {
        console.log(body);
    });
}

async function signupInitiation(id, name, email) {
    let time = Date.now();
    let link = `https://code.ddks.live/callverify?code=${id + time}`;

    console.log(link);
    await sendMail(name, link, email);
}

module.exports = signupInitiation;
