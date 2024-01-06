import util from 'node:util'
import json2mongo from '@tadashi/json2mongo'
import * as paging from '@tadashi/mongo-cursor-pagination'
import * as debug from '../lib/debug.js'

/**
 * A mixin providing pagination functionality for MongoDB queries.
 *
 * @param {class} Base - The base class to extend with pagination functionality.
 * @returns {class} The extended class with pagination functionality.
 */
export const pageMixin = Base => class extends Base {
	/**
	 * Paginates through MongoDB documents based on the provided arguments.
	 *
	 * @param {Object} args - Pagination arguments.
	 * @param {Object} [args.query={}] - The MongoDB query.
	 * @param {Object} [args.projection={}] - The MongoDB projection.
	 * @param {number} [args.limit=10] - The number of documents to return per page.
	 * @param {string} [args.previous] - The cursor for the previous page.
	 * @param {string} [args.next] - The cursor for the next page.
	 * @param {string} [args.paginatedField='created'] - The field used for pagination.
	 * @param {boolean} [args.sortAscending=false] - Whether to sort in ascending order.
	 * @returns {Promise<Object>} A promise that resolves to the paginated result.
	 */
	async page(args) {
		let {
			query = {},
			projection = {},
			limit = 10,
			previous,
			next,
			paginatedField = 'created',
			sortAscending = false,
		} = args

		query = json2mongo(query)

		const collection = await this.collection()
		const res = await paging.find(collection, {
			query,
			projection,
			paginatedField,
			limit,
			next,
			previous,
			sortAscending,
		})

		debug.log('mixin | page', util.inspect({query, projection, paginatedField, limit, next, previous, sortAscending}, false, undefined, true))
		debug.log('mixin | page | response', util.inspect(res, false, undefined, true))

		return res
	}
}

/**
 * A mixin providing read functionality for MongoDB documents.
 *
 * @param {class} Base - The base class to extend with read functionality.
 * @returns {class} The extended class with read functionality.
 */
export const readMixin = Base => class extends Base {
	/**
	 * Reads documents from the MongoDB collection based on the provided properties.
	 *
	 * @param {Object} [props={}] - The properties to match when reading documents.
	 * @returns {Promise<Array>} A promise that resolves to an array of matching documents.
	 */
	async _read(props = {}) {
		const collection = await this.collection()
		const $and = []
		for (const [k, v] of Object.entries(props)) {
			$and.push({[k]: v})
		}
		return collection.find({$and}).toArray()
	}
}

/**
 * A mixin providing delete functionality for MongoDB documents.
 *
 * @param {class} Base - The base class to extend with delete functionality.
 * @returns {class} The extended class with delete functionality.
 */
export const deleteMixin = Base => class extends Base {	/**
	* Deletes a document from the MongoDB collection based on the provided ID and properties.
	*
	* @param {string} _id - The ID of the document to delete.
	* @param {Object} [props={}] - The properties to match when deleting the document.
	* @returns {Promise<Object>} A promise that resolves to the result of the delete operation.
	*/
	async _delete(_id, props = {}) {
		const collection = await this.collection()
		const $and = [{_id}]
		for (const [k, v] of Object.entries(props)) {
			$and.push({[k]: v})
		}
		return collection.deleteOne({
			$and,
		}, {
			writeConcern: {
				w: 1,
			},
		})
	}
}
