/* eslint-disable unicorn/catch-error-name */
import { EmbedBuilder, Message } from 'discord.js';
import { Config, MessageEventClass } from '../../lib/index.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaClient } from '@prisma/client';
import { splitNewLineText } from 'src/lib/index.js';
const prisma = new PrismaClient();
export default class implements MessageEventClass {
	async run(message: Message) {
		if (message.system || message.author.bot) return;
		if (!message.content || message.content.startsWith('// ')) return;
		if (
			message.channel.isThread() &&
			(await prisma.aiThread.findMany({ where: { OR: [{ id: message.channelId }] } })).length > 0
		) {
			const data = await prisma.aiThreadHistory.findMany({ where: { OR: [{ aiThreadId: message.channelId }] } });

			await message.channel.sendTyping();
			const ai = new GoogleGenerativeAI(Config.geminiApiKey);
			const model = ai.getGenerativeModel({ model: 'gemini-pro' });
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
					if (result.response.text() === '') return;
					await message.channel.sendTyping();
					await message.reply(result.response.text());
					await prisma.aiThreadHistory.create({
						data: {
							userContent: message.cleanContent,
							aiContent: result.response.text(),
							aiThreadId: message.channelId,
						},
					});
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
					await prisma.aiThreadHistory.create({
						data: { userContent: message.cleanContent, aiContent: '回答できませんでした。' },
					});
				});
		} else {
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

					for (const text of splitNewLineText(result.response.text())) {
						await channel.send(text);
					}
					await prisma.aiThread.create({ data: { id: channel.id } });
					await prisma.aiThreadHistory.create({
						data: { userContent: message.cleanContent, aiContent: result.response.text(), aiThreadId: channel.id },
					});
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
}
