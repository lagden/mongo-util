import Mongo from '@tadashi/mongo-singleton'

/**
 * Class representing a generic CRUD (Create, Read, Update, Delete) operations handler for MongoDB.
 */
class Crud {
	/**
	 * Retrieves a MongoDB collection instance based on the provided collection name and database name.
	 *
	 * @private
	 * @static
	 * @param {string} collectionName - The name of the MongoDB collection.
	 * @param {string} dbName - The name of the MongoDB database.
	 * @returns {Promise<Object>} A promise that resolves to the MongoDB collection instance.
	 */
	static #collection(collectionName, dbName) {
		return Mongo.collection(collectionName, {dbName})
	}

	/**
	 * Creates a new Crud instance.
	 *
	 * @param {string} collectionName - The name of the MongoDB collection.
	 * @param {string} dbName - The name of the MongoDB database.
	 */
	constructor(collectionName, dbName) {
		this.collectionName = collectionName
		this.dbName = dbName
		this.indexes = false
	}

	/**
	 * Creates indexes on the MongoDB collection based on the provided index specifications.
	 *
	 * @param {Array} idxs - An array of index specifications.
	 * @returns {Promise<Object>} A promise that resolves to the MongoDB collection instance with indexes created.
	 */
	async createIndexes(idxs) {
		const collection = await Crud.#collection(this.collectionName, this.dbName)
		if (this.indexes === false) {
			await collection.createIndexes(idxs, {writeConcern: {w: 1}})
			this.indexes = true
		}
		return collection
	}

	/**
	 * Inserts one or multiple documents into the MongoDB collection.
	 *
	 * @param {Object|Array} data - The data to be inserted. Can be a single document or an array of documents.
	 * @returns {Promise<Object>} A promise that resolves to the result of the insertion operation.
	 */
	async create(data) {
		const method = Array.isArray(data) ? 'insertMany' : 'insertOne'
		const collection = await this.collection()
		return collection[method](data, {writeConcern: {w: 1}})
	}
}

export default Crud
