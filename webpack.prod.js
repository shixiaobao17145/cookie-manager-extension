module.exports = {
	devtool: 'inline-sourcemap',
	entry: {
		manager:"./manager.js"
	},
	output: {
		path: __dirname,
		filename: "[name].bundle.js"
	},
	module: {
		loaders: [
			{ test: /\.css$/, loader: "style-loader!css-loader" },
            {
                test: /.js?$/, loader: 'babel-loader', exclude: /node_modules/,
                query: {
                    presets: ['es2015', 'react', 'stage-0'],
                    //plugins: ['transform-decorators-legacy']
                }
            }
		]
	}
};
