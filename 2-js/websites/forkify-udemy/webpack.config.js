const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
	entry: ["./src/js/index.js"],
	output: {
		path: path.resolve(__dirname, "dist/js"),
		filename: "bundle.js"
	},
	devServer: {
		contentBase: path.join(__dirname, "dist")
	},
	plugins: [
		new HtmlWebpackPlugin({
			filename: "index.html",
			template: "./src/index.html"
		})
	],
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader"
				}
			}
		]
	}
};
