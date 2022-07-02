<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import { required } from "vuelidate/lib/validators";
import Swal from "sweetalert2";
import createNumberMask from "text-mask-addons/dist/createNumberMask";
import DatePicker from "vue2-datepicker";
import { cloneDeep } from "lodash";

export default {
  page: {
    title: "IAR",
  },
  components: {
    Layout,
    PageHeader,
    DatePicker,
  },
  data() {
    return {
      title: "IAR",
      submitted: false,
      items: [
        {
          text: "Dashboards",
          href: "/",
        },
        {
          text: "IAR",
          active: true,
        },
      ],
      currencyMask: createNumberMask({
        prefix: "",
        allowDecimal: true,
      }),
      quantityMask: createNumberMask({
        prefix: "",
        includeThousandsSeparator: false,
      }),
      modalTitle: "",
      totalRows: 1,
      perPage: 10,
      pendingData: [],
      postedData: [],
      availableData: [],
      backupData: {},
      filterPending: "",
      filterPosted: "",
      filterAvailable: "",
      pageOptions: [10, 25, 50, 100],
      perPagePending: 10,
      perPagePosted: 10,
      perPageAvailable: 10,
      currentPagePending: 1,
      currentPagePosted: 1,
      currentPageAvailable: 1,
      pendingLoading: false,
      postedLoading: false,
      availableLoading: false,
      pendingIndex: -1,
      postedIndex: -1,
      availableIndex: -1,
      cycle: this.$store.state.data.cycle,
      form: {
        id: null,
        iarNumber: "",
        drNumber: "",
        iarDate: "",
        dateOfDelivery: "",
        dateInspected: "",
        acceptanceDate: "",
      },
      tabIndex: 0,
      update: 0,
    };
  },
  validations: {
    form: {
      iarNumber: { required },
      drNumber: { required },
      iarDate: { required },
      dateOfDelivery: { required },
      dateInspected: { required },
      acceptanceDate: { required },
    },
  },
  computed: {
    filteredPending() {
      let data = this.pendingData;
      var total = this.currentPagePending * this.perPagePending;
      if (this.filterPending.trim() != "" && this.filterPending) {
        data = data.filter((item) => {
          if (
            item.iarNumber
              .toUpperCase()
              .includes(this.filterPending.toUpperCase())
          )
            return item.iarNumber
              .toUpperCase()
              .includes(this.filterPending.toUpperCase());
          else if (item.drNumber)
            if (
              item.drNumber
                .toUpperCase()
                .includes(this.filterPending.toUpperCase())
            )
              return item.drNumber
                .toUpperCase()
                .includes(this.filterPending.toUpperCase());
        });
      }
      var currentData = data.slice(total - this.perPagePending, total);
      if (this.currentPagePending > 1 && currentData.length == 0) {
        total = (this.currentPagePending - 1) * this.perPagePending;
        currentData = data.slice(total - this.perPagePending, total);
      }
      return currentData;
    },
    rowsPending() {
      if (this.filterPending.trim() != "" && this.filterPending) {
        return this.filteredPending.length;
      } else {
        return this.pendingData.length;
      }
    },
    filteredPosted() {
      let data = this.postedData;
      var total = this.currentPagePosted * this.perPagePosted;
      if (this.filterPosted.trim() != "" && this.filterPosted) {
        data = data.filter((item) => {
          if (
            item.iarNumber
              .toUpperCase()
              .includes(this.filterPosted.toUpperCase())
          )
            return item.iarNumber
              .toUpperCase()
              .includes(this.filterPosted.toUpperCase());
          else if (item.drNumber)
            if (
              item.drNumber
                .toUpperCase()
                .includes(this.filterPosted.toUpperCase())
            )
              return item.drNumber
                .toUpperCase()
                .includes(this.filterPosted.toUpperCase());
        });
      }
      var currentData = data.slice(total - this.perPagePosted, total);
      if (this.currentPagePosted > 1 && currentData.length == 0) {
        total = (this.currentPagePosted - 1) * this.perPagePosted;
        currentData = data.slice(total - this.perPagePosted, total);
      }
      return currentData;
    },
    rowsPosted() {
      if (this.filterPosted.trim() != "" && this.filterPosted) {
        return this.filteredPosted.length;
      } else {
        return this.postedData.length;
      }
    },
    filteredAvailable() {
      let data = this.availableData;
      var total = this.currentPageAvailable * this.perPageAvailable;
      if (this.filterAvailable.trim() != "" && this.filterAvailable) {
        data = data.filter((item) => {
          if (
            item.iarNumber
              .toUpperCase()
              .includes(this.filterAvailable.toUpperCase())
          )
            return item.iarNumber
              .toUpperCase()
              .includes(this.filterAvailable.toUpperCase());
          else if (item.drNumber)
            if (
              item.drNumber
                .toUpperCase()
                .includes(this.filterAvailable.toUpperCase())
            )
              return item.drNumber
                .toUpperCase()
                .includes(this.filterAvailable.toUpperCase());
        });
      }
      var currentData = data.slice(total - this.perPageAvailable, total);
      if (this.currentPageAvailable > 1 && currentData.length == 0) {
        total = (this.currentPageAvailable - 1) * this.perPageAvailable;
        currentData = data.slice(total - this.perPageAvailable, total);
      }
      return currentData;
    },
    rowsAvailable() {
      if (this.filterAvailable.trim() != "" && this.filterAvailable) {
        return this.filteredAvailable.length;
      } else {
        return this.availableData.length;
      }
    },
  },
  created() {
    this.changeCycle(this.$store.state.data.cycle);
  },
  methods: {
    changeCycle(cycle) {
      this.getPending(cycle);
      this.getPosted(cycle);
      this.getAvailable(cycle);
    },
    getPending(cycle) {
      this.pendingLoading = true;
      this.$store
        .dispatch("inspectioniar/GetInspectionIarPending", cycle)
        .then((res) => {
          this.pendingLoading = false;
          res.data.forEach((x) => {
            x.visible = false;
            x.dateOfDelivery = new Date(x.dateOfDelivery);
            x.dateInspected = new Date(x.dateInspected);
            x.acceptanceDate = new Date(x.acceptanceDate);
          });
          this.pendingData = res.data;
        })
        .catch((err) => {
          let stringErr = err.toString();
          if (stringErr.includes("Network")) {
            this.showToast("Network Error!", "error");
          } else {
            this.showToast(
              "Something went wrong getting pending IAR!",
              "error"
            );
          }
          this.pendingLoading = false;
        });
    },
    getPosted(cycle) {
      this.postedLoading = true;
      this.$store
        .dispatch("inspectioniar/GetInspectionIarPosted", cycle)
        .then((res) => {
          this.postedLoading = false;
          res.data.forEach((x) => {
            x.visible = false;
            x.dateOfDelivery = new Date(x.dateOfDelivery);
            x.dateInspected = new Date(x.dateInspected);
            x.acceptanceDate = new Date(x.acceptanceDate);
          });
          this.postedData = res.data;
        })
        .catch((err) => {
          let stringErr = err.toString();
          if (stringErr.includes("Network")) {
            this.showToast("Network Error!", "error");
          } else {
            this.showToast("Something went wrong getting posted IAR!", "error");
          }
          this.postedLoading = false;
        });
    },
    getAvailable(cycle) {
      this.availableLoading = true;
      this.$store
        .dispatch("inspectioniar/GetInspectionIarAvailable", cycle)
        .then((res) => {
          this.availableLoading = false;
          res.data.forEach((x) => {
            x.visible = false;
            x.dateOfDelivery = new Date(x.dateOfDelivery);
            x.dateInspected = new Date(x.dateInspected);
            x.acceptanceDate = new Date(x.acceptanceDate);
            x.toggleAll = false;
            x.iarItems.forEach((y) => {
              y.toggleSelected = false;
            });
          });
          this.availableData = res.data;
        })
        .catch((err) => {
          let stringErr = err.toString();
          if (stringErr.includes("Network")) {
            this.showToast("Network Error!", "error");
          } else {
            this.showToast(
              "Something went wrong getting available IAR!",
              "error"
            );
          }
          this.availableLoading = false;
        });
    },
    onSubmit(props) {
      this.submitted = true;
      var items = [];
      props.iarItems.forEach((item) => {
        if (item.toggleSelected === true) {
          items.push(item.id);
        }
      });
      Swal.fire({
        title: "Are you sure?",
        text: "You are about to submit the selected items.",
        icon: "info",
        showCancelButton: true,
        confirmButtonColor: "#34c38f",
        cancelButtonColor: "#5c636a",
        confirmButtonText: "Submit Items!",
      }).then((result) => {
        if (result.value) {
          this.$store
            .dispatch("inspectioniar/SubmitInspectionIar", items)
            .then((res) => {
              if (res.data.error) {
                return this.showToast(res.data.detail, "error");
              }
              var iarIndex = this.availableData.findIndex(
                (item) => item.id == props.id
              );
              items.forEach((x) => {
                var itemIndex = this.availableData[iarIndex].iarItems.findIndex(
                  (item) => item.id == x
                );
                this.availableData[iarIndex].iarItems.splice(itemIndex, 1);
              });
              if (this.availableData[iarIndex].iarItems.length == 0) {
                this.availableData.splice(iarIndex, 1);
              }
              this.showToast("Successfully submitted!", "success");
            })
            .catch((err) => {
              this.showToast("Something went wrong submitting items!", "error");
            });
          this.submitted = false;
        }
      });
    },
    onPost() {
      this.submitted = true;
      if (this.form.acceptanceDate == "" || this.form.acceptanceDate == null) {
        return;
      } else {
        this.form.acceptanceDate = this.setDate(this.form.acceptanceDate);
        this.$store
          .dispatch("inspectioniar/PostInspectionIar", this.form)
          .then((res) => {
            if (res.data.error) {
              return this.showToast(res.data.detail, "error");
            }
            var iarIndex = this.pendingData.findIndex(
              (item) => item.id == this.form.id
            );
            this.pendingData.splice(iarIndex, 1);
            res.data.visible = false;
            res.data.dateOfDelivery = new Date(res.data.dateOfDelivery);
            res.data.dateInspected = new Date(res.data.dateInspected);
            res.data.acceptanceDate = new Date(res.data.acceptanceDate);
            this.postedData.push(res.data);
            this.showToast("Successfully posted!", "success");
            this.hideModal();
          })
          .catch((err) => {
            this.showToast("Something went wrong posting IAR!", "error");
          });
        this.submitted = false;
      }
    },
    onUpdate() {
      this.submitted = true;
      var index = null;
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      } else {
        this.form.iarDate = this.setDate(this.form.iarDate);
        this.form.dateOfDelivery = this.setDate(this.form.dateOfDelivery);
        this.form.dateInspected = this.setDate(this.form.dateInspected);
        this.form.acceptanceDate = this.setDate(this.form.acceptanceDate);
        this.$store
          .dispatch("inspectioniar/UpdateInspectionIar", this.form)
          .then((res) => {
            if (res.data.error) {
              return this.showToast(res.data.detail, "error");
            }
            res.data.visible = false;
            res.data.dateOfDelivery = new Date(res.data.dateOfDelivery);
            res.data.dateInspected = new Date(res.data.dateInspected);
            res.data.acceptanceDate = new Date(res.data.acceptanceDate);
            if (this.update == 0) {
              index = this.pendingData.findIndex(
                (item) => item.id == this.form.id
              );
              this.pendingData.splice(index, 1, res.data);
            } else if (this.update == 1) {
              index = this.postedData.findIndex(
                (item) => item.id == this.form.id
              );
              this.postedData.splice(index, 1, res.data);
            } else if (this.update == 2) {
              index = this.availableData.findIndex(
                (item) => item.id == this.form.id
              );
              this.availableData.splice(index, 1, res.data);
            }
            this.showToast("Successfully updated!", "success");
            this.onReset();
            this.hideModalUpdate();
          })
          .catch((err) => {
            this.showToast("Something went wrong updating IAR!", "error");
          });
        this.submitted = false;
      }
    },
    deleteIar(props) {
      var index = this.pendingData.indexOf(props);
      this.$swal({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#5c636a",
        confirmButtonText: "Yes, delete it!",
      }).then((result) => {
        if (result.isConfirmed) {
          this.$store
            .dispatch("inspectioniar/DeleteInspectionIar", props.id)
            .then((res) => {
              if (res.status == 204) {
                this.pendingData.splice(index, 1);
                this.showToast("Successfully deleted", "success");
              }
            })
            .catch((err) => {
              this.showToast("Cannot be deleted!", "error");
            });
        }
      });
    },
    postIar(props) {
      this.onReset();
      this.backupData = cloneDeep(props);
      this.form.id = props.id;
      this.form.acceptanceDate = new Date(props.acceptanceDate);
      this.modalTitle = "Post IAR";
      this.$bvModal.show("modal-standard");
    },
    updateIar(props, type) {
      this.form = cloneDeep(props);
      this.update = type;
      this.form.cycle = this.cycle;
      this.form.iarDate = new Date(props.iarDate);
      this.form.dateOfDelivery = new Date(props.dateOfDelivery);
      this.form.dateInspected = new Date(props.dateInspected);
      this.form.acceptanceDate = new Date(props.acceptanceDate);
      this.modalTitle = "Update IAR";
      this.$bvModal.show("modal-update");
    },
    onReset() {
      this.form = {
        id: null,
        acceptanceDate: "",
      };
    },
    toggleAll(id) {
      var index = this.availableData.findIndex((item) => item.id == id);
      if (this.availableData[index].toggleAll === true) {
        this.availableData[index].iarItems.forEach((item) => {
          item.toggleSelected = true;
        });
      } else {
        this.availableData[index].iarItems.forEach((item) => {
          item.toggleSelected = false;
        });
      }
    },
    checkToggle(id) {
      var index = this.availableData.findIndex((item) => item.id == id);
      var count = 0;
      this.availableData[index].iarItems.forEach((item) => {
        item.toggleSelected && count++;
      });
      if (count === this.availableData[index].iarItems.length) {
        this.availableData[index].toggleAll = true;
      } else {
        this.availableData[index].toggleAll = false;
      }
    },
    selectedRowCheck(items) {
      var count = 0;
      items.forEach((item) => {
        item.toggleSelected && count++;
      });
      if (count > 0) return true;
      else return false;
    },
    hideModal() {
      this.$bvModal.hide("modal-standard");
    },
    hideModalUpdate() {
      this.$bvModal.hide("modal-update");
    },
    setDate(date) {
      const nDate = new Date(
        new Date(date).getTime() -
          new Date(date).getTimezoneOffset() * 60 * 1000
      );
      return nDate.toISOString();
    },
  },
};
</script>
<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <b-modal
      id="modal-standard"
      :title="modalTitle"
      size="md"
      title-class="font-18"
      hide-footer
    >
      <form @submit.prevent="onPost" class="needs-validation" ref="fcForm">
        <div class="mb-3">
          <label for="acceptanceDate">Acceptance Date</label>
          <date-picker
            v-model="form.acceptanceDate"
            :first-day-of-week="1"
            lang="en"
            placeholder="Enter Date Received..."
            :class="{
              'is-invalid':
                submitted &&
                (form.acceptanceDate == '' || form.acceptanceDate == null),
            }"
          ></date-picker>
          <div
            v-if="
              submitted &&
              (form.acceptanceDate == '' || form.acceptanceDate == null)
            "
            class="invalid-feedback"
          >
            <span>This value is required.</span>
          </div>
        </div>
        <div class="modal-footer">
          <button type="submit" class="btn btn-primary">Post IAR</button>
        </div>
      </form>
    </b-modal>
    <b-modal
      id="modal-update"
      :title="modalTitle"
      size="md"
      title-class="font-18"
      hide-footer
    >
      <form @submit.prevent="onUpdate" class="needs-validation" ref="fcForm">
        <!-- <div class="mb-3">
          <label for="iarNumber">IAR Number</label>
          <input
            id="iarNumber"
            type="text"
            v-model="form.iarNumber"
            placeholder="Enter IAR Number..."
            class="form-control"
            :class="{
              'is-invalid': submitted && $v.form.iarNumber.$error,
            }"
            autocomplete="off"
          />
          <div
            v-if="submitted && $v.form.iarNumber.$error"
            class="invalid-feedback"
          >
            <span v-if="!$v.form.iarNumber.required"
              >This value is required.</span
            >
          </div>
        </div> -->
        <div class="mb-3">
          <label for="drNumber">D.R. Number</label>
          <input
            id="drNumber"
            type="text"
            v-model="form.drNumber"
            placeholder="Enter D.R. Number..."
            class="form-control"
            :class="{
              'is-invalid': submitted && $v.form.drNumber.$error,
            }"
            autocomplete="off"
          />
          <div
            v-if="submitted && $v.form.drNumber.$error"
            class="invalid-feedback"
          >
            <span v-if="!$v.form.drNumber.required"
              >This value is required.</span
            >
          </div>
        </div>
        <div class="mb-3">
          <label for="iarDate">IAR Date</label>
          <date-picker
            v-model="form.iarDate"
            :first-day-of-week="1"
            lang="en"
            placeholder="Enter IAR Date..."
            :class="{
              'is-invalid': submitted && $v.form.iarDate.$error,
            }"
          ></date-picker>
          <div
            v-if="submitted && $v.form.iarDate.$error"
            class="invalid-feedback"
          >
            <span v-if="!$v.form.iarDate.required"
              >This value is required.</span
            >
          </div>
        </div>
        <div class="mb-3">
          <label for="dateOfDelivery">Date of Delivery</label>
          <date-picker
            v-model="form.dateOfDelivery"
            :first-day-of-week="1"
            lang="en"
            placeholder="Enter Date of Delivery..."
            :class="{
              'is-invalid': submitted && $v.form.dateOfDelivery.$error,
            }"
          ></date-picker>
          <div
            v-if="submitted && $v.form.dateOfDelivery.$error"
            class="invalid-feedback"
          >
            <span v-if="!$v.form.dateOfDelivery.required"
              >This value is required.</span
            >
          </div>
        </div>
        <div class="mb-3">
          <label for="dateInspected">Date Inspected</label>
          <date-picker
            v-model="form.dateInspected"
            :first-day-of-week="1"
            lang="en"
            placeholder="Enter Date Inspected..."
            :class="{
              'is-invalid': submitted && $v.form.dateInspected.$error,
            }"
          ></date-picker>
          <div
            v-if="submitted && $v.form.dateInspected.$error"
            class="invalid-feedback"
          >
            <span v-if="!$v.form.dateInspected.required"
              >This value is required.</span
            >
          </div>
        </div>
        <div class="mb-3">
          <label for="acceptanceDate">Acceptance Date</label>
          <date-picker
            v-model="form.acceptanceDate"
            :first-day-of-week="1"
            lang="en"
            placeholder="Enter Date Received..."
            :class="{
              'is-invalid': submitted && $v.form.acceptanceDate.$error,
            }"
          ></date-picker>
          <div
            v-if="submitted && $v.form.acceptanceDate.$error"
            class="invalid-feedback"
          >
            <span v-if="!$v.form.acceptanceDate.required"
              >This value is required.</span
            >
          </div>
        </div>
        <div class="modal-footer">
          <button type="submit" class="btn btn-primary">Update IAR</button>
        </div>
      </form>
    </b-modal>
    <b-tabs
      content-class="pt-3 pb-3 text-muted"
      v-model="tabIndex"
      nav-class="nav-tabs-custom"
    >
      <b-tab>
        <template v-slot:title>
          <span class="d-inline-block d-sm-none">
            <i class="bx bx-home"></i>
          </span>
          <span class="d-none d-sm-inline-block">Pending IAR</span>
        </template>
        <div
          class="
            card
            border-4 border-top border-start-0 border-end-0 border-primary
          "
        >
          <div class="card-body">
            <div class="row mb-2">
              <div class="col-md-6">
                <div class="d-flex align-items-center h-100">
                  <h4 class="mb-0">Pending IAR List</h4>
                </div>
              </div>
              <div class="col-md-6">
                <div class="d-flex float-end">
                  <div id="tickets-table_filter" class="dataTables_filter me-1">
                    <label class="d-inline-flex align-items-center">
                      <b-form-input
                        autocomplete="off"
                        v-model="filterPending"
                        type="search"
                        placeholder="Search IAR..."
                        class="form-control"
                      ></b-form-input>
                    </label>
                  </div>
                  <div id="tickets-table_length" class="dataTables_length">
                    <label class="d-inline-flex align-items-center mb-0">
                      <b-form-select
                        class="form-select"
                        v-model="perPagePending"
                        size="sm"
                        :options="pageOptions"
                      >
                      </b-form-select>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div
              class="h-50vh d-flex align-items-center justify-content-center"
              v-if="pendingLoading"
            >
              <div class="preloader-component me-2">
                <div class="status">
                  <div class="spinner-chase w-25px h-25px">
                    <div class="chase-dot"></div>
                    <div class="chase-dot"></div>
                    <div class="chase-dot"></div>
                    <div class="chase-dot"></div>
                    <div class="chase-dot"></div>
                    <div class="chase-dot"></div>
                  </div>
                </div>
              </div>
              <h5 class="mb-0">Loading...</h5>
            </div>
            <div
              class="h-50vh d-flex align-items-center justify-content-center"
              v-else-if="pendingData.length == 0"
            >
              <h5 class="text-muted">
                <i class="fas fa-exclamation-triangle me-2"></i>No Data Found
              </h5>
            </div>
            <div
              class="pt-1 pb-1 text-muted"
              role="tablist"
              v-for="(x, index) in filteredPending"
              :key="x.id"
            >
              <b-card
                no-body
                class="mb-1"
                :style="`z-index: ${filteredPending.length - index}`"
              >
                <b-card-header header-tag="header" role="tab">
                  <div
                    class="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <h5 class="mb-0">{{ x.iarNumber }}</h5>
                      <div>DR Number: {{ x.drNumber }}</div>
                      <small>
                        <a
                          href="javascript: void(0);"
                          class="text-success d-flex align-items-center"
                          @click="x.visible = !x.visible"
                        >
                          {{ x.visible ? "Hide" : "Show" }}
                          Details
                          <i
                            class="bx bx-chevron-right rotate font-size-14"
                            :class="{
                              'rotate-90': x.visible,
                            }"
                          ></i>
                        </a>
                      </small>
                    </div>
                    <div class="float-end d-flex align-items-center">
                      <div>
                        <small>Total Amount:</small>
                        <h6>
                          {{
                            Intl.NumberFormat("ja-JP", {
                              currency: "PHP",
                              style: "currency",
                            }).format(x.total)
                          }}
                        </h6>
                      </div>
                      <div class="ms-4">
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
                          <b-dropdown-item @click="updateIar(x, 0)"
                            ><i class="mdi mdi-update font-size-18 me-1"></i
                            >Update Item</b-dropdown-item
                          >
                          <b-dropdown-item
                            @click="deleteIar(x)"
                            variant="danger"
                            ><i class="mdi mdi-trash-can font-size-18 me-1"></i
                            >Delete</b-dropdown-item
                          >
                        </b-dropdown>
                      </div>
                    </div>
                  </div>
                </b-card-header>
                <b-collapse
                  :visible="x.visible"
                  :accordion="`po-accordion-${x.id}`"
                  role="tabpanel"
                >
                  <b-card-body>
                    <div class="row">
                      <div class="col-md-3">
                        <div class="font-size-12 mb-1">
                          <b class="font-size-14">Date of Delivery: </b>
                          {{ formatDate(x.dateOfDelivery) }}
                        </div>
                        <div class="font-size-12 mb-1">
                          <b class="font-size-14">Date Inspected: </b>
                          {{ formatDate(x.dateInspected) }}
                        </div>
                        <div class="font-size-12 mb-1">
                          <b class="font-size-14">Acceptance Date: </b>
                          {{ formatDate(x.acceptanceDate) }}
                        </div>
                        <!-- <div class="font-size-12 mb-1">
                          <div class="d-flex align-items-center">
                            <b class="font-size-14">Acceptance Date:</b>
                            <div
                              class="d-flex align-items-center"
                              v-if="!x.editDate"
                            >
                              <span class="font-size-12 ms-1">{{
                                formatDate(x.acceptanceDate)
                              }}</span>
                              <a
                                href="javascript:void(0);"
                                class="
                                  hover-max-width
                                  d-flex
                                  align-items-center
                                "
                                @click="x.editDate = true"
                              >
                                <i class="bx bx-edit font-size-16 mx-1"></i>
                                <span>Edit Date</span>
                              </a>
                            </div>
                            <div class="d-flex w-100" v-if="x.editDate">
                              <div class="w-100">
                                <date-picker
                                  v-model="x.acceptanceDate"
                                  lang="en"
                                  placeholder="Date Received..."
                                  :class="{
                                    'is-invalid':
                                      submitted &&
                                      (x.acceptanceDate == '' ||
                                        x.acceptanceDate == null),
                                  }"
                                ></date-picker>
                                <div
                                  v-if="
                                    submitted &&
                                    (x.acceptanceDate == '' ||
                                      x.acceptanceDate == null)
                                  "
                                  class="invalid-feedback"
                                >
                                  <span>This value is required.</span>
                                </div>
                              </div>
                              <button
                                type="button"
                                class="ms-2 btn no-wrap btn-link"
                                @click="x.editDate = false"
                              >
                                <span>Close</span>
                              </button>
                            </div>
                          </div>
                        </div> -->
                        <div class="mt-2">
                          <button
                            type="button"
                            @click="postIar(x)"
                            class="btn btn-success d-flex align-items-center"
                          >
                            Post IAR
                          </button>
                        </div>
                      </div>
                      <div class="col-md-9 border-start border-3">
                        <div class="ms-2">
                          <div class="mb-2">
                            <div class="d-flex justify-content-between">
                              <b class="font-size-16">Items:</b>
                            </div>
                          </div>
                          <div
                            class="
                              h-50vh
                              d-flex
                              align-items-center
                              justify-content-center
                            "
                            v-if="x.iarItems.length == 0"
                          >
                            <h5 class="text-muted">
                              <i class="fas fa-exclamation-triangle me-2"></i>No
                              Data Found
                            </h5>
                          </div>
                          <div v-else>
                            <table width="100%">
                              <thead>
                                <tr class="border-bottom">
                                  <th style="width: 90px" class="py-2">Qty</th>
                                  <th class="py-2">Item Name</th>
                                  <th class="py-2" style="width: 150px">
                                    Unit Price
                                  </th>
                                  <th class="py-2" style="width: 150px">
                                    Total Price
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr
                                  v-for="y in x.iarItems"
                                  :key="y.id"
                                  class="border-bottom"
                                >
                                  <td class="py-2">
                                    {{ y.quantity }}
                                  </td>
                                  <td class="py-2">
                                    <div>
                                      {{ y.itemName }}
                                    </div>
                                    <small>{{ y.description }}</small>
                                  </td>
                                  <td class="py-2">
                                    {{
                                      Intl.NumberFormat("ja-JP", {
                                        currency: "PHP",
                                        style: "currency",
                                      }).format(y.unitCost)
                                    }}
                                  </td>
                                  <td class="py-2">
                                    {{
                                      Intl.NumberFormat("ja-JP", {
                                        currency: "PHP",
                                        style: "currency",
                                      }).format(y.unitCost * y.quantity)
                                    }}
                                  </td>
                                </tr>
                              </tbody>
                              <tbody>
                                <tr class="border-bottom">
                                  <td class="py-2"></td>
                                  <td class="py-2"></td>
                                  <td class="py-2"></td>
                                  <td class="py-2">
                                    {{
                                      Intl.NumberFormat("ja-JP", {
                                        currency: "PHP",
                                        style: "currency",
                                      }).format(x.total)
                                    }}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </b-card-body>
                </b-collapse>
              </b-card>
            </div>
            <div
              class="
                dataTables_paginate
                paging_simple_numbers
                d-flex
                flex-row-reverse
                pt-3
                pb-3
              "
            >
              <ul
                class="pagination pagination-rounded mb-0"
                style="z-index: -1"
              >
                <!-- pagination -->
                <b-pagination
                  v-model="currentPagePending"
                  :total-rows="rowsPending"
                  :per-page="perPagePending"
                ></b-pagination>
              </ul>
            </div>
          </div>
        </div>
      </b-tab>
      <b-tab>
        <template v-slot:title>
          <span class="d-inline-block d-sm-none">
            <i class="bx bx-home"></i>
          </span>
          <span class="d-none d-sm-inline-block">Posted IAR</span>
        </template>
        <div
          class="
            card
            border-4 border-top border-start-0 border-end-0 border-primary
          "
        >
          <div class="card-body">
            <div class="row mb-2">
              <div class="col-md-6">
                <div class="d-flex align-items-center h-100">
                  <h4 class="mb-0">Posted IAR List</h4>
                </div>
              </div>
              <div class="col-md-6">
                <div class="d-flex float-end">
                  <div id="tickets-table_filter" class="dataTables_filter me-1">
                    <label class="d-inline-flex align-items-center">
                      <b-form-input
                        autocomplete="off"
                        v-model="filterPosted"
                        type="search"
                        placeholder="Search IAR..."
                        class="form-control"
                      ></b-form-input>
                    </label>
                  </div>
                  <div id="tickets-table_length" class="dataTables_length">
                    <label class="d-inline-flex align-items-center mb-0">
                      <b-form-select
                        class="form-select"
                        v-model="perPagePosted"
                        size="sm"
                        :options="pageOptions"
                      >
                      </b-form-select>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div
              class="h-50vh d-flex align-items-center justify-content-center"
              v-if="postedLoading"
            >
              <div class="preloader-component me-2">
                <div class="status">
                  <div class="spinner-chase w-25px h-25px">
                    <div class="chase-dot"></div>
                    <div class="chase-dot"></div>
                    <div class="chase-dot"></div>
                    <div class="chase-dot"></div>
                    <div class="chase-dot"></div>
                    <div class="chase-dot"></div>
                  </div>
                </div>
              </div>
              <h5 class="mb-0">Loading...</h5>
            </div>
            <div
              class="h-50vh d-flex align-items-center justify-content-center"
              v-else-if="postedData.length == 0"
            >
              <h5 class="text-muted">
                <i class="fas fa-exclamation-triangle me-2"></i>No Data Found
              </h5>
            </div>
            <div
              class="pt-1 pb-1 text-muted"
              role="tablist"
              v-for="(x, index) in filteredPosted"
              :key="x.id"
            >
              <b-card
                no-body
                class="mb-1"
                :style="`z-index: ${filteredPosted.length - index}`"
              >
                <b-card-header header-tag="header" role="tab">
                  <div
                    class="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <h5 class="mb-0">{{ x.iarNumber }}</h5>
                      <div>DR Number: {{ x.drNumber }}</div>
                      <small>
                        <a
                          href="javascript: void(0);"
                          class="text-success d-flex align-items-center"
                          @click="x.visible = !x.visible"
                        >
                          {{ x.visible ? "Hide" : "Show" }}
                          Details
                          <i
                            class="bx bx-chevron-right rotate font-size-14"
                            :class="{
                              'rotate-90': x.visible,
                            }"
                          ></i>
                        </a>
                      </small>
                    </div>
                    <div class="float-end d-flex align-items-center">
                      <div>
                        <small>Total Amount:</small>
                        <h6>
                          {{
                            Intl.NumberFormat("ja-JP", {
                              currency: "PHP",
                              style: "currency",
                            }).format(x.total)
                          }}
                        </h6>
                      </div>
                      <div class="ms-4">
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
                          <b-dropdown-item @click="updateIar(x, 1)"
                            ><i class="mdi mdi-update font-size-18 me-1"></i
                            >Update Item</b-dropdown-item
                          >
                        </b-dropdown>
                      </div>
                    </div>
                    <!-- <div>
                      <small>Total Amount:</small>
                      <h6>
                        {{
                          Intl.NumberFormat("ja-JP", {
                            currency: "PHP",
                            style: "currency",
                          }).format(x.total)
                        }}
                      </h6>
                    </div> -->
                  </div>
                </b-card-header>
                <b-collapse
                  :visible="x.visible"
                  :accordion="`po-accordion-${x.id}`"
                  role="tabpanel"
                >
                  <b-card-body>
                    <div class="row">
                      <div class="col-md-3">
                        <div class="font-size-12 mb-1">
                          <b class="font-size-14">Date of Delivery: </b>
                          {{ formatDate(x.dateOfDelivery) }}
                        </div>
                        <div class="font-size-12 mb-1">
                          <b class="font-size-14">Date Inspected: </b>
                          {{ formatDate(x.dateInspected) }}
                        </div>
                        <div class="font-size-12 mb-1">
                          <b class="font-size-14">Acceptance Date: </b>
                          {{ formatDate(x.acceptanceDate) }}
                        </div>
                      </div>
                      <div class="col-md-9 border-start border-3">
                        <div class="ms-2">
                          <div class="mb-2">
                            <div class="d-flex justify-content-between">
                              <b class="font-size-16">Items:</b>
                            </div>
                          </div>
                          <div
                            class="
                              h-50vh
                              d-flex
                              align-items-center
                              justify-content-center
                            "
                            v-if="x.iarItems.length == 0"
                          >
                            <h5 class="text-muted">
                              <i class="fas fa-exclamation-triangle me-2"></i>No
                              Data Found
                            </h5>
                          </div>
                          <div v-else>
                            <table width="100%">
                              <thead>
                                <tr class="border-bottom">
                                  <th style="width: 90px" class="py-2">Qty</th>
                                  <th class="py-2">Item Name</th>
                                  <th class="py-2" style="width: 150px">
                                    Unit Price
                                  </th>
                                  <th class="py-2" style="width: 150px">
                                    Total Price
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr
                                  v-for="y in x.iarItems"
                                  :key="y.id"
                                  class="border-bottom"
                                >
                                  <td class="py-2">
                                    {{ y.quantity }}
                                  </td>
                                  <td class="py-2">
                                    <div>
                                      {{ y.itemName }}
                                    </div>
                                    <small>{{ y.description }}</small>
                                  </td>
                                  <td class="py-2">
                                    {{
                                      Intl.NumberFormat("ja-JP", {
                                        currency: "PHP",
                                        style: "currency",
                                      }).format(y.unitCost)
                                    }}
                                  </td>
                                  <td class="py-2">
                                    {{
                                      Intl.NumberFormat("ja-JP", {
                                        currency: "PHP",
                                        style: "currency",
                                      }).format(y.unitCost * y.quantity)
                                    }}
                                  </td>
                                </tr>
                              </tbody>
                              <tbody>
                                <tr class="border-bottom">
                                  <td class="py-2"></td>
                                  <td class="py-2"></td>
                                  <td class="py-2"></td>
                                  <td class="py-2">
                                    {{
                                      Intl.NumberFormat("ja-JP", {
                                        currency: "PHP",
                                        style: "currency",
                                      }).format(x.total)
                                    }}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </b-card-body>
                </b-collapse>
              </b-card>
            </div>
            <div
              class="
                dataTables_paginate
                paging_simple_numbers
                d-flex
                flex-row-reverse
                pt-3
                pb-3
              "
            >
              <ul
                class="pagination pagination-rounded mb-0"
                style="z-index: -1"
              >
                <!-- pagination -->
                <b-pagination
                  v-model="currentPagePosted"
                  :total-rows="rowsPosted"
                  :per-page="perPagePosted"
                ></b-pagination>
              </ul>
            </div>
          </div>
        </div>
      </b-tab>
      <b-tab>
        <template v-slot:title>
          <span class="d-inline-block d-sm-none">
            <i class="bx bx-home"></i>
          </span>
          <span class="d-none d-sm-inline-block">Available IAR</span>
        </template>
        <div
          class="
            card
            border-4 border-top border-start-0 border-end-0 border-primary
          "
        >
          <div class="card-body">
            <div class="row mb-2">
              <div class="col-md-6">
                <div class="d-flex align-items-center h-100">
                  <h4 class="mb-0">Available IAR List</h4>
                </div>
              </div>
              <div class="col-md-6">
                <div class="d-flex float-end">
                  <div id="tickets-table_filter" class="dataTables_filter me-1">
                    <label class="d-inline-flex align-items-center">
                      <b-form-input
                        autocomplete="off"
                        v-model="filterAvailable"
                        type="search"
                        placeholder="Search IAR..."
                        class="form-control"
                      ></b-form-input>
                    </label>
                  </div>
                  <div id="tickets-table_length" class="dataTables_length">
                    <label class="d-inline-flex align-items-center mb-0">
                      <b-form-select
                        class="form-select"
                        v-model="perPageAvailable"
                        size="sm"
                        :options="pageOptions"
                      >
                      </b-form-select>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div
              class="h-50vh d-flex align-items-center justify-content-center"
              v-if="availableLoading"
            >
              <div class="preloader-component me-2">
                <div class="status">
                  <div class="spinner-chase w-25px h-25px">
                    <div class="chase-dot"></div>
                    <div class="chase-dot"></div>
                    <div class="chase-dot"></div>
                    <div class="chase-dot"></div>
                    <div class="chase-dot"></div>
                    <div class="chase-dot"></div>
                  </div>
                </div>
              </div>
              <h5 class="mb-0">Loading...</h5>
            </div>
            <div
              class="h-50vh d-flex align-items-center justify-content-center"
              v-else-if="availableData.length == 0"
            >
              <h5 class="text-muted">
                <i class="fas fa-exclamation-triangle me-2"></i>No Data Found
              </h5>
            </div>
            <div
              class="pt-1 pb-1 text-muted"
              role="tablist"
              v-for="(x, index) in filteredAvailable"
              :key="x.id"
            >
              <b-card
                no-body
                class="mb-1"
                :style="`z-index: ${filteredAvailable.length - index}`"
              >
                <b-card-header header-tag="header" role="tab">
                  <div
                    class="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <h5 class="mb-0">{{ x.iarNumber }}</h5>
                      <div>DR Number: {{ x.drNumber }}</div>
                      <small>
                        <a
                          href="javascript: void(0);"
                          class="text-success d-flex align-items-center"
                          @click="x.visible = !x.visible"
                        >
                          {{ x.visible ? "Hide" : "Show" }}
                          Details
                          <i
                            class="bx bx-chevron-right rotate font-size-14"
                            :class="{
                              'rotate-90': x.visible,
                            }"
                          ></i>
                        </a>
                      </small>
                    </div>
                    <div class="float-end d-flex align-items-center">
                      <div>
                        <small>Total Amount:</small>
                        <h6>
                          {{
                            Intl.NumberFormat("ja-JP", {
                              currency: "PHP",
                              style: "currency",
                            }).format(x.total)
                          }}
                        </h6>
                      </div>
                      <div class="ms-4">
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
                          <b-dropdown-item @click="updateIar(x, 2)"
                            ><i class="mdi mdi-update font-size-18 me-1"></i
                            >Update Item</b-dropdown-item
                          >
                        </b-dropdown>
                      </div>
                    </div>
                    <!-- <div>
                      <small>Total Amount:</small>
                      <h6>
                        {{
                          Intl.NumberFormat("ja-JP", {
                            currency: "PHP",
                            style: "currency",
                          }).format(x.total)
                        }}
                      </h6>
                    </div> -->
                  </div>
                </b-card-header>
                <b-collapse
                  :visible="x.visible"
                  :accordion="`po-accordion-${x.id}`"
                  role="tabpanel"
                >
                  <b-card-body>
                    <div class="row">
                      <div class="col-md-3">
                        <div class="font-size-12 mb-1">
                          <b class="font-size-14">Date of Delivery: </b>
                          {{ formatDate(x.dateOfDelivery) }}
                        </div>
                        <div class="font-size-12 mb-1">
                          <b class="font-size-14">Date Inspected: </b>
                          {{ formatDate(x.dateInspected) }}
                        </div>
                        <div class="font-size-12 mb-1">
                          <b class="font-size-14">Acceptance Date: </b>
                          {{ formatDate(x.acceptanceDate) }}
                        </div>
                      </div>
                      <div class="col-md-9 border-start border-3">
                        <div class="ms-2">
                          <div class="mb-2">
                            <div class="d-flex justify-content-between">
                              <b class="font-size-16">Items:</b>
                              <div class="d-flex align-items-center">
                                <button
                                  v-if="selectedRowCheck(x.iarItems)"
                                  type="button"
                                  @click="onSubmit(x)"
                                  class="
                                    btn btn-sm btn-success
                                    mb-2
                                    me-2
                                    d-flex
                                    align-items-center
                                  "
                                >
                                  <i class="bx bx-check-circle fs-6"></i>Submit
                                  Items
                                </button>
                              </div>
                            </div>
                          </div>
                          <div
                            class="
                              h-50vh
                              d-flex
                              align-items-center
                              justify-content-center
                            "
                            v-if="x.iarItems.length == 0"
                          >
                            <h5 class="text-muted">
                              <i class="fas fa-exclamation-triangle me-2"></i>No
                              Data Found
                            </h5>
                          </div>
                          <div v-else>
                            <table width="100%">
                              <thead>
                                <tr class="border-bottom">
                                  <th style="width: 90px" class="py-2">Qty</th>
                                  <th class="py-2">Item Name</th>
                                  <th class="py-2" style="width: 150px">
                                    Unit Price
                                  </th>
                                  <th class="py-2" style="width: 150px">
                                    Total Price
                                  </th>
                                  <th class="py-2" style="width: 30px">
                                    <div
                                      class="
                                        form-check
                                        form-checkbox-outline
                                        form-check-success
                                        mb-0
                                      "
                                    >
                                      <input
                                        type="checkbox"
                                        id="customCheckcolor2"
                                        checked="checked"
                                        class="form-check-input"
                                        @change="toggleAll(x.id)"
                                        v-model="x.toggleAll"
                                      /><label
                                        for="customCheckcolor2"
                                        class="form-check-label"
                                      >
                                        All
                                      </label>
                                    </div>
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr
                                  v-for="y in x.iarItems"
                                  :key="y.id"
                                  class="border-bottom"
                                >
                                  <td class="py-2">
                                    {{ y.quantity }}
                                  </td>
                                  <td class="py-2">
                                    <div>
                                      {{ y.itemName }}
                                    </div>
                                    <small>{{ y.description }}</small>
                                  </td>
                                  <td class="py-2">
                                    {{
                                      Intl.NumberFormat("ja-JP", {
                                        currency: "PHP",
                                        style: "currency",
                                      }).format(y.unitCost)
                                    }}
                                  </td>
                                  <td class="py-2">
                                    {{
                                      Intl.NumberFormat("ja-JP", {
                                        currency: "PHP",
                                        style: "currency",
                                      }).format(y.unitCost * y.quantity)
                                    }}
                                  </td>
                                  <td class="py-2">
                                    <div
                                      class="
                                        form-check
                                        form-checkbox-outline
                                        form-check-success
                                        mb-0
                                      "
                                    >
                                      <input
                                        type="checkbox"
                                        :id="`apiID-${y.id}`"
                                        class="form-check-input"
                                        @change="checkToggle(x.id)"
                                        v-model="y.toggleSelected"
                                      />
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                              <tbody>
                                <tr class="border-bottom">
                                  <td class="py-2"></td>
                                  <td class="py-2"></td>
                                  <td class="py-2"></td>
                                  <td class="py-2">
                                    {{
                                      Intl.NumberFormat("ja-JP", {
                                        currency: "PHP",
                                        style: "currency",
                                      }).format(x.total)
                                    }}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </b-card-body>
                </b-collapse>
              </b-card>
            </div>
            <div
              class="
                dataTables_paginate
                paging_simple_numbers
                d-flex
                flex-row-reverse
                pt-3
                pb-3
              "
            >
              <ul
                class="pagination pagination-rounded mb-0"
                style="z-index: -1"
              >
                <!-- pagination -->
                <b-pagination
                  v-model="currentPageAvailable"
                  :total-rows="rowsAvailable"
                  :per-page="perPageAvailable"
                ></b-pagination>
              </ul>
            </div>
          </div>
        </div>
      </b-tab>
    </b-tabs>
  </Layout>
</template>

