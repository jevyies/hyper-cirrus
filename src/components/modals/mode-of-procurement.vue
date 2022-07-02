<script>
import Swal from "sweetalert2";
import { cloneDeep } from "lodash";
import { required } from "vuelidate/lib/validators";

export default {
    name: "ModeOfProcurementModal",
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
                    label: "Mode Of Procurement",
                },
                {
                    key: "actions",
                    thStyle: { width: "110px" },
                },
            ],
            form: {
                id: 0,
                code: "",
                name: "",
                mopType: "",
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
            code: { required },
            name: { required },
            mopType: { required },
        },
    },
    methods: {
        onFiltered(filteredItems) {
            this.totalRows = filteredItems.length;
            this.currentPage = 1;
        },
        addModeOfProcurement() {
            this.onReset();
            this.modalTitle = "Create New Mode Of Procurement";
            this.$bvModal.show("mop-modal");
        },
        onReset() {
            this.form = {
                id: 0,
                beneficiaryName: "",
                beneficiaryCategoryId: 0,
            };
        },
        hideModal() {
            this.$bvModal.hide("mop-modal");
        },
        onCreate() {
            this.submitted = true;
            this.$v.$touch();
            if (this.$v.$invalid) {
                return;
            } else {
                if (this.form.id > 0) {
                    this.$store
                        .dispatch("modeofprocurement/UpdateModeOfProcurement", this.form)
                        .then((res) => {
                            this.tableData.splice(
                                this.indexSelected,
                                1,
                                res.data
                            );
                            this.$bvModal.hide("mop-modal");
                            this.showToast("Successfully updated!","success");
                        })
                        .catch((err) => {
                            this.showToast("Something went wrong!","error");
                        });
                } else {
                    this.$store
                        .dispatch("modeofprocurement/CreateModeOfProcurement", this.form)
                        .then((res) => {
                            this.tableData.push(res.data);
                            this.$bvModal.hide("mop-modal");
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
            this.modalTitle = "Update Mode Of Procurement";
            this.$bvModal.show("mop-modal");
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
                        .dispatch(
                            "modeofprocurement/DeleteModeOfProcurement",
                            props.item.id
                        )
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
            this.$bvModal.hide("mode-of-procurement-modal");
        },
    },
    created() {
        this.$store
            .dispatch("modeofprocurement/GetModeOfProcurement")
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
        id="mode-of-procurement-modal"
        title="Mode Of Procurement List"
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
                        @click="addModeOfProcurement()"
                        class="btn btn-sm btn-info d-flex align-items-center"
                    >
                        <i class="bx bx-plus fs-6"></i>Create New
                    </button>
                    <b-modal
                        id="mop-modal"
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
                                <label for="code"> Code </label>
                                <input
                                    autocomplete="off"
                                    id="code"
                                    type="text"
                                    v-model="form.code"
                                    placeholder="Enter Code..."
                                    class="form-control"
                                    :class="{
                                        'is-invalid':
                                            submitted && $v.form.code.$error,
                                    }"
                                />
                                <div
                                    v-if="submitted && $v.form.code.$error"
                                    class="invalid-feedback"
                                >
                                    <span v-if="!$v.form.code.required"
                                        >This value is required.</span
                                    >
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="name">
                                    Mode Of Procurement Name
                                </label>
                                <input
                                    autocomplete="off"
                                    id="name"
                                    type="text"
                                    v-model="form.name"
                                    placeholder="Enter Mode Of Procurement Name..."
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
                                <label for="mopType"
                                    >Mode Of Procurement Name
                                </label>
                                <textarea
                                    id="mopType"
                                    type="text"
                                    v-model="form.mopType"
                                    placeholder="Enter Mode Of Procurement Name..."
                                    class="form-control"
                                    :class="{
                                        'is-invalid':
                                            submitted && $v.form.mopType.$error,
                                    }"
                                ></textarea>
                                <div
                                    v-if="submitted && $v.form.mopType.$error"
                                    class="invalid-feedback"
                                >
                                    <span v-if="!$v.form.mopType.required"
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
