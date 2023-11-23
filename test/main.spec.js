/* eslint-disable unicorn/no-process-exit */
import process from 'node:process'
import {describe, it, after} from 'node:test'
import assert from 'node:assert/strict'
import {MongoMemoryServer} from 'mongodb-memory-server'
import Mongo from '@tadashi/mongo-singleton'

import {talk} from './fixture/chat.js'
import Message from './fixture/message.js'

const mongod = await MongoMemoryServer.create({
	binary: {
		version: '7.0.0',
		downloadDir: 'test/helper/.cache/mongodb-memory-server/mongodb-binaries',
	},
	instance: {
		storageEngine: 'wiredTiger',
	},
})

describe('main', async () => {
	const mongoConn = await mongod.getUri()
	await Mongo.conn({url: mongoConn})

	const collection = 'chat'
	const db = 'unit_test'
	const repo = new Message(collection, db)

	after(async () => {
		await mongod.stop()
		process.exit()
	})

	it('create', async () => {
		const [one, ...more] = talk

		const resMore = await repo.create(more)
		assert.equal(resMore.insertedCount, 6)

		const resOne = await repo.create(one)
		assert.ok(resOne.acknowledged)
	})

	it('page, read and delete', async () => {
		const page = await repo.page({
			query: {},
			projection: {
				_id: 1,
				created: 1,
				from: 1,
				modified: 1,
				text: 1,
				to: 1,
				type: 1,
			},
			limit: 3,
		})
		assert.equal(page.results.length, 3)

		const $in = [page.results[0]._id, page.results[1]._id]
		const read = await repo._read({_id: {$in}})
		assert.equal(read.length, 2)

		const rm = await repo._delete(read[0]._id, {type: 'message'})
		assert.equal(rm.deletedCount, 1)
	})
})
