import {
	Crud,
	pageMixin,
	readMixin,
	deleteMixin,
} from '../../src/main.js'

export default class Message extends pageMixin(readMixin(deleteMixin(Crud))) {
	collection() {
		return this.createIndexes([
			{
				key: {
					date: 1,
				},
				unique: false,
				name: 'date_idx',
			}
		])
	}
}
