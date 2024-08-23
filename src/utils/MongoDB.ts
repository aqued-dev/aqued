import mongoose, { Document } from 'mongoose';
import { parse, stringify } from 'json-bigint';
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
// @ts-expect-error file not founc
import config from '../../config.json' with { type: 'json' };

/**
 * Options for configuring the MongoDB class.
 */
export interface MongoDBOptions {
	/**
	 * The MongoDB connection URL.
	 */
	url: string;
	/**
	 * The name of the MongoDB collection.
	 */
	name: string;
}

/**
 * Document interface representing a data entry in the MongoDB collection.
 */
export interface DataDocument extends Document {
	/**
	 * The key field in the document.
	 */
	key: string;
	/**
	 * The value field in the document.
	 */
	value: string;
}

/**
 * The MongoDB class provides methods for manipulating the database.
 */
export class MongoDB {
	public name: string;
	public model: mongoose.Model<DataDocument>;

	/**
	 * Creates an instance of the MongoDB class.
	 * @param {MongoDBOptions} options - Options for configuring the MongoDB class.
	 */
	constructor(options: MongoDBOptions) {
		this.name = options.name;

		if (mongoose.connection.readyState === 0) {
			mongoose.connect(options.url).catch((error) => {
				throw error;
			});
		}

		const dataSchema = new mongoose.Schema<DataDocument>({
			key: {
				type: String,
				required: true,
				unique: true,
			},
			value: {
				type: String,
				required: true,
			},
		});

		this.model = mongoose.model<DataDocument>(this.name, dataSchema);
	}

	/**
	 * Retrieves the value associated with the specified key.
	 * @param {string} key - The key to retrieve the value for.
	 * @returns {Promise<any>} - A Promise that resolves with the retrieved value or undefined if the key does not exist.
	 */
	async get(key: string): Promise<any> {
		const document = await this.model.findOne({ key });
		return document ? parse(decrypt(document.value)) : undefined;
	}

	/**
	 * Sets the value associated with the specified key.
	 * @param {string} key - The key to set the value for.
	 * @param {any} value - The value to be set.
	 * @returns {Promise<void>} - A Promise that resolves when the operation is complete.
	 */
	async set(key: string, value: any): Promise<void> {
		const encryptedValue = encrypt(stringify(value));
		await this.model.findOneAndUpdate({ key }, { value: encryptedValue }, { upsert: true });
	}

	/**
	 * Deletes the entry associated with the specified key.
	 * @param {string} key - The key to delete.
	 * @returns {Promise<void>} - A Promise that resolves when the operation is complete.
	 */
	async delete(key: string): Promise<void> {
		await this.model.findOneAndDelete({ key });
	}

	/**
	 * Deletes all entries in the database.
	 * @returns {Promise<void>} - A Promise that resolves when the operation is complete.
	 */
	async clear(): Promise<void> {
		await this.model.deleteMany();
	}

	/**
	 * Retrieves all entries in the database as an array of key-value pairs.
	 * @returns {Promise<Array<{ key: string; value: any }>>} - A Promise that resolves with an array of key-value pairs.
	 */
	async list(): Promise<Array<{ key: string; value: any }>> {
		const documents = await this.model.find();
		const data: Array<{ key: string; value: any }> = [];
		for (const document of documents) {
			data.push({ key: document.key, value: parse(decrypt(document.value)) });
		}
		return data;
	}

	/**
	 * Retrieves all keys in the database.
	 * @returns {Promise<string[]>} - A Promise that resolves with an array of keys.
	 */
	async keys(): Promise<string[]> {
		const data = await this.model.find();
		return data.map((value) => value.key);
	}

	/**
	 * Retrieves all values in the database.
	 * @returns {Promise<any[]>} - A Promise that resolves with an array of values.
	 */
	async values(): Promise<any[]> {
		const data = await this.model.find();
		return data.map((value) => parse(decrypt(value.value)));
	}

	/**
	 * Retrieves the number of entries in the database.
	 * @returns {Promise<number>} - A Promise that resolves with the number of entries in the database.
	 */
	async size(): Promise<number> {
		return this.model.countDocuments();
	}
}

/**
 * The secret key used for encryption and decryption.
 */
const key = Buffer.from(config.key, 'hex');
/**
 * Encrypts a text using the AES-256-CBC encryption algorithm.
 * @param {string} text - The text to encrypt.
 * @returns {string} - The encrypted text.
 */
function encrypt(text: string): string {
	const iv = randomBytes(16);
	const cipher = createCipheriv('aes-256-cbc', key, iv);
	let encrypted = cipher.update(text, 'utf8', 'hex');
	encrypted += cipher.final('hex');
	return iv.toString('hex') + encrypted;
}

/**
 * Decrypts an encrypted string using the AES-256-CBC encryption algorithm.
 * @param {string} encrypted - The encrypted string.
 * @returns {string} - The decrypted text.
 */
function decrypt(encrypted: string): string {
	const iv = Buffer.from(encrypted.slice(0, 32), 'hex');
	const decipher = createDecipheriv('aes-256-cbc', key, iv);
	let decrypted = decipher.update(encrypted.slice(32), 'hex', 'utf8');
	decrypted += decipher.final('utf8');
	return decrypted;
}
