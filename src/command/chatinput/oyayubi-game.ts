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

		const createCallButtons = () => new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder().setCustomId('call_0').setLabel('0本と宣言').setStyle(ButtonStyle.Primary),
			new ButtonBuilder().setCustomId('call_1').setLabel('1本と宣言').setStyle(ButtonStyle.Primary),
			new ButtonBuilder().setCustomId('call_2').setLabel('2本と宣言').setStyle(ButtonStyle.Primary),
			new ButtonBuilder().setCustomId('call_3').setLabel('3本と宣言').setStyle(ButtonStyle.Primary),
			new ButtonBuilder().setCustomId('call_4').setLabel('4本と宣言').setStyle(ButtonStyle.Primary)
		);

		const startTurn = async () => {
			const embed = new EmbedBuilder()
				.setTitle('✋ 親指立てるゲーム！')
				.setDescription('宣言する親指の本数を選んでください。')
				.setColor(Colors.Blue);

			const row = createCallButtons();

			const message = await interaction.followUp({ embeds: [embed], components: [row], fetchReply: true });

			const collector = message.createMessageComponentCollector({ time: 60000 });

			collector.on('collect', async (buttonInteraction: ButtonInteraction) => {
				if (buttonInteraction.user.id !== interaction.user.id) return;

				const playerCall = parseInt(buttonInteraction.customId.split('_')[1]);
				const botRaise = Math.floor(Math.random() * 2) + 1;

				const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder().setCustomId('raise_1').setLabel('👍 1本上げる').setStyle(ButtonStyle.Success),
					new ButtonBuilder().setCustomId('raise_2').setLabel('👍👍 2本上げる').setStyle(ButtonStyle.Success)
				);

				await buttonInteraction.update({
					embeds: [
						new EmbedBuilder()
							.setTitle('✋ 親指立てるゲーム！')
							.setDescription(`あなたのコール: ${playerCall} 本\n親指を何本上げますか？`)
							.setColor(Colors.Blue),
					],
					components: [buttonRow],
				});

				const raiseCollector = message.createMessageComponentCollector({ time: 30000 });

				raiseCollector.on('collect', async (raiseInteraction: ButtonInteraction) => {
					if (raiseInteraction.user.id !== interaction.user.id) return;

					const playerRaise = parseInt(raiseInteraction.customId.split('_')[1]);
					const totalRaised = playerRaise + botRaise;

					if (playerCall === totalRaised) playerFingers--;

					if (playerFingers <= 0 || botFingers <= 0) {
						await raiseInteraction.update({
							embeds: [
								new EmbedBuilder()
									.setTitle(playerFingers === 0 ? '🏆 あなたの勝ち！' : '🤖 ボットの勝ち！')
									.setColor(playerFingers === 0 ? Colors.Green : Colors.Red),
							],
							components: [],
						});
					} else {
						await raiseInteraction.update({
							embeds: [
								new EmbedBuilder()
									.setTitle('🤖 ボットのターン')
									.setDescription(`ボットが親指を ${botRaise} 本上げた！`)
									.setColor(Colors.Red),
							],
							components: [],
						});
						// 次のターンを開始
						await startTurn();
					}
				});
			});
		};

		// 最初のターンを開始
		await startTurn();
	},
};
