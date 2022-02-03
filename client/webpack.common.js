const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')
const HtmlPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
	entry: {
		popup: path.resolve('src/popup/popup.jsx'),
		options: path.resolve('src/options/options.jsx'),
		background: path.resolve('src/background/background.jsx'),
		contentScript: path.resolve('src/contentScript/contentScript.jsx'),
	},
	module: {
		rules: [
			{
				test: /\.js$|jsx/,
				use: 'babel-loader',
				exclude: /node_modules/,
			},
			{
				test: /\.css$/i,
				use: ['style-loader', 'css-loader'],
			},
			{
				test: /\.(jpg|jpeg|png|woff|woff2|eot|ttf|svg)$/,
				type: 'asset/resource',
			},
		],
	},
	resolve: {
		extensions: ['.jsx', '.js'],
	},
	plugins: [
		new CleanWebpackPlugin({
			cleanStaleWebpackAssets: false,
		}),
		new CopyPlugin({
			patterns: [
				{
					from: path.resolve('src/static'),
					to: path.resolve('dist'),
				},
			],
		}),
		...getHtmlPlugins(['popup', 'options']),
	],
	output: {
		filename: '[name].js',
		path: path.resolve('dist'),
	},
	optimization: {
		splitChunks: {
			chunks(chunk) {
				return chunk.name !== 'contentScript' && chunk.name !== 'background'
			},
		},
	},
}

function getHtmlPlugins(chunks) {
	return chunks.map(
		(chunk) =>
			new HtmlPlugin({
				title: 'React Extension',
				filename: `${chunk}.html`,
				chunks: [chunk],
			})
	)
}
