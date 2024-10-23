import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	CommandInteraction,
	ComponentType,
	EmbedBuilder,
	Message,
	type BaseMessageOptions
} from 'discord.js';

/**
 * ボタンページネーション
 * @version v3.5.0  新規追加
 * @param datas ページの内容
 * @param interaction メッセージ又はコマンドインタラクション
 * @returns
 */
export const buttonPagination = async (datas: (string | EmbedBuilder)[], interaction: CommandInteraction | Message) => {
	let currentPage = 0;
	const customIds = {
		before: `components_button_pagination_before_id_${interaction.client.aqued.readyId}`,
		stop: `components_button_pagination_stop_id_${interaction.client.aqued.readyId}`,
		after: `components_button_pagination_after_id_${interaction.client.aqued.readyId}`
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
			new ButtonBuilder().setEmoji('▶️').setCustomId(customIds.after).setStyle(ButtonStyle.Primary).setDisabled(disable)
		);
	};

	const sendData: BaseMessageOptions = {
		components: [createButtonRow()]
	};

	if (datas.length > 0) {
		const firstData = datas[currentPage];
		if (typeof firstData === 'string') {
			sendData.content = firstData;
		} else if (firstData instanceof EmbedBuilder) {
			sendData.embeds = [firstData];
		}
	}

	const reply = await interaction.reply(sendData);

	if (interaction instanceof CommandInteraction) {
		const collector = reply.createMessageComponentCollector({
			filter: (buttonInteraction) => buttonInteraction.user.id === interaction.user.id,
			componentType: ComponentType.Button,
			time: 2 * 60 * 1000,
			max: 1000000
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
		`components_button_pagination_before_id_`,
		`components_button_pagination_stop_id_`,
		`components_button_pagination_after_id_`
	];
	if (!customIds.some((id) => interaction.customId.startsWith(id))) {
		return;
	}
	const customId = customIds.reduce((id, prefix) => id.replace(prefix, ''), interaction.customId);
	if (customId === interaction.client.aqued.readyId) {
		return;
	}
	const buttons = interaction.message.components.flatMap((row) =>
		row.components
			.filter((component) => component.type === ComponentType.Button)
			.map((component) => {
				const buttonData = component.toJSON();
				buttonData.disabled = true;
				return ButtonBuilder.from(buttonData);
			})
	);
	await interaction.update({
		components: [new ActionRowBuilder<ButtonBuilder>().addComponents(buttons)]
	});
};
