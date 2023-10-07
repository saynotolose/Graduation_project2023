<template>
  <div class="shapefile-parser">
    <div class="panel">
      <input ref="file" type="file" multiple accept=".shp,.dbf">
      <br><br>
      <el-button @click="handleSelect">确认</el-button>
      <el-button @click="remove">清除</el-button>
    </div>
  </div>
</template>

<script>
// eslint-disable-next-line no-unused-vars
import { Map, View, Feature } from "ol"
import { open as shapeOpen, read as shapeRead } from 'shapefile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { GeoJSON } from 'ol/format'

export default {

   props: {
    map: {
      default: {},
      required: true,
    },
  }, 

  data() {
    return {
        vectorLayerShp: null
    }
  },
  methods: {
    handleSelect() {
      let files = this.$refs.file.files
      //console.log(files, typeof files, 'files FileList')
      files = Array.from(files) 
      //console.log(files, typeof files, 'files Array')
      this.parseShapefile(files) // 解析选择的 shp 并绘制显示
    },
    parseShapefile(files) {
      const shpFile = files.find(f => f.name.endsWith('.shp'))
      const dbfFile = files.find(f => f.name.endsWith('.dbf'))
      const promises = [shpFile, dbfFile].map(i => this.readInputFile(i))

      Promise.all(promises).then(([shp, dbf]) => {
          return shapeRead(shp, dbf, { encoding:'utf-8' }) 
        }).then(async(source) => {
          
        const format = new GeoJSON()
        const features = format.readFeatures(source)  //feature还是source?

        // const vectorSource = new VectorSource({
        //   features: features
        // })
        //图层坐标系转化
        const vectorSource = new VectorSource({
          features: new GeoJSON().readFeatures(source, {
            dataProjection: 'EPSG:4326', // Specify the data's projection
            featureProjection: 'EPSG:3857' // Specify the projection to use for the map view
          })
        });
        
        if (this.vectorLayerShp) {
            this.map.removeLayer(this.vectorLayerShp)
        }
        this.vectorLayerShp = new VectorLayer({
          source: vectorSource
        })
        this.map.addLayer(this.vectorLayerShp)

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
    },

    remove(){
      this.map.removeLayer(this.vectorLayerShp)
    }
  }
}
</script>

<style scoped lang="scss">
.shapefile-parser {
  width: 200px;
  height: 100px;
  
  .panel {
    padding: 10px 0;
  }
}
</style>

