require('dotenv').config();
const { Client } = require('discord.js');
const client = new Client();
const createCaptcha = require('./captcha');
const fs = require('fs').promises;
client.login(process.env.BOT_TOKEN);

client.on('ready', () => {
    console.log(`${client.user.tag} has logged in.`);
});

client.on('guildMemberAdd', async member => {
    const captcha = await createCaptcha();
    try {
        const msg = await member.send('complete your captcha quick', {
            files: [{
                attachment: `${__dirname}/captchas/${captcha}.png`,
                name: `${captcha}.png`
            }]
        });
        try {
            const filter = m => {
                if(m.author.bot) return;
                if(m.author.id === member.id && m.content === captcha) return true;
                else {
                    m.channel.send('incorrect captcha!');
                    return false;
                }
            };
            const response = await msg.channel.awaitMessages(filter, { max: 1, time: 9999999999999999999999999999999999999999999, errors: ['time']});
            if(response) {
                await msg.channel.send('correct!');
                await member.roles.add('640340203763925002');
                await fs.unlink(`${__dirname}/captchas/${captcha}.png`)
                    .catch(err => console.log(err));
            }
        }
        catch(err) {
            console.log(err);
            await msg.channel.send('sorry but try again! discord.gg/PD2KUa7tM2');
            await member.kick();
            await fs.unlink(`${__dirname}/captchas/${captcha}.png`)
                    .catch(err => console.log(err));
        }
    }
    catch(err) {
        console.log(err);
    }
});