import "reflect-metadata";
import { DataSource } from "typeorm";
import { entities } from "./entities/index.js";

export const dataSource = new DataSource({
  type: "mysql", 
  host: "db",
  username: "user",
  password: "password",
  port: 3306,
  database: "aqued",
  synchronize: true, // for "develop"
  dropSchema: true,  // for "develop" 
  entities,
});
