<!--LjDraw  画图的那些按钮在这-->
<template>
  <div>  
      <el-select class="draw-select"  v-model="currentDrawFeature" placeholder="请选择" @change="drawFeature()">
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
    <br><br>
  <div><el-switch v-model="enableFreeHand" active-color="#13ce66" active-text="开启手绘"></el-switch></div>
    <br>
    <div>
    <el-button @click="draw.removeLastPoint()">撤回</el-button>
    <el-button @click="cancelDraw()">取消</el-button>
    <el-button @click="clearDrawLayer()">清除</el-button>
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
import { Fill, Stroke, Style, Text, Icon, Circle } from "ol/style";
 
export default {
  name: "LjDraw",

  props: {
    map: {
      default: {},
      required: true,
    },
  }, 

  data() {
    return {
      draw_source: new VectorSource(),
      draw_vector: {},
      draw: {},
      currentDrawFeature: "", //当前正在绘制的要素类型
      enableFreeHand: false,  //是否允许手绘

      options: [
        { value: 'Point', label: '画点'}, 
        { value: 'LineString', label: '画线'}, 
        { value: 'Polygon', label: '画面'}, 
        { value: 'Circle', label: '画圆'}, 
        ],


    };
  },

  mounted() {
    let pMountedTimer = {}; //定时器
    pMountedTimer = setInterval(() => {
      if (window.parentMounted) {
        //在这里执行初始化
        this.addDrawLayer();
 
        clearInterval(pMountedTimer); //清除定时器
      }
    }, 1000);

  },

  methods: {
    //添加绘制点线面图层
    addDrawLayer() {
      this.draw_vector = new VectorLayer({
        source: this.draw_source,
        //绘制好后，在地图上呈现的样式
        style: new Style({
          fill: new Fill({
            color: "rgba(255, 255, 255, 0.2)",
          }),
          stroke: new Stroke({
            //边界样式
            color: "red",
            width: 3,
          }),
          //点样式继承image
          image: new Circle({
            radius: 7,
            fill: new Fill({
              color: "red",
            }),
          }),
        }),
        zIndex: 9999,
      });
      this.map.addLayer(this.draw_vector);
    },

    //取消绘制
    cancelDraw() {
      this.map.removeInteraction(this.draw); //移除交互
      this.currentDrawFeature = ""; //取消选中要素！！
    },

    //清空绘制图层
    clearDrawLayer() {
      this.map.removeInteraction(this.draw); //移除交互
      this.draw_vector.getSource().clear(); //清除图层上的所有要素
      this.currentDrawFeature = ""; //取消选中要素！！
    },

    //绘制点线面
    drawFeature() {
      this.map.removeInteraction(this.draw); //移除交互
 
      if (!this.currentDrawFeature) return; //这里一定要判断
 
      this.draw = new Draw({
        source: this.draw_source,
        type: this.currentDrawFeature,  //绘制时，在地图上呈现的样式
        style: new Style({
          fill: new Fill({
            color: "rgba(255, 255, 255, 0.2)",
          }),
          stroke: new Stroke({
            color: "red",
            width: 2,
          }),
          image: new Circle({
            radius: 7,
            fill: new Fill({
              color: "red",
            }),
          }),
        }),
        freehand: this.enableFreeHand, //手绘
      });
      this.map.addInteraction(this.draw);
    },


  },

  watch: {
    enableFreeHand: {
      handler() {
        this.drawFeature();
      },
    },
  }

};
</script>

<style scoped>
.draw-select {
  height: 20px;
  width: 150px;
  font-size: 12px;
}
</style>