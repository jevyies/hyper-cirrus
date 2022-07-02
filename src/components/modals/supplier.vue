<script>
import Swal from "sweetalert2";
import { cloneDeep } from "lodash";
import { required } from "vuelidate/lib/validators";

export default {
    name: "SupplierModal",
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
                    label: "Supplier",
                    thStyle: { width: "85%" },
                },

                {
                    key: "actions",
                },
            ],
            form: {
                id: 0,
                name: "",
                address: "",
                tin: "",
                email: "",
                contactNumber: "",
                note: "",
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
            name: { required },
            address: { required },
            tin: { required },
            email: { required },
            contactNumber: { required },
        },
    },
    methods: {
        onFiltered(filteredItems) {
            this.totalRows = filteredItems.length;
            this.currentPage = 1;
        },
        addSupplier() {
            this.onReset();
            this.modalTitle = "Create New Supplier";
            this.$bvModal.show("p-modal");
        },
        onReset() {
            this.form = {
                id: 0,
                beneficiaryName: "",
                beneficiaryCategoryId: 0,
            };
        },
        hideModal() {
            this.$bvModal.hide("p-modal");
        },
        onCreate() {
            this.submitted = true;
            this.$v.$touch();
            if (this.$v.$invalid) {
                return;
            } else {
                if (this.form.id > 0) {
                    this.$store
                        .dispatch("supplier/UpdateSupplier", this.form)
                        .then((res) => {
                            this.tableData.splice(
                                this.indexSelected,
                                1,
                                res.data
                            );
                            this.$bvModal.hide("p-modal");
                            this.showToast("Successfully updated!","success");
                        })
                        .catch((err) => {
                            this.showToast("Something went wrong!","error");
                        });
                } else {
                    this.$store
                        .dispatch("supplier/CreateSupplier", this.form)
                        .then((res) => {
                            this.tableData.push(res.data);
                            this.$bvModal.hide("p-modal");
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
            this.modalTitle = "Update Supplier";
            this.$bvModal.show("p-modal");
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
                        .dispatch("supplier/DeleteSupplier", props.item.id)
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
        dropData(data) {
            this.$emit("dropData", data[0]);
            this.$bvModal.hide("supplier-modal");
        },
    },
    created() {
        this.$store
            .dispatch("supplier/GetSupplier")
            .then((res) => {
                this.tableBusy = false;
                this.tableData = res.data;
            })
            .catch(() => {
                this.tableBusy = false;
                this.showToast("Something went wrong!","error");
            });
    },
};
</script>

<template>
    <b-modal
        id="supplier-modal"
        title="Supplier List"
        size="lg"
        title-class="font-18"
        hide-footer
        no-close-on-backdrop
    >
        <div class="row mt-1">
            <div class="col-sm-12 col-md-8">
                <div id="tickets-table_filter" class="dataTables_filter">
                    <label class="d-inline-flex align-items-center">
                        Search:
                        <b-form-input
                            autocomplete="off"
                            v-model="filter"
                            type="search"
                            placeholder="Search..."
                            class="form-control form-control-sm mx-2 w-75"
                        ></b-form-input>
                        <b-form-select
                            class="form-select form-select-sm w-25"
                            v-model="perPage"
                            :options="pageOptions"
                        ></b-form-select>
                    </label>
                </div>
            </div>
            <!-- Search -->
            <div class="col-sm-12 col-md-4">
                <div class="d-flex justify-content-end align-items-center">
                    <button
                        type="button"
                        @click="addSupplier()"
                        class="btn btn-sm btn-info d-flex align-items-center"
                    >
                        <i class="bx bx-plus fs-6"></i>Create New
                    </button>
                    <b-modal
                        id="p-modal"
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
                                <label for="name"> Supplier Name </label>
                                <input
                                    autocomplete="off"
                                    id="name"
                                    type="text"
                                    v-model="form.name"
                                    placeholder="Enter Supplier Name..."
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
                                <label for="address">Address </label>
                                <textarea
                                    id="address"
                                    type="text"
                                    v-model="form.address"
                                    placeholder="Enter Address..."
                                    class="form-control"
                                    :class="{
                                        'is-invalid':
                                            submitted && $v.form.address.$error,
                                    }"
                                ></textarea>
                                <div
                                    v-if="submitted && $v.form.address.$error"
                                    class="invalid-feedback"
                                >
                                    <span v-if="!$v.form.address.required"
                                        >This value is required.</span
                                    >
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="email"> Email </label>
                                <input
                                    autocomplete="off"
                                    id="email"
                                    type="email"
                                    v-model="form.email"
                                    placeholder="Enter Email..."
                                    class="form-control"
                                    :class="{
                                        'is-invalid':
                                            submitted && $v.form.email.$error,
                                    }"
                                />
                                <div
                                    v-if="submitted && $v.form.email.$error"
                                    class="invalid-feedback"
                                >
                                    <span v-if="!$v.form.email.required"
                                        >This value is required.</span
                                    >
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="contactNumber">
                                    Contact Number
                                </label>
                                <input
                                    autocomplete="off"
                                    id="contactNumber"
                                    type="contactNumber"
                                    v-model="form.contactNumber"
                                    placeholder="Enter Contact Number..."
                                    class="form-control"
                                    :class="{
                                        'is-invalid':
                                            submitted &&
                                            $v.form.contactNumber.$error,
                                    }"
                                />
                                <div
                                    v-if="
                                        submitted &&
                                        $v.form.contactNumber.$error
                                    "
                                    class="invalid-feedback"
                                >
                                    <span v-if="!$v.form.contactNumber.required"
                                        >This value is required.</span
                                    >
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="tin"> TIN </label>
                                <input
                                    autocomplete="off"
                                    id="tin"
                                    type="text"
                                    v-model="form.tin"
                                    placeholder="Enter TIN..."
                                    class="form-control"
                                    :class="{
                                        'is-invalid':
                                            submitted && $v.form.tin.$error,
                                    }"
                                />
                                <div
                                    v-if="submitted && $v.form.tin.$error"
                                    class="invalid-feedback"
                                >
                                    <span v-if="!$v.form.tin.required"
                                        >This value is required.</span
                                    >
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="note">Note </label>
                                <textarea
                                    id="note"
                                    type="text"
                                    v-model="form.note"
                                    placeholder="Enter Note..."
                                    class="form-control"
                                ></textarea>
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
                select-mode="single"
                selectable
                @row-selected="dropData"
                selected-variant="success"
            >
                <template #empty="scope">
                    <div class="text-center">{{ scope.emptyText }}</div>
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
                                variant="secondary"
                                ><i class="mdi mdi-update font-size-18 me-1"></i
                                >Edit</b-dropdown-item
                            >
                            <b-dropdown-item
                                @click="deleteItem(row)"
                                variant="danger"
                                ><i
                                    class="mdi mdi-trash-can font-size-18 me-1"
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
    </b-modal>
</template>
