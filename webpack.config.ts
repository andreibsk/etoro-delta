import CopyWebpackPlugin from 'copy-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import path from 'path';
import WebpackShellPluginNext from 'webpack-shell-plugin-next';
import { ConfigurationFactory, WatchIgnorePlugin } from 'webpack';
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
            extensions: ['.tsx', '.ts', '.js', '.scss'],
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
                {
                    test: /\.scss$/,
                    include: path.resolve(__dirname, 'src/'),
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: {
                                importLoaders: 1,
                                sourceMap: devMode,
                                modules: {
                                    localIdentName: "[local]__[hash:base64:5]",
                                },
                                localsConvention: 'camelCaseOnly',
                            }
                        },
                        'sass-loader'
                    ]
                }
            ],
        },
        plugins: [
            new CopyWebpackPlugin([{ from: './src/manifest.json' }]),
            new MiniCssExtractPlugin(),
            new ForkTsCheckerWebpackPlugin({ async: false }),
            new WatchIgnorePlugin([/scss\.d\.ts$/]),
            ...(devMode
                ? [
                    new ExtensionReloader({ manifest: path.resolve(__dirname, "src", "manifest.json") }),
                    new WebpackShellPluginNext({
                        onBuildEnd: {
                            scripts: [ 'npx tsm -e default --watch --ignoreInitial src' ],
                            parallel: true
                        }
                    })]
                : [])
        ]
    };
};

export default config;
