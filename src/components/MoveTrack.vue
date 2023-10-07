<template>
  <div>
    <!-- {{histoty_loc}}
    <br/><br/><br/>
    {{locList3587}} -->
    <web-socket @websocketData="handleWebsocketData"></web-socket>
  </div>
</template>
 
<script>
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import { Draw } from "ol/interaction";
import { Style, Fill, Stroke, Circle, Icon } from "ol/style";
import { transform, fromLonLat, toLonLat } from "ol/proj";
import { Point, LineString } from "ol/geom";
 
import { Map, View, interaction, events } from "ol";
import TileLayer from "ol/layer/Tile";
import { defaults as defaultControls } from "ol/control";
import carImage from "../assets/car.png";
import WebSocket from "./WebSocket.vue";
 
export default {
    props: {
    map: {
            default: {},
            required: true,
        },
    }, 
  
    components: {
        WebSocket
    },

    data() {
        return {
        
        featureMove: {},
        carPoints: [], //车还要走的点
        routeIndex: 0, //当前小车所在的路段
        timer: {},
        coordinates: [],  //3587系 投影
        
        routeLayer: {},
        carLayer:{},
        locList:[],
        locList3587:[],
        histoty_loc:[]
        };
    },
    mounted() {
        
        
    },

    methods: {

        handleWebsocketData(dataList) {
        // 拿到坐标点
        this.locList = dataList;
        this.locList = this.locList.map((item) => {
            const coords = item.split(","); // 将字符串拆分为数组
            return [parseFloat(coords[0]), parseFloat(coords[1])];
        });
        this.locList3587 = this.locList.map((item) => {
            return transform(item,"EPSG:4326","EPSG:3857",);
        });

        if(this.routeIndex===0){
            //拿到历史轨迹
            this.histoty_loc = [...this.locList3587];
            }

        //每秒检查一次，坐标点更新了才执行，coordinates添加而不是更新  实时轨迹
        if (this.locList3587.length > this.coordinates.length) {
            for (let i = this.coordinates.length; i < this.locList3587.length; i++) {
                const coord = this.locList3587[i];
                this.coordinates.push(coord);
            }
            this.drawLine();
            this.moveStart();
        }
        
        },

        //轨迹线  把每个点连起来
        drawLine() {
            this.map.removeLayer(this.routeLayer)
            this.routeLayer = new VectorLayer({
                source: new VectorSource({
                features: [],
                }),
            });
            this.map.addLayer(this.routeLayer);

            let comDots = [];
            let wireFeature = {};
            this.coordinates.forEach((item) => {
                comDots.push(item);
                wireFeature = new Feature({
                    geometry: new LineString(comDots),
                });
                wireFeature.setStyle(
                new Style({
                    stroke: new Stroke({
                    // 设置边的样式
                    color: "rgb(21, 106, 158)",
                    width: 3,
                    }),
                })
                );
                this.routeLayer.getSource().addFeatures([wireFeature]);
            });

        },


        //创建小车这个要素
        moveStart() {

        //坐标转换
        this.dotsData = this.coordinates.map((item) => {
            return transform(item, "EPSG:3857", "EPSG:4326");
        });
        //深复制车的位置，不在原数组改变，方便重新播放
        // this.carPoints = JSON.parse(JSON.stringify(this.dotsData));
        this.carPoints = [...this.dotsData];

        if(this.routeIndex===0){

            this.carLayer = new VectorLayer({
                source: new VectorSource({
                features: [],
                }),
            });
            this.map.addLayer(this.carLayer);

            //小车最初位置在第一个坐标点
            this.featureMove = new Feature({
                geometry: new Point(this.carPoints[0]),
            });
            this.featureMove.setStyle(
                new Style({
                image: new Icon({
                    src: carImage,
                    scale: 0.1,
                    anchor: [0.5, 0.5],
                    rotation: this.countRotate(),
                }),
                })
            );
            //添加车辆元素到图层
            this.carLayer.getSource().addFeature(this.featureMove);
        }
        
        this.timeStart();//实时轨迹时，通过index保存当前位置

        },


        //计时器开始
        timeStart() {

        this.timer = setInterval(() => {
        
            //如果没有动，即是数据库里出现重复坐标
            if(this.coordinates[this.routeIndex + 1]===this.coordinates[this.routeIndex]){
                this.routeIndex++;
                console.log(555)
            }

            if (this.routeIndex + 1 >= this.carPoints.length) {
            clearInterval(this.timer);
            return;
            }
            
            //到转折点旋转角度
            if (this.nextPoint() === this.carPoints[this.routeIndex + 1]) {
                this.routeIndex++;
                this.featureMove.getStyle().getImage().setRotation(this.countRotate());
            }
            //改变坐标点
            this.featureMove.getGeometry().setCoordinates(fromLonLat(this.carPoints[this.routeIndex]));
            
        }, 10);

        },

        //计算下一个点的位置  步步逼近
        //这里的算法是计算了两点之间的点   两点之间的连线可能存在很多个计算出来的点  
        nextPoint() {
            let routeIndex = this.routeIndex;
            let p1 = this.map.getPixelFromCoordinate(
                fromLonLat(this.carPoints[routeIndex])
            ); //获取在屏幕的像素位置
            let p2 = this.map.getPixelFromCoordinate(
                fromLonLat(this.carPoints[routeIndex + 1])
            );
            let dx = p2[0] - p1[0];
            let dy = p2[1] - p1[1];
            //打印可见  在没有走到下一个点之前，下一个点是不变的，前一个点以这个点为终点向其靠近
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance <= 1) {
                return this.carPoints[routeIndex + 1];
            } else {
                let x = p1[0] + dx / distance;
                let y = p1[1] + dy / distance;
                let coor = transform(
                this.map.getCoordinateFromPixel([x, y]),
                "EPSG:3857",
                "EPSG:4326"
                );
                this.carPoints[routeIndex] = coor; //这里会将前一个点重新赋值  要素利用这个坐标变化进行移动
                return this.carPoints[routeIndex];
            }
        },
        //计算两点之间的角度  算旋转角度
        countRotate() {
            let i = this.routeIndex,
                j = i + 1;
            if (j === this.carPoints.length) {
                i--;
                j--;
            }
            let p1 = this.carPoints[i];
            let p2 = this.carPoints[j];
            return Math.atan2(p2[0] - p1[0], p2[1] - p1[1]);
        },


        removeLayer() {
            this.map.removeLayer(this.routeLayer);
            this.map.removeLayer(this.carLayer);
            this.routeLayer.getSource().clear();
            this.featureMove = {};
            
        },

  },
};
</script>
 
<style lang="scss" scoped>
</style>
 