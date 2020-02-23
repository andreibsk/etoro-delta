import CopyWebpackPlugin from 'copy-webpack-plugin';
import * as path from 'path';
import { ConfigurationFactory } from 'webpack';
const ExtensionReloader = require('webpack-extension-reloader');

const config: ConfigurationFactory = (_env, argv) => {
    const devMode = argv.mode === 'development';
    const devtool = devMode ? 'inline-source-map' : false;

    console.log("Development mode:", devMode);
    console.log("devtool:", devtool);

    return {
        devtool,
        entry:
        {
            main: "./src/main.ts",
            background: "./src/background.ts",
        },
        output: {
            path: path.resolve(__dirname, 'dist/')
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    include: path.resolve(__dirname, 'src/')
                },
            ],
        },
        plugins: [
            new CopyWebpackPlugin([{ from: './src/manifest.json' }]),
            ...(devMode
                ? [new ExtensionReloader({ manifest: path.resolve(__dirname, "src", "manifest.json") })]
                : [])
        ]
    };
};

export default config;
