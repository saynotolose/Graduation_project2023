 
<template>
  <div>
    <div style="position: fixed; top: 200px; left: 200px">
      <el-button @click="startAnimation()">开始</el-button>
      <el-button @click="stopAnimation()">暂停</el-button>
    </div>
    <get-data @getHisData="init"></get-data>
  </div>
</template>
<script>
import "ol/ol.css";
import { Map, View, Feature, Overlay } from "ol";
import { Vector as VectorLayer } from "ol/layer";
import { XYZ, OSM, Vector as VectorSource } from "ol/source";
 
import { Point, LineString } from "ol/geom.js";
 
import { Icon, Fill, Stroke, Style, Circle } from "ol/style";
 
import TileLayer from "ol/layer/Tile";
 
import { getVectorContext } from "ol/render";
import GetData from '../components/GetData.vue';
 
export default {
  components:{GetData},
  
  props: {
    map: {
      type: Object,
      default: () => {},
      required: true,
    },
    coordinates: {
      type: Array,
      default: () => [
        [115.62, 14.82],
        [112.79, 14.82],
        [114.6636, 18.2977],
        [111.687, 18.897],
        [110.3014, 15.063],
      ],
    },
    startPointImage: {
      type: String,
      default:
        "https://smart-garden-manage.oss-cn-chengdu.aliyuncs.com/position.png",
    },
    endPointImage: {
      type: String,
      default:
        "https://smart-garden-manage.oss-cn-chengdu.aliyuncs.com/position.png",
    },
    movePointImage: {
      type: String,
      default:
        "https://smart-garden-manage.oss-cn-chengdu.aliyuncs.com/xiaoche.png",
    },
    speed: {
      type: Number,
      default: 0.1,
    },
  },


  data() {
    return {
      
      route: new LineString(this.coordinates),
      geometryMove: {},
      featureMove: {},
      styles: {
        route: new Style({
          stroke: new Stroke({
            width: 6,
            color: [237, 212, 0, 0.8],
          }),
        }),
        startIcon: new Style({
          image: new Icon({
            anchor: [0.5, 1],
            src: this.startPointImage,
            scale: 1, //设置大小
          }),
        }),
        endIcon: new Style({
          image: new Icon({
            anchor: [0.5, 1],
            src: this.endPointImage,
            scale: 1, //设置大小
          }),
        }),
        featureMove: new Style({
          image: new Icon({
            // anchor: [0.5, 1],
            src: this.movePointImage,
            scale: 0.2, //设置大小
          }),
        }),
      },
      vectorLayer: {},
      distance: 0,
      lastTime: 0,
    };
  },
  created() {},
  mounted() {
    this.init();
  },
  methods: {
    init(history) {
      this.route = new LineString(history);   
      console.log(this.route)
      this.geometryMove = new Point(this.route.getFirstCoordinate());
 
      this.featureMove = new Feature({
        type: "featureMove",
        geometry: this.geometryMove,
      });
      this.vectorLayer = new VectorLayer({
        source: new VectorSource({
          features: [
            new Feature({
              type: "route",
              geometry: this.route,
            }),
            this.featureMove,
            new Feature({
              type: "startIcon",
              geometry: new Point(this.route.getFirstCoordinate()),
            }),
            new Feature({
              type: "endIcon",
              geometry: new Point(this.route.getLastCoordinate()),
            }),
          ],
        }),
        style: (feature) => {
          return this.styles[feature.get("type")];
        },
      });
      this.map.addLayer(this.vectorLayer);
    },


    moveFeature(e) {
      let time = e.frameState.time;
      this.distance =
        (this.distance + (this.speed * (time - this.lastTime)) / 1000) % 1; //%2表示：起止止起；%1表示：起止起止
 
      this.lastTime = time;
 
      const currentCoordinate = this.route.getCoordinateAt(
        this.distance > 1 ? 2 - this.distance : this.distance
      );
      this.geometryMove.setCoordinates(currentCoordinate);
      const vectorContext = getVectorContext(e);
      vectorContext.setStyle(this.styles.featureMove);
      vectorContext.drawGeometry(this.geometryMove);
      this.map.render();
    },
    startAnimation() {
      this.lastTime = Date.now();
      this.vectorLayer.on("postrender", this.moveFeature);
      this.featureMove.setGeometry(null); //必须用null，不能用{}
    },
 
    stopAnimation() {
      this.featureMove.setGeometry(this.geometryMove);
      this.vectorLayer.un("postrender", this.moveFeature);
    },
    removeLayer() {
      this.map.removeLayer(this.vectorLayer);
      this.vectorLayer.getSource().clear();
      this.featureMove = {};
      this.geometryMove = {};
    },
  },
};
</script>
 
 