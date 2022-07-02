<script>
import { required } from "vuelidate/lib/validators";
import { Carousel, Slide } from "vue-carousel";
import { cloneDeep, remove } from "lodash";

export default {
    components: {
        Carousel,
        Slide,
    },
    name: "APIResourcePR",
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
            sortBy: "description",
            sortDesc: false,
            page: 1,
            fields: [
                {
                    key: "description",
                    sortable: true,
                },
                {
                    key: "action",
                    sortable: true,
                    thStyle: { width: "150px" },
                    tdClass: ['text-center']
                },
            ],
            form: {
                id: 0,
                category: "",
            },
            indexSelected: -1,
            tableBusy: false,
            // items
            selectedItems: [],
            itemData: [],
            itemFields: [
                {
                    key: "checkBox",
                    label: "",
                    thStyle: { width: "10px" },
                },
                {
                    key: "itemName",
                    sortable: true,
                },
                {
                    key: "unitCostAmt",
                    label: "Unit Cost",
                    sortable: true,
                    thStyle: { width: "100px" },
                    tdClass: ["text-right"],
                },
                {
                    key: "Jan",
                    label: "Jan",
                    thStyle: { width: "50px" },
                },
                {
                    key: "Feb",
                    label: "Feb",
                    thStyle: { width: "50px" },
                },
                {
                    key: "Mar",
                    label: "Mar",
                    thStyle: { width: "50px" },
                },
                {
                    key: "Apr",
                    label: "Apr",
                    thStyle: { width: "50px" },
                },
                {
                    key: "May",
                    label: "May",
                    thStyle: { width: "50px" },
                },
                {
                    key: "June",
                    label: "June",
                    thStyle: { width: "50px" },
                },
                {
                    key: "July",
                    label: "July",
                    thStyle: { width: "50px" },
                },
                {
                    key: "Aug",
                    label: "Aug",
                    thStyle: { width: "50px" },
                },
                {
                    key: "Sep",
                    label: "Sep",
                    thStyle: { width: "50px" },
                },
                {
                    key: "Oct",
                    label: "Oct",
                    thStyle: { width: "50px" },
                },
                {
                    key: "Nov",
                    label: "Nov",
                    thStyle: { width: "50px" },
                },
                {
                    key: "Dec",
                    label: "Dec",
                    thStyle: { width: "50px" },
                },
            ],
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
        getData(id) {
            this.tableBusy = true;
            this.$store
                .dispatch("pritem/GetAvailableAPIs", id)
                .then((res) => {
                    this.tableBusy = false;
                    this.tableData = res.data;
                })
                .catch(() => {
                    this.tableBusy = false;
                    this.showToast("Something went wrong!","error");
                });
        },
        returnPPMP() {
            this.page = 1;
            this.$refs.ppmpcarousel.goToPage(
                this.$refs.ppmpcarousel.getPreviousPage()
            );
        },
        onSelected(data) {
            this.$refs.ppmpcarousel.goToPage(
                this.$refs.ppmpcarousel.getNextPage()
            );
            this.itemData = [];
            this.selectedItems = [];
            data.apiResources.forEach((item) => {
                item.checkBox = false;
                item.unitCostAmt = Intl.NumberFormat("ja-JP", {
                    currency: "PHP",
                    style: "currency",
                }).format(item.unitCost);
                item.Jan = 0;
                item.Feb = 0;
                item.Mar = 0;
                item.Apr = 0;
                item.May = 0;
                item.June = 0;
                item.July = 0;
                item.Aug = 0;
                item.Sep = 0;
                item.Oct = 0;
                item.Nov = 0;
                item.Dec = 0;
                item.itemError = false;
                item.editable = true;
                item.submitted = false;
            });
            this.itemData = cloneDeep(data.apiResources);
            this.page = 2;
        },
        dropData() {
            this.submitted = true;
            let error = this.checkAllItem();
            if (error) {
                return;
            }
            this.selectedItems.forEach((item) => {
                item.itemId = cloneDeep(item.id);
                item.indexId = 0;
                delete item.id
            });
            this.$emit("dropData", this.selectedItems);
            this.$bvModal.hide("api-resource-modal");
        },
        hideModal() {
            this.$bvModal.hide("api-resource-modal");
        },
        rowClass(item, type) {
            if (!item || type !== "row") return;
            if (item.itemError && this.submitted)
                return "check-months";
        },
        checkAllItem() {
            let error = 0;
            this.itemData.forEach((item) => {
                item.itemError = false;
                var itemError = 0;
                if (item.checkBox) {
                    if (item.Jan > 1) {
                        itemError++;
                    }
                    if (item.Feb > 1) {
                        itemError++;
                    }
                    if (item.Mar > 1) {
                        itemError++;
                    }
                    if (item.Apr > 1) {
                        itemError++;
                    }
                    if (item.May > 1) {
                        itemError++;
                    }
                    if (item.June > 1) {
                        itemError++;
                    }
                    if (item.July > 1) {
                        itemError++;
                    }
                    if (item.Aug > 1) {
                        itemError++;
                    }
                    if (item.Sep > 1) {
                        itemError++;
                    }
                    if (item.Oct > 1) {
                        itemError++;
                    }
                    if (item.Nov > 1) {
                        itemError++;
                    }
                    if (item.Dec > 1) {
                        itemError++;
                    }
                    item.itemError = itemError > 0 ? false : true;
                    if (!item.itemError) {
                        error++;
                    }
                }
            });
            return error < this.selectedItems.length ? true : false;
        },
        checkItem(row) {
            this.submitted = false;
            row.item.checkBox = !row.item.checkBox;
            if (row.item.checkBox) {
                row.item.apiResourceDetails.forEach((item) => {
                    // if (item.monthId == 1 && item.available > 0) {
                    //     row.item.Jan = 1;
                    //     row.item.JanMax = item.available;
                    // }
                    // if (item.monthId == 2 && item.available > 0) {
                    //     row.item.Feb = 1;
                    //     row.item.FebMax = item.available;
                    // }
                    // if (item.monthId == 3 && item.available > 0) {
                    //     row.item.Mar = 1;
                    //     row.item.MarMax = item.available;
                    // }
                    // if (item.monthId == 4 && item.available > 0) {
                    //     row.item.Apr = 1;
                    //     row.item.AprMax = item.available;
                    // }
                    // if (item.monthId == 5 && item.available > 0) {
                    //     row.item.May = 1;
                    //     row.item.MayMax = item.available;
                    // }
                    // if (item.monthId == 6 && item.available > 0) {
                    //     row.item.June = 1;
                    //     row.item.JuneMax = item.available;
                    // }
                    // if (item.monthId == 7 && item.available > 0) {
                    //     row.item.July = 1;
                    //     row.item.JulyMax = item.available;
                    // }
                    // if (item.monthId == 8 && item.available > 0) {
                    //     row.item.Aug = 1;
                    //     row.item.AugMax = item.available;
                    // }
                    // if (item.monthId == 9 && item.available > 0) {
                    //     row.item.Sep = 1;
                    //     row.item.SepMax = item.available;
                    // }
                    // if (item.monthId == 10 && item.available > 0) {
                    //     row.item.Oct = 1;
                    //     row.item.OctMax = item.available;
                    // }
                    // if (item.monthId == 11 && item.available > 0) {
                    //     row.item.Nov = 1;
                    //     row.item.NovMax = item.available;
                    // }
                    // if (item.monthId == 12 && item.available > 0) {
                    //     row.item.Dec = 1;
                    //     row.item.DecMax = item.available;
                    // }
                    if (item.monthId == 1) {
                        row.item.Jan = 1;
                        row.item.JanMax = item.quantity;
                    }
                    if (item.monthId == 2) {
                        row.item.Feb = 1;
                        row.item.FebMax = item.quantity;
                    }
                    if (item.monthId == 3) {
                        row.item.Mar = 1;
                        row.item.MarMax = item.quantity;
                    }
                    if (item.monthId == 4) {
                        row.item.Apr = 1;
                        row.item.AprMax = item.quantity;
                    }
                    if (item.monthId == 5) {
                        row.item.May = 1;
                        row.item.MayMax = item.quantity;
                    }
                    if (item.monthId == 6) {
                        row.item.June = 1;
                        row.item.JuneMax = item.quantity;
                    }
                    if (item.monthId == 7) {
                        row.item.July = 1;
                        row.item.JulyMax = item.quantity;
                    }
                    if (item.monthId == 8) {
                        row.item.Aug = 1;
                        row.item.AugMax = item.quantity;
                    }
                    if (item.monthId == 9) {
                        row.item.Sep = 1;
                        row.item.SepMax = item.quantity;
                    }
                    if (item.monthId == 10) {
                        row.item.Oct = 1;
                        row.item.OctMax = item.quantity;
                    }
                    if (item.monthId == 11) {
                        row.item.Nov = 1;
                        row.item.NovMax = item.quantity;
                    }
                    if (item.monthId == 12) {
                        row.item.Dec = 1;
                        row.item.DecMax = item.quantity;
                    }
                });
                this.selectedItems.push(row.item);
            } else {
                row.item.itemError = false;
                row.item.Jan = 0;
                row.item.Feb = 0;
                row.item.Mar = 0;
                row.item.Apr = 0;
                row.item.May = 0;
                row.item.June = 0;
                row.item.July = 0;
                row.item.Aug = 0;
                row.item.Sep = 0;
                row.item.Oct = 0;
                row.item.Nov = 0;
                row.item.Dec = 0;
                remove(this.selectedItems, (item) => {
                    return item.id == row.item.id;
                });
            }
        },
        checkMonth(item, month) {
            item[month] = item[month] == 1 ? 2 : 1;
            var itemError = 0;
            if (item.Jan > 1) {
                itemError++;
            }
            if (item.Feb > 1) {
                itemError++;
            }
            if (item.Mar > 1) {
                itemError++;
            }
            if (item.Apr > 1) {
                itemError++;
            }
            if (item.May > 1) {
                itemError++;
            }
            if (item.June > 1) {
                itemError++;
            }
            if (item.July > 1) {
                itemError++;
            }
            if (item.Aug > 1) {
                itemError++;
            }
            if (item.Sep > 1) {
                itemError++;
            }
            if (item.Oct > 1) {
                itemError++;
            }
            if (item.Nov > 1) {
                itemError++;
            }
            if (item.Dec > 1) {
                itemError++;
            }
            item.itemError = itemError > 0 ? false : true;
        },
    },
};
</script>

<template>
    <b-modal
        id="api-resource-modal"
        title="API Resources"
        size="xl"
        title-class="font-18"
        hide-footer
        no-close-on-backdrop
    >
        <carousel
            ref="ppmpcarousel"
            class="events navs-carousel"
            id="timeline-carousel"
            :navigation-enabled="false"
            :pagination-enabled="false"
            :perPage="1"
            :autoplay="false"
            :minSwipeDistance="0"
            :mouseDrag="false"
        >
            <slide>
                <div class="row">
                    <div class="col text-right">
                        <div
                            id="tickets-table_filter"
                            class="dataTables_filter"
                        >
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
                            :busy="tableBusy"
                            :filter="filter"
                            :filter-included-fields="filterOn"
                            @filtered="onFiltered"
                            bordered
                            outlined
                            hover
                            show-empty
                        >
                            <template #empty="scope">
                                <div class="text-center">
                                    {{ scope.emptyText }}
                                </div>
                            </template>
                            <template #table-busy>
                                <div
                                    class="
                                        d-flex
                                        justify-content-center
                                        align-items-center
                                    "
                                >
                                    <div class="preloader-component me-2">
                                        <div class="status">
                                            <div
                                                class="
                                                    spinner-chase
                                                    w-20px
                                                    h-20px
                                                "
                                            >
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
                            <template #cell(action)="{item}">
                                <button type="button" class="btn btn-link p-0" @click="onSelected(item)">
                                    View Items
                                </button>
                            </template>
                        </b-table>
                    </div>
                </div>
            </slide>
            <slide class="overflow-x">
                <div class="table-responsive mb-0">
                    <b-table
                        :items="itemData"
                        :fields="itemFields"
                        responsive
                        :busy="tableBusy"
                        bordered
                        outlined
                        hover
                        show-empty
                        class="ppmp-table"
                        :tbody-tr-class="rowClass"
                    >
                        <template #empty="scope">
                            <div class="text-center">
                                {{ scope.emptyText }}
                            </div>
                        </template>
                        <template #table-busy>
                            <div
                                class="
                                    d-flex
                                    justify-content-center
                                    align-items-center
                                "
                            >
                                <div class="preloader-component me-2">
                                    <div class="status">
                                        <div
                                            class="spinner-chase w-20px h-20px"
                                        >
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
                        <template #cell(checkBox)="row">
                            <a
                                href="javascript:void(0);"
                                @click="checkItem(row)"
                                class="
                                    d-flex
                                    align-items-center
                                    justify-content-center
                                "
                                ><b
                                    ><i
                                        class="bx bolder"
                                        :class="{
                                            'bx-x text-danger':
                                                !row.item.checkBox,
                                            'bx-check-circle text-success':
                                                row.item.checkBox,
                                        }"
                                    ></i></b
                            ></a>
                        </template>
                        <template #cell(Jan)="{ item }">
                            <a
                                href="javascript:void(0);"
                                @click="checkMonth(item, 'Jan')"
                                v-if="item.Jan > 0"
                                ><b
                                    ><i
                                        class="bx bolder"
                                        :class="{
                                            'bx-x text-danger': item.Jan == 1,
                                            'bx-check text-success':
                                                item.Jan == 2,
                                        }"
                                    ></i></b
                            ></a>
                        </template>
                        <template #cell(Feb)="{ item }">
                            <a
                                href="javascript:void(0);"
                                @click="checkMonth(item, 'Feb')"
                                v-if="item.Feb > 0"
                                ><b
                                    ><i
                                        class="bx bolder"
                                        :class="{
                                            'bx-x text-danger': item.Feb == 1,
                                            'bx-check text-success':
                                                item.Feb == 2,
                                        }"
                                    ></i></b
                            ></a>
                        </template>
                        <template #cell(Mar)="{ item }">
                            <a
                                href="javascript:void(0);"
                                @click="checkMonth(item, 'Mar')"
                                v-if="item.Mar > 0"
                                ><b
                                    ><i
                                        class="bx bolder"
                                        :class="{
                                            'bx-x text-danger': item.Mar == 1,
                                            'bx-check text-success':
                                                item.Mar == 2,
                                        }"
                                    ></i></b
                            ></a>
                        </template>
                        <template #cell(Apr)="{ item }">
                            <a
                                href="javascript:void(0);"
                                @click="checkMonth(item, 'Apr')"
                                v-if="item.Apr > 0"
                                ><b
                                    ><i
                                        class="bx bolder"
                                        :class="{
                                            'bx-x text-danger': item.Apr == 1,
                                            'bx-check text-success':
                                                item.Apr == 2,
                                        }"
                                    ></i></b
                            ></a>
                        </template>
                        <template #cell(May)="{ item }">
                            <a
                                href="javascript:void(0);"
                                @click="checkMonth(item, 'May')"
                                v-if="item.May > 0"
                                ><b
                                    ><i
                                        class="bx bolder"
                                        :class="{
                                            'bx-x text-danger': item.May == 1,
                                            'bx-check text-success':
                                                item.May == 2,
                                        }"
                                    ></i></b
                            ></a>
                        </template>
                        <template #cell(June)="{ item }">
                            <a
                                href="javascript:void(0);"
                                @click="checkMonth(item, 'June')"
                                v-if="item.June > 0"
                                ><b
                                    ><i
                                        class="bx bolder"
                                        :class="{
                                            'bx-x text-danger': item.June == 1,
                                            'bx-check text-success':
                                                item.June == 2,
                                        }"
                                    ></i></b
                            ></a>
                        </template>
                        <template #cell(July)="{ item }">
                            <a
                                href="javascript:void(0);"
                                @click="checkMonth(item, 'July')"
                                v-if="item.July > 0"
                                ><b
                                    ><i
                                        class="bx bolder"
                                        :class="{
                                            'bx-x text-danger': item.July == 1,
                                            'bx-check text-success':
                                                item.July == 2,
                                        }"
                                    ></i></b
                            ></a>
                        </template>
                        <template #cell(Aug)="{ item }">
                            <a
                                href="javascript:void(0);"
                                @click="checkMonth(item, 'Aug')"
                                v-if="item.Aug > 0"
                                ><b
                                    ><i
                                        class="bx bolder"
                                        :class="{
                                            'bx-x text-danger': item.Aug == 1,
                                            'bx-check text-success':
                                                item.Aug == 2,
                                        }"
                                    ></i></b
                            ></a>
                        </template>
                        <template #cell(Sep)="{ item }">
                            <a
                                href="javascript:void(0);"
                                @click="checkMonth(item, 'Sep')"
                                v-if="item.Sep > 0"
                                ><b
                                    ><i
                                        class="bx bolder"
                                        :class="{
                                            'bx-x text-danger': item.Sep == 1,
                                            'bx-check text-success':
                                                item.Sep == 2,
                                        }"
                                    ></i></b
                            ></a>
                        </template>
                        <template #cell(Oct)="{ item }">
                            <a
                                href="javascript:void(0);"
                                @click="checkMonth(item, 'Oct')"
                                v-if="item.Oct > 0"
                                ><b
                                    ><i
                                        class="bx bolder"
                                        :class="{
                                            'bx-x text-danger': item.Oct == 1,
                                            'bx-check text-success':
                                                item.Oct == 2,
                                        }"
                                    ></i></b
                            ></a>
                        </template>
                        <template #cell(Nov)="{ item }">
                            <a
                                href="javascript:void(0);"
                                @click="checkMonth(item, 'Nov')"
                                v-if="item.Nov > 0"
                                ><b
                                    ><i
                                        class="bx bolder"
                                        :class="{
                                            'bx-x text-danger': item.Nov == 1,
                                            'bx-check text-success':
                                                item.Nov == 2,
                                        }"
                                    ></i></b
                            ></a>
                        </template>
                        <template #cell(Dec)="{ item }">
                            <a
                                href="javascript:void(0);"
                                @click="checkMonth(item, 'Dec')"
                                v-if="item.Dec > 0"
                                ><b
                                    ><i
                                        class="bx bolder"
                                        :class="{
                                            'bx-x text-danger': item.Dec == 1,
                                            'bx-check text-success':
                                                item.Dec == 2,
                                        }"
                                    ></i></b
                            ></a>
                        </template>
                    </b-table>
                </div>
            </slide>
        </carousel>
        <div class="modal-footer">
            <div class="col" v-if="page == 2">
                <a
                    href="javascript:void(0);"
                    @click="returnPPMP"
                    class="d-flex align-items-center"
                    ><i class="bx bx-chevron-left"></i> Return to PPMP List</a
                >
            </div>
            <div class="col text-right">
                <button
                    type="button"
                    class="btn btn-primary"
                    @click="dropData"
                    v-if="page == 2"
                >
                    Import
                </button>
                <button type="button" class="btn btn-link" @click="hideModal">
                    Close
                </button>
            </div>
        </div>
    </b-modal>
</template>