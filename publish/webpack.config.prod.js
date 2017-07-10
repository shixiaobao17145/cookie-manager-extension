var path = require('path');
module.exports = {
	entry: {
		manager:"./manager.entry.js"
	},
	output: {
		path:path.resolve(__dirname, 'build'),
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
