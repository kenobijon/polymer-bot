# Discord-Collect-Address

This is a simple discord bot that collects EVM address of the user and stores it in a database with redis cache. Users can submit their address whatever they want as long as it fulfills the EVM address format. It does not check the validity of the address and no signing is required.

## Environment Requirements

- Node.js v20 or higher
- Redis server
- PostgreSQL server

## Installation

1. Clone the repository
2. Install the dependencies

```bash
npm install
```

3. Copy the `.env.example` file to `.env` and fill in the required information

- Register your Discord App here [Discord Developer Portal](https://discord.com/developers/applications)
- Go to **Bot** section to get the bot token, fill in the `DISCORD_TOKEN` field
- Go to **OAuth2** section to get the client ID, fill in the `DISCORD_CLIENT_ID` field
  - Check `bot` under SCOPES section
  - Check `Use Slash Commands` under BOT PERMISSIONS section
  - You will get the OAuth2 URL, visit the URL to invite the bot to your server
- Fill in the `DISCORD_GUILD_ID` field with your server ID
- Fill in the `DISCORD_CHANNEL_ID` field with your channel ID where the bot should respond
- Fill in the `DISCORD_COMMAND_PREFIX` field with the prefix you want to use for the bot commands

4. Initialize the database

```bash
npx prisma migrate dev
```

5. Install the slash commands to your server

```bash
npm run deploy
```

6. Start the server (you can use `pm2` to keep the server running)

```bash
npm run serve
```

## Usage

Assume `polyverse` is the command prefix, you can use the following commands:

- `/polyverse-link` - Link your EVM address to your Discord account
- `/polyverse-query` - Query the EVM address that linked to your Discord account

## License

MIT
