import { SlashCommandBuilder } from '@discordjs/builders';
import {
	ChatInputCommandInteraction,
	Colors,
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ButtonInteraction,
} from 'discord.js';
import { ApplicationIntegrationType, InteractionContextType } from '../../utils/extrans.js';

export default {
	command: new SlashCommandBuilder()
		.setName('oyayubitaterugame')
		.setDescription('親指立てるゲームを開始します。')
		.setIntegrationTypes([ApplicationIntegrationType.UserInstall, ApplicationIntegrationType.GuildInstall])
		.setContexts([InteractionContextType.PrivateChannel, InteractionContextType.BotDM, InteractionContextType.Guild]),

	async execute(interaction: ChatInputCommandInteraction) {
		let playerFingers = 2;
		let botFingers = 2;

		const embed = new EmbedBuilder()
			.setTitle('✋ 親指立てるゲーム！')
			.setDescription('宣言する親指の本数を選んでください。')
			.setColor(Colors.Blue);

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder().setCustomId('call_0').setLabel('0本と宣言').setStyle(ButtonStyle.Primary),
			new ButtonBuilder().setCustomId('call_1').setLabel('1本と宣言').setStyle(ButtonStyle.Primary),
			new ButtonBuilder().setCustomId('call_2').setLabel('2本と宣言').setStyle(ButtonStyle.Primary),
			new ButtonBuilder().setCustomId('call_3').setLabel('3本と宣言').setStyle(ButtonStyle.Primary),
			new ButtonBuilder().setCustomId('call_4').setLabel('4本と宣言').setStyle(ButtonStyle.Primary),
		);

		const message = await interaction.reply({
			embeds: [embed],
			components: [row],
			fetchReply: true,
		});

		const collector = message.createMessageComponentCollector({ time: 60000 });

		collector.on('collect', async (callInteraction: ButtonInteraction) => {
			if (callInteraction.user.id !== interaction.user.id) return;

			const playerCall = parseInt(callInteraction.customId.split('_')[1]);
			const botRaise = Math.floor(Math.random() * 2) + 1;

			const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder().setCustomId('raise_1').setLabel('👍 1本上げる').setStyle(ButtonStyle.Success),
				new ButtonBuilder().setCustomId('raise_2').setLabel('👍👍 2本上げる').setStyle(ButtonStyle.Success),
			);

			await callInteraction.update({
				embeds: [
					new EmbedBuilder()
						.setTitle('✋ 親指立てるゲーム！')
						.setDescription(`あなたの宣言: **${playerCall}本**\n次に上げる親指の本数を選んでください。`)
						.setColor(Colors.Blue),
				],
				components: [buttonRow],
			});

			const raiseCollector = message.createMessageComponentCollector({ time: 30000 });

			raiseCollector.on('collect', async (raiseInteraction: ButtonInteraction) => {
				if (raiseInteraction.user.id !== interaction.user.id) return;

				const playerRaise = parseInt(raiseInteraction.customId.split('_')[1]);
				const totalRaised = playerRaise + botRaise;

				let resultText = '';
				if (playerCall === totalRaised) {
					playerFingers--;
					resultText += `🎯 正解！あなたの指が1本減りました（残り ${playerFingers}本）\n`;
				} else {
					resultText += `❌ 外れ！指の本数は変わりません（残り ${playerFingers}本）\n`;
				}

				if (playerFingers <= 0) {
					await raiseInteraction.update({
						embeds: [
							new EmbedBuilder()
								.setTitle('🏆 あなたの勝ち！')
								.setDescription('おめでとうございます！')
								.setColor(Colors.Green),
						],
						components: [],
					});
					return;
				} else if (botFingers <= 0) {
					await raiseInteraction.update({
						embeds: [
							new EmbedBuilder()
								.setTitle('🤖 ボットの勝ち！')
								.setDescription('また挑戦してね。')
								.setColor(Colors.Red),
						],
						components: [],
					});
					return;
				}

				await raiseInteraction.update({
					embeds: [
						new EmbedBuilder()
							.setTitle('👊 次のターン！')
							.setDescription(resultText + '\n再び宣言する親指の本数を選んでください。')
							.setColor(Colors.Orange),
					],
					components: [row],
				});
			});
		});
	},
};
