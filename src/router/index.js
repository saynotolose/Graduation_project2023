import Vue from "vue";
import VueRouter from "vue-router";

import login from "../view/login-a.vue";
import MapView from "../components/MapView";
//import DrawTool from "../drawtools/DrawTool";
Vue.use(VueRouter);

const routes = [
    {
        path: "/",      //设置根目录，方便实现用户在保持登录状态下再次登录时直接跳转至主页面
        redirect: {
            name: "login"
        }
    },

    {
        path: "/map",
        name: "map",
        component: MapView,
    },

    
    {
        path: "/login",
        name: "login",
        component: login

    }, 
    
];

const router = new VueRouter({
    mode: 'history',
    routes
});

router.beforeEach((to, from, next) => {
    //登录页面可以直接进入
    if (to.path == '/login') {
        next();    
    }
    else {
        if (from.path == "/login")//从登录页面可以直接通过登录进入主页面
        {
            next();
        }
        
    }
})
export default router;
