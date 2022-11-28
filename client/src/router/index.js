import Vue from "vue";
import VueRouter from "vue-router";
import LoginForm from "@/components/LoginForm";
import RegisterForm from "@/components/RegisterForm";
import OwnerList from "@/components/OwnerList";
import OwnerAdd from "@/components/OwnerAdd";
import OwnerView from "@/components/OwnerView";
import { ItemAdd, ItemEdit, ItemView, ItemList, ActiveItemList, SoldItemList, DraftItemList } from "@/components/Item";
import { TemplateAdd, TemplateEdit, TemplateView, TemplateList } from "../components/Template";
import { AcquisitionAdd, AcquisitionEdit, AcquisitionView, AcquisitionList } from "../components/Acquisition";
import { OrderList, OrderView, PickList } from "@/components/Order";

Vue.use(VueRouter);

const routes = [
  {
    path: "/login",
    name: "login",
    component: LoginForm,
  },
  {
    path: "/",
    name: "home",
    component: ActiveItemList,
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
    path: "/activeItems",
    name: "active items",
    component: ActiveItemList,
  },
  {
    path: "/soldItems",
    name: "sold items",
    component: SoldItemList,
  },
  {
    path: "/draftItems",
    name: "draft items",
    component: DraftItemList,
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
  {
    path: "/orders",
    name: "orders",
    component: OrderList,
  },
  {
    path: "/orders/:id",
    name: "order view",
    component: OrderView,
  },
  {
    path: "/picks",
    name: "pick list",
    component: PickList,
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
