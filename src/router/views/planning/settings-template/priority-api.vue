<script>
import Swal from "sweetalert2";
import { cloneDeep } from "lodash";
import { required } from "vuelidate/lib/validators";
import ApiType from "@/components/modals/api-type.vue";

export default {
    page: {
        title: "API Template",
    },
    components: {
        ApiType,
    },
    data() {
        return {
            title: "API Template",
            submitted: false,
            items: [
                {
                    text: "Dashboards",
                    href: "/",
                },
                {
                    text: "API Template",
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
                    key: "name",
                    sortable: true,
                },
                {
                    key: "description",
                    sortable: true,
                },
                {
                    key: "apiType.type",
                    sortable: true,
                    label: "Type"
                },
                {
                    key: "actions",
                    thStyle: { width: "100px" },
                },
            ],
            form: {
                id: 0,
                name: "",
                description: "",
                apiTypeId: "",
            },
            indexSelected: -1,
            tableBusy: false,
            apiType: {},
        };
    },
    validations: {
        form: {
            name: { required },
            description: { required },
            apiTypeId: { required },
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
            .dispatch("apitemplate/GetPriorityApiTemplate")
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
        addFC() {
            this.onReset();
            this.modalTitle = "Create New API Template";
            this.$bvModal.show("api-template-modal");
        },
        onCreate() {
            this.submitted = true;
            this.$v.$touch();
            if (this.$v.$invalid) {
                return;
            } else {
                var data = cloneDeep(this.form);
                if (this.form.id > 0) {
                    this.$store
                        .dispatch("apitemplate/UpdatePriorityApiTemplate", data)
                        .then((res) => {
                            res.data.apiType = cloneDeep(this.apiType)
                            this.tableData.splice(
                                this.indexSelected,
                                1,
                                res.data
                            );
                            this.$bvModal.hide("api-template-modal");
                            this.showToast("Successfully updated","success");
                        })
                        .catch(() => {
                            this.showToast("Something went wrong!","error");
                        });
                } else {
                    this.$store
                        .dispatch("apitemplate/CreatePriorityApiTemplate", data)
                        .then((res) => {
                            res.data.apiType = cloneDeep(this.apiType)
                            this.tableData.push(res.data);
                            this.$bvModal.hide("api-template-modal");
                            this.showToast("Successfully created","success");
                        })
                        .catch(() => {
                            this.showToast("Something went wrong!","error");
                        });
                }
                this.submitted = false;
            }
        },
        onReset() {
            this.form = {
                id: 0,
                name: "",
                description: "",
                isCatchUp: false,
                apiTypeId: "",
            };
            this.apiType = {};
        },
        updateItem(props) {
            this.form = cloneDeep(props.item);
            this.form.dateCompleted = new Date(props.item.dateCompleted);
            this.apiType = props.item.apiType;
            this.indexSelected = this.tableData.indexOf(props.item);
            this.modalTitle = "Update API Template";
            this.$bvModal.show("api-template-modal");
        },
        hideModal() {
            this.$bvModal.hide("api-template-modal");
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
                        .dispatch("apitemplate/DeletePriorityApiTemplate", props.item.id)
                        .then((res) => {
                            if (res.status == 204) {
                                this.tableData.splice(index, 1);
                                this.showToast("Successfully deleted","success");
                            }
                        })
                        .catch(() => {
                            this.showToast("Cannot be deleted!","error");
                        });
                }
            });
        },
        getApiType() {
            this.$bvModal.show("api-type-modal");
        },
        dropType(data) {
            this.apiType = data;
            this.form.apiTypeId = data.id;
        },
        markAsApproved(row){
            Swal.fire({
                title: "Are you sure?",
                text: "You want to approve this Work?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#34c38f",
                cancelButtonColor: "#f46a6a",
                confirmButtonText: "Yes, approve it!",
            }).then((result) => {
                if (result.isConfirmed) {
                    this.$store
                        .dispatch(
                            "api/ApproveApi",
                            row.id
                        )
                        .then((res) => {
                            row.status = 'Approved';
                            this.showToast("Successfully approved","success");
                        })
                        .catch((err) => {
                            this.showToast("Something went wrong!","error");
                        });
                }
            });
        }
    },
};
</script>

<template>
    <div>
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
                            <h4 class="card-title m-0">Priority API List</h4>
                            <button
                                type="button"
                                @click="addFC()"
                                class="
                                    btn btn-md btn-info
                                    d-flex
                                    align-items-center
                                "
                            >
                                <i class="bx bx-plus fs-6"></i>Create New
                            </button>
                            <b-modal
                                id="api-template-modal"
                                :title="modalTitle"
                                size="md"
                                title-class="font-18"
                                hide-footer
                                no-close-on-backdrop
                            >
                                <form
                                    @submit.prevent="onCreate"
                                    class="needs-validation"
                                    ref="apiForm"
                                >
                                    <div class="mb-3">
                                        <label for="name">Name </label>
                                        <input
                                            autocomplete="off"
                                            id="name"
                                            type="text"
                                            v-model="form.name"
                                            placeholder="Enter Name..."
                                            class="form-control"
                                            :class="{
                                                'is-invalid':
                                                    submitted &&
                                                    $v.form.name.$error,
                                            }"
                                        />
                                        <div
                                            v-if="
                                                submitted &&
                                                $v.form.name.$error
                                            "
                                            class="invalid-feedback"
                                        >
                                            <span
                                                v-if="
                                                    !$v.form.name
                                                        .required
                                                "
                                                >This value is
                                                required.</span
                                            >
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label for="description"
                                            >Description
                                        </label>
                                        <textarea
                                            id="description"
                                            rows="6"
                                            v-model="form.description"
                                            placeholder="Enter Description..."
                                            class="form-control"
                                            :class="{
                                                'is-invalid':
                                                    submitted &&
                                                    $v.form.description
                                                        .$error,
                                            }"
                                        ></textarea>
                                        <div
                                            v-if="
                                                submitted &&
                                                $v.form.description
                                                    .$error
                                            "
                                            class="invalid-feedback"
                                        >
                                            <span
                                                v-if="
                                                    !$v.form.description
                                                        .required
                                                "
                                                >This value is
                                                required.</span
                                            >
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label for="apiTypeId"
                                            >API Type
                                        </label>
                                        <b-input-group>
                                            <template #append>
                                                <b-button
                                                    @click="getApiType"
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
                                                placeholder="Search API Type..."
                                                class="form-control"
                                                :class="{
                                                    'is-invalid':
                                                        submitted &&
                                                        $v.form
                                                            .apiTypeId
                                                            .$error,
                                                }"
                                                v-model="apiType.type"
                                            />
                                        </b-input-group>
                                        <div
                                            v-if="
                                                submitted &&
                                                $v.form.apiTypeId.$error
                                            "
                                            class="invalid-feedback"
                                        >
                                            <span
                                                v-if="
                                                    !$v.form.apiTypeId
                                                        .required
                                                "
                                                >This value is
                                                required.</span
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
                                            class="
                                                form-select form-select-sm
                                                mx-1
                                            "
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
                                <template #cell(score)="data">
                                    <div>
                                        <b>Efficiency:</b>&nbsp;{{
                                            data.item.scoreEfficiency
                                        }}
                                    </div>
                                    <div>
                                        <b>Quality:</b>&nbsp;{{
                                            data.item.scoreQuality
                                        }}
                                    </div>
                                    <div>
                                        <b>Timeliness:</b>&nbsp;{{
                                            data.item.scoreTimeliness
                                        }}
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
                                                variant="dark"
                                                ><i
                                                    class="
                                                        bx bx-edit
                                                        font-size-18
                                                        me-1
                                                    "
                                                ></i
                                                >Update</b-dropdown-item
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
        <api-type @dropData="dropType($event)"></api-type>
    </div>
</template>
