<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import Swal from "sweetalert2";
import { cloneDeep } from "lodash";
import { required } from "vuelidate/lib/validators";
import Multiselect from "vue-multiselect";
import phil from "phil-reg-prov-mun-brgy";

export default {
    page: {
        title: "Campus",
    },
    components: {
        Layout,
        PageHeader,
        Multiselect,
    },
    data() {
        return {
            title: "Campus",
            submitted: false,
            items: [
                {
                    text: "Dashboards",
                    href: "/",
                },
                {
                    text: "Agency",
                    href: "/administration/agency",
                },
                {
                    text: "Campus",
                    active: true,
                },
            ],
            tableData: [],
            regionSelection: phil.regions,
            provinceSelection: [],
            citySelection: [],
            barangaySelection: [],
            modalTitle: "",
            totalRows: 1,
            currentPage: 1,
            perPage: 10,
            pageOptions: [10, 25, 50, 100],
            filter: null,
            filterOn: [],
            sortBy: "id",
            sortDesc: false,
            fields: [
                {
                    key: "id",
                    sortable: true,
                    label: "ID",
                    thStyle: {width: "80px"},
                },
                {
                    key: "campusName",
                    sortable: true,
                    label: "Campus Name",
                },
                {
                    key: "shortName",
                    sortable: true,
                    label: "Short Name",
                },
                {
                    key: "location",
                    sortable: true,
                    label: "Location",
                },
                {
                    key: "actions",
                },
            ],
            form: {
                id: 0,
                campusName: "",
                shortName: "",
                barangay: "",
                city: "",
                province: "",
                region: "",
                zipcode: "",
                agencyId: this.$route.params.id,
            },
            barangay: {},
            city: {},
            province: {},
            region: {},
            indexSelected: -1,
            tableBusy: false,
        };
    },
    validations: {
        form: {
            campusName: { required },
            shortName: { required },
            barangay: { required },
            city: { required },
            province: { required },
            region: { required },
            zipcode: { required },
        },
    },
    computed: {
        rows() {
            return this.tableData.length;
        },
    },
    created() {
        this.totalRows = this.items.length;
        this.tableBusy = true;
        this.$store
            .dispatch("agency/GetSingleAgency", this.$route.params.id)
            .then((res) => {
                this.title = res.data.agencyShortName + " Campuses";
            })
            .catch(() => {
                this.showToast('Something went wrong!', 'error');
            });
        this.$store
            .dispatch("campus/GetCampusByAgency", this.$route.params.id)
            .then((res) => {
                res.data.forEach((item) => {
                    item.location = `${item.barangay}, ${item.city}, ${item.province}, ${item.region}, ${item.zipcode}`;
                });
                this.tableData = res.data;
                this.tableBusy = false;
            })
            .catch(() => {
                this.showToast('Something went wrong!', 'error');
                this.tableBusy = false;
            });
    },
    methods: {
        onFiltered(filteredItems) {
            this.totalRows = filteredItems.length;
            this.currentPage = 1;
        },
        addCampus() {
            this.onReset();
            this.modalTitle = "Create New Campus";
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
                        .dispatch("campus/UpdateCampus", this.form)
                        .then((res) => {
                            if(res.data.error){
                                return this.showToast(res.data.errorMessage, 'error');
                            }
                            res.data.location = `${res.data.barangay}, ${res.data.city}, ${res.data.province}, ${res.data.region}, ${res.data.zipcode}`;
                            this.tableData.splice(
                                this.indexSelected,
                                1,
                                res.data
                            );
                            this.$bvModal.hide("modal-standard");
                            this.showToast("Successfully updated!", 'success');
                        })
                        .catch((err) => {
                            this.showToast("Something went wrong!", 'error');
                        });
                } else {
                    this.$store
                        .dispatch("campus/CreateCampus", this.form)
                        .then((res) => {
                            if(res.data.error){
                                return this.showToast(res.data.errorMessage, 'error');
                            }
                            res.data.location = `${res.data.barangay}, ${res.data.city}, ${res.data.province}, ${res.data.region}, ${res.data.zipcode}`;
                            this.tableData.push(res.data);
                            this.$bvModal.hide("modal-standard");
                            this.showToast("Successfully created!", 'success');
                        })
                        .catch((err) => {
                            this.showToast("Something went wrong!", 'error');
                        });
                }
                this.submitted = false;
            }
        },
        onReset() {
            (this.form = {
                id: 0,
                campusName: "",
                shortName: "",
                barangay: "",
                city: "",
                province: "",
                region: "",
                zipcode: "",
                agencyId: this.$route.params.id,
            }),
                (this.city = "");
            this.barangay = "";
            this.shortName = "";
            this.region = "";
            this.province = "";
        },
        updateItem(props) {
            this.form = cloneDeep(props.item);
            this.indexSelected = this.tableData.indexOf(props.item);
            var regionSelected = phil.regions.find(
                (x) => x.name === props.item.region
            );
            this.region = regionSelected;

            var provinceSelected = phil.provinces.find(
                (x) => x.name === props.item.province
            );
            this.province = provinceSelected;
            this.provinceSelection = provinceSelected
                ? phil.getProvincesByRegion(provinceSelected.reg_code)
                : [];

            var citySelected = phil.city_mun.find(
                (x) => x.name === props.item.city
            );
            this.city = citySelected;
            this.citySelection = citySelected
                ? phil.getCityMunByProvince(citySelected.prov_code)
                : [];

            var barangaySelected = phil.barangays.find(
                (x) => x.name === props.item.barangay
            );
            this.barangay = barangaySelected;
            this.barangaySelection = barangaySelected
                ? phil.getBarangayByMun(barangaySelected.mun_code)
                : [];

            this.modalTitle = "Update Campus";
            this.$bvModal.show("modal-standard");
        },
        hideModal() {
            this.$bvModal.hide("modal-standard");
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
                        .dispatch("campus/DeleteCampus", props.item.id)
                        .then((res) => {
                            if (res.status == 204) {
                                this.tableData.splice(index, 1);
                                this.showToast("Successfully deleted!", 'success');
                            }
                        })
                        .catch((err) => {
                            this.showToast("Something went wrong!", 'error');
                        });
                }
            });
        },
        getProvince(value) {
            this.form.region = value.name;
            this.provinceSelection = phil.getProvincesByRegion(value.reg_code);
        },
        getCity(value) {
            this.form.province = value.name;
            this.citySelection = phil.getCityMunByProvince(value.prov_code);
        },
        getBarangays(value) {
            this.form.city = value.name;
            this.barangaySelection = phil.getBarangayByMun(value.mun_code);
        },
        getName(value) {
            this.form.barangay = value.name;
        },
        viewOffice(id) {
            this.$router.push(`/administration/office/${id}`);
        },
    },
};
</script>

<template>
    <Layout>
        <PageHeader :title="title" :items="items" />
        <div class="row">
            <div class="col-12">
                <div
                    class="
                        card
                        border
                    "
                >
                    <div class="card-body">
                        <div
                            class="
                                d-flex
                                justify-content-between
                                align-items-center
                            "
                        >
                            <h4 class="card-title m-0">Table List</h4>
                            <button
                                type="button"
                                @click="addCampus()"
                                class="
                                    btn btn-md btn-info
                                    d-flex
                                    align-items-center
                                "
                            >
                                <i class="bx bx-plus fs-6"></i>Create New
                            </button>
                            <b-modal
                                id="modal-standard"
                                :title="modalTitle"
                                size="md"
                                title-class="font-18"
                                hide-footer
                                no-close-on-backdrop
                            >
                                <form
                                    @submit.prevent="onCreate"
                                    class="needs-validation"
                                    ref="fcForm"
                                >
                                    <div class="mb-3">
                                        <label for="campusName"
                                            >Campus Name
                                        </label>
                                        <input
                                            autocomplete="off"
                                            id="campusName"
                                            type="text"
                                            v-model="form.campusName"
                                            placeholder="Enter Campus Name..."
                                            class="form-control"
                                            :class="{
                                                'is-invalid':
                                                    submitted &&
                                                    $v.form.campusName.$error,
                                            }"
                                        />
                                        <div
                                            v-if="
                                                submitted &&
                                                $v.form.campusName.$error
                                            "
                                            class="invalid-feedback"
                                        >
                                            <span
                                                v-if="
                                                    !$v.form.campusName.required
                                                "
                                                >This value is required.</span
                                            >
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label for="shortName"
                                            >Campus Short Name
                                        </label>
                                        <input
                                            autocomplete="off"
                                            id="shortName"
                                            type="text"
                                            v-model="form.shortName"
                                            placeholder="Enter Campus Short Name..."
                                            class="form-control"
                                            :class="{
                                                'is-invalid':
                                                    submitted &&
                                                    $v.form.shortName.$error,
                                            }"
                                        />
                                        <div
                                            v-if="
                                                submitted &&
                                                $v.form.shortName.$error
                                            "
                                            class="invalid-feedback"
                                        >
                                            <span
                                                v-if="
                                                    !$v.form.shortName.required
                                                "
                                                >This value is required.</span
                                            >
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label for="region">Region </label>
                                        <multiselect
                                            v-model="region"
                                            :options="regionSelection"
                                            label="name"
                                            id="region"
                                            @select="getProvince"
                                            :class="{
                                                'is-invalid':
                                                    submitted &&
                                                    $v.form.region.$error,
                                            }"
                                        ></multiselect>
                                        <div
                                            v-if="
                                                submitted &&
                                                $v.form.region.$error
                                            "
                                            class="invalid-feedback"
                                        >
                                            <span
                                                v-if="!$v.form.region.required"
                                                >This value is required.</span
                                            >
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label for="province">Province </label>
                                        <multiselect
                                            v-model="province"
                                            :options="provinceSelection"
                                            label="name"
                                            @select="getCity"
                                            id="province"
                                            :class="{
                                                'is-invalid':
                                                    submitted &&
                                                    $v.form.province.$error,
                                            }"
                                        ></multiselect>
                                        <div
                                            v-if="
                                                submitted &&
                                                $v.form.province.$error
                                            "
                                            class="invalid-feedback"
                                        >
                                            <span
                                                v-if="
                                                    !$v.form.province.required
                                                "
                                                >This value is required.</span
                                            >
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label for="city">City </label>
                                        <multiselect
                                            v-model="city"
                                            :options="citySelection"
                                            label="name"
                                            id="city"
                                            @select="getBarangays"
                                            :class="{
                                                'is-invalid':
                                                    submitted &&
                                                    $v.form.city.$error,
                                            }"
                                        ></multiselect>
                                        <div
                                            v-if="
                                                submitted && $v.form.city.$error
                                            "
                                            class="invalid-feedback"
                                        >
                                            <span v-if="!$v.form.city.required"
                                                >This value is required.</span
                                            >
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label for="barangay">Barangay </label>
                                        <multiselect
                                            v-model="barangay"
                                            :options="barangaySelection"
                                            label="name"
                                            id="barangay"
                                            @select="getName"
                                            :class="{
                                                'is-invalid':
                                                    submitted &&
                                                    $v.form.barangay.$error,
                                            }"
                                        ></multiselect>
                                        <div
                                            v-if="
                                                submitted &&
                                                $v.form.barangay.$error
                                            "
                                            class="invalid-feedback"
                                        >
                                            <span
                                                v-if="
                                                    !$v.form.barangay.required
                                                "
                                                >This value is required.</span
                                            >
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label for="zipcode">Zipcode </label>
                                        <input
                                            autocomplete="off"
                                            id="zipcode"
                                            type="text"
                                            v-model="form.zipcode"
                                            placeholder="Enter Zipcode..."
                                            class="form-control"
                                            :class="{
                                                'is-invalid':
                                                    submitted &&
                                                    $v.form.zipcode.$error,
                                            }"
                                        />
                                        <div
                                            v-if="
                                                submitted &&
                                                $v.form.zipcode.$error
                                            "
                                            class="invalid-feedback"
                                        >
                                            <span
                                                v-if="!$v.form.zipcode.required"
                                                >This value is required.</span
                                            >
                                        </div>
                                    </div>
                                    <div class="modal-footer">
                                        <button
                                            type="submit"
                                            class="btn btn-primary"
                                        >
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
                        <div class="row mt-4">
                            <div class="col-sm-12 col-md-6">
                                <div
                                    id="tickets-table_length"
                                    class="dataTables_length"
                                >
                                    <label
                                        class="d-inline-flex align-items-center"
                                    >
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
                                <div
                                    id="tickets-table_filter"
                                    class="dataTables_filter text-md-end"
                                >
                                    <label
                                        class="d-inline-flex align-items-center"
                                    >
                                        Search:
                                        <b-form-input
                                            autocomplete="off"
                                            v-model="filter"
                                            type="search"
                                            placeholder="Search..."
                                            class="
                                                form-control form-control-sm
                                                ms-2
                                            "
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
                                    <div class="text-center">{{ scope.emptyText }}</div>
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
                                                <div
                                                    class="
                                                        spinner-chase
                                                        w-20px
                                                        h-20px
                                                    "
                                                >
                                                    <div
                                                        class="chase-dot"
                                                    ></div>
                                                    <div
                                                        class="chase-dot"
                                                    ></div>
                                                    <div
                                                        class="chase-dot"
                                                    ></div>
                                                    <div
                                                        class="chase-dot"
                                                    ></div>
                                                    <div
                                                        class="chase-dot"
                                                    ></div>
                                                    <div
                                                        class="chase-dot"
                                                    ></div>
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
                                                <i
                                                    class="fas fa-ellipsis-v"
                                                ></i>
                                            </template>
                                            <b-dropdown-item
                                                @click="viewOffice(row.item.id)"
                                                variant="secondary"
                                                ><i
                                                    class="
                                                        mdi mdi-view-list
                                                        font-size-18
                                                        me-1
                                                    "
                                                ></i
                                                >View Offices</b-dropdown-item
                                            >
                                            <b-dropdown-item
                                                @click="updateItem(row)"
                                                variant="secondary"
                                                ><i
                                                    class="
                                                        mdi mdi-update
                                                        font-size-18
                                                        me-1
                                                    "
                                                ></i
                                                >Edit</b-dropdown-item
                                            >
                                            <b-dropdown-item
                                                @click="deleteItem(row)"
                                                variant="danger"
                                                ><i
                                                    class="
                                                        mdi mdi-trash-can
                                                        font-size-18
                                                        me-1
                                                    "
                                                ></i
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
                                    class="
                                        dataTables_paginate
                                        paging_simple_numbers
                                        float-end
                                    "
                                >
                                    <ul
                                        class="
                                            pagination pagination-rounded
                                            mb-0
                                        "
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
            </div>
        </div>
    </Layout>
</template>