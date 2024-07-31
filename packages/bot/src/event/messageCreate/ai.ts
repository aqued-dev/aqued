import { Colors, EmbedBuilder, Message } from 'discord.js';
import { Config, MessageEventClass } from '../../lib/index.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { splitNewLineText } from '../../lib/index.js';
import { dataSource } from '../../lib/db/dataSource.js';
import { Ai } from '../../lib/db/entities/Ai.js';
import { AiThread } from '../../lib/db/entities/AiThread.js';
import { AiThreadHistory } from '../../lib/db/entities/AiThreadHistory.js';
export default class implements MessageEventClass {
	private message: Message;
	private async getAi(): Promise<Ai | undefined> {
		return dataSource.transaction(async (em) => {
			const repo = em.getRepository(Ai);
			const data = await repo.findOneBy({ channelId: this.message.channelId });
			return data ?? undefined;
		});
	}
	private async aiRegistered(): Promise<boolean> {
		const data = await this.getAi();
		if (!data) return false;
		return true;
	}
	private async getAiThread(): Promise<AiThread | undefined> {
		return dataSource.transaction(async (em) => {
			const repo = em.getRepository(AiThread);
			const data = await repo.findOneBy({ threadId: this.message.channelId });
			return data ?? undefined;
		});
	}
	private async addAiThread() {
		return dataSource.transaction(async (em) => {
			const repo = em.getRepository(AiThread);
			const data = new AiThread();
			data.threadId = this.message.channelId;
			await repo.insert(data);
		});
	}
	private async aiThreadRegistered(): Promise<boolean> {
		const data = await this.getAiThread();
		if (!data) return false;
		return true;
	}
	private async getData() {
		return dataSource.transaction(async (em) => {
			const repo = em.getRepository(AiThreadHistory);
			const data = await repo.findBy({ threadId: this.message.channelId });
			return data;
		});
	}
	private async addData(aiContent: string) {
		return dataSource.transaction(async (em) => {
			const repo = em.getRepository(AiThreadHistory);
			const data = new AiThreadHistory();
			data.aiContent = aiContent;
			data.userContent = this.message.cleanContent;
			data.threadId = this.message.channelId;
			repo.insert(data);
		});
	}
	async run(message: Message) {
		this.message = message;
		if (message.system || message.author.bot) return;
		if (!message.content || message.content.startsWith('// ')) return;
		if (message.channel.isThread() && (await this.aiThreadRegistered())) {
			const data = await this.getData();

			await message.channel.sendTyping();
			const ai = new GoogleGenerativeAI(Config.geminiApiKey);
			const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
			model
				.startChat({
					history: data.flatMap((value) => {
						return [
							{ role: 'user', parts: [{ text: value.userContent }] },
							{ role: 'model', parts: [{ text: value.aiContent }] },
						];
					}),
				})
				.sendMessage(message.cleanContent)
				.then(async (result) => {
					const aiContent = result.response.text();
					if (aiContent === '') return;
					await message.channel.sendTyping();
					await message.reply(aiContent);
					await this.addData(aiContent);
				})
				.catch(async (error) => {
					let content: string = error.message;
					if (content.includes('Text not available. Response was blocked due to SAFETY'))
						content = '他の言葉をお試しください';
					await message.reply({
						embeds: [
							new EmbedBuilder()
								.setAuthor({
									name: 'テキストの生成に失敗しました',
									iconURL: 'https://raw.githubusercontent.com/aqued-dev/icon/main/no.png',
								})
								.setDescription(content)
								.setColor(Colors.Blue),
						],
					});
					await this.addData('回答できません。');
				});
		} else {
			if (!(await this.aiRegistered())) return;
			await message.channel.sendTyping();
			const ai = new GoogleGenerativeAI(Config.geminiApiKey);
			const model = ai.getGenerativeModel({ model: 'gemini-pro' });
			model
				.generateContent(message.cleanContent)
				.then(async (result) => {
					if (result.response.text() === '') return;
					const channel = await message.startThread({ name: '会話' });
					await channel.sendTyping();

					for (const text of splitNewLineText(result.response.text())) {
						await channel.send(text);
					}
					await this.addAiThread();
					await this.addData(result.response.text());
				})
				.catch(async (error) => {
					let content: string = error.message;
					if (content.includes('Text not available. Response was blocked due to SAFETY'))
						content = '他の言葉をお試しください';
					await message.reply({
						embeds: [
							new EmbedBuilder()
								.setAuthor({
									name: 'テキストの生成に失敗しました',
									iconURL: 'https://raw.githubusercontent.com/aqued-dev/icon/main/no.png',
								})
								.setDescription(content)
								.setColor(Colors.Red),
						],
					});
				});
		}
	}
}
