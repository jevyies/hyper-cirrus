<script>
export default {
    name: "EmployeeModal",
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
            sortBy: "employee",
            sortDesc: false,
            fields: [
                {
                    key: "employee",
                    sortable: true,
                    label: "Employee",
                    thStyle: { width: "85%" },
                },

                {
                    key: "actions",
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
    methods: {
        onFiltered(filteredItems) {
            this.totalRows = filteredItems.length;
            this.currentPage = 1;
        },
        dropData(data) {
            this.$emit("dropData", data[0]);
            this.$bvModal.hide("employee-modal");
        },
    },
    created() {
        this.$store
            .dispatch("employee/GetEmployee")
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
        id="employee-modal"
        title="Employee List"
        size="lg"
        title-class="font-18"
        hide-footer
        no-close-on-backdrop
    >
        <div class="row mt-1">
            <!-- Search -->
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
                <template #cell(employee)="row">
                    <div class="d-flex align-items-center">
                        <div>
                            <div class="mt-1">
                                <h5 class="mb-0">
                                    {{
                                        row.item.lastName
                                            .charAt(0)
                                            .toUpperCase() +
                                        row.item.lastName.slice(
                                            1
                                        )
                                    }},
                                    {{
                                        row.item.firstName
                                            .charAt(0)
                                            .toUpperCase() +
                                        row.item.firstName.slice(
                                            1
                                        )
                                    }}
                                    {{
                                        row.item.middleName
                                            ? `${row.item.middleName
                                                    .charAt(0)
                                                    .toUpperCase()}.`
                                            : ""
                                    }}
                                </h5>
                            </div>
                            <div>{{ row.item.position }}</div>
                            <i>{{ row.item.email }}</i>
                        </div>
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
