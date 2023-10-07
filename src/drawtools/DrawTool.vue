<template>
<!-- 这只是个测试，真正用到的是LjDraw组件 -->
  <div class="map-container">
    <div id="map"></div>
    <div class="lj-draw-container">
      <LjDraw :map="map"></LjDraw>
    </div>
  </div>
</template>

<script>
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import { Vector as VectorLayer } from "ol/layer";
import { OSM, Vector as VectorSource } from "ol/source";
import Draw from "ol/interaction/Draw";
import { Fill, Stroke, Style, Text, Circle } from "ol/style";
import LjDraw from "./LjDraw.vue";
export default {
  
  components: { LjDraw },

  data() {
    return {
      map: {},
    };
  },
 
  beforeMount() {
    // _isMounted是当前实例mouned()是否执行 此时为false
    window.parentMounted = this._isMounted;
  },
  mounted() {
    //父组件中初始化地图对象map
    this.initMap();
    // _isMounted是当前实例mouned()是否执行 此时为true
    window.parentMounted = this._isMounted;
  },
  methods: {
    // 初始化地图
    initMap() {
      this.map = new Map({
        target: "map",
        layers: [
          new TileLayer({
            source: new OSM(),
            visible: true,
            name: "OSM",
          }),
        ],
        view: new View({
          projection: "EPSG:4326",
          center: [115, 39],
          zoom: 4,
        }),
      });
    },
  },
  watch: {},
};
</script>

<style>
.map-container {
  height: 100vh;
  width: 100vw;
}

#map {
  height: 100%;
  width: 100%;
}

.lj-draw-container {
  position: fixed;
  top: 50px;
  left: 490px;
  z-index: 999;
}
</style>