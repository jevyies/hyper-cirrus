<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import Swal from "sweetalert2";
import { cloneDeep } from "lodash";
import { required, maxLength } from "vuelidate/lib/validators";
import PrexcClassification from '@/components/modals/prexc-classification.vue';

export default {
    page: {
        title: "Prexc",
    },
    components: {
        Layout,
        PageHeader,
        PrexcClassification,
    },
    data() {
        return {
            title: "Prexc",
            submitted: false,
            items: [
                {
                    text: "Dashboards",
                    href: "/",
                },
                {
                    text: "Outcomes",
                    href: "/planning/outcome",
                },
                {
                    text: "Prexc",
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
            sortBy: "cluster",
            sortDesc: false,
            fields: [
                {
                    key: "prexcName",
                    sortable: true,
                },
                {
                    key: "prexcClassification.classification",
                    sortable: true,
                    label: "Classification",
                },
                {
                    key: "uacs",
                    sortable: true,
                    label: "UACS",
                },
                {
                    key: "actions",
                },
            ],
            form: {
                id: 0,
                uacs: "",
                prexcName: "",
                prexcClassificationId: null,
                outcomeId: this.$route.params.id,
            },
            indexSelected: -1,
            tableBusy: false,
            prexClass: [],
            prexcClassification: ""
        };
    },
    validations: {
        form: {
            prexcName: { required, maxLength: maxLength(500) },
            uacs: { required },
            prexcClassificationId: { required },
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
            .dispatch("prexc/GetPrexcByOutcome", this.$route.params.id)
            .then((res) => {
                this.tableBusy = false;
                this.tableData = res.data;
            })
            .catch(() => {
                this.tableBusy = false;
                this.showToast("Something went wrong!","error");
            });
    },
    methods: {
        onFiltered(filteredItems) {
            this.totalRows = filteredItems.length;
            this.currentPage = 1;
        },
        addPrexc() {
            this.onReset();
            this.modalTitle = "Create New Prexc";
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
                        .dispatch("prexc/UpdatePrexc", this.form)
                        .then((res) => {
                            this.tableData.splice(
                                this.indexSelected,
                                1,
                                res.data
                            );
                            this.$bvModal.hide("modal-standard");
                            this.showToast("Successfully updated!","success");
                        })
                        .catch((err) => {
                            this.showToast("Something went wrong!","error");
                        });
                } else {
                    this.$store
                        .dispatch("prexc/CreatePrexc", this.form)
                        .then((res) => {
                            this.tableData.push(res.data);
                            this.$bvModal.hide("modal-standard");
                            this.showToast("Successfully created!","success");
                        })
                        .catch((err) => {
                            this.showToast("Something went wrong!","error");
                        });
                }
                this.submitted = false;
            }
        },
        onReset() {
            this.form = {
                id: 0,
                uacs: "",
                prexcName: "",
                prexcClassificationId: null,
                outcomeId: this.$route.params.id,
            };
            this.prexcClassification = ""
        },
        updateItem(props) {
            this.form = cloneDeep(props.item);
            this.prexcClassification = props.item.prexcClassification.classification;
            this.indexSelected = this.tableData.indexOf(props.item);
            this.modalTitle = "Update Prexc";
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
                        .dispatch("prexc/DeletePrexc", props.item.id)
                        .then((res) => {
                            if (res.status == 204) {
                                this.tableData.splice(index, 1);
                                this.showToast("Successfully deleted!","success");
                            }
                        })
                        .catch((err) => {
                            this.showToast("Cannot be deleted!","error");
                        });
                }
            });
        },
        getPc() {
            this.$bvModal.show("prexc-classification-modal");
        },
        dropPrexcClass(data){
            this.form.prexcClassificationId = data.id;
            this.prexcClassification = data.classification;
        }
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
                                @click="addPrexc()"
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
                                        <label for="prexcName"
                                            >Prexc Name
                                        </label>
                                        <textarea
                                            id="prexcName"
                                            rows="3"
                                            v-model="form.prexcName"
                                            placeholder="Enter Prexc Name..."
                                            class="form-control"
                                            :class="{
                                                'is-invalid':
                                                    submitted &&
                                                    $v.form.prexcName.$error,
                                            }"
                                        ></textarea>
                                        <div
                                            v-if="
                                                submitted &&
                                                $v.form.prexcName.$error
                                            "
                                            class="invalid-feedback"
                                        >
                                            <span
                                                v-if="
                                                    !$v.form.prexcName.required
                                                "
                                                >This value is required.</span
                                            >
                                            <span
                                                v-if="
                                                    !$v.form.prexcName.maxLength
                                                "
                                            >
                                                This value is too long. It
                                                should have 500 characters or
                                                fewer.
                                            </span>
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label for="prexcClass"
                                            >Prexc Classification
                                        </label>
                                        <!-- <b-form-select
                                            class="form-select "
                                            v-model="form.prexcClassificationId"
                                            size="sm"
                                            :options="prexClass"
                                            :class="{
                                                'is-invalid':
                                                    submitted &&
                                                    $v.form
                                                        .prexcClassificationId
                                                        .$error,
                                            }"
                                        ></b-form-select> -->
                                        <b-input-group>
                                            <template #append>
                                                <b-button
                                                    @click="getPc()"
                                                    variant="outline-info"
                                                    ><i
                                                        class="
                                                            mdi
                                                            mdi-clipboard-text-search-outline
                                                        "
                                                    ></i
                                                ></b-button>
                                            </template>
                                            <input
                                                autocomplete="off"
                                                type="text"
                                                disabled
                                                placeholder="Search Prexc Classification..."
                                                class="form-control"
                                                v-model="prexcClassification"
                                            />
                                        </b-input-group>
                                        <div
                                            v-if="
                                                submitted &&
                                                $v.form.prexcClassificationId
                                                    .$error
                                            "
                                            class="invalid-feedback"
                                        >
                                            <span
                                                v-if="
                                                    !$v.form
                                                        .prexcClassificationId
                                                        .required
                                                "
                                                >This value is required.</span
                                            >
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label for="uacs">UACS </label>
                                        <input
                                            autocomplete="off"
                                            id="uacs"
                                            rows="3"
                                            type="text"
                                            v-model="form.uacs"
                                            placeholder="Enter UACS..."
                                            class="form-control"
                                            :class="{
                                                'is-invalid':
                                                    submitted &&
                                                    $v.form.uacs.$error,
                                            }"
                                        />
                                        <div
                                            v-if="
                                                submitted && $v.form.uacs.$error
                                            "
                                            class="invalid-feedback"
                                        >
                                            <span v-if="!$v.form.uacs.required"
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
        <prexc-classification @dropData="dropPrexcClass($event)"></prexc-classification>
    </Layout>
</template>