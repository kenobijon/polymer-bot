const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");

const rest = new REST({ version: "9" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    const commands = await rest.get(
      Routes.applicationGuildCommands(
        process.env.DISCORD_CLIENT_ID,
        process.env.DISCORD_GUILD_ID
      )
    );

    for (const command of commands) {
      console.log(`Deleting command ${command.name}`);

      await rest.delete(
        Routes.applicationGuildCommand(
          process.env.DISCORD_CLIENT_ID,
          process.env.DISCORD_GUILD_ID,
          command.id
        )
      );
    }
  } catch (error) {
    console.error(error);
  }
})();
