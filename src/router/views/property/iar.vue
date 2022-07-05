<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import { cloneDeep } from "lodash";
import { required } from "vuelidate/lib/validators";
import DatePicker from "vue2-datepicker";
import createNumberMask from "text-mask-addons/dist/createNumberMask";
import MaskedInput from "vue-text-mask";
import ItemCategory from "@/components/modals/item-category.vue";
import Supplier from "@/components/modals/supplier.vue";
import Unit from "@/components/modals/unit.vue";

export default {
  page: {
    title: "IAR",
  },
  components: {
    Layout,
    PageHeader,
    DatePicker,
    MaskedInput,
    ItemCategory,
    Supplier,
    Unit,
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
      po: {
        id: null,
        description: "",
      },
      pendingData: [],
      postedData: [],
      filterPending: "",
      filterPosted: "",
      pageOptions: [10, 25, 50, 100],
      perPagePending: 10,
      perPagePosted: 10,
      currentPagePending: 1,
      currentPagePosted: 1,
      currentPageQuantity: 1,
      pendingLoading: false,
      postedLoading: false,
      pendingIndex: -1,
      postedIndex: -1,
      cycle: this.$store.state.data.cycle,
      tabIndex: 0,
      form: {
        id: null,
        name: "",
        brand: "",
        model: "",
        specification: "",
        color: "",
        dimensionDescription: "",
        materialUsed: "",
        packageDescription: "",
        propertyNumber: "",
        serialNumber: "",
        dateAcquired: "",
        amount: "",
        lifespanInYears: "",
        yearlyDepreciation: "",
        salvageValue: "",
        itemCategoryId: "",
        supplierId: "",
        supplier: "",
        poNumber: "",
        note: "",
        condition: "",
        fundCluster: "",
        unit: "",
      },
      itemCategory: "",
      alert: {
        type: "",
        message: "",
      },
    };
  },
  validations: {
    form: {
      name: { required },
      brand: { required },
      model: { required },
      specification: { required },
      poNumber: { required },
      color: { required },
      dimensionDescription: { required },
      materialUsed: { required },
      packageDescription: { required },
      dateAcquired: { required },
      amount: { required },
      lifespanInYears: { required },
      yearlyDepreciation: { required },
      salvageValue: { required },
      itemCategoryId: { required },
      supplierId: { required },
      supplier: { required },
      note: { required },
      condition: { required },
      fundCluster: { required },
      unit: { required },
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
  },
  created() {
    this.changeCycle(this.$store.state.data.cycle);
  },
  methods: {
    changeCycle(cycle) {
      this.getPending(cycle);
      //   this.getPosted(cycle);
    },
    getPending(cycle) {
      this.pendingLoading = true;
      this.$store
        .dispatch("propertyiar/GetPropertyIarPending", cycle)
        .then((res) => {
          this.pendingLoading = false;
          res.data.forEach((x) => {
            x.editDate = false;
            x.visible = false;
            x.iarDate = new Date(x.iarDate);
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
              "Something went wrong getting submitted IAR!",
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
            x.iarDate = new Date(x.iarDate);
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
    onPost() {
      this.submitted = true;
      this.$v.$touch();
      if (this.checkCreateForm() || this.$v.$invalid) {
        return;
      } else {
        var props = [];
        this.form.quantities.forEach((x) => {
          props.push({
            iarItemId: x.iarItemId,
            propertyNumber: x.propertyNumber,
            serialNumber: x.serialNumber,
            name: this.form.name,
            brand: this.form.brand,
            unit: this.form.unit,
            model: this.form.model,
            specification: this.form.specification,
            color: this.form.color,
            dimensionDescription: this.form.dimensionDescription,
            materialUsed: this.form.materialUsed,
            packageDescription: this.form.packageDescription,
            condition: this.form.condition,
            dateAcquired: this.setDate(this.form.dateAcquired),
            amount: this.form.amount,
            lifespanInYears: this.form.lifespanInYears,
            yearlyDepreciation: this.form.yearlyDepreciation,
            salvageValue: this.form.salvageValue,
            itemCategoryId: this.form.itemCategoryId,
            supplierId: this.form.supplierId,
            supplier: this.form.supplier,
            poNumber: this.form.poNumber,
            fundCluster: this.form.fundCluster,
            note: this.form.note,
          });
        });
        this.$store
          .dispatch("property/CreatePropertyMultiple", props)
          .then((res) => {
            if (res.data.error) {
              return this.showToast(res.data.detail, "error");
            }
            this.$store
              .dispatch("propertyiar/PostPropertyIar", this.form.id)
              .then((res) => {
                if (res.data.error) {
                  return this.showToast(res.data.detail, "error");
                }
                var iarIndex = this.pendingData.findIndex(
                  (item) => item.id == this.form.iarId
                );
                props.forEach((x) => {
                  var itemIndex = this.pendingData[iarIndex].iarItems.findIndex(
                    (item) => item.id == x.id
                  );
                  this.pendingData[iarIndex].iarItems.splice(itemIndex, 1);
                });
                if (this.pendingData[iarIndex].iarItems.length == 0) {
                  this.pendingData.splice(iarIndex, 1);
                }
              });
            this.hideModalCreate();
            this.showToast("Successfully set!", "success");
          })
          .catch((err) => {
            this.showToast(
              "Something went setting IAR items as property!",
              "error"
            );
          });
        this.submitted = false;
      }
    },
    onReset() {
      this.form = {
        id: null,
        name: "",
        specification: "",
        color: "",
        dimensionDescription: "",
        materialUsed: "",
        packageDescription: "",
        propertyNumber: "",
        serialNumber: "",
        dateAcquired: "",
        amount: "",
        lifespanInYears: "",
        yearlyDepreciation: "",
        salvageValue: "",
        itemCategoryId: "",
        supplierId: "",
        supplier: "",
        poNumber: "",
        note: "",
        condition: "New",
        fundCluster: "",
        unit: "",
      };
      this.itemCategory = "";
      this.alert = {
        type: "",
        message: "",
      };
      this.submitted = false;
    },
    createProperty(props) {
      this.onReset();
      this.form = cloneDeep(props);
      var iarIndex = this.pendingData.findIndex(
        (item) => item.id == props.iarId
      );
      this.form.poNumber = this.pendingData[iarIndex].po.poNumber;
      this.form.supplierId =
        this.pendingData[iarIndex].po.rfqSupplier.supplierId;
      this.form.supplier =
        this.pendingData[iarIndex].po.rfqSupplier.supplier.name;
      this.form.quantities = [];
      for (var x = 0; x < props.quantity; x++) {
        this.form.quantities.push({
          serialNumber: "",
          propertyNumber: "",
        });
      }
      this.currentPageQuantity = 1;
      this.form.iarItemId = props.id;
      this.form.name = props.itemName;
      this.form.amount = props.unitCost.toString();
      this.form.unit = props.unit.unitName;
      this.itemCategory = props.itemCategory.name;
      this.modalTitle = "Create Property";
      this.$bvModal.show("modal-create");
    },
    hideModalCreate() {
      this.$bvModal.hide("modal-create");
    },
    getItemCategory() {
      this.$bvModal.show("item-category-modal");
    },
    dropItemCat(data) {
      this.form.itemCategoryId = data.id;
      this.itemCategory = data.name;
    },
    getSupplier() {
      this.$bvModal.show("supplier-modal");
    },
    dropSupplier(data) {
      this.form.supplierId = data.id;
      this.form.supplier = data.name;
    },
    removeSupplier() {
      this.form.supplierId = 0;
      this.form.supplier = "";
    },
    getUnit() {
      this.$refs.unit.getData();
      this.$bvModal.show("unit-modal");
    },
    dropUnit(data) {
      this.form.unit = data.unitName;
    },
    filteredQuantity(props) {
      if (props.quantities?.length) {
        let data = props.quantities;
        var total = this.currentPageQuantity * 1;
        var currentData = data.slice(total - 1, total);
        if (this.currentPageQuantity > 1 && currentData.length == 0) {
          total = (this.currentPageQuantity - 1) * 1;
          currentData = data.slice(total - 1, total);
        }
        return currentData;
      }
    },
    checkCreateForm() {
      var confirm = false;
      var error = [];
      var counter = 1;
      this.form.quantities.forEach((item) => {
        if (
          item.serialNumber === "" ||
          item.serialNumber === null ||
          item.propertyNumber === "" ||
          item.propertyNumber === null
        ) {
          confirm = true;
          error.push(counter);
        }
        counter++;
      });
      if (confirm) {
        this.alert = {
          type: "warning",
          message: error,
        };
        this.currentPageQuantity = error[0];
      }
      return confirm;
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
      id="modal-create"
      :title="modalTitle"
      size="xl"
      title-class="font-18"
      hide-footer
    >
      <form @submit.prevent="onPost" class="needs-validation mt-3" ref="fcForm">
        <b-alert
          :show="alert.type === 'warning'"
          dismissible
          @dismissed="alert.type = ''"
          variant="warning"
        >
          <i class="mdi mdi-alert-outline me-2"></i>Page/s
          {{ alert.message }} needs to be filled out.
        </b-alert>
        <div class="d-flex justify-content-between">
          <h5 class="mt-3">
            Page {{ currentPageQuantity }} of {{ form.quantity }}
          </h5>
          <div class="dataTables_paginate paging_simple_numbers pb-3">
            <ul class="pagination pagination-rounded mb-0" style="z-index: -1">
              <b-pagination
                v-model="currentPageQuantity"
                :total-rows="form.quantity"
                :per-page="1"
              ></b-pagination>
            </ul>
          </div>
        </div>
        <div class="card border p-3">
          <div
            v-for="(x, index) in filteredQuantity(form)"
            :key="index"
            class="row mb-3"
          >
            <div class="col-md-6">
              <label for="propertyNumber">Property Number </label>
              <masked-input
                id="propertyNumber"
                type="text"
                v-model="x.propertyNumber"
                placeholder="Enter Property Number..."
                class="form-control"
                :class="{
                  'is-invalid':
                    submitted &&
                    (x.propertyNumber == '' || x.propertyNumber == null),
                }"
                autocomplete="off"
                :mask="[
                  /\d/,
                  /\d/,
                  /\d/,
                  /\d/,
                  '-',
                  /\d/,
                  /\d/,
                  '-',
                  /\d/,
                  /\d/,
                  '-',
                  /\d/,
                  /\d/,
                  /\d/,
                  /\d/,
                  /[0-9-]/,
                  /[0-9-]/,
                  /\d/,
                  /\d/,
                ]"
                :guide="false"
              ></masked-input>
              <div
                v-if="
                  submitted &&
                  (x.propertyNumber == '' || x.propertyNumber == null)
                "
                class="invalid-feedback"
              >
                <span>This value is required.</span>
              </div>
            </div>
            <div class="col-md-6">
              <label for="serialNumber">Serial Number </label>
              <input
                id="serialNumber"
                type="text"
                v-model="x.serialNumber"
                placeholder="Enter Serial Number..."
                class="form-control"
                :class="{
                  'is-invalid':
                    submitted &&
                    (x.serialNumber == '' || x.serialNumber == null),
                }"
                autocomplete="off"
              />
              <div
                v-if="
                  submitted && (x.serialNumber == '' || x.serialNumber == null)
                "
                class="invalid-feedback"
              >
                <span>This value is required.</span>
              </div>
            </div>
          </div>
        </div>
        <div class="card border p-3">
          <div class="row">
            <div class="col-md-12">
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="propertyName">Property Name </label>
                    <input
                      id="propertyName"
                      type="text"
                      v-model="form.name"
                      placeholder="Enter Property Name..."
                      class="form-control"
                      :class="{
                        'is-invalid': submitted && $v.form.name.$error,
                      }"
                      autocomplete="off"
                    />
                    <div
                      v-if="submitted && $v.form.name.$error"
                      class="invalid-feedback"
                    >
                      <span v-if="!$v.form.name.required"
                        >This value is required.</span
                      >
                    </div>
                  </div>
                  <div class="mb-3">
                    <label for="brand">Brand </label>
                    <input
                      id="brand"
                      type="text"
                      v-model="form.brand"
                      placeholder="Enter Brand..."
                      class="form-control"
                      :class="{
                        'is-invalid': submitted && $v.form.brand.$error,
                      }"
                      autocomplete="off"
                    />
                    <div
                      v-if="submitted && $v.form.brand.$error"
                      class="invalid-feedback"
                    >
                      <span v-if="!$v.form.brand.required"
                        >This value is required.</span
                      >
                    </div>
                  </div>
                  <div class="mb-3">
                    <label for="model">Model </label>
                    <input
                      id="model"
                      type="text"
                      v-model="form.model"
                      placeholder="Enter Model..."
                      class="form-control"
                      :class="{
                        'is-invalid': submitted && $v.form.model.$error,
                      }"
                      autocomplete="off"
                    />
                    <div
                      v-if="submitted && $v.form.model.$error"
                      class="invalid-feedback"
                    >
                      <span v-if="!$v.form.model.required"
                        >This value is required.</span
                      >
                    </div>
                  </div>
                  <div class="mb-3">
                    <label for="specification">Property Specification </label>
                    <textarea
                      id="specification"
                      rows="6"
                      v-model="form.specification"
                      placeholder="Enter Property Specification..."
                      class="form-control"
                      :class="{
                        'is-invalid': submitted && $v.form.specification.$error,
                      }"
                      autocomplete="off"
                    ></textarea>
                    <div
                      v-if="submitted && $v.form.specification.$error"
                      class="invalid-feedback"
                    >
                      <span v-if="!$v.form.specification.required"
                        >This value is required.</span
                      >
                    </div>
                  </div>
                  <div class="mb-3">
                    <label for="color">Color </label>
                    <input
                      id="color"
                      type="text"
                      v-model="form.color"
                      placeholder="Enter Property Color..."
                      class="form-control"
                      :class="{
                        'is-invalid': submitted && $v.form.color.$error,
                      }"
                      autocomplete="off"
                    />
                    <div
                      v-if="submitted && $v.form.color.$error"
                      class="invalid-feedback"
                    >
                      <span v-if="!$v.form.color.required"
                        >This value is required.</span
                      >
                    </div>
                  </div>
                  <div class="mb-3">
                    <label for="dimensionDescription"
                      >Dimension Description
                    </label>
                    <input
                      id="dimensionDescription"
                      type="text"
                      v-model="form.dimensionDescription"
                      placeholder="Enter Dimension Description..."
                      class="form-control"
                      :class="{
                        'is-invalid':
                          submitted && $v.form.dimensionDescription.$error,
                      }"
                      autocomplete="off"
                    />
                    <div
                      v-if="submitted && $v.form.dimensionDescription.$error"
                      class="invalid-feedback"
                    >
                      <span v-if="!$v.form.dimensionDescription.required"
                        >This value is required.</span
                      >
                    </div>
                  </div>
                  <div class="mb-3">
                    <label for="materialUsed">Material Used </label>
                    <textarea
                      id="materialUsed"
                      rows="2"
                      v-model="form.materialUsed"
                      placeholder="Enter Material Used..."
                      class="form-control"
                      :class="{
                        'is-invalid': submitted && $v.form.materialUsed.$error,
                      }"
                      autocomplete="off"
                    ></textarea>
                    <div
                      v-if="submitted && $v.form.materialUsed.$error"
                      class="invalid-feedback"
                    >
                      <span v-if="!$v.form.materialUsed.required"
                        >This value is required.</span
                      >
                    </div>
                  </div>
                  <div class="mb-3">
                    <label for="packageDescription">Package Description </label>
                    <textarea
                      id="packageDescription"
                      rows="6"
                      v-model="form.packageDescription"
                      placeholder="Enter Package Description..."
                      class="form-control"
                      :class="{
                        'is-invalid':
                          submitted && $v.form.packageDescription.$error,
                      }"
                      autocomplete="off"
                    ></textarea>
                    <div
                      v-if="submitted && $v.form.packageDescription.$error"
                      class="invalid-feedback"
                    >
                      <span v-if="!$v.form.packageDescription.required"
                        >This value is required.</span
                      >
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="poNumber">P.O. Number </label>
                    <input
                      id="poNumber"
                      type="text"
                      v-model="form.poNumber"
                      placeholder="Enter PO Number..."
                      class="form-control"
                      :class="{
                        'is-invalid': submitted && $v.form.poNumber.$error,
                      }"
                      autocomplete="off"
                    />
                    <div
                      v-if="submitted && $v.form.poNumber.$error"
                      class="invalid-feedback"
                    >
                      <span v-if="!$v.form.poNumber.required"
                        >This value is required.</span
                      >
                    </div>
                  </div>
                  <div class="row mb-3">
                    <div class="col-md-6">
                      <label for="dateAcquired">Date Acquired </label>
                      <date-picker
                        v-model="form.dateAcquired"
                        :first-day-of-week="1"
                        lang="en"
                        placeholder="Enter Date Acquired..."
                        :class="{
                          'is-invalid':
                            submitted && $v.form.dateAcquired.$error,
                        }"
                      ></date-picker>
                      <div
                        v-if="submitted && $v.form.dateAcquired.$error"
                        class="invalid-feedback"
                      >
                        <span v-if="!$v.form.dateAcquired.required"
                          >This value is required.</span
                        >
                      </div>
                    </div>
                    <div class="col-md-6">
                      <label for="amount">Amount </label>
                      <masked-input
                        id="amount"
                        type="text"
                        v-model="form.amount"
                        placeholder="Enter Amount..."
                        class="form-control"
                        :class="{
                          'is-invalid': submitted && $v.form.amount.$error,
                        }"
                        autocomplete="off"
                        :mask="currencyMask"
                      ></masked-input>
                      <div
                        v-if="submitted && $v.form.amount.$error"
                        class="invalid-feedback"
                      >
                        <span v-if="!$v.form.amount.required"
                          >This value is required.</span
                        >
                      </div>
                    </div>
                  </div>
                  <div class="row mb-3">
                    <div class="col-md-4">
                      <label for="lifespanInYears">Life Span in Years </label>
                      <masked-input
                        id="lifespanInYears"
                        type="text"
                        v-model="form.lifespanInYears"
                        placeholder="Enter Life Span..."
                        class="form-control"
                        :class="{
                          'is-invalid':
                            submitted && $v.form.lifespanInYears.$error,
                        }"
                        autocomplete="off"
                        :mask="quantityMask"
                      ></masked-input>
                      <div
                        v-if="submitted && $v.form.lifespanInYears.$error"
                        class="invalid-feedback"
                      >
                        <span v-if="!$v.form.lifespanInYears.required"
                          >This value is required.</span
                        >
                      </div>
                    </div>
                    <div class="col-md-4">
                      <label for="yearlyDepreciation"
                        >Yearly Depreciation
                      </label>
                      <masked-input
                        id="yearlyDepreciation"
                        type="text"
                        v-model="form.yearlyDepreciation"
                        placeholder="Enter Yearly Depreciation..."
                        class="form-control"
                        :class="{
                          'is-invalid':
                            submitted && $v.form.yearlyDepreciation.$error,
                        }"
                        autocomplete="off"
                        :mask="currencyMask"
                      ></masked-input>
                      <div
                        v-if="submitted && $v.form.yearlyDepreciation.$error"
                        class="invalid-feedback"
                      >
                        <span v-if="!$v.form.yearlyDepreciation.required"
                          >This value is required.</span
                        >
                      </div>
                    </div>
                    <div class="col-md-4">
                      <label for="salvageValue">Salvage Value </label>
                      <masked-input
                        id="salvageValue"
                        type="text"
                        v-model="form.salvageValue"
                        placeholder="Enter Salvage Value..."
                        class="form-control"
                        :class="{
                          'is-invalid':
                            submitted && $v.form.salvageValue.$error,
                        }"
                        autocomplete="off"
                        :mask="currencyMask"
                      ></masked-input>
                      <div
                        v-if="submitted && $v.form.salvageValue.$error"
                        class="invalid-feedback"
                      >
                        <span v-if="!$v.form.salvageValue.required"
                          >This value is required.</span
                        >
                      </div>
                    </div>
                  </div>
                  <div class="mb-3">
                    <label for="condition">Property Condition </label>
                    <b-form-select
                      class="form-select"
                      :class="{
                        'is-invalid': submitted && $v.form.condition.$error,
                      }"
                      v-model="form.condition"
                    >
                      <b-form-select-option value="" disabled
                        >Select Condition...</b-form-select-option
                      >
                      <b-form-select-option value="New"
                        >New</b-form-select-option
                      >
                      <b-form-select-option value="Used"
                        >Used</b-form-select-option
                      >
                      <b-form-select-option value="Donated"
                        >Donated</b-form-select-option
                      >
                      <b-form-select-option value="Refurbished"
                        >Refurbished</b-form-select-option
                      >
                      <b-form-select-option value="Re-condition"
                        >Re-condition</b-form-select-option
                      >
                    </b-form-select>
                    <div
                      v-if="submitted && $v.form.condition.$error"
                      class="invalid-feedback"
                    >
                      <span v-if="!$v.form.condition.required"
                        >This value is required.</span
                      >
                    </div>
                  </div>
                  <div class="mb-3">
                    <label for="itemCategoryId" class="mb-0"
                      >Item Category
                    </label>
                    <b-input-group>
                      <template #append>
                        <b-button
                          @click="getItemCategory"
                          variant="outline-info"
                          ><i class="mdi mdi-clipboard-text-search-outline"></i
                        ></b-button>
                      </template>
                      <input
                        autocomplete="off"
                        type="text"
                        disabled
                        placeholder="Search Item Category..."
                        class="form-control"
                        :class="{
                          'is-invalid':
                            submitted && $v.form.itemCategoryId.$error,
                        }"
                        v-model="itemCategory"
                      />
                    </b-input-group>
                    <div
                      v-if="submitted && $v.form.itemCategoryId.$error"
                      class="invalid-feedback"
                    >
                      <span v-if="!$v.form.itemCategoryId.required"
                        >This value is required.</span
                      >
                    </div>
                  </div>
                  <div class="mb-3">
                    <label for="supplier" class="mb-0">Supplier </label>
                    <b-input-group>
                      <template #append>
                        <b-button
                          @click="getSupplier"
                          variant="outline-info"
                          title="Search Supplier"
                          ><i class="mdi mdi-clipboard-text-search-outline"></i
                        ></b-button>
                        <b-button
                          @click="removeSupplier"
                          variant="outline-danger"
                          title="Remove Supplier"
                          ><i class="mdi mdi-close-thick"></i
                        ></b-button>
                      </template>
                      <input
                        autocomplete="off"
                        type="text"
                        placeholder="Search/Enter Supplier..."
                        class="form-control"
                        :class="{
                          'is-invalid': submitted && $v.form.supplier.$error,
                        }"
                        v-model="form.supplier"
                      />
                    </b-input-group>
                    <div
                      v-if="submitted && $v.form.supplier.$error"
                      class="invalid-feedback"
                    >
                      <span v-if="!$v.form.supplier.required"
                        >This value is required.</span
                      >
                    </div>
                  </div>
                  <div class="mb-3">
                    <label for="fundCluster">Fund Cluster </label>
                    <input
                      id="fundCluster"
                      type="text"
                      v-model="form.fundCluster"
                      placeholder="Enter Fund Cluster..."
                      class="form-control"
                      :class="{
                        'is-invalid': submitted && $v.form.fundCluster.$error,
                      }"
                      autocomplete="off"
                    />
                    <div
                      v-if="submitted && $v.form.fundCluster.$error"
                      class="invalid-feedback"
                    >
                      <span v-if="!$v.form.fundCluster.required"
                        >This value is required.</span
                      >
                    </div>
                  </div>
                  <div class="mb-3">
                    <label for="unit">Unit </label>
                    <b-input-group>
                      <template #append>
                        <b-button @click="getUnit()" variant="outline-info"
                          ><i class="mdi mdi-clipboard-text-search-outline"></i
                        ></b-button>
                      </template>
                      <input
                        autocomplete="off"
                        type="text"
                        disabled
                        placeholder="Search Unit..."
                        class="form-control"
                        :class="{
                          'is-invalid': submitted && $v.form.unit.$error,
                        }"
                        v-model="form.unit"
                      />
                    </b-input-group>
                    <div
                      v-if="submitted && $v.form.unit.$error"
                      class="invalid-feedback"
                    >
                      <span v-if="!$v.form.unit.required"
                        >This value is required.</span
                      >
                    </div>
                  </div>
                  <div class="mb-3">
                    <label for="note">Notes </label>
                    <textarea
                      id="note"
                      rows="4"
                      v-model="form.note"
                      placeholder="Enter Notes..."
                      class="form-control"
                      :class="{
                        'is-invalid': submitted && $v.form.note.$error,
                      }"
                      autocomplete="off"
                    ></textarea>
                    <div
                      v-if="submitted && $v.form.note.$error"
                      class="invalid-feedback"
                    >
                      <span v-if="!$v.form.note.required"
                        >This value is required.</span
                      >
                    </div>
                  </div>
                </div>
                <!-- <div class="col-md-6">
                  <div class="mb-3">
                    <label for="poNumber">P.O Number </label>
                    <input
                      id="poNumber"
                      type="text"
                      v-model="form.poNumber"
                      placeholder="Enter PO Number..."
                      class="form-control"
                      :class="{
                        'is-invalid': submitted && $v.form.poNumber.$error,
                      }"
                      autocomplete="off"
                    />
                    <div
                      v-if="submitted && $v.form.poNumber.$error"
                      class="invalid-feedback"
                    >
                      <span v-if="!$v.form.poNumber.required"
                        >This value is required.</span
                      >
                    </div>
                  </div>
                  <div class="mb-3">
                    <label for="propertyName">Property Name </label>
                    <input
                      id="propertyName"
                      type="text"
                      v-model="form.name"
                      placeholder="Enter Property Name..."
                      class="form-control"
                      :class="{
                        'is-invalid': submitted && $v.form.name.$error,
                      }"
                      autocomplete="off"
                    />
                    <div
                      v-if="submitted && $v.form.name.$error"
                      class="invalid-feedback"
                    >
                      <span v-if="!$v.form.name.required"
                        >This value is required.</span
                      >
                    </div>
                  </div>
                  <div class="row mb-3">
                    <div class="col-md-8">
                      <label for="brand">Brand </label>
                      <input
                        id="brand"
                        type="text"
                        v-model="form.brand"
                        placeholder="Enter Brand..."
                        class="form-control"
                        :class="{
                          'is-invalid': submitted && $v.form.brand.$error,
                        }"
                        autocomplete="off"
                      />
                      <div
                        v-if="submitted && $v.form.brand.$error"
                        class="invalid-feedback"
                      >
                        <span v-if="!$v.form.brand.required"
                          >This value is required.</span
                        >
                      </div>
                    </div>
                    <div class="col-md-4">
                      <label for="model">Model </label>
                      <input
                        id="model"
                        type="text"
                        v-model="form.model"
                        placeholder="Enter Model..."
                        class="form-control"
                        :class="{
                          'is-invalid': submitted && $v.form.model.$error,
                        }"
                        autocomplete="off"
                      />
                      <div
                        v-if="submitted && $v.form.model.$error"
                        class="invalid-feedback"
                      >
                        <span v-if="!$v.form.model.required"
                          >This value is required.</span
                        >
                      </div>
                    </div>
                  </div>
                  <div class="mb-3">
                    <label for="specification">Property Specification </label>
                    <textarea
                      id="specification"
                      rows="2"
                      v-model="form.specification"
                      placeholder="Enter Property Specification..."
                      class="form-control"
                      :class="{
                        'is-invalid': submitted && $v.form.specification.$error,
                      }"
                      autocomplete="off"
                    ></textarea>
                    <div
                      v-if="submitted && $v.form.specification.$error"
                      class="invalid-feedback"
                    >
                      <span v-if="!$v.form.specification.required"
                        >This value is required.</span
                      >
                    </div>
                  </div>
                  <div class="row mb-3">
                    <div class="col-md-4">
                      <label for="color">Color </label>
                      <input
                        id="color"
                        type="text"
                        v-model="form.color"
                        placeholder="Enter Property Color..."
                        class="form-control"
                        :class="{
                          'is-invalid': submitted && $v.form.color.$error,
                        }"
                        autocomplete="off"
                      />
                      <div
                        v-if="submitted && $v.form.color.$error"
                        class="invalid-feedback"
                      >
                        <span v-if="!$v.form.color.required"
                          >This value is required.</span
                        >
                      </div>
                    </div>
                    <div class="col-md-8">
                      <label for="dimensionDescription"
                        >Dimension Description
                      </label>
                      <input
                        id="dimensionDescription"
                        type="text"
                        v-model="form.dimensionDescription"
                        placeholder="Enter Dimension Description..."
                        class="form-control"
                        :class="{
                          'is-invalid':
                            submitted && $v.form.dimensionDescription.$error,
                        }"
                        autocomplete="off"
                      />
                      <div
                        v-if="submitted && $v.form.dimensionDescription.$error"
                        class="invalid-feedback"
                      >
                        <span v-if="!$v.form.dimensionDescription.required"
                          >This value is required.</span
                        >
                      </div>
                    </div>
                  </div>
                  <div class="mb-3">
                    <label for="materialUsed">Material Used </label>
                    <textarea
                      id="materialUsed"
                      rows="2"
                      v-model="form.materialUsed"
                      placeholder="Enter Material Used..."
                      class="form-control"
                      :class="{
                        'is-invalid': submitted && $v.form.materialUsed.$error,
                      }"
                      autocomplete="off"
                    ></textarea>
                    <div
                      v-if="submitted && $v.form.materialUsed.$error"
                      class="invalid-feedback"
                    >
                      <span v-if="!$v.form.materialUsed.required"
                        >This value is required.</span
                      >
                    </div>
                  </div>
                  <div class="mb-3">
                    <label for="packageDescription">Package Description </label>
                    <textarea
                      id="packageDescription"
                      rows="4"
                      v-model="form.packageDescription"
                      placeholder="Enter Package Description..."
                      class="form-control"
                      :class="{
                        'is-invalid':
                          submitted && $v.form.packageDescription.$error,
                      }"
                      autocomplete="off"
                    ></textarea>
                    <div
                      v-if="submitted && $v.form.packageDescription.$error"
                      class="invalid-feedback"
                    >
                      <span v-if="!$v.form.packageDescription.required"
                        >This value is required.</span
                      >
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="fundCluster">Fund Cluster </label>
                    <input
                      id="fundCluster"
                      type="text"
                      v-model="form.fundCluster"
                      placeholder="Enter Fund Cluster..."
                      class="form-control"
                      :class="{
                        'is-invalid': submitted && $v.form.fundCluster.$error,
                      }"
                      autocomplete="off"
                    />
                    <div
                      v-if="submitted && $v.form.fundCluster.$error"
                      class="invalid-feedback"
                    >
                      <span v-if="!$v.form.fundCluster.required"
                        >This value is required.</span
                      >
                    </div>
                  </div>
                  <div class="row mb-3">
                    <div class="col-md-6">
                      <label for="dateAcquired">Date Acquired </label>
                      <date-picker
                        v-model="form.dateAcquired"
                        :first-day-of-week="1"
                        lang="en"
                        placeholder="Enter Date Acquired..."
                        :class="{
                          'is-invalid':
                            submitted && $v.form.dateAcquired.$error,
                        }"
                      ></date-picker>
                      <div
                        v-if="submitted && $v.form.dateAcquired.$error"
                        class="invalid-feedback"
                      >
                        <span v-if="!$v.form.dateAcquired.required"
                          >This value is required.</span
                        >
                      </div>
                    </div>
                    <div class="col-md-6">
                      <label for="amount">Amount </label>
                      <masked-input
                        id="amount"
                        type="text"
                        v-model="form.amount"
                        placeholder="Enter Amount..."
                        class="form-control"
                        :class="{
                          'is-invalid': submitted && $v.form.amount.$error,
                        }"
                        autocomplete="off"
                        :mask="currencyMask"
                      ></masked-input>
                      <div
                        v-if="submitted && $v.form.amount.$error"
                        class="invalid-feedback"
                      >
                        <span v-if="!$v.form.amount.required"
                          >This value is required.</span
                        >
                      </div>
                    </div>
                  </div>
                  <div class="row mb-3">
                    <div class="col-md-4">
                      <label for="lifespanInYears">Life Span in Yrs. </label>
                      <masked-input
                        id="lifespanInYears"
                        type="text"
                        v-model="form.lifespanInYears"
                        placeholder="Enter Life Span..."
                        class="form-control"
                        :class="{
                          'is-invalid':
                            submitted && $v.form.lifespanInYears.$error,
                        }"
                        autocomplete="off"
                        :mask="quantityMask"
                      ></masked-input>
                      <div
                        v-if="submitted && $v.form.lifespanInYears.$error"
                        class="invalid-feedback"
                      >
                        <span v-if="!$v.form.lifespanInYears.required"
                          >This value is required.</span
                        >
                      </div>
                    </div>
                    <div class="col-md-4">
                      <label for="yearlyDepreciation"
                        >Yearly Depreciation
                      </label>
                      <masked-input
                        id="yearlyDepreciation"
                        type="text"
                        v-model="form.yearlyDepreciation"
                        placeholder="Enter Yearly Depreciation..."
                        class="form-control"
                        :class="{
                          'is-invalid':
                            submitted && $v.form.yearlyDepreciation.$error,
                        }"
                        autocomplete="off"
                        :mask="currencyMask"
                      ></masked-input>
                      <div
                        v-if="submitted && $v.form.yearlyDepreciation.$error"
                        class="invalid-feedback"
                      >
                        <span v-if="!$v.form.yearlyDepreciation.required"
                          >This value is required.</span
                        >
                      </div>
                    </div>
                    <div class="col-md-4">
                      <label for="salvageValue">Salvage Value </label>
                      <masked-input
                        id="salvageValue"
                        type="text"
                        v-model="form.salvageValue"
                        placeholder="Enter Salvage Value..."
                        class="form-control"
                        :class="{
                          'is-invalid':
                            submitted && $v.form.salvageValue.$error,
                        }"
                        autocomplete="off"
                        :mask="currencyMask"
                      ></masked-input>
                      <div
                        v-if="submitted && $v.form.salvageValue.$error"
                        class="invalid-feedback"
                      >
                        <span v-if="!$v.form.salvageValue.required"
                          >This value is required.</span
                        >
                      </div>
                    </div>
                  </div>
                  <div class="mb-3">
                    <label for="condition">Property Condition </label>
                    <b-form-select
                      class="form-select"
                      :class="{
                        'is-invalid': submitted && $v.form.condition.$error,
                      }"
                      v-model="form.condition"
                    >
                      <b-form-select-option value="" disabled
                        >Select Condition...</b-form-select-option
                      >
                      <b-form-select-option value="New"
                        >New</b-form-select-option
                      >
                      <b-form-select-option value="Used"
                        >Used</b-form-select-option
                      >
                      <b-form-select-option value="Donated"
                        >Donated</b-form-select-option
                      >
                      <b-form-select-option value="Refurbished"
                        >Refurbished</b-form-select-option
                      >
                      <b-form-select-option value="Re-condition"
                        >Re-condition</b-form-select-option
                      >
                    </b-form-select>
                    <div
                      v-if="submitted && $v.form.condition.$error"
                      class="invalid-feedback"
                    >
                      <span v-if="!$v.form.condition.required"
                        >This value is required.</span
                      >
                    </div>
                  </div>
                  <div class="mb-3">
                    <label for="itemCategoryId" class="mb-0"
                      >Item Category
                    </label>
                    <b-input-group>
                      <template #append>
                        <b-button
                          @click="getItemCategory"
                          variant="outline-info"
                          ><i class="mdi mdi-clipboard-text-search-outline"></i
                        ></b-button>
                      </template>
                      <input
                        autocomplete="off"
                        type="text"
                        disabled
                        placeholder="Search Item Category..."
                        class="form-control"
                        :class="{
                          'is-invalid':
                            submitted && $v.form.itemCategoryId.$error,
                        }"
                        v-model="itemCategory"
                      />
                    </b-input-group>
                    <div
                      v-if="submitted && $v.form.itemCategoryId.$error"
                      class="invalid-feedback"
                    >
                      <span v-if="!$v.form.itemCategoryId.required"
                        >This value is required.</span
                      >
                    </div>
                  </div>
                  <div class="mb-3">
                    <label for="supplier" class="mb-0">Supplier </label>
                    <b-input-group>
                      <template #append>
                        <b-button
                          @click="getSupplier"
                          variant="outline-info"
                          title="Search Supplier"
                          ><i class="mdi mdi-clipboard-text-search-outline"></i
                        ></b-button>
                        <b-button
                          @click="removeSupplier"
                          variant="outline-danger"
                          title="Remove Supplier"
                          ><i class="mdi mdi-close-thick"></i
                        ></b-button>
                      </template>
                      <input
                        autocomplete="off"
                        type="text"
                        placeholder="Search/Enter Supplier..."
                        class="form-control"
                        :class="{
                          'is-invalid': submitted && $v.form.supplier.$error,
                        }"
                        v-model="form.supplier"
                      />
                    </b-input-group>
                    <div
                      v-if="submitted && $v.form.supplier.$error"
                      class="invalid-feedback"
                    >
                      <span v-if="!$v.form.supplier.required"
                        >This value is required.</span
                      >
                    </div>
                  </div>
                  <div class="mb-3">
                    <label for="unit">Unit </label>
                    <input
                      id="unit"
                      type="text"
                      v-model="form.unit"
                      placeholder="Enter Unit..."
                      class="form-control"
                      :class="{
                        'is-invalid': submitted && $v.form.unit.$error,
                      }"
                      autocomplete="off"
                    />
                    <div
                      v-if="submitted && $v.form.unit.$error"
                      class="invalid-feedback"
                    >
                      <span v-if="!$v.form.unit.required"
                        >This value is required.</span
                      >
                    </div>
                  </div>
                  <div class="mb-3">
                    <label for="note">Notes </label>
                    <textarea
                      id="note"
                      rows="2"
                      v-model="form.note"
                      placeholder="Enter Notes..."
                      class="form-control"
                      :class="{
                        'is-invalid': submitted && $v.form.note.$error,
                      }"
                      autocomplete="off"
                    ></textarea>
                    <div
                      v-if="submitted && $v.form.note.$error"
                      class="invalid-feedback"
                    >
                      <span v-if="!$v.form.note.required"
                        >This value is required.</span
                      >
                    </div>
                  </div>
                </div> -->
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="submit" class="btn btn-primary">Submit Items</button>
        </div>
      </form>
    </b-modal>
    <!-- <b-tabs
      content-class="pt-3 pb-3 text-muted"
      v-model="tabIndex"
      nav-class="nav-tabs-custom"
    > -->
    <!-- <b-tab> -->
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
              <h4 class="mb-0">Submitted IAR List</h4>
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
          v-for="x in filteredPending"
          :key="x.id"
        >
          <b-card no-body class="mb-1">
            <b-card-header header-tag="header" role="tab">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h5 class="mb-0">{{ x.iarNumber }}</h5>
                  <div>{{ formatDate(x.iarDate) }}</div>
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
              <b-card-body
                class="
                  border border-3 border-bottom-0 border-start-0 border-end-0
                "
              >
                <div class="row">
                  <div class="col-md-3">
                    <div class="font-size-12 mb-1">
                      Date of Delivery:
                      <b class="font-size-14">{{
                        formatDate(x.dateOfDelivery)
                      }}</b>
                    </div>
                    <div class="font-size-12 mb-1">
                      Date Inspected:
                      <b class="font-size-14">{{
                        formatDate(x.dateInspected)
                      }}</b>
                    </div>
                    <div class="font-size-12 mb-1">
                      Acceptance Date:
                      <b class="font-size-14">{{
                        formatDate(x.acceptanceDate)
                      }}</b>
                    </div>
                    <div class="font-size-12 mb-1">
                      DR Number:
                      <b class="font-size-14">{{ x.drNumber }}</b>
                    </div>
                    <!-- <div class="mt-2">
                      <button
                        type="button"
                        @click="onPost(x)"
                        class="btn btn-sm btn-success d-flex align-items-center"
                      >
                        Set as Property
                      </button>
                    </div> -->
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
                              <th class="py-2" style="width: 140px">
                                Unit Price
                              </th>
                              <th class="py-2" style="width: 140px">
                                Total Price
                              </th>
                              <th class="py-2" style="width: 60px">Actions</th>
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
                                <!-- <button
                                  type="button"
                                  @click="onPost(y)"
                                  class="
                                    btn btn-sm btn-success
                                    d-flex
                                    align-items-center
                                  "
                                >
                                  Set as Property
                                </button> -->
                                <div class="d-flex justify-content-center">
                                  <!-- <a
                                    href="javascript:void(0);"
                                    class="
                                      action-icon
                                      text-success
                                      hover-max-width
                                      d-flex
                                      align-items-center
                                    "
                                    @click="createProperty(y)"
                                    ><i
                                      class="
                                        bx
                                        bxs-check-circle
                                        font-size-22
                                        me-1
                                      "
                                    ></i>
                                    <span class="me-2">Create Property</span>
                                  </a> -->
                                  <i
                                    title="Create Property"
                                    class="
                                      mdi mdi-circle-edit-outline
                                      font-size-18
                                      text-success
                                      cursor-pointer
                                      me-1
                                    "
                                    @click="createProperty(y)"
                                  ></i>
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
          <ul class="pagination pagination-rounded mb-0" style="z-index: -1">
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
    <!-- </b-tab> -->
    <!-- <b-tab>
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
              v-for="x in filteredPosted"
              :key="x.id"
            >
              <b-card no-body class="mb-1">
                <b-card-header header-tag="header" role="tab">
                  <div
                    class="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <h5 class="mb-0">{{ x.iarNumber }}</h5>
                      <div>{{ formatDate(x.iarDate) }}</div>
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
                          Date of Delivery:
                          <b class="font-size-14">{{
                            formatDate(x.dateOfDelivery)
                          }}</b>
                        </div>
                        <div class="font-size-12 mb-1">
                          Date Inspected:
                          <b class="font-size-14">{{
                            formatDate(x.dateInspected)
                          }}</b>
                        </div>
                        <div class="font-size-12 mb-1">
                          Acceptance Date:
                          <b class="font-size-14">{{
                            formatDate(x.acceptanceDate)
                          }}</b>
                        </div>
                        <div class="font-size-12 mb-1">
                          DR Number:
                          <b class="font-size-14">{{ x.drNumber }}</b>
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
              <ul class="pagination pagination-rounded mb-0">
                <b-pagination
                  v-model="currentPagePosted"
                  :total-rows="rowsPosted"
                  :per-page="perPagePosted"
                ></b-pagination>
              </ul>
            </div>
          </div>
        </div>
      </b-tab> -->
    <!-- </b-tabs> -->
    <item-category @dropData="dropItemCat($event)"></item-category>
    <supplier @dropData="dropSupplier($event)"></supplier>
    <unit ref="unit" @dropData="dropUnit($event)"></unit>
  </Layout>
</template>

