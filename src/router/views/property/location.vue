<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import Swal from "sweetalert2";
import { cloneDeep } from "lodash";
import { required } from "vuelidate/lib/validators";

export default {
  page: {
    title: "Property Location",
  },
  components: {
    Layout,
    PageHeader,
  },
  data() {
    return {
      title: "Property Location",
      submitted: false,
      items: [
        {
          text: "Dashboards",
          href: "/",
        },
        {
          text: "Property Location",
          active: true,
        },
      ],
      tableData: [],
      modalTitle: "",
      totalRows: 1,
      currentPage: 1,
      perPage: 10,
      pageOptions: [10, 25, 50, 100],
      filter: null,
      filterOn: [],
      sortBy: "type",
      sortDesc: false,
      fields: [
        {
          key: "location",
          sortable: true,
        },
        {
          key: "locationCode",
          sortable: true,
        },
        {
          key: "actions",
          thStyle: { width: "90px" },
        },
      ],
      form: {
        id: 0,
        location: "",
        locationCode: "",
      },
      alert: {
        type: "",
        message: "",
      },
      alertForm: {
        type: "",
        message: "",
      },
      indexSelected: -1,
      tableBusy: false,
    };
  },
  computed: {
    rows() {
      return this.tableData.length;
    },
  },
  validations: {
    form: {
      location: { required },
      locationCode: { required },
    },
  },
  created() {
    this.tableBusy = true;
    this.$store
      .dispatch("propertylocation/GetPropertyLocation")
      .then((res) => {
        this.tableBusy = false;
        this.tableData = res.data;
      })
      .catch(() => {
        this.tableBusy = false;
        // this.alert = {
        //   type: "danger",
        //   message: "Something went wrong!",
        // };
        this.showToast(
          "Something went wrong! - getting location list",
          "error"
        );
      });
  },
  methods: {
    onFiltered(filteredItems) {
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    addLocation() {
      this.onReset();
      this.modalTitle = "Create New Location";
      this.$bvModal.show("loc-modal");
    },
    onReset() {
      this.form = {
        id: 0,
        location: "",
        locationCode: "",
      };
    },
    hideModal() {
      this.$bvModal.hide("loc-modal");
    },
    onCreate() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      } else {
        if (this.form.id > 0) {
          this.$store
            .dispatch("propertylocation/UpdatePropertyLocation", this.form)
            .then((res) => {
              this.tableData.splice(this.indexSelected, 1, res.data);
              this.$bvModal.hide("loc-modal");
              //   this.alert = {
              //     type: "success",
              //     message: "Successfully updated!",
              //   };
              this.showToast("Successfully updated!", "success");
            })
            .catch((err) => {
              //   this.alertForm = {
              //     type: "danger",
              //     message: "Something went wrong!",
              //   };
              this.showToast(
                "Something went wrong! - updating location",
                "error"
              );
            });
        } else {
          this.$store
            .dispatch("propertylocation/CreatePropertyLocation", this.form)
            .then((res) => {
              this.tableData.push(res.data);
              this.$bvModal.hide("loc-modal");
              //   this.alert = {
              //     type: "success",
              //     message: "Successfully created!",
              //   };
              this.showToast("Successfully created!", "success");
            })
            .catch((err) => {
              //   this.alertForm = {
              //     type: "danger",
              //     message: "Something went wrong!",
              //   };
              this.showToast(
                "Something went wrong! - creating location",
                "error"
              );
            });
        }
        this.submitted = false;
      }
    },
    updateItem(props) {
      this.form = cloneDeep(props.item);
      this.indexSelected = this.tableData.indexOf(props.item);
      this.modalTitle = "Update Location";
      this.$bvModal.show("loc-modal");
    },
    deleteItem(props) {
      var index = this.tableData.indexOf(props.item);
      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#5c636a",
        confirmButtonText: "Yes, delete it!",
      }).then((result) => {
        if (result.value) {
          this.$store
            .dispatch("propertylocation/DeletePropertyLocation", props.item.id)
            .then((res) => {
              if (res.status == 204) {
                this.tableData.splice(index, 1);
                this.alert = {
                  type: "success",
                  message: "Successfully deleted",
                };
                this.showToast("Successfully deleted", "success");
              }
            })
            .catch((err) => {
              //   this.alert = {
              //     type: "danger",
              //     message: "Cannot be deleted!",
              //   };
              this.showToast("Cannot be deleted!", "error");
            });
        }
      });
    },
    // dropData(data) {
    //   this.$emit("dropData", data[0]);
    //   this.$bvModal.hide("location-modal");
    // },
    // getData() {
    // },
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <div class="row">
      <div class="col-12">
        <div class="card border">
          <div class="card-body">
            <div class="row mt-1 mb-3">
              <div class="col-12">
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
              <div class="col-sm-12 col-md-6">
                <div class="d-flex align-items-center h-100">
                  <h5 class="mb-0">List of Property Location</h5>
                </div>
              </div>
              <!-- Search -->
              <div class="col-sm-12 col-md-6">
                <div class="d-flex justify-content-end align-items-center">
                  <button
                    type="button"
                    @click="addLocation()"
                    class="btn btn-info d-flex align-items-center"
                  >
                    <i class="bx bx-plus fs-6"></i>Create New
                  </button>
                  <b-modal
                    id="loc-modal"
                    :title="modalTitle"
                    size="md"
                    title-class="font-18"
                    hide-footer
                  >
                    <div>
                      <b-alert
                        :show="alertForm.type === 'success'"
                        dismissible
                        @dismissed="alertForm.type = ''"
                        variant="success"
                      >
                        <i class="mdi mdi-check-all me-2"></i
                        >{{ alertForm.message }}
                      </b-alert>
                      <b-alert
                        :show="alertForm.type === 'danger'"
                        dismissible
                        @dismissed="alertForm.type = ''"
                        variant="danger"
                      >
                        <i class="mdi mdi-block-helper me-2"></i
                        >{{ alertForm.message }}
                      </b-alert>
                      <b-alert
                        :show="alertForm.type === 'warning'"
                        dismissible
                        @dismissed="alertForm.type = ''"
                        variant="warning"
                      >
                        <i class="mdi mdi-alert-outline me-2"></i
                        >{{ alertForm.message }}
                      </b-alert>
                    </div>
                    <form
                      @submit.prevent="onCreate"
                      class="needs-validation"
                      ref="accForm"
                    >
                      <div class="mb-3">
                        <label for="location">Location </label>
                        <input
                          autocomplete="off"
                          id="location"
                          type="text"
                          v-model="form.location"
                          placeholder="Enter Location..."
                          class="form-control"
                          :class="{
                            'is-invalid': submitted && $v.form.location.$error,
                          }"
                        />
                        <div
                          v-if="submitted && $v.form.location.$error"
                          class="invalid-feedback"
                        >
                          <span v-if="!$v.form.location.required"
                            >This value is required.</span
                          >
                        </div>
                      </div>
                      <div class="mb-3">
                        <label for="locationCode">Location Code</label>
                        <input
                          autocomplete="off"
                          id="locationCode"
                          type="text"
                          v-model="form.locationCode"
                          placeholder="Enter Location Code..."
                          class="form-control"
                          :class="{
                            'is-invalid':
                              submitted && $v.form.locationCode.$error,
                          }"
                        />
                        <div
                          v-if="submitted && $v.form.locationCode.$error"
                          class="invalid-feedback"
                        >
                          <span v-if="!$v.form.locationCode.required"
                            >This value is required.</span
                          >
                        </div>
                      </div>
                      <div class="modal-footer">
                        <button type="submit" class="btn btn-primary">
                          Save changes
                        </button>
                        <button
                          type="button"
                          class="btn btn-link"
                          @click="hideModal"
                        >
                          Close
                        </button>
                      </div>
                    </form>
                  </b-modal>
                </div>
              </div>
              <!-- End search -->
            </div>
            <div class="d-flex float-end mb-2">
              <div id="tickets-table_filter" class="dataTables_filter me-1">
                <label class="d-inline-flex align-items-center">
                  <b-form-input
                    autocomplete="off"
                    v-model="filter"
                    type="search"
                    placeholder="Search Location..."
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
            <div class="table-responsive mb-0">
              <b-table
                class="datatables"
                :items="tableData"
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
                  <div class="text-center">{{ scope.emptyText }}</div>
                </template>
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
                      <b-dropdown-item
                        @click="updateItem(row)"
                        variant="info"
                        ><i class="mdi mdi-update font-size-18 me-1"></i
                        >Edit</b-dropdown-item
                      >
                      <b-dropdown-item @click="deleteItem(row)" variant="danger"
                        ><i class="mdi mdi-trash-can font-size-18 me-1"></i
                        >Delete</b-dropdown-item
                      >
                    </b-dropdown>
                  </div>
                </template>
              </b-table>
            </div>
            <div class="row">
              <div class="col">
                <div
                  class="dataTables_paginate paging_simple_numbers float-end"
                >
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
        </div>
      </div>
    </div>
  </Layout>
</template>