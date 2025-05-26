import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	CommandInteraction,
	ComponentType,
	EmbedBuilder,
	Message,
	MessageFlags,
	type BaseMessageOptions,
} from 'discord.js';

/**
 * ボタンページネーション
 * @version v3.6.0  新規追加
 * @param datas ページの内容
 * @param interaction メッセージ又はコマンドインタラクション
 * @returns
 */
export const buttonPagination = async (
	datas: (string | EmbedBuilder)[],
	interaction: CommandInteraction | Message,
	ephemeral: boolean = false,
) => {
	let currentPage = 0;
	const customIds = {
		before: `components_button_pagination_before_id_${interaction.client.botData.readyId}`,
		stop: `components_button_pagination_stop_id_${interaction.client.botData.readyId}`,
		after: `components_button_pagination_after_id_${interaction.client.botData.readyId}`,
	};
	const createButtonRow = (disable: boolean = false) => {
		return new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setEmoji('◀️')
				.setCustomId(customIds.before)
				.setStyle(ButtonStyle.Primary)
				.setDisabled(disable),
			new ButtonBuilder()
				.setEmoji('🛑')
				.setCustomId(customIds.stop)
				.setStyle(ButtonStyle.Danger)
				.setLabel(`Page ${currentPage + 1}/${datas.length}`)
				.setDisabled(disable),
			new ButtonBuilder()
				.setEmoji('▶️')
				.setCustomId(customIds.after)
				.setStyle(ButtonStyle.Primary)
				.setDisabled(disable),
		);
	};

	const sendData: BaseMessageOptions = {
		components: datas.length > 1 ? [createButtonRow()] : [],
	};

	if (datas.length > 0) {
		const firstData = datas[currentPage];
		if (typeof firstData === 'string') {
			sendData.content = firstData;
		} else if (firstData instanceof EmbedBuilder) {
			sendData.embeds = [firstData];
		}
	}
	if (ephemeral) {
		sendData['flags'] = MessageFlags.Ephemeral;
	}

	const reply = await interaction.reply(sendData);

	if (datas.length !== 0) {
		let userId: string;
		if (interaction instanceof CommandInteraction) {
			userId = interaction.user.id;
		} else {
			userId = interaction.author.id;
		}
		const collector = reply.createMessageComponentCollector({
			filter: (buttonInteraction) => buttonInteraction.user.id === userId,
			componentType: ComponentType.Button,
			time: 2 * 60 * 1000,
			max: 1000000,
		});

		collector.on('collect', async (buttonInteraction) => {
			if (buttonInteraction.customId === customIds.before) {
				if (currentPage > 0) {
					currentPage--;
					const pageData = datas[currentPage];
					const updateData: BaseMessageOptions = { components: [createButtonRow()] };

					if (typeof pageData === 'string') {
						updateData.content = pageData;
					} else if (pageData instanceof EmbedBuilder) {
						updateData.embeds = [pageData];
					}

					await buttonInteraction.update(updateData);
				} else {
					await buttonInteraction.deferUpdate();
				}
			} else if (buttonInteraction.customId === customIds.after) {
				if (currentPage < datas.length - 1) {
					currentPage++;
					const pageData = datas[currentPage];
					const updateData: BaseMessageOptions = { components: [createButtonRow()] };

					if (typeof pageData === 'string') {
						updateData.content = pageData;
					} else if (pageData instanceof EmbedBuilder) {
						updateData.embeds = [pageData];
					}

					await buttonInteraction.update(updateData);
				} else {
					await buttonInteraction.deferUpdate();
				}
			} else if (buttonInteraction.customId === customIds.stop) {
				await buttonInteraction.deferUpdate();
				collector.stop();
			}
		});
		collector.on('end', async () => {
			await reply.edit({ components: [createButtonRow(true)] });
		});
	}
};

export const oldButtonPaginationDisable = async (interaction: ButtonInteraction) => {
	const customIds = [
		`components_button_pagination_before_id_${interaction.client.botData.readyId}`,
		`components_button_pagination_stop_id_${interaction.client.botData.readyId}`,
		`components_button_pagination_after_id_${interaction.client.botData.readyId}`,
	];
	if (customIds.includes(interaction.customId)) return;

	const buttons = interaction.message.components
		.filter((value) => value.type === ComponentType.ActionRow)
		.flatMap((row) =>
			row.components
				.filter((component) => component.type === ComponentType.Button)
				.map((component) => {
					const buttonData = component.toJSON();
					buttonData.disabled = true;
					return ButtonBuilder.from(buttonData);
				}),
		);
	await interaction.update({
		components: [new ActionRowBuilder<ButtonBuilder>().addComponents(buttons)],
	});
};
