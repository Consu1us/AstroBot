const {SlashCommandBuilder} = require('discord.js');
const { updateRegistry } = require('../../updateRegistry.js');
const { presidentRoleId, officerRoleId, memberRoleId } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('update')
    .setDescription('Update the registry spreadsheet and their discord displayname from provided information')
    .addUserOption(option => 
        option.setName('user')
              .setDescription('User to update')
              .setRequired(true)
    )
    .addStringOption(option =>
        option.setName("id")
        .setDescription("Type their ID")
        .setRequired(true)
    )
    .addIntegerOption(option =>
        option.setName('grade')
        .setDescription('Enter the grade of the person verifying')
        .setRequired(true)
        .setMinValue(9)
        .setMaxValue(12)
    )
    .addStringOption(option =>
        option.setName('fullname')
        .setDescription("Full name provided by the user")
        .setRequired(true)
    )
    .addStringOption(option =>
        option.setName('nickname')
        .setDescription("User's preferred name, if applicable")
        .setRequired(false)
    ),
    
    
    async execute(interaction) {

        await interaction.reply("Updating...");
        const targetUser = interaction.options.getMember('user');
        const fullName = interaction.options.getString('fullname');
        const schoolId = interaction.options.getString('id');
        const requiredRoles = [ presidentRoleId,officerRoleId];
        const hasRequiredRole = requiredRoles.some(roleId => interaction.member.roles.cache.has(roleId));
        const gradeLevel = interaction.options.getInteger('grade');
        const preferredName = interaction.options.getString('nickname');
        if (!hasRequiredRole) {
            return interaction.editReply({content:"You do not have permission to execute this command!",});
        }
        try {
            let firstName = fullName.split(' ')[0];

            if (preferredName) {
                firstName = preferredName;
                await targetUser.setNickname(firstName);
            } else {
                await targetUser.setNickname(firstName);
            }
            await interaction.editReply("Name successfully updated!");
            await targetUser.roles.add(memberRoleId);
            await interaction.editReply("Name successfully updated!\nMember role given!");
            console.log(fullName+" "+schoolId+" "+gradeLevel+"th grade");
            await updateRegistry(fullName, gradeLevel, schoolId);
            await interaction.editReply("Name successfully updated!\nMember role given!\nRegistry updated!");

         } catch (error) {
            console.error(error);
            await interaction.editReply({content: 'Error updating display name or giving role!', ephemeral: true});
         }   
    }
}    