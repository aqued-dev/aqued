import { ChatInputCommandInteraction, Colors, EmbedBuilder } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
export default {
	command: new SlashCommandBuilder()
		.setName('afk')
		.setDescription('afkが設定または解除されます。')
		.addStringOption((input) => input.setName('reason').setDescription('理由').setRequired(false)),
	ownersOnly: false,
	modOnly: false,
	permissions: false,
	async execute(interaction: ChatInputCommandInteraction) {
		const { afk, mention } = interaction.client.botData.afk;
		const mentions: string[] | undefined = await mention.get(interaction.user.id);
		if (await afk.get(interaction.user.id)) {
			await afk.delete(interaction.user.id);
			const embed = new EmbedBuilder()
				.setColor(Colors.Blue)
				.setTitle('✅ afkを解除しました。')
				.setDescription('解除に成功しました。');
			if (mentions) {
				embed.addFields({ name: 'メンション: ', value: mentions.join('\n') });
				await mention.delete(interaction.user.id);
			}
			await interaction.reply({
				ephemeral: false,
				embeds: [embed],
			});
		} else {
			await afk.set(interaction.user.id, interaction.options.getString('reason') || true);
			await interaction.ok('afkを設定しました。', 'afkになりました。', false);
		}
	},
};
