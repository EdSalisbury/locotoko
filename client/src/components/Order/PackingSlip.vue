<template>
  <b-container fluid class="p-0" id="packing-slip">
    <b-row fluid>
      <b-col fluid class="text">
        thebluedragonshoard.com<br />
        info@thebluedragonshoard.com<br />
        Twitter: @BluDragonsHoard
      </b-col>
      <b-col fluid>
        <b-img fluid src="/logo.png" style="margin-top: 5px" />
      </b-col>
      <b-col fluid class="text" style="text-align: right">
        4518 South Valdai Circle<br />
        Aurora, CO 80015<br />
        (720) 515-2435
      </b-col>
    </b-row>

    <b-row class="m-0 p-0">
      <b-col xs="6" class="m-0 pl-0 pr-2 address">
        <h1>Ship To:</h1>
        {{ order.address.Name }}<br />
        {{ order.address.Street1 }}<br />
        {{ order.address.Street2 }}<br v-if="order.address.Street2" />
        {{ order.address.CityName }},
        {{ order.address.StateOrProvince }}
        {{ order.address.PostalCode }}
      </b-col>
      <b-col xs="6" class="m-0 pl-0 pr-2 address" style="text-align: right">
        <h1>Order ID: {{ order.id }}</h1>
        <h1>Shipped Date: {{ new Date(Date.now()).toLocaleString().split(",")[0] }}</h1>
      </b-col>
    </b-row>

    <b-table :items="order.items" :fields="fields" striped bordered style="margin-top: 10px" id="itemTable">
      <template #cell(price)="data"> ${{ data.item.price.toFixed(2) }} </template>
      <template #cell(extended)="data"> ${{ (data.item.quantity * data.item.price).toFixed(2) }} </template>

      <template #cell(item)="data">
        {{ data.item.title }}<br />
        Item ID: {{ data.item.id }} eBay Item ID: {{ data.item.ebayItemId }} Location: {{ data.item.location }}
      </template>
    </b-table>

    <b-row fluid>
      <b-col xs="11"></b-col>
      <b-col class="text" style="text-align: right">
        Shipping Method: {{ order.shippingMethod }}<br />
        Subtotal: ${{ order.subtotal.toFixed(2) }}<br />
        Sales Tax: ${{ order.salesTax.toFixed(2) }}<br />
        Shipping: ${{ order.shippingCost.toFixed(2) }}<br />
        Total: ${{ order.total.toFixed(2) }}
      </b-col>
    </b-row>

    <b-row fluid style="margin-top: 10px">
      <b-col xs="8" class="text">Come back often to see what new items we have in stock!</b-col>

      <b-col xs="4" class="text" style="text-align: right"><b-img src="/qr_code.png" width="150" height="150" /></b-col>
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
  font-size: 1.1em;
  color: black;
}

.header {
  font-size: 1.1em;
  color: black;
}
.text {
  font-size: 1.1em;
  color: black;
}
.address {
  font-size: 1.1em;
  color: black;
}

h1 {
  font-size: 1.1em !important;
  font-weight: 1000;
  color: black;
}

#itemTable.table > tbody > tr > td,
#itemTable.table > thead > tr > th {
  padding: 5px;
}
</style>
