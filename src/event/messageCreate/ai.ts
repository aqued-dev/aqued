/* eslint-disable unicorn/catch-error-name */
import { EmbedBuilder, Message } from 'discord.js';
import { Config, MessageEventClass } from '../../lib/index.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export default class implements MessageEventClass {
	async run(message: Message) {
		if (message.system || message.author.bot) return;
		if (!message.content) return;
		const data = await prisma.ai.findMany({
			where: {
				OR: [{ channelId: message.channelId }],
			},
		});
		if (data.length === 0) return;
		await message.channel.sendTyping();
		const ai = new GoogleGenerativeAI(Config.geminiApiKey);
		const model = ai.getGenerativeModel({ model: 'gemini-pro' });
		model
			.generateContent(message.cleanContent)
			.then(async (result) => {
				if (result.response.text() === '') return;
				const channel = await message.startThread({ name: '会話' });
				await channel.sendTyping();
				await channel.send(result.response.text());
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
							.setDescription(content),
					],
				});
			});
	}
}
