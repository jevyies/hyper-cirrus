<script>
import Swal from "sweetalert2";
import { cloneDeep } from "lodash";
import { required } from "vuelidate/lib/validators";

export default {
    name: "SupplierRfqModal",
    data() {
        return {
            submitted: false,
            tableData: [],
            modalTitle: "",
            totalRows: 1,
            currentPage: 1,
            perPage: 10,
            pageOptions: [10, 25, 50, 100],
            filter: '',
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
            indexSelected: -1,
            tableBusy: false,
            options: {}
        };
    },
    computed: {
        filteredData() {
            let data = this.tableData;
            var total = this.currentPage * this.perPage;
            if (this.filter.trim() != "" && this.filter) {
                data = data.filter((item) => {
                    return item.name
                        .toUpperCase()
                        .includes(this.filter.toUpperCase());
                });
            }
            var currentData = data.slice(total - this.perPage, total);
            if (this.currentPage > 1 && currentData.length == 0) {
                total = (this.currentPage - 1) * this.perPage;
                currentData = data.slice(total - this.perPage, total);
            }
            return currentData;
        },
        rows() {
            return this.tableData.length;
        },
        checkSelected() {
            let count = 0;
            this.tableData.forEach((item) => {
                item.selectedSup && count++;
            });
            return count > 0 ? true : false;
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
        onModalOpen(opt){
            this.options = opt;
        },
        async getData(id) {
            this.tableBusy = true;
            this.tableData = [];
            await this.$store
                .dispatch("rfq/AvailableSuppliers", id)
                .then((res) => {
                    this.tableBusy = false;
                    if (res.data.error) {
                        return this.showToast(res.data.errorMessage, "error");
                    }
                    res.data.forEach((item) => {
                        let exist = this.options.supplierSelected.find(x => x.id == item.id);
                        if(exist){
                            item.selectedSup = true;
                        }else{
                            item.selectedSup = false;
                        }
                    });
                    this.tableData = res.data;
                    this.tableBusy = false;
                })
                .catch((err) => {
                    this.tableData = []
                    this.tableBusy = false;
                    this.showToast("Something went wrong!", "error");
                });
        },
        getSuppliers(){
            return this.tableData;
        },
        dropData() {
            let data = [];
            this.tableData.forEach((item) => {
                item.selectedSup && data.push(item);
            });
            this.$emit("dropData", data);
            this.$bvModal.hide("rfq-supplier-modal");
        },
    },
};
</script>

<template>
    <b-modal
        id="rfq-supplier-modal"
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
            <div class="col-sm-12 col-md-4 text-right">
                <button
                    class="btn btn-sm btn-success"
                    type="button"
                    v-if="checkSelected"
                    @click="dropData()"
                >
                    <i class="bx bx-plus"></i> Add Selected Suppliers
                </button>
            </div>
        </div>
        <div class="mb-3">
            <div
                class="
                    d-flex
                    justify-content-center
                    align-items-center
                "
                v-if="tableBusy"
            >
                <div
                    class="
                        preloader-component
                        me-2
                    "
                >
                    <div class="status">
                        <div
                            class="
                                spinner-chase
                                w-20px
                                h-20px
                            "
                        >
                            <div
                                class="
                                    chase-dot
                                "
                            ></div>
                            <div
                                class="
                                    chase-dot
                                "
                            ></div>
                            <div
                                class="
                                    chase-dot
                                "
                            ></div>
                            <div
                                class="
                                    chase-dot
                                "
                            ></div>
                            <div
                                class="
                                    chase-dot
                                "
                            ></div>
                            <div
                                class="
                                    chase-dot
                                "
                            ></div>
                        </div>
                    </div>
                </div>
                <strong>Loading...</strong>
            </div>
            <b-card
                no-body
                class="mb-1 shadow-none"
                v-if="tableData.length == 0"
            >
                <b-card-header header-tag="header" role="tab" class="border">
                    <h5 class="text-center mb-0">No data found</h5>
                </b-card-header>
            </b-card>
            <b-card
                no-body
                class="mb-1 shadow-none"
                v-if="filteredData.length == 0 && filter"
            >
                <b-card-header header-tag="header" role="tab" class="border">
                    <h5 class="text-center mb-0">Search not found</h5>
                </b-card-header>
            </b-card>
            <b-card
                no-body
                class="mb-1 shadow-none"
                v-for="x in filteredData"
                :key="x.id"
            >
                <b-card-header
                    header-tag="header"
                    role="tab"
                    class="border"
                    :class="{ 'border-success': x.selectedSup }"
                >
                    <div class="text-muted">
                        <div
                            class="
                                form-check
                                form-checkbox-outline
                                form-check-success
                                mb-0
                            "
                        >
                            <input
                                type="checkbox"
                                :id="`customCheckcolor${x.id}`"
                                class="form-check-input"
                                v-model="x.selectedSup"
                            />
                            <label
                                :for="`customCheckcolor${x.id}`"
                                class="form-check-label"
                            >
                                <h5 class="mb-0">
                                    {{ x.name }}
                                </h5>
                            </label>
                        </div>
                        <div>
                            <small class="d-flex align-items-center"
                                >{{ x.address }}
                            </small>
                        </div>
                    </div>
                </b-card-header>
            </b-card>
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
