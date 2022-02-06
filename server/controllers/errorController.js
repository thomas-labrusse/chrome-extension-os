// NOTE: Logic of the errorController is used in a global App MW

const sendErrorDev = (err, res) => {
	res.status(err.statusCode).json({
		status: err.status,
		error: err,
		message: err.message,
		stack: err.stack,
	})
}

const sendErrorProd = (err, res) => {
	if (err.isOperational) {
		res.status(err.statusCode).json({
			status: err.status,
			message: err.message,
		})
	} else {
		console.error('ERROR ', err)
		res.status(500).json({
			status: 'error',
			message: 'Something went very wrong',
		})
	}
}

export default (err, req, res, next) => {
	err.statusCode = err.statusCode || 500
	err.status = err.status || 'error'

	// NOTE: different error handling depending on mode (development or production)
	if (process.env.NODE_ENV === 'development') {
		sendErrorDev(err, res)
	} else if (process.env.NODE_ENV === 'production') {
		sendErrorProd(err, res)
	}
}
