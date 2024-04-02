import { RESTPostAPIChannelMessageJSONBody, Client, Routes, EmbedBuilder, Colors } from 'discord.js';
import { WebSocket } from 'ws';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export default async function (client: Client) {
	const ws = new WebSocket('wss://api.p2pquake.net/v2/ws');
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	ws.on('message', async (wsdata) => {
		const data: EQData = JSON.parse(wsdata.toString());
		const channels = await prisma.earthQuakeAlert.findMany();
		if (data.code === 551) {
			const maxScale = data.earthquake.maxScale
				.toString()
				.replace(
					/10|20|30|40|70|-1/,
					(m) => ({ '10': '1', '20': '2', '30': '3', '40': '4', '70': '7', '-1': '不明' })[m],
				)
				.replace(/45/, '5弱')
				.replace(/50/, '5強')
				.replace(/55/, '6弱')
				.replace(/60/, '6強');
			const time = data.earthquake.time;
			const depth =
				data.earthquake.hypocenter.depth === -1
					? '不明'
					: data.earthquake.hypocenter.depth.toString().replace('0', 'ごく浅い');
			const magnitude = data.earthquake.hypocenter.magnitude === -1 ? '不明' : data.earthquake.hypocenter.magnitude;
			const hypocenter = data.earthquake.hypocenter.name ?? '不明';
			const domesticTsunami = data.earthquake.domesticTsunami
				.replace('None', 'この地震による津波の心配はありません。')
				.replace('Unknown', 'この地震による津波は不明です。')
				.replace('Checking', 'この地震による津波は調査中です。')
				.replace('NonEffective', '若干の海面変動が予想されます・')
				.replace('Watch', '津波注意報が発令されています。今後の情報に注意してください。')
				.replace('Warning', '津波予報が発令されています。今後の情報に注意してください。');
			for await (const channel of channels) {
				const message: RESTPostAPIChannelMessageJSONBody = {
					embeds: [
						new EmbedBuilder()
							.setTitle('地震情報')
							.setDescription(
								`震度: ${maxScale}\n時間: ${time}\n深さ: ${depth}\nマグニチュード: ${magnitude}\n震源: ${hypocenter}\n津波: ${domesticTsunami}`,
							)
							.setColor(Colors.Red)
							.setTimestamp(new Date())
							.toJSON(),
					],
				};
				await client.rest.post(Routes.channelMessages(channel.channelId), { body: message });
			}
		}
		if (data.code === 554) {
			for await (const channel of channels) {
				const message: RESTPostAPIChannelMessageJSONBody = {
					embeds: [
						new EmbedBuilder()
							.setTitle('緊急地震速報')
							.setDescription(`緊急地震速報です。強い揺れに警戒してください。`)
							.setColor(Colors.DarkRed)
							.setTimestamp(new Date())
							.toJSON(),
					],
				};
				await client.rest.post(Routes.channelMessages(channel.channelId), { body: message });
			}
		}
	});
}
export type EQData =
	| EarthquakeInformation
	| TsunamiForecast
	| EarthquakeEarlyWarningAnnouncementDetection
	| Areapeers
	| EarthquakeEarlyWarning
	| EarthquakeDetectionInformation;
export interface EarthquakeInformation {
	id: string;
	time: string;
	code: 551;
	issue: { source: string; time: string; correct: string; type: string };
	earthquake: {
		domesticTsunami: string;
		foreignTsunami: string;
		hypocenter: { depth: number; latitude: number; longitude: number; magnitude: number; name: string };
		maxScale: number;
		time: string;
		points: { addr: string; isArea: boolean; pref: string; scale: number }[];
	};
}

export interface TsunamiForecast {
	id: string;
	time: string;
	code: 552;
	cancelled: boolean;
	issue: { source: string; time: string; type: string };
	areas: {
		grade: string;
		immediate: boolean;
		name: string;
		firstHeight: { condition: string };
		maxHeight: { description: string; value: number };
	};
}
export interface EarthquakeEarlyWarningAnnouncementDetection {
	id: string;
	time: string;
	code: 554;
	type: string;
}
export interface Areapeers {
	id: string;
	time: string;
	code: 555;
	areas: {
		id: number;
		peer: number;
	}[];
}
export interface EarthquakeEarlyWarning {
	id: string;
	time: string;
	code: 556;
	cancelled: boolean;
	earthquake: {
		condition: string;
		hypocenter: {
			name: string;
			reduceName: string;
			latitude: number;
			longitude: number;
			depth: number;
			magnitude: number;
		};
		originTime: string;
		arrivalTime: string;
	};
	issue: {
		time: string;
		eventId: string;
		serial: string;
	};
	areas: {
		pref: string;
		name: string;
		scaleFrom: number;
		scaleTo: number;
		kindCode: string;
		arrivalTime: unknown;
	}[];
}
export interface EarthquakeDetectionInformation {
	id: string;
	time: string;
	code: 561;
	area: number;
}