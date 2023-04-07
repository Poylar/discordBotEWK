const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("time")
    .setDescription("Replies with Pong!")
    .addStringOption((option) =>
      option
        .setName("user")
        .setDescription("The user to get the time of")
        .setRequired(true)
        .addChoices(
          {
            name: "get all users",
            value: "all",
          },
          {
            name: "get my time",
            value: "me",
          },
          {
            name: "get top 10",
            value: "top10",
          }
        )
    ),

  async execute(interaction, prisma) {
    const command = interaction.options.getString("user");
    let times;
    switch (command) {
      case "all":
        times = await prisma.UserTimeStamp.findMany();
        break;
      case "me":
        times = await prisma.UserTimeStamp.findMany({
          where: {
            userId: interaction.user.id,
          },
        });
        break;
      case "top10":
        times = await prisma.UserTimeStamp.findMany({
          take: 10,
          orderBy: {
            timeSpent: "desc",
          },
        });
        break;
      default:
        break;
    }
    let message = "";
    times.forEach((time) => {
      const days = Math.floor(time.timeSpent / (24 * 60 * 60 * 1000));
      const hours = Math.floor(
        (time.timeSpent % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)
      );
      const minutes = Math.floor(
        (time.timeSpent % (60 * 60 * 1000)) / (60 * 1000)
      );
      const seconds = Math.floor((time.timeSpent % (60 * 1000)) / 1000);
      const formattedTime = `${days} дней, ${hours} часов, ${minutes} минут и ${seconds} секунд`;
      message += `${
        interaction.client.users.cache.get(time.userId).username
      } - ${formattedTime}
    `;
    });
    await interaction.reply(message);
  },
};
