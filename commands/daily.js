var accounts = JSON.parse(fs.readFileSync("././account.json", "utf8")),
    request = require("request");

exports.run = (bot, message, args) => {
  var account = accounts.find(item => {return item.user === message.author.id;});
  if (dailies.indexOf(message.author.id) > -1) {
    message.reply("You already claimed your daily credits!");
    return;
  }
  if (bot.guilds.get('281815661317980160').members.get(message.author.id)) {
    if (bot.guilds.get('281815661317980160').members.get(message.author.id).roles.find("name","Manager")) {
      daily = 250;
    }
    else if (bot.guilds.get('281815661317980160').members.get(message.author.id).roles.find("name","Custom Support")) {
      daily = 200;
    }
  }
  if (daily < 200) {
    request("https://discordbots.org/api/bots/377609965554237453/votes?onlyids=true",{
      headers: {
        "content-type": "application/json",
        "Authorization": process.env.DBL_ORG_TOKEN
      }
    }, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        body = JSON.parse(body);
        if (body.indexOf(message.author.id) > -1) {
          daily = 180;
        }
        else {
          daily = 120;
        }
      }
      else {
        message.reply("Cannot connect to DiscordBots.org. Try again.");
      }
    });
  }
  if (daily !== 120) {
    message.reply("Here's your "+daily+" daily credits!");
  }
  else {
    message.reply("Here's your "+daily+" daily credits! *Tip: You can get 60 more daily credits by upvoting at <https://discordbots.org/bot/377609965554237453>!*");
  }
  dailies.push(message.author.id);
  fs.writeFileSync("./daily.json", JSON.stringify(dailies), "utf8");
  if (account !== undefined) {
        accounts.splice(accounts.indexOf(account), 1);
  } else {
        account = {user: message.author.id, balance: 0};
  }
  account.balance += daily;
  accounts.push(account);
  bot.channels.get("282253502779228160").send(":calendar: "+message.author.username+"#"+message.author.discriminator+" ("+message.author.id+") claimed "+daily+" daily credits.");
  fs.writeFileSync("./account.json", JSON.stringify(accounts), "utf8");
}
