require('dotenv').config();
const Discord = require("discord.js");
const {Client, Collection, Events, ActivityType, GatewayIntentBits } = require('discord.js');
require('process');
const fs = require('node:fs');
const path = require('node:path');
const client = new Discord.Client({
    intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.GuildMessageReactions,
    Discord.GatewayIntentBits.GuildMembers,
    Discord.GatewayIntentBits.MessageContent,    
    Discord.GatewayIntentBits.GuildPresences,
    Discord.GatewayIntentBits.DirectMessages,
],
    partials: [
        Discord.Partials.Channel,
        Discord.Partials.Message
    ],
    presence: {
        activities: [{name: 'Stargazing', type: ActivityType.Custom }],
        status: 'online'
    }
});

const token = process.env.BOT_TOKEN;
client.login(token);
client.on('ready', async () => {
    console.log(`Client logged into: ${client.user.username}`);
});

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);
for (const folder of commandFolders){
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles){
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command){
            client.commands.set(command.data.name, command);
        } else{
            console.log(`[WARNING] The command file at ${filePath} is missing required 'data' or 'execute' property.`)
        } }
}

client.on(Events.InteractionCreate, async interaction =>{
    if (!interaction.isChatInputCommand()) return;
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) {
        console.error(`No command matching ${interaction.commandName} found`);
        return;
    }
    try {
        await command.execute(interaction, client);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({content: 'Error executing command!', ephemeral: true});
        } else {
            await interaction.reply({content: 'Error executing command!', ephemeral: true})
        }
    }
});
