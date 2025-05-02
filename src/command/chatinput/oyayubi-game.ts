import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, Colors, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ButtonInteraction } from 'discord.js';
import { ApplicationIntegrationType, InteractionContextType } from '../../utils/extrans.js';

export default {
	// 親指立てるゲームコマンドの設定
	command: new SlashCommandBuilder()
		.setName('oyayubitaterugame')
		.setDescription('親指立てるゲームを開始します。')
		.setIntegrationTypes([ApplicationIntegrationType.UserInstall, ApplicationIntegrationType.GuildInstall])
		.setContexts([InteractionContextType.PrivateChannel, InteractionContextType.BotDM, InteractionContextType.Guild]),

	async execute(interaction: ChatInputCommandInteraction) {
		let playerFingers = 2;
		let botFingers = 2;
		let currentPhase = 'call';

		const embed = new EmbedBuilder()
			.setTitle('✋ 親指立てるゲーム！')
			.setDescription('0〜4の中で、親指の合計本数を予想して宣言してください。')
			.setColor(Colors.Blue);

		const callRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder().setCustomId('oyayubi_call_0').setLabel('0本').setStyle(ButtonStyle.Primary),
			new ButtonBuilder().setCustomId('oyayubi_call_1').setLabel('1本').setStyle(ButtonStyle.Primary),
			new ButtonBuilder().setCustomId('oyayubi_call_2').setLabel('2本').setStyle(ButtonStyle.Primary),
			new ButtonBuilder().setCustomId('oyayubi_call_3').setLabel('3本').setStyle(ButtonStyle.Primary),
			new ButtonBuilder().setCustomId('oyayubi_call_4').setLabel('4本').setStyle(ButtonStyle.Primary)
		);

		const message = await interaction.reply({ embeds: [embed], components: [callRow], fetchReply: true });
		const collector = message.createMessageComponentCollector({ time: 60000 });

		collector.on('collect', async (buttonInteraction: ButtonInteraction) => {
			if (buttonInteraction.user.id !== interaction.user.id) return;

			if (currentPhase === 'call') {
				const playerCall = parseInt(buttonInteraction.customId.split('_')[2]);
				const botRaise = Math.floor(Math.random() * 2) + 1;

				currentPhase = 'raise';
				await buttonInteraction.update({
					embeds: [
						new EmbedBuilder()
							.setTitle('✋ 親指立てるゲーム！')
							.setDescription(`あなたの宣言: **${playerCall}本**\n次に上げる親指の本数を選んでください。`)
							.setColor(Colors.Blue),
					],
					components: [
						new ActionRowBuilder<ButtonBuilder>().addComponents(
							new ButtonBuilder().setCustomId(`oyayubi_raise_1_${playerCall}_${botRaise}`).setLabel('👍 1本上げる').setStyle(ButtonStyle.Success),
							new ButtonBuilder().setCustomId(`oyayubi_raise_2_${playerCall}_${botRaise}`).setLabel('👍👍 2本上げる').setStyle(ButtonStyle.Success)
						),
					],
				});
			} else if (currentPhase === 'raise') {
				const [_, __, playerRaiseStr, playerCallStr, botRaiseStr] = buttonInteraction.customId.split('_');
				const playerRaise = parseInt(playerRaiseStr);
				const playerCall = parseInt(playerCallStr);
				const botRaise = parseInt(botRaiseStr);
				const totalRaised = playerRaise + botRaise;

				let resultText = '';
				if (playerCall === totalRaised) {
					playerFingers--;
					resultText += `🎯 正解！あなたの指が1本減りました（残り ${playerFingers}本）`;
				} else {
					resultText += `❌ 外れ！指の本数は変わりません（残り ${playerFingers}本）`;
				}

				if (playerFingers <= 0) {
					await buttonInteraction.update({
						embeds: [
							new EmbedBuilder()
								.setTitle('🏆 あなたの勝ち！')
								.setColor(Colors.Green),
						],
						components: [],
					});
					collector.stop();
				} else {
					currentPhase = 'call';
					await buttonInteraction.update({
						embeds: [
							new EmbedBuilder()
								.setTitle('👊 次のターン！')
								.setDescription(resultText + '\nもう一度、親指の本数を宣言してください。')
								.setColor(Colors.Orange),
						],
						components: [callRow],
					});
				}
			}
		});
	},
};
