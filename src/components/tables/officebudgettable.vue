<script>
import OfficeBudgetTransaction from "../tables/officebudgettransactions.vue";
import createNumberMask from "text-mask-addons/dist/createNumberMask";
import MaskedInput from "vue-text-mask";

export default {
  props: {
    budgetline: {},
    isPosted: null,
  },
  components: {
    OfficeBudgetTransaction,
    MaskedInput,
  },
  data() {
    return {
      budgetItemFields: [
        {
          key: "prexc",
          sortable: true,
          filterByFormatted: true,
        },
        {
          key: "account",
          sortable: true,
          filterByFormatted: true,
        },
        {
          key: "datePosted",
          sortable: true,
          label: "Date Posted",
        },
        {
          key: "expiry",
          sortable: true,
          label: "Expiry Date",
        },
        {
          key: "status",
          sortable: true,
          label: "Status",
        },
        {
          key: "funds",
          sortable: true,
          label: "Funds",
        },
      ],
      alert: {
        type: null,
        message: null,
      },
      totalRows: 1,
      currentPage: 1,
      perPage: 10,
      pageOptions: [10, 25, 50, 100],
      filter: null,
      filterOn: [],
      sortDesc: false,
      tableBusy: false,
      transactionModal: false,
      revertModal: false,
      fundModal: false,
      office: null,
      budgetLineItem: null,
      officeBudgetTransaction: [],
      revertOptions: [
        { value: "fs", text: "Fund Source" },
        { value: "oe", text: "Object of Expenditure" },
      ],
      selectedOfficeBudget: null,
      transaction: {
        deliveryUnitBudgetItemId: null,
        amount: "0",
      },
      budgetTransaction: {
        deliveryUnitBudgetItemId: null,
        amount: "0",
        date: null,
        description: null,
      },
      currencyMask: createNumberMask({
        prefix: "",
        allowDecimal: true,
      }),
      selectedRevertOption: null,
      selectedBLI: null,
      submitted: false,
    };
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
    async viewTransaction(item) {
      const { data } = await this.$store.dispatch(
        "officebudgetitem/GetOfficeBudgetItemTransaction",
        item.id
      );
      this.officeBudgetTransaction = data;
      console.log(data);
      this.transactionModal = true;
    },
    postBudgetItem(item) {
      this.$swal({
        title: "Are you sure you want to post this budget item?",
        text: "Once posted, you will not be able to edit this budget item.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, post it!",
      }).then((result) => {
        if (result.isConfirmed) {
          this.$emit("post", item);
        }
      });
    },
    revert(item) {
      // console.log(item);
      this.selectedOfficeBudget = item;
      this.transaction.deliveryUnitBudgetItemId = item.id;
      this.transaction.amount = item.balance.toString();
      this.revertModal = true;
    },
    toggleRevertOption(item) {
      // console.log(item);
      this.selectedRevertOption = item;
    },
    saveRevert() {
      const trans = JSON.parse(JSON.stringify(this.transaction));
      if (
        Number(this.getExactAmt(trans.amount)) < 0 ||
        this.selectedRevertOption === null
      ) {
        this.alert = {
          type: "danger",
          message: "Please fill up all required fields.",
        };
        return;
      }
      if (Number(this.getExactAmt(trans.amount)) < 1) {
        this.alert = {
          type: "danger",
          message: "Amount cannot be less than to 1",
        };
        return;
      }
      if (Number(this.getExactAmt(trans.amount)) > this.selectedOfficeBudget.balance) {
        this.alert = {
          type: "danger",
          message:
            "The amount you entered is greater than the balance of the budget item.",
        };
        return false;
      }
      // this.transaction.amount = Number(this.transaction.amount);
      trans.amount = Number(this.getExactAmt(trans.amount));
      const data = {
        transaction: trans,
        revertOption: this.selectedRevertOption,
      };
      this.$store.dispatch("officebudgetitem/revertFunds", data).then((response) => {
        // console.log(response);
        this.budgetline.find(
          (item) => item.id === this.transaction.deliveryUnitBudgetItemId
        ).balance -= trans.amount;
        this.revertModal = false;
        this.alert.type = null;
        this.alert.message = null;
        this.transaction.amount = "0";
        this.$swal({
          title: "Success!",
          text: response.data,
          icon: "success",
        });
      });
    },
    async addBuget(record) {
      // console.log(record);
      const { data } = await this.$store.dispatch(
        "objectOfExpenditures/getSingleObjectOfExpenditures",
        record.objectOfExpenditureId
      );
      // console.log(data);
      this.selectedBLI = data;
      this.budgetTransaction.deliveryUnitBudgetItemId = record.id;
      // this.budgetTransaction.budgetLineItemId = record.budgetLineItemId;

      this.fundModal = true;
      // console.log(this.budgetTransaction);
    },
    saveFund() {
      const deliveryUnit = JSON.parse(JSON.stringify(this.budgetTransaction));
      if (Number(this.getExactAmt(deliveryUnit.amount)) < 1) {
        this.alert = {
          type: "danger",
          message: "Amount cannot be less than 1.",
        };
        return;
      }
      if (Number(this.getExactAmt(deliveryUnit.amount)) > this.selectedBLI.balance) {
        this.alert = {
          type: "danger",
          message:
            "The amount you entered is greater than the balance of the object expenditure.",
        };
        return false;
      }

      deliveryUnit.amount = Number(this.getExactAmt(this.budgetTransaction.amount));
      deliveryUnit.date = new Date().toISOString();
      /** debit to deliveryBudgetItem */

      deliveryUnit.description = "Addition of funds from object of Expenditure";

      // console.log(deliveryUnit);

      try {
        this.$store
          .dispatch("officebudgetitem/CreateOfficeBudgetItemTransaction", deliveryUnit)
          .then((response) => {
            this.budgetline.find(
              (item) => item.id === this.budgetTransaction.deliveryUnitBudgetItemId
            ).balance += deliveryUnit.amount;
            this.budgetline.find(
              (item) => item.id === this.budgetTransaction.deliveryUnitBudgetItemId
            ).allocated += deliveryUnit.amount;
            this.$swal({
              title: "Success",
              text: "Funds successfully added to delivery unit budget line item",
              icon: "success",
            });
            this.budgetTransaction.amount = "0";
          })
          .catch((e) => {
            this.$swal({
              title: "Error",
              text: e.message,
              icon: "error",
            });
          });
      } catch (e) {
        this.$swal({
          title: "Error",
          text: e.message,
          icon: "error",
        });
      }

      this.fundModal = false;
    },
    print(id) {
      this.$emit("print", id);
    },
    deleteBudgetItem(record) {
      this.tableBusy = true;
      this.$swal({
        title: "Are you sure you want to delete this budget item?",
        text: "Once deleted, you will not be able to edit this budget item.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      }).then((result) => {
        if (result.isConfirmed) {
          this.$emit("delete", record);
          this.tableBusy = false;
        }
      });
    },
    updateBudgetItem(record) {
      this.$emit("update", record);
    },
    filterTable(row, filter) {
      if (
        row.objectOfExpenditure.prexc.prexcName.toLowerCase().includes(filter) ||
        row.objectOfExpenditure.account.accountName.toLowerCase().includes(filter)
      ) {
        return true;
      } else {
        return false;
      }
    },
  },
  computed: {
    rows() {
      return this.budgetline.length;
    },
  },
  created() {
    this.tableBusy = true;
    if (this.budgetline) {
      this.tableBusy = false;
    }
  },
};
</script>
<template>
  <div>
    <div class="row mb-3">
      <div class="col-md-8">&nbsp;</div>
      <div class="col-md-4">
        <b-form-input
          v-model="filter"
          type="search"
          placeholder="Search Prexc or Account..."
        ></b-form-input>
      </div>
    </div>
    <b-table
      :items="budgetline"
      :fields="budgetItemFields"
      responsive="sm"
      :filter="filter"
      :filter-function="filterTable"
      :busy="tableBusy"
      @filtered="onFiltered"
      bordered
      outlined
      hover
      striped
      show-empty
    >
      <template #cell(prexc)="row">
        <span class="d-block"
          ><strong>Name: </strong>{{ row.item.objectOfExpenditure.prexc.prexcName }}</span
        >
        <span class="d-block"
          ><strong>UACS: </strong>{{ row.item.objectOfExpenditure.prexc.uacs }}</span
        >
        <span class="d-block"
          ><strong>Fund Source: </strong
          >{{ row.item.objectOfExpenditure.fundSource.sourceName }}</span
        >
        <hr class="my-1" />
        <span
          class="d-block"
          :class="[row.item.isExclusive ? 'text-info' : 'text-secondary']"
          ><strong>{{
            row.item.isExclusive ? "Exclusive" : "Not Exclusive"
          }}</strong></span
        >
        <span
          class="d-block"
          :class="[row.item.forCharging ? 'text-warning' : 'text-secondary']"
          ><small>{{
            row.item.forCharging
              ? "Centrally-Managed Items"
              : "Not Centrally-Managed Item"
          }}</small></span
        >
      </template>
      <template #cell(account)="row">
        <span class="d-block"
          ><strong>Name: </strong
          >{{ row.item.objectOfExpenditure.account.accountName }}</span
        >
        <span class="d-block"
          ><strong>UACS: </strong>{{ row.item.objectOfExpenditure.account.uacs }}</span
        >
        <span class="d-block"
          ><strong>Group: </strong
          >{{ row.item.objectOfExpenditure.account.accountGroup.groupName }}</span
        >
      </template>
      <template #cell(status)="row">
        <span
          :class="{
            'text-success': row.item.status.toLowerCase() === 'posted',
            'text-warning': row.item.status.toLowerCase() === 'pending',
          }"
          >{{ row.item.status.toUpperCase() }}</span
        >
      </template>
      <template #cell(funds)="row">
        <span class="d-block"
          ><em>Allocated: </em>{{ formatCurrency(row.item.allocated) }}</span
        >
        <span class="d-block"
          ><em>Balance: </em>{{ formatCurrency(row.item.balance) }}</span
        >
        <b-dropdown variant="success" size="sm" class="mt-3">
          <template slot="button-content">
            Options
            <i class="mdi mdi-chevron-down"></i>
          </template>
          <b-dropdown-item @click="viewTransaction(row.item)"
            ><i class="bx bx-list-ol font-size-16 align-middle me-2"></i> View
            Transaction</b-dropdown-item
          >
          <b-dropdown-item @click="print(row.item.id)"
            ><i class="bx bx-printer font-size-16 align-middle me-2"></i> Print
            RAOS</b-dropdown-item
          >
          <b-dropdown-item @click="addBuget(row.item)"
            ><i class="bx bx-money font-size-16 align-middle me-2"></i> Add
            Budget</b-dropdown-item
          >
          <b-dropdown-item
            @click="updateBudgetItem(row.item)"
            v-if="row.item.status.toLowerCase() !== 'posted'"
            ><i class="bx bx-edit font-size-16 text-warning align-middle me-2"></i
            >Edit</b-dropdown-item
          >
          <b-dropdown-item
            @click="updateBudgetItem(row.item)"
            v-if="row.item.status.toLowerCase() === 'posted'"
            ><i
              class="bx bx-fast-forward-circle font-size-16 text-warning align-middle me-2"
            ></i
            >Extend Expiry</b-dropdown-item
          >
          <b-dropdown-item
            @click="deleteBudgetItem(row.item)"
            v-if="row.item.status.toLowerCase() !== 'posted'"
            ><i class="bx bx-trash font-size-16 text-danger align-middle me-2"></i
            >Delete</b-dropdown-item
          >
          <b-dropdown-item
            @click="postBudgetItem(row.item)"
            v-if="row.item.status.toLowerCase() !== 'posted'"
            ><i class="bx bx-check font-size-16 text-success align-middle me-2"></i
            >Post</b-dropdown-item
          >
          <b-dropdown-item
            @click="revert(row.item)"
            v-if="row.item.status.toLowerCase() === 'posted'"
            ><i class="bx bx-x font-size-16 text-danger align-middle me-2"></i
            >Revert</b-dropdown-item
          >
        </b-dropdown>
      </template>
      <template #cell(datePosted)="row">
        <span>{{ formatDate(row.item.datePosted) }}</span>
      </template>
      <template #cell(expiry)="row">
        <span>{{ formatDate(row.item.expiry) }}</span>
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
    <!-- office transaction -->
    <b-modal
      v-model="transactionModal"
      title="Account Information"
      size="lg"
      title-class="font-18"
      hide-footer
    >
      <OfficeBudgetTransaction
        v-if="officeBudgetTransaction.length > 0"
        :transactions="officeBudgetTransaction"
      ></OfficeBudgetTransaction>
    </b-modal>
    <!-- Revert modal -->
    <b-modal v-model="revertModal" title="Revert funds" title-class="font-18" hide-footer>
      <b-alert
        :show="alert.type === 'danger'"
        dismissible
        @dismissed="alert.type = ''"
        variant="danger"
      >
        <i class="mdi mdi-alert-outline me-2"></i>{{ alert.message }}
      </b-alert>
      <p class="mb-1">
        <strong>Fund Source: </strong
        ><span class="text-success">{{
          selectedOfficeBudget
            ? selectedOfficeBudget.objectOfExpenditure.fundSource.sourceName
            : ""
        }}</span>
      </p>
      <p class="mb-1">
        <strong>PREXC: </strong>
        <span class="text-success">{{
          selectedOfficeBudget
            ? selectedOfficeBudget.objectOfExpenditure.prexc.prexcName
            : ""
        }}</span>
      </p>
      <p class="mb-3">
        <strong>Object of Expenditure: </strong
        ><span class="text-success">{{
          selectedOfficeBudget
            ? selectedOfficeBudget.objectOfExpenditure.account.accountName
            : ""
        }}</span>
      </p>
      <hr />
      <div class="mb-3">
        <label>Select Destination</label>
        <b-form-select
          class="form-select form-select-sm"
          size="sm"
          :options="revertOptions"
          @change="toggleRevertOption"
        >
        </b-form-select>
      </div>
      <div class="mb-3">
        <label>Amount</label>
        <!-- <b-form-input v-model.number="transaction.amount" type="number"> </b-form-input> -->
        <masked-input
          autocomplete="off"
          type="text"
          v-model="transaction.amount"
          placeholder="Enter Amount..."
          class="form-control"
          :mask="currencyMask"
        ></masked-input>
      </div>
      <div class="modal-footer">
        <b-button variant="primary" @click="saveRevert">Revert now</b-button>
        <b-button variant="link" @click="revertModal = !revertModal">Close</b-button>
      </div>
    </b-modal>
    <!-- Add Budget modal -->
    <b-modal title="Add Budget" v-model="fundModal" title-class="font-18" hide-footer>
      <b-alert
        :show="alert.type === 'danger'"
        dismissible
        @dismissed="alert.type = ''"
        variant="danger"
      >
        <i class="mdi mdi-alert-outline me-2"></i>{{ alert.message }}
      </b-alert>
      <p class="mb-1">
        <strong>Object of Expenditure: </strong
        ><span class="text-success">{{
          selectedBLI
            ? `${selectedBLI.account.uacs} - ${selectedBLI.account.accountName}`
            : ""
        }}</span>
      </p>
      <p class="mb-3">
        <strong>Balance: </strong
        ><span class="text-success">{{
          selectedBLI ? formatCurrency(selectedBLI.balance) : ""
        }}</span>
      </p>
      <div class="mb-3">
        <label>Amount</label>
        <!-- <b-form-input
          v-model.number="budgetTransaction.amount"
          type="number"
        ></b-form-input> -->
        <masked-input
          autocomplete="off"
          type="text"
          v-model="budgetTransaction.amount"
          placeholder="Enter Amount..."
          class="form-control"
          :mask="currencyMask"
        ></masked-input>
      </div>
      <div class="modal-footer">
        <b-button variant="primary" @click="saveFund">Add</b-button>
        <b-button variant="link" @click="fundModal = !fundModal">Close</b-button>
      </div>
    </b-modal>
  </div>
</template>

<style></style>
