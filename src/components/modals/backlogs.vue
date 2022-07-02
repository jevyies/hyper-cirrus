<script>
import { required } from "vuelidate/lib/validators";

export default {
    name: "BacklogModal",
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
            sortBy: "type",
            sortDesc: false,
            fields: [
                {
                    key: "name",
                    sortable: true,
                    label: "API Name"
                },
            ],
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
            accreditorName: { required },
            shortName: { required },
        },
    },
    methods: {
        onFiltered(filteredItems) {
            this.totalRows = filteredItems.length;
            this.currentPage = 1;
        },
        dropData(data) {
            this.$emit("dropData", data[0]);
            this.$bvModal.hide("backlog-modal");
        },
        getData() {
            this.tableBusy = true;
            this.$store
                .dispatch("api/GetBackLogs", this.$store.state.data.cycle)
                .then((res) => {
                    console.log(res.data)
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
        id="backlog-modal"
        title="Backlog List"
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
                <template #cell(name)="row">
                    <div>
                        <b>{{row.value}}</b>
                    </div>
                    <small class="text-muted">{{row.item.description}}</small>
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