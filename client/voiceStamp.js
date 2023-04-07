const { Events } = require("discord.js");

function voiceStamp(client, prisma) {
  client.on("voiceStateUpdate", async (oldState, newState) => {
    if (oldState.channelId === null && newState.channelId !== null) {
      newState.member.startTime = new Date();
    } else if (oldState.channelId !== null && newState.channelId === null) {
      const timeSpent = new Date() - newState.member.startTime;
      const days = Math.floor(timeSpent / (24 * 60 * 60 * 1000));
      const hours = Math.floor(
        (timeSpent % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)
      );
      const minutes = Math.floor((timeSpent % (60 * 60 * 1000)) / (60 * 1000));
      const seconds = Math.floor((timeSpent % (60 * 1000)) / 1000);
      const formattedTime = `${days} дней, ${hours} часов, ${minutes} минут и ${seconds} секунд`;
      const users = await prisma.UserTimeStamp.findMany({
        where: {
          userId: newState.member.id,
        },
      });
      if (users.length === 0) {
        await prisma.UserTimeStamp.create({
          data: {
            userId: newState.member.id,
            timeSpent: timeSpent,
            userName: newState.member.displayName,
          },
        });
      } else {
        await prisma.UserTimeStamp.update({
          where: {
            userId: newState.member.id,
          },
          data: {
            timeSpent: users[0].timeSpent + timeSpent,
            userName: newState.member.displayName,
          },
        });
      }
      console.log(`${newState.member.displayName} провел ${formattedTime}`);
    }
  });
}

module.exports = { voiceStamp };
