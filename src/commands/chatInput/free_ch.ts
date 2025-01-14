import {
	ActionRowBuilder,
	ApplicationIntegrationType,
	ChannelType,
	ChatInputCommandInteraction,
	InteractionContextType,
	ModalBuilder,
	PermissionFlagsBits,
	SlashCommandBuilder,
	SlashCommandOptionsOnlyBuilder,
	SnowflakeUtil,
	TextInputBuilder,
	TextInputStyle
} from 'discord.js';
import { dataSource } from '../../core/typeorm.config.js';
import { type ChatInputCommand } from '../../core/types/ChatInputCommand.js';
import { type CommandSetting } from '../../core/types/CommandSetting.js';
import { FreeChannel } from '../../database/entities/FreeChannel.js';
import { generateCustomId } from '../../utils/generateCustomId.js';

export default class FreeChannelPanelCreate implements ChatInputCommand {
	public command: SlashCommandOptionsOnlyBuilder;
	public settings: CommandSetting;
	constructor() {
		this.command = new SlashCommandBuilder()
			.setName('free_channel')
			.setDescription('誰でもチャンネルを作れるパネルを生成します。')
			.addChannelOption((input) =>
				input
					.addChannelTypes(ChannelType.GuildCategory)
					.setName('channel')
					.setDescription('テキストチャンネルを作成するカテゴリ')
					.setRequired(true)
			)
			.setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
			.setContexts([InteractionContextType.Guild])
			.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);
		this.settings = {
			enable: true,
			guildOnly: true,
			permissions: [PermissionFlagsBits.ManageChannels]
		};
	}
	async run(interaction: ChatInputCommandInteraction) {
		const channel = interaction.options.getChannel('channel', true, [ChannelType.GuildCategory]);
		const id = SnowflakeUtil.generate().toString();
		dataSource.transaction(async (em) => {
			const objectClass = new FreeChannel(id, channel.id);
			const repo = em.getRepository(FreeChannel);
			await repo.save(objectClass);
		});
		await interaction.showModal(
			new ModalBuilder()
				.setTitle('パネル設定')
				.setCustomId(generateCustomId('chatinput', 'modal', 'free_channel', 'panel', 'create', 'userid', id))
				.addComponents(
					new ActionRowBuilder<TextInputBuilder>().addComponents(
						new TextInputBuilder()
							.setLabel('タイトル')
							.setCustomId('title')
							.setMaxLength(200)
							.setPlaceholder('タイトル')
							.setRequired(false)
							.setStyle(TextInputStyle.Short)
					),
					new ActionRowBuilder<TextInputBuilder>().addComponents(
						new TextInputBuilder()
							.setLabel('メッセージ')
							.setCustomId('message')
							.setMaxLength(1000)
							.setPlaceholder('メッセージ')
							.setRequired(false)
							.setStyle(TextInputStyle.Paragraph)
					),
					new ActionRowBuilder<TextInputBuilder>().addComponents(
						new TextInputBuilder()
							.setLabel('1ユーザーのチャンネル数制限(デフォルト:なし)')
							.setCustomId('user_limit')
							.setMaxLength(2)
							.setPlaceholder('1-20')
							.setRequired(false)
							.setStyle(TextInputStyle.Short)
					)
				)
		);
	}
}
