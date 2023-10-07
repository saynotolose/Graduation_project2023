<template>
  <div>
    <div id="map" style="height: 700px; width: 100%"></div>
    <div style="position: fixed; top: 100px; left: 200px">
      <el-button @click="openAnimation()">打开动画</el-button>
      <el-button @click="closeAnimation()">关闭动画</el-button>
    </div>
 
    <LjOlCarRoute
      ref="ref_LjOlCarRoute"
      :map="map"
      :coordinates="coordinates_route"
      :speed="0.1"
      v-if="showAnimation"
    ></LjOlCarRoute>
  </div>
</template>
 
<script>
import "ol/ol.css";
import { Map, View } from "ol";
import { OSM } from "ol/source";
import { Tile as TileLayer } from "ol/layer";
import LjOlCarRoute from "./TestMove.vue";
import axios from 'axios';
 
export default {
  components: { LjOlCarRoute },
  data() {
    return {
      map: {},
      showAnimation: false,
      coordinates_route: [
        [104.2979180563, 30.528298024],
        [104.2987389704, 30.527798338],
        [104.2974397847, 30.5265062907],
        [104.296943667091881, 30.52468992916009],
      ],
    };
  },
  created() {},
  mounted() {
    
    this.initMap();
  },
  computed: {},
  methods: {

    initMap() {
      console.log(this.coordinates_route)
      this.map = new Map({
        target: "map",
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
        ],
        view: new View({
          projection: "EPSG:4326",
          center: [104.2974397847, 30.5265062907],
          zoom: 4,
        }),
      });
    },
    openAnimation() {
      this.showAnimation = true;
      
    },
    closeAnimation() {
      this.$refs.ref_LjOlCarRoute.removeLayer();
      this.showAnimation = false;
    },
  },
};
</script>
<style scoped>
#map {
    width: 100%;
    height: 700px;
    position: relative;
}
</style>