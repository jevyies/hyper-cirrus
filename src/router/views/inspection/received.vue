<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import Swal from "sweetalert2";
import { cloneDeep } from "lodash";

export default {
  page: {
    title: "Received",
  },
  components: {
    Layout,
    PageHeader,
  },
  data() {
    return {
      title: "Received",
      submitted: false,
      items: [
        {
          text: "Dashboards",
          href: "/",
        },
        {
          text: "Received",
          active: true,
        },
      ],
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
      poLoading: false,
      poIndex: -1,
      cycle: this.$store.state.data.cycle,
      tabIndex: 0,
      supplierData: [],
    };
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
      .dispatch("inspectionincoming/GetInspectionReceived")
      .then((res) => {
        this.poLoading = false;
        res.data.forEach((item) => {
          item.visible = false;
          item.dateReceived = new Date(item.poDateReceived);
        });
        this.poData = res.data;
      })
      .catch((err) => {
        let stringErr = err.toString();
        if (stringErr.includes("Network")) {
          this.showToast("Network Error!", "error");
        } else {
          this.showToast("Something went wrong getting received P.O. list!", "error");
        }
        this.poLoading = false;
      });
  },
  methods: {
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
    showSupplier(props) {
      this.supplierData = cloneDeep(props);
      this.modalTitle = "Supplier Details";
      this.$bvModal.show("modal-standard");
    },
    hideModal() {
      this.$bvModal.hide("modal-standard");
    },
    checkSupplierInfo(props) {
      if (props) return props;
      else return "n/a";
    },
    formatDate(date) {
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
        <div>{{ checkSupplierInfo(supplierData.note) }}</div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-link" @click="hideModal">
          Close
        </button>
      </div>
    </b-modal>
    <div
      class="
        card
        border-4 border-top border-start-0 border-end-0 border-primary
      "
    >
      <div class="card-body">
        <div class="row">
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
          v-if="poData.length == 0"
        >
          <h5 class="text-muted">
            <i class="fas fa-exclamation-triangle me-2"></i>No Data Found
          </h5>
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
          class="pt-3 pb-3 text-muted"
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
                  <!-- <a
                    href="javascript:void(0);"
                    class="text-success"
                    @click="x.visible = !x.visible"
                    >{{ x.visible ? "Hide" : "Show More" }} Details
                    <i
                      class="
                        bx bx-chevron-right
                        rotate
                        font-size-14
                      "
                      :class="{
                        'rotate-90': x.visible,
                      }"
                    ></i>
                  </a> -->
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
                <!-- <div class="d-flex align-items-center">
                  <button
                    type="button"
                    class="btn btn-success me-1"
                    @click="receivePO(x.id)"
                  >
                    <i class="bx bx-check me-1"></i>Receive
                  </button>
                </div> -->
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
                    <b class="font-size-16">Items:</b>
                  </div>
                  <div>
                    <table width="100%">
                      <thead>
                        <tr class="border-bottom">
                          <th style="width: 90px" class="py-2">Qty</th>
                          <th class="py-2">Item Name</th>
                          <th class="py-2">Requisitioning Office/Dept.:</th>
                          <th class="py-2" style="width: 150px">Unit Price</th>
                          <th class="py-2" style="width: 150px">Total Price</th>
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
  </Layout>
</template>

