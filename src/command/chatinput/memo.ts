import {
	ActionRowBuilder,
	ApplicationIntegrationType,
	bold,
	ChatInputCommandInteraction,
	Colors,
	EmbedBuilder,
	InteractionContextType,
	MessageFlags,
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
			const id = interaction.options.getString('id', true);
			const ephemeral = interaction.options.getString('view');
			try {
				const memoArray: MemoData[] | undefined = await database.get(interaction.user.id);
				const memo = memoArray.filter((memo) => String(memo.id) === id)[0] ?? null;
				if (memoArray && memoArray.length !== 0 && memo) {
					return await interaction.ok(memo.title, memo.value || '(メモの内容は無いようだ...)', ephemeral === 'true');
				} else {
					return await interaction.error(
						'失敗',
						'IDが間違っているか、メモが一件も登録されていない可能性があります',
						true,
					);
				}
			} catch {
				return await interaction.error('失敗', 'メモの取得に失敗しました', true);
			}
		} else if (commandName === 'update') {
			const id = interaction.options.getString('id', true);
			try {
				const memoArray: MemoData[] | undefined = await database.get(interaction.user.id);
				const memo = memoArray.filter((memo) => String(memo.id) === id)[0] ?? null;
				if (memoArray && memoArray.length !== 0 && memo) {
					return await interaction.showModal(
						new ModalBuilder()
							.setTitle('メモ編集')
							.setCustomId(`memo_crud_update_${memo.id}`)
							.addComponents(
								new ActionRowBuilder<TextInputBuilder>().addComponents(
									new TextInputBuilder()
										.setLabel('タイトル')
										.setStyle(TextInputStyle.Short)
										.setCustomId('title')
										.setRequired(true)
										.setPlaceholder('タイトルを入力...')
										.setValue(memo.title),
								),
								new ActionRowBuilder<TextInputBuilder>().addComponents(
									new TextInputBuilder()
										.setLabel('内容')
										.setStyle(TextInputStyle.Paragraph)
										.setCustomId('value')
										.setRequired(false)
										.setPlaceholder('内容を入力...')
										.setValue(memo.value || ''),
								),
							),
					);
				} else {
					return await interaction.error('失敗', 'メモの取得に失敗しました', true);
				}
			} catch {
				return await interaction.error('失敗', 'メモの取得に失敗しました', true);
			}
		} else if (commandName === 'delete') {
			await interaction.deferReply({ flags: MessageFlags.Ephemeral });
			const id = interaction.options.getString('id', true);
			try {
				const beforeArray = ((await database.get(interaction.user.id)) as MemoData[]) ?? [];
				const memoExists = beforeArray.some((memo) => String(memo.id) === id);

				if (!memoExists) {
					return await interaction.error(
						'失敗',
						'指定されたIDのメモは見つかりませんでした。存在しないか、既に削除されている可能性があります。',
						true,
					);
				}

				await database.set(
					interaction.user.id,
					beforeArray.filter((memo) => String(memo.id) !== id),
				);
				return await interaction.ok('成功', 'メモの削除に成功しました', true);
			} catch {
				return await interaction.error('失敗', 'メモの削除処理中にエラーが発生しました', true);
			}
		} else if (commandName === 'list') {
			const ephemeral = interaction.options.getString('view');
			await interaction.deferReply({ flags: ephemeral === 'true' ? MessageFlags.Ephemeral : [] });
			try {
				const memos = (await database.get(interaction.user.id)) as MemoData[] | null;
				const embeds: EmbedBuilder[] = chunkArray(memos, 10).map((memoArray, index, array) =>
					new EmbedBuilder()
						.setTitle('メモ一覧')
						.setDescription(
							memoArray?.map((memo) => `${memo.id}: ${bold(memo.title)}`).join('\n') ||
								'表示できるメモが見つかりませんでした',
						)
						.setFooter({ text: `Page ${index + 1}/${array.length}` })
						.setColor(Colors.Blue),
				);
				if (embeds.length === 0) {
					embeds.push(
						new EmbedBuilder()
							.setTitle('メモ一覧')
							.setDescription('表示できるメモが見つかりませんでした')
							.setFooter({ text: `Page 1/1` })
							.setColor(Colors.Blue),
					);
				}
				return await buttonPagination(embeds, interaction, { ephemeral: ephemeral === 'true', defer: true });
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
