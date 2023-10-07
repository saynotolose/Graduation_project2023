<template>
  <div id="background">
      <div class="ss"><h1>基于OSM和OFBiz的工业物联网可视化系统</h1></div>
      <div class="container">
          <form action="">
            <h1>Login</h1>
            <div class="form">
                <div class="item">
                  <label>用户名：</label><input type="text" name="username" v-model.trim="name" placeholder="请输入用户名">
                  <!-- v-model把输入的值传输给name变量 -->
                  <br/>
                </div>

                <div class="item">
                  <label>密码：</label><input type="password" name="password" v-model.trim="password" placeholder="请输入密码">
                  <br/>
                </div>

            </div>  
          </form>

          <button type="submit" @click.prevent="handlelogin">登录</button>
          <!-- v-on点击按钮触发handlelogin方法 -->
          
          <router-view></router-view>

      </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {    
  data(){
    return{
      name:"",//姓名，用v-model绑定监听，将输入的字符串赋值给name变量
      password:"",//密码
     
      
    };
  },
  methods:{

    handlelogin:function(){
      const userData = [];
      axios.get('https://localhost:8081/myfirstdemo/control/userQuery').then((response) => {
        
            const regex = /name:(\w+) password:(\w+)/g///name:(.*) password:(.*)/g;
            let match;
            
            while ((match = regex.exec(response.data)) !== null) {
                const name = match[1];
                const password = match[2];
                userData.push({ name, password });            
            }
            

            if(userData.some(user => user.name === this.name && user.password === this.password)){
                this.$router.replace('/map');   //输入的名字以及密码正确，路由跳转
              } 
              else if(this.name===''){           
                alert('用户名不为空');
              }
              else if(this.password===''){       
                alert('密码不为空');
              }
              else{
                alert('账号不存在，请注册后登录'); 
              }

            // if (userData.some(user => user.name === this.name && user.password === this.password)) {
            //   // 如果存在，执行对应的逻辑
            //   console.log('用户名和密码正确');
            // }
            
        }).catch((error) => {console.error(error);});

    },

    
  }
};
</script>


<style scoped>
#background{
    width: 100%;
    height: 100%;
    background: url("../assets/bj.jpg");
    background-size:100% 100%;
    position: fixed;
    top: 0;
    left: 0;
}

.container{
  width: 480px;
  height: 300px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%);
  background:#2e2d2d90;
  text-align: center;
  border-radius: 20px;
  margin-top: 10px;
}
.ss{
  position: absolute;
  top: 10%;
  left: 30%;
}
.container h1{
  color: aliceblue;
  margin-left: 20px;
}
.item {
  color: white;
  margin-left: 15%;
  margin-top: 35px;
  font-size: 20px;
  text-align: left;
}
.item label{
  float:left;
  width: 5em;
  margin-right: 1em;
  text-align: right;
}
input{
  margin-left: -5px;
  padding: 4px;
  border: solid 1px #50ccf6;
  outline: 0;
  font: normal 13px/100% Verdana,Tahoma,sans-serif;
  width: 200px;
  height: 23px;
  background:#f1f1f190;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 0px 8px;
}
button{
  position: relative;
  height: 33px;
  width: 100px;
  background: rgba(70, 154, 219, 0.425);
  border-radius: 10px;
  margin-top: 18px;
  box-shadow: none;
  color: white;
  margin-left: 40px;
  margin-right: 10px;

}


</style>