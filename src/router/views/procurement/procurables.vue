<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import { Carousel, Slide } from "vue-carousel";
import { groupBy } from "lodash";

export default {
    page: {
        title: "List of Procurables",
    },
    components: {
        Layout,
        PageHeader,
        Carousel,
        Slide,
    },
    data() {
        return {
            title: "Procurables",
            submitted: false,
            items: [
                {
                    text: "Dashboards",
                    href: "/",
                },
                {
                    text: "Procurables",
                    active: true,
                },
            ],
            tableData: [],
            searchData: [],
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
                    key: "office",
                    sortable: true,
                },
                {
                    key: "name",
                    sortable: true,
                    label: "API Name",
                    thStyle: { width: "48%" },
                },
                {
                    key: "totalAmt",
                    sortable: true,
                    label: "Total Amount",
                    thStyle: { width: "20%" },
                },
                {
                    key: "item",
                    sortable: true,
                    label: "Items",
                    thStyle: { width: "180px" },
                },
            ],
            indexSelected: -1,
            tableBusy: false,
            lastId: 0,
            moreLoading: false,
            searchHit: false,
        };
    },
    computed: {
        rows() {
            if(this.filter){
                return this.totalRows;
            }
            return this.tableData.length;
        },
    },
    beforeMount() {
        this.getInitialItems();
    },
    mounted() {
        this.getMoreItems();
    },
    created() {
        this.totalRows = this.items.length;
    },
    methods: {
        onFiltered(filteredSuppliers) {
            this.totalRows = filteredSuppliers.length;
            this.currentPage = 1;
        },
        getInitialItems() {
            this.tableBusy = true;
            this.$store
                .dispatch("procurable/GetProcurables", {
                    take: this.perPage,
                    lastId: this.lastId,
                    cycle: this.$store.state.data.cycle,
                })
                .then((res) => {
                    this.tableBusy = false;
                    res.data.forEach((item) => {
                        item.totalAmt = new Intl.NumberFormat("ja-JP", {
                            currency: "PHP",
                            style: "currency",
                        }).format(item.totalResources);
                        item.apiResources.forEach((x) => {
                            x.fundSource =
                                x.deliveryUnitBudgetItem.objectOfExpenditure.account.accountGroup.fundClassification.shortName;
                            x.fundClass =
                                x.deliveryUnitBudgetItem.objectOfExpenditure.account.accountGroup.groupName;
                            x.budgetLineItem =
                                x.deliveryUnitBudgetItem.objectOfExpenditure.account.accountName;
                        });
                        var groupedFS = groupBy(
                            item.apiResources,
                            "fundSource"
                        );
                        var groupedFC = [];
                        var fsID = 1;
                        var fcID = 1;
                        var bliID = 1;
                        for (const key in groupedFS) {
                            var data = {
                                key: key,
                                data: [],
                                toggleKey: true,
                                id: fsID++,
                            };
                            var FC = groupBy(groupedFS[key], "fundClass");
                            for (const y in FC) {
                                var group = {
                                    id: fcID++,
                                    data: [],
                                    key: y,
                                    toggleKey: true,
                                };
                                var bli = groupBy(FC[y], "budgetLineItem");
                                for (const x in bli) {
                                    var groupBLI = {
                                        id: bliID++,
                                        data: bli[x],
                                        key: x,
                                        toggleKey: true,
                                    };
                                    group.data.push(groupBLI);
                                }
                                data.data.push(group);
                            }
                            groupedFC.push(data);
                        }
                        item.grouped = groupedFC;
                    });
                    this.tableData = res.data;
                    this.lastId = res.data[res.data.length - 1].id;
                })
                .catch(() => {
                    this.tableBusy = false;
                    this.showToast("Something went wrong", "error");
                });
        },
        getMoreItems() {
            window.onscroll = () => {
                let bottomOfWindow =
                    document.documentElement.scrollTop + window.innerHeight ===
                    document.documentElement.offsetHeight;
                if (bottomOfWindow) {
                    this.moreLoading = true;
                    setTimeout(() => {
                        this.$store
                            .dispatch("procurable/GetProcurables", {
                                take: this.perPage,
                                lastId: this.lastId,
                                cycle: this.$store.state.data.cycle,
                            })
                            .then((res) => {
                                res.data.forEach((item) => {
                                    item.totalAmt = new Intl.NumberFormat(
                                        "ja-JP",
                                        {
                                            currency: "PHP",
                                            style: "currency",
                                        }
                                    ).format(item.totalResources);
                                    item.apiResources.forEach((x) => {
                                        x.fundSource =
                                            x.deliveryUnitBudgetItem.budgetLineItem.mfo.fundSource.sourceName;
                                        x.fundClass =
                                            x.deliveryUnitBudgetItem.budgetLineItem.mfo.fundClassification;
                                        x.budgetLineItem =
                                            x.deliveryUnitBudgetItem.budgetLineItem.description;
                                    });
                                    var groupedFS = groupBy(
                                        item.apiResources,
                                        "fundSource"
                                    );
                                    var groupedFC = [];
                                    var fsID = 1;
                                    var fcID = 1;
                                    var bliID = 1;
                                    for (const key in groupedFS) {
                                        var data = {
                                            key: key,
                                            data: [],
                                            toggleKey: true,
                                            id: fsID++,
                                        };
                                        var FC = groupBy(
                                            groupedFS[key],
                                            "fundClass"
                                        );
                                        for (const y in FC) {
                                            var group = {
                                                id: fcID++,
                                                data: [],
                                                key: y,
                                                toggleKey: true,
                                            };
                                            var bli = groupBy(
                                                FC[y],
                                                "budgetLineItem"
                                            );
                                            for (const x in bli) {
                                                var groupBLI = {
                                                    id: bliID++,
                                                    data: bli[x],
                                                    key: x,
                                                    toggleKey: true,
                                                };
                                                group.data.push(groupBLI);
                                            }
                                            data.data.push(group);
                                        }
                                        groupedFC.push(data);
                                    }
                                    item.grouped = groupedFC;
                                    this.tableData.push(item);
                                });
                                this.lastId = res.data[res.data.length - 1].id;
                                this.moreLoading = false;
                            })
                            .catch(() => {
                                this.moreLoading = false;
                                this.showToast("Something went wrong", "error");
                            });
                    }, 500);
                }
            };
        },
        searchProcurable() {
            this.tableBusy = true;
            this.searchHit = true;
            var data = this.tableData.filter((item) => {
                return item.name
                    .toUpperCase()
                    .includes(this.filter.toUpperCase());
            });
            this.searchData = data;
        },
        returnData(){
            if(!this.filter){
                this.searchHit = false;
            }
        }
    },
};
</script>

<template>
    <Layout>
        <PageHeader :title="title" :items="items" />
        <carousel
            ref="carousel"
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
                    <div class="col-12">
                        <div class="card border">
                            <div class="card-body">
                                <div
                                    class="
                                        d-flex
                                        justify-content-between
                                        align-items-center
                                    "
                                >
                                    <h4 class="card-title m-0">
                                        List of Procurables
                                    </h4>
                                </div>
                                <div class="row mt-4">
                                    <div class="col-sm-12 col-md-6">
                                        <!-- <div
                                            id="tickets-table_length"
                                            class="dataTables_length"
                                        >
                                            <label
                                                class="
                                                    d-inline-flex
                                                    align-items-center
                                                "
                                            >
                                                Show&nbsp;
                                                <b-form-select
                                                    class="
                                                        form-select
                                                        form-select-sm
                                                    "
                                                    v-model="perPage"
                                                    size="sm"
                                                    :options="pageOptions"
                                                ></b-form-select
                                                >&nbsp;entries
                                            </label>
                                        </div> -->
                                    </div>
                                    <!-- Search -->
                                    <div class="col-sm-12 col-md-6">
                                        <div
                                            id="tickets-table_filter"
                                            class="
                                                dataTables_filter
                                                text-md-end
                                            "
                                        >
                                            <label
                                                class="
                                                    d-inline-flex
                                                    align-items-center
                                                "
                                            >
                                                Search:
                                                <form
                                                    @submit.prevent="
                                                        searchProcurable
                                                    "
                                                >
                                                    <b-form-input
                                                        autocomplete="off"
                                                        v-model="filter"
                                                        @input="returnData"
                                                        type="search"
                                                        placeholder="Search..."
                                                        class="
                                                            form-control
                                                            form-control-sm
                                                            ms-2
                                                        "
                                                    ></b-form-input>
                                                </form>
                                            </label>
                                        </div>
                                    </div>
                                    <!-- End search -->
                                </div>
                                <div class="table-responsive mb-0">
                                    <b-table
                                        class="datatables"
                                        :items="
                                            searchHit ? searchData : tableData
                                        "
                                        :fields="fields"
                                        responsive="sm"
                                        :sort-by.sync="sortBy"
                                        :sort-desc.sync="sortDesc"
                                        bordered
                                        outlined
                                        hover
                                        striped
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
                                                        <i
                                                            class="
                                                                fas
                                                                fa-ellipsis-v
                                                            "
                                                        ></i>
                                                    </template>
                                                    <b-dropdown-item
                                                        @click="updateItem(row)"
                                                        variant="secondary"
                                                        ><i
                                                            class="
                                                                mdi mdi-update
                                                                font-size-18
                                                                me-1
                                                            "
                                                        ></i
                                                        >Edit</b-dropdown-item
                                                    >
                                                    <b-dropdown-item
                                                        @click="deleteItem(row)"
                                                        variant="danger"
                                                        ><i
                                                            class="
                                                                mdi
                                                                mdi-trash-can
                                                                font-size-18
                                                                me-1
                                                            "
                                                        ></i
                                                        >Delete</b-dropdown-item
                                                    >
                                                </b-dropdown>
                                            </div>
                                        </template>
                                        <template #cell(name)="data">
                                            <a
                                                href="javascript:void(0);"
                                                class="
                                                    d-flex
                                                    justify-content-start
                                                "
                                            >
                                                <b class="text-white">{{
                                                    data.item.name
                                                }}</b>
                                                <div>
                                                    <span
                                                        class="
                                                            badge
                                                            rounded-pill
                                                            bg-danger
                                                            float-end
                                                        "
                                                        style="font-size: 8px"
                                                        >{{
                                                            data.item
                                                                .notification >
                                                            0
                                                                ? data.item
                                                                      .notification
                                                                : ""
                                                        }}</span
                                                    >
                                                </div>
                                            </a>
                                            <div class="text-muted">
                                                {{ data.item.description }}
                                            </div>
                                        </template>
                                        <template #cell(office)="row">
                                            <div>
                                                <ul class="m-0 ps-2">
                                                    <li>
                                                        {{
                                                            row.item.target
                                                                .deliveryUnit
                                                                .office.name
                                                        }}
                                                        <ul
                                                            class="m-0 ps-0"
                                                            style="
                                                                list-style-type: '→';
                                                            "
                                                        >
                                                            <li>
                                                                <span
                                                                    class="
                                                                        badge
                                                                        bg-success
                                                                        font-size-12
                                                                        ms-1
                                                                    "
                                                                    >{{
                                                                        row.item
                                                                            .target
                                                                            .deliveryUnit
                                                                            .name
                                                                    }}</span
                                                                >
                                                            </li>
                                                        </ul>
                                                    </li>
                                                </ul>
                                            </div>
                                        </template>
                                        <template #cell(item)="row">
                                            <div
                                                class="
                                                    d-flex
                                                    justify-content-center
                                                "
                                            >
                                                <a
                                                    href="javascript:void(0);"
                                                    @click="row.toggleDetails"
                                                    class="
                                                        text-white
                                                        d-flex
                                                        align-items-center
                                                    "
                                                    ><i
                                                        class="
                                                            bx bx-food-menu
                                                            me-1
                                                        "
                                                    ></i
                                                    >{{
                                                        row.item._showDetails
                                                            ? "Hide"
                                                            : "Show"
                                                    }}
                                                    Items</a
                                                >
                                            </div>
                                        </template>
                                        <template #row-details="row">
                                            <div class="row">
                                                <div class="col-md-6">
                                                    <h5>List of Items</h5>
                                                </div>
                                                <div
                                                    class="col-md-6 text-right"
                                                >
                                                    <a
                                                        href="javascript:void();"
                                                        @click="
                                                            row.toggleDetails
                                                        "
                                                        class="
                                                            text-dark
                                                            font-size-16
                                                        "
                                                        ><i class="bx bx-x"></i
                                                    ></a>
                                                </div>
                                            </div>
                                            <div class="row">
                                                <div class="col-md-12">
                                                    <div role="tablist">
                                                        <template
                                                            v-for="x in row.item
                                                                .grouped"
                                                        >
                                                            <b-card
                                                                no-body
                                                                class="mb-1"
                                                                :key="
                                                                    'XCARD' +
                                                                    x.id
                                                                "
                                                            >
                                                                <b-card-header
                                                                    header-tag="header"
                                                                    role="tab"
                                                                    class="
                                                                        d-flex
                                                                        align-items-center
                                                                        justify-content-between
                                                                        px-3
                                                                        py-1
                                                                        cursor-pointer
                                                                    "
                                                                    @click="
                                                                        x.toggleKey =
                                                                            !x.toggleKey
                                                                    "
                                                                >
                                                                    <div
                                                                        class="
                                                                            d-flex
                                                                            align-items-center
                                                                        "
                                                                    >
                                                                        <i
                                                                            class="
                                                                                bx
                                                                                bx-chevron-right
                                                                                rotate
                                                                            "
                                                                            :class="{
                                                                                'rotate-90':
                                                                                    x.toggleKey,
                                                                            }"
                                                                        ></i
                                                                        >{{
                                                                            x.key
                                                                        }}
                                                                    </div>
                                                                </b-card-header>
                                                            </b-card>
                                                            <b-collapse
                                                                :accordion="`technical-review-accordionx-${x.id}${row.item.id}`"
                                                                role="tabpanel"
                                                                :visible="
                                                                    x.toggleKey
                                                                "
                                                                :key="
                                                                    'XCOL' +
                                                                    x.id
                                                                "
                                                            >
                                                                <template
                                                                    v-for="y in x.data"
                                                                >
                                                                    <b-card
                                                                        no-body
                                                                        class="
                                                                            mb-1
                                                                            ms-2
                                                                        "
                                                                        :key="
                                                                            'YCARD' +
                                                                            y.id
                                                                        "
                                                                    >
                                                                        <b-card-header
                                                                            header-tag="header"
                                                                            role="tab"
                                                                            class="
                                                                                d-flex
                                                                                align-items-center
                                                                                justify-content-between
                                                                                px-3
                                                                                py-1
                                                                                cursor-pointer
                                                                            "
                                                                            @click="
                                                                                y.toggleKey =
                                                                                    !y.toggleKey
                                                                            "
                                                                        >
                                                                            <div
                                                                                class="
                                                                                    d-flex
                                                                                    align-items-center
                                                                                "
                                                                            >
                                                                                <i
                                                                                    class="
                                                                                        bx
                                                                                        bx-chevron-right
                                                                                        rotate
                                                                                    "
                                                                                    :class="{
                                                                                        'rotate-90':
                                                                                            y.toggleKey,
                                                                                    }"
                                                                                ></i
                                                                                >{{
                                                                                    y.key
                                                                                }}
                                                                            </div>
                                                                        </b-card-header>
                                                                    </b-card>
                                                                    <b-collapse
                                                                        :accordion="`technical-review-accordiony-${y.id}`"
                                                                        role="tabpanel"
                                                                        :visible="
                                                                            y.toggleKey
                                                                        "
                                                                        :key="
                                                                            'YCOL' +
                                                                            y.id
                                                                        "
                                                                    >
                                                                        <template
                                                                            v-for="z in y.data"
                                                                        >
                                                                            <b-card
                                                                                no-body
                                                                                class="
                                                                                    mb-1
                                                                                    ms-4
                                                                                "
                                                                                :key="
                                                                                    'ZCARD' +
                                                                                    z.id
                                                                                "
                                                                            >
                                                                                <b-card-header
                                                                                    header-tag="header"
                                                                                    role="tab"
                                                                                    class="
                                                                                        d-flex
                                                                                        align-items-center
                                                                                        justify-content-between
                                                                                        px-3
                                                                                        py-1
                                                                                        cursor-pointer
                                                                                    "
                                                                                    @click="
                                                                                        z.toggleKey =
                                                                                            !z.toggleKey
                                                                                    "
                                                                                    ><div
                                                                                        class="
                                                                                            d-flex
                                                                                            align-items-center
                                                                                        "
                                                                                    >
                                                                                        <i
                                                                                            class="
                                                                                                bx
                                                                                                bx-chevron-right
                                                                                                rotate
                                                                                            "
                                                                                            :class="{
                                                                                                'rotate-90':
                                                                                                    z.toggleKey,
                                                                                            }"
                                                                                        ></i
                                                                                        >{{
                                                                                            z.key
                                                                                        }}
                                                                                    </div>
                                                                                </b-card-header>
                                                                                <b-collapse
                                                                                    :accordion="`technical-review-accordionz-${z.id}${row.item.id}`"
                                                                                    role="tabpanel"
                                                                                    :visible="
                                                                                        z.toggleKey
                                                                                    "
                                                                                    :key="
                                                                                        'YCOL' +
                                                                                        z.id
                                                                                    "
                                                                                >
                                                                                    <template
                                                                                        v-for="w in z.data"
                                                                                    >
                                                                                        <b-card-body
                                                                                            class="
                                                                                                py-1
                                                                                                px-5
                                                                                                bg-primary
                                                                                                bg-soft
                                                                                                mb-1
                                                                                                mt-1
                                                                                            "
                                                                                            :key="
                                                                                                'W' +
                                                                                                w.id
                                                                                            "
                                                                                        >
                                                                                            <b-row
                                                                                                class="
                                                                                                    my-1
                                                                                                "
                                                                                            >
                                                                                                <b-col
                                                                                                    sm="6"
                                                                                                >
                                                                                                    <div>
                                                                                                        <b
                                                                                                            >Item
                                                                                                            Name:</b
                                                                                                        >
                                                                                                        {{
                                                                                                            w.itemName
                                                                                                        }}
                                                                                                    </div>
                                                                                                    <div>
                                                                                                        <b
                                                                                                            >Description:</b
                                                                                                        >
                                                                                                        {{
                                                                                                            w.description
                                                                                                        }}
                                                                                                    </div>
                                                                                                </b-col>
                                                                                                <b-col>
                                                                                                    <div>
                                                                                                        <b
                                                                                                            >Unit
                                                                                                            Cost:</b
                                                                                                        >
                                                                                                        {{
                                                                                                            Intl.NumberFormat(
                                                                                                                "ja-JP",
                                                                                                                {
                                                                                                                    currency:
                                                                                                                        "PHP",
                                                                                                                    style: "currency",
                                                                                                                }
                                                                                                            ).format(
                                                                                                                w.unitCost
                                                                                                            )
                                                                                                        }}
                                                                                                    </div>
                                                                                                    <span
                                                                                                        class="
                                                                                                            badge
                                                                                                            bg-success
                                                                                                            font-size-13
                                                                                                        "
                                                                                                        v-if="
                                                                                                            w.isProcurable
                                                                                                        "
                                                                                                    >
                                                                                                        Procurable
                                                                                                    </span>
                                                                                                    <span
                                                                                                        class="
                                                                                                            badge
                                                                                                            bg-info
                                                                                                            font-size-13
                                                                                                        "
                                                                                                        v-if="
                                                                                                            !w.isProcurable
                                                                                                        "
                                                                                                    >
                                                                                                        Not
                                                                                                        Procurable
                                                                                                    </span>
                                                                                                </b-col>
                                                                                            </b-row>
                                                                                        </b-card-body>
                                                                                    </template>
                                                                                </b-collapse>
                                                                            </b-card>
                                                                        </template>
                                                                    </b-collapse>
                                                                </template>
                                                            </b-collapse>
                                                        </template>
                                                    </div>
                                                </div>
                                            </div>
                                        </template>
                                    </b-table>
                                </div>
                                <!-- <div class="row">
                                    <div class="col">
                                        <div
                                            class="
                                                dataTables_paginate
                                                paging_simple_numbers
                                                float-end
                                            "
                                        >
                                            <ul
                                                class="
                                                    pagination
                                                    pagination-rounded
                                                    mb-0
                                                "
                                            >
                                                <b-pagination
                                                    v-model="currentPage"
                                                    :total-rows="rows"
                                                    :per-page="perPage"
                                                ></b-pagination>
                                            </ul>
                                        </div>
                                    </div>
                                </div> -->
                                <div class="row" v-if="moreLoading">
                                    <div class="col text-center">
                                        <div class="preloader-component me-2">
                                            <div class="status">
                                                <div
                                                    class="
                                                        spinner-chase
                                                        w-20px
                                                        h-20px
                                                    "
                                                >
                                                    <div
                                                        class="chase-dot"
                                                    ></div>
                                                    <div
                                                        class="chase-dot"
                                                    ></div>
                                                    <div
                                                        class="chase-dot"
                                                    ></div>
                                                    <div
                                                        class="chase-dot"
                                                    ></div>
                                                    <div
                                                        class="chase-dot"
                                                    ></div>
                                                    <div
                                                        class="chase-dot"
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                        <strong>Loading More Items...</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </slide>
        </carousel>
    </Layout>
</template>