import { BaseInteraction, DiscordAPIError, Events, GuildMember, MessageFlags, User } from 'discord.js';
import { fileURLToPath } from 'url';
import slowmode from '../../../commands/chatInput/slowmode.js';
import { type EventListener } from '../../../core/types/EventListener.js';
import { failEmbed, successEmbed } from '../../../embeds/infosEmbed.js';
import { errorReport } from '../../../utils/errorReporter.js';
import { generateCustomId } from '../../../utils/generateCustomId.js';
import { userFormat } from '../../../utils/userFormat.js';

export default class SlowModeModal implements EventListener<Events.InteractionCreate> {
	public name: Events.InteractionCreate;
	public once: boolean;

	constructor() {
		this.name = Events.InteractionCreate;
		this.once = false;
	}
	async execute(interaction: BaseInteraction): Promise<unknown> {
		if (!interaction.isModalSubmit()) {
			return;
		}
		if (interaction.customId !== generateCustomId('chatinput', 'modal', 'slowmode', 'time')) {
			return;
		}
		if (!interaction.channel || interaction.channel.isDMBased()) {
			return await interaction.reply({
				embeds: [failEmbed('このチャンネルの種類には非対応です')],
				flags: [MessageFlags.Ephemeral]
			});
		}
		let second = interaction.fields.getTextInputValue('second');
		if (!second) {
			second = `${interaction.channel.rateLimitPerUser ?? '0'}`;
		}
		if (isNaN(Number(second))) {
			return await interaction.reply({
				embeds: [failEmbed('低速モードの秒数が数字ではありません')],
				flags: [MessageFlags.Ephemeral]
			});
		} else if (Number(slowmode) < 0 || Number(slowmode) > 21600) {
			return await interaction.reply({
				embeds: [failEmbed('低速モードの秒数が限界以下/以上です')],
				flags: [MessageFlags.Ephemeral]
			});
		}
		let user: User | GuildMember = interaction.user;
		if (interaction.member instanceof GuildMember) {
			user = interaction.member;
		}
		try {
			await interaction.channel.setRateLimitPerUser(
				Number(slowmode),
				`${userFormat(user)}によって低速モードが設定されました`
			);
			return await interaction.reply({ embeds: [successEmbed('低速モードの設定が完了しました')] });
		} catch (error) {
			if (error instanceof DiscordAPIError && error.status === 403) {
				return await interaction.reply({ embeds: [failEmbed('Botに低速モードを設定する権限がありません')] });
			}
			const errorId = errorReport(
				fileURLToPath(import.meta.url),
				interaction.channel,
				interaction.user,
				error,
				'',
				'slowmode/interactionCreate',
				'chatinput_modal_slowmode_time'
			);
			return await interaction.reply({
				embeds: [
					failEmbed(
						`不明なエラーが発生しました\nエラーID: ${errorId}\nサポートサーバーにてエラーIDをご連絡ください\nhttps://discord.gg/PTPeAzwYdn`
					)
				]
			});
		}
	}
}
