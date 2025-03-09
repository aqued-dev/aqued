import { SlashCommandBuilder } from '@discordjs/builders';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChatInputCommandInteraction,
	Colors,
	EmbedBuilder,
	Interaction,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} from 'discord.js';

const gameState = new Map();

export default {
	command: new SlashCommandBuilder().setName('waribashi').setDescription('指遊びの割り箸ゲームを開始します。'),

	async execute(interaction: ChatInputCommandInteraction) {
		const userId = interaction.user.id;
		gameState.set(userId, { left: 1, right: 1, botLeft: 1, botRight: 1 });

		await this.updateGameMessage(interaction, userId);
	},

	async updateGameMessage(interaction, userId) {
		const player = gameState.get(userId);
		if (!player) return;

		const embed = new EmbedBuilder()
			.setTitle('🎴 割り箸ゲーム')
			.setDescription(
				`👋 ${interaction.user.username} の手\n左: ${player.left}本 | 右: ${player.right}本\n\n🤖 Bot の手\n左: ${player.botLeft}本 | 右: ${player.botRight}本`,
			)
			.setColor(Colors.Blue);

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder().setCustomId(`attack_${userId}`).setLabel('攻撃').setStyle(ButtonStyle.Danger),
			new ButtonBuilder().setCustomId(`split_${userId}`).setLabel('分割').setStyle(ButtonStyle.Primary),
		);

		await interaction.reply({
			embeds: [embed],
			components: [row],
		});
	},

	async handleButtonInteraction(interaction: Interaction) {
		if (!interaction.isButton()) return;

		const userId = interaction.customId.split('_')[1];
		if (interaction.user.id !== userId) {
			await interaction.reply({ content: 'このボタンは実行者のみが操作できます。', ephemeral: true });
			return;
		}

		const player = gameState.get(userId);
		if (!player) return;

		if (interaction.customId.startsWith('attack_')) {
			player.botRight += player.left;
			if (player.botRight >= 5) player.botRight = 0;

			await this.checkGameOver(interaction, userId);
		} else if (interaction.customId.startsWith('split_')) {
			const modal = new ModalBuilder().setCustomId(`split_modal_${userId}`).setTitle('分割操作');

			const splitInput = new TextInputBuilder()
				.setCustomId('split_value')
				.setLabel('移動する本数を入力してください (1 以上)')
				.setStyle(TextInputStyle.Short)
				.setRequired(true);

			modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(splitInput));

			await interaction.showModal(modal);
		}
	},

	async handleModalSubmit(interaction) {
		if (!interaction.isModalSubmit()) return;
		const userId = interaction.customId.split('_')[2];
		if (interaction.user.id !== userId) return;

		const player = gameState.get(userId);
		if (!player) return;

		const moveAmount = parseInt(interaction.fields.getTextInputValue('split_value'));
		if (isNaN(moveAmount) || moveAmount <= 0 || moveAmount > player.left + player.right) {
			await interaction.reply({ content: '無効な入力です。適切な本数を入力してください。', ephemeral: true });
			return;
		}

		if (player.left >= moveAmount) {
			player.left -= moveAmount;
			player.right += moveAmount;
		} else {
			player.right -= moveAmount;
			player.left += moveAmount;
		}

		await this.checkGameOver(interaction, userId);
	},

	async botTurn(interaction, userId) {
		const player = gameState.get(userId);
		if (!player) return;

		// 簡単なBotのロジック: ランダムに攻撃または分割
		const action = Math.random() < 0.7 ? 'attack' : 'split';
		if (action === 'attack') {
			player.right += player.botLeft;
			if (player.right >= 5) player.right = 0;
		} else {
			// 分割: Botは均等に分ける
			const total = player.botLeft + player.botRight;
			player.botLeft = Math.floor(total / 2);
			player.botRight = total - player.botLeft;
		}

		await this.checkGameOver(interaction, userId);
	},

	async checkGameOver(interaction, userId) {
		const player = gameState.get(userId);
		if (!player) return;

		if ((player.left === 0 && player.right === 0) || (player.botLeft === 0 && player.botRight === 0)) {
			const winner = player.left === 0 && player.right === 0 ? 'Bot' : interaction.user.username;
			await interaction.reply({ content: `🎉 **${winner} の勝利！** 🎉`, ephemeral: false });
			gameState.delete(userId);
			return;
		}

		await this.updateGameMessage(interaction, userId);
	},
};
