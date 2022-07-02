<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import { cloneDeep, groupBy } from "lodash";
import { required } from "vuelidate/lib/validators";
import { Carousel, Slide } from "vue-carousel";
import DatePicker from "vue2-datepicker";
import createNumberMask from "text-mask-addons/dist/createNumberMask";
import MaskedInput from "vue-text-mask";
import ItemCategory from "@/components/modals/item-category.vue";
import Supplier from "@/components/modals/supplier.vue";
import UploadPopover from "@/components/widgets/upload-popover.vue";

export default {
  page: {
    title: "For Review",
  },
  components: {
    Layout,
    PageHeader,
    Carousel,
    Slide,
    DatePicker,
    MaskedInput,
    ItemCategory,
    Supplier,
    UploadPopover,
  },
  data() {
    return {
      title: "For Review",
      submitted: false,
      items: [
        {
          text: "Dashboards",
          href: "/",
        },
        {
          text: "For Review",
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
      tableData: [],
      modalTitle: "",
      totalRows: 1,
      currentPage: 1,
      perPage: 10,
      pageOptions: [10, 25, 50, 100],
      filter: null,
      filterOn: [],
      sortBy: "poNumber",
      sortDesc: false,
      fields: [
        // {
        //   key: "displayDetails",
        //   sortable: false,
        //   label: " ",
        //   thStyle: { width: "30px" },
        // },
        {
          key: "poNumber",
          sortable: true,
          label: "PO Number",
        },
        {
          key: "supplier",
          sortable: true,
          label: "Supplier",
        },
        {
          key: "actions",
          thStyle: { width: "150px" },
        },
      ],
      propertyFields: [
        {
          key: "Name",
          sortable: true,
        },
      ],
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
      indexSelected: -1,
      tableBusy: false,
      editMode: false,
      itemCategory: "",
      uploadOptions: {
        type: "Property",
        placement: "lefttop",
        folder: "Property",
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
      propertyNumber: { required },
      serialNumber: { required },
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
    rows() {
      return this.tableData.length;
    },
    grouped() {
      var grouped = groupBy(this.tableData, "poNumber");
      var array = [];
      for (const key in grouped) {
        array.push({
          poNumber: key,
          details: grouped[key],
          showDetails: false,
          rotateChevy: false,
        });
      }
      return array;
    },
  },
  created() {
    this.totalRows = this.items.length;
    this.tableBusy = true;
    this.$store
      .dispatch("property/GetPropertyPending")
      .then((res) => {
        this.tableBusy = false;
        res.data.forEach((item) => {
          item.currentPage = 1;
          item.filter = null;
          item.filterOn = [];
          item.tableBusy = false;
          item.visible = false;
          item.itemVisible = false;
          item.attachmentVisible = false;
          item.addDocu = false;
          item.attachmentLoading = false;
          item.fileSearch = "";
        });
        this.tableData = res.data;
      })
      .catch(() => {
        this.tableBusy = false;
        this.showToast("Something went wrong getting property list!", "error");
      });
  },
  methods: {
    onFiltered(filteredItems) {
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    propertyRows(props) {
      return props.length;
    },
    onCreate() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      } else {
        this.$store
          .dispatch("property/UpdateProperty", this.form)
          .then((res) => {
            if (res.data.error) {
              return this.showToast(res.data.detail, "error");
            }
            res.data.currentPage = 1;
            res.data.filter = null;
            res.data.filterOn = [];
            res.data.tableBusy = false;
            res.data.visible = false;
            res.data.itemVisible = false;
            res.data.attachmentVisible = false;
            res.data.addDocu = false;
            res.data.attachmentLoading = false;
            res.data.fileSearch = "";
            this.tableData.splice(this.indexSelected, 1, res.data);
            this.showToast("Successfully updated!", "success");
            this.onReset();
          })
          .catch((err) => {
            this.showToast("Something went wrong updating this!", "error");
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
      (this.itemCategory = ""), (this.editMode = false);
    },
    updateItem(props) {
      this.form = cloneDeep(props);
      this.form.dateAcquired = new Date(this.form.dateAcquired);
      this.form.lifespanInYears = props.lifespanInYears.toString();
      this.form.yearlyDepreciation = props.yearlyDepreciation.toString();
      this.form.amount = props.amount.toString();
      this.form.salvageValue = props.salvageValue.toString();
      this.itemCategory = props.itemCategory.name;
      this.indexSelected = this.tableData.indexOf(props);
      this.editMode = true;
      this.$refs.carousel.goToPage(this.$refs.carousel.getNextPage());
    },
    postItem(props) {
      var index = this.tableData.indexOf(props);
      this.$swal({
        title: "Are you sure?",
        text: "You are about to post this property.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#34c38f",
        cancelButtonColor: "#5c636a",
        confirmButtonText: "Yes, post it!",
      }).then((result) => {
        if (result.isConfirmed) {
          this.$store
            .dispatch("property/PostProperty", props.id)
            .then((res) => {
              this.tableData.splice(index, 1);
              this.showToast("Successfully Posted", "success");
            })
            .catch((err) => {
              this.showToast("Cannot be Posted!", "error");
            });
        }
      });
    },
    returnToTable() {
      this.$refs.carousel.goToPage(this.$refs.carousel.getPreviousPage());
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
    showDtls(row) {
      row.item.rotateChevy = !row.item.rotateChevy;
      if (row.item.showDetails) {
        row.item.showDetails = !row.item.showDetails;
        setTimeout(() => {
          row.toggleDetails();
        }, 600);
      } else {
        row.toggleDetails();
        setTimeout(() => {
          row.item.showDetails = !row.item.showDetails;
        }, 50);
      }
    },
    setDate(date) {
      const nDate = new Date(
        new Date(date).getTime() -
          new Date(date).getTimezoneOffset() * 60 * 1000
      );
      return nDate.toISOString();
    },
    setAmount(amount) {
      return Intl.NumberFormat("ja-JP", {
        currency: "PHP",
        style: "currency",
      }).format(amount);
    },
    uploadDocument(response, id) {
      var index = this.tableData.findIndex((x) => x.id == id);
      this.tableData[index].propertyFiles.push(response);
    },
    openDocument(x) {
      window.open(
        `${this.$store.state.data.rootFileDirectory}${x.folder}/${x.fileName}`
      );
    },
    searchDocu(row) {
      let data = row.propertyFiles;
      if (row.fileSearch.trim() != "" && row.fileSearch) {
        data = data.filter((item) => {
          return item.description
            .toUpperCase()
            .includes(row.fileSearch.toUpperCase());
        });
      }
      return data;
    },
    getAttachments(row) {
      row.attachmentVisible = !row.attachmentVisible;
      if (row.attachmentVisible) {
        row.propertyFiles = [];
        row.fileSearch = "";
        row.attachmentLoading = true;
        this.$store
          .dispatch("filemanager/GetFiles", {
            id: row.id,
            type: this.uploadOptions.type,
          })
          .then((res) => {
            row.attachmentLoading = false;
            row.propertyFiles = res.data;
          })
          .catch(() => {
            row.attachmentLoading = false;
            this.showToast(
              "Something went wrong! - getting documents",
              "error"
            );
          });
      }
    },
    removeFile(id, parentId, type) {
      this.$swal({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#5c636a",
        confirmButtonText: "Yes, remove it!",
      }).then((result) => {
        if (result.value) {
          this.$store
            .dispatch("filemanager/DeleteFile", id)
            .then((res) => {
              if (res.data.error) {
                return this.showToast(res.data.errorMessage, "error");
              }
              let index = this.tableData.findIndex(
                (item) => item.id == parentId
              );
              let yIndex = this.tableData[index].propertyFiles.findIndex(
                (item) => item.id == id
              );
              this.tableData[index].propertyFiles.splice(yIndex, 1);
              this.showToast("Successfully removed!", "success");
            })
            .catch(() => {
              this.showToast("Cannot be deleted!", "error");
            });
        }
      });
    },
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <div class="row">
      <div class="col-12">
        <carousel
          ref="carousel"
          class="events navs-carousel"
          id="timeline-carousel"
          :navigation-enabled="false"
          :pagination-enabled="false"
          :perPage="1"
          :autoplay="false"
          :minSwipeDistance="0"
          :mouseDrag="false"
        >
          <slide>
            <div class="card border">
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6">
                    <div class="d-flex align-items-center h-100">
                      <h5 class="mb-0">List of Properties Available for Review</h5>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="d-flex float-end">
                      <div
                        id="tickets-table_filter"
                        class="dataTables_filter me-1"
                      >
                        <label class="d-inline-flex align-items-center">
                          <b-form-input
                            autocomplete="off"
                            v-model="filter"
                            type="search"
                            placeholder="Search Property..."
                            class="form-control"
                          ></b-form-input>
                        </label>
                      </div>
                      <div id="tickets-table_length" class="dataTables_length">
                        <label class="d-inline-flex align-items-center mb-0">
                          <b-form-select
                            class="form-select"
                            v-model="perPage"
                            size="sm"
                            :options="pageOptions"
                          >
                          </b-form-select>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="table-responsive mb-0 mt-2">
                  <b-table
                    class="datatables target-table"
                    :items="grouped"
                    :fields="fields"
                    responsive="sm"
                    :per-page="perPage"
                    :current-page="currentPage"
                    :sort-by.sync="sortBy"
                    :sort-desc.sync="sortDesc"
                    :filter="filter"
                    :filter-included-fields="filterOn"
                    :busy="tableBusy"
                    @filtered="onFiltered"
                    bordered
                    outlined
                    striped
                    show-empty
                  >
                    <template #empty="scope">
                      <div class="text-center">
                        {{ scope.emptyText }}
                      </div>
                    </template>
                    <template #table-busy>
                      <div
                        class="d-flex justify-content-center align-items-center"
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
                    </template>
                    <template #cell(poNumber)="row">
                      <b class="text-muted">{{ row.value }}</b>
                    </template>
                    <template #cell(supplier)="row">
                      {{ row.item.details[0].supplier }}
                    </template>
                    <template #cell(actions)="row">
                      <!-- <div class="float-end">
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
                          <b-dropdown-item @click="showDtls(row)"
                            ><i
                              class="bx bxs-book-content font-size-18 me-1"
                            ></i
                            >{{
                              row.detailsShowing ? "Hide" : "Show"
                            }}
                            Details</b-dropdown-item
                          >
                        </b-dropdown>
                      </div> -->

                      <div
                        class="
                          d-flex
                          align-items-center
                          justify-content-end
                          cursor-pointer
                        "
                        @click="showDtls(row)"
                      >
                        <small v-if="!row.item.showDetails"
                          >Click here to expand</small
                        >
                        <i
                          class="bx bx-chevron-right rotate font-size-16"
                          :class="{
                            'rotate-90': row.item.rotateChevy,
                          }"
                        ></i>
                      </div>
                    </template>
                    <template #cell(displayDetails)="row">
                      <div
                        class="d-flex align-items-center justify-content-center"
                        @click="showDtls(row)"
                      >
                        <i
                          class="
                            bx bx-chevron-right
                            rotate
                            font-size-16
                            cursor-pointer
                          "
                          :class="{
                            'rotate-90': row.item.rotateChevy,
                          }"
                        ></i>
                      </div>
                    </template>
                    <template #row-details="row">
                      <transition name="max-height">
                        <b-card
                          no-body
                          class="
                            p-3
                            shadow-none
                            mb-0
                            border-5 border-top-0 border-start-0 border-end-0
                          "
                          v-if="row.item.showDetails"
                        >
                          <div
                            id="tickets-table_filter"
                            class="dataTables_filter text-md-end"
                          >
                            <label class="d-inline-flex align-items-center">
                              Search:
                              <b-form-input
                                autocomplete="off"
                                v-model="row.item.filter"
                                type="search"
                                placeholder="Search..."
                                class="form-control form-control-sm ms-2"
                              ></b-form-input>
                            </label>
                          </div>
                          <div class="table-responsive mb-0">
                            <b-table
                              class="datatables target-table"
                              thead-class="d-none"
                              :items="row.item.details"
                              :fields="propertyFields"
                              responsive="sm"
                              :per-page="5"
                              :current-page="row.item.currentPage"
                              sort-by="name"
                              :sort-desc="false"
                              :filter="row.item.filter"
                              :filter-included-fields="row.item.filterOn"
                              :busy="row.item.tableBusy"
                              @filtered="row.item.currentPage = 1"
                              show-empty
                            >
                              <template #empty="scope">
                                <div class="text-center">
                                  {{ scope.emptyText }}
                                </div>
                              </template>
                              <template #table-busy>
                                <div
                                  class="
                                    d-flex
                                    justify-content-center
                                    align-items-center
                                  "
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
                              </template>
                              <template #cell(name)="propertyRow">
                                <b-card-header
                                  header-tag="header"
                                  role="tab"
                                  class="border"
                                >
                                  <div
                                    class="
                                      d-flex
                                      justify-content-between
                                      align-items-center
                                    "
                                  >
                                    <div class="d-flex align-items-center">
                                      <div
                                        style="min-width: 30px"
                                        class="
                                          bg-success bg-gradient
                                          text-center
                                          me-2
                                          py-1
                                          position-relative
                                        "
                                      >
                                        <h3 class="mb-0 position-relative">
                                          {{ propertyRow.index + 1 }}
                                        </h3>
                                      </div>
                                      <div class="text-muted">
                                        <h5 class="mb-0">
                                          {{ propertyRow.item.name }}
                                        </h5>
                                        <div>
                                          <small
                                            class="d-flex align-items-center"
                                            >{{
                                              setAmount(propertyRow.item.amount)
                                            }}
                                            |
                                            <a
                                              href="javascript: void(0);"
                                              class="
                                                text-success
                                                d-flex
                                                align-items-center
                                                ms-1
                                              "
                                              @click="
                                                propertyRow.item.visible =
                                                  !propertyRow.item.visible
                                              "
                                            >
                                              {{
                                                propertyRow.item.visible
                                                  ? "Hide"
                                                  : "Show"
                                              }}
                                              Details
                                              <i
                                                class="
                                                  bx bx-chevron-right
                                                  rotate
                                                  font-size-14
                                                "
                                                :class="{
                                                  'rotate-90':
                                                    propertyRow.item.visible,
                                                }"
                                              ></i>
                                            </a>
                                          </small>
                                        </div>
                                      </div>
                                    </div>
                                    <div
                                      class="
                                        float-end
                                        d-flex
                                        align-items-center
                                      "
                                    >
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
                                        <b-dropdown-item
                                          @click="updateItem(propertyRow.item)"
                                          ><i
                                            class="
                                              mdi mdi-update
                                              font-size-18
                                              me-1
                                            "
                                          ></i
                                          >Update Item</b-dropdown-item
                                        >
                                        <b-dropdown-item
                                          @click="postItem(propertyRow.item)"
                                          variant="success"
                                          ><i
                                            class="
                                              bx bx-list-check
                                              font-size-18
                                              me-1
                                            "
                                          ></i
                                          >Post Now</b-dropdown-item
                                        >
                                      </b-dropdown>
                                    </div>
                                  </div>
                                </b-card-header>
                                <b-collapse
                                  :visible="propertyRow.item.visible"
                                  role="tabpanel"
                                >
                                  <b-card-body class="border">
                                    <div
                                      class="
                                        d-flex
                                        align-items-center
                                        justify-content-between
                                        cursor-pointer
                                      "
                                      @click="
                                        propertyRow.item.itemVisible =
                                          !propertyRow.item.itemVisible
                                      "
                                    >
                                      <h6 class="mb-0">
                                        <i class="bx bx-menu-alt-right"></i>
                                        Property Details
                                      </h6>
                                      <h5 class="mb-0">
                                        <i
                                          class="bx bx-chevron-right rotate"
                                          :class="{
                                            'rotate-90':
                                              propertyRow.item.itemVisible,
                                          }"
                                        ></i>
                                      </h5>
                                    </div>
                                  </b-card-body>
                                  <b-collapse
                                    :visible="propertyRow.item.itemVisible"
                                    role="tabpanel"
                                  >
                                    <b-card-body class="border">
                                      <b-row>
                                        <b-col sm="6">
                                          <b-row class="mb-2">
                                            <b-col sm="4" class="text-right">
                                              <b>Property Name:</b></b-col
                                            >
                                            <b-col>{{
                                              propertyRow.item.name
                                            }}</b-col>
                                          </b-row>
                                          <b-row class="mb-2">
                                            <b-col sm="4" class="text-right">
                                              <b>Property Specification:</b>
                                            </b-col>
                                            <b-col>{{
                                              propertyRow.item.specification
                                            }}</b-col>
                                          </b-row>
                                          <b-row class="mb-2">
                                            <b-col sm="4" class="text-right">
                                              <b>Color:</b></b-col
                                            >
                                            <b-col>{{
                                              propertyRow.item.color
                                            }}</b-col>
                                          </b-row>
                                          <b-row class="mb-2">
                                            <b-col sm="4" class="text-right">
                                              <b>Dimension Description:</b>
                                            </b-col>
                                            <b-col>{{
                                              propertyRow.item
                                                .dimensionDescription
                                            }}</b-col>
                                          </b-row>
                                          <b-row class="mb-2">
                                            <b-col sm="4" class="text-right">
                                              <b>Material Used:</b></b-col
                                            >
                                            <b-col>{{
                                              propertyRow.item.materialUsed
                                            }}</b-col>
                                          </b-row>
                                          <b-row class="mb-2">
                                            <b-col sm="4" class="text-right">
                                              <b>Package Description:</b></b-col
                                            >
                                            <b-col>{{
                                              propertyRow.item
                                                .packageDescription
                                            }}</b-col>
                                          </b-row>
                                          <b-row class="mb-2">
                                            <b-col sm="4" class="text-right">
                                              <b>Property Number:</b></b-col
                                            >
                                            <b-col>{{
                                              propertyRow.item.propertyNumber
                                            }}</b-col>
                                          </b-row>
                                          <b-row class="mb-2">
                                            <b-col sm="4" class="text-right">
                                              <b>Serial Number:</b></b-col
                                            >
                                            <b-col>{{
                                              propertyRow.item.serialNumber
                                            }}</b-col>
                                          </b-row>
                                          <b-row class="mb-2">
                                            <b-col sm="4" class="text-right"
                                              ><b>Date Acquired:</b></b-col
                                            >
                                            <b-col>{{
                                              formatDate(
                                                new Date(
                                                  propertyRow.item.dateAcquired
                                                )
                                              )
                                            }}</b-col>
                                          </b-row>
                                          <b-row class="mb-2">
                                            <b-col sm="4" class="text-right">
                                              <b>Amount:</b></b-col
                                            >
                                            <b-col>{{
                                              setAmount(propertyRow.item.amount)
                                            }}</b-col>
                                          </b-row>
                                        </b-col>
                                        <b-col
                                          sm="6"
                                          class="border-start border-3"
                                        >
                                          <b-row class="mb-2">
                                            <b-col sm="4" class="text-right"
                                              ><b>Life Span in Yrs:</b></b-col
                                            >
                                            <b-col>{{
                                              propertyRow.item.lifespanInYears
                                            }}</b-col>
                                          </b-row>
                                          <b-row class="mb-2">
                                            <b-col sm="4" class="text-right">
                                              <b>Yearly Depreciation:</b></b-col
                                            >
                                            <b-col>{{
                                              propertyRow.item
                                                .yearlyDepreciation
                                            }}</b-col>
                                          </b-row>
                                          <b-row class="mb-2">
                                            <b-col sm="4" class="text-right">
                                              <b>Salvage Value:</b></b-col
                                            >
                                            <b-col>{{
                                              propertyRow.item.salvageValue
                                            }}</b-col>
                                          </b-row>
                                          <b-row class="mb-2">
                                            <b-col sm="4" class="text-right"
                                              ><b>Item Category:</b></b-col
                                            >
                                            <b-col>{{
                                              propertyRow.item.itemCategory.name
                                            }}</b-col>
                                          </b-row>
                                          <b-row class="mb-2">
                                            <b-col sm="4" class="text-right">
                                              <b>Supplier:</b></b-col
                                            >
                                            <b-col>{{
                                              propertyRow.item.supplier
                                            }}</b-col>
                                          </b-row>
                                          <b-row class="mb-2">
                                            <b-col sm="4" class="text-right"
                                              ><b>PO Number:</b></b-col
                                            >
                                            <b-col>{{
                                              propertyRow.item.poNumber
                                            }}</b-col>
                                          </b-row>
                                          <b-row class="mb-2">
                                            <b-col sm="4" class="text-right">
                                              <b>Notes:</b></b-col
                                            >
                                            <b-col>{{
                                              propertyRow.item.note
                                            }}</b-col>
                                          </b-row>
                                          <b-row class="mb-2">
                                            <b-col sm="4" class="text-right">
                                              <b>Brand:</b></b-col
                                            >
                                            <b-col>{{
                                              propertyRow.item.brand
                                            }}</b-col>
                                          </b-row>
                                          <b-row class="mb-2">
                                            <b-col sm="4" class="text-right">
                                              <b>Property Condition:</b></b-col
                                            >
                                            <b-col>{{
                                              propertyRow.item.condition
                                            }}</b-col>
                                          </b-row>
                                          <b-row class="mb-2">
                                            <b-col sm="4" class="text-right">
                                              <b>Model:</b></b-col
                                            >
                                            <b-col>{{
                                              propertyRow.item.model
                                            }}</b-col>
                                          </b-row>
                                          <b-row class="mb-2">
                                            <b-col sm="4" class="text-right"
                                              ><b>Fund Cluster:</b></b-col
                                            >
                                            <b-col>{{
                                              propertyRow.item.fundCluster
                                            }}</b-col>
                                          </b-row>
                                          <b-row class="mb-2">
                                            <b-col sm="4" class="text-right">
                                              <b>Unit:</b></b-col
                                            >
                                            <b-col>{{
                                              propertyRow.item.unit
                                            }}</b-col>
                                          </b-row>
                                        </b-col>
                                      </b-row>
                                    </b-card-body>
                                  </b-collapse>
                                  <b-card-body class="border">
                                    <div
                                      class="
                                        d-flex
                                        align-items-center
                                        justify-content-between
                                        cursor-pointer
                                      "
                                      @click="getAttachments(propertyRow.item)"
                                    >
                                      <h6 class="mb-0">
                                        <i
                                          class="
                                            bx bx-paperclip
                                            rotate rotate-90
                                          "
                                        ></i>
                                        Attachments
                                      </h6>
                                      <h5 class="mb-0">
                                        <i
                                          class="bx bx-chevron-right rotate"
                                          :class="{
                                            'rotate-90':
                                              propertyRow.item
                                                .attachmentVisible,
                                          }"
                                        ></i>
                                      </h5>
                                    </div>
                                  </b-card-body>
                                  <b-collapse
                                    :visible="
                                      propertyRow.item.attachmentVisible
                                    "
                                    role="tabpanel"
                                  >
                                    <b-card-body class="border">
                                      <div
                                        class="
                                          d-flex
                                          align-items-center
                                          justify-content-between
                                          mb-3
                                        "
                                      >
                                        <div class="d-flex">
                                          <p
                                            class="mb-0"
                                            v-if="
                                              propertyRow.item.propertyFiles
                                                .length == 0
                                            "
                                          >
                                            <i>No documents found</i>
                                          </p>
                                          <input
                                            v-if="
                                              propertyRow.item.propertyFiles
                                                .length > 0
                                            "
                                            type="search"
                                            class="form-control"
                                            v-model="
                                              propertyRow.item.fileSearch
                                            "
                                            placeholder="Search Documents..."
                                          />
                                        </div>
                                        <div class="">
                                          <!-- <button
                                          type="button"
                                          :id="`posted-document${propertyRow.item.id}`"
                                          @click="propertyRow.item.addDocu = true"
                                          class="
                                            btn btn-sm btn-info
                                            mb-2
                                            me-2
                                            d-flex
                                            align-items-center
                                          "
                                        >
                                          <i class="bx bx-plus fs-6"></i>Upload
                                          Documents
                                        </button> -->
                                          <a
                                            href="javascript:void(0);"
                                            class="
                                              text-primary
                                              border-primary border
                                              p-2
                                            "
                                            :id="`posted-document${propertyRow.item.id}`"
                                            @click="
                                              propertyRow.item.addDocu = true
                                            "
                                            ><i class="bx bx-plus"></i>Upload
                                            Documents</a
                                          >
                                          <upload-popover
                                            :option="uploadOptions"
                                            :sourceId="propertyRow.item.id"
                                            @uploaded="
                                              uploadDocument(
                                                $event,
                                                propertyRow.item.id
                                              )
                                            "
                                            :showPV="propertyRow.item.addDocu"
                                            @closePopover="
                                              propertyRow.item.addDocu = false
                                            "
                                            :dzId="`dropzone-posted${propertyRow.item.id}`"
                                            :pvId="`posted-document${propertyRow.item.id}`"
                                          ></upload-popover>
                                        </div>
                                      </div>
                                      <div class="mt-2">
                                        <b-row>
                                          <b-col
                                            sm="3"
                                            v-for="(y, index) in searchDocu(
                                              propertyRow.item
                                            )"
                                            :key="y.id"
                                            class="mb-2"
                                          >
                                            <div
                                              class="
                                                position-relative
                                                cursor-pointer
                                              "
                                              :style="`z-index: ${
                                                propertyRow.item.propertyFiles
                                                  .length - index
                                              }`"
                                            >
                                              <div class="border p-3">
                                                <div>
                                                  <div class="float-end ms-2">
                                                    <b-dropdown
                                                      id="dropdown-dropleft"
                                                      right
                                                      variant="link"
                                                      toggle-class="text-decoration-none text-dark font-size-16 pt-0"
                                                      menu-class="dropdown-menu-end"
                                                      no-caret
                                                    >
                                                      <template #button-content>
                                                        <i
                                                          class="
                                                            mdi
                                                            mdi-dots-horizontal
                                                          "
                                                        ></i>
                                                      </template>
                                                      <b-dropdown-item
                                                        @click="openDocument(y)"
                                                        ><i
                                                          class="
                                                            bx bx-link-external
                                                            me-1
                                                          "
                                                        ></i
                                                        >Open</b-dropdown-item
                                                      >
                                                      <b-dropdown-item
                                                        variant="danger"
                                                        @click="
                                                          removeFile(
                                                            y.id,
                                                            propertyRow.item.id
                                                          )
                                                        "
                                                        ><i
                                                          class="
                                                            bx bx-trash
                                                            me-1
                                                          "
                                                        ></i
                                                        >Remove</b-dropdown-item
                                                      >
                                                    </b-dropdown>
                                                  </div>
                                                  <div
                                                    class="avatar-xs me-3 mb-2"
                                                    @click="openDocument(y)"
                                                  >
                                                    <div
                                                      class="
                                                        avatar-title
                                                        bg-transparent
                                                        rounded
                                                      "
                                                    >
                                                      <i
                                                        v-if="
                                                          y.fileType.includes(
                                                            'image'
                                                          )
                                                        "
                                                        class="
                                                          mdi mdi-image
                                                          font-size-24
                                                          text-purple
                                                        "
                                                      ></i>
                                                      <i
                                                        v-if="
                                                          y.fileType.includes(
                                                            'application'
                                                          )
                                                        "
                                                        class="
                                                          mdi
                                                          mdi-file-pdf-outline
                                                          font-size-24
                                                          text-danger
                                                        "
                                                      ></i>
                                                    </div>
                                                  </div>
                                                  <div
                                                    class="d-flex"
                                                    @click="openDocument(y)"
                                                  >
                                                    <div
                                                      class="
                                                        overflow-hidden
                                                        me-auto
                                                      "
                                                    >
                                                      <h5
                                                        class="
                                                          font-size-14
                                                          text-truncate
                                                          mb-1
                                                        "
                                                      >
                                                        {{ y.description }}
                                                      </h5>
                                                      <p
                                                        class="text-muted mb-0"
                                                      >
                                                        {{
                                                          formatDateWithTime(
                                                            new Date(
                                                              y.dateTimeUploaded
                                                            )
                                                          )
                                                        }}
                                                      </p>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </b-col>
                                        </b-row>
                                        <b-row
                                          v-if="
                                            searchDocu(propertyRow.item)
                                              .length == 0 &&
                                            propertyRow.item.fileSearch
                                          "
                                        >
                                          <b-col>Search Not Found</b-col>
                                        </b-row>
                                      </div>
                                    </b-card-body>
                                  </b-collapse>
                                </b-collapse>
                              </template>
                            </b-table>
                          </div>
                          <div class="row">
                            <div class="col">
                              <div
                                class="
                                  dataTables_paginate
                                  paging_simple_numbers
                                  float-end
                                "
                              >
                                <ul
                                  class="pagination pagination-rounded mb-0"
                                  style="z-index: -1"
                                >
                                  <b-pagination
                                    v-model="row.item.currentPage"
                                    :total-rows="propertyRows(row.item.details)"
                                    :per-page="10"
                                  ></b-pagination>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </b-card>
                      </transition>
                    </template>
                  </b-table>
                </div>
                <div class="row">
                  <div class="col">
                    <div
                      class="
                        dataTables_paginate
                        paging_simple_numbers
                        float-end
                      "
                    >
                      <ul
                        class="pagination pagination-rounded mb-0"
                        style="z-index: -1"
                      >
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
            </div>
          </slide>
          <slide>
            <form
              @submit.prevent="onCreate"
              class="needs-validation mt-3"
              ref="fcForm"
            >
              <b-row class="mb-2">
                <b-col sm="6">
                  <div class="d-flex align-items-center">
                    <a
                      href="javascript:void(0);"
                      class="me-1"
                      @click="returnToTable()"
                      ><i class="bx bx-left-arrow-alt fs-2"></i
                    ></a>
                    <h4>
                      {{
                        !editMode ? "Create New Property" : "Update Property"
                      }}
                    </h4>
                  </div>
                </b-col>
                <b-col sm="6">
                  <button
                    type="submit"
                    class="btn btn-primary d-flex align-items-center float-end"
                  >
                    <i class="bx bx-save me-1"></i> Save Property
                  </button>
                </b-col>
              </b-row>
              <div class="card border p-3">
                <div class="row">
                  <div class="col-md-12 mb-2">
                    <span class="text-primary">Fill up the information: </span>
                  </div>
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
                          <label for="specification"
                            >Property Specification
                          </label>
                          <textarea
                            id="specification"
                            rows="2"
                            v-model="form.specification"
                            placeholder="Enter Property Specification..."
                            class="form-control"
                            :class="{
                              'is-invalid':
                                submitted && $v.form.specification.$error,
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
                                  submitted &&
                                  $v.form.dimensionDescription.$error,
                              }"
                              autocomplete="off"
                            />
                            <div
                              v-if="
                                submitted && $v.form.dimensionDescription.$error
                              "
                              class="invalid-feedback"
                            >
                              <span
                                v-if="!$v.form.dimensionDescription.required"
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
                              'is-invalid':
                                submitted && $v.form.materialUsed.$error,
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
                          <label for="packageDescription"
                            >Package Description
                          </label>
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
                            v-if="
                              submitted && $v.form.packageDescription.$error
                            "
                            class="invalid-feedback"
                          >
                            <span v-if="!$v.form.packageDescription.required"
                              >This value is required.</span
                            >
                          </div>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="row mb-3">
                          <div class="col-md-4">
                            <label for="poNumber">P.O Number </label>
                            <input
                              id="poNumber"
                              type="text"
                              v-model="form.poNumber"
                              placeholder="Enter PO Number..."
                              class="form-control"
                              :class="{
                                'is-invalid':
                                  submitted && $v.form.poNumber.$error,
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
                          <div class="col-md-4">
                            <label for="propertyNumber">Property Number </label>
                            <input
                              id="propertyNumber"
                              type="text"
                              v-model="form.propertyNumber"
                              placeholder="Enter Property Number..."
                              class="form-control"
                              :class="{
                                'is-invalid':
                                  submitted && $v.form.propertyNumber.$error,
                              }"
                              autocomplete="off"
                            />
                            <div
                              v-if="submitted && $v.form.propertyNumber.$error"
                              class="invalid-feedback"
                            >
                              <span v-if="!$v.form.propertyNumber.required"
                                >This value is required.</span
                              >
                            </div>
                          </div>
                          <div class="col-md-4">
                            <label for="serialNumber">Serial Number </label>
                            <input
                              id="serialNumber"
                              type="text"
                              v-model="form.serialNumber"
                              placeholder="Enter Serial Number..."
                              class="form-control"
                              :class="{
                                'is-invalid':
                                  submitted && $v.form.serialNumber.$error,
                              }"
                              autocomplete="off"
                            />
                            <div
                              v-if="submitted && $v.form.serialNumber.$error"
                              class="invalid-feedback"
                            >
                              <span v-if="!$v.form.serialNumber.required"
                                >This value is required.</span
                              >
                            </div>
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
                                'is-invalid':
                                  submitted && $v.form.amount.$error,
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
                            <label for="lifespanInYears"
                              >Life Span in Yrs.
                            </label>
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
                                  submitted &&
                                  $v.form.yearlyDepreciation.$error,
                              }"
                              autocomplete="off"
                              :mask="currencyMask"
                            ></masked-input>
                            <div
                              v-if="
                                submitted && $v.form.yearlyDepreciation.$error
                              "
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
                              'is-invalid':
                                submitted && $v.form.condition.$error,
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
                                ><i
                                  class="mdi mdi-clipboard-text-search-outline"
                                ></i
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
                                ><i
                                  class="mdi mdi-clipboard-text-search-outline"
                                ></i
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
                                'is-invalid':
                                  submitted && $v.form.supplier.$error,
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
                              'is-invalid':
                                submitted && $v.form.fundCluster.$error,
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
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </slide>
        </carousel>
      </div>
    </div>
    <item-category @dropData="dropItemCat($event)"></item-category>
    <supplier @dropData="dropSupplier($event)"></supplier>
  </Layout>
</template>
