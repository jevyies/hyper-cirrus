<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import { required } from "vuelidate/lib/validators";
import Swal from "sweetalert2";
import createNumberMask from "text-mask-addons/dist/createNumberMask";
import MaskedInput from "vue-text-mask";
import DatePicker from "vue2-datepicker";
import ItemCategory from "@/components/modals/item-category.vue";
import Unit from "@/components/modals/unit.vue";
import { cloneDeep } from "lodash";
import { FormWizard, TabContent } from "vue-form-wizard";

export default {
  page: {
    title: "Incoming",
  },
  components: {
    Layout,
    PageHeader,
    DatePicker,
    MaskedInput,
    ItemCategory,
    Unit,
    FormWizard,
    TabContent,
  },
  data() {
    return {
      title: "Incoming",
      submitted: false,
      items: [
        {
          text: "Dashboards",
          href: "/",
        },
        {
          text: "Incoming",
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
      poData: [],
      filterPO: "",
      pageOptions: [10, 25, 50, 100],
      perPagePO: 10,
      currentPagePO: 1,
      perPageItem: 1,
      currentPageItem: 1,
      poLoading: false,
      poIndex: -1,
      cycle: this.$store.state.data.cycle,
      tabIndex: 0,
      form: {
        poNumber: "",
        supplier: "",
        poId: null,
        dateOfDelivery: "",
        dateInspected: "",
        acceptanceDate: "",
        drNumber: "",
        cycle: "",
        iarItems: [],
      },
      cancelForm: {
        poNumber: "",
        supplier: "",
        poId: null,
        cycle: "",
        cancelIarItems: [],
      },
      itemIndex: -1,
      supplierData: [],
    };
  },
  validations: {
    form: {
      dateOfDelivery: { required },
      dateInspected: { required },
      acceptanceDate: { required },
      drNumber: { required },
    },
  },
  computed: {
    filteredPO() {
      let data = this.poData;
      var total = this.currentPagePO * this.perPagePO;
      if (this.filterPO.trim() != "" && this.filterPO) {
        data = data.filter((item) => {
          if (
            item.description.toUpperCase().includes(this.filterPO.toUpperCase())
          )
            return item.description
              .toUpperCase()
              .includes(this.filterPO.toUpperCase());
          else if (
            item.poNumber.toUpperCase().includes(this.filterPO.toUpperCase())
          )
            return item.poNumber
              .toUpperCase()
              .includes(this.filterPO.toUpperCase());
          else if (
            item.rfqSupplier.supplier.name
              .toUpperCase()
              .includes(this.filterPO.toUpperCase())
          )
            return item.rfqSupplier.supplier.name
              .toUpperCase()
              .includes(this.filterPO.toUpperCase());
        });
      }
      var currentData = data.slice(total - this.perPagePO, total);
      if (this.currentPagePO > 1 && currentData.length == 0) {
        total = (this.currentPagePO - 1) * this.perPagePO;
        currentData = data.slice(total - this.perPagePO, total);
      }
      return currentData;
    },
    rowsPO() {
      if (this.filterPO.trim() != "" && this.filterPO) {
        return this.filteredPO.length;
      } else {
        return this.poData.length;
      }
    },
  },
  created() {
    this.poLoading = true;
    this.$store
      .dispatch("inspectionincoming/GetInspectionIncoming")
      .then((res) => {
        this.poLoading = false;
        res.data.forEach((x) => {
          x.visible = false;
          x.rfqSupplier.toggleAll = false;
          x.rfqSupplier.rfqSupplierOffers.forEach((y) => {
            y.toggleSelected = false;
          });
        });
        this.poData = res.data;
      })
      .catch((err) => {
        let stringErr = err.toString();
        if (stringErr.includes("Network")) {
          this.showToast("Network Error!", "error");
        } else {
          this.showToast(
            "Something went wrong getting incoming P.O. !",
            "error"
          );
        }
        this.poLoading = false;
      });
  },
  methods: {
    onCreate() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.$invalid || this.checkCreateForm() === 0) {
        return;
      } else {
        this.form.dateOfDelivery = this.setDate(this.form.dateOfDelivery);
        this.form.dateInspected = this.setDate(this.form.dateInspected);
        this.form.acceptanceDate = this.setDate(this.form.acceptanceDate);
        Swal.fire({
          title: "Select an Action",
          icon: "info",
          showCancelButton: true,
          confirmButtonColor: "#34c38f",
          cancelButtonColor: "#34c38f",
          cancelButtonText: "Create & Post IAR",
          confirmButtonText: "Create IAR",
        }).then((result) => {
          if (result.value) {
            this.form.createAndPost = false;
            this.$store
              .dispatch("inspectioniar/CreateInspectionIar", this.form)
              .then((res) => {
                if (res.data.error) {
                  return this.showToast(res.data.detail, "error");
                }
                var poIndex = this.poData.findIndex(
                  (item) => item.id == this.form.poId
                );
                this.form.iarItems.forEach((x) => {
                  var itemIndex = this.poData[
                    poIndex
                  ].rfqSupplier.rfqSupplierOffers.findIndex(
                    (item) => item.id == x.rfqSupplierOfferId
                  );
                  this.poData[poIndex].rfqSupplier.rfqSupplierOffers.splice(
                    itemIndex,
                    1
                  );
                });
                if (
                  this.poData[poIndex].rfqSupplier.rfqSupplierOffers.length == 0
                ) {
                  this.poData.splice(poIndex, 1);
                }
                this.showToast("Successfully created!", "success");
                this.onReset();
                this.hideModalCreate();
              })
              .catch((err) => {
                this.showToast("Something went wrong creating IAR!", "error");
              });
            this.submitted = false;
          } else {
            this.form.createAndPost = true;
            this.$store
              .dispatch("inspectioniar/CreateInspectionIar", this.form)
              .then((res) => {
                if (res.data.error) {
                  return this.showToast(res.data.detail, "error");
                }
                var poIndex = this.poData.findIndex(
                  (item) => item.id == this.form.poId
                );
                this.form.iarItems.forEach((x) => {
                  var itemIndex = this.poData[
                    poIndex
                  ].rfqSupplier.rfqSupplierOffers.findIndex(
                    (item) => item.id == x.rfqSupplierOfferId
                  );
                  this.poData[poIndex].rfqSupplier.rfqSupplierOffers.splice(
                    itemIndex,
                    1
                  );
                });
                if (
                  this.poData[poIndex].rfqSupplier.rfqSupplierOffers.length == 0
                ) {
                  this.poData.splice(poIndex, 1);
                }
                this.showToast("Successfully created!", "success");
                this.onReset();
                this.hideModalCreate();
              })
              .catch((err) => {
                this.showToast("Something went wrong creating IAR!", "error");
              });
            this.submitted = false;
          }
        });
      }
    },
    onCancel() {
      this.submitted = true;
      // this.$v.$touch();
      if (this.checkCancelForm() === 0) {
        return;
      } else {
        this.$store
          .dispatch("inspectioniar/CancelInspectionIar", this.cancelForm)
          .then((res) => {
            if (res.data.error) {
              return this.showToast(res.data.detail, "error");
            }
            var poIndex = this.poData.findIndex(
              (item) => item.id == this.cancelForm.poId
            );
            this.cancelForm.cancelIarItems.forEach((x) => {
              var itemIndex = this.poData[
                poIndex
              ].rfqSupplier.rfqSupplierOffers.findIndex(
                (item) => item.id == x.rfqSupplierOfferId
              );
              this.poData[poIndex].rfqSupplier.rfqSupplierOffers.splice(
                itemIndex,
                1
              );
            });
            if (
              this.poData[poIndex].rfqSupplier.rfqSupplierOffers.length == 0
            ) {
              this.poData.splice(poIndex, 1);
            }
            this.showToast("Successfully canceled item!", "success");
            this.onReset();
            this.hideModalCancel();
          })
          .catch((err) => {
            this.showToast("Something went wrong canceling IAR!", "error");
          });
        this.submitted = false;
      }
    },
    receivePO(id) {
      var index = this.poData.findIndex((item) => item.id == id);
      Swal.fire({
        title: "Are you sure?",
        text: "You want to receive this?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#34c38f",
        cancelButtonColor: "#f46a6a",
        confirmButtonText: "Yes, receive it!",
      }).then((result) => {
        if (result.value) {
          this.$store
            .dispatch("inspectionincoming/ReceiveInspection", id)
            .then((res) => {
              if (res.data.error) {
                return this.showToast(res.data.errorMessage, "error");
              }
              this.receivedPO.push(this.poData[index]);
              this.poData.splice(index, 1);
              this.showToast("Successfully Received", "success");
            })
            .catch((err) => {
              this.showToast(err.toString(), "error");
            });
        }
      });
    },
    toggleAll(id) {
      var index = this.poData.findIndex((item) => item.id == id);
      if (this.poData[index].rfqSupplier.toggleAll === true) {
        this.poData[index].rfqSupplier.rfqSupplierOffers.forEach((item) => {
          item.toggleSelected = true;
        });
      } else {
        this.poData[index].rfqSupplier.rfqSupplierOffers.forEach((item) => {
          item.toggleSelected = false;
        });
      }
    },
    checkToggle(id) {
      var index = this.poData.findIndex((item) => item.id == id);
      var count = 0;
      this.poData[index].rfqSupplier.rfqSupplierOffers.forEach((item) => {
        item.toggleSelected && count++;
      });
      if (count === this.poData[index].rfqSupplier.rfqSupplierOffers.length) {
        this.poData[index].rfqSupplier.toggleAll = true;
      } else {
        this.poData[index].rfqSupplier.toggleAll = false;
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
    onReset() {
      this.form = {
        poId: null,
        dateOfDelivery: "",
        dateInspected: "",
        acceptanceDate: "",
        drNumber: "",
        cycle: "",
        iarItems: [],
      };
      this.cancelForm = {
        poNumber: "",
        supplier: "",
        poId: null,
        cycle: "",
        cancelIarItems: [],
      };
    },
    createIar(props) {
      this.onReset();
      this.perPageItem = 1;
      this.currentPageItem = 1;
      this.form.poNumber = props.poNumber;
      this.form.supplier = props.rfqSupplier.supplier.name;
      this.form.poId = props.id;
      this.form.cycle = this.cycle;
      props.rfqSupplier.rfqSupplierOffers.forEach((item) => {
        if (item.toggleSelected === true) {
          this.form.iarItems.push({
            iarId: 0,
            rfqSupplierOfferId: item.id,
            itemName: item.itemName,
            description: item.description,
            brand: item.brand,
            model: item.model,
            specification: item.specification,
            color: item.color,
            dimensionDescription: item.dimensionDescription,
            materialUsed: item.materialUsed,
            packageDescription: item.packageDescription,
            condition: item.condition,
            itemCategoryId: item.rfqItem.prItem.apiResource.itemCategoryId,
            itemCategoryName: item.rfqItem.prItem.apiResource.itemCategory.name,
            unitId: item.unitId,
            unitName: item.unit.unitName,
            notes: "",
            quantity: item.quantity.toString(),
            unitCost: item.unitCost.toString(),
            total: (item.quantity * item.unitCost).toString(),
          });
        }
      });
      this.form.createAndPost = false;
      this.poIndex = this.poData.indexOf(props);
      this.modalTitle = "Create IAR";
      this.$bvModal.show("modal-create");
    },
    cancelIar(props) {
      this.onReset();
      this.perPageItem = 1;
      this.currentPageItem = 1;
      this.cancelForm.poNumber = props.poNumber;
      this.cancelForm.supplier = props.rfqSupplier.supplier.name;
      this.cancelForm.poId = props.id;
      this.cancelForm.cycle = this.cycle;
      props.rfqSupplier.rfqSupplierOffers.forEach((item) => {
        if (item.toggleSelected === true) {
          this.cancelForm.cancelIarItems.push({
            rfqSupplierOfferId: item.id,
            itemName: item.itemName,
            description: item.description,
            itemCategoryId: item.rfqItem.prItem.apiResource.itemCategoryId,
            unitId: item.unitId,
            unitCost: item.unitCost.toString(),
            quantity: item.quantity.toString(),
          });
        }
      });
      this.poIndex = this.poData.indexOf(props);
      this.modalTitle = "Cancel IAR";
      this.$bvModal.show("modal-cancel");
    },
    showSupplier(props) {
      this.supplierData = cloneDeep(props);
      this.modalTitle = "Supplier Details";
      this.$bvModal.show("modal-supplier");
    },
    hideModalCreate() {
      this.$bvModal.hide("modal-create");
    },
    hideModalCancel() {
      this.$bvModal.hide("modal-cancel");
    },
    setDate(date) {
      const nDate = new Date(
        new Date(date).getTime() -
          new Date(date).getTimezoneOffset() * 60 * 1000
      );
      return nDate.toISOString();
    },
    checkCreateForm() {
      this.form.iarItems.forEach((item) => {
        if (
          item.quantity == "" ||
          item.quantity == null ||
          item.itemName == "" ||
          item.itemName == null ||
          item.description == "" ||
          item.description == null ||
          item.brand == "" ||
          item.brand == null ||
          item.model == "" ||
          item.model == null ||
          item.specification == "" ||
          item.specification == null ||
          item.color == "" ||
          item.color == null ||
          item.dimensionDescription == "" ||
          item.dimensionDescription == null ||
          item.materialUsed == "" ||
          item.materialUsed == null ||
          item.packageDescription == "" ||
          item.packageDescription == null ||
          item.condition == "" ||
          item.condition == null ||
          item.itemCategoryId == "" ||
          item.itemCategoryId == null ||
          item.unitId == "" ||
          item.unitId == null ||
          item.notes == "" ||
          item.notes == null ||
          item.quantity == "" ||
          item.quantity == null ||
          item.unitCost == "" ||
          item.unitCost == null
        )
          return 0;
      });
      return 1;
    },
    checkCancelForm() {
      this.cancelForm.cancelIarItems.forEach((item) => {
        if (item.quantity === "" || item.quantity === null) return 0;
      });
      return 1;
    },
    getItemCategory(props) {
      this.itemIndex = this.form.iarItems.indexOf(props);
      this.$bvModal.show("item-category-modal");
    },
    dropItemCat(data) {
      this.form.iarItems[this.itemIndex].itemCategoryId = data.id;
      this.form.iarItems[this.itemIndex].itemCategoryName = data.name;
    },
    getUnit(props) {
      this.itemIndex = this.form.iarItems.indexOf(props);
      this.$refs.unit.getData();
      this.$bvModal.show("unit-modal");
    },
    dropUnit(data) {
      this.form.iarItems[this.itemIndex].unitId = data.id;
      this.form.iarItems[this.itemIndex].unitName = data.unitName;
    },
    calculateTotal(unitCost, quantity) {
      var total = parseInt(unitCost) * parseInt(quantity);
      return total ? total.toString() : null;
    },
    checkSupplierInfo(props) {
      if (props) return props;
      else return "n/a";
    },
  },
};
</script>
<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <b-modal
      id="modal-supplier"
      :title="modalTitle"
      size="md"
      title-class="font-18"
      hide-footer
    >
      <b-row class="mb-2">
        <b-col sm="3"> <b>Name</b></b-col>
        <b-col>{{ checkSupplierInfo(supplierData.name) }}</b-col>
      </b-row>
      <b-row class="mb-2">
        <b-col sm="3"> <b>Address</b></b-col>
        <b-col>{{ checkSupplierInfo(supplierData.address) }}</b-col>
      </b-row>
      <b-row class="mb-2">
        <b-col sm="3"> <b>Contact No.</b></b-col>
        <b-col>{{ checkSupplierInfo(supplierData.contactNumber) }}</b-col>
      </b-row>
      <b-row class="mb-2">
        <b-col sm="3"> <b>Email</b></b-col>
        <b-col>{{ checkSupplierInfo(supplierData.email) }}</b-col>
      </b-row>
      <b-row class="mb-2">
        <b-col sm="3"> <b>Owner</b></b-col>
        <b-col>{{ checkSupplierInfo(supplierData.owner) }}</b-col>
      </b-row>
      <b-row class="mb-2">
        <b-col sm="3"> <b>Bank</b></b-col>
        <b-col>{{ checkSupplierInfo(supplierData.bank) }}</b-col>
      </b-row>
      <b-row class="mb-2">
        <b-col sm="3"> <b>TIN</b></b-col>
        <b-col>{{ checkSupplierInfo(supplierData.tin) }}</b-col>
      </b-row>
      <br />
      <div class="mb-2"><b class="font-size-15">Permit & License No.</b></div>
      <b-row class="mb-2">
        <b-col sm="3"> <b>DTI</b></b-col>
        <b-col>{{ checkSupplierInfo(supplierData.dtiPermitNumber) }}</b-col>
      </b-row>
      <b-row class="mb-2">
        <b-col sm="3"> <b>Mayor's</b></b-col>
        <b-col>{{ checkSupplierInfo(supplierData.mayorsPermitNumber) }}</b-col>
      </b-row>
      <b-row class="mb-2">
        <b-col sm="3"> <b>PCAB</b></b-col>
        <b-col>{{ checkSupplierInfo(supplierData.pcabLicenseNumber) }}</b-col>
      </b-row>
      <b-row class="mb-2">
        <b-col sm="3"> <b>PhilGEPS</b></b-col>
        <b-col>{{ checkSupplierInfo(supplierData.philgeps) }}</b-col>
      </b-row>
      <b-row class="mb-2">
        <b-col sm="3"> <b>SEC</b></b-col>
        <b-col>{{ checkSupplierInfo(supplierData.secLicenseNumber) }}</b-col>
      </b-row>
      <div class="mb-2" v-if="supplierData.note">
        <br />
        <b class="font-size-15">Note</b>
        <div b-col>{>{{ checkSupplierInfo(supplierData.note) }}</div>
      </div>
    </b-modal>
    <b-modal
      id="modal-create"
      :title="modalTitle"
      size="lg"
      title-class="font-18"
      hide-footer
    >
      <!-- <form @submit.prevent="onCreate" class="needs-validation" ref="fcForm"> -->
      <div class="mb-3">
        <div class="d-flex justify-content-between">
          <div class="mb-3">
            <h5 class="mb-0">{{ form.poNumber }}</h5>
            <div>
              {{ form.supplier }}
            </div>
          </div>
          <!-- <div class="dataTables_paginate paging_simple_numbers pb-3">
              <ul class="pagination pagination-rounded mb-0">
                <b-pagination
                  v-model="currentPageItem"
                  :total-rows="form.iarItems.length"
                  :per-page="1"
                ></b-pagination>
              </ul>
            </div> -->
        </div>

        <form-wizard
          @on-complete="onCreate"
          stepSize="xs"
          shape="tab"
          color="#556ee5"
          :title="form.poNumber"
          :subtitle="form.supplier"
          finish-button-text="Submit"
        >
          <tab-content v-for="x in form.iarItems" :key="x.id">
            <b-card-body class="border">
              <div class="mb-3">
                <label for="itemName">Name </label>
                <input
                  id="itemName"
                  type="text"
                  v-model="x.itemName"
                  placeholder="Enter Name..."
                  class="form-control"
                  :class="{
                    'is-invalid':
                      submitted && (x.itemName === '' || x.itemName === null),
                  }"
                  autocomplete="off"
                />
                <div
                  v-if="submitted && (x.itemName === '' || x.itemName === null)"
                  class="invalid-feedback"
                >
                  <span>This value is required.</span>
                </div>
              </div>
              <div class="mb-3">
                <label for="description">Description</label>
                <textarea
                  id="description"
                  rows="2"
                  v-model="x.description"
                  placeholder="Enter Description..."
                  class="form-control"
                  :class="{
                    'is-invalid':
                      submitted &&
                      (x.description === '' || x.description === null),
                  }"
                  autocomplete="off"
                ></textarea>
                <div
                  v-if="
                    submitted &&
                    (x.description === '' || x.description === null)
                  "
                  class="invalid-feedback"
                >
                  <span>This value is required.</span>
                </div>
              </div>
              <div class="row mb-3">
                <div class="col-md-8">
                  <label for="brand">Brand </label>
                  <input
                    id="brand"
                    type="text"
                    v-model="x.brand"
                    placeholder="Enter Brand..."
                    class="form-control"
                    :class="{
                      'is-invalid':
                        submitted && (x.brand === '' || x.brand === null),
                    }"
                    autocomplete="off"
                  />
                  <div
                    v-if="submitted && (x.brand === '' || x.brand === null)"
                    class="invalid-feedback"
                  >
                    <span>This value is required.</span>
                  </div>
                </div>
                <div class="col-md-4">
                  <label for="model">Model </label>
                  <input
                    id="model"
                    type="text"
                    v-model="x.model"
                    placeholder="Enter Model..."
                    class="form-control"
                    :class="{
                      'is-invalid':
                        submitted && (x.model === '' || x.model === null),
                    }"
                    autocomplete="off"
                  />
                  <div
                    v-if="submitted && (x.model === '' || x.model === null)"
                    class="invalid-feedback"
                  >
                    <span>This value is required.</span>
                  </div>
                </div>
              </div>
              <div class="mb-3">
                <label for="specification">Specification </label>
                <textarea
                  id="specification"
                  rows="2"
                  v-model="x.specification"
                  placeholder="Enter Specification..."
                  class="form-control"
                  :class="{
                    'is-invalid':
                      submitted &&
                      (x.specification === '' || x.specification === null),
                  }"
                  autocomplete="off"
                ></textarea>
                <div
                  v-if="
                    submitted &&
                    (x.specification === '' || x.specification === null)
                  "
                  class="invalid-feedback"
                >
                  <span>This value is required.</span>
                </div>
              </div>
              <div class="row mb-3">
                <div class="col-md-4">
                  <label for="color">Color</label>
                  <input
                    id="color"
                    type="text"
                    v-model="x.color"
                    placeholder="Enter Color..."
                    class="form-control"
                    :class="{
                      'is-invalid':
                        submitted && (x.color === '' || x.color === null),
                    }"
                    autocomplete="off"
                  />
                  <div
                    v-if="submitted && (x.color === '' || x.color === null)"
                    class="invalid-feedback"
                  >
                    <span>This value is required.</span>
                  </div>
                </div>
                <div class="col-md-8">
                  <label for="dimensionDescription"
                    >Dimension Description
                  </label>
                  <input
                    id="dimensionDescription"
                    type="text"
                    v-model="x.dimensionDescription"
                    placeholder="Enter Dimension Description..."
                    class="form-control"
                    :class="{
                      'is-invalid':
                        submitted &&
                        (x.dimensionDescription === '' ||
                          x.dimensionDescription === null),
                    }"
                    autocomplete="off"
                  />
                  <div
                    v-if="
                      submitted &&
                      (x.dimensionDescription === '' ||
                        x.dimensionDescription === null)
                    "
                    class="invalid-feedback"
                  >
                    <span>This value is required.</span>
                  </div>
                </div>
              </div>
              <div class="mb-3">
                <label for="materialUsed">Material Used </label>
                <textarea
                  id="materialUsed"
                  rows="2"
                  v-model="x.materialUsed"
                  placeholder="Enter Material Used..."
                  class="form-control"
                  :class="{
                    'is-invalid':
                      submitted &&
                      (x.materialUsed === '' || x.materialUsed === null),
                  }"
                  autocomplete="off"
                ></textarea>
                <div
                  v-if="
                    submitted &&
                    (x.materialUsed === '' || x.materialUsed === null)
                  "
                  class="invalid-feedback"
                >
                  <span>This value is required.</span>
                </div>
              </div>
              <div class="mb-3">
                <label for="packageDescription">Package Description </label>
                <textarea
                  id="packageDescription"
                  rows="4"
                  v-model="x.packageDescription"
                  placeholder="Enter Package Description..."
                  class="form-control"
                  :class="{
                    'is-invalid':
                      submitted &&
                      (x.packageDescription === '' ||
                        x.packageDescription === null),
                  }"
                  autocomplete="off"
                ></textarea>
                <div
                  v-if="
                    submitted &&
                    (x.packageDescription === '' ||
                      x.packageDescription === null)
                  "
                  class="invalid-feedback"
                >
                  <span>This value is required.</span>
                </div>
              </div>
              <div class="row mb-3">
                <div class="col-md-4">
                  <label for="quantity">Quantity</label>
                  <masked-input
                    id="quantity"
                    type="text"
                    @input="x.total = calculateTotal(x.unitCost, x.quantity)"
                    v-model="x.quantity"
                    placeholder="Enter Quantity..."
                    class="form-control"
                    :class="{
                      'is-invalid':
                        submitted && (x.quantity === '' || x.quantity === null),
                    }"
                    autocomplete="off"
                    :mask="currencyMask"
                  ></masked-input>
                  <div
                    v-if="
                      submitted && (x.quantity === '' || x.quantity === null)
                    "
                    class="invalid-feedback"
                  >
                    <span>This value is required.</span>
                  </div>
                </div>
                <div class="col-md-4">
                  <label for="unitCost">Unit Cost</label>
                  <masked-input
                    id="unitCost"
                    type="text"
                    @input="x.total = calculateTotal(x.unitCost, x.quantity)"
                    v-model="x.unitCost"
                    placeholder="Enter Unit Cost..."
                    class="form-control"
                    :class="{
                      'is-invalid':
                        submitted && (x.unitCost === '' || x.unitCost === null),
                    }"
                    autocomplete="off"
                    :mask="currencyMask"
                  ></masked-input>
                  <div
                    v-if="
                      submitted && (x.unitCost === '' || x.unitCost === null)
                    "
                    class="invalid-feedback"
                  >
                    <span>This value is required.</span>
                  </div>
                </div>
                <div class="col-md-4">
                  <label for="total">Total Cost</label>
                  <masked-input
                    id="total"
                    type="text"
                    v-model="x.total"
                    disabled
                    class="form-control"
                    autocomplete="off"
                    :mask="currencyMask"
                  ></masked-input>
                </div>
              </div>
              <div class="mb-3">
                <label for="condition">Condition </label>
                <b-form-select
                  class="form-select"
                  :class="{
                    'is-invalid':
                      submitted && (x.condition === '' || x.condition === null),
                  }"
                  v-model="x.condition"
                >
                  <b-form-select-option :value="null || ''" disabled
                    >Select Condition...</b-form-select-option
                  >
                  <b-form-select-option value="New">New</b-form-select-option>
                  <b-form-select-option value="Used">Used</b-form-select-option>
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
                  v-if="
                    submitted && (x.condition === '' || x.condition === null)
                  "
                  class="invalid-feedback"
                >
                  <span>This value is required.</span>
                </div>
              </div>
              <div class="mb-3">
                <label for="unitId" class="mb-0">Unit </label>
                <b-input-group>
                  <template #append>
                    <b-button @click="getUnit(x)" variant="outline-info"
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
                      'is-invalid':
                        submitted && (x.unitName === '' || x.unitName === null),
                    }"
                    v-model="x.unitName"
                  />
                </b-input-group>
                <div
                  v-if="submitted && (x.unitName === '' || x.unitName === null)"
                  class="invalid-feedback"
                >
                  <span>This value is required.</span>
                </div>
              </div>
              <div class="mb-3">
                <label for="itemCategoryId" class="mb-0">Item Category </label>
                <b-input-group>
                  <template #append>
                    <b-button @click="getItemCategory(x)" variant="outline-info"
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
                        submitted &&
                        (x.itemCategoryName === '' ||
                          x.itemCategoryName === null),
                    }"
                    v-model="x.itemCategoryName"
                  />
                </b-input-group>
                <div
                  v-if="
                    submitted &&
                    (x.itemCategoryName === '' || x.itemCategoryName === null)
                  "
                  class="invalid-feedback"
                >
                  <span>This value is required.</span>
                </div>
              </div>
              <div class="mb-3">
                <label for="notes">Notes</label>
                <textarea
                  id="notes"
                  rows="2"
                  v-model="x.notes"
                  placeholder="Enter Notes..."
                  class="form-control"
                  :class="{
                    'is-invalid':
                      submitted && (x.notes === '' || x.notes === null),
                  }"
                  autocomplete="off"
                ></textarea>
                <div
                  v-if="submitted && (x.notes === '' || x.notes === null)"
                  class="invalid-feedback"
                >
                  <span>This value is required.</span>
                </div>
              </div>
            </b-card-body>
          </tab-content>
          <tab-content>
            <b-card-body class="border">
              <div class="row mb-3">
                <div class="col-md-6">
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
                <div class="col-md-6">
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
              </div>
              <div class="row mb-3">
                <div class="col-md-6">
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
                <div class="col-md-6">
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
              </div>
              <div class="row p-3 mb-3">
                <table width="100%">
                  <thead>
                    <tr class="border-bottom">
                      <th style="width: 90px" class="py-2">Qty</th>
                      <th class="py-2">Item Name</th>
                      <th class="py-2" style="width: 150px">Unit Price</th>
                      <th class="py-2" style="width: 150px">Total Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="y in form.iarItems"
                      :key="y.id"
                      class="border-bottom"
                    >
                      <td class="py-2" v-if="y.id !== null">
                        {{ y.quantity }}
                      </td>
                      <td class="py-2" v-if="y.id !== null">
                        <div>
                          {{ y.itemName }}
                        </div>
                        <small>{{ y.description }}</small>
                      </td>
                      <td class="py-2" v-if="y.id !== null">
                        {{
                          Intl.NumberFormat("ja-JP", {
                            currency: "PHP",
                            style: "currency",
                          }).format(y.unitCost)
                        }}
                      </td>
                      <td class="py-2" v-if="y.id !== null">
                        {{
                          Intl.NumberFormat("ja-JP", {
                            currency: "PHP",
                            style: "currency",
                          }).format(y.unitCost * y.quantity)
                        }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </b-card-body>
          </tab-content>
        </form-wizard>
      </div>
    </b-modal>
    <b-modal
      id="modal-cancel"
      :title="modalTitle"
      size="lg"
      title-class="font-18"
      hide-footer
    >
      <form @submit.prevent="onCancel" class="needs-validation" ref="fcForm">
        <div class="mb-3">
          <h5 class="mb-0">{{ cancelForm.poNumber }}</h5>
          <div>
            {{ cancelForm.supplier }}
          </div>
        </div>
        <div class="row p-3 mb-3">
          <table width="100%">
            <thead>
              <tr class="border-bottom">
                <th style="width: 90px" class="py-2">Qty</th>
                <th class="py-2">Item Name</th>
                <th class="py-2" style="width: 150px">Unit Price</th>
                <th class="py-2" style="width: 150px">Total Price</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="x in cancelForm.cancelIarItems"
                :key="x.id"
                class="border-bottom"
              >
                <td class="py-2">
                  <masked-input
                    style="width: 70%"
                    id="quantity"
                    type="text"
                    v-model="x.quantity"
                    placeholder="..."
                    class="form-control"
                    :class="{
                      'is-invalid':
                        submitted && (x.quantity === '' || x.quantity === null),
                    }"
                    autocomplete="off"
                    :mask="currencyMask"
                  ></masked-input>
                  <div
                    v-if="
                      submitted && (x.quantity === '' || x.quantity === null)
                    "
                    class="invalid-feedback"
                  >
                    <span>This value is required.</span>
                  </div>
                </td>
                <td class="py-2">
                  <div>
                    {{ x.itemName }}
                  </div>
                  <small>{{ x.description }}</small>
                </td>
                <td class="py-2">
                  {{
                    Intl.NumberFormat("ja-JP", {
                      currency: "PHP",
                      style: "currency",
                    }).format(x.unitCost)
                  }}
                </td>
                <td class="py-2">
                  {{
                    Intl.NumberFormat("ja-JP", {
                      currency: "PHP",
                      style: "currency",
                    }).format(x.unitCost * x.quantity)
                  }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="modal-footer">
          <button type="submit" class="btn btn-primary">Confirm</button>
        </div>
      </form>
    </b-modal>
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
              <h4 class="mb-0">P.O. List</h4>
            </div>
          </div>
          <div class="col-md-6">
            <div class="d-flex float-end">
              <div id="tickets-table_filter" class="dataTables_filter me-1">
                <label class="d-inline-flex align-items-center">
                  <b-form-input
                    autocomplete="off"
                    v-model="filterPO"
                    type="search"
                    placeholder="Search P.O..."
                    class="form-control"
                  ></b-form-input>
                </label>
              </div>
              <div id="tickets-table_length" class="dataTables_length">
                <label class="d-inline-flex align-items-center mb-0">
                  <b-form-select
                    class="form-select"
                    v-model="perPagePO"
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
          v-if="poLoading"
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
          v-else-if="poData.length == 0"
        >
          <h5 class="text-muted">
            <i class="fas fa-exclamation-triangle me-2"></i>No Data Found
          </h5>
        </div>
        <div
          class="pt-1 pb-1 text-muted"
          role="tablist"
          v-for="x in filteredPO"
          :key="x.id"
        >
          <b-card no-body class="mb-1">
            <b-card-header header-tag="header" role="tab">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h5 class="mb-0">{{ x.poNumber }}</h5>
                  <div>{{ x.description }}</div>
                  <div>
                    {{ x.rfqSupplier.supplier.name }}
                    [<a
                      href="javascript:void(0);"
                      @click="showSupplier(x.rfqSupplier.supplier)"
                    >
                      View Supplier </a
                    >]
                  </div>
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
                <div class="ms-2">
                  <div class="mb-2">
                    <div class="d-flex justify-content-between">
                      <b class="font-size-16">Items:</b>
                      <div class="d-flex align-items-center">
                        <button
                          v-if="
                            selectedRowCheck(x.rfqSupplier.rfqSupplierOffers)
                          "
                          type="button"
                          @click="cancelIar(x, true)"
                          class="btn btn-sm btn-danger mb-2 me-2 d-flex align-items-center"
                        >
                          <i class="bx bx-x-circle fs-6"></i> Cancel IAR
                        </button>
                        <button
                          v-if="
                            selectedRowCheck(x.rfqSupplier.rfqSupplierOffers)
                          "
                          type="button"
                          @click="createIar(x)"
                          class="btn btn-sm btn-success mb-2 me-2 d-flex align-items-center"
                        >
                          <i class="bx bx-plus-circle fs-6"></i> Create IAR
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
                    v-if="x.rfqSupplier.rfqSupplierOffers.length == 0"
                  >
                    <h5 class="text-muted">
                      <i class="fas fa-exclamation-triangle me-2"></i>No Data
                      Found
                    </h5>
                  </div>
                  <div v-else>
                    <table width="100%">
                      <thead>
                        <tr class="border-bottom">
                          <th style="width: 90px" class="py-2">Qty</th>
                          <th class="py-2">Item Name</th>
                          <th class="py-2">Requisitioning Office/Dept.:</th>
                          <th class="py-2" style="width: 150px">Unit Price</th>
                          <th class="py-2" style="width: 150px">Total Price</th>
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
                                v-model="x.rfqSupplier.toggleAll"
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
                          v-for="y in x.rfqSupplier.rfqSupplierOffers"
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
                            {{ y.rfqItem.prItem.pr.deliveryUnit.name }}
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
              v-model="currentPagePO"
              :total-rows="rowsPO"
              :per-page="perPagePO"
            ></b-pagination>
          </ul>
        </div>
      </div>
    </div>
    <item-category @dropData="dropItemCat($event)"></item-category>
    <unit ref="unit" @dropData="dropUnit($event)"></unit>
  </Layout>
</template>

