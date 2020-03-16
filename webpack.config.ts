import CopyWebpackPlugin from 'copy-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import path from 'path';
import WebpackShellPluginNext from 'webpack-shell-plugin-next';
import ZipPlugin from 'zip-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import { ConfigurationFactory, WatchIgnorePlugin } from 'webpack';
const ExtensionReloader = require('webpack-extension-reloader');

const config: ConfigurationFactory = (_env, argv) => {
    const devMode = argv.mode === 'development';
    const watchMode = (<any>argv).watch === true;
    const devtool = devMode ? 'inline-source-map' : false;

    console.log("Development mode:", devMode);
    console.log("Watch mode:", watchMode);
    console.log("devtool:", devtool);

    return {
        devtool,
        stats: {
            children: false
        },
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
            new CopyWebpackPlugin([
                'src/manifest.json',
                { from: 'src/images/*.png', to: 'images/[name].[ext]' }
            ]),
            new MiniCssExtractPlugin(),
            new ForkTsCheckerWebpackPlugin({ async: false }),
            new WatchIgnorePlugin([/scss\.d\.ts$/]),
            ...(watchMode
                ? [
                    new ExtensionReloader({ manifest: path.resolve(__dirname, "src", "manifest.json") }),
                    new WebpackShellPluginNext({
                        onBuildEnd: {
                            scripts: ['npx tsm -e default --watch --ignoreInitial src'],
                            parallel: true
                        }
                    })]
                : [
                    new CleanWebpackPlugin(),
                    ...(devMode ? [] : [new ZipPlugin({filename: "dist.zip"})])
                ])
        ],
        performance: {
            maxEntrypointSize: 1048576, // 1MiB
            maxAssetSize: 1048576 // 1MiB
        }
    };
};

export default config;
