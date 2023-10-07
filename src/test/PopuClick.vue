<template>
    <div id="mapDiv">
        <div ref="popup" class="popup" v-show="shopPopup">
            <div class="info">
                <ul>
                <li>信息1：xxx</li>
                <li>信息2：xxx</li>
                <li>信息3：xxx</li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
import "ol/ol.css";
import { Map, View, Feature, Overlay } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import {transform} from 'ol/proj';
import { Vector as VectorLayer} from 'ol/layer';
import { Vector as VectorSource} from 'ol/source';
import { Style, Fill, Stroke, Circle as sCircle } from "ol/style";
import * as olProj from "ol/proj";
import { Point } from "ol/geom";

import { TileWMS } from 'ol/source'

export default {
    data() {
        return {
            openMap: null,
            popup: null,
            shopPopup: false,
        };
    },

    mounted() {
        this.initMap();
        
    },

    methods:{
        initMap(){

            //定义geoserver中的图层
            /* var wmsSource = new TileWMS({
                url: 'http://localhost:8080/geoserver/taiwan/wms',
                params: {
                    'tiled': true,
                    "LAYERS": 'taiwan:simplified_water_polygons',
                },
                serverType: 'geoserver',
            });
            var wmsLayer = new TileLayer({
                source: wmsSource,
                visible: true 
            });
 */

            var center=transform([108.95,34.27],'EPSG:4326','EPSG:3857');
            this.openMap = new Map({
                target: "mapDiv",
                layers: [
                    new TileLayer({
                        source: new OSM(),
                        visible: true
                    }),
                    //wmsLayer
                ],
                view: new View({
                    projection: 'EPSG:3857',
                    center: center,
                    zoom: 0
                })
            });
            this.setMarker();
            this.addOverlay();
            this.singleclick();
            this.pointermove();
        },

        setMarker() {
            let style = new Style({
                image: new sCircle({
                radius: 10,
                stroke: new Stroke({
                    color: "#fff",
                }),
                fill: new Fill({
                    color: "#3399CC",
                }),
                }),
            });
            let _feature = new Feature({
                geometry: new Point(olProj.fromLonLat([108.945951, 34.465262])),
            });
            _feature.setStyle(style);
            let _marker = new VectorLayer({
                source: new VectorSource({
                features: [_feature],
                }),
            });
            this.openMap.addLayer(_marker);
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
                let feature = this.openMap.forEachFeatureAtPixel(
                e.pixel,
                (feature) => feature
                );
                console.log(feature);
                if (feature) {
                this.shopPopup = true;
                // 设置弹窗位置
                let coordinates = feature.getGeometry().getCoordinates();
                this.popup.setPosition(coordinates);
                } else {
                this.shopPopup = false;
                }
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

    }

};
</script>

<style lang="scss" scoped>
#mapDiv{
    width: 100%;
    height: 100%;
}
.popup {
  width: 200px;
  background-color: white;
  padding: 18px;
  border-radius: 10px;
  box-shadow: 0 0 15px rgb(177, 177, 177);
  .info {
    font-size: 14px;
    text-align: left;
    ul {
      padding-left: 2;
    }
  }
}

</style>