<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import Swal from "sweetalert2";
import { cloneDeep } from "lodash";
import { required } from "vuelidate/lib/validators";

export default {
    page: {
        title: "Agency",
    },
    components: {
        Layout,
        PageHeader,
    },
    data() {
        return {
            title: "Agencies",
            submitted: false,
            items: [
                {
                    text: "Dashboards",
                    href: "/",
                },
                {
                    text: "Agency",
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
                    key: "agencyName",
                    sortable: true,
                    label: "Agency Name",
                },
                {
                    key: "agencyShortName",
                    sortable: true,
                    label: "Short Name",
                },
                {
                    key: "organizationCode",
                    sortable: true,
                    label: "Code",
                },
                {
                    key: "uacs",
                    sortable: true,
                    label: "UACS",
                },
                {
                    key: "operatingUnit",
                    sortable: true,
                    label: "Operating Unit",
                },
                {
                    key: "department",
                    sortable: true,
                    label: "Department",
                },
                {
                    key: "actions",
                     thStyle: {width: "90px"},
                },
            ],
            form: {
                id: 0,
                agencyName: "",
                agencyShortName: "",
                organizationCode: "",
                uacs: "",
                operatingUnit: "",
                department: "",
            },
            indexSelected: -1,
            tableBusy: false,
        };
    },
    validations: {
        form: {
            agencyName: { required },
            agencyShortName: { required },
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
            .dispatch("agency/GetAgency")
            .then((res) => {
                this.tableData = res.data;
                this.tableBusy = false;
            })
            .catch(() => {
                this.tableBusy = false;
                this.showToast('Something went wrong!', 'error');
            });
    },
    methods: {
        onFiltered(filteredItems) {
            this.totalRows = filteredItems.length;
            this.currentPage = 1;
        },
        addAgency() {
            this.onReset();
            this.modalTitle = "Create New Agency";
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
                        .dispatch("agency/UpdateAgency", this.form)
                        .then((res) => {
                            if(res.data.error){
                                return this.showToast(res.data.errorMessage, 'error');
                            }
                            this.tableData.splice(
                                this.indexSelected,
                                1,
                                res.data
                            );
                            this.showToast('Successfully updated!', 'success');
                            this.$bvModal.hide("modal-standard");
                        })
                        .catch((err) => {
                            this.showToast('Something went wrong!', 'error');
                        });
                } else {
                    this.$store
                        .dispatch("agency/CreateAgency", this.form)
                        .then((res) => {
                            if(res.data.error){
                                return this.showToast(res.data.errorMessage, 'error');
                            }
                            this.tableData.push(res.data);
                            this.$bvModal.hide("modal-standard");
                            this.showToast('Successfully created!', 'success');
                        })
                        .catch((err) => {
                            this.showToast('Something went wrong!', 'error');
                        });
                }
                this.submitted = false;
            }
        },
        onReset() {
            this.form = {
                id: 0,
                agencyName: "",
                agencyShortName: "",
                organizationCode: "",
                uacs: "",
                operatingUnit: "",
                department: "",
            };
        },
        updateItem(props) {
            this.form = cloneDeep(props.item);
            this.indexSelected = this.tableData.indexOf(props.item);
            this.modalTitle = "Update Agency";
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
                        .dispatch("agency/DeleteAgency", props.item.id)
                        .then((res) => {
                            if (res.status == 204) {
                                this.tableData.splice(index, 1);
                                this.showToast('Successfully deleted', 'success');
                            }
                        })
                        .catch((err) => {
                            this.showToast('Cannot be deleted', 'error');
                        });
                }
            });
        },
        viewCampus(id) {
            this.$router.push(`/administration/campus/${id}`);
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
                                @click="addAgency()"
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
                                        <label for="agencyName"
                                            >Agency Name
                                        </label>
                                        <input
                                            id="agencyName"
                                            type="text"
                                            v-model="form.agencyName"
                                            placeholder="Enter Agency Name..."
                                            class="form-control"
                                            :class="{
                                                'is-invalid':
                                                    submitted &&
                                                    $v.form.agencyName.$error,
                                            }"
                                            autocomplete="off"
                                        />
                                        <div
                                            v-if="
                                                submitted &&
                                                $v.form.agencyName.$error
                                            "
                                            class="invalid-feedback"
                                        >
                                            <span
                                                v-if="
                                                    !$v.form.agencyName.required
                                                "
                                                >This value is required.</span
                                            >
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label for="agencyShortName"
                                            >Agency Short Name
                                        </label>
                                        <input
                                            autocomplete="off"
                                            id="agencyShortName"
                                            type="text"
                                            v-model="form.agencyShortName"
                                            placeholder="Enter Agency Short Name..."
                                            class="form-control"
                                            :class="{
                                                'is-invalid':
                                                    submitted &&
                                                    $v.form.agencyShortName
                                                        .$error,
                                            }"
                                            
                                        />
                                        <div
                                            v-if="
                                                submitted &&
                                                $v.form.agencyShortName.$error
                                            "
                                            class="invalid-feedback"
                                        >
                                            <span
                                                v-if="
                                                    !$v.form.agencyShortName
                                                        .required
                                                "
                                                >This value is required.</span
                                            >
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label for="organizationCode"
                                            >Organization Code
                                        </label>
                                        <input
                                            autocomplete="off"
                                            id="organizationCode"
                                            type="text"
                                            v-model="form.organizationCode"
                                            placeholder="Enter Organization Code..."
                                            class="form-control"
                                            
                                        />
                                        <!-- :class="{
                                                'is-invalid':
                                                    submitted &&
                                                    $v.form.organizationCode
                                                        .$error,
                                            }"
                                        <div
                                            v-if="
                                                submitted &&
                                                $v.form.organizationCode.$error
                                            "
                                            class="invalid-feedback"
                                        >
                                            <span
                                                v-if="
                                                    !$v.form.organizationCode
                                                        .required
                                                "
                                                >This value is required.</span
                                            >
                                        </div> -->
                                    </div>
                                    <div class="mb-3">
                                        <label for="uacs">UACS </label>
                                        <input
                                            autocomplete="off"
                                            id="uacs"
                                            type="text"
                                            v-model="form.uacs"
                                            placeholder="Enter UACS..."
                                            class="form-control"
                                            
                                        />
                                    </div>
                                    <div class="mb-3">
                                        <label for="operatingUnit"
                                            >Operating Unit
                                        </label>
                                        <input
                                            autocomplete="off"
                                            id="operatingUnit"
                                            type="text"
                                            v-model="form.operatingUnit"
                                            placeholder="Enter Operating Unit..."
                                            class="form-control"
                                            
                                        />
                                    </div>
                                    <div class="mb-3">
                                        <label for="department"
                                            >Department
                                        </label>
                                        <input
                                            autocomplete="off"
                                            id="department"
                                            type="text"
                                            v-model="form.department"
                                            placeholder="Enter Department..."
                                            class="form-control"
                                            
                                        />
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
                                                @click="viewCampus(row.item.id)"
                                                variant="secondary"
                                                ><i
                                                    class="
                                                        mdi mdi-view-list
                                                        font-size-18
                                                        me-1
                                                    "
                                                ></i
                                                >View Campuses</b-dropdown-item
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