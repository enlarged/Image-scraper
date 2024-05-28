const { Client } = require('discord.js-selfbot-v13');
const fs = require('fs');
const path = require('path')
const readline = require('readline');
const client = new Client();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  client.on('ready', () => {
    console.log(`${client.user.username} is ready!`);
    console.log('\nMenu:\n1. Send Images\n2. Scrape Images');
    rl.question('Choose an option (1 or 2): ', option => {
      rl.question('Enter the channel ID: ', channelID => {
        if (option === '1') sendImages(channelID);
        else if (option === '2') scrapeImages(channelID);
        else console.log('Invalid option. Please restart and choose 1 or 2.');
      });
    });
  });
  
  function sendImages(channelID) {
    const directory = 'path_goes_here';
    const channel = client.channels.cache.get(channelID);
    if (!channel) return console.log('Channel not found');
  
    fs.readdir(directory, (err, files) => {
      if (err) return console.error('Could not list the directory.', err);
      files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file))
           .forEach((file, i, arr) => {
             if (i % 3 === 0) {
               channel.send({ files: arr.slice(i, i + 3).map(f => ({ attachment: path.join(directory, f), name: f })) })
                      .then(() => console.log('Batch sent:', arr.slice(i, i + 3).map(f => f)))
                      .catch(console.error);
             }
           });
    });
  }
  
  async function scrapeImages(channelID) {
    const channel = client.channels.cache.get(channelID);
    if (!channel) return console.log('Channel not found');
  
    const directory = path.join(__dirname, 'scraped_images');
    if (!fs.existsSync(directory)) fs.mkdirSync(directory);
  
    const messages = await channel.messages.fetch({ limit: 100 });
    messages.filter(msg => msg.attachments.size > 0)
            .forEach(msg => msg.attachments.forEach(attachment => {
              const file = fs.createWriteStream(path.join(directory, attachment.name));
              require('https').get(attachment.url, response => response.pipe(file).on('finish', () => console.log('Downloaded:', attachment.name)));
            }));
    console.log('Scraping completed.');
  }
  
  client.login("token_here");