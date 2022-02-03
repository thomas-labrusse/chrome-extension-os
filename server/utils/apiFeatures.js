class APIFeatures {
	// NOTE: query --> query
	// NOTE: queryString --> req.query (params)
	constructor(query, queryString) {
		this.query = query
		this.queryString = queryString
	}

	sort() {
		if (this.queryString.sort) {
			const sortBy = this.queryString.sort.split(',').join(' ')
			this.query = this.query.sort(sortBy)
		} else {
			this.query = this.query.sort('name')
		}

		return this
	}

	fields() {
		if (this.queryString.fields) {
			const fields = this.queryString.fields.split(',').join(' ')
			console.log('fields', fields)
			this.query = this.query.select(fields)
		} else {
			this.query = this.query.select('-__v')
		}

		return this
	}
}

export default APIFeatures
