<template>
  <div>
    <h1>WebSocket Data</h1>
    <ul>
      <li v-for="data in dataList" :key="data.id">
        {{ data }}
      </li>
    </ul>
    {{dataList}}
  </div>
</template>

<script>
export default {
  data() {
    return {
      dataList: [],
      socket: null,
    };
  },
  mounted() {
    // 创建 WebSocket 连接
    this.socket = new WebSocket("ws://localhost:8887/");

    // 处理 WebSocket 连接事件
    this.socket.addEventListener("open", (event) => {
      console.log("WebSocket connected");
    });

    this.socket.addEventListener("message", (event) => {
      // 将收到的数据添加到 dataList 数组中
      this.dataList = event.data.split(" ");

      // 触发事件，向父组件传递数据
      this.$emit("websocketData", this.dataList);
    });
  },
  beforeDestroy() {
    // 关闭 WebSocket 连接
    this.socket.close();
  },
};
</script>
