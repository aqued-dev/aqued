import {
	ApplicationIntegrationType,
	ChatInputCommandInteraction,
	Colors,
	EmbedBuilder,
	InteractionContextType,
	SlashCommandBuilder,
} from 'discord.js';
import { buttonPagination } from '../../utils/pagenation.js';

interface WeatherData {
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
}

export default {
	command: new SlashCommandBuilder()
		.setName('weather')
		.setDescription('天気を表示します')
		.addStringOption((option) => option.setName('place').setDescription('場所').setRequired(true).setAutocomplete(true))
		.setIntegrationTypes([ApplicationIntegrationType.UserInstall, ApplicationIntegrationType.GuildInstall])
		.setContexts([InteractionContextType.PrivateChannel, InteractionContextType.BotDM, InteractionContextType.Guild]),
	ownersOnly: false,
	modOnly: false,
	permissions: false,

	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply();
		const response = await fetch(
			`https://weather.tsukumijima.net/api/forecast/city/${interaction.options.getString('place')}`,
		);
		const data = (await response.json()) as WeatherData;
		if (data.error) {
			return await interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setTitle('❌ 取得エラー')
						.setDescription('データエラーで取得できませんでした\n指定した場所が誤っている可能性があります')
						.setColor(Colors.Blue),
				],
			});
		}
		if (!response.ok) {
			return await interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setTitle('❌ 取得エラー')
						.setDescription('サーバーエラーで取得できませんでした')
						.setColor(Colors.Blue),
				],
			});
		}
		if (!data.forecasts || !Array.isArray(data.forecasts) || data.forecasts.length < 3) {
			return await interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setTitle('❌ データ不足')
						.setDescription('十分な予報データを取得できませんでした。場所を変えるか、時間を置いて再度お試しください。')
						.setColor(Colors.Blue),
				],
			});
		}
		const today = data.forecasts[0];
		const day2 = data.forecasts[1];
		const day3 = data.forecasts[2];
		if (!today || !day2 || !day3) {
			return await interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setTitle('❌ 取得エラー')
						.setDescription('予報データの取得中にエラーが発生しました。必要なデータが不足しています。')
						.setColor(Colors.Blue),
				],
			});
		}

		return await buttonPagination(
			[
				new EmbedBuilder()
					.setDescription(data.description.bodyText.replaceAll('　', '').replaceAll('\n\n', '\n'))
					.setTitle(`${today.dateLabel} の ${data.title}`)
					.setFooter({ text: `発表日時: ${data.publicTimeFormatted} / API By ${data.copyright.title}` })
					.addFields(
						{
							name: '天気',
							value: `${today.telop}${today.detail.weather ? `(${today.detail.weather})` : '(詳細不明)'}`,
						},
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
					.setColor(Colors.Blue),
				new EmbedBuilder()
					.setTitle(`${day2.dateLabel} の ${data.title}`)
					.setFooter({ text: `発表日時: ${data.publicTimeFormatted} / API By ${data.copyright.title}` })
					.addFields(
						{ name: '天気', value: `${day2.telop}${day2.detail.weather ? `(${day2.detail.weather})` : '(詳細不明)'}` },
						{ name: '風', value: `${day2.detail.wind ?? '--'}` },
						{ name: '波', value: `${day2.detail.wave ?? '--'}` },
						{
							name: '気温',
							value: `最低: ${day2.temperature.min.celsius ?? '--'} °C, 最高: ${day2.temperature.max.celsius ?? '--'} °C`,
						},
						{
							name: '降水確率',
							value: `0-6時: ${day2.chanceOfRain.T00_06}, 6-12時: ${day2.chanceOfRain.T06_12}, 12-18時: ${day2.chanceOfRain.T12_18}, 18-24時: ${day2.chanceOfRain.T18_24}`,
						},
					)
					.setColor(Colors.Blue),

				new EmbedBuilder()
					.setTitle(`${day3.dateLabel} の ${data.title}`)
					.setFooter({ text: `発表日時: ${data.publicTimeFormatted} / API By ${data.copyright.title}` })
					.addFields(
						{ name: '天気', value: `${day3.telop}${day3.detail.weather ? `(${day3.detail.weather})` : '(詳細不明)'}` },
						{ name: '風', value: `${day3.detail.wind ?? '--'}` },
						{ name: '波', value: `${day3.detail.wave ?? '--'}` },
						{
							name: '気温',
							value: `最低: ${day3.temperature.min.celsius ?? '--'} °C, 最高: ${day3.temperature.max.celsius ?? '--'} °C`,
						},
						{
							name: '降水確率',
							value: `0-6時: ${day3.chanceOfRain.T00_06}, 6-12時: ${day3.chanceOfRain.T06_12}, 12-18時: ${day3.chanceOfRain.T12_18}, 18-24時: ${day3.chanceOfRain.T18_24}`,
						},
					)
					.setColor(Colors.Blue),
			],
			interaction,
			{ defer: true },
		);
	},
};
