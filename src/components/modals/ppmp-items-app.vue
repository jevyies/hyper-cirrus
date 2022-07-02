<script>
import { cloneDeep } from "lodash";
import { required } from "vuelidate/lib/validators";

export default {
    name: "PpmpItemsApp",
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
            sortBy: "ppmpNumber",
            sortDesc: false,
            fields: [
                {
                    key: "ppmpNumber",
                    sortable: true,
                    thStyle: { width: "20%" },
                },
                 {
                    key: "description",
                    sortable: true,
                },
            ],
            form: {
                id: 0,
                category: "",
            },
            indexSelected: -1,
            tableBusy: false,
            categories: [],
        };
    },
    computed: {
        rows() {
            return this.tableData.length;
        },
    },
    validations: {
        form: {
            category: { required },
        },
    },
    methods: {
        onFiltered(filteredItems) {
            this.totalRows = filteredItems.length;
            this.currentPage = 1;
        },
        dropData(data) {
            this.$emit("dropData", data[0]);
            this.$bvModal.hide("ppmp-items-app-modal");
        },
        getPPMPList(year){
            this.tableBusy = true;
            this.$store
                .dispatch("appitem/GetPPMPforAppItem", year)
                .then((res) => {
                    this.tableBusy = false;
                    this.tableData = res.data;
                })
                .catch(() => {
                    this.tableBusy = false;
                    this.showToast("Something went wrong!","error");
                });
        },
        hideModal(){
            this.$bvModal.hide("ppmp-items-app-modal");
        }
    },
};
</script>

<template>
    <b-modal
        id="ppmp-items-app-modal"
        title="PPMP Item List"
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
                    <b-modal
                        id="jc-modal"
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
                                <label for="category">Category </label>
                                <input
                                    autocomplete="off"
                                    id="category"
                                    type="text"
                                    v-model="form.category"
                                    placeholder="Enter Job Category..."
                                    class="form-control"
                                    :class="{
                                        'is-invalid':
                                            submitted &&
                                            $v.form.category.$error,
                                    }"
                                />
                                <div
                                    v-if="submitted && $v.form.category.$error"
                                    class="invalid-feedback"
                                >
                                    <span v-if="!$v.form.category.required"
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