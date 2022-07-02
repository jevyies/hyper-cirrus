<script>
import FundSourceModal from "./fund-source-list.vue";
export default {
    components: { FundSourceModal },
    name: "ApiItems",
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
            fundSources: [],
            fundSource: "",
            fundSourceId: 0,
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
            this.$bvModal.hide("import-api-modal");
        },
        getFS() {
            this.$bvModal.show("fund-source-modal");
        },
        dropData(data) {
            this.fundSource = data.sourceName;
            this.fundSourceId = data.id;
            this.getItemFromFS(data.id);
        },
        getItemFromFS(id) {
            this.tableBusy = true;
            this.$store
                .dispatch("procurable/GetAvailableFSProcurables", {
                    cycle: this.$store.state.data.cycle,
                    fsId: id,
                })
                .then((res) => {
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
        importWorks() {
            this.pageLoader(true);
            var data = {
                consolidatedProcurableResourceId: this.parentID,
                fundSourceId: this.fundSourceId,
                apiIds: [],
            };
            this.tableData.forEach((item) => {
                item.toggleSelected && data.apiIds.push(item.id);
            });
            this.$store
                .dispatch("cpritem/CreateCprItem", data)
                .then((res) => {
                    this.pageLoader(false);
                    if (res.data.error) {
                        return this.showToast(res.data.errorMessage, "error");
                    }
                    this.$emit("dropData", { success: true });
                    this.$bvModal.hide("import-api-modal");
                })
                .catch(() => {
                    this.pageLoader(false);
                    this.showToast("Something went wrong!","error");
                });
        },
    },
};
</script>

<template>
    <b-modal
        id="import-api-modal"
        title="API Resource List"
        size="xl"
        title-class="font-18"
        hide-footer
        no-close-on-backdrop
    >
        <div class="row mt-1">
            <div class="col-sm-12 col-md-5">
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
            <div class="col-sm-12 col-md-7">
                <div class="d-flex align-items-center">
                    <label class="text-nowrap mb-0"> Fund Source: </label>
                    <b-input-group>
                        <template #append>
                            <b-button
                                @click="getFS()"
                                variant="outline-info"
                                size="sm"
                                ><i
                                    class="
                                        mdi mdi-clipboard-text-search-outline
                                    "
                                ></i
                            ></b-button>
                        </template>
                        <b-form-input
                            autocomplete="off"
                            v-model="fundSource"
                            type="search"
                            placeholder="Search Fund Source..."
                            class="form-control form-control-sm ms-2"
                            disabled
                        ></b-form-input>
                    </b-input-group>
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
                        <th style="width: 50%">Name</th>
                        <th>Status</th>
                        <th>Total</th>
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
                                        :id="`apiID-${x.id}`"
                                        class="form-check-input"
                                        v-model="x.toggleSelected"
                                    />
                                </div>
                            </div>
                        </th>
                        <td>
                            <div>
                                <b class="text-white">{{ x.name }}</b>
                            </div>
                            <div>
                                {{ x.description }}
                            </div>
                        </td>
                        <td>{{ x.status }}</td>
                        <td>
                            {{
                                Intl.NumberFormat("ja-JP", {
                                    currency: "PHP",
                                    style: "currency",
                                }).format(x.totalResources)
                            }}
                        </td>
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
                @click="importWorks()"
            >
                Import ({{ selectedRowCheck }}) selected works
            </button>
        </div>
        <fund-source-modal @dropData="dropData($event)"></fund-source-modal>
    </b-modal>
</template>