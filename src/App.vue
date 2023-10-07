<template>
  <div id="app">
    <!-- <img alt="Vue logo" src="./assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/> -->
    <!-- <first-move/> -->
    <router-view></router-view>  
    <!-- router的时候不用引入组件 -->

  </div>
</template>

<script>
//import MapView from './components/MapView.vue'

//import FirstMove from './test/FirstMove.vue'
//import ImportShp from './test/ImportShp.vue'
//import WebSocket from './test/WebSocket.vue'

export default {
  name: 'App',
  components: {
    //MapView
    //WebSocket
    //FirstMove
  }
}
</script>

<style>

</style>
