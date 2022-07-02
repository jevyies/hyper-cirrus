<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import { required, minValue, decimal } from "vuelidate/lib/validators";
import DatePicker from "vue2-datepicker";
import last from "lodash/last";
import simplebar from "simplebar-vue";
import OfficeBudgetTable from "../../../components/tables/officebudgettable";
import "overlayscrollbars/css/OverlayScrollbars.css";
import { OverlayScrollbarsComponent } from "overlayscrollbars-vue";
import createNumberMask from "text-mask-addons/dist/createNumberMask";
import MaskedInput from "vue-text-mask";
const greaterThanZero = (value) => value.replace(/,/g, "") > 0;
import PrintOptions from "@/components/modals/print-options.vue";

export default {
  page: {
    title: "Office Budget",
  },
  components: {
    Layout,
    PageHeader,
    DatePicker,
    OfficeBudgetTable,
    simplebar,
    "overlay-scrollbars": OverlayScrollbarsComponent,
    MaskedInput,
    PrintOptions,
  },
  data() {
    return {
      title: "Office Budget Allocation",
      items: [
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Finance",
        },
        {
          text: "Office Budget",
          active: true,
        },
      ],
      campus: [],
      office: [],
      officeBudget: [],
      officeBudgetItems: [],
      postedOfficeBudgetItems: [],
      pendingOfficeBudgetItems: [],
      fields: [
        {
          key: "name",
          sortable: true,
          label: "Office",
        },
        {
          key: "actions",
          sortable: false,
          label: "Actions",
        },
      ],
      perPage: 10,
      currentPage: 1,
      sortBy: "id",
      sortDesc: false,
      filter: null,
      filterOn: [],
      tableBusy: false,
      totalRows: 1,
      budGetLineItemModal: false,
      bulkBudgetModal: false,
      selectedOffice: null,
      fundClusters: [],
      fundSource: [],
      outcomes: [],

      prexcs: [],
      bli: [],
      oe: [],
      transaction: {
        deliveryUnitBudgetItemId: null,
        amount: "0",
        date: null,
        description: null,
      },
      record: {
        deliveryUnitId: null,
        objectOfExpenditureId: null,
        expiry: Date.parse(new Date(new Date().getFullYear(), 11, 31)),
        isExclusive: false,
        forCharging: false,
      },
      alert: {
        type: "",
        message: "",
      },
      modalAlert: {
        show: false,
        type: "",
        message: "",
      },
      currencyMask: createNumberMask({
        prefix: "",
        allowDecimal: true,
      }),
      selectedBLIBalance: 0,
      submitted: false,
      loading: false,
      selectedFS: null,
      selectedPrexc: null,
      expenditureTable: [],
      overlay: false,
      updateExpenditureModal: false,
      updateExpenditure: {
        id: null,
        deliveryUnitId: null,
        objectOfExpenditureId: null,
        expiry: null,
        isExclusive: false,
        forCharging: false,
      },
      selectedDUOE: null,
    };
  },
  validations: {
    transaction: {
      amount: { required },
      description: { required },
    },
    record: {
      deliveryUnitId: { required },
      objectOfExpenditureId: { required },
      expiry: { required },
    },
    updateExpenditure: {
      expiry: { required },
    },
  },
  async created() {
    /** Retrieve all campus and map to select */

    const { data } = await this.$store.dispatch("campus/GetCampus");
    this.campus = data.map((item) => {
      return {
        text: item.campusName,
        value: item.id,
      };
    });
    this.campus.unshift({
      text: "Select Campus...",
      value: null,
    });
    /** Retrieve all campus and map to select */

    /** Retrieve all offices */
    // const offices = await this.$store.dispatch("office/GetOffice");
    const queries = {
      campusId: this.$store.state.data.campus.id,
      cycle: this.$store.getters["data/getCycle"],
    };

    const offices = await this.$store.dispatch(
      "officebudgetitem/GetOfficeBudgetItemByCampus",
      queries
    );
    this.office = offices.data;

    /** Retrieve all offices */

    /** Retrieve fund sources */
    const fundSources = await this.$store.dispatch("fundsource/GetFundSource");
    this.fundSource = fundSources.data.map((data) => ({
      text: data.sourceName,
      value: data.id,
    }));
    this.fundSource.unshift({
      text: "Select Fund Source...",
      value: null,
    });

    /** Fetch Fund Clusters */
    const fundCluster = await this.$store.dispatch("fundcluster/GetFundCluster");

    this.fundClusters = fundCluster.data.map((e) => ({
      value: e.id,
      text: e.cluster,
    }));
    this.fundClusters.unshift({
      value: null,
      text: "Select Fund Cluster...",
    });
    /** Fetch Outcomes */
    const outcomes = await this.$store.dispatch("outcome/GetOutcome");
    this.outcomes = outcomes.data.map((item) => ({
      value: item.id,
      text: item.outcomeName,
    }));
    this.outcomes.unshift({
      value: 0,
      text: "All",
    });
    this.outcomes.unshift({
      value: null,
      text: "Select Outcome...",
    });
  },
  computed: {
    rows() {
      return this.office.length;
    },
  },
  methods: {
    onFiltered(filteredItems) {
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    fetchOfficeBudgetItem(data) {
      // console.log(this.$store.getters["data/getCycle"], data);
    },

    async fetchPrexc(id) {
      this.prexcs = [];
      if (id) {
        this.loading = true;
        const { data } = await this.$store.dispatch("prexc/GetPrexcByFundSource", id);

        this.prexcs = data.map((item) => ({
          text: item.prexcName,
          value: item.id,
        }));
        if (this.prexcs.length > 0) {
          this.prexcs.unshift({
            text: "Select PREXC...",
            value: null,
            disabled: true,
          });
        } else {
          this.prexcs.unshift({
            text: "Fund Source has no PREXCs listed",
            value: null,
            disabled: true,
          });
        }
        this.loading = false;
      } else {
        this.prexcs = [];
      }
    },
    async fetchOE(id) {
      if (id) {
        this.loading = true;
        const item = {
          id: this.record.deliveryUnitId,
          cycle: this.$store.getters["data/getCycle"],
        };
        /** Retrieve all office budget item */
        const dataBLI = await this.$store.dispatch(
          "officebudgetitem/GetOfficeBudgetItemByOffice",
          item
        );

        const { data } = await this.$store.dispatch(
          "objectOfExpenditures/getObjectOfExpendituresByPrexcAndCycle",
          {
            prexcId: id,
            cycle: this.$store.getters["data/getCycle"],
            fundSourceId: this.selectedFS,
          }
        );

        if (dataBLI && data) {
          this.oe = data.map((item) => ({
            text: item.account.accountName,
            value: item.id,
            disabled: dataBLI.data.find((bli) => bli.budgetLineItemId === item.id)
              ? true
              : false,
          }));
        }

        if (this.oe.length > 0) {
          this.oe.unshift({
            text: "Select Object of Expenditures...",
            value: null,
            disabled: true,
          });
        } else {
          this.oe.unshift({
            text: "No Object of Expenditures listed",
            value: null,
            disabled: true,
          });
        }
        this.loading = false;
      } else {
        this.oe = [];
      }
    },
    async fethcBudgetItemInfo(item) {
      this.loading = true;
      this.selectedBLIBalance = 0;
      const { data } = await this.$store.dispatch(
        "objectOfExpenditures/getObjectOfExpenditureTransactionByExpenditureId",
        item
      );
      if (data) {
        this.selectedBLIBalance = data.length > 0 ? last(data).balance : 0;
      }
      this.record.objectOfExpenditureId = item;
      this.loading = false;
    },
    formatCurrency(data) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "PHP",
      }).format(data);
    },
    addBudget() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.transaction.$invalid) {
        return;
      } else {
        if (Number(this.getExactAmt(this.transaction.amount)) > this.selectedBLIBalance) {
          this.modalAlert = {
            show: true,
            type: "danger",
            message:
              "Amount is greater than the balance of the selected Object of Expenditure",
          };
          return;
        }
        if (Number(this.getExactAmt(this.transaction.amount)) < 1) {
          this.modalAlert = {
            show: true,
            type: "danger",
            message: "Amount should be greater than 0. Please try again",
          };
          return;
        }
        this.record.expiry = new Date(this.record.expiry).toISOString();
        this.transaction.date = new Date().toISOString();
        // this.transaction.amount = Number(this.transaction.amount);
        this.transaction.amount = this.getExactAmt(this.transaction.amount);

        /** Add on OfficeBudget
          officeId, budgetLineItemId, expiry
        */
        const officeBudgetItem = JSON.parse(JSON.stringify(this.record));

        // const budgetLineItemTransaction = JSON.parse(JSON.stringify(this.transaction));

        this.$store
          .dispatch("officebudgetitem/CreateOfficeBudgetItem", officeBudgetItem)
          .then((result) => {
            let newData = result.data;
            newData.allocated = this.getExactAmt(this.transaction.amount);
            newData.balance = this.getExactAmt(this.transaction.amount);
            this.officeBudgetItems.push(newData);
            /** Add on OfficeBudgetTransction
              type, description, date, amount, officeBudgetItemId
            */
            /** officeBudgetTransaction.officeBudgetItemId === get response from above */
            let officeBudgetTransaction = JSON.parse(JSON.stringify(this.transaction));
            officeBudgetTransaction.amount = Number(
              this.getExactAmt(officeBudgetTransaction.amount)
            );
            officeBudgetTransaction.deliveryUnitBudgetItemId = result.data.id;

            this.$store
              .dispatch(
                "officebudgetitem/CreateOfficeBudgetItemTransaction",
                officeBudgetTransaction
              )
              .then((res) => {
                this.office.find((item) => item.id === this.selectedOffice.id).balance +=
                  officeBudgetTransaction.amount;
                this.office.find(
                  (item) => item.id === this.selectedOffice.id
                ).allocated += officeBudgetTransaction.amount;
                this.selectedBLIBalance -= officeBudgetTransaction.amount;

                this.selectedFS = null;
                this.selectedPrexc = null;
                this.resetFields();
                this.showToast("Successfully added!", "success");
              })
              .catch((e) => {
                this.alert = { type: "danger", message: e + "inner" };
              });
          })
          .catch((e) => {
            this.alert = { type: "danger", message: e + "outer" };
          });
      }

      this.budGetLineItemModal = false;
    },
    async viewBudgetLines(record) {
      this.selectedOffice = record;
      this.record.deliveryUnitId = record.id;
      const item = {
        id: record.id,
        cycle: this.$store.getters["data/getCycle"],
      };
      /** Retrieve all office budget item */
      const { data } = await this.$store.dispatch(
        "officebudgetitem/GetOfficeBudgetItemByOffice",
        item
      );
      this.officeBudgetItems = data;

      // this.postedOfficeBudgetItems = filter(this.officeBudgetItems, ["status", startCase("posted")]);
      // this.pendingOfficeBudgetItems = filter(this.officeBudgetItems, ["status", startCase("pending")]);
    },
    async changeCycle(cycle) {
      if (this.selectedOffice) {
        const item = {
          id: this.selectedOffice.id,
          cycle: cycle,
        };
        /** Retrieve all office budget item */
        const { data } = await this.$store.dispatch(
          "officebudgetitem/GetOfficeBudgetItemByOffice",
          item
        );
        this.officeBudgetItems = data;
      }
    },
    hidebudGetLineItemModal() {
      this.prexcs = [];
      this.oe = [];
      this.record.expiry = null;
      this.transaction.amount = null;
      this.transaction.description = null;
      this.submitted = false;
      this.$v.$reset();
      this.budGetLineItemModal = false;
    },
    postBudgetItem(item) {
      this.$store
        .dispatch("officebudgetitem/PostOfficeBudgetItem", item.id)
        .then(() => {
          this.officeBudgetItems.find(
            (officeBudgetItem) => officeBudgetItem.id === item.id
          ).status = "Posted";
          // const record = JSON.parse(JSON.stringify(item));
          // record.status = "Posted";
          // this.pendingOfficeBudgetItems.splice(this.pendingOfficeBudgetItems.indexOf(item), 1);
          // this.postedOfficeBudgetItems.push(record);
          this.alert = {
            type: "success",
            message: "Budget successfully posted",
          };
        })
        .catch((e) => {
          this.alert = { type: "danger", message: e };
        });
    },
    resetFields() {
      this.transaction.deliveryUnitBudgetItemId = null;
      this.transaction.amount = "0";
      this.transaction.date = null;
      this.transaction.type = null;
      this.transaction.description = null;
      // this.record.deliveryUnitId = null;
      this.record.objectOfExpenditureId = null;
      this.record.expiry = Date.parse(new Date(new Date().getFullYear(), 11, 31));
      this.$v.$reset();
      this.submitted = false;
    },
    processFC(fc) {
      this.loading = true;
      this.fundSource = [];
      this.prexc = [];
      if (!fc) {
        this.loading = false;
        return;
      }

      this.$store
        .dispatch("fundsource/GetFundSourcePerCluster", fc)
        .then((response) => {
          this.fundSource = response.data.map((item) => ({
            value: item.id,
            text: item.sourceName,
          }));
          this.fundSource.unshift({
            value: null,
            text: "Select Fund Source...",
          });
          this.loading = false;
        })
        .catch((e) => {
          this.loading = false;
          this.alert = {
            type: "danger",
            message: "Oops. Something went wrong. Please contact your administrator",
          };
        });
    },
    processOutcomes(outcome) {
      this.loading = true;
      this.selectedPrexc = null;
      if (outcome === null) {
        this.loading = false;
        return;
      }
      this.prexcs = [];
      if (outcome === 0) {
        this.$store
          .dispatch("prexc/GetPrexc")
          .then((response) => {
            this.prexcs = response.data.map((item) => ({
              value: item.id,
              text: item.prexcName,
            }));
            this.prexcs.unshift({
              value: null,
              text: "Select Prexc...",
            });
            this.loading = false;
          })
          .catch(() => {
            this.loading = false;
            this.alert = {
              show: true,
              variant: "danger",
              message:
                "Oops. Something went wrong. Cannot load all PREXC. Please contact your administrator",
            };
          });
      } else {
        this.$store
          .dispatch("prexc/GetPrexcByOutcome", outcome)
          .then((response) => {
            this.prexcs = response.data.map((item) => ({
              value: item.id,
              text: item.prexcName,
            }));
            this.prexcs.unshift({
              value: null,
              text: "Select Prexc...",
            });
            this.loading = false;
          })
          .catch((e) => {
            this.loading = false;
            this.alert = {
              show: true,
              variant: "danger",
              message:
                "Oops. Something went wrong. Cannot load all PREXC. Please contact your administrator",
            };
          });
      }
      this.overlay = false;
    },
    processRequest() {
      if (!this.selectedFS || !this.selectedPrexc) {
        return;
      }
      this.fetchOE(this.selectedPrexc);
    },
    async addObjects() {
      if (!this.selectedFS || !this.selectedPrexc) {
        return;
      }
      this.expenditureTable = [];
      const item = {
        id: this.record.deliveryUnitId,
        cycle: this.$store.getters["data/getCycle"],
      };
      /** Retrieve all office budget item */
      const dataBLI = await this.$store.dispatch(
        "officebudgetitem/GetOfficeBudgetItemByOffice",
        item
      );

      const { data } = await this.$store.dispatch(
        "objectOfExpenditures/getObjectOfExpendituresByPrexcAndCycle",
        {
          prexcId: this.selectedPrexc,
          fundSourceId: this.selectedFS,
          cycle: this.$store.getters["data/getCycle"],
        }
      );
      /** remove data that has records on dataBLI */
      const dataBLIIds = dataBLI.data.map((item) => item.objectOfExpenditureId);
      const dataFiltered = data.filter((item) => !dataBLIIds.includes(item.id));
      this.expenditureTable = dataFiltered.map((item) => ({
        id: item.id,
        name: item.account.accountName,
        uacs: item.account.uacs,
        isExclusive: false,
        forCharging: false,
        expiry: new Date(new Date().getFullYear(), 11, 31),
      }));
    },
    deleteObject(item) {
      this.expenditureTable.splice(this.expenditureTable.indexOf(item), 1);
    },
    saveBulk() {
      this.overlay = true;
      const record = this.expenditureTable.map((item) => ({
        deliveryUnitId: this.selectedOffice.id,
        objectOfExpenditureId: item.id,
        isExclusive: item.isExclusive,
        forCharging: item.forCharging,
        expiry: new Date(item.expiry).toISOString(),
      }));

      this.$store
        .dispatch("officebudgetitem/createMultipleDeliveryUnitBudgetItem", record)
        .then(async (response) => {
          if (response.data.error) {
            this.alert = {
              show: true,
              variant: "danger",
              message: `Cannot proceed to save. ${response.data.errorMessage}. Please contact your administrator`,
            };
            return;
          }

          const { data } = await this.$store.dispatch(
            "officebudgetitem/GetOfficeBudgetItemByOffice",
            {
              id: this.selectedOffice.id,
              cycle: this.$store.getters["data/getCycle"],
            }
          );
          this.officeBudgetItems = data;
          this.expenditureTable = [];
          this.selectedFS = null;
          this.selectedPrexc = null;
          this.bulkBudgetModal = false;
          this.overlay = false;
          this.alert = {
            show: true,
            variant: "success",
            message: "Budget successfully created",
          };
        })
        .catch(() => {
          this.overlay = false;
          this.bulkBudgetModal = false;
          this.alert = {
            show: true,
            variant: "danger",
            message:
              "Oops. Something went wrong. Cannot add budget items to delivery unit. Please contact your administrator",
          };
        });
    },
    multipleOffices() {
      /**
       * 1. Filter fund cluster, fund source
       * 2. Filter Outcomes and PREXC and OE
       * 3. get all Delivery units
       * 4. Show modal */
    },
    multipleExpenditures() {
      this.bulkBudgetModal = true;
    },
    async print(id) {
      this.$refs.printOpt.putOptions({
        apiUrl: "/Finance/DeliveryUnitBudgetItem/Print/RAOS/DeliveryUnit",
        routeVariables: [id],
      });
      this.$bvModal.show("print-options-modal");
    },
    deleteBudgetItem(record) {
      this.$store
        .dispatch("officebudgetitem/DeleteOfficeBudgetItem", record.id)
        .then((response) => {
          if (response.data.error) {
            this.showToast(response.data.errorMessage, "danger");
            return;
          }
          this.officeBudgetItems.splice(this.officeBudgetItems.indexOf(record), 1);
          this.showToast("Budget item successfully deleted", "success");
        })
        .catch(() => {
          this.showToast(
            "Something went wrong. Cannot delete delivery unit budget item. Please contact your administrator",
            "danger"
          );
        });
    },
    updateBudgetItem(record) {
      this.updateExpenditure = {
        id: record.id,
        deliveryUnitId: record.deliveryUnitId,
        objectOfExpenditureId: record.objectOfExpenditureId,
        expiry: new Date(record.expiry).toISOString(),
        isExclusive: record.isExclusive,
        forCharging: record.forCharging,
      };

      this.selectedDUOE = record;
      this.updateExpenditureModal = true;
      // show modal
    },
    saveUpdatedExpenditure() {
      this.submitted = true;
      this.$v.updateExpenditure.$touch();
      if (this.$v.updateExpenditure.$invalid) {
        return;
      } else {
        this.updateExpenditure.expiry = new Date(
          this.updateExpenditure.expiry
        ).toISOString();
        this.$store
          .dispatch("officebudgetitem/UpdateOfficeBudgetItem", this.updateExpenditure)
          .then((response) => {
            if (response.data.error) {
              this.showToast(response.data.errorMessage, "danger");
              return;
            }
            const item = {
              id: this.selectedOffice.id,
              cycle: this.$store.getters["data/getCycle"],
            };
            /** Retrieve all office budget item */
            this.$store
              .dispatch("officebudgetitem/GetOfficeBudgetItemByOffice", item)
              .then((response) => {
                this.officeBudgetItems = response.data;
                this.showToast("Budget item successfully updated", "success");
                this.updateExpenditureModal = false;
              });
          });
      }
    },
  },
};
</script>

<template>
  <Layout @changeCycle="changeCycle">
    <PageHeader :title="title" :items="items" />
    <!-- Add all alerts here -->
    <div class="row no-gutters">
      <div class="col-md-12">
        <!-- Alert here -->
        <b-alert
          :show="alert.type === 'success'"
          dismissible
          @dismissed="alert.type = ''"
          variant="success"
        >
          <i class="mdi mdi-check-all me-2"></i>{{ alert.message }}
        </b-alert>
        <b-alert
          :show="alert.type === 'danger'"
          dismissible
          @dismissed="alert.type = ''"
          variant="danger"
        >
          <i class="mdi mdi-block-helper me-2"></i>{{ alert.message }}
        </b-alert>
        <b-alert
          :show="alert.type === 'warning'"
          dismissible
          @dismissed="alert.type = ''"
          variant="warning"
        >
          <i class="mdi mdi-alert-outline me-2"></i>{{ alert.message }}
        </b-alert>
      </div>
    </div>
    <!-- Add Budget Line Item -->
    <b-modal
      id="modal-standard"
      v-model="budGetLineItemModal"
      title="Add Budget Item"
      size="lg"
      title-class="font-18"
      hide-footer
      no-close-on-esc
      no-close-on-backdrop
      hide-header-close
    >
      <div class="row">
        <div class="col-md-12">
          <b-alert :show="modalAlert.show" :variant="modalAlert.type" dismissible>{{
            modalAlert.message
          }}</b-alert>
        </div>
      </div>
      <p class="mb-1">
        <strong>Office: </strong
        ><span class="text-success" v-if="selectedOffice">{{ selectedOffice.name }}</span>
      </p>
      <p class="mb-3">
        <strong>Budget Line Item Balance: </strong>
        <span class="text-success">{{ formatCurrency(selectedBLIBalance) }}</span>
      </p>
      <hr />
      <div class="row">
        <!-- Funds -->
        <div class="col-md-6 mt-2">
          <b-overlay :show="loading" rounded="sm" :opacity="0.5">
            <div class="mb-3">
              <label>Fund Cluster</label>
              <b-form-select
                class="form-select form-select-sm"
                size="sm"
                :options="fundClusters"
                @change="processFC"
              >
              </b-form-select>
            </div>
            <div class="mb-3">
              <label>Fund Source</label>
              <b-form-select
                class="form-select form-select-sm"
                size="sm"
                :options="fundSource"
                v-model="selectedFS"
                @change="processRequest"
              >
              </b-form-select>
            </div>
            <div class="mb-3">
              <label>Outcomes</label>
              <b-form-select
                class="form-select form-select-sm"
                size="sm"
                :options="outcomes"
                @change="processOutcomes"
              >
              </b-form-select>
            </div>
            <div class="mb-3">
              <label>PREXC</label>
              <b-form-select
                class="form-select form-select-sm"
                size="sm"
                :options="prexcs"
                v-model="selectedPrexc"
                @change="processRequest"
              >
              </b-form-select>
            </div>
          </b-overlay>
        </div>
        <!-- Details -->
        <div class="col-md-6">
          <div class="mb-3">
            <label>Object of Expenditure</label>
            <b-form-select
              class="form-select form-select-sm"
              v-model="record.objectOfExpenditureId"
              size="sm"
              :options="oe"
              @change="fethcBudgetItemInfo"
              :class="{
                'is-invalid': submitted && $v.record.objectOfExpenditureId.$error,
              }"
            >
            </b-form-select>
            <div
              v-if="submitted && $v.record.objectOfExpenditureId.$error"
              class="invalid-feedback"
            >
              <span v-if="!$v.record.objectOfExpenditureId.required"
                >This value is required.</span
              >
            </div>
          </div>
          <div class="mb-3">
            <label>Expiry Date:</label>
            <date-picker
              :first-day-of-week="1"
              lang="en"
              value-type="timestamp"
              format="YYYY-MM-DD"
              v-model="record.expiry"
              :class="{
                'is-invalid': submitted && $v.record.expiry.$error,
              }"
            ></date-picker>
            <div v-if="submitted && $v.record.expiry.$error" class="invalid-feedback">
              <span v-if="!$v.record.expiry.required">This value is required.</span>
            </div>
          </div>
          <div class="mb-3">
            <label>Amount:</label>
            <!-- <b-form-input
              class="form-control"
              v-model.number="transaction.amount"
              :class="{
                'is-invalid': submitted && $v.transaction.amount.$error,
              }"
            ></b-form-input> -->.
            <masked-input
              autocomplete="off"
              type="text"
              v-model="transaction.amount"
              placeholder="Enter Amount..."
              class="form-control"
              :class="{
                'is-invalid': submitted && $v.transaction.amount.$error,
              }"
              :mask="currencyMask"
            ></masked-input>
            <div
              v-if="submitted && $v.transaction.amount.$error"
              class="invalid-feedback"
            >
              <span v-if="!$v.transaction.amount.required">This value is required.</span>
              <!-- <span v-if="!$v.transaction.amount.greaterThanZero"
                >This value must be greater than zero.</span
              > -->
            </div>
          </div>
          <div class="mb-3">
            <label>Description:</label>
            <b-form-input
              class="form-control"
              v-model="transaction.description"
              :class="{
                'is-invalid': submitted && $v.transaction.description.$error,
              }"
            ></b-form-input>
            <div
              v-if="submitted && $v.transaction.description.$error"
              class="invalid-feedback"
            >
              <span v-if="!$v.transaction.description.required"
                >This value is required.</span
              >
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-md-12">
          <b-form-checkbox v-model="record.isExclusive" switch>
            <span class="ms-3"
              >Tick check if line item is only available on same target</span
            >
          </b-form-checkbox>
        </div>
        <div class="col-md-12">
          <b-form-checkbox v-model="record.forCharging" switch>
            <span class="ms-3">For Charging</span>
          </b-form-checkbox>
        </div>
      </div>
      <div class="modal-footer">
        <b-button variant="primary" @click="addBudget">Add Budget</b-button>
        <b-button variant="link" @click="hidebudGetLineItemModal">Close</b-button>
      </div>
    </b-modal>
    <!-- Add Budget Line Item -->
    <!-- Bulk Budget Expenditures -->
    <b-modal
      v-model="bulkBudgetModal"
      title="Add Bulk Budget Line Item"
      size="lg"
      title-class="font-18"
      hide-footer
      no-close-on-esc
      no-close-on-backdrop
      hide-header-close
    >
      <div class="row">
        <div class="col-md-6">
          <b-card>
            <b-card-title class="font-size-13 mb-3">Funds</b-card-title>
            <b-card-text>
              <div class="mb-3">
                <label>Fund Cluster</label>
                <b-form-select
                  class="form-select form-select-sm"
                  size="sm"
                  :options="fundClusters"
                  @change="processFC"
                >
                </b-form-select>
              </div>
              <div class="mb-3">
                <label>Fund Source</label>
                <b-form-select
                  class="form-select form-select-sm"
                  size="sm"
                  :options="fundSource"
                  v-model="selectedFS"
                >
                </b-form-select>
              </div>
            </b-card-text>
          </b-card>
        </div>
        <div class="col-md-6">
          <b-card>
            <b-card-title class="font-size-13 mb-3">Prexc</b-card-title>
            <b-card-text>
              <div class="mb-3">
                <label>Outcomes</label>
                <b-form-select
                  class="form-select form-select-sm"
                  size="sm"
                  :options="outcomes"
                  @change="processOutcomes"
                >
                </b-form-select>
              </div>
              <div class="mb-3">
                <label>PREXC</label>
                <b-form-select
                  class="form-select form-select-sm"
                  size="sm"
                  :options="prexcs"
                  v-model="selectedPrexc"
                  @change="addObjects"
                >
                </b-form-select>
              </div>
            </b-card-text>
          </b-card>
        </div>
      </div>

      <div class="mb-3">
        <p v-if="expenditureTable">
          <strong>NOTE! </strong>
          <small>
            <i class="text-warning"
              >Make sure to remove object of expenditures that are not related to
              transaction.</i
            ></small
          >
        </p>
        <overlay-scrollbars style="height: 300px">
          <div class="table-responsive">
            <table class="table table-sm align-middle">
              <thead class="table-light">
                <tr>
                  <th>UACS</th>
                  <th>Expenditure/Account</th>
                  <th>Exclusive?</th>
                  <th>For Charging</th>
                  <th class="text-center">Expiry</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="item in expenditureTable" :key="item.id">
                  <td>{{ item.uacs }}</td>
                  <td>{{ item.name }}</td>
                  <td class="text-center">
                    <b-form-checkbox v-model="item.isExclusive"> </b-form-checkbox>
                  </td>
                  <td class="text-center">
                    <b-form-checkbox v-model="item.forCharging"> </b-form-checkbox>
                  </td>
                  <td>
                    <date-picker
                      :first-day-of-week="1"
                      lang="en"
                      value-type="date"
                      v-model="item.expiry"
                    ></date-picker>
                  </td>
                  <td>
                    <b-button variant="link" @click="deleteObject(item)">
                      <i class="bx bx-trash text-danger"></i>
                    </b-button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </overlay-scrollbars>
      </div>
      <div class="modal-footer">
        <b-button variant="primary" @click="saveBulk">Save</b-button>
        <b-button variant="link" @click="bulkBudgetModal = !bulkBudgetModal"
          >Close</b-button
        >
      </div>
    </b-modal>
    <!-- Bulk Budget Expenditures -->
    <!-- Update Expenditure -->
    <b-modal
      v-model="updateExpenditureModal"
      v-if="selectedDUOE"
      :title="`Update Expenditure for ${selectedDUOE.deliveryUnit.name}`"
      title-class="font-18"
      size="lg"
      hide-footer
      no-close-on-esc
      no-close-on-backdrop
      hide-header-close
    >
      <div class="row">
        <div class="col-lg-6">
          <div class="mb-3">
            <p class="mb-0">
              <span>PREXC: </span>
              <span class="text-warning">{{
                selectedDUOE.objectOfExpenditure.prexc.prexcName
              }}</span>
            </p>
            <p class="mb-0">
              <span>UACS: </span>
              <span class="text-warning">{{
                selectedDUOE.objectOfExpenditure.prexc.uacs
              }}</span>
            </p>
            <p class="mb-0">
              <span>Fund Source: </span>
              <span class="text-warning">{{
                selectedDUOE.objectOfExpenditure.fundSource.sourceName
              }}</span>
            </p>
          </div>
        </div>
        <div class="col-lg-6">
          <div class="mb-3">
            <p class="mb-0">
              <span>PREXC: </span>
              <span class="text-warning">{{
                selectedDUOE.objectOfExpenditure.prexc.prexcName
              }}</span>
            </p>
            <p class="mb-0">
              <span>UACS: </span>
              <span class="text-warning">{{
                selectedDUOE.objectOfExpenditure.prexc.uacs
              }}</span>
            </p>
            <p class="mb-0">
              <span>Fund Source: </span>
              <span class="text-warning">{{
                selectedDUOE.objectOfExpenditure.fundSource.sourceName
              }}</span>
            </p>
          </div>
        </div>
      </div>
      <!-- PREXC -->
      <hr />

      <div class="mb-3">
        <label>Expiry Date:</label>
        <date-picker
          :first-day-of-week="1"
          lang="en"
          value-type="YYYY-MM-DD"
          format="YYYY-MM-DD"
          v-model="updateExpenditure.expiry"
          :class="{
            'is-invalid': submitted && $v.updateExpenditure.expiry.$error,
          }"
        ></date-picker>
        <div
          v-if="submitted && $v.updateExpenditure.expiry.$error"
          class="invalid-feedback"
        >
          <span v-if="!$v.updateExpenditure.expiry.required"
            >This value is required.</span
          >
        </div>
      </div>
      <div class="row">
        <div class="col-md-12">
          <b-form-checkbox v-model="updateExpenditure.isExclusive" switch>
            <span class="ms-3"
              >Tick check if line item is only available on same target</span
            >
          </b-form-checkbox>
        </div>
        <div class="col-md-12">
          <b-form-checkbox v-model="updateExpenditure.forCharging" switch>
            <span class="ms-3">Centrally-Managed Items</span>
          </b-form-checkbox>
        </div>
      </div>
      <div class="modal-footer">
        <b-button variant="primary" @click="saveUpdatedExpenditure">
          <i class="bx bx-save align-middle me-2"></i>
          Update</b-button
        >
        <b-button variant="link" @click="updateExpenditureModal = !updateExpenditureModal"
          >Close</b-button
        >
      </div>
    </b-modal>
    <!-- Update Expenditure -->
    <!-- Add all alerts here -->

    <!-- Contents here -->
    <div class="row mt-3">
      <div class="col-md-4">
        <b-card>
          <template #header v-if="selectedOffice">
            <h5 class="mt-3 mb-2">Offices</h5>
          </template>
          <b-card-text>
            <div class="row mb-3">
              <div class="col-md-6 text-md-start">
                <b-form-input
                  v-model="filter"
                  type="search"
                  placeholder="Search office..."
                ></b-form-input>
              </div>
              <!-- <div class="col-md-6 text-end">
                <b-button variant="link">
                  <i class="bx bx-plus"></i> Add bulk delivery units</b-button
                >
              </div> -->
            </div>
            <!-- Contents here -->
            <simplebar style="max-height: 500px">
              <div class="table-responsive mb-0 mt-3">
                <b-table
                  :items="office"
                  :fields="fields"
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
                  <template #table-busy>
                    <div class="d-flex justify-content-center align-items-center">
                      <div class="preloader-component me-2">
                        <div class="status">
                          <div class="spinner-chase w-20px h-20px">
                            <div class="chase-dot"></div>
                            <div class="chase-dot"></div>
                            <div class="chase-dot"></div>
                            <div class="chase-dot"></div>
                            <div class="chase-dot"></div>
                            <div class="chase-dot"></div>
                          </div>
                        </div>
                      </div>
                      <strong>Loading...</strong>
                    </div>
                  </template>
                  <template #cell(name)="row">
                    <span
                      ><strong>{{ row.item.shortName }}</strong> -
                      {{ row.item.name }}</span
                    >
                    <p class="mb-0 mt-3">
                      <span>Allocated: </span
                      ><strong class="text-warning">{{
                        formatCurrency(row.item.allocated)
                      }}</strong>
                    </p>
                    <!-- <p class="my-0">
                      <strong>Balance: </strong
                      ><span>{{ formatCurrency(row.item.balance) }}</span>
                    </p> -->
                  </template>
                  <template #cell(actions)="row">
                    <div class="float-end">
                      <b-dropdown
                        id="dropdown-dropleft"
                        right
                        variant="link"
                        toggle-class="text-decoration-none"
                        menu-class="dropdown-menu-end"
                        no-caret
                      >
                        <template #button-content>
                          <i class="fas fa-ellipsis-v"></i>
                        </template>

                        <b-dropdown-item @click="viewBudgetLines(row.item)" variant="dark"
                          ><i class="mdi mdi-bank-transfer font-size-18 me-1"></i>View
                          Expenditures</b-dropdown-item
                        >
                        <!-- <b-dropdown-item
                          @click="showbudGetLineItemModal(row.item)"
                          variant="dark"
                          ><i class="mdi mdi-cash-plus font-size-18 me-1"></i>Add
                          Budget</b-dropdown-item
                        > -->
                      </b-dropdown>
                    </div>
                  </template>
                  <template #row-details="row">
                    <b-card>
                      <b-card-title>Office Budget Items</b-card-title>
                      <b-card-text>{{ row }}</b-card-text>
                    </b-card>
                  </template>
                </b-table>
              </div>
            </simplebar>
            <!-- Contents here -->
          </b-card-text>
        </b-card>
      </div>
      <div class="col-md-8">
        <b-overlay :show="overlay" rounded="sm">
          <b-card>
            <template #header v-if="selectedOffice">
              <div class="row">
                <div class="col-md-6">
                  <h5 class="mt-1">
                    Office Budget Details - {{ selectedOffice.name }} ({{
                      selectedOffice.shortName
                    }})
                  </h5>
                </div>
                <div class="col-md-6 text-end">
                  <b-dropdown
                    id="dropdown-dropleft"
                    right
                    variant="primary"
                    size="sm"
                    toggle-class="text-decoration-none"
                    menu-class="dropdown-menu-end"
                    no-caret
                    class="mt-1"
                  >
                    <template #button-content>
                      Options <i class="mdi mdi-chevron-down"></i>
                    </template>
                    <b-dropdown-item @click="budGetLineItemModal = !budGetLineItemModal"
                      ><i class="bx bx-chevrons-right me-1"></i>Add Single
                      Expenditures</b-dropdown-item
                    >
                    <b-dropdown-item @click="multipleExpenditures"
                      ><i class="bx bx-list-plus me-1"></i>Add Bulk
                      Expenditures</b-dropdown-item
                    >
                  </b-dropdown>
                </div>
              </div>
            </template>
            <b-card-text>
              <div class="row">
                <div class="col-md-12">
                  <!-- Budget Items List -->
                  <!-- <b-card> -->
                  <OfficeBudgetTable
                    :budgetline="officeBudgetItems"
                    :isPosted="false"
                    @post="postBudgetItem"
                    @print="print"
                    @delete="deleteBudgetItem"
                    @update="updateBudgetItem"
                  ></OfficeBudgetTable>
                  <!-- </b-card> -->
                </div>
              </div>
            </b-card-text>
          </b-card>
        </b-overlay>
      </div>
    </div>
    <print-options ref="printOpt"></print-options>
    <!-- Add all dialog box here -->
    <!-- Add all dialog box here -->
  </Layout>
</template>

<style scoped></style>
