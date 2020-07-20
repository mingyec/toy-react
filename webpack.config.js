const path = require("path");
module.exports = {
    mode: 'development',
    entry: {
        main: './main.js'
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "main.js",
    },
    module: {
        rules: [{
            test: /\.js$/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env'],
                    plugins: [[
                        '@babel/plugin-transform-react-jsx',
                        {
                            pragma: 'ToyReact.createElement'
                        }
                    ]]
                }
            }
        }]
    },
    optimization: {
        minimize: false,
    },
}