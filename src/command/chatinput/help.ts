import {
	ActionRowBuilder,
	ApplicationCommandType,
	ApplicationIntegrationType,
	ButtonBuilder,
	ButtonStyle,
	ChatInputCommandInteraction,
	Colors,
	ComponentType,
	EmbedBuilder,
	InteractionContextType,
	SlashCommandBuilder,
} from 'discord.js';

export default {
	command: new SlashCommandBuilder()
		.setName('help')
		.setDescription('helpを表示します。(コマンド名が指定されている場合はそのコマンドの情報を表示します。)')
		.addStringOption((input) =>
			input.setName('name').setDescription('コマンド名').setAutocomplete(true).setRequired(false),
		)
		.setIntegrationTypes([ApplicationIntegrationType.UserInstall, ApplicationIntegrationType.GuildInstall])
		.setContexts([InteractionContextType.BotDM, InteractionContextType.Guild]),
	ownersOnly: false,
	modOnly: false,
	permissions: false,
	async execute(interaction: ChatInputCommandInteraction) {
		if (interaction.options.getString('name')) {
			const commands = interaction.client.botData.commandDatas;
			for (const command of commands) {
				if (command.name !== interaction.options.getString('name')) {
					continue;
				}
				let description;
				if (command.type === ApplicationCommandType.ChatInput) {
					description = command.description;
				}
				await interaction.reply({
					embeds: [
						new EmbedBuilder()
							.setTitle(command.name)
							.setDescription(description ?? '説明がありません。')
							.setColor(Colors.Blue),
					],
				});
				return;
			}
			if (!interaction.replied) {
				await interaction.reply({
					embeds: [new EmbedBuilder().setColor(Colors.Red).setTitle('このコマンドは存在しません。')],
				});
			}
		} else {
			const embeds = [
				new EmbedBuilder()
					.setTitle('help')
					.setDescription(
						'[`サポートサーバー`](https://discord.gg/rE75MJswYw)\n[`Botの招待`](https://discord.com/oauth2/authorize?client_id=979877840382197790&permissions=1644971949559&scope=bot%20applications.commands)\n[`公式サイト`](https://aqued.gx1285.com/)',
					)
					.setColor(Colors.Blue),
			];
			const commands = interaction.client.botData.commandDatas;
			const pageSize = 5;
			const pageCount = Math.ceil(commands.length / pageSize);

			for (let pageNumber = 0; pageNumber < pageCount; pageNumber++) {
				const startIndex = pageNumber * pageSize;
				const endIndex = Math.min(startIndex + pageSize, commands.length);
				const lists = commands.slice(startIndex, endIndex).map((command) => {
					let description;
					if (command.type === ApplicationCommandType.ChatInput) {
						description = command.description;
					}
					return {
						name: command.name,
						description: description ?? '説明がありません。',
					};
				});

				embeds.push(
					new EmbedBuilder()
						.setTitle('help')
						.setDescription(lists.map((value) => `### ${value.name}\n${value.description}`).join('\n'))
						.setColor(Colors.Blue),
				);
			}
			for (const [index, embed] of embeds.entries()) {
				embed.setFooter({ text: `Page ${index + 1} / ${embeds.length}` });
			}

			const message = await interaction.reply({
				fetchReply: true,
				embeds: !embeds[0]
					? [new EmbedBuilder().setTitle('エラー').setDescription('データを作成できませんでした').setColor(Colors.Red)]
					: [embeds[0]],
				components: [
					new ActionRowBuilder<ButtonBuilder>().addComponents(
						new ButtonBuilder().setEmoji('⏪').setCustomId('back').setStyle(ButtonStyle.Secondary),
						new ButtonBuilder().setEmoji('⏹️').setCustomId('stop').setStyle(ButtonStyle.Secondary),
						new ButtonBuilder().setEmoji('⏩').setCustomId('forward').setStyle(ButtonStyle.Secondary),
					),
				],
			});
			const interactionEvent = message.createMessageComponentCollector({
				componentType: ComponentType.Button,
				time: 120_000,
				max: 1_000_000,
			});
			interactionEvent.on('collect', async (buttonInteraction) => {
				if (interaction.user.id !== buttonInteraction.user.id) {
					await buttonInteraction.deferUpdate();
				}
				switch (buttonInteraction.customId) {
					case 'back': {
						for (const [index, embed] of embeds.entries()) {
							if (buttonInteraction.message.embeds[0]?.toJSON().description !== embed.toJSON().description) {
								continue;
							}
							const number = index - 1;
							await (index === 0
								? buttonInteraction.deferUpdate()
								: buttonInteraction.update({
										embeds: [
											!embeds[number]
												? new EmbedBuilder()
														.setTitle('エラー')
														.setDescription('データを作成できませんでした')
														.setColor(Colors.Red)
												: embeds[number],
										],
									}));
							return;
						}
						break;
					}
					case 'stop': {
						message.edit({ components: [] }).catch(() => {
							/* empty */
						});
						interactionEvent.stop();
						break;
					}
					case 'forward': {
						for (const [index, embed] of embeds.entries()) {
							if (buttonInteraction.message.embeds[0]?.toJSON().description !== embed.toJSON().description) {
								continue;
							}
							const number = index + 1;
							await (embeds.length === index + 1
								? buttonInteraction.deferUpdate()
								: buttonInteraction.update({
										embeds: [
											!embeds[number]
												? new EmbedBuilder()
														.setTitle('エラー')
														.setDescription('データを作成できませんでした')
														.setColor(Colors.Red)
												: embeds[number],
										],
									}));
							return;
						}
						break;
					}
				}
			});
			interactionEvent.on('end', () => {
				message.edit({ components: [] }).catch(() => {
					/* empty */
				});
			});
		}
	},
};
