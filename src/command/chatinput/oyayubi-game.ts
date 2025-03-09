import { SlashCommandBuilder } from '@discordjs/builders';
import {
	ChatInputCommandInteraction,
	Colors,
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ComponentType,
} from 'discord.js';
import { ApplicationIntegrationType, InteractionContextType } from '../../utils/extrans.js';

export default {
	// 親指立てるゲームコマンドの設定
	command: new SlashCommandBuilder()
		.setName('oyayubigame')
		.setDescription('親指立てるゲームを開始します。')
		.setIntegrationTypes([ApplicationIntegrationType.UserInstall, ApplicationIntegrationType.GuildInstall])
		.setContexts([InteractionContextType.PrivateChannel, InteractionContextType.BotDM, InteractionContextType.Guild]),

	async execute(interaction: ChatInputCommandInteraction) {
		// プレイヤーとボットの指の本数（2本から開始）
		let playerFingers = 2;
		let botFingers = 2;
		const turn = true; // true: プレイヤーのターン, false: ボットのターン

		const embed = new EmbedBuilder()
			.setTitle(':hand: 親指立てるゲーム！')
			.setDescription('あなたの番です。数字を選んでください。')
			.setColor(Colors.Blue);

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder().setCustomId('call_0').setLabel('0').setStyle(ButtonStyle.Primary),
			new ButtonBuilder().setCustomId('call_1').setLabel('1').setStyle(ButtonStyle.Primary),
			new ButtonBuilder().setCustomId('call_2').setLabel('2').setStyle(ButtonStyle.Primary),
			new ButtonBuilder().setCustomId('call_3').setLabel('3').setStyle(ButtonStyle.Primary),
			new ButtonBuilder().setCustomId('call_4').setLabel('4').setStyle(ButtonStyle.Primary),
		);

		const message = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

		const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });

		collector.on('collect', async (i) => {
			if (i.user.id !== interaction.user.id) return;

			const playerCall = parseInt(i.customId.split('_')[1]);

			const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder().setCustomId('raise_1').setLabel('1本').setStyle(ButtonStyle.Success),
				new ButtonBuilder().setCustomId('raise_2').setLabel('2本').setStyle(ButtonStyle.Success),
			);

			await i.update({
				embeds: [
					new EmbedBuilder()
						.setTitle(':hand: 親指立てるゲーム！')
						.setDescription(`あなたのコール: ${playerCall}\n指の本数を選んでください。`)
						.setColor(Colors.Blue),
				],
				components: [buttonRow],
			});

			const raiseCollector = message.createMessageComponentCollector({
				componentType: ComponentType.Button,
				time: 30000,
			});

			raiseCollector.on('collect', async (raiseInteraction) => {
				if (raiseInteraction.user.id !== interaction.user.id) return;
				const playerRaise = parseInt(raiseInteraction.customId.split('_')[1]);
				const botRaise = Math.floor(Math.random() * 2) + 1;
				const totalRaised = playerRaise + botRaise;

				if (playerCall === totalRaised) playerFingers--;
				if (playerFingers <= 0) {
					await raiseInteraction.update({
						embeds: [new EmbedBuilder().setTitle(':trophy: あなたの勝ち！').setColor(Colors.Green)],
						components: [],
					});
					return;
				}

				// ボットのターン
				const botCall = Math.floor(Math.random() * (botFingers + playerFingers + 1));
				if (botCall === totalRaised) botFingers--;
				if (botFingers <= 0) {
					await raiseInteraction.update({
						embeds: [new EmbedBuilder().setTitle(':robot: ボットの勝ち！').setColor(Colors.Red)],
						components: [],
					});
					return;
				}

				await raiseInteraction.update({
					embeds: [
						new EmbedBuilder()
							.setTitle(':hand: 次のターン')
							.setDescription(`ボットのコール: ${botCall}\nボットの指: ${botRaise}本`)
							.setColor(Colors.Purple),
					],
					components: [row],
				});
			});
		});
	},
};
