<template>
  <div class="shapefile-parser">
    <div class="panel">
      <input ref="file" type="file" multiple accept=".shp,.dbf">
      <button @click="handleSelect">确认</button>
    </div>
    <div id="map" style="width: 100%; height: 100%;"></div>
  </div>
</template>

<script>
import { open as shapeOpen, read as shapeRead } from 'shapefile'
import 'ol/ol.css'
import { Map, View } from 'ol'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { GeoJSON } from 'ol/format'
import { Projection } from 'ol/proj'

export default {
  name: 'ShapefileParser',
  data() {
    return {
      map: null,
      vectorLayer: null
    }
  },
  mounted() {
    this.initMap()
  },
  methods: {
    initMap() {
      // 初始化地图
      this.map = new Map({
        target: 'map',
        layers: [
          new TileLayer({
            source: new OSM()
          })
        ],
        view: new View({
          center: [0, 0],
          zoom: 2,
          projection: 'EPSG:4326'
        })
      })
    },

    handleSelect() {
      let files = this.$refs.file.files
      console.log(files, typeof files, 'files FileList')
      // files = Array.from(new Array(files.length), (i, idx) => files[idx]) // 等效下面写法
      files = Array.from(files) // FileList => Array, 方便使用 Array 方法
      console.log(files, typeof files, 'files Array')
      this.parseShapefile(files) // 解析选择的 shp 并绘制显示
    },

    parseShapefile(files) {
      const shpFile = files.find(f => f.name.endsWith('.shp'))
      const dbfFile = files.find(f => f.name.endsWith('.dbf'))

      const promises = [shpFile, dbfFile].map(i => this.readInputFile(i))

      Promise.all(promises).then(([shp, dbf]) => {
        return shapeRead(shp, dbf, { encoding:'utf-8' }) 
      }).then(async(source) => {
        console.log(source, typeof source, 'shapeRead source')
        
        
        // 解析获取的地理要素信息，并添加到地图上
        const format = new GeoJSON()
        const features = format.readFeatures(source)
        const vectorSource = new VectorSource({
          features: features
        })
        if (this.vectorLayer) {
          this.map.removeLayer(this.vectorLayer)
        }
        this.vectorLayer = new VectorLayer({
          source: vectorSource
        })
        this.map.addLayer(this.vectorLayer)
      }).catch(error => console.error(error.stack))
    },

    async readInputFile(file, type = 'ArrayBuffer') {
      // 读取文件
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        switch (type) {
          case 'ArrayBuffer':
            reader.readAsArrayBuffer(file)
            break
          case 'Text':
            reader.readAsText(file)
            break
          case 'BinaryString':
            reader.readAsBinaryString(file)
            break
          case 'DataURL':
            reader.readAsDataURL(file)
            break
          }

        reader.onload = function() {
          // this.result 就是读取到的文件的数据
          resolve(this.result)
        }

        reader.onerror = function() {
          reject(this)
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
.shapefile-parser {
  width: 1000px;
  height: 700px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;

  .panel {
    padding: 10px 0;
  }
}
</style>
