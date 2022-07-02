<script>
import Swal from "sweetalert2";
import { cloneDeep } from "lodash";
import { required } from "vuelidate/lib/validators";

export default {
    name: "ItemCategory",
    data() {
        return {
            submitted: false,
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
                    key: "type",
                    sortable: true,
                },
                {
                    key: "actions",
                    thStyle: {width: '90px'}
                },
            ],
            form: {
                id: 0,
                name: "",
                description: "",
                type: "",
                accountGroupId: '',
                categoryCode: '',
            },
            indexSelected: -1,
            tableBusy: false,
            categories: [],
            accountGroups: []
        };
    },
    computed: {
        rows() {
            if(this.filter){
                return this.totalRows;
            }
            return this.tableData.length;
        },
    },
    validations: {
        form: {
            name: { required },
            description: { required },
            accountGroupId: { required },
        },
    },
    methods: {
        onFiltered(filteredItems) {
            this.totalRows = filteredItems.length;
            this.currentPage = 1;
        },
        addIc() {
            this.onReset();
            this.modalTitle = "Create New Item Category";
            this.$bvModal.show("ic-modal");
        },
        onReset() {
            this.form = {
                id: 0,
                name: "",
                description: "",
                type: "",
                accountGroupId: '',
                categoryCode: '',
            };
        },
        hideModal() {
            this.$bvModal.hide("ic-modal");
        },
        onCreate() {
            this.submitted = true;
            this.$v.$touch();
            if (this.$v.$invalid) {
                return;
            } else {
                if (this.form.id > 0) {
                    this.$store
                        .dispatch("itemcategory/UpdateItemCategory", this.form)
                        .then((res) => {
                            this.tableData.splice(
                                this.indexSelected,
                                1,
                                res.data
                            );
                            this.$bvModal.hide("ic-modal");
                            this.showToast("Successfully updated!","success");
                        })
                        .catch((err) => {
                            this.showToast("Something went wrong!","error");
                        });
                } else {
                    this.$store
                        .dispatch("itemcategory/CreateItemCategory", this.form)
                        .then((res) => {
                            this.tableData.push(res.data);
                            this.$bvModal.hide("ic-modal");
                            this.showToast("Successfully created!","success");
                        })
                        .catch((err) => {
                            this.showToast("Something went wrong!","error");
                        });
                }
                this.submitted = false;
            }
        },
        updateItem(props) {
            this.form = cloneDeep(props.item);
            this.indexSelected = this.tableData.indexOf(props.item);
            this.modalTitle = "Update Item Category";
            this.$bvModal.show("ic-modal");
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
                        .dispatch("itemcategory/DeleteItemCategory", props.item.id)
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
        onRowSelected(data) {
            this.$emit("dropData", data[0]);
            this.$bvModal.hide("item-category-modal");
        },
    },
    async created() {
        this.tableBusy = true;
        this.$store
            .dispatch("itemcategory/GetItemCategory")
            .then((res) => {
                this.tableBusy = false;
                this.tableData = res.data;
            })
            .catch(() => {
                this.tableBusy = false;
                this.showToast("Something went wrong!","error");
            });
        const accountGroup = await this.$store.dispatch("accountgroups/getAllAccountGroup");
        this.accountGroups = accountGroup.data;
    },
};
</script>

<template>
    <div>
         <b-modal
            id="ic-modal"
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
                    <label for="name">Name </label>
                    <input
                        autocomplete="off"
                        id="name"
                        type="text"
                        v-model="form.name"
                        placeholder="Enter Category Name..."
                        class="form-control"
                        :class="{
                            'is-invalid':
                                submitted && $v.form.name.$error,
                        }"
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
                    <label for="description">Description </label>
                    <input
                        autocomplete="off"
                        id="description"
                        type="text"
                        v-model="form.description"
                        placeholder="Enter Description..."
                        class="form-control"
                        :class="{
                            'is-invalid':
                                submitted &&
                                $v.form.description.$error,
                        }"
                    />
                    <div
                        v-if="
                            submitted && $v.form.description.$error
                        "
                        class="invalid-feedback"
                    >
                        <span v-if="!$v.form.description.required"
                            >This value is required.</span
                        >
                    </div>
                </div>
                <div class="mb-3">
                    <label for="type">Type </label>
                    <select name="" id="" class="form-select" v-model="form.type">
                        <option value=""></option>
                        <option value="EXP">Expendable</option>
                        <option value="SEP">Semi-expendable Property</option>
                        <option value="PPE">Property, Plant and Equipment</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label for="account">Account Group</label>
                    <select name="" id="" class="form-select" v-model="form.accountGroupId" :class="{
                            'is-invalid':
                                submitted && $v.form.accountGroupId.$error,
                        }">
                        <option value=""></option>
                        <option v-for="x in accountGroups" :value="x.id" :key="x.id">{{x.groupName}}</option>
                    </select>
                    <div
                        v-if="submitted && $v.form.accountGroupId.$error"
                        class="invalid-feedback"
                    >
                        <span v-if="!$v.form.accountGroupId.required"
                            >This value is required.</span
                        >
                    </div>
                </div>
                <div class="mb-3">
                    <label for="categoryCode">Category Code </label>
                    <input
                        autocomplete="off"
                        id="categoryCode"
                        type="text"
                        v-model="form.categoryCode"
                        placeholder="Enter Category Code..."
                        class="form-control"
                    />
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
                            <h4 class="card-title m-0">Item Category List</h4>
                            <button
                                type="button"
                                @click="addIc()"
                                class="
                                    btn btn-md btn-info
                                    d-flex
                                    align-items-center
                                "
                            >
                                <i class="bx bx-plus fs-6"></i>Create New
                            </button>
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
    </div>
</template>