import CopyWebpackPlugin from "copy-webpack-plugin";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import path from "path";
import WebpackShellPluginNext from "webpack-shell-plugin-next";
import ZipPlugin from "zip-webpack-plugin";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import { Configuration, WatchIgnorePlugin, WebpackPluginInstance } from "webpack";

const config = (_env: any, argv: any): Configuration => {
    const devMode = argv.mode === "development";
    const watchMode = argv.watch === true;
    const devtool = devMode ? "inline-source-map" : false;

    console.log("Development mode:", devMode);
    console.log("Watch mode:", watchMode);
    console.log("devtool:", devtool);

    return {
        devtool,
        stats: {
            colors: true
        },
        entry:
        {
            main: "./src/main.ts",
            background: "./src/background.ts",
        },
        output: {
            path: path.resolve(__dirname, "dist/")
        },
        resolve: {
            extensions: [".tsx", ".ts", ".js", ".scss"],
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    include: path.resolve(__dirname, "src/"),
                    use: [
                        {
                            loader: "ts-loader",
                            options: {
                                transpileOnly: true
                            }
                        }
                    ]
                },
                {
                    test: /\.scss$/,
                    include: path.resolve(__dirname, "src/"),
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: "css-loader",
                            options: {
                                importLoaders: 1,
                                sourceMap: devMode,
                                modules: {
                                    localIdentName: "[local]--[hash:base64:5]",
                                    exportLocalsConvention: "camelCaseOnly"
                                }
                            }
                        },
                        "sass-loader"
                    ]
                }
            ],
        },
        plugins: [
            new CopyWebpackPlugin({
                patterns: [
                    "src/manifest.json",
                    { from: "src/images/*.png", to: "images/[name].[ext]" }
                ]
            }),
            new MiniCssExtractPlugin(),
            new ForkTsCheckerWebpackPlugin({ async: false }),
            new WatchIgnorePlugin({
                paths: [/scss\.d\.ts$/]
            }),
            ...(watchMode
                ? [
                    new WebpackShellPluginNext({
                        onBuildEnd: {
                            scripts: ["npx tsm -e default --watch --ignoreInitial src"],
                            parallel: true
                        }
                    })
                ]
                : [
                    new CleanWebpackPlugin(),
                    ...(devMode ? [] : [(new ZipPlugin({ filename: "dist.zip" }) as unknown as WebpackPluginInstance)])
                ])
        ],
        performance: {
            maxEntrypointSize: devMode ? 10_485_760 : 1_048_576,
            maxAssetSize: devMode ? 10_485_760 : 1_048_576
        }
    };
};

export default config;
