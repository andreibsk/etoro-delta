import CopyWebpackPlugin from 'copy-webpack-plugin';
import * as path from 'path';
import { ConfigurationFactory } from 'webpack';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
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
                    include: path.resolve(__dirname, 'src/'),
                    use: [
                        {
                            loader: 'ts-loader',
                            options: {
                                transpileOnly: true
                            }
                        }
                    ]
                },
            ],
        },
        plugins: [
            new CopyWebpackPlugin([{ from: './src/manifest.json' }]),
            new ForkTsCheckerWebpackPlugin(),
            ...(devMode
                ? [new ExtensionReloader({ manifest: path.resolve(__dirname, "src", "manifest.json") })]
                : [])
        ]
    };
};

export default config;
