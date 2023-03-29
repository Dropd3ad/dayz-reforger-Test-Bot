const { EmbedBuilder, } = require('discord.js');
const { User, addUser } = require('../structures/user');

module.exports = {
  name: "collect-income",
  debug: false,
  global: false,
  description: "collect your income",
  usage: "",
  permissions: {
    channel: ["VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS"],
    member: [],
  },
  options: [],
  SlashCommand: {
    /**
     *
     * @param {require("../structures/QuarksBot")} client
     * @param {import("discord.js").Message} message
     * @param {string[]} args
     * @param {*} param3
    */
    run: async (client, interaction, args, { GuildDB }) => {
      if (GuildDB.customChannelStatus==true&&!GuildDB.allowedChannels.includes(interaction.channel_id)) {
        return interaction.send({ content: `You are not allowed to use the bot in this channel.`,  flags: (1 << 6) }); 
      }

      const hasIncomeRole = GuildDB.incomeRoles.some(data => {
        if (interaction.member.roles.includes(data.role)) return true;
        return false;
      });

      if (!hasIncomeRole) {
        const error = new EmbedBuilder()
          .setColor(client.config.Colors.Red)
          .setTitle('Missing Income!')
          .setDescription(`It appears you don't have any income`)

        return interaction.send({ embeds: [error] })
      }

      let banking = await client.dbo.collection("users").findOne({"user.userID": interaction.member.user.id}).then(banking => banking);

      if (!banking) {
        banking = {
          userID: interaction.member.user.id,
          guilds: {
            [GuildDB.serverID]: {
              bankAccount: {
                balance: GuildDB.startingBalance,
                cash: 0.00,
              },
              lastIncome: new Date('2000-01-01T00:00:00'),
            }
          }
        }

        // Register inventory for user  
        let newBank = new User();
        newBank.createBank(interaction.member.user.id, GuildDB.serverID, GuildDB.startingBalance, 0);
        newBank.save().catch(err => {
          if (err) return client.sendInternalError(interaction, err);
        });
        
      } else banking = banking.user;

      if (!client.exists(banking.guilds[GuildDB.serverID])) {
        const success = addUser(banking.guilds, GuildDB.serverID, interaction.member.user.id, client, GuildDB.startingBalance);
        if (!success) return client.sendInternalError(interaction, 'Failed to add bank');
      }
      
      let now = new Date();
      let diff = (now - inventory.guilds[GuildDB.serverID].lastIncome) / 1000;
      diff /= (60 * 60);
      let hoursBetweenDates = Math.abs(Math.round(diff));

      if (hoursBetweenDates >= GuildDB.incomeLimiter) {
        let roles = [];
        let income = [];
        for (let i = 0; i < GuildDB.incomeRoles.length; i++) {
          if (interaction.member.roles.includes(GuildDB.incomeRoles[i].role)) {
            roles.push(GuildDB.incomeRoles[i].role)
            income.push(GuildDB.incomeRoles[i].income)
          }
        }

        let totalIncome = income.reduce((x, y) => x + y, 0)

        let newData = banking.guilds[GuildDB.serverID];
        newData.bankAccount.balance += totalIncome;
        newData.lastIncome = now;

        client.dbo.collection("banks").updateOne({"banking.userID":interaction.member.user.id},{$set:{[`banking.guilds.${GuildDB.serverID}`]: newData}}, function(err, res) {
          if (err) return client.sendInternalError(interaction, err);
        });

        let description = `**You collected**`;
        for (let i = 0; i < roles.length; i++) {
          description += `\n<@&${roles[i]}> - $**${income[i].toFixed(2)}**`
        }

        const success = new EmbedBuilder()
          .setColor(client.config.Colors.Green)
          .setDescription(description)

        return interaction.send({ embeds: [success] })

      } else {
        const error = new EmbedBuilder()
          .setColor(client.config.Colors.Default)
          .setTitle('Take a rest...')
          .setDescription(`You've already worked a full day today. Take a rest and work tomorrow.`)

        return interaction.send({ embeds: [error] })
      }
    },
  },
}