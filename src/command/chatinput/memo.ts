import {
	ActionRowBuilder,
	ApplicationIntegrationType,
	bold,
	ChatInputCommandInteraction,
	Colors,
	EmbedBuilder,
	InteractionContextType,
	ModalBuilder,
	SlashCommandBuilder,
	TextInputBuilder,
	TextInputStyle,
} from 'discord.js';
import { MemoData } from '../../interactions/memoCreate.js';
import { chunkArray } from '../../utils/array.js';
import { buttonPagination } from '../../utils/pagenation.js';
export default {
	command: new SlashCommandBuilder()
		.setName('memo')
		.setDescription('メモ系コマンド')
		.addSubcommand((input) => input.setName('create').setDescription('メモを作成します'))
		.addSubcommand((input) =>
			input
				.setName('read')
				.setDescription('指定したIDのメモを表示します')
				.addStringOption((input) => input.setName('id').setDescription('メモのID').setRequired(true))
				.addStringOption((input) =>
					input
						.setName('view')
						.setDescription('自分だけに表示するか')
						.addChoices({ name: 'はい', value: 'true' }, { name: 'いいえ', value: 'false' })
						.setRequired(true),
				),
		)
		.addSubcommand((input) =>
			input
				.setName('update')
				.setDescription('指定したIDのメモを編集します')
				.addStringOption((input) => input.setName('id').setDescription('メモのID').setRequired(true)),
		)
		.addSubcommand((input) =>
			input
				.setName('delete')
				.setDescription('指定したIDのメモを削除します')
				.addStringOption((input) => input.setName('id').setDescription('メモのID').setRequired(true)),
		)
		.addSubcommand((input) =>
			input
				.setName('list')
				.setDescription('メモのリストを表示します')
				.addStringOption((input) =>
					input
						.setName('view')
						.setDescription('自分だけに表示するか')
						.addChoices({ name: 'はい', value: 'true' }, { name: 'いいえ', value: 'false' })
						.setRequired(true),
				),
		)
		.setIntegrationTypes([ApplicationIntegrationType.UserInstall, ApplicationIntegrationType.GuildInstall])
		.setContexts([InteractionContextType.PrivateChannel, InteractionContextType.BotDM, InteractionContextType.Guild]),
	ownersOnly: false,
	modOnly: false,
	permissions: false,
	async execute(interaction: ChatInputCommandInteraction) {
		const commandName = interaction.options.getSubcommand();
		const database = interaction.client.botData.memo;
		if (commandName === 'create') {
			return await interaction.showModal(
				new ModalBuilder()
					.setTitle('メモを作成する')
					.addComponents(
						new ActionRowBuilder<TextInputBuilder>().addComponents(
							new TextInputBuilder()
								.setLabel('タイトル')
								.setStyle(TextInputStyle.Short)
								.setCustomId('title')
								.setRequired(true)
								.setPlaceholder('タイトルを入力...'),
						),
						new ActionRowBuilder<TextInputBuilder>().addComponents(
							new TextInputBuilder()
								.setLabel('内容')
								.setStyle(TextInputStyle.Paragraph)
								.setCustomId('value')
								.setRequired(false)
								.setPlaceholder('内容を入力...'),
						),
					)
					.setCustomId('memo_crud_create'),
			);
		} else if (commandName === 'read') {
			/**
			 * empty
			 *  */
		} else if (commandName === 'update') {
			/**
			 * empty
			 *  */
		} else if (commandName === 'delete') {
			/**
			 * empty
			 *  */
		} else if (commandName === 'list') {
			try {
				const ephemeral = interaction.options.getString('view');
				const memos = (await database.get(interaction.user.id)) as MemoData[] | null;
				const embeds: EmbedBuilder[] = chunkArray(memos, 10).map((memoArray, index, array) =>
					new EmbedBuilder()
						.setTitle('メモ一覧')
						.setDescription(memoArray.map((memo) => `${memo.id}: ${bold(memo.title)}`).join('\n'))
						.setFooter({ text: `Page ${index + 1}/${array.length}` })
						.setColor(Colors.Blue),
				);
				return await buttonPagination(embeds, interaction, { ephemeral: ephemeral === 'true' });
			} catch {
				return await interaction.error('失敗', 'メモ一覧の取得に失敗しました', true);
			}
		} else {
			return await interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setTitle('このコマンドは存在しません')
						.setDescription('まだ実装されていないメモ関連の機能の可能性があります')
						.setColor(Colors.Blue),
				],
			});
		}
	},
};
