import { createRouter, createWebHistory } from "vue-router";
import LoginForm from "@/components/LoginForm.vue";
import LogoutForm from "@/components/LogoutForm.vue";
import RegisterForm from "@/components/RegisterForm.vue";
import ChangePasswordForm from "@/components/ChangePasswordForm.vue";
import HomePage from "@/components/HomePage.vue";
import { ItemAdd, ItemEdit, ItemView, ItemList } from "@/components/Item";
import { TemplateAdd, TemplateEdit, TemplateView, TemplateList } from "@/components/Template";
import { AcquisitionAdd, AcquisitionEdit, AcquisitionView, AcquisitionList } from "@/components/Acquisition";
import { OrderList, OrderView, PickList } from "@/components/Order";
import { OwnerList, OwnerView, OwnerAdd, OwnerEdit } from "@/components/Owner";

const routes = [
  { path: "/login", name: "login", component: LoginForm },
  { path: "/logout", name: "logout", component: LogoutForm },
  { path: "/", name: "home", component: HomePage },
  { path: "/register", name: "register", component: RegisterForm },
  { path: "/changePassword", name: "change password", component: ChangePasswordForm },
  { path: "/viewItem/:id", name: "item view", component: ItemView },
  { path: "/editItem/:id", name: "edit item", component: ItemEdit },
  { path: "/items", name: "items", component: ItemList },
  { path: "/addItem", name: "add item", component: ItemAdd },
  { path: "/owners/:id", name: "owner view", component: OwnerView },
  { path: "/owners", name: "owners", component: OwnerList },
  { path: "/addOwner", name: "add owner", component: OwnerAdd },
  { path: "/editOwner/:id", name: "edit owner", component: OwnerEdit },
  { path: "/templates/:id", name: "template view", component: TemplateView },
  { path: "/templates", name: "templates", component: TemplateList },
  { path: "/addTemplate", name: "add template", component: TemplateAdd },
  { path: "/editTemplate/:id", name: "edit template", component: TemplateEdit },
  { path: "/acquisitions/:id", name: "acquisition view", component: AcquisitionView },
  { path: "/acquisitions", name: "acquisitions", component: AcquisitionList },
  { path: "/addAcquisition", name: "add acquisition", component: AcquisitionAdd },
  { path: "/editAcquisition/:id", name: "edit acquisition", component: AcquisitionEdit },
  { path: "/orders", name: "orders", component: OrderList },
  { path: "/orders/:id", name: "order view", component: OrderView },
  { path: "/picks", name: "pick list", component: PickList },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
