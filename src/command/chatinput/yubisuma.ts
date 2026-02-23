import { SlashCommandBuilder } from '@discordjs/builders';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	ChatInputCommandInteraction,
	Colors,
	ComponentType,
	EmbedBuilder,
	Message,
} from 'discord.js';
import { ApplicationIntegrationType, InteractionContextType } from '../../utils/extrans.js';

// ===========================
// 型定義
// ===========================
interface GameState {
	playerFingers: number;
	cpuFingers: number;
	turn: 'player' | 'cpu';
	playerRaise: number | null;
	cpuRaise: number | null;
}

// ===========================
// ルール計算
// ===========================
function maxCallNumber(playerFingers: number, cpuFingers: number): number {
	return playerFingers + cpuFingers;
}

function maxRaise(selfFingers: number): number {
	return selfFingers;
}

// ===========================
// CPUロジック
// ===========================
function cpuDecideRaise(cpuFingers: number): number {
	return Math.floor(Math.random() * (maxRaise(cpuFingers) + 1));
}

function cpuDecideCall(cpuRaise: number, playerFingers: number, cpuFingers: number): number {
	const guessOpponent = Math.floor(Math.random() * (maxRaise(playerFingers) + 1));
	return Math.min(cpuRaise + guessOpponent, maxCallNumber(playerFingers, cpuFingers));
}

// ===========================
// ヘルパー
// ===========================
function fingerDisplay(n: number): string {
	return n <= 0 ? '（なし）' : '👆'.repeat(n);
}

function raiseLabel(n: number): string {
	const icons = ['✊', '☝️', '✌️'];
	return `${icons[n] ?? n} ${n}本`;
}

function buildStatusFields(game: GameState) {
	return [
		{ name: 'あなた', value: `${fingerDisplay(game.playerFingers)}（残り${game.playerFingers}本）`, inline: true },
		{ name: 'CPU', value: `${fingerDisplay(game.cpuFingers)}（残り${game.cpuFingers}本）`, inline: true },
	];
}

function buildRaiseRow(playerFingers: number): ActionRowBuilder<ButtonBuilder> {
	const buttons = Array.from({ length: maxRaise(playerFingers) + 1 }, (_, n) =>
		new ButtonBuilder()
			.setCustomId(`yubisuma_raise_${n}`)
			.setLabel(raiseLabel(n))
			.setStyle(n === 0 ? ButtonStyle.Secondary : ButtonStyle.Primary),
	);
	return new ActionRowBuilder<ButtonBuilder>().addComponents(...buttons);
}

function buildCallRows(playerFingers: number, cpuFingers: number, disabled = false): ActionRowBuilder<ButtonBuilder>[] {
	const max = maxCallNumber(playerFingers, cpuFingers);
	const buttons = Array.from({ length: max + 1 }, (_, n) =>
		new ButtonBuilder()
			.setCustomId(`yubisuma_call_${n}`)
			.setLabel(`${n}本`)
			.setStyle(ButtonStyle.Primary)
			.setDisabled(disabled),
	);
	const rows: ActionRowBuilder<ButtonBuilder>[] = [];
	for (let i = 0; i < buttons.length; i += 5) {
		rows.push(new ActionRowBuilder<ButtonBuilder>().addComponents(...buttons.slice(i, i + 5)));
	}
	return rows;
}

// ===========================
// フェーズ：指出し
// ===========================
async function runRaisePhase(
	interaction: ChatInputCommandInteraction,
	message: Message,
	game: GameState,
) {
	game.playerRaise = null;
	game.cpuRaise = null;

	const callerLabel = game.turn === 'player' ? 'あなた' : 'CPU';
	const max = maxRaise(game.playerFingers);
	const validIds = Array.from({ length: max + 1 }, (_, n) => `yubisuma_raise_${n}`);

	await interaction.editReply({
		embeds: [
			new EmbedBuilder()
				.setTitle('👊 指を出してください')
				.setDescription(`**${callerLabel}** が宣言者です。\n出す指の本数を選んでください（0〜${max}本）。`)
				.addFields(buildStatusFields(game))
				.setColor(Colors.Blue),
		],
		components: [buildRaiseRow(game.playerFingers)],
	});

	const collector = message.createMessageComponentCollector({
		componentType: ComponentType.Button,
		time: 60_000,
		filter: (i) => i.user.id === interaction.user.id && validIds.includes(i.customId),
	});

	collector.on('collect', async (btnInt: ButtonInteraction) => {
		game.playerRaise = parseInt(btnInt.customId.split('_')[2]);
		game.cpuRaise = cpuDecideRaise(game.cpuFingers);
		await btnInt.deferUpdate();
		collector.stop('submitted');
	});

	collector.on('end', async (_, reason) => {
		if (reason === 'time') {
			game.playerRaise = 0;
			game.cpuRaise = cpuDecideRaise(game.cpuFingers);
		}
		await runCallPhase(interaction, message, game);
	});
}

// ===========================
// フェーズ：宣言
// ===========================
async function runCallPhase(
	interaction: ChatInputCommandInteraction,
	message: Message,
	game: GameState,
) {
	const max = maxCallNumber(game.playerFingers, game.cpuFingers);

	if (game.turn === 'player') {
		const validIds = Array.from({ length: max + 1 }, (_, n) => `yubisuma_call_${n}`);

		await interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setTitle('📣 合計本数を宣言！')
					.setDescription(
						`あなたは **${raiseLabel(game.playerRaise!)}** を出しました。\n` +
						`合計本数を宣言してください！（0〜${max}本）`,
					)
					.addFields(buildStatusFields(game))
					.setColor(Colors.Orange),
			],
			components: buildCallRows(game.playerFingers, game.cpuFingers, false),
		});

		const collector = message.createMessageComponentCollector({
			componentType: ComponentType.Button,
			time: 30_000,
			filter: (i) => i.user.id === interaction.user.id && validIds.includes(i.customId),
		});

		collector.on('collect', async (btnInt: ButtonInteraction) => {
			const called = parseInt(btnInt.customId.split('_')[2]);
			await btnInt.deferUpdate();
			collector.stop('called');
			await runResultPhase(interaction, message, game, called);
		});

		collector.on('end', async (_, reason) => {
			if (reason === 'time') {
				await runResultPhase(interaction, message, game, Math.floor(Math.random() * (max + 1)));
			}
		});

	} else {
		const cpuCalled = cpuDecideCall(game.cpuRaise!, game.playerFingers, game.cpuFingers);

		await interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setTitle('🤖 CPUが宣言中...')
					.setDescription('CPUが考えています...')
					.addFields(buildStatusFields(game))
					.setColor(Colors.Orange),
			],
			components: buildCallRows(game.playerFingers, game.cpuFingers, true),
		});

		await new Promise((resolve) => setTimeout(resolve, 300));
		await runResultPhase(interaction, message, game, cpuCalled);
	}
}

// ===========================
// フェーズ：結果
// ===========================
async function runResultPhase(
	interaction: ChatInputCommandInteraction,
	message: Message,
	game: GameState,
	called: number,
) {
	const total = (game.playerRaise ?? 0) + (game.cpuRaise ?? 0);
	const hit = called === total;
	const callerLabel = game.turn === 'player' ? 'あなた' : 'CPU';

	const raiseText =
		`あなた：**${raiseLabel(game.playerRaise!)}** CPU：**${raiseLabel(game.cpuRaise!)}**\n` +
		`合計：**${total}本** ${callerLabel}の宣言：**${called}本**\n\n`;

	if (hit) {
		if (game.turn === 'player') game.playerFingers -= 1;
		else game.cpuFingers -= 1;
	}

	const resultText = hit
		? `🎯 **ピタリ！** ${callerLabel}の指が1本減りました！`
		: `❌ **外れ！** 指の本数は変わりません。`;

	// 勝敗判定
	if (game.playerFingers <= 0) {
		await interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setTitle('🏆 あなたの勝ち！')
					.setDescription(raiseText + resultText + '\n\n🎉 おめでとうございます！指スマ / いっせーので 完全勝利！')
					.addFields(buildStatusFields(game))
					.setColor(Colors.Gold),
			],
			components: [],
		});
		return;
	}

	if (game.cpuFingers <= 0) {
		await interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setTitle('💀 あなたの負け...')
					.setDescription(raiseText + resultText + '\n\n😢 CPUに負けてしまいました。またチャレンジしてください！')
					.addFields(buildStatusFields(game))
					.setColor(Colors.Red),
			],
			components: [],
		});
		return;
	}

	// ゲーム継続
	game.turn = game.turn === 'player' ? 'cpu' : 'player';
	const nextCallerLabel = game.turn === 'player' ? 'あなた' : 'CPU';

	await interaction.editReply({
		embeds: [
			new EmbedBuilder()
				.setTitle('📊 ターン結果')
				.setDescription(raiseText + resultText + `\n\n次の宣言者：**${nextCallerLabel}**`)
				.addFields(buildStatusFields(game))
				.setColor(hit ? Colors.Green : Colors.Orange),
		],
		components: [
			new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder().setCustomId('yubisuma_next').setLabel('▶️ 次のターンへ').setStyle(ButtonStyle.Success),
			),
		],
	});

	const collector = message.createMessageComponentCollector({
		componentType: ComponentType.Button,
		time: 30_000,
		filter: (i) => i.user.id === interaction.user.id && i.customId === 'yubisuma_next',
	});

	collector.on('collect', async (btnInt: ButtonInteraction) => {
		await btnInt.deferUpdate();
		collector.stop('next');
	});

	collector.on('end', async () => {
		await runRaisePhase(interaction, message, game);
	});
}

// ===========================
// コマンド定義
// ===========================
export default {
	command: new SlashCommandBuilder()
		.setName('yubisuma')
		.setDescription('指スマ / いっせーので をCPUと1対1で対戦します！')
		.setIntegrationTypes([ApplicationIntegrationType.UserInstall, ApplicationIntegrationType.GuildInstall])
		.setContexts([InteractionContextType.PrivateChannel, InteractionContextType.BotDM, InteractionContextType.Guild]),

	async execute(interaction: ChatInputCommandInteraction) {
		const startButton = new ButtonBuilder()
			.setCustomId('yubisuma_start')
			.setLabel('▶️ ゲームスタート')
			.setStyle(ButtonStyle.Success);

		const { resource } = await interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setTitle('✋ 指スマ / いっせーので')
					.setDescription(
						'CPUと対決しましょう！\n\n' +
						'**ルール**\n' +
						'- 各自0〜自分の残り指本数を同時に出す\n' +
						'- 宣言者が合計本数を予想して宣言\n' +
						'- ピタリなら宣言者の指が1本減る\n' +
						'- **先に指を0本にした人の勝ち！**',
					)
					.setColor(Colors.Blue)
					.setFooter({ text: '準備ができたらスタートボタンを押してください' }),
			],
			components: [new ActionRowBuilder<ButtonBuilder>().addComponents(startButton)],
			withResponse: true,
		});
		const message = resource!.message!;

		const startCollector = message.createMessageComponentCollector({
			componentType: ComponentType.Button,
			time: 300_000,
			filter: (i) => i.user.id === interaction.user.id && i.customId === 'yubisuma_start',
			max: 1,
		});

		startCollector.on('collect', async (btnInt: ButtonInteraction) => {
			await btnInt.deferUpdate();
		});

		startCollector.on('end', async (_, reason) => {
			if (reason === 'time') {
				await interaction.editReply({
					embeds: [
						new EmbedBuilder()
							.setTitle('⌛ タイムアウト')
							.setDescription('ゲームがキャンセルされました。もう一度 `/yubisuma` を実行してください。')
							.setColor(Colors.Red),
					],
					components: [],
				});
				return;
			}

			const game: GameState = {
				playerFingers: 2,
				cpuFingers: 2,
				turn: 'player',
				playerRaise: null,
				cpuRaise: null,
			};
			await runRaisePhase(interaction, message, game);
		});
	},
};