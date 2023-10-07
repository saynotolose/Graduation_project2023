<template>
<div>
    
    <el-collapse v-model="activeNames" class="pp" >

        <el-collapse-item title="1.图层切换 LayerSwitch" name="1">
            <div><el-switch v-model="osmChecked" active-color="#13ce66" active-text="OSM_local"></el-switch></div>
            <div><el-switch v-model="vectorChecked" active-color="#13ce66" active-text="deviceLayer"></el-switch></div>
        </el-collapse-item>

        <el-collapse-item title="2.绘图 Drawing" name="2">
            <div><LjDraw :map="openMap"></LjDraw></div>
        </el-collapse-item>

        <el-collapse-item title="3.shpfile预览 shpPreview" name="3">
            <div><ShpImport :map="openMap"></ShpImport></div>
        </el-collapse-item>

        <el-collapse-item title="4.历史轨迹与实时轨迹 route_History/Now" name="4">
            <div>
                <el-button @click="openNowTrack()">打开实时轨迹</el-button>
                <el-button @click="closeNowTrack()">关闭实时轨迹</el-button>
                <MoveTrack :map="openMap" ref="moveTrack" v-if="showNow"></MoveTrack>
            </div>
            <div>
                <el-button @click="openHisTrack()">打开历史轨迹</el-button>
                <el-button @click="closeHisTrack()">关闭历史轨迹</el-button>
                <HisTrack ref="ref_histrack" :map="openMap" :speed="0.1" v-if="showHis"></HisTrack>
            </div>
        </el-collapse-item>

    </el-collapse>
    

    <!-- 地图和弹窗 -->
    <div id="map" ref="map">
        <div ref="popup" class="popup" v-show="shopPopup">
            <div ref="echartsContainer" class="echarts-container"></div>
        </div>
    </div>
    
</div>
</template>

<script>
import axios from 'axios';
import 'ol/ol.css';
import { Map, View, Feature, Overlay } from "ol";
import TileLayer from 'ol/layer/Tile';
import Cluster from 'ol/source/Cluster';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';
import {transform} from 'ol/proj';
import { Style, Icon, Circle, Stroke, Fill, Text } from 'ol/style';
import { defaults as defaultControls, OverviewMap } from "ol/control";
import pointImage from "../assets/device-3.png";
import clusterImage from "../assets/cluster.png";
import TileWMS from 'ol/source/TileWMS';
import { ScaleLine } from "ol/control";

import LjDraw from "../drawtools/LjDraw.vue";
import ShpImport from './ShpImport.vue';
import MoveTrack from './MoveTrack.vue';
import HisTrack from "./HisTrack.vue"; 

import * as echarts from 'echarts'


export default {
    name: 'MapComponent',
    components: { LjDraw, ShpImport, MoveTrack, HisTrack, },

    data() {
            return {
                openMap: null,
                popup: null,
                shopPopup: false,
                popupID: null,
                
                osmChecked: true,
                vectorChecked: true,

                showHis: false,
                showNow: false,
                deviceData: [],

            };
        },

    beforeMount() {
        // _isMounted是当前实例mouned()是否执行 此时为false
        window.parentMounted = this._isMounted;
    }, 

    mounted() {
        this.initMap();
        // _isMounted是当前实例mouned()是否执行 此时为true
        window.parentMounted = this._isMounted;
    },

    beforeDestroy() {
        if (this.openMap) {
            this.openMap.setTarget(null);
            this.openMap = null;
        }
        
    },

    methods:{

        initMap(){
            
            //geoserver图层
            const wmsSource = new TileWMS({
                url: 'http://localhost:8080/geoserver/china/wms',
                params: {
                    tiled: true,
                    LAYERS: 'china',
                },
                serverType: 'geoserver',
            });
            const osmLayer = new TileLayer({
                source: wmsSource,
                visible: true,
            });

            //测试geoserver发布的shp文件
            const testSource = new TileWMS({
                url: 'http://localhost:8080/geoserver/taiwan/wms',
                params: {
                    tiled: true,
                    LAYERS: 'taiwan:50_track',
                },
                serverType: 'geoserver',
            });
            const testLayer = new TileLayer({
                source: testSource,
                visible: true,
            });


        var center=transform([108.95,34.27],'EPSG:4326','EPSG:3857');
      

        this.openMap = new Map({
            target: 'map',
            layers: [
                osmLayer,
                //testLayer
            ],
            view: new View({
                center: center,
                zoom: 4,
                minZoom: 3,
                //projection: 'EPSG:4326'
            }),
            //controls: defaultControls({ zoom: true }).extend([overviewMapControl])鹰眼
        });
        this.openMap.addControl(new ScaleLine());

        const source = new VectorSource();
        const pointStyle = new Style({
            image: new Icon({
                // 设置图标图片的URL和大小
                src: pointImage,
                anchor: [0.5, 0.5],
                //size: [30, 30],
                //opacity: 0.75,
                scale:0.17
            }),
        });

        //https://localhost:4444/api
        axios.get('https://localhost:8081/myfirstdemo/control/sss').then((response) => {
            const data = [];
            const regex = /id:(\d+) lng:(\d+\.\d+) lat:(\d+\.\d+)/g;
            let match;

            while ((match = regex.exec(response.data)) !== null) {
                const ID = parseInt(match[1]);
                const lng = parseFloat(match[2]);
                const lat = parseFloat(match[3]);
                data.push({ ID, lng, lat });
            }

            data.forEach(({ ID, lng, lat }) => {
                const feature = new Feature({
                    geometry: new Point(fromLonLat([lng, lat])),
                    ID,
                });
                feature.setStyle(pointStyle);
                source.addFeature(feature);
            });
            console.log(data)
            }).catch((error) => {console.error(error);});


        axios.get('https://localhost:8081/myfirstdemo/control/kkk').then((response) => {
        //console.log(response.data)
            const regex = /id:(\d+) lng:(\d+\.\d+) lat:(\d+\.\d+) batteryPower:(\d+) temp:(\d+\.\d+) voltage:(\d+\.\d+)/g;
            let match;
            while ((match = regex.exec(response.data)) !== null) {
                const ID = parseInt(match[1]);
                const lng = parseFloat(match[2]);
                const lat = parseFloat(match[3]);
                const batteryPower = parseFloat(match[4]);
                const temp = parseFloat(match[5]);
                const voltage = parseFloat(match[6]);
                this.deviceData.push({ ID, lng, lat, batteryPower, temp, voltage });
            }
            //console.log(deviceData)
            this.deviceData.forEach(({ ID, lng, lat, batteryPower, temp, voltage }) => {
            const feature = new Feature({
                geometry: new Point(fromLonLat([lng, lat])),
                ID,
                batteryPower,
                temp,
                voltage
            });
            feature.setStyle(pointStyle);
            source.addFeature(feature);
        });

        }).catch((error) => {console.error(error);});

        const clusterSource = new Cluster({
            distance: 20, // 要素将被聚合在一起的像素距离，默认为20
           // minDistance: 20, // 聚合块之间的最小像素距离，默认为零
            source: source
        }); 

        const clusterstyle = function (feature, resolution) {
                var size = feature.get('features').length;
                if (size == 1) {
                    return pointStyle
                }
                else {
                    return new Style({
                        image: new Icon({
                            // 设置图标图片的URL和大小
                            src: clusterImage,
                            anchor: [0.5, 0.55],
                            scale:0.3,    
                        }),
                        text: new Text({
                            text: size.toString(),
                            fill: new Fill({
                                color: 'red'
                            }),
                            font: 'bold 16px sans-serif'
                        })
                    });
                }
            }

        const vectorLayer = new VectorLayer({
            source,
        });

        this.openMap.addLayer(vectorLayer);    //OSM,vectorLayer两个图层

        this.$watch( 
            () => [this.osmChecked, this.vectorChecked],
            (newValues, oldValues) => {
            newValues.forEach((value, index) => {
                if (value !== oldValues[index]) {
                switch (index) {
                    case 0:
                        osmLayer.setVisible(value);
                        break;
                    case 1:
                        vectorLayer.setVisible(value);
                        break;
                    default:
                        break;
                }
                }
            });
            },
        ); 
        this.addOverlay();
        this.singleclick();
        this.pointermove();

         //缩放级别大于7时取消聚合
        this.openMap.on("moveend", e => {
            const zoom = this.openMap.getView().getZoom();
            //console.log(zoom)
            if (zoom > 9) {
                vectorLayer.setSource(source);
                vectorLayer.setStyle(null);
            } else {
                vectorLayer.setSource(clusterSource);
                vectorLayer.setStyle(clusterstyle);
            }
        }); 

        //轮询
        var timer = setInterval(this.pullData, 1000);
        
    },

    
    addOverlay() {
        // 创建Overlay
        let elPopup = this.$refs.popup;
        this.popup = new Overlay({
            element: elPopup,
            positioning: "bottom-center",
            stopEvent: false,
            offset: [0, -20],
        });
        this.openMap.addOverlay(this.popup);
    },

    singleclick() {
        // 点击
        this.openMap.on("singleclick", (e) => {
            // 判断是否点击在点上
            let feature = this.openMap.forEachFeatureAtPixel(e.pixel,(feature) => feature);
            //console.log(feature.get('ID'));放在这里点击空位置会报错
            if (feature) {
                //console.log(feature.get('ID'));
                this.popupID = feature.get('ID');
                if(this.popupID){
                    this.shopPopup = true;
                    // 设置弹窗位置
                    let coordinates = feature.getGeometry().getCoordinates();
                    this.popup.setPosition(coordinates);
                    this.setChat(feature.get('ID'))
                    
                    }else{
                    this.shopPopup = false;
                }

            } else {
                this.shopPopup = false;
            }
        });
        
    },

    setChat(id){
        let chart = echarts.init(this.$refs.echartsContainer)
        var a,b,c,i
        
        for(i=0 ;i<this.deviceData.length; i++){
            if(this.deviceData[i].ID === id){
                a =this.deviceData[i].batteryPower.toFixed(2);
                b =this.deviceData[i].temp.toFixed(2);
                c =(this.deviceData[i].voltage/10).toFixed(3)
            }
        }
    
        chart.setOption({
            title: {
                text: 'ID为'+id+'的设备信息',
                x:'center',
                y:'top',
            },
            tooltip: {},
            xAxis: {
                data: ['电量/%', '温度/℃', '电压/10v'],
            },
            yAxis: {},
            series: [{
                name: '设备信息',
                type: 'bar',
                data: [ a,b,c ],
                itemStyle: {
                    normal: {
                        color: function(params) {
                            var colorList = ['#99CC00','#33CCFF', '#c23531'];
                            return colorList[params.dataIndex]
                        }
                    }                    
                },
                label: {
                        show: true, //开启显示
                        position: 'top', //在上方显示
                        //formatter: '{c}%',//显示百分号
                        textStyle: { //数值样式
                            color: 'black',//字体颜色
                            fontSize: 10//字体大小
                        }
                }

            }],

        });       

    },


    pointermove() {
            this.openMap.on("pointermove", (e) => {
                if (this.openMap.hasFeatureAtPixel(e.pixel)) {
                this.openMap.getViewport().style.cursor = "pointer";
                } else {
                this.openMap.getViewport().style.cursor = "inherit";
                }
            });
        },

    handleLayerChange() {
        const osmLayer = this.map.getLayers().item(0);
        const vectorLayer = this.map.getLayers().item(1);
        osmLayer.setVisible(this.osmChecked);
        vectorLayer.setVisible(this.vectorChecked);
    },

    openHisTrack() {
      this.showHis = true;
    },
    closeHisTrack() {
      this.$refs.ref_histrack.removeLayer();
      this.showHis = false;
    },

    openNowTrack() {
      this.showNow = true;
    },
    closeNowTrack() {
      this.$refs.moveTrack.removeLayer();
      this.showNow = false;
    },

    pullData(){
         axios.get('https://localhost:8081/myfirstdemo/control/kkk').then((response) => {
        
            const regex = /id:(\d+) lng:(\d+\.\d+) lat:(\d+\.\d+) batteryPower:(\d+) temp:(\d+\.\d+) voltage:(\d+\.\d+)/g;
            let match;
            this.deviceData = [];
            while ((match = regex.exec(response.data)) !== null) {
                const ID = parseInt(match[1]);
                const lng = parseFloat(match[2]);
                const lat = parseFloat(match[3]);
                const batteryPower = parseFloat(match[4]);
                const temp = parseFloat(match[5]);
                const voltage = parseFloat(match[6]);
                this.deviceData.push({ ID, lng, lat, batteryPower, temp, voltage });                
            }
            this.setChat(this.popupID)//动画渲染点击的那个
            //console.log(7777)
        }).catch((error) => {console.error(error);});
    }

  }
};
</script>

<style lang="scss" scoped>
#map {
    width: 100%;
    height: 700px;
    position: relative;
}

.popup {
    width: 280px;
    background-color: white;
    padding: 10px;
    border-radius: 10px;
    box-shadow: 0 0 15px rgb(177, 177, 177);
    .echarts-container{
            width: 280px;
            height: 200px;
        }
}

.pp {
    position: fixed;
    width: 20%;
    height: 200px;
    top: 10px;
    left: 60px;
    z-index: 999;
    
    border-top: 5px solid #ef9319; /* 上边框为橙色，较厚 */
    border-left: 5px solid #ef9319; /* 左边框 */
    border-right: 5px solid #ef9319; /* 右边框 */
    border-bottom: none; /* 没有下边框 */
}
</style>
