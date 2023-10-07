<template>
  <div>
  </div>
</template>

<script>

import axios from 'axios';
import { set } from 'vue';

export default {
    
    data() {
        return {
        shisData: [],
        
        };
    },

    mounted(){
        
      // 历史轨迹
      axios.get('https://localhost:8081/myfirstdemo/control/historyLine').then((response) => {
        const hisData = []
        const regex = /lng:(\d+\.\d+) lat:(\d+\.\d+)/g;
        let match;

        while ((match = regex.exec(response.data)) !== null) {
            const lng = parseFloat(match[1]);
            const lat = parseFloat(match[2]);
            hisData.push({  lng, lat });
        }

        console.log(hisData)
        let history = hisData.map(item => [item.lng, item.lat]);
        console.log(history)
        this.$emit("getHisData", history);

        }).catch((error) => {console.error(error);});

        

    },
    
}
</script>

<style>

</style>