import {
	ActionRowBuilder,
	ApplicationIntegrationType,
	ButtonBuilder,
	ButtonStyle,
	ChatInputCommandInteraction,
	Colors,
	EmbedBuilder,
	InteractionContextType,
	SlashCommandBuilder,
	StringSelectMenuBuilder
} from 'discord.js';
import { emojis } from '../../config/emojis.js';
import { type ChatInputCommand } from '../../core/types/ChatInputCommand.js';
import { type CommandSetting } from '../../core/types/CommandSetting.js';
import { generateCustomId } from '../../utils/generateCustomId.js';

export default class Embed implements ChatInputCommand {
	public command: SlashCommandBuilder;
	public settings: CommandSetting;
	constructor() {
		this.command = new SlashCommandBuilder()
			.setName('embed')
			.setDescription('埋め込み作成')
			.setIntegrationTypes([ApplicationIntegrationType.UserInstall, ApplicationIntegrationType.GuildInstall])
			.setContexts([InteractionContextType.PrivateChannel, InteractionContextType.BotDM, InteractionContextType.Guild]);
		this.settings = {
			enable: true
		};
	}
	async run(interaction: ChatInputCommandInteraction) {
		await interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setTitle(interaction.options.getString('title') ?? 'タイトル')
					.setDescription(interaction.options.getString('description') ?? '説明')
					.setColor(Colors.Default)
			],
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder()
						.setLabel('編集終了')
						.setStyle(ButtonStyle.Success)
						.setEmoji(emojis().check)
						.setCustomId(generateCustomId('chatinput', 'button', 'embed', 'end', 'userid', interaction.user.id)),
					new ButtonBuilder()
						.setLabel('削除')
						.setStyle(ButtonStyle.Danger)
						.setEmoji(emojis().delete)
						.setCustomId(generateCustomId('chatinput', 'button', 'embed', 'delete', 'userid', interaction.user.id))
				),
				new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
					new StringSelectMenuBuilder()
						.setPlaceholder('embedの編集...')
						.setCustomId(generateCustomId('chatinput', 'select', 'embed', 'edit'))
						.setMaxValues(1)
						.addOptions(
							{ label: 'タイトル', description: interaction.options.getString('title') || 'タイトル', value: 'title' },
							{
								label: '説明',
								description: interaction.options.getString('description') || '説明',
								value: 'description'
							},
							{ label: 'url', description: 'なし', value: 'url' },
							{ label: '色', description: '#000000(黒)', value: 'color' },
							{ label: 'フッター', description: 'なし', value: 'footer' },
							{ label: '画像', description: 'なし', value: 'image' },
							{ label: 'サムネイル', description: 'なし', value: 'thumbnail' },
							{ label: '著者', description: 'なし', value: 'author' }
						)
				)
			]
		});
	}
}
