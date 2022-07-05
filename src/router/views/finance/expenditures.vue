<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import PrexcTransactions from "@/components/tables/prexctransactions";
import { uniqueId, map } from "lodash";
import Treeselect from "@riophae/vue-treeselect";
import Prexcs from "@/components/tables/prexcs";
// import the styles
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  page: {
    title: "Object Expenditures",
  },
  components: {
    Layout,
    PageHeader,
    Treeselect,
    PrexcTransactions,
    Prexcs,
  },
  data() {
    return {
      title: "Object Expenditures",
      items: [
        {
          text: "Dashboards",
          href: "/",
        },
        {
          text: "Object Expenditures",
          active: true,
        },
      ],
      alert: {
        show: false,
        variant: "",
        message: "",
      },
      cycle: null,
      fundCluster: [],
      fundSources: [],
      prexc: [],
      expendituresByFS: [],
      outcomes: [],
      availablePrexc: [],
      availablePrexcConsist: "LEAF_PRIORITY",
      selectedFundCluster: null,
      selectedFundSource: null,
      selectedFS: null,
      selectedPrexc: null,
      selectedPrexcId: null,
      selectedOutcome: null,
      objectOfExpenditures: [],
      newData: [],
      selected: null,
      fields: [
        {
          key: "outcomeName",
          sortable: true,
          tdClass: "col-md-11",
        },
        // {
        //   key: "group",
        //   label: "Accout group",
        //   sortable: true,
        // },
        // {
        //   key: "balance",
        //   label: "Balance",
        //   sortable: true,
        //   tdClass: "text-warning",
        // },
        // {
        //   key: "actions",
        //   label: "",
        //   sortable: true,
        // },
      ],
      totalRows: 1,
      currentPage: 1,
      perPage: 25,
      pageOptions: [10, 25, 50, 100],
      filter: null,
      filterOn: [],
      sortBy: "classification",
      sortDesc: false,
      tableBusy: false,
      overlay: false,
      listOverlay: false,
      addModal: false,
      transactionModal: false,
      objectExpenditure: null,
      OETransactions: [],
      fundSourceBalance: 0,
      showFilters: false,
    };
  },
  computed: {
    rows() {
      return this.objectOfExpenditures.length;
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
    checkExpiry(data) {
      return new Date() < new Date(data) ? true : false;
    },
    changeCycle(cycle) {
      this.cycle = cycle;
    },
    processFC(fc) {
      this.overlay = true;
      this.fundSources = [];
      this.prexc = [];
      if (!fc) {
        this.overlay = false;
        return;
      }

      this.$store
        .dispatch("fundsource/GetFundSourcePerCluster", fc)
        .then((response) => {
          this.fundSources = response.data.map((item) => ({
            value: item.id,
            text: item.sourceName,
          }));
          this.fundSources.unshift({
            value: null,
            text: "Select Fund Source...",
          });
          this.overlay = false;
        })
        .catch((e) => {
          this.overlay = false;
          this.alert = {
            show: true,
            variant: "danger",
            message: "Oops. Something went wrong. Please contact your administrator",
          };
        });
    },
    processFS(fs) {
      this.overlay = true;
      this.outcomes = [];
      if (!fs) {
        this.overlay = false;
        return;
      }
      /** Get single fund source */
      this.$store
        .dispatch("fundsource/GetSingleFundSource", fs)
        .then(async (response) => {
          this.selectedFS = response.data;
          const outcomes = await this.$store.dispatch("outcome/GetOutcome");
          this.outcomes = outcomes.data.map((item) => ({
            ...item,
            rotateChevy: false,
            showDetails: false,
          }));
          this.overlay = false;
        })
        .catch(() => {
          this.overlay = false;
          this.alert = {
            show: true,
            variant: "danger",
            message: "Oops. Something went wrong. Please contact your administrator",
          };
        });
    },
    processOutcome(outcome) {
      /**
       * 1. check if outcome is selected
       * 2. check if fund source is selected
       * 3. fetch prexc
       */
      this.overlay = true;
      this.selectedPrexc = null;
      this.selected = null;
      if (outcome === null) {
        this.overlay = false;
        return;
      }
      this.prexc = [];
      if (outcome === 0) {
        this.$store
          .dispatch("prexc/GetPrexc")
          .then((response) => {
            this.prexc = response.data.map((item) => ({
              value: item.id,
              text: item.prexcName,
            }));
            this.prexc.unshift({
              value: null,
              text: "Select Prexc...",
            });
            this.overlay = false;
          })
          .catch(() => {
            this.overlay = false;
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
            this.prexc = response.data.map((item) => ({
              value: item.id,
              text: item.prexcName,
            }));
            this.prexc.unshift({
              value: null,
              text: "Select Prexc...",
            });
            this.overlay = false;
          })
          .catch((e) => {
            this.overlay = false;
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
    async processPREXC(prexc) {
      if (!prexc || !this.selectedFS) {
        return;
      }
      this.tableBusy = true;
      const prexcInfo = await this.$store.dispatch("prexc/GetSinglePrexc", prexc);

      this.selectedPrexc = prexcInfo.data;

      this.fundSourceBalance = this.selectedFS.balance;
      const {
        data,
      } = await this.$store.dispatch(
        "objectOfExpenditures/getObjectOfExpendituresByPrexcAndCycle",
        { prexcId: prexc, cycle: Number(this.cycle), fundSourceId: this.selectedFS.id }
      );

      this.objectOfExpenditures = data;
      this.tableBusy = false;
    },
    addNew(id) {
      this.selectedPrexcId = id;
      this.addModal = true;
      this.$store
        .dispatch("objectOfExpenditures/getAvailableAccount", {
          cycle: Number(this.cycle),
          prexcId: id,
        })
        .then((response) => {
          this.availablePrexc = map(response.data, (item) => ({
            id: uniqueId("fc_"),
            label: item.fundClassification.classification,
            children: item.accountGroups.map((group) => ({
              // id: group.accountGroup.id,
              id: uniqueId("ag_"),
              label: group.accountGroup.groupName,
              children: group.accounts.map((account) => ({
                id: account.id,
                label: account.accountName,
              })),
            })),
          }));
          // this.listOverlay = false;
        })
        .catch((e) => {
          this.addModal = false;
          this.showToast("Something went wrong. Cannot fetch available PREXCs", "error");
          // this.alert = {
          //   show: true,
          //   variant: "danger",
          //   message:
          //     "Something went wrong. Fetching available accounts failed. Please contact your administrator",
          // };
        });
    },
    clear() {
      this.newData = [];
      this.addModal = false;
    },
    savePrexcs() {
      this.tableBusy = true;
      const data = this.newData.map((item) => ({
        prexcId: this.selectedPrexcId,
        fundSourceId: this.selectedFS.id,
        accountId: item,
        cycle: Number(this.cycle),
      }));
      this.$store
        .dispatch("objectOfExpenditures/createObjectOfExpenditures", data)
        .then(async () => {
          this.tableBusy = false;
          this.addModal = false;
          this.newData = [];
          // this.objectOfExpenditures.push(...response.data);
          const { data } = await this.$store.dispatch(
            "objectOfExpenditures/getObjectOfExpendituresByPrexcAndCycle",
            {
              prexcId: this.selectedPrexcId,
              cycle: Number(this.cycle),
              fundSourceId: this.selectedFS.id,
            }
          );
          this.objectOfExpenditures = data;
          this.prexc.find((item) => item.id === this.selectedPrexcId).expenditures = [];
          this.prexc.find((item) => item.id === this.selectedPrexcId).expenditures = data;
          this.showToast("Successfully added new object of expenditures", "success");
          // this.alert = {
          //   show: true,
          //   variant: "success",
          //   message: "Object of Expenditure successfully created under Prexc",
          // };
        })
        .catch(() => {
          this.tableBusy = false;
          this.alert = {
            show: true,
            variant: "danger",
            message:
              "Something went wrong. Creating accounts failed. Please contact your administrator",
          };
        });
    },
    viewTransactions(item) {
      this.fundSourceBalance = this.selectedFS.balance;
      this.transactionModal = true;
      this.$store
        .dispatch(
          "objectOfExpenditures/getObjectOfExpenditureTransactionByExpenditureId",
          item.item.id
        )
        .then((response) => {
          this.OETransactions = response.data;
          this.objectExpenditure = item.item;
        })
        .catch(() => {
          this.alert = {
            show: true,
            variant: "danger",
            message:
              "Something went wrong. Unable to fetch transactions. Please contact your administrator",
          };
        });
    },
    deleteItem(props) {
      this.$swal({
        title: "Are you sure?",
        text:
          "Are you sure you want to remove this Object of Expenditure? You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      }).then((result) => {
        if (result.isConfirmed) {
          this.$store
            .dispatch("objectOfExpenditures/removeObjectOfExpenditures", props.item.id)
            .then(async () => {
              const { data } = await this.$store.dispatch(
                "objectOfExpenditures/getObjectOfExpendituresByPrexcAndCycle",
                {
                  prexcId: props.item.prexcId,
                  cycle: Number(this.cycle),
                  fundSourceId: props.item.fundSourceId,
                }
              );
              this.prexc.find((item) => item.id === props.item.prexcId).expenditures = [];
              this.prexc.find(
                (item) => item.id === props.item.prexcId
              ).expenditures = data;
              // this.objectOfExpenditures.splice(props.index, 1);
              // this.alert = {
              //   show: true,
              //   variant: "success",
              //   message: "Object of Expenditure successfully deleted",
              // };
              this.showToast("Successfully deleted object of expenditure", "success");
            })
            .catch(() => {
              this.showToast(
                "Something went wrong. Unable to delete object of expenditure",
                "error"
              );
              // this.alert = {
              //   show: true,
              //   variant: "danger",
              //   message:
              //     "Something went wrong. Cannot delete object of expenditure. Please contact your administrator",
              // };
            });
        }
      });
    },
    updateFundSourceBalance(object) {
      this.fundSourceBalance = object.newBalance;
      this.selectedFS.balance = object.newBalance;
      if (object.type === "transfer") {
        this.prexc
          .find((item) => item.id === object.prexcId)
          .expenditures.find((obj) => obj.id === object.id).balance += object.amount;
        // this.objectOfExpenditures.find((item) => item.id === object.id).balance +=
        //   object.amount;
      }
      if (object.type === "revert") {
        this.prexc
          .find((item) => item.id === object.prexcId)
          .expenditures.find((obj) => obj.id === object.id).balance -= object.amount;
        // this.objectOfExpenditures.find((item) => item.id === object.id).balance -=
        //   object.amount;
      }
    },
    fetchPrexc(data) {
      this.$store
        .dispatch("objectOfExpenditures/getObjectOfExpendituresByFundSource", {
          fundSourceId: data.fundSourceId,
          outcomeId: data.outcomeId,
          cycle: this.cycle,
        })
        .then((response) => {
          this.prexc = response.data.map((item) => ({
            ...item,
            rotateChevy: false,
            showDetails: false,
            expenditures: [],
          }));
        })
        .catch(() => {
          this.showToast(
            "Something went wrong. Unable to fetch object of expenditure. Please contact your administrator",
            "danger"
          );
        });
    },
    showDtls(record) {
      record.rotateChevy = !record.rotateChevy;
      if (record.rotateChevy) {
        this.fetchPrexc({ fundSourceId: this.selectedFS.id, outcomeId: record.id });
      }
    },
  },
  async created() {
    this.cycle = this.$store.state.data.cycle;
    if (this.$route.params.id) {
      try {
        const { data } = await this.$store.dispatch(
          "fundsource/GetSingleFundSource",
          Number(this.$route.params.id)
        );
        this.selectedFundSource = Number(this.$route.params.id);
        this.selectedFundCluster = data.fundClusterId;
        this.processFC(this.selectedFundCluster);
        this.processFS(this.selectedFundSource);
      } catch (e) {
        this.alert = {
          show: true,
          variant: "danger",
          message:
            "Something went wrong. It could be that the data is not available for the selected fund source",
        };
      }
    } else {
      this.showFilters = true;
    }
    const fundCluster = await this.$store.dispatch("fundcluster/GetFundCluster");

    this.fundCluster = fundCluster.data.map((e) => ({
      value: e.id,
      text: e.cluster,
    }));
    this.fundCluster.unshift({
      value: null,
      text: "Select Fund Cluster...",
    });

    const outcomes = await this.$store.dispatch("outcome/GetOutcome");
    this.outcomes = outcomes.data.map((item) => ({
      ...item,
      rotateChevy: false,
      showDetails: false,
    }));
  },
};
</script>

<template>
  <Layout @changeCycle="changeCycle">
    <PageHeader :title="title" :items="items" />
    <div class="row">
      <div class="col-lg-12">
        <b-alert dismissible :show="alert.show" :variant="alert.variant">{{
          alert.message
        }}</b-alert>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <b-overlay :show="listOverlay" rounded="sm" :opacity="0.3">
          <b-card>
            <template #header>
              <div class="row my-2">
                <div class="col-md-6">
                  <h4 class="card-title">
                    Expenditure list
                    {{ selectedFS ? "- " + selectedFS.sourceName : "" }}
                  </h4>
                </div>
                <div class="col-md-6 text-end">
                  <a
                    href="javascript:void(0);"
                    class="me-4 text-white"
                    @click="showFilters = !showFilters"
                    ><b
                      ><i class="bx bx-filter font-size-18"></i
                      >{{ showFilters ? "Hide" : "Show" }} Filters</b
                    ></a
                  >
                  <!-- <b-button
                    variant="primary"
                    size="sm"
                    v-if="
                      selectedFS &&
                      (checkExpiry(selectedFS.expiry) || !selectedFS.hasExpiry)
                    "
                    @click="addNew"
                    ><i class="bx bx-plus"></i> Add new</b-button
                  > -->
                </div>
              </div>
            </template>
            <!-- filters here -->
            <div v-if="showFilters">
              <b-overlay :show="overlay" rounded="sm" :opacity="0.3">
                <b-card>
                  <b-card-title>Filters</b-card-title>
                  <div class="row">
                    <div class="col-md-3">
                      <b-form-group label="Fund Cluster" class="mt-3">
                        <b-form-select
                          v-model="selectedFundCluster"
                          :options="fundCluster"
                          class="form-select form-select-sm"
                          placeholder="Select Fund Cluster..."
                          @change="processFC"
                        ></b-form-select>
                      </b-form-group>
                    </div>
                    <div class="col-md-3">
                      <b-form-group
                        label="Fund Source"
                        class="mt-3"
                        v-if="fundSources.length > 0"
                      >
                        <b-form-select
                          v-model="selectedFundSource"
                          :options="fundSources"
                          @change="processFS"
                          class="form-select form-select-sm"
                        ></b-form-select>
                      </b-form-group>
                    </div>
                  </div>
                </b-card>
              </b-overlay>
            </div>
            <!-- filters here -->
            <b-alert :show="!selectedFS" variant="warning"
              >No records to display. Please select filters above to show appropriate
              records...</b-alert
            >
            <b-card-text v-if="selectedFS">
              <p class="mb-0">
                <strong>Balance: </strong
                ><span>{{ formatCurrency(selectedFS.balance) }}</span>
              </p>

              <p>
                <strong>Fund Source: </strong><span>{{ selectedFS.sourceName }}</span>
                (
                <span
                  :class="[
                    checkExpiry(selectedFS.expiry) || !selectedFS.hasExpiry
                      ? 'text-success'
                      : 'text-danger',
                  ]"
                  >{{
                    checkExpiry(selectedFS.expiry) || !selectedFS.hasExpiry
                      ? "Active"
                      : "Expired"
                  }}</span
                >
                )
              </p>
              <!-- Table here -->
              <div
                class="card border border-light mb-2"
                v-for="outcome in outcomes"
                :key="outcome.id"
              >
                <div class="card-body">
                  <div class="d-flex justify-content-start">
                    <div class="me-3">
                      <i
                        class="bx bx-chevron-right rotate font-size-16 cursor-pointer"
                        :class="{
                          'rotate-90': outcome.rotateChevy,
                        }"
                        @click="showDtls(outcome)"
                        v-b-toggle="`collapse-${outcome.id}`"
                      ></i>
                    </div>
                    <p class="mb-0">{{ outcome.outcomeName }}</p>
                  </div>
                  <b-collapse :id="`collapse-${outcome.id}`" accordion="my-accordion">
                    <div class="wrapper p-0 m-0">
                      <Prexcs
                        :cycle="cycle"
                        :fundSource="selectedFS ? selectedFS.id : null"
                        :prexcs="prexc"
                        class="mt-5"
                        @viewTransactions="viewTransactions"
                        @deleteItem="deleteItem"
                        @addNew="addNew"
                      />
                    </div>
                  </b-collapse>
                </div>
              </div>
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
            </b-card-text>
          </b-card>
        </b-overlay>
      </div>
    </div>
    <!-- Modals here -->
    <b-modal v-model="addModal" size="lg" title="Select accounts" no-close-on-backdrop>
      <div
        class="d-flex justify-content-center align-items-center"
        v-if="!availablePrexc"
      >
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
      <div class="row" v-else>
        <treeselect
          :multiple="true"
          :options="availablePrexc"
          :value-consists-of="availablePrexcConsist"
          :limit="5"
          :max-height="300"
          v-model="newData"
        />
      </div>
      <template #modal-footer>
        <b-button variant="primary" @click="savePrexcs"> Save </b-button>
        <b-button variant="link" @click="clear"> Close </b-button>
      </template>
    </b-modal>
    <!-- Transactions -->
    <b-modal
      v-model="transactionModal"
      size="xl"
      title="Object of Expenditure Transactions"
      no-close-on-backdrop
      hide-footer
    >
      <PrexcTransactions
        :transactionTable="OETransactions"
        :obj="objectExpenditure"
        :fundSourceBalance="fundSourceBalance"
        @updatedFS="updateFundSourceBalance"
        v-if="objectExpenditure"
      />
    </b-modal>
  </Layout>
</template>

<style>
.vue-treeselect__label {
  font-size: 16px !important;
  font-weight: 300;
  color: #fff;
}
.vue-treeselect__control {
  background-color: #2a3042;
}
.vue-treeselect__menu {
  background-color: #2a3042;
}
.vue-treeselect__option--highlight {
  background-color: #2a3042;
}
.vue-treeselect__input {
  color: #fff;
}
</style>
