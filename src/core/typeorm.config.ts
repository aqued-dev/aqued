import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from '../config/config.js';
import { entities } from '../database/entities/index.js';

export const dataSource = new DataSource({
	type: 'mysql',
	host: config.mysql.host,
	username: config.mysql.user,
	password: config.mysql.password,
	port: config.mysql.port,
	database: 'aqued',
	synchronize: !config.bot.stable,
	dropSchema: false, // for "develop"
	entities: entities,
	migrations: ["migrations/*.ts"] 
});
