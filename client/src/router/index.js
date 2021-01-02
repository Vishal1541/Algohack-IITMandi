import Vue from "vue"
import Router from "vue-router"
import Home from "@/views/Home.vue"
import Register from "@/views/Register.vue"
import Verify from "@/views/Verify.vue"
import Login from "@/views/Login.vue"
import Registered from "@/views/Registered.vue"
import ContestMain from "@/views/ContestMain.vue"
import Ranklist from "@/views/Ranklist.vue"

// Will @deprecate soon.
import Contest from "@/views/Contest.vue"

Vue.use(Router);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home
  },
  {
    path: "/register",
    name: "Register",
    component: Register
  },
  {
    path: "/contest",
    name: "Contest",
    component: ContestMain
  },
  // Will @deprecate soon.
  {
    path: "/contest-old",
    name: "ContestOld",
    component: Contest
  },
  {
    path: "/ranklist",
    name: "Ranklist",
    component: Ranklist
  },
  {
    path: "/login",
    name: "Login",
    component: Login
  },
  {
    path: "/registered",
    name: "Registered",
    component: Registered
  },
  {
    path: "/verify&rollno=:rollno&token=:token",
    name: "Verify",
    component: Verify,
    props: true
  },
  {
    path: "*",
    redirect: "/"
  }
];

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router;
