<template>
  <div>
    <button class="layers-button" @click="showLayerSwitcher = !showLayerSwitcher">图层切换</button>
    <div id="controls" :style="{ display: showLayerSwitcher ? 'block' : 'none', right: '10px', top: '35px' }">
      <div style="display: flex; align-items: center;">
        <input type="checkbox" v-model="osmChecked" @change="handleLayerChange" />
        <label style="margin-left: 5px;">OpenStreetMap</label>
      </div>
      <div style="display: flex; align-items: center;">
        <input type="checkbox" v-model="tonerChecked" @change="handleLayerChange" />
        <label style="margin-left: 5px;">Toner</label>
      </div>
      <div style="display: flex; align-items: center;">
        <input type="checkbox" v-model="stamenChecked" @change="handleLayerChange" />
        <label style="margin-left: 5px;">Stamen Map</label>
      </div>
      <div style="display: flex; align-items: center;">
        <input type="checkbox" v-model="geoserChecked" @change="handleLayerChange" />
        <label style="margin-left: 5px;">geoser:simple_ocean</label>
      </div>
    </div>

    <div id="map"></div>
    
  </div>
</template>

<script>
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Stamen from 'ol/source/Stamen';
import TileWMS from 'ol/source/TileWMS';

export default {
  name: 'LayerSwitcher',
  data() {
    return {
      osmChecked: true,
      tonerChecked: false,
      stamenChecked: false,
      geoserChecked: false,
      showLayerSwitcher: false,
    };
  },
  
  mounted() {
    const osmLayer = new TileLayer({
      source: new OSM(),
      visible: true,
    });
    const tonerLayer = new TileLayer({
      source: new Stamen({ layer: 'toner' }),
      visible: false,
    });
    const watercolorLayer = new TileLayer({
      source: new Stamen({ layer: 'watercolor' }),
      visible: false,
    });
    const wmsSource = new TileWMS({
      url: 'http://localhost:8080/geoserver/taiwan/wms',
      params: {
        tiled: true,
        LAYERS: 'taiwan:simplified_water_polygons',
      },
      serverType: 'geoserver',
    });
    const wmsLayer = new TileLayer({
      source: wmsSource,
      visible: false,
    });

    const map = new Map({
      target: 'map',
      layers: [osmLayer, tonerLayer, watercolorLayer, wmsLayer],
      view: new View({
        projection: 'EPSG:3857',
        center: [0, 0],
        zoom: 0,
      }),
    });
    
    this.$watch(
      () => [this.osmChecked, this.tonerChecked, this.stamenChecked, this.geoserChecked],
      (newValues, oldValues) => {
        newValues.forEach((value, index) => {
          if (value !== oldValues[index]) {
            switch (index) {
              case 0:
                osmLayer.setVisible(value);
                break;
              case 1:
                tonerLayer.setVisible(value);
                break;
              case 2:
                watercolorLayer.setVisible(value);
                break;
              case 3:
                wmsLayer.setVisible(value);
                break;
              default:
                break;
            }
          }
        });
      },
    ); 
  },

  beforeDestroy() {
    if (this.map) {
      this.map.setTarget(null);
      this.map = null;
    }
  },

  methods: {
    handleLayerChange() {
      const osmLayer = this.map.getLayers().item(0);
      const tonerLayer = this.map.getLayers().item(1);
      const watercolorLayer = this.map.getLayers().item(2);
      const wmsLayer = this.map.getLayers().item(3);

      osmLayer.setVisible(this.osmChecked);
      tonerLayer.setVisible(this.tonerChecked);
      watercolorLayer.setVisible(this.stamenChecked);
      wmsLayer.setVisible(this.geoserChecked);
    },
  },

};
</script>

<style>
#map {
  width: 100%;
  height: 720px;
  position: relative;
}

.layers-button {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
}

#controls {
  position: absolute;
  background-color: #fff;
  padding: 10px;
  border: 1px solid #ccc;
  z-index: 1000;
}
</style>