'use strict';
var __awaiter =
	(this && this.__awaiter) ||
	function (thisArg, _arguments, P, generator) {
		function adopt(value) {
			return value instanceof P
				? value
				: new P(function (resolve) {
						resolve(value);
					});
		}
		return new (P || (P = Promise))(function (resolve, reject) {
			function fulfilled(value) {
				try {
					step(generator.next(value));
				} catch (e) {
					reject(e);
				}
			}
			function rejected(value) {
				try {
					step(generator['throw'](value));
				} catch (e) {
					reject(e);
				}
			}
			function step(result) {
				result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
			}
			step((generator = generator.apply(thisArg, _arguments || [])).next());
		});
	};
var __generator =
	(this && this.__generator) ||
	function (thisArg, body) {
		var _ = {
				label: 0,
				sent: function () {
					if (t[0] & 1) throw t[1];
					return t[1];
				},
				trys: [],
				ops: [],
			},
			f,
			y,
			t,
			g = Object.create((typeof Iterator === 'function' ? Iterator : Object).prototype);
		return (
			(g.next = verb(0)),
			(g['throw'] = verb(1)),
			(g['return'] = verb(2)),
			typeof Symbol === 'function' &&
				(g[Symbol.iterator] = function () {
					return this;
				}),
			g
		);
		function verb(n) {
			return function (v) {
				return step([n, v]);
			};
		}
		function step(op) {
			if (f) throw new TypeError('Generator is already executing.');
			while ((g && ((g = 0), op[0] && (_ = 0)), _))
				try {
					if (
						((f = 1),
						y &&
							(t = op[0] & 2 ? y['return'] : op[0] ? y['throw'] || ((t = y['return']) && t.call(y), 0) : y.next) &&
							!(t = t.call(y, op[1])).done)
					)
						return t;
					if (((y = 0), t)) op = [op[0] & 2, t.value];
					switch (op[0]) {
						case 0:
						case 1:
							t = op;
							break;
						case 4:
							_.label++;
							return { value: op[1], done: false };
						case 5:
							_.label++;
							y = op[1];
							op = [0];
							continue;
						case 7:
							op = _.ops.pop();
							_.trys.pop();
							continue;
						default:
							if (!((t = _.trys), (t = t.length > 0 && t[t.length - 1])) && (op[0] === 6 || op[0] === 2)) {
								_ = 0;
								continue;
							}
							if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
								_.label = op[1];
								break;
							}
							if (op[0] === 6 && _.label < t[1]) {
								_.label = t[1];
								t = op;
								break;
							}
							if (t && _.label < t[2]) {
								_.label = t[2];
								_.ops.push(op);
								break;
							}
							if (t[2]) _.ops.pop();
							_.trys.pop();
							continue;
					}
					op = body.call(thisArg, _);
				} catch (e) {
					op = [6, e];
					y = 0;
				} finally {
					f = t = 0;
				}
			if (op[0] & 5) throw op[1];
			return { value: op[0] ? op[1] : void 0, done: true };
		}
	};
Object.defineProperty(exports, '__esModule', { value: true });
exports.MongoDB = void 0;
var mongoose_1 = require('mongoose');
var json_bigint_1 = require('json-bigint');
var node_crypto_1 = require('node:crypto');
var config_json_1 = require('../../config.json');
/**
 * The MongoDB class provides methods for manipulating the database.
 */
var MongoDB = /** @class */ (function () {
	/**
	 * Creates an instance of the MongoDB class.
	 * @param {MongoDBOptions} options - Options for configuring the MongoDB class.
	 */
	function MongoDB(options) {
		this.name = options.name;
		if (mongoose_1.default.connection.readyState === 0) {
			mongoose_1.default.connect(options.url).catch(function (error) {
				throw error;
			});
		}
		var dataSchema = new mongoose_1.default.Schema({
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
		this.model = mongoose_1.default.model(this.name, dataSchema);
	}
	/**
	 * Retrieves the value associated with the specified key.
	 * @param {string} key - The key to retrieve the value for.
	 * @returns {Promise<any>} - A Promise that resolves with the retrieved value or undefined if the key does not exist.
	 */
	MongoDB.prototype.get = function (key) {
		return __awaiter(this, void 0, void 0, function () {
			var document;
			return __generator(this, function (_a) {
				switch (_a.label) {
					case 0:
						return [4 /*yield*/, this.model.findOne({ key: key })];
					case 1:
						document = _a.sent();
						return [2 /*return*/, document ? (0, json_bigint_1.parse)(decrypt(document.value)) : undefined];
				}
			});
		});
	};
	/**
	 * Sets the value associated with the specified key.
	 * @param {string} key - The key to set the value for.
	 * @param {any} value - The value to be set.
	 * @returns {Promise<void>} - A Promise that resolves when the operation is complete.
	 */
	MongoDB.prototype.set = function (key, value) {
		return __awaiter(this, void 0, void 0, function () {
			var encryptedValue;
			return __generator(this, function (_a) {
				switch (_a.label) {
					case 0:
						encryptedValue = encrypt((0, json_bigint_1.stringify)(value));
						return [
							4 /*yield*/,
							this.model.findOneAndUpdate({ key: key }, { value: encryptedValue }, { upsert: true }),
						];
					case 1:
						_a.sent();
						return [2 /*return*/];
				}
			});
		});
	};
	/**
	 * Deletes the entry associated with the specified key.
	 * @param {string} key - The key to delete.
	 * @returns {Promise<void>} - A Promise that resolves when the operation is complete.
	 */
	MongoDB.prototype.delete = function (key) {
		return __awaiter(this, void 0, void 0, function () {
			return __generator(this, function (_a) {
				switch (_a.label) {
					case 0:
						return [4 /*yield*/, this.model.findOneAndDelete({ key: key })];
					case 1:
						_a.sent();
						return [2 /*return*/];
				}
			});
		});
	};
	/**
	 * Deletes all entries in the database.
	 * @returns {Promise<void>} - A Promise that resolves when the operation is complete.
	 */
	MongoDB.prototype.clear = function () {
		return __awaiter(this, void 0, void 0, function () {
			return __generator(this, function (_a) {
				switch (_a.label) {
					case 0:
						return [4 /*yield*/, this.model.deleteMany()];
					case 1:
						_a.sent();
						return [2 /*return*/];
				}
			});
		});
	};
	/**
	 * Retrieves all entries in the database as an array of key-value pairs.
	 * @returns {Promise<Array<{ key: string; value: any }>>} - A Promise that resolves with an array of key-value pairs.
	 */
	MongoDB.prototype.list = function () {
		return __awaiter(this, void 0, void 0, function () {
			var documents, data, _i, documents_1, document_1;
			return __generator(this, function (_a) {
				switch (_a.label) {
					case 0:
						return [4 /*yield*/, this.model.find()];
					case 1:
						documents = _a.sent();
						data = [];
						for (_i = 0, documents_1 = documents; _i < documents_1.length; _i++) {
							document_1 = documents_1[_i];
							data.push({ key: document_1.key, value: (0, json_bigint_1.parse)(decrypt(document_1.value)) });
						}
						return [2 /*return*/, data];
				}
			});
		});
	};
	/**
	 * Retrieves all keys in the database.
	 * @returns {Promise<string[]>} - A Promise that resolves with an array of keys.
	 */
	MongoDB.prototype.keys = function () {
		return __awaiter(this, void 0, void 0, function () {
			var data;
			return __generator(this, function (_a) {
				switch (_a.label) {
					case 0:
						return [4 /*yield*/, this.model.find()];
					case 1:
						data = _a.sent();
						return [
							2 /*return*/,
							data.map(function (value) {
								return value.key;
							}),
						];
				}
			});
		});
	};
	/**
	 * Retrieves all values in the database.
	 * @returns {Promise<any[]>} - A Promise that resolves with an array of values.
	 */
	MongoDB.prototype.values = function () {
		return __awaiter(this, void 0, void 0, function () {
			var data;
			return __generator(this, function (_a) {
				switch (_a.label) {
					case 0:
						return [4 /*yield*/, this.model.find()];
					case 1:
						data = _a.sent();
						return [
							2 /*return*/,
							data.map(function (value) {
								return (0, json_bigint_1.parse)(decrypt(value.value));
							}),
						];
				}
			});
		});
	};
	/**
	 * Retrieves the number of entries in the database.
	 * @returns {Promise<number>} - A Promise that resolves with the number of entries in the database.
	 */
	MongoDB.prototype.size = function () {
		return __awaiter(this, void 0, void 0, function () {
			return __generator(this, function (_a) {
				return [2 /*return*/, this.model.countDocuments()];
			});
		});
	};
	return MongoDB;
})();
exports.MongoDB = MongoDB;
/**
 * The secret key used for encryption and decryption.
 */
var key = Buffer.from(config_json_1.default.key, 'hex');
/**
 * Encrypts a text using the AES-256-CBC encryption algorithm.
 * @param {string} text - The text to encrypt.
 * @returns {string} - The encrypted text.
 */
function encrypt(text) {
	var iv = (0, node_crypto_1.randomBytes)(16);
	var cipher = (0, node_crypto_1.createCipheriv)('aes-256-cbc', key, iv);
	var encrypted = cipher.update(text, 'utf8', 'hex');
	encrypted += cipher.final('hex');
	return iv.toString('hex') + encrypted;
}
/**
 * Decrypts an encrypted string using the AES-256-CBC encryption algorithm.
 * @param {string} encrypted - The encrypted string.
 * @returns {string} - The decrypted text.
 */
function decrypt(encrypted) {
	var iv = Buffer.from(encrypted.slice(0, 32), 'hex');
	var decipher = (0, node_crypto_1.createDecipheriv)('aes-256-cbc', key, iv);
	var decrypted = decipher.update(encrypted.slice(32), 'hex', 'utf8');
	decrypted += decipher.final('utf8');
	return decrypted;
}
