<script>
export default {
  props: {
    transactions: {},
    isPosted: null,
  },
  data() {
    return {
      budgetItemFields: [
        {
          key: "id",
          sortable: true,
          label: "ID",
        },
        {
          key: "description",
          sortable: true,
          label: "Description",
        },
        {
          key: "date",
          sortable: true,
          label: "Date",
        },
        {
          key: "debit",
          sortable: true,
          label: "Debit",
        },
        {
          key: "credit",
          sortable: true,
          label: "Credit",
        },
        {
          key: "balance",
          sortable: true,
        },
      ],
      totalRows: 1,
      currentPage: 1,
      perPage: 10,
      pageOptions: [10, 25, 50, 100],
      filter: null,
      filterOn: [],
      sortDesc: false,
      tableBusy: false,
    };
  },
  computed: {
    rows() {
      return this.transactions.length;
    },
  },
  methods: {
    onFiltered(filteredItems) {
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    formatCurrency(data) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "PHP",
      }).format(data);
    },
    formatDate(data) {
      return new Date(data).toLocaleDateString("en-US");
    },
  },
};
</script>

<template>
  <div>
    <b-table
      :items="transactions"
      :fields="budgetItemFields"
      responsive="sm"
      :filter="filter"
      :filter-included-fields="filterOn"
      :busy="tableBusy"
      @filtered="onFiltered"
      bordered
      outlined
      hover
      striped
      show-empty
    >
      <template #cell(date)="row">
        <span>{{ formatDate(row.item.date) }}</span>
      </template>
      <template #cell(debit)="row">
        <span>{{ formatCurrency(row.item.debit) }}</span>
      </template>
      <template #cell(credit)="row">
        <span>{{ formatCurrency(row.item.credit) }}</span>
      </template>
      <template #cell(balance)="row">
        <span>{{ formatCurrency(row.item.balance) }}</span>
      </template>
    </b-table>
    <div class="row">
      <div class="col">
        <div class="dataTables_paginate paging_simple_numbers float-end">
          <ul class="pagination pagination-rounded mb-0">
            <!-- pagination -->
            <b-pagination
              v-model="currentPage"
              :total-rows="rows"
              :per-page="perPage"
            ></b-pagination>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
