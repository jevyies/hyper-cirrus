<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import Swal from "sweetalert2";
import { cloneDeep } from "lodash";
import { required, email } from "vuelidate/lib/validators";
import Multiselect from "vue-multiselect";
import UserACcount from "@/components/widgets/useraccount";

export default {
  page: {
    title: "Employees",
  },
  components: {
    Layout,
    PageHeader,
    Multiselect,
    UserACcount,
  },
  data() {
    return {
      title: "Employees",
      submitted: false,
      items: [
        {
          text: "Dashboards",
          href: "/",
        },
        {
          text: "Employees",
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
      sortBy: "name",
      sortDesc: false,
      fields: [
        {
          key: "employee",
          sortable: true,
        },
        {
          key: "designation",
          sortable: true,
          label: "Designation",
          thStyle: { width: "45%" },
        },
        {
          key: "actions",
          thStyle: { width: "120px" },
        },
      ],
      form: {
        id: 0,
        firstName: "",
        middleName: "",
        lastName: "",
        position: "",
        departmentId: 0,
        deliveryUnit: "",
        agency: "",
        campus: "",
        office: "",
        department: "",
        idNumber: "",
        isFaculty: false,
      },
      indexSelected: -1,
      sOptions: ["Agency", "Campus", "Office", "Delivery Unit"],
      search: "",
      agencies: [],
      campuses: [],
      offices: [],
      dus: [],
      departments: [],
      tableBusy: false,

      // Filters
      filterAgencies: [],
      agencySelect: 0,
      filterCampuses: [],
      campusSelect: 0,
      filterOffices: [],
      officeSelect: 0,
      filterDUs: [],
      duSelect: 0,
      showFilter: false,
      filterOff: false,

      // categories
      categories: [],
      selectedCategory: [],
      accountModal: false,
      selectedData: null,
    };
  },
  validations: {
    form: {
      firstName: { required },
      lastName: { required },
      position: { required },
      agency: { required },
      campus: { required },
      office: { required },
      deliveryUnit: { required },
      department: { required },
    },
  },
  computed: {
    rows() {
      if (this.filter) {
        return this.totalRows;
      }
      return this.tableData.length;
    },
  },
  created() {
    this.totalRows = this.items.length;
    this.$store
      .dispatch("agency/GetAgency")
      .then((res) => {
        this.agencies = res.data;
        var data = cloneDeep(res.data);
        var filterAgencies = [{ text: "", value: "" }, { text: "All", value: 0 }];
        data.forEach((item) => {
          item.text = item.agencyShortName;
          item.value = item.id;
          filterAgencies.push(item);
        });
        this.agencySelect = this.$store.state.data.agency.id;
        this.filterAgencies = filterAgencies;
      })
      .catch(() => {
        this.showToast("Something went wrong!", "error");
      });
    this.$store
      .dispatch(
        "technicalreviewuser/GetAvailableCategories",
        this.$store.state.data.campus.id
      )
      .then((res) => {
        this.categories = res.data.sort((a, b) => {
            if(a.name < b.name) { return -1; }
            if(a.name > b.name) { return 1; }
            return 0;
        });
      })
      .catch(() => {
        this.showToast("Something went wrong!", "error");
      });
    this.filteredCampus({ id: this.$store.state.data.agency.id });
    this.campusSelect = this.$store.state.data.campus.id;
    this.filteredOffice({ id: this.$store.state.data.campus.id });
    this.officeSelect = this.$store.state.data.office.id;
    this.filteredDeliveryUnit({ id: this.$store.state.data.office.id });
    this.duSelect = this.$store.state.data.deliveryUnit.id;
    this.searchEmployee({ id: this.$store.state.data.deliveryUnit.id });
  },
  methods: {
    filteredCampus(value) {
      this.filterCampuses = [];
      this.campusSelect = '';
      this.filterOffices = [];
      this.officeSelect = '';
      this.filterDUs = [];
      this.duSelect = '';
      this.tableData = [];
      if(value.id === ''){
        return;
      }
      if(value.id == 0){
        this.tableBusy = true;
        this.$store
          .dispatch(`employee/GetEmployee`)
          .then((res) => {
            res.data.forEach(item => {
              item.catLoading = false;
              item.selectedCategory = []
            })
            this.tableData = res.data;
            this.tableBusy = false;
          })
          .catch(() => {
            this.showToast("Something went wrong!", "error");
          });
      }else{
        this.$store
          .dispatch(`campus/GetCampusByAgency`, value.id)
          .then((res) => {
            this.campuses = res.data;
            var data = cloneDeep(res.data);
            var filterCampuses = [{ text: "", value: '' },{ text: "All", value: 0 }];
            data.forEach((item) => {
              item.text = item.shortName;
              item.value = item.id;
              filterCampuses.push(item);
            });
            this.filterCampuses = filterCampuses;
          })
          .catch(() => {
            this.showToast("Something went wrong!", "error");
          });
      }
    },
    filteredOffice(value) {
      this.filterOffices = [];
      this.officeSelect = '';
      this.filterDUs = [];
      this.duSelect = '';
      this.tableData = [];
      if(value.id === ''){
        return;
      }
      if(value.id == 0){
        this.tableBusy = true;
        this.$store
          .dispatch(`employee/GetEmployeeByAgency`, this.agencySelect)
          .then((res) => {
            res.data.forEach(item => {
              item.catLoading = false;
              item.selectedCategory = []
            })
            this.tableData = res.data;
            this.tableBusy = false;
          })
          .catch(() => {
            this.showToast("Something went wrong!", "error");
          });
      }else{
        this.$store
          .dispatch("office/GetOfficeByCampus", value.id)
          .then((res) => {
            this.offices = res.data;
            var data = cloneDeep(res.data);
            var filterOffices = [{ text: "", value: '' },{ text: "All", value: 0 }];
            data.forEach((item) => {
              item.text = item.shortName;
              item.value = item.id;
              filterOffices.push(item);
            });
            this.filterOffices = filterOffices;
          })
          .catch(() => {
            this.showToast("Something went wrong!", "error");
          });
      }
    },
    filteredDeliveryUnit(value) {
      this.filterDUs = [];
      this.duSelect = '';
      this.tableData = [];
      if(value.id === ''){
        return;
      }
      if(value.id == 0){
        this.tableBusy = true;
        this.$store
          .dispatch(`employee/GetEmployeeByCampus`, this.campusSelect)
          .then((res) => {
            res.data.forEach(item => {
              item.catLoading = false;
              item.selectedCategory = []
            })
            this.tableData = res.data;
            this.tableBusy = false;
          })
          .catch(() => {
            this.showToast("Something went wrong!", "error");
          });
      }else{
        this.$store
          .dispatch("deliveryunit/GetDeliveryUnitByOffice", value.id)
          .then((res) => {
            this.dus = res.data;
            var data = cloneDeep(res.data);
            var filterDUs = [{ text: "", value: '' },{ text: "All", value: 0 }];
            data.forEach((item) => {
              item.text = item.shortName;
              item.value = item.id;
              filterDUs.push(item);
            });
            this.filterDUs = filterDUs;
          })
          .catch(() => {
            this.showToast("Something went wrong!", "error");
          });
      }
    },
    searchCampus(value) {
      this.campuses = [];
      this.form.campus = "";
      this.offices = [];
      this.form.office = "";
      this.dus = [];
      this.form.deliveryUnit = "";
      this.departments = [];
      this.form.department = "";
      this.$store
        .dispatch(`campus/GetCampusByAgency`, value.id)
        .then((res) => {
          this.campuses = res.data;
          var data = cloneDeep(res.data);
          var filterCampuses = [{ text: "All", value: 0 }];
          data.forEach((item) => {
            item.text = item.shortName;
            item.value = item.id;
            filterCampuses.push(item);
          });
          this.filterCampuses = filterCampuses;
        })
        .catch(() => {
          this.showToast("Something went wrong!", "error");
        });
    },
    searchOffice(value) {
      this.offices = [];
      this.form.office = "";
      this.dus = [];
      this.form.deliveryUnit = "";
      this.departments = [];
      this.form.department = "";
      this.$store
        .dispatch("office/GetOfficeByCampus", value.id)
        .then((res) => {
          this.offices = res.data;
          var data = cloneDeep(res.data);
          var filterOffices = [{ text: "All", value: 0 }];
          data.forEach((item) => {
            item.text = item.shortName;
            item.value = item.id;
            filterOffices.push(item);
          });
          this.filterOffices = filterOffices;
        })
        .catch(() => {
          this.showToast("Something went wrong!", "error");
        });
    },
    searchDeliveryUnit(value) {
      this.dus = [];
      this.form.deliveryUnit = "";
      this.departments = [];
      this.form.department = "";
      this.$store
        .dispatch("deliveryunit/GetDeliveryUnitByOffice", value.id)
        .then((res) => {
          this.dus = res.data;
          var data = cloneDeep(res.data);
          var filterDUs = [{ text: "", value: 0 }];
          data.forEach((item) => {
            item.text = item.shortName;
            item.value = item.id;
            filterDUs.push(item);
          });
          this.filterDUs = filterDUs;
        })
        .catch(() => {
          this.showToast("Something went wrong!", "error");
        });
    },
    searchDepartment(value) {
      this.departments = [];
      this.form.department = "";
      this.$store
        .dispatch("department/GetDepartmentByDU", value.id)
        .then((res) => {
          this.departments = res.data;
        })
        .catch(() => {
          this.showToast("Something went wrong!", "error");
        });
    },
    searchEmployee(value) {
      this.tableData = [];
      if(value.id === ''){
        return;
      }
      if(value.id == 0){
        this.tableBusy = true;
        this.$store
          .dispatch(`employee/GetEmployeeByOffice`, this.officeSelect)
          .then((res) => {
            res.data.forEach(item => {
              item.catLoading = false;
              item.selectedCategory = []
            })
            this.tableData = res.data;
            this.tableBusy = false;
          })
          .catch(() => {
            this.showToast("Something went wrong!", "error");
          });
      }else{
        this.tableBusy = true;
        this.$store
          .dispatch("employee/GetEmployeeByDU", value.id)
          .then((res) => {
            res.data.forEach(item => {
              item.catLoading = false;
              item.selectedCategory = []
            })
            this.tableData = res.data;
            this.tableBusy = false;
          })
          .catch((error) => {
            this.tableBusy = false;
            this.showToast("Something went wrong!", "error");
          });
      }
    },
    inputDepartment(value) {
      this.form.departmentId = value.id;
    },
    onFiltered(filteredItems) {
      console.log(filteredItems)
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    addEmployee() {
      this.onReset();
      this.modalTitle = "Create New Employee";
      this.filterOff = true;
      this.$bvModal.show("modal-standard");
    },
    onCreate() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      } else {
        if (this.form.id > 0) {
          this.$store
            .dispatch("employee/UpdateEmployee", this.form)
            .then((res) => {
              if (res.data.error) {
                return this.showToast(res.data.errorMessage, "error");
              }
              this.tableData.splice(this.indexSelected, 1, res.data);
              this.$bvModal.hide("modal-standard");
              this.filterOff = false;
              this.showToast("Successfully updated!", "success");
            })
            .catch((err) => {
              this.showToast("Something went wrong!", "error");
            });
        } else {
          this.$store
            .dispatch("employee/CreateEmployee", this.form)
            .then((res) => {
              if (res.data.error) {
                return this.showToast(res.data.errorMessage, "error");
              }
              this.tableData.push(res.data);
              this.$bvModal.hide("modal-standard");
              this.filterOff = false;
              this.showToast("Successfully created!", "success");
            })
            .catch((err) => {
              this.showToast("Something went wrong!", "error");
            });
        }
        this.submitted = false;
      }
    },
    onReset() {
      this.form = {
        id: 0,
        firstName: "",
        middleName: "",
        lastName: "",
        position: "",
        deliveryUnit: "",
        agency: "",
        campus: "",
        office: "",
        department: "",
        departmentId: 0,
        isFaculty: false,
        idNumber: "",
      };
    },
    updateItem(props) {
      this.form = cloneDeep(props.item);
      this.indexSelected = this.tableData.indexOf(props.item);
      this.form.agency = props.item.department.deliveryUnit.office.campus.agency;
      this.searchCampus(props.item.department.deliveryUnit.office.campus.agency);
      this.form.campus = props.item.department.deliveryUnit.office.campus;
      this.searchOffice(props.item.department.deliveryUnit.office.campus);
      this.form.office = props.item.department.deliveryUnit.office;
      this.searchDeliveryUnit(props.item.department.deliveryUnit.office);
      this.form.deliveryUnit = props.item.department.deliveryUnit;
      this.searchDepartment(props.item.department.deliveryUnit);
      this.form.department = props.item.department;
      this.form.departmentId = props.item.department.id;
      this.modalTitle = "Update Employee";
      this.filterOff = true;
      this.$bvModal.show("modal-standard");
    },
    hideModal() {
      this.$bvModal.hide("modal-standard");
      this.filterOff = false;
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
            .dispatch("employee/DeleteEmployee", props.item.id)
            .then((res) => {
              if (res.status == 204) {
                this.tableData.splice(index, 1);
                this.showToast("Successfully deleted!", "success");
              }
            })
            .catch((err) => {
              this.showToast("Something went wrong!", "error");
            });
        }
      });
    },
    saveAssignedItems(row) {
      var data = [];
      row.categorySelection.forEach((item) => {
        data.push({
          itemCategoryId: item.id,
          applicationUserId: row.applicationUser.id,
        });
      });
      this.$store
        .dispatch("technicalreviewuser/CreateTechnicalReviewUser", data)
        .then((res) => {
          if (res.data.error) {
            return this.showToast(res.data.errorMessage, "error");
          }
          res.data.forEach((item) => {
            var category = this.categories.find((x) => x.id == item.itemCategoryId);
            row.selectedCategory.push({id: item.id, itemCategory: category});
          });
          row.categorySelection = [];
          this.showToast("Successfully assigned!", "success");
        })
        .catch((err) => {
          this.showToast("Something went wrong!", "error");
        });
    },
    removeAssignedItem(row, item) {
      this.$store
        .dispatch("technicalreviewuser/DeleteTechnicalReviewUser", item.id)
        .then((res) => {
          if (res.data.error) {
            return this.showToast(res.data.errorMessage, "error");
          }
          delete item.tid;
          this.categories.push(item);
          row.selectedCategory.splice(row.selectedCategory.indexOf(item), 1);
          this.showToast("Successfully removed!", "success");
        })
        .catch((err) => {
          this.showToast("Something went wrong!", "error");
        });
    },
    view(record) {
      this.accountModal = true;
      this.selectedData = record;
    },
    refresh() {
      this.searchEmployee({ id: this.$store.state.data.deliveryUnit.id });
      this.accountModal = false;
    },
    viewTechnicalCat(row){
      row.toggleDetails();
      this.$store
        .dispatch("technicalreviewuser/GetEmployeeCategories", row.item.id)
        .then((res) => {
          if (res.data.error) {
            return this.showToast(res.data.errorMessage, "error");
          }
          console.log(res.data)
          row.item.selectedCategory = res.data;
        })
        .catch((err) => {
          this.showToast("Something went wrong!", "error");
        });
    }
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <b-modal
      id="modal-standard"
      :title="modalTitle"
      size="lg"
      title-class="font-18"
      hide-footer
      no-close-on-backdrop
    >
      <form @submit.prevent="onCreate" class="needs-validation" ref="fcForm">
        <b-row>
          <b-col>
            <div class="mb-2">
              <label class="m-0" for="firstName">Firstname </label>
              <input
                autocomplete="off"
                id="firstName"
                type="text"
                v-model="form.firstName"
                placeholder="Enter First Name..."
                class="form-control"
                :class="{
                  'is-invalid': submitted && $v.form.firstName.$error,
                }"
              />
              <div v-if="submitted && $v.form.firstName.$error" class="invalid-feedback">
                <span v-if="!$v.form.firstName.required">This value is required.</span>
              </div>
            </div>
            <div class="mb-2">
              <label class="m-0" for="middleName">Middlename </label>
              <input
                autocomplete="off"
                id="middleName"
                type="text"
                v-model="form.middleName"
                placeholder="Enter Middle Name..."
                class="form-control"
              />
            </div>
            <div class="mb-2">
              <label class="m-0" for="lastName">Lastname </label>
              <input
                autocomplete="off"
                id="lastName"
                type="text"
                v-model="form.lastName"
                placeholder="Enter Last Name..."
                class="form-control"
                :class="{
                  'is-invalid': submitted && $v.form.lastName.$error,
                }"
              />
              <div v-if="submitted && $v.form.lastName.$error" class="invalid-feedback">
                <span v-if="!$v.form.lastName.required">This value is required.</span>
              </div>
            </div>
            <div class="mb-2">
              <label class="m-0" for="idNumber">ID Number </label>
              <input
                autocomplete="off"
                id="idNumber"
                type="text"
                v-model="form.idNumber"
                placeholder="Enter ID Number..."
                class="form-control"
                :class="{
                  'is-invalid': submitted && $v.form.idNumber.$error,
                }"
              />
              <div v-if="submitted && $v.form.idNumber.$error" class="invalid-feedback">
                <span v-if="!$v.form.idNumber.required">This value is required.</span>
              </div>
            </div>
            <div class="mb-2">
              <label class="m-0" for="position">Position </label>
              <input
                autocomplete="off"
                id="position"
                type="text"
                v-model="form.position"
                placeholder="Enter Position..."
                class="form-control"
                :class="{
                  'is-invalid': submitted && $v.form.position.$error,
                }"
              />
              <div v-if="submitted && $v.form.position.$error" class="invalid-feedback">
                <span v-if="!$v.form.position.required">This value is required.</span>
              </div>
            </div>
            <div>
              <div class="d-flex">
                <div class="form-check form-checkbox-outline form-check-success mb-0">
                  <input
                    type="checkbox"
                    :id="`customCheckcolor`"
                    class="form-check-input"
                    v-model="form.isFaculty"
                  />
                  <label :for="`customCheckcolor`" class="form-check-label">
                    Is Faculty
                  </label>
                </div>
              </div>
            </div>
          </b-col>
          <b-col>
            <div class="mb-2">
              <label class="m-0" for="lastName">Agency </label>
              <multiselect
                v-model="form.agency"
                :options="agencies"
                label="agencyName"
                @select="searchCampus"
                track-by="id"
                value="id"
                deselect-label=""
                select-label=""
                :allow-empty="false"
                :class="{
                  'is-invalid': submitted && $v.form.agency.$error,
                }"
              />
              <div v-if="submitted && $v.form.agency.$error" class="invalid-feedback">
                <span v-if="!$v.form.agency.required">This value is required.</span>
              </div>
            </div>
            <div class="mb-2">
              <label class="m-0" for="campus">Campus </label>
              <multiselect
                v-model="form.campus"
                :options="campuses"
                label="campusName"
                @select="searchOffice"
                track-by="id"
                value="id"
                deselect-label=""
                select-label=""
                :allow-empty="false"
                :class="{
                  'is-invalid': submitted && $v.form.campus.$error,
                }"
              />
              <div v-if="submitted && $v.form.campus.$error" class="invalid-feedback">
                <span v-if="!$v.form.campus.required">This value is required.</span>
              </div>
            </div>
            <div class="mb-2">
              <label class="m-0" for="office">Office </label>
              <multiselect
                v-model="form.office"
                :options="offices"
                label="name"
                @select="searchDeliveryUnit"
                track-by="id"
                value="id"
                deselect-label=""
                select-label=""
                :allow-empty="false"
                :class="{
                  'is-invalid': submitted && $v.form.office.$error,
                }"
              />
              <div v-if="submitted && $v.form.office.$error" class="invalid-feedback">
                <span v-if="!$v.form.office.required">This value is required.</span>
              </div>
            </div>
            <div class="mb-2">
              <label class="m-0" for="campus">Delivery Unit </label>
              <multiselect
                v-model="form.deliveryUnit"
                :options="dus"
                label="shortName"
                @select="searchDepartment"
                track-by="id"
                value="id"
                deselect-label=""
                select-label=""
                :allow-empty="false"
                :class="{
                  'is-invalid': submitted && $v.form.deliveryUnit.$error,
                }"
              />
              <div
                v-if="submitted && $v.form.deliveryUnit.$error"
                class="invalid-feedback"
              >
                <span v-if="!$v.form.deliveryUnit.required">This value is required.</span>
              </div>
            </div>
            <div class="mb-2">
              <label class="m-0" for="department">Department </label>
              <multiselect
                v-model="form.department"
                :options="departments"
                label="shortName"
                @select="inputDepartment"
                track-by="id"
                value="id"
                :allow-empty="false"
                deselect-label=""
                select-label=""
                :class="{
                  'is-invalid': submitted && $v.form.department.$error,
                }"
              />
              <div v-if="submitted && $v.form.department.$error" class="invalid-feedback">
                <span v-if="!$v.form.department.required">This value is required.</span>
              </div>
            </div>
          </b-col>
        </b-row>
        <div class="modal-footer">
          <button type="submit" class="btn btn-primary">Save changes</button>
          <button type="button" class="btn btn-link" @click="hideModal">Close</button>
        </div>
      </form>
    </b-modal>
    <div class="row">
      <div class="col-12">
        <div class="card border">
          <div class="card-body">
            <div class="row">
              <div class="col-md-6 d-flex align-items-center">
                <h4 class="card-title m-0 text-nowrap me-2">Employee List</h4>
              </div>
              <div class="col-md-6 text-right">
                <div class="d-flex align-items-center float-end">
                  <a
                    href="javascript:void(0);"
                    class="me-4 text-white"
                    @click="showFilter = !showFilter"
                    ><b class="d-flex align-items-center"
                      ><i class="bx bx-filter font-size-18"></i
                      >{{ showFilter ? "Hide" : "Show" }} Filters</b
                    ></a
                  >
                  <button
                    type="button"
                    @click="addEmployee()"
                    class="btn btn-info d-flex align-items-center"
                  >
                    <i class="bx bx-plus fs-6"></i>Create New
                  </button>
                </div>
              </div>
            </div>
            <div class="card mt-3" v-if="showFilter">
              <div class="card-body">
                <div class="card-title">Filters:</div>
                <div class="row">
                  <div class="col-md-3">
                    <label for="agencySelect">Select Agency</label>
                    <b-form-select
                      id="agencySelect"
                      class="form-select"
                      v-model="agencySelect"
                      size="sm"
                      :options="filterAgencies"
                      @change="filteredCampus({ id: $event })"
                    ></b-form-select>
                  </div>
                  <div class="col-md-3" v-if="agencySelect > 0">
                    <label for="campusSelect">Select Campus</label>
                    <b-form-select
                      id="campusSelect"
                      class="form-select"
                      v-model="campusSelect"
                      size="sm"
                      :options="filterCampuses"
                      @change="filteredOffice({ id: $event })"
                    ></b-form-select>
                  </div>
                  <div class="col-md-3" v-if="campusSelect > 0">
                    <label for="officeSelect">Select Office</label>
                    <b-form-select
                      id="officeSelect"
                      class="form-select"
                      v-model="officeSelect"
                      size="sm"
                      :options="filterOffices"
                      @change="
                        filteredDeliveryUnit({
                          id: $event,
                        })
                      "
                    ></b-form-select>
                  </div>
                  <div class="col-md-3" v-if="officeSelect > 0">
                    <label for="duSelect">Select Delivery Unit</label>
                    <b-form-select
                      id="duSelect"
                      class="form-select"
                      v-model="duSelect"
                      size="sm"
                      :options="filterDUs"
                      @change="
                        searchEmployee({
                          id: $event,
                        })
                      "
                    ></b-form-select>
                  </div>
                </div>
              </div>
            </div>
            <div class="row mt-4">
              <div class="col-sm-12 col-md-6">
                <div id="tickets-table_length" class="dataTables_length">
                  <label class="d-inline-flex align-items-center">
                    Show&nbsp;
                    <b-form-select
                      class="form-select form-select-sm"
                      v-model="perPage"
                      size="sm"
                      :options="pageOptions"
                    ></b-form-select
                    >&nbsp;entries
                  </label>
                </div>
              </div>
              <!-- Search -->
              <div class="col-sm-12 col-md-6">
                <div id="tickets-table_filter" class="dataTables_filter text-md-end">
                  <label class="d-inline-flex align-items-center">
                    Search:
                    <b-form-input
                      autocomplete="off"
                      v-model="filter"
                      type="search"
                      placeholder="Search..."
                      class="form-control form-control-sm ms-2"
                    ></b-form-input>
                  </label>
                </div>
              </div>
              <!-- End search -->
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
                hover
                striped
                show-empty
              >
                <template #empty="scope">
                  <div class="text-center">
                    {{ scope.emptyText }}
                  </div>
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
                <template #cell(employee)="row">
                  <div class="d-flex align-items-center">
                    <div class="avatar-sm me-2">
                      <span
                        class="avatar-title rounded-circle bg-soft bg-primary text-primary font-size-16"
                        >{{ row.item.firstName.charAt(0).toUpperCase()
                        }}{{ row.item.lastName.charAt(0).toUpperCase() }}</span
                      >
                    </div>
                    <div>
                      <div class="mt-1">
                        <h5 class="mb-0">
                          {{
                            row.item.lastName.charAt(0).toUpperCase() +
                            row.item.lastName.slice(1)
                          }},
                          {{
                            row.item.firstName.charAt(0).toUpperCase() +
                            row.item.firstName.slice(1)
                          }}
                          {{
                            row.item.middleName
                              ? `${row.item.middleName.charAt(0).toUpperCase()}.`
                              : ""
                          }}
                        </h5>
                      </div>
                      <div>{{ row.item.position }}</div>
                      <i>{{ row.item.idNumber }}</i>
                    </div>
                  </div>
                </template>
                <template #cell(designation)="row">
                  <div>
                    <b class="text-white">{{
                      row.item.department.deliveryUnit.office.campus.agency.agencyName
                    }}</b>
                    <ul class="m-0 ps-4">
                      <li>
                        {{ row.item.department.deliveryUnit.office.campus.campusName }}
                        <ul class="m-0 ps-2">
                          <li>
                            {{ row.item.department.deliveryUnit.office.name }}
                            <ul class="m-0 ps-0" style="list-style-type: '→'">
                              <li>
                                <span class="badge bg-success font-size-12 ms-1">{{
                                  row.item.department.deliveryUnit.name
                                }}</span>
                              </li>
                            </ul>
                          </li>
                        </ul>
                      </li>
                    </ul>
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
                      <b-dropdown-item variant="info" @click="view(row.item)"
                        ><i class="bx bx-user-circle font-size-18 me-1"></i>View
                        Account</b-dropdown-item
                      >
                      <b-dropdown-item @click="updateItem(row)" variant="dark"
                        ><i class="bx bx-edit font-size-18 me-1"></i>Edit</b-dropdown-item
                      >
                      <b-dropdown-item @click="deleteItem(row)" variant="danger"
                        ><i class="mdi mdi-trash-can font-size-18 me-1"></i
                        >Delete</b-dropdown-item
                      >
                      <b-dropdown-item @click="viewTechnicalCat(row)" variant="dark"
                        ><i class="bx bx-menu-alt-left font-size-18 me-1"></i>View
                        Technical Categories</b-dropdown-item
                      >
                    </b-dropdown>
                  </div>
                </template>
                <template #row-details="row">
                  <div class="p-3 border border-primary">
                    <div class="row">
                      <div class="col-md-6">
                        <h4 class="font-size-15">Assigned Item Category</h4>
                      </div>
                      <div class="col-md-6 text-right">
                        <i
                          title="Hide Details"
                          class="font-size-18 bx bx-x cursor-pointer"
                          @click="row.toggleDetails"
                        ></i>
                      </div>
                    </div>
                    <div class="mb-2" v-if="row.item.catLoading">
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
                    </div>
                    <div class="mb-2" v-if="!row.item.catLoading && row.item.selectedCategory.length > 0">
                      <span
                        class="multiselect__tag"
                        v-for="x in row.item.selectedCategory"
                        :key="x.id"
                        ><span>{{ x.itemCategory.name }}</span>
                        <i
                          class="multiselect__tag-icon"
                          @click="removeAssignedItem(row.item, x)"
                        ></i
                      ></span>
                    </div>
                    <div class="row mt-2">
                      <div class="col-md-10">
                        <multiselect
                          v-model="row.item.categorySelection"
                          :options="categories"
                          label="name"
                          track-by="id"
                          value="id"
                          :allow-empty="true"
                          :close-on-select="false"
                          :clear-on-select="true"
                          :preserve-search="true"
                          :multiple="true"
                          :hide-selected="true"
                          placeholder="No Item Category Found. Select some Item Category"
                        />
                      </div>
                      <div class="col-md-2 d-flex align-items-center">
                        <button
                          class="btn btn-primary btn-block"
                          type="button"
                          @click="saveAssignedItems(row.item)"
                        >
                          <i class="bx bx-save"></i>Save Changes
                        </button>
                      </div>
                    </div>
                  </div>
                </template>
              </b-table>
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
          </div>
        </div>
      </div>
    </div>
    <!-- Modals -->
    <b-modal v-model="accountModal" hide-footer>
      <UserACcount :record="selectedData" @close="refresh" />
    </b-modal>
    <!-- Modals -->
  </Layout>
</template>
