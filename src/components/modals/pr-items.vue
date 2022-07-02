<script>
export default {
    name: "ImportPr",
    data() {
        return {
            submitted: false,
            tableData: [],
            modalTitle: "",
            totalRows: 1,
            currentPage: 1,
            perPage: 25,
            pageOptions: [10, 25, 50, 100],
            filter: "",
            form: {
                id: 0,
                category: "",
            },
            indexSelected: -1,
            tableBusy: false,
            parentID: 0,
        };
    },
    computed: {
        rows() {
            return this.tableData.length;
        },
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
        checkAll: {
            get() {
                var count = 0;
                this.tableData.forEach((item) => {
                    item.toggleSelected && count++;
                });
                return count == this.tableData.length ? true : false;
            },
            set(newValue) {
                if (newValue) {
                    this.tableData.forEach((item) => {
                        item.toggleSelected = true;
                    });
                } else {
                    this.tableData.forEach((item) => {
                        item.toggleSelected = false;
                    });
                }
            },
        },
        selectedRowCheck() {
            var count = 0;
            this.tableData.forEach((item) => {
                item.toggleSelected && count++;
            });
            return count;
        },
    },
    methods: {
        hideModal() {
            this.$bvModal.hide("import-pr-modal");
        },
        importPRs() {
            var data = {
                consolidatedPrId: this.parentID,
                prIds: [],
            };
            this.tableData.forEach((item) => {
                item.toggleSelected && data.prIds.push(item.id);
            });
            this.$store
                .dispatch("consolidatedpritem/CreateConsolidatedPrItem", data)
                .then((res) => {
                    if (res.data.error) {
                        return this.showToast(res.data.errorMessage,"error");
                    }
                    this.$emit("dropData", { success: true });
                    this.$bvModal.hide("import-pr-modal");
                })
                .catch(() => {
                    this.pageLoader(false);
                    this.showToast("Something went wrong!","error");
                });
        },
        getData(id) {
            this.parentID = id;
            this.tableBusy = true;
            this.$store
                .dispatch("consolidatedpritem/GetAvailablePr", id)
                .then((res) => {
                    console.log(res.data);
                    this.tableBusy = false;
                    res.data.forEach((item) => {
                        item.toggleSelected = false;
                    });
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
        id="import-pr-modal"
        title="PR List"
        size="xl"
        title-class="font-18"
        hide-footer
        no-close-on-backdrop
    >
        <div class="row mt-1">
            <div class="col-sm-12">
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
        <div class="table-responsive mb-2">
            <table class="table table-striped mb-0 table-bordered">
                <thead>
                    <tr>
                        <th style="width: 70px">
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
                                    id="customCheckcolor2"
                                    checked="checked"
                                    class="form-check-input"
                                    v-model="checkAll"
                                /><label
                                    for="customCheckcolor2"
                                    class="form-check-label"
                                >
                                    All
                                </label>
                            </div>
                        </th>
                        <th style="width: 50%">PR Description</th>
                        <th>Office</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="filteredData.length == 0 && !tableBusy">
                        <td colspan="4" class="text-muted text-center">
                            <i class="dripicons-warning me-1"></i>No data found
                        </td>
                    </tr>
                    <tr
                        v-for="x in tableData"
                        :key="x.id"
                        @click="x.toggleSelected = !x.toggleSelected"
                        class="cursor-pointer"
                    >
                        <th scope="row">
                            <div class="justify-content-center d-flex">
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
                                        :id="`prID-${x.id}`"
                                        class="form-check-input"
                                        v-model="x.toggleSelected"
                                    />
                                </div>
                            </div>
                        </th>
                        <td>
                            <div>
                                {{ x.description }}
                            </div>
                        </td>
                        <td>{{ x.deliveryUnit.name }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div
            class="position-fixed"
            style="bottom: 10px; right: 50px"
            v-if="selectedRowCheck > 0"
        >
            <button
                class="btn btn-primary"
                type="button"
                @click="importPRs()"
            >
                Import ({{ selectedRowCheck }}) selected works
            </button>
        </div>
    </b-modal>
</template>