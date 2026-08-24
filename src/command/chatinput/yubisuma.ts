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
	SlashCommandBuilder,
	ApplicationIntegrationType,
	InteractionContextType,
} from 'discord.js';

// ===========================
// ゲームクラス
// ===========================
class YubisumaGame {
	private interaction: ChatInputCommandInteraction;
	private message: Message;
	private playerFingers: number = 2;
	private cpuFingers: number = 2;
	private turn: 'player' | 'cpu' = 'player';
	private playerRaise: number = 0;
	private cpuRaise: number = 0;

	constructor(interaction: ChatInputCommandInteraction, message: Message) {
		this.interaction = interaction;
		this.message = message;
	}

	// ===========================
	// ルール計算
	// ===========================
	private get maxCall(): number {
		return this.playerFingers + this.cpuFingers;
	}

	private get maxPlayerRaise(): number {
		return this.playerFingers;
	}

	private get maxCpuRaise(): number {
		return this.cpuFingers;
	}

	// ===========================
	// CPUロジック
	// ===========================
	private decideCpuRaise(): number {
		return Math.floor(Math.random() * (this.maxCpuRaise + 1));
	}

	private decideCpuCall(): number {
		const guessOpponent = Math.floor(Math.random() * (this.maxPlayerRaise + 1));
		return Math.min(this.cpuRaise + guessOpponent, this.maxCall);
	}

	// ===========================
	// 表示ヘルパー
	// ===========================
	private static fingerDisplay(n: number): string {
		return n <= 0 ? '（なし）' : '👆'.repeat(n);
	}

	private static raiseLabel(n: number): string {
		const icons = ['✊', '☝️', '✌️'];
		return `${icons[n] ?? n} ${n}本`;
	}

	private buildStatusFields() {
		return [
			{
				name: 'あなた',
				value: `${YubisumaGame.fingerDisplay(this.playerFingers)}（残り${this.playerFingers}本）`,
				inline: true,
			},
			{
				name: 'CPU',
				value: `${YubisumaGame.fingerDisplay(this.cpuFingers)}（残り${this.cpuFingers}本）`,
				inline: true,
			},
		];
	}

	private buildRaiseRow(): ActionRowBuilder<ButtonBuilder> {
		const buttons = Array.from({ length: this.maxPlayerRaise + 1 }, (_, n) =>
			new ButtonBuilder()
				.setCustomId(`yubisuma_raise_${n}`)
				.setLabel(YubisumaGame.raiseLabel(n))
				.setStyle(n === 0 ? ButtonStyle.Secondary : ButtonStyle.Primary),
		);
		return new ActionRowBuilder<ButtonBuilder>().setComponents(buttons);
	}

	private buildCallRows(disabled = false): ActionRowBuilder<ButtonBuilder>[] {
		const buttons = Array.from({ length: this.maxCall + 1 }, (_, n) =>
			new ButtonBuilder()
				.setCustomId(`yubisuma_call_${n}`)
				.setLabel(`${n}本`)
				.setStyle(ButtonStyle.Primary)
				.setDisabled(disabled),
		);
		const rows: ActionRowBuilder<ButtonBuilder>[] = [];
		for (let i = 0; i < buttons.length; i += 5) {
			rows.push(new ActionRowBuilder<ButtonBuilder>().setComponents(buttons.slice(i, i + 5)));
		}
		return rows;
	}

	// ===========================
	// フェーズ：指出し
	// ===========================
	async runRaisePhase(): Promise<void> {
		const callerLabel = this.turn === 'player' ? 'あなた' : 'CPU';
		const validIds = Array.from({ length: this.maxPlayerRaise + 1 }, (_, n) => `yubisuma_raise_${n}`);

		await this.interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setTitle('👊 指を出してください')
					.setDescription(
						`**${callerLabel}** が宣言者です。\n出す指の本数を選んでください（0〜${this.maxPlayerRaise}本）。`,
					)
					.addFields(this.buildStatusFields())
					.setColor(Colors.Blue),
			],
			components: [this.buildRaiseRow()],
		});

		const collector = this.message.createMessageComponentCollector({
			componentType: ComponentType.Button,
			time: 60_000,
			filter: (i) => i.user.id === this.interaction.user.id && validIds.includes(i.customId),
		});

		collector.on('collect', async (btnInt: ButtonInteraction) => {
			this.playerRaise = parseInt(btnInt.customId.split('_')[2]);
			this.cpuRaise = this.decideCpuRaise();
			await btnInt.deferUpdate();
			collector.stop('submitted');
		});

		collector.on('end', async (_, reason) => {
			if (reason === 'time') {
				this.playerRaise = 0;
				this.cpuRaise = this.decideCpuRaise();
			}
			await this.runCallPhase();
		});
	}

	// ===========================
	// フェーズ：宣言
	// ===========================
	async runCallPhase(): Promise<void> {
		if (this.turn === 'player') {
			const validIds = Array.from({ length: this.maxCall + 1 }, (_, n) => `yubisuma_call_${n}`);

			await this.interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setTitle('📣 合計本数を宣言！')
						.setDescription(
							`あなたは **${YubisumaGame.raiseLabel(this.playerRaise)}** を出しました。\n` +
								`合計本数を宣言してください！（0〜${this.maxCall}本）`,
						)
						.addFields(this.buildStatusFields())
						.setColor(Colors.Orange),
				],
				components: this.buildCallRows(false),
			});

			const collector = this.message.createMessageComponentCollector({
				componentType: ComponentType.Button,
				time: 30_000,
				filter: (i) => i.user.id === this.interaction.user.id && validIds.includes(i.customId),
			});

			collector.on('collect', async (btnInt: ButtonInteraction) => {
				const called = parseInt(btnInt.customId.split('_')[2]);
				await btnInt.deferUpdate();
				collector.stop('called');
				await this.runResultPhase(called);
			});

			collector.on('end', async (_, reason) => {
				if (reason === 'time') {
					await this.runResultPhase(Math.floor(Math.random() * (this.maxCall + 1)));
				}
			});
		} else {
			const cpuCalled = this.decideCpuCall();

			await this.interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setTitle('🤖 CPUが宣言中...')
						.setDescription('CPUが考えています...')
						.addFields(this.buildStatusFields())
						.setColor(Colors.Orange),
				],
				components: this.buildCallRows(true),
			});

			await new Promise((resolve) => setTimeout(resolve, 300));
			await this.runResultPhase(cpuCalled);
		}
	}

	// ===========================
	// フェーズ：結果
	// ===========================
	async runResultPhase(called: number): Promise<void> {
		const total = this.playerRaise + this.cpuRaise;
		const hit = called === total;
		const callerLabel = this.turn === 'player' ? 'あなた' : 'CPU';

		const raiseText =
			`あなた：**${YubisumaGame.raiseLabel(this.playerRaise)}** CPU：**${YubisumaGame.raiseLabel(this.cpuRaise)}**\n` +
			`合計：**${total}本** ${callerLabel}の宣言：**${called}本**\n\n`;

		if (hit) {
			if (this.turn === 'player') this.playerFingers -= 1;
			else this.cpuFingers -= 1;
		}

		const resultText = hit
			? `🎯 **ピタリ！** ${callerLabel}の指が1本減りました！`
			: `❌ **外れ！** 指の本数は変わりません。`;

		// 勝敗判定
		if (this.playerFingers <= 0) {
			await this.interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setTitle('🏆 あなたの勝ち！')
						.setDescription(raiseText + resultText + '\n\n🎉 おめでとうございます！指スマ / いっせーので 完全勝利！')
						.addFields(this.buildStatusFields())
						.setColor(Colors.Gold),
				],
				components: [],
			});
			return;
		}

		if (this.cpuFingers <= 0) {
			await this.interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setTitle('💀 あなたの負け...')
						.setDescription(raiseText + resultText + '\n\n😢 CPUに負けてしまいました。またチャレンジしてください！')
						.addFields(this.buildStatusFields())
						.setColor(Colors.Red),
				],
				components: [],
			});
			return;
		}

		// ゲーム継続 → 宣言者交代
		this.turn = this.turn === 'player' ? 'cpu' : 'player';
		const nextCallerLabel = this.turn === 'player' ? 'あなた' : 'CPU';

		await this.interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setTitle('📊 ターン結果')
					.setDescription(raiseText + resultText + `\n\n次の宣言者：**${nextCallerLabel}**`)
					.addFields(this.buildStatusFields())
					.setColor(hit ? Colors.Green : Colors.Orange),
			],
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder().setCustomId('yubisuma_next').setLabel('▶️ 次のターンへ').setStyle(ButtonStyle.Success),
				),
			],
		});

		const collector = this.message.createMessageComponentCollector({
			componentType: ComponentType.Button,
			time: 30_000,
			filter: (i) => i.user.id === this.interaction.user.id && i.customId === 'yubisuma_next',
		});

		collector.on('collect', async (btnInt: ButtonInteraction) => {
			await btnInt.deferUpdate();
			collector.stop('next');
		});

		collector.on('end', async () => {
			await this.runRaisePhase();
		});
	}
}

// ===========================
// コマンド
// ===========================
export default {
	command: new SlashCommandBuilder()
		.setName('yubisuma')
		.setDescription('指スマ / いっせーので をCPUと1対1で対戦します！')
		.setIntegrationTypes([ApplicationIntegrationType.UserInstall, ApplicationIntegrationType.GuildInstall])
		.setContexts([InteractionContextType.PrivateChannel, InteractionContextType.BotDM, InteractionContextType.Guild]),
	ownersOnly: false,
	modOnly: false,
	permissions: false,

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

		if (!resource?.message) {
			await interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setTitle('エラー')
						.setDescription('メッセージの取得に失敗しました。もう一度試してください。')
						.setColor(Colors.Red),
				],
				components: [],
			});
			return;
		}

		const message = resource.message;

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

			const game = new YubisumaGame(interaction, message);
			await game.runRaisePhase();
		});
	},
};
