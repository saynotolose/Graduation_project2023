const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false    //关闭检查不管用
})
module.exports = {
  devServer: {
    port: 8081, // 此处修改你想要的端口号
    https: true,
    proxy:'https://localhost:8443'
  }
}
