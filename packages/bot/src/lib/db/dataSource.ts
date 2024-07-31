import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { entities } from './entities/index.js';
import { Config } from '../bot/config.js';

export const dataSource = new DataSource({
	type: 'mysql',
	host: Config.dbHost,
	username: Config.dbUserName,
	password: Config.dbPassword,
	port: 3306,
	database: 'aqued',
	synchronize: true, // for "develop"
	dropSchema: true, // for "develop"
	entities,
});
