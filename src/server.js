const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});
const { Client, GatewayIntentBits } = require("discord.js");
const { createClient } = require("redis");
const { PrismaClient } = require("@prisma/client");

// init prisma client
const prisma = new PrismaClient();

// init redis client
const client = createClient({
  url: process.env.REDIS_URL,
});

// init discord client
const discord = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

// handle redis errors
client.on("error", (err) => console.log("Redis Client Error", err));

// main function
async function main() {
  // redis connection
  await client.connect();

  discord.once("ready", () => {
    console.log(`Logged in as ${discord.user.tag}!`);
  });

  discord.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;

    // if command is not running in the specified channel, return error
    if (
      interaction.guildId !== process.env.DISCORD_GUILD_ID ||
      interaction.channelId !== process.env.DISCORD_CHANNEL_ID
    ) {
      await interaction.reply({
        content: "This command is not available in this channel.",
        ephemeral: true,
      });
      return;
    }

    const { commandName, options } = interaction;

    try {
      if (commandName === `${process.env.DISCORD_COMMAND_PREFIX}-link`) {
        const walletAddress = options.getString("address");
        if (/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
          await interaction.deferReply({ ephemeral: true });

          // save to database
          await prisma.mapping.upsert({
            where: {
              discordId: interaction.user.id,
            },
            create: {
              discordId: interaction.user.id,
              discordUsername: interaction.user.tag,
              walletAddress: walletAddress,
            },
            update: {
              walletAddress: walletAddress,
              discordUsername: interaction.user.tag,
            },
          });

          await prisma.history.create({
            data: {
              discordId: interaction.user.id,
              discordUsername: interaction.user.tag,
              walletAddress: walletAddress,
            },
          });

          // write to redis
          await client.set(
            `${process.env.DISCORD_COMMAND_PREFIX}:${interaction.user.id}`,
            walletAddress
          );

          console.log(
            `User ${interaction.user.tag} linked wallet ${walletAddress}`
          );

          await interaction.editReply(
            `Wallet address \`${walletAddress}\` linked successfully!`
          );
        } else {
          await interaction.reply({
            content:
              "Invalid wallet address, please provide an EVM compatible address.",
            ephemeral: true,
          });
        }
      } else if (
        commandName === `${process.env.DISCORD_COMMAND_PREFIX}-query`
      ) {
        await interaction.deferReply();

        // find from redis first
        let walletAddress = await client.get(
          `${process.env.DISCORD_COMMAND_PREFIX}:${interaction.user.id}`
        );

        if (!walletAddress) {
          const userEntry = await prisma.mapping.findUnique({
            where: {
              discordId: interaction.user.id,
            },
          });

          if (!userEntry) {
            await interaction.editReply(
              "You have not linked a wallet address.",
              {
                ephemeral: true,
              }
            );
            return;
          }

          walletAddress = userEntry.walletAddress;

          console.log(
            `User ${interaction.user.tag} found in database, wallet ${walletAddress}`
          );

          // write to redis
          await client.set(
            `${process.env.DISCORD_COMMAND_PREFIX}:${interaction.user.id}`,
            walletAddress
          );
        } else {
          console.log(`User ${interaction.user.tag} found in redis.`);
        }

        await interaction.editReply(
          `Your linked wallet address is: \`${walletAddress}\``,
          {
            ephemeral: true,
          }
        );
      }
    } catch (error) {
      console.error("Error handling the interaction:", error);
      await interaction.followUp({
        content: "An error occurred while processing your command.",
        ephemeral: true,
      });
    }
  });

  discord.login(process.env.DISCORD_TOKEN);
}

main().catch(console.error);
