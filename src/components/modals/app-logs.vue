<script>
export default {
    name: "AppLogs",
    data() {
        return {
            tableBusy: false,
            tableData: [],
            modalTitle: "",
            totalRows: 1,
            currentPage: 1,
            perPage: 10,
            pageOptions: [10, 25, 50, 100],
            filter: null,
            filterOn: [],
            sortBy: "dateWTime",
            sortDesc: false,
            fields: [
                {
                    key: "dateWTime",
                    sortable: true,
                    label: "Date",
                    thStyle: { width: "250px" },
                },
                {
                    key: "applicationUser.completeName",
                    sortable: true,
                    label: "User",
                    thStyle: { width: "350px" },
                },
                {
                    key: "remarks",
                    sortable: true,
                },
            ],
        };
    },
    computed: {
        rows() {
            return this.tableData.length;
        },
    },
    methods: {
        onFiltered(filteredItems) {
            this.totalRows = filteredItems.length;
            this.currentPage = 1;
        },
        hideModal() {
            this.$bvModal.hide("app-log-modal");
        },
        getData(id) {
            this.tableBusy = true;
            this.$store
                .dispatch("applog/GetAppLogs", id)
                .then((res) => {
                    res.data.forEach((item) => {
                        item.dateWTime = this.formatDateWithTime(new Date(item.logDate));
                    });
                    this.tableData = res.data;
                    this.tableBusy = false;
                })
                .catch((err) => {
                    this.showToast("Something went wrong!","error");
                });
        },
    },
};
</script>

<template>
    <b-modal
        id="app-log-modal"
        title="APP Logs"
        size="xl"
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