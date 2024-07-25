import { SlashCommandClass } from '../../lib/bot/index.js';
import { ChatInputCommandInteraction, Colors, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Ai } from '../../lib/db/entities/Ai.js';
import { dataSource } from '../../lib/db/dataSource.js';

export default class AI implements SlashCommandClass {
	command = new SlashCommandBuilder()
		.setName('ai')
		.setDescription('実行したチャンネルで、Gemini AIを有効・無効化します');
	private interaction: ChatInputCommandInteraction;
	private async getData() {
		return dataSource.transaction(async (em) => {
			const channelId = this.interaction.channelId;
			const repo = em.getRepository(Ai);
			const data = await repo.findOneBy({ channelId });
			return data;
		});
	}
	private async registered(): Promise<{ bool: boolean; data: Ai | undefined }> {
		const data = await this.getData();
		if (!data) return { bool: false, data: undefined };
		return { bool: true, data };
	}
	private async register() {
		return dataSource.transaction(async (em) => {
			const registered = await this.registered();
			const repo = em.getRepository(Ai);
			if (registered.bool) {
				repo.remove(registered.data);
				return false;
			} else {
				const data = new Ai();
				data.channelId = this.interaction.channelId;
				repo.insert(data);
				return true;
			}
		});
	}
	async run(interaction: ChatInputCommandInteraction) {
		this.interaction = interaction;
		const register = await this.register();
		if (register) {
			await interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setAuthor({
							name: '登録しました',
							iconURL: 'https://raw.githubusercontent.com/aqued-dev/icon/main/check.png',
						})
						.setColor(Colors.Blue),
				],
			});
		} else {
			await interaction.reply({
				embeds: [
					new EmbedBuilder().setColor(Colors.Blue).setAuthor({
						name: '登録解除しました',
						iconURL: 'https://raw.githubusercontent.com/aqued-dev/icon/main/check.png',
					}),
				],
			});
		}
	}
}
