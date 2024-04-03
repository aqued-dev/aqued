import { Logger, SlashCommandClass } from '../../lib/bot/index.js';
import {
	AutocompleteInteraction,
	ChatInputCommandInteraction,
	Colors,
	EmbedBuilder,
	SlashCommandBuilder,
} from 'discord.js';
import { DOMParser } from '@xmldom/xmldom';
export default class implements SlashCommandClass {
	command = new SlashCommandBuilder()
		.setName('weather')
		.setDescription('天気を表示します')
		// eslint-disable-next-line unicorn/consistent-function-scoping
		.addStringOption((input) => input.setName('place').setDescription('場所').setAutocomplete(true).setRequired(true));
	async run(interaction: ChatInputCommandInteraction) {
		try {
			await interaction.deferReply();
			const response = await fetch(
				`https://weather.tsukumijima.net/api/forecast/city/${interaction.options.getString('place')}`,
			);
			const data: {
				error?: string;
				publicTime: string;
				publicTimeFormatted: string;
				publishingOffice: string;
				title: string;
				link: string;
				description: {
					publicTime: string;
					publicTimeFormatted: string;
					headlineText: string;
					bodyText: string;
					text: string;
				};
				forecasts: {
					date: string;
					dateLabel: string;
					telop: string;
					detail: { weather: string | null; wind: string | null; wave: string | null };
					temperature: {
						max: { celsius: string | null; fahrenheit: string | null };
						min: { celsius: string | null; fahrenheit: string | null };
					};
					chanceOfRain: { T00_06: string; T06_12: string; T12_18: string; T18_24: string };
					image: { title: string; url: string; width: number; height: number };
				}[];
				location: { area: string; prefecture: string; district: string; city: string };
				copyright: {
					title: string;
					link: string;
					image: {
						title: string;
						link: string;
						url: string;
						width: number;
						height: number;
					};
					provider: {
						link: string;
						name: string;
						note: string;
					}[];
				};
			} = await response.json();
			if (data.error) return await interaction.editReply({ content: `エラーが発生しました。\n${data.error}` });
			if (response.status !== 200)
				return await interaction.editReply({ content: `サーバーエラーが発生しました。\n${data.error}` });
			const today = data.forecasts[0];
			await interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setTitle(`${today.dateLabel} の ${data.title}`)
						.setDescription(data.description.bodyText.replaceAll('　', '').replaceAll('\n\n', '\n'))
						.setFooter({ text: `発表日時: ${data.publicTimeFormatted} / API By ${data.copyright.title}` })
						.setAuthor({
							name: `${data.publishingOffice}(${data.copyright.provider[0].name})`,
							url: data.copyright.provider[0].link,
						})
						.addFields(
							{ name: '天気', value: `${today.telop}(${today.detail.weather})` },
							{ name: '風', value: `${today.detail.wind ?? '--'}` },
							{ name: '波', value: `${today.detail.wave ?? '--'}` },
							{
								name: '気温',
								value: `最低: ${today.temperature.min.celsius ?? '--'} °C, 最高: ${today.temperature.max.celsius ?? '--'} °C`,
							},
							{
								name: '降水確率',
								value: `0-6時: ${today.chanceOfRain.T00_06}, 6-12時: ${today.chanceOfRain.T06_12}, 12-18時: ${today.chanceOfRain.T12_18}, 18-24時: ${today.chanceOfRain.T18_24}`,
							},
						)
						.setColor(
							// eslint-disable-next-line unicorn/no-nested-ternary
							today.telop.startsWith('晴') ? Colors.Orange : today.telop.startsWith('曇り') ? Colors.Grey : Colors.Blue,
						),
				],
			});
		} catch (error) {
			await interaction.editReply({ content: `データ取得にエラーが発生しました。` });
			Logger.error(error);
		}
	}
	async autoComplete(interaction: AutocompleteInteraction) {
		if (interaction.commandName !== this.command.name) return;
		let areaXml: string = interaction.client.cache.get('primary_area.xml');
		if (!areaXml) {
			const response = await fetch('https://weather.tsukumijima.net/primary_area.xml');
			const text = await response.text();
			interaction.client.cache.set('primary_area.xml', text);
			areaXml = text;
		}
		const parser = new DOMParser();
		const xmlDoc = parser.parseFromString(areaXml, 'text/xml');
		// eslint-disable-next-line unicorn/prefer-query-selector
		const cityTags = xmlDoc.getElementsByTagName('city');
		const data: { title: string; id: string }[] = [];
		// eslint-disable-next-line unicorn/no-for-loop
		for (let i = 0; i < cityTags.length; i++) {
			const cityTag = cityTags[i];
			data.push({ title: cityTag.getAttribute('title'), id: cityTag.getAttribute('id') });
		}
		const focusedValue = interaction.options.getFocused();

		await interaction.respond(
			data
				.filter((choice) => choice.title.startsWith(focusedValue))
				.slice(0, 25)
				.map((choice) => ({ name: choice.title, value: choice.id })),
		);
	}
}
