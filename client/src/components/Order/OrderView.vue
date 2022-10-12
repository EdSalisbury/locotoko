<template>
  <b-container fluid class="m-0 p-0" id="packing-slip">
    <b-row fluid>
      <b-col fluid style="font-size: 3em">
        thebluedragonshoard.com<br />
        info@thebluedragonshoard.com<br />
        Twitter: @BluDragonsHoard
      </b-col>
      <b-col fluid>
        <b-img fluid src="/logo.png" />
      </b-col>
      <b-col fluid style="font-size: 3em; text-align: right">
        4518 South Valdai Circle<br />
        Aurora, CO 80015<br />
        (720) 515-2435
      </b-col>
    </b-row>

    <b-row class="m-0 p-0">
      <b-col xs="6" class="m-0 pl-0 pr-2" style="font-size: 3em">
        <h1>Order ID: {{ order.id }}</h1>
        <h1>Shipped Date: {{ new Date(Date.now()).toLocaleString().split(",")[0] }}</h1>
        <h1>Ship To:</h1>
        {{ order.address.Name }}<br />
        {{ order.address.Street1 }}<br />
        {{ order.address.Street2 }}<br />
        {{ order.address.CityName }},
        {{ order.address.StateOrProvince }}
        {{ order.address.PostalCode }}
      </b-col>
    </b-row>

    <b-table :items="order.items" :fields="fields" striped bordered style="margin-top: 50px; margin-bottom: 50px">
      <template #cell(extended)="data">
        {{ data.item.quantity * data.item.price }}
      </template>
      <template #cell(item)="data">
        {{ data.item.title }}<br />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Item ID: {{ data.item.id }}<br />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;eBay Item ID: {{ data.item.ebayItemId }}<br />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Location: {{ data.item.location }}
      </template>
    </b-table>

    <b-row fluid>
      <b-col xs="11"></b-col>
      <b-col class="cell" style="text-align: right">
        Shipping Method: {{ order.shippingMethod }}<br />
        Subtotal: ${{ order.subtotal }}<br />
        Sales Tax: ${{ order.salesTax }}<br />
        Shipping: ${{ order.shippingCost }}<br />
        Total: ${{ order.total }}
      </b-col>
    </b-row>

    <b-row fluid style="margin-top: 100px">
      <b-col class="cell">Use code BLUEDRAGON15 to take an extra 15% off 3+ items! (Expires Nov 1, 2022)</b-col>
      <b-col></b-col>
      <b-col class="cell" style="text-align: right"><b-img src="/qr_code.png" height="300" width="300" /></b-col>
    </b-row>
  </b-container>
</template>
<script>
import api from "@/api";
export default {
  data() {
    return {
      order: {},
      fields: [
        { key: "item", label: "Item", tdClass: "cell", thClass: "header" },
        { key: "price", label: "Price", tdClass: "cell", thClass: "header" },
        { key: "quantity", label: "Qty", tdClass: "cell", thClass: "header" },
        { key: "extended", label: "Ext", tdClass: "cell", thClass: "header" },
      ],
    };
  },
  async created() {
    const id = this.$route.params.id;
    this.token = this.$cookie.get("token");
    this.order = await api.getOrder(this.token, id);
  },
};
</script>
<style>
.cell {
  font-size: 3em;
}
.header {
  font-size: 3.5em;
}
</style>
