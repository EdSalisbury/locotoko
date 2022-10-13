<template>
  <b-container fluid class="p-0" id="packing-slip">
    <b-row fluid>
      <b-col fluid class="text">
        thebluedragonshoard.com<br />
        info@thebluedragonshoard.com<br />
        Twitter: @BluDragonsHoard
      </b-col>
      <b-col fluid>
        <b-img fluid src="/logo.png" />
      </b-col>
      <b-col fluid class="text" style="text-align: right">
        4518 South Valdai Circle<br />
        Aurora, CO 80015<br />
        (720) 515-2435
      </b-col>
    </b-row>

    <b-row class="m-0 p-0">
      <b-col xs="6" class="m-0 pl-0 pr-2 address">
        <h1>Order ID: {{ order.id }}</h1>
        <h1>Shipped Date: {{ new Date(Date.now()).toLocaleString().split(",")[0] }}</h1>
        <h1>Ship To:</h1>
        {{ order.address.Name }}<br />
        {{ order.address.Street1 }}<br />
        {{ order.address.Street2 }}<br v-if="order.address.Street2" />
        {{ order.address.CityName }},
        {{ order.address.StateOrProvince }}
        {{ order.address.PostalCode }}
      </b-col>
    </b-row>

    <b-table :items="order.items" :fields="fields" striped bordered style="margin-top: 10px" id="itemTable">
      <template #cell(extended)="data">
        {{ data.item.quantity * data.item.price }}
      </template>
      <template #cell(item)="data">
        {{ data.item.title }}<br />
        Item ID: {{ data.item.id }} eBay Item ID: {{ data.item.ebayItemId }} Location: {{ data.item.location }}
      </template>
    </b-table>

    <b-row fluid>
      <b-col xs="11"></b-col>
      <b-col class="text" style="text-align: right">
        Shipping Method: {{ order.shippingMethod }}<br />
        Subtotal: ${{ order.subtotal }}<br />
        Sales Tax: ${{ order.salesTax }}<br />
        Shipping: ${{ order.shippingCost }}<br />
        Total: ${{ order.total }}
      </b-col>
    </b-row>

    <b-row fluid style="margin-top: 10px">
      <b-col class="text">Use code BLUEDRAGON15 to take an extra 15% off 3+ items! (Expires Nov 1, 2022)</b-col>
      <b-col></b-col>
      <b-col class="text" style="text-align: right"><b-img src="/qr_code.png" height="50" width="50" /></b-col>
    </b-row>
  </b-container>
</template>
<script>
export default {
  props: {
    order: Object,
  },
  data() {
    return {
      fields: [
        { key: "item", label: "Item", tdClass: "cell", thClass: "header" },
        { key: "price", label: "Price", tdClass: "cell", thClass: "header" },
        { key: "quantity", label: "Qty", tdClass: "cell", thClass: "header" },
        { key: "extended", label: "Ext", tdClass: "cell", thClass: "header" },
      ],
    };
  },
};
</script>
<style>
.cell {
  font-size: 0.45em;
}

.header {
  font-size: 0.5em;
}
.text {
  font-size: 0.5em;
}
.address {
  font-size: 0.6em;
}

h1 {
  font-size: 0.75em !important;
}

#itemTable.table > tbody > tr > td,
#itemTable.table > thead > tr > th {
  padding: 2px;
}
</style>
