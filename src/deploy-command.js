const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});
const { SlashCommandBuilder } = require("@discordjs/builders");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");

const commands = [
  new SlashCommandBuilder()
    .setName(`${process.env.DISCORD_COMMAND_PREFIX}-link`)
    .setDescription("Link your wallet address")
    .addStringOption((option) =>
      option
        .setName("address")
        .setDescription("Your EVM wallet address")
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName(`${process.env.DISCORD_COMMAND_PREFIX}-query`)
    .setDescription("Query your linked wallet address"),
].map((command) => command.toJSON());

const rest = new REST({ version: "9" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.DISCORD_CLIENT_ID,
        process.env.DISCORD_GUILD_ID
      ),
      { body: commands }
    );
    console.log("Successfully registered application commands.");
  } catch (error) {
    console.error(error);
  }
})();
