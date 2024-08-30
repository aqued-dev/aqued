import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { entities } from './entities/index.js';
import config from '../../../config.json' with { type: 'json' };

export const dataSource = new DataSource({
	type: 'mysql',
	host: config.mysql.host,
	username: config.mysql.user,
	password: config.mysql.password,
	port: 3306,
	database: 'aqued',
	synchronize: false, // for "develop"
	dropSchema: false, // for "develop"
	entities,
});
