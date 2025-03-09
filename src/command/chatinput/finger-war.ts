import { SlashCommandBuilder } from '@discordjs/builders';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChatInputCommandInteraction,
	Colors,
	EmbedBuilder,
	Interaction,
	ButtonInteraction,
	StringSelectMenuBuilder,
	StringSelectMenuInteraction,
} from 'discord.js';
import { ApplicationIntegrationType, InteractionContextType } from '../../utils/extrans.js';
type HandState = { left: number; right: number };

export default {
	command: new SlashCommandBuilder()
		.setName('finger-war')
		.setDescription('指遊びの戦争を開始！')
		.setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall) // 修正
		.setContexts(InteractionContextType.Guild, InteractionContextType.PrivateChannel), // 修正

	async execute(interaction: ChatInputCommandInteraction) {
		const userHands: HandState = { left: 1, right: 1 };
		const botHands: HandState = { left: 1, right: 1 };

		const message = await interaction.reply({
			embeds: [generateEmbed(userHands, botHands, '指を分けるか、攻撃するか選んでください！')],
			components: [mainButtons(userHands)],
			fetchReply: true,
		});

		const filter = (i: Interaction) => i.isButton() && i.user.id === interaction.user.id;
		const collector = message.createMessageComponentCollector({ filter, time: 60000 });

		collector.on('collect', async (btnInteraction: ButtonInteraction) => {
			await btnInteraction.deferUpdate();
			const [action, value] = btnInteraction.customId.split('_').slice(2);

			if (action === 'redistribute') {
				await interaction.editReply({
					embeds: [generateEmbed(userHands, botHands, 'どのように指を分けますか？')],
					components: [redistributeMenu(userHands)],
				});
			} else if (action === 'attack') {
				playTurn(userHands, botHands, value as keyof HandState);

				const userLose = userHands.left === 0 && userHands.right === 0;
				const botLose = botHands.left === 0 && botHands.right === 0;

				let statusMessage = '👉 次のターンへ！';
				if (userLose) statusMessage = '😢 **あなたの負け！**';
				else if (botLose) statusMessage = '🎉 **あなたの勝ち！**';

				await interaction.editReply({
					embeds: [generateEmbed(userHands, botHands, statusMessage)],
					components: userLose || botLose ? [] : [mainButtons(userHands)],
				});

				if (userLose || botLose) collector.stop();
				else await botTurn(interaction, userHands, botHands, collector);
			}
		});

		const selectFilter = (i: Interaction) => i.isStringSelectMenu() && i.user.id === interaction.user.id;
		const selectCollector = message.createMessageComponentCollector({ filter: selectFilter, time: 60000 });

		selectCollector.on('collect', async (selectInteraction: StringSelectMenuInteraction) => {
			await selectInteraction.deferUpdate();
			const [from, to, amount] = selectInteraction.values[0].split('_');
			redistributeFingers(userHands, from as keyof HandState, to as keyof HandState, parseInt(amount));

			await interaction.editReply({
				embeds: [generateEmbed(userHands, botHands, '指を分けました！ターン終了です。')],
				components: [],
			});

			await botTurn(interaction, userHands, botHands, collector);
		});

		collector.on('end', () => {
			interaction.editReply({ components: [] }).catch(() => {});
		});
	},
};

// 指を分ける処理（0本の手も復活可能）
function redistributeFingers(hands: HandState, from: keyof HandState, to: keyof HandState, amount: number) {
	if (hands[from] >= amount && amount > 0) {
		hands[from] -= amount;
		hands[to] += amount;
	}
}

// 指の増減を処理
function playTurn(attacker: HandState, defender: HandState, attackHand: keyof HandState) {
	if (attacker[attackHand] > 0) {
		defender[attackHand] += attacker[attackHand];
		if (defender[attackHand] >= 5) defender[attackHand] = 0;
	}
}

// Botのターン
async function botTurn(
	interaction: ChatInputCommandInteraction,
	userHands: HandState,
	botHands: HandState,
	collector: any,
) {
	await new Promise((resolve) => setTimeout(resolve, 1000)); // 1秒待つ（演出）

	const botAttack: keyof HandState = botHands.left > 0 ? 'left' : 'right';
	playTurn(botHands, userHands, botAttack);

	const userLose = userHands.left === 0 && userHands.right === 0;
	const botLose = botHands.left === 0 && botHands.right === 0;

	let statusMessage = '👉 次のターンへ！';
	if (userLose) statusMessage = '😢 **あなたの負け！**';
	else if (botLose) statusMessage = '🎉 **あなたの勝ち！**';

	await interaction.editReply({
		embeds: [generateEmbed(userHands, botHands, statusMessage)],
		components: userLose || botLose ? [] : [mainButtons(userHands)],
	});

	if (userLose || botLose) collector.stop();
}

// Embedの生成
function generateEmbed(userHands: HandState, botHands: HandState, message: string) {
	return new EmbedBuilder()
		.setTitle('🖐️ 指遊びの戦争！！')
		.setDescription(
			`**あなたの手:**\n👈 左手: ${userHands.left}本指 | 右手: ${userHands.right}本指 👉\n\n` +
				`**Botの手:**\n👈 左手: ${botHands.left}本指 | 右手: ${botHands.right}本指 👉\n\n` +
				`**${message}**`,
		)
		.setColor(Colors.Blue);
}

// メインのボタン（指を分ける・攻撃）
function mainButtons(hands: HandState) {
	return new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder().setCustomId('finger-war-redistribute').setLabel('指を分ける').setStyle(ButtonStyle.Secondary),
		new ButtonBuilder()
			.setCustomId('finger-war-attack-left')
			.setLabel('左手で攻撃')
			.setStyle(ButtonStyle.Primary)
			.setDisabled(hands.left === 0),
		new ButtonBuilder()
			.setCustomId('finger-war-attack-right')
			.setLabel('右手で攻撃')
			.setStyle(ButtonStyle.Primary)
			.setDisabled(hands.right === 0),
	);
}

// 指の分け方を選択するメニュー（0本の手にも分けられる）
function redistributeMenu(hands: HandState) {
	const options = [];

	for (let i = 1; i < hands.left; i++) {
		options.push({ label: `左→右 ${i}本`, value: `left_right_${i}` });
	}
	for (let i = 1; i < hands.right; i++) {
		options.push({ label: `右→左 ${i}本`, value: `right_left_${i}` });
	}

	return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
		new StringSelectMenuBuilder()
			.setCustomId('finger-war-redistribute-select')
			.setPlaceholder('分ける指の本数を選択')
			.addOptions(options),
	);
}
