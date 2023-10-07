<template>
  <div>
    <el-button @click="startAnimation()">开始</el-button>
    <el-button @click="stopAnimation()">暂停</el-button>
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
 import { transform, fromLonLat, toLonLat } from "ol/proj";
import { getVectorContext } from "ol/render";
import GetData from './GetData.vue';
import hiscarImage from "../assets/hiscar.png";
import point from "../assets/sign.png";
 
export default {
  components:{GetData},
  
  props: {
    map: {
      type: Object,
      default: () => {},
      required: true,
    },
   
    startPointImage: {
      type: String,
      default:point,
    },
    endPointImage: {
      type: String,
      default:point
    },
    movePointImage: {
      type: String,
      default:hiscarImage
    },
    speed: {
      type: Number,
      default: 0.1,
    },
  },


  data() {
    return {
      
      route: null,
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
            anchor: [0.2, 1],
            src: this.startPointImage,
            scale: 0.25, //设置大小
          }),
        }),
        endIcon: new Style({
          image: new Icon({
            anchor: [0.2, 1],
            src: this.endPointImage,
            scale: 0.25, //设置大小
          }),
        }),
        featureMove: new Style({
          image: new Icon({
            // anchor: [0.5, 1],
            src: this.movePointImage,
            scale: 0.25, //设置大小
          }),
        }),
      },
      ht_vectorLayer: {},
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

        const his2 = history.map((item) => {
            return transform(item,"EPSG:4326","EPSG:3857",);
        });

      this.route = new LineString(his2);   
      console.log(this.route)
      this.geometryMove = new Point(this.route.getFirstCoordinate());
 
      this.featureMove = new Feature({
        type: "featureMove",
        geometry: this.geometryMove,
      });
      this.ht_vectorLayer = new VectorLayer({
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
      this.map.addLayer(this.ht_vectorLayer);
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
      this.ht_vectorLayer.on("postrender", this.moveFeature);
      this.featureMove.setGeometry(null); //必须用null，不能用{}
    },
 
    stopAnimation() {
      this.featureMove.setGeometry(this.geometryMove);
      this.ht_vectorLayer.un("postrender", this.moveFeature);
    },
    removeLayer() {
      this.map.removeLayer(this.ht_vectorLayer);
      this.ht_vectorLayer.getSource().clear();
      this.featureMove = {};
      this.geometryMove = {};
    },
  },
};
</script>
 
 