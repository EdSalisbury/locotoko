import Vue from "vue";
import VueRouter from "vue-router";
import LoginForm from "@/components/LoginForm";
import RegisterForm from "@/components/RegisterForm";
import OwnerList from "@/components/OwnerList";
import OwnerAdd from "@/components/OwnerAdd";
import OwnerView from "@/components/OwnerView";
import { ItemAdd, ItemEdit, ItemView, ItemList } from "@/components/Item";
import { TemplateAdd, TemplateEdit, TemplateView, TemplateList } from "../components/Template";
import { AcquisitionAdd, AcquisitionEdit, AcquisitionView, AcquisitionList } from "../components/Acquisition";

Vue.use(VueRouter);

const routes = [
  {
    path: "/login",
    name: "login",
    component: LoginForm,
  },
  {
    path: "/",
    name: "items",
    component: ItemList,
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
    path: "/templates/:id",
    name: "template view",
    component: TemplateView,
  },
  {
    path: "/templates",
    name: "templates",
    component: TemplateList,
  },
  {
    path: "/addTemplate",
    name: "add template",
    component: TemplateAdd,
  },
  {
    path: "/editTemplate/:id",
    name: "edit template",
    component: TemplateEdit,
  },
  {
    path: "/acquisitions/:id",
    name: "acquisition view",
    component: AcquisitionView,
  },
  {
    path: "/acquisitions",
    name: "acquisitions",
    component: AcquisitionList,
  },
  {
    path: "/addAcquisition",
    name: "add acquisition",
    component: AcquisitionAdd,
  },
  {
    path: "/editAcquisition/:id",
    name: "edit acquisition",
    component: AcquisitionEdit,
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
