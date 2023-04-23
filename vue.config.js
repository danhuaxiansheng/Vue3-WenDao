const { defineConfig } = require("@vue/cli-service");

const path = require("path");
function resolve(dir) {
  return path.join(__dirname, dir);
}
const name = "UIStudio Vue Admin";
const port = process.env.port || process.env.npm_config_port || 4431;

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: "/",
  outputDir: "dist",
  assetsDir: "static",
  productionSourceMap: false,
  runtimeCompiler: true, //支持templit 编译
  devServer: {
    port: port,
    open: false,
  },
  css: {
    sourceMap: true,
    loaderOptions: {
      scss: {
        additionalData: '@import "@STYLES/Common/sass/index.scss";',
      },
    },
  },
  configureWebpack: {
    name: name,
    devtool: "source-map",
    resolve: {
      alias: {
        "@": resolve("src"),
        "@AST": resolve("src/assets"),
        "@STYLES": resolve("src/styles"),
        "@API": resolve("src/api"),
        "@LIB": resolve("src/common-scripts/lib"),
        "@MIXINS": resolve("src/common-scripts/mixins"),
        "@PAGE": resolve("src/common-scripts/page"),
        "@TOOLS": resolve("src/common-scripts/tools"),
        "@FLT": resolve("src/filters"),
        "@ROUTER": resolve("src/router"),
        "@COMP": resolve("src/components"),
        "@Public": resolve("public"),
      },
    },
    // 警告 webpack 的性能提示
    performance: {
      hints: "warning",
      // 入口起点的最大体积
      maxEntrypointSize: 50000000,
      // 生成文件的最大体积
      maxAssetSize: 30000000,
      // 只给出 JS 文件的性能提示
      assetFilter: function (assetFileName) {
        return assetFileName.endsWith(".js");
      },
    },
    // 配置打包文件命名规则
    output: {
      filename: "static/js/[name][hash].js",
      chunkFilename: "static/js/[id]-[hash:6].js",
    },
  },
  // chainWebpack(config) {
  // config.module
  //   .rule("vue")
  //   .use("vue-loader")
  //   .loader("vue-loader")
  //   .tap((options) => {
  //     options.compilerOptions.preserveWhitespace = true;
  //     return options;
  //   })
  //   .end();
  // config.when(process.env.NODE_ENV !== "development", (config) => {});
  // },
});
