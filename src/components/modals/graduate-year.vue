<script>
import Swal from "sweetalert2";
import { cloneDeep } from "lodash";
import { required, numeric } from "vuelidate/lib/validators";

export default {
    name: "GraduateYear",
    data() {
        return {
            submitted: false,
            tableData: [],
            modalTitle: "",
            totalRows: 1,
            currentPage: 1,
            perPage: 25,
            pageOptions: [10, 25, 50, 100],
            filter: null,
            filterOn: [],
            sortBy: "yearGraduated",
            sortDesc: false,
            fields: [
                {
                    key: "yearGraduated",
                    sortable: true,
                    thStyle: { width: "80%" },
                },
                {
                    key: "actions",
                },
            ],
            form: {
                id: 0,
                yearGraduated: "",
                programId: 0,
            },
            indexSelected: -1,
            tableBusy: false,
            categories: [],
            programId: 0,
        };
    },
    computed: {
        rows() {
            return this.tableData.length;
        },
    },
    validations: {
        form: {
            yearGraduated: { required, numeric },
        },
    },
    methods: {
        onFiltered(filteredItems) {
            this.totalRows = filteredItems.length;
            this.currentPage = 1;
        },
        addGy() {
            this.onReset();
            this.modalTitle = "Create New Graduate";
            this.$bvModal.show("gy-modal");
        },
        onReset() {
            this.form = {
                id: 0,
                yearGraduated: "",
            };
        },
        hideModal() {
            this.$bvModal.hide("gy-modal");
        },
        onCreate() {
            this.submitted = true;
            this.$v.$touch();
            if (this.$v.$invalid) {
                return;
            } else {
                this.form.programId = this.programId;
                if (this.form.id > 0) {
                    this.$store
                        .dispatch("graduate/UpdateGraduate", this.form)
                        .then((res) => {
                            this.tableData.splice(
                                this.indexSelected,
                                1,
                                res.data
                            );
                            this.$bvModal.hide("gy-modal");
                            this.showToast("Successfully updated!","success");
                        })
                        .catch((err) => {
                            this.showToast("Something went wrong!","error");
                        });
                } else {
                    this.$store
                        .dispatch("graduate/CreateGraduate", this.form)
                        .then((res) => {
                            this.tableData.push(res.data);
                            this.$bvModal.hide("gy-modal");
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
            this.modalTitle = "Update Graduate";
            this.$bvModal.show("gy-modal");
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
            }).then(async (result) => {
                if (result.value) {
                    await this.$store
                        .dispatch("graduate/DeleteGraduate", props.item.id)
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
        dropData() {
            this.$emit("dropData", true);
            this.$bvModal.hide("graduate-year-modal");
        },
        getData(id) {
            this.programId = id;
            this.tableBusy = true;
            this.$store
                .dispatch("graduate/GetGraduateByProgram", id)
                .then((res) => {
                    this.tableBusy = false;
                    this.tableData = res.data;
                })
                .catch(() => {
                    this.tableBusy = false;
                    this.showToast("Something went wrong!","error");
                });
        },
    },
};
</script>

<template>
    <b-modal
        id="graduate-year-modal"
        title="Graduate Year List"
        size="lg"
        title-class="font-18"
        hide-footer
        no-close-on-backdrop
    >
        <div class="row mt-1">
            <div class="col-sm-12 col-md-6">
                <div id="tickets-table_filter" class="dataTables_filter">
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
            <!-- Search -->
            <div class="col-sm-12 col-md-6">
                <div class="d-flex justify-content-end align-items-center">
                    <button
                        type="button"
                        @click="addGy()"
                        class="btn btn-sm btn-info d-flex align-items-center"
                    >
                        <i class="bx bx-plus fs-6"></i>Create New
                    </button>
                    <b-modal
                        id="gy-modal"
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
                                <label for="yearGraduated"
                                    >Graduate Year
                                </label>
                                <input
                                    autocomplete="off"
                                    id="yearGraduated"
                                    type="text"
                                    v-model="form.yearGraduated"
                                    placeholder="Enter Graduate Year..."
                                    class="form-control"
                                    :class="{
                                        'is-invalid':
                                            submitted &&
                                            $v.form.yearGraduated.$error,
                                    }"
                                />
                                <div
                                    v-if="
                                        submitted &&
                                        $v.form.yearGraduated.$error
                                    "
                                    class="invalid-feedback"
                                >
                                    <span v-if="!$v.form.yearGraduated.required"
                                        >This value is required.</span
                                    >
                                    <span v-if="!$v.form.yearGraduated.numeric"
                                        >This value should be a valid
                                        number.</span
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
        <div class="modal-footer mt-3">
            <button type="button" @click="dropData()" class="btn btn-primary">
                Apply changes
            </button>
        </div>
    </b-modal>
</template>