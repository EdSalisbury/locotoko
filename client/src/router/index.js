import Vue from "vue";
import VueRouter from "vue-router";
import HomeView from "../views/HomeView.vue";
import LoginForm from "@/components/LoginForm";
import RegisterForm from "@/components/RegisterForm";
import ItemList from "@/components/ItemList";
import ItemView from "@/components/ItemView";
import ItemEdit from "@/components/ItemEdit";
import ItemAdd from "@/components/ItemAdd";
import OwnerList from "@/components/OwnerList";
import OwnerAdd from "@/components/OwnerAdd";
import OwnerView from "@/components/OwnerView";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/login",
    name: "login",
    component: LoginForm,
  },
  {
    path: "/register",
    name: "register",
    component: RegisterForm,
  },
  {
    path: "/viewItem/:id",
    name: "item view",
    component: ItemView,
  },
  {
    path: "/editItem/:id",
    name: "edit item",
    component: ItemEdit,
  },
  {
    path: "/items",
    name: "items",
    component: ItemList,
  },
  {
    path: "/addItem",
    name: "add item",
    component: ItemAdd,
  },
  {
    path: "/owners/:id",
    name: "owner view",
    component: OwnerView,
  },
  {
    path: "/owners",
    name: "owners",
    component: OwnerList,
  },
  {
    path: "/addOwner",
    name: "add owner",
    component: OwnerAdd,
  },
  {
    path: "/about",
    name: "about",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(
        /* webpackChunkName: "about" */ "../views/AboutView.vue"
      ),
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
