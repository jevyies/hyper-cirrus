<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import { cloneDeep, groupBy } from "lodash";
import { required } from "vuelidate/lib/validators";
import Swal from "sweetalert2";
import createNumberMask from "text-mask-addons/dist/createNumberMask";
import MaskedInput from "vue-text-mask";

export default {
    page: {
        title: "Purchase Requests",
    },
    components: {
        Layout,
        PageHeader,
        MaskedInput,
    },
    data() {
        return {
            title: "My Purchase Requests",
            submitted: false,
            items: [
                {
                    text: "Dashboards",
                    href: "/",
                },
                {
                    text: "My Purchase Requests",
                    active: true,
                },
            ],
            singleSelection: true,
            currencyMask: createNumberMask({
                prefix: "",
                includeThousandsSeparator: false,
                allowDecimal: true,
            }),
            modalTitle: "",
            availableTable: [],
            availableBusy: false,
            filterItem: "",
            filterCartItems: "",
            filterUpdateItems: "",
            pageOptions: [10, 25, 50, 100],
            perPageItem: 10,
            perPageUpdate: 10,
            currentPageItem: 1,
            currentPageUpdate: 1,
            selectedItems: [],
            monthsNickname: [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "June",
                "July",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
            ],
            cartCount: 0,
            cartItems: [],
            cartVariables: {},
            pr: {
                id: 0,
                description: "",
            },
            prHeader: {
                id: 0,
                description: "",
            },
            tabIndex: 0,
            prData: [],
            posted: [],
            approved: [],
            returned: [],
            prBusy: false,
            updateItems: [],
            cartBusy: false,
            updateBusy: false,
            showUpdatePR: false,
            filterReturn: '',
            filterPosted: '',
            filterApproved: '',
            currentPagePR: 1,
            perPagePR: 10,
        };
    },
    created() {
        this.changeCycle(this.$store.state.data.cycle);
    },
    validations: {
        pr: {
            description: { required },
        },
        prHeader: {
            description: { required },
        },
    },
    computed: {
        filteredAvailableItems() {
            let data = this.availableTable;
            var total = this.currentPageItem * this.perPageItem;
            if (this.filterItem.trim() != "" && this.filterItem) {
                data = data.filter((item) => {
                    return item.searchApi
                        .toUpperCase()
                        .includes(this.filterItem.toUpperCase());
                });
            }
            var currentData = data.slice(total - this.perPageItem, total);
            if (this.currentPageItem > 1 && currentData.length == 0) {
                total = (this.currentPageItem - 1) * this.perPageItem;
                currentData = data.slice(total - this.perPageItem, total);
            }
            return currentData;
        },
        selectedAvailableItems() {
            let items = [];
            this.availableTable.forEach((item) => {
                item.apiResources.forEach((x) => {
                    x.toggleSelected && items.push(x);
                });
            });
            return items;
        },
        filteredCartItems() {
            let data = this.cartItems;
            var total = this.currentPageItem * this.perPageItem;
            if (this.filterCartItems.trim() != "" && this.filterCartItems) {
                data = data.filter((item) => {
                    return item.apiResource.itemName
                        .toUpperCase()
                        .includes(this.filterCartItems.toUpperCase());
                });
            }
            var currentData = data.slice(total - this.perPageItem, total);
            if (this.currentPageItem > 1 && currentData.length == 0) {
                total = (this.currentPageItem - 1) * this.perPageItem;
                currentData = data.slice(total - this.perPageItem, total);
            }
            return currentData;
        },
        rowsCartItems() {
            if (this.filterCartItems.trim() != "" && this.filterCartItems) {
                return this.filteredCartItems.length;
            } else {
                return this.cartItems.length;
            }
        },
        filteredUpdateItems() {
            let data = this.updateItems;
            var total = this.currentPageUpdate * this.perPageUpdate;
            if (this.filterUpdateItems.trim() != "" && this.filterUpdateItems) {
                data = data.filter((item) => {
                    return item.apiResource.itemName
                        .toUpperCase()
                        .includes(this.filterUpdateItems.toUpperCase());
                });
            }
            var currentData = data.slice(total - this.perPageUpdate, total);
            if (this.currentPageUpdate > 1 && currentData.length == 0) {
                total = (this.currentPageUpdate - 1) * this.perPageUpdate;
                currentData = data.slice(total - this.perPageUpdate, total);
            }
            return currentData;
        },
        rowsUpdateItems() {
            if (this.filterUpdateItems.trim() != "" && this.filterUpdateItems) {
                return this.filteredUpdateItems.length;
            } else {
                return this.updateItems.length;
            }
        },
        filteredReturn() {
            let data = this.returned;
            var total = this.currentPagePR * this.perPagePR;
            if (this.filterReturn.trim() != "" && this.filterReturn) {
                data = data.filter((item) => {
                    return item.searchKey
                        .toUpperCase()
                        .includes(this.filterReturn.toUpperCase());
                });
            }
            var currentData = data.slice(total - this.perPagePR, total);
            if (this.currentPagePR > 1 && currentData.length == 0) {
                total = (this.currentPagePR - 1) * this.perPagePR;
                currentData = data.slice(total - this.perPagePR, total);
            }
            return currentData;
        },
        rowsReturn() {
            if (this.filterReturn.trim() != "" && this.filterReturn) {
                return this.filteredReturn.length;
            } else {
                return this.returned.length;
            }
        },
        filteredPosted() {
            let data = this.posted;
            var total = this.currentPagePR * this.perPagePR;
            if (this.filterPosted.trim() != "" && this.filterPosted) {
                data = data.filter((item) => {
                    return item.searchKey
                        .toUpperCase()
                        .includes(this.filterPosted.toUpperCase());
                });
            }
            var currentData = data.slice(total - this.perPagePR, total);
            if (this.currentPagePR > 1 && currentData.length == 0) {
                total = (this.currentPagePR - 1) * this.perPagePR;
                currentData = data.slice(total - this.perPagePR, total);
            }
            return currentData;
        },
        rowsPosted() {
            if (this.filterPosted.trim() != "" && this.filterPosted) {
                return this.filteredPosted.length;
            } else {
                return this.posted.length;
            }
        },
        filteredApproved() {
            let data = this.approved;
            var total = this.currentPagePR * this.perPagePR;
            if (this.filterApproved.trim() != "" && this.filterApproved) {
                data = data.filter((item) => {
                    return item.searchKey
                        .toUpperCase()
                        .includes(this.filterApproved.toUpperCase());
                });
            }
            var currentData = data.slice(total - this.perPagePR, total);
            if (this.currentPagePR > 1 && currentData.length == 0) {
                total = (this.currentPagePR - 1) * this.perPagePR;
                currentData = data.slice(total - this.perPagePR, total);
            }
            return currentData;
        },
        rowsApproved() {
            if (this.filterApproved.trim() != "" && this.filterApproved) {
                return this.filteredApproved.length;
            } else {
                return this.approved.length;
            }
        },
    },
    methods: {
        changeCycle(cycle) {
            this.getAvailableItems(cycle);
            this.getCartItems(cycle);
            this.getAllMyPR(cycle);
        },
        getAvailableItems(cycle) {
            this.availableTable = [];
            this.availableBusy = true;
            this.$store
                .dispatch("pritem/GetAvailableAPIs", cycle)
                .then((res) => {
                    this.availableBusy = false;
                    res.data.forEach((y) => {
                        y.checkAllWork = false;
                        var searchApi = '';
                        y.apiResources.forEach((item) => {
                            searchApi += item.itemName + ' ';
                            item.toggleSelected = false;
                            item.editQty = true;
                            item.submitError = false;
                            item.apiResourceDetails.forEach((x) => {
                                if (x.monthId == 1) {
                                    item.Jan = 2;
                                    item.JanValue = parseFloat(
                                        x.quantity
                                    ).toString();
                                    item.JanMax = parseFloat(x.quantity);
                                }
                                if (x.monthId == 2) {
                                    item.Feb = 2;
                                    item.FebValue = parseFloat(
                                        x.quantity
                                    ).toString();
                                    item.FebMax = parseFloat(x.quantity);
                                }
                                if (x.monthId == 3) {
                                    item.Mar = 2;
                                    item.MarValue = parseFloat(
                                        x.quantity
                                    ).toString();
                                    item.MarMax = parseFloat(x.quantity);
                                }
                                if (x.monthId == 4) {
                                    item.Apr = 2;
                                    item.AprValue = parseFloat(
                                        x.quantity
                                    ).toString();
                                    item.AprMax = parseFloat(x.quantity);
                                }
                                if (x.monthId == 5) {
                                    item.May = 2;
                                    item.MayValue = parseFloat(
                                        x.quantity
                                    ).toString();
                                    item.MayMax = parseFloat(x.quantity);
                                }
                                if (x.monthId == 6) {
                                    item.June = 2;
                                    item.JuneValue = parseFloat(
                                        x.quantity
                                    ).toString();
                                    item.JuneMax = parseFloat(x.quantity);
                                }
                                if (x.monthId == 7) {
                                    item.July = 2;
                                    item.JulyValue = parseFloat(
                                        x.quantity
                                    ).toString();
                                    item.JulyMax = parseFloat(x.quantity);
                                }
                                if (x.monthId == 8) {
                                    item.Aug = 2;
                                    item.AugValue = parseFloat(
                                        x.quantity
                                    ).toString();
                                    item.AugMax = parseFloat(x.quantity);
                                }
                                if (x.monthId == 9) {
                                    item.Sep = 2;
                                    item.SepValue = parseFloat(
                                        x.quantity
                                    ).toString();
                                    item.SepMax = parseFloat(x.quantity);
                                }
                                if (x.monthId == 10) {
                                    item.Oct = 2;
                                    item.OctValue = parseFloat(
                                        x.quantity
                                    ).toString();
                                    item.OctMax = parseFloat(x.quantity);
                                }
                                if (x.monthId == 11) {
                                    item.Nov = 2;
                                    item.NovValue = parseFloat(
                                        x.quantity
                                    ).toString();
                                    item.NovMax = parseFloat(x.quantity);
                                }
                                if (x.monthId == 12) {
                                    item.Dec = 2;
                                    item.DecValue = parseFloat(
                                        x.quantity
                                    ).toString();
                                    item.DecMax = parseFloat(x.quantity);
                                }
                            });
                        });
                        y.searchApi = y.name + ' ' + searchApi;
                    });
                    this.availableTable = res.data;
                })
                .catch((err) => {
                    this.availableBusy = false;
                    this.showToast("Something went wrong!","error");
                });
        },
        getCartItems(cycle) {
            this.cartItems = [];
            this.cartBusy = true;
            this.$store
                .dispatch("pr/GetPRCarts", cycle)
                .then((res) => {
                    if (res.data) {
                        res.data.prItems.forEach((item) => {
                            item.editQty = false;
                            item.submitError = false;
                            item.apiResource.apiResourceDetails.forEach((y) => {
                                if (y.monthId == 1) {
                                    item.Jan = 2;
                                    item.JanMax = parseFloat(y.available);
                                }
                                if (y.monthId == 2) {
                                    item.Feb = 2;
                                    item.FebMax = parseFloat(y.available);
                                }
                                if (y.monthId == 3) {
                                    item.Mar = 2;
                                    item.MarMax = parseFloat(y.available);
                                }
                                if (y.monthId == 4) {
                                    item.Apr = 2;
                                    item.AprMax = parseFloat(y.available);
                                }
                                if (y.monthId == 5) {
                                    item.May = 2;
                                    item.MayMax = parseFloat(y.available);
                                }
                                if (y.monthId == 6) {
                                    item.June = 2;
                                    item.JuneMax = parseFloat(y.available);
                                }
                                if (y.monthId == 7) {
                                    item.July = 2;
                                    item.JulyMax = parseFloat(y.available);
                                }
                                if (y.monthId == 8) {
                                    item.Aug = 2;
                                    item.AugMax = parseFloat(y.available);
                                }
                                if (y.monthId == 9) {
                                    item.Sep = 2;
                                    item.SepMax = parseFloat(y.available);
                                }
                                if (y.monthId == 10) {
                                    item.Oct = 2;
                                    item.OctMax = parseFloat(y.available);
                                }
                                if (y.monthId == 11) {
                                    item.Nov = 2;
                                    item.NovMax = parseFloat(y.available);
                                }
                                if (y.monthId == 12) {
                                    item.Dec = 2;
                                    item.DecMax = parseFloat(y.available);
                                }
                            });
                            item.prItemDetails.forEach((x) => {
                                if (item.Jan == 2) {
                                    if (x.monthId == 1) {
                                        item.JanId = x.id;
                                        item.JanValue = parseFloat(
                                            x.quantity
                                        ).toString();
                                        item.JanMax += parseFloat(x.quantity);
                                    }
                                }
                                if (item.Feb == 2) {
                                    if (x.monthId == 2) {
                                        item.FebId = x.id;
                                        item.FebValue = parseFloat(
                                            x.quantity
                                        ).toString();
                                        item.FebMax += parseFloat(x.quantity);
                                    }
                                }
                                if (item.Mar == 2) {
                                    if (x.monthId == 3) {
                                        item.MarId = x.id;
                                        item.MarValue = parseFloat(
                                            x.quantity
                                        ).toString();
                                        item.MarMax += parseFloat(x.quantity);
                                    }
                                }
                                if (item.Apr == 2) {
                                    if (x.monthId == 4) {
                                        item.AprId = x.id;
                                        item.AprValue = parseFloat(
                                            x.quantity
                                        ).toString();
                                        item.AprMax += parseFloat(x.quantity);
                                    }
                                }
                                if (item.May == 2) {
                                    if (x.monthId == 5) {
                                        item.MayId = x.id;
                                        item.MayValue = parseFloat(
                                            x.quantity
                                        ).toString();
                                        item.MayMax += parseFloat(x.quantity);
                                    }
                                }
                                if (item.June == 2) {
                                    if (x.monthId == 6) {
                                        item.JuneId = x.id;
                                        item.JuneValue = parseFloat(
                                            x.quantity
                                        ).toString();
                                        item.JuneMax += parseFloat(x.quantity);
                                    }
                                }
                                if (item.July == 2) {
                                    if (x.monthId == 7) {
                                        item.JulyId = x.id;
                                        item.JulyValue = parseFloat(
                                            x.quantity
                                        ).toString();
                                        item.JulyMax += parseFloat(x.quantity);
                                    }
                                }
                                if (item.Aug == 2) {
                                    if (x.monthId == 8) {
                                        item.AugId = x.id;
                                        item.AugValue = parseFloat(
                                            x.quantity
                                        ).toString();
                                        item.AugMax += parseFloat(x.quantity);
                                    }
                                }
                                if (item.Sep == 2) {
                                    if (x.monthId == 9) {
                                        item.SepId = x.id;
                                        item.SepValue = parseFloat(
                                            x.quantity
                                        ).toString();
                                        item.SepMax += parseFloat(x.quantity);
                                    }
                                }
                                if (item.Oct == 2) {
                                    if (x.monthId == 10) {
                                        item.OctId = x.id;
                                        item.OctValue = parseFloat(
                                            x.quantity
                                        ).toString();
                                        item.OctMax += parseFloat(x.quantity);
                                    }
                                }
                                if (item.Nov == 2) {
                                    if (x.monthId == 11) {
                                        item.NovId = x.id;
                                        item.NovValue = parseFloat(
                                            x.quantity
                                        ).toString();
                                        item.NovMax += parseFloat(x.quantity);
                                    }
                                }
                                if (item.Dec == 2) {
                                    if (x.monthId == 12) {
                                        item.DecId = x.id;
                                        item.DecValue = parseFloat(
                                            x.quantity
                                        ).toString();
                                        item.DecMax += parseFloat(x.quantity);
                                    }
                                }
                            });
                        });
                        this.pr.id = res.data.id;
                        this.cartItems = res.data.prItems;
                        this.cartCount = this.cartItems.length;
                        this.cartBusy = false;
                    } else {
                        this.cartCount = 0;
                        this.cartBusy = false;
                    }
                })
                .catch((err) => {
                    this.cartBusy = false;
                    this.showToast("Something went wrong!","error");
                });
        },
        getAllMyPR(cycle) {
            this.prData = [];
            this.posted = [];
            this.approved = [];
            this.returned = [];
            this.prBusy = true;
            this.$store
                .dispatch("pr/GetPrByCycle", cycle)
                .then((res) => {
                    this.prBusy = false;
                    if (res.data.error) {
                        return this.showToast(res.errorMessage.message, "error");
                    }
                    res.data.forEach((item) => {
                        item.attachmentLoading = false;
                        item.visible = false;
                        item.itemLoaded = false;
                        item.itemLoading = false;
                        item.attachments = [];
                        item.status = item.status.toUpperCase();
                        item.showAttachments = false;
                        item.fileSearch = '';
                        item.searchKey = `${item.description} ${item.prNumber}`;
                    });
                    this.prData = res.data;
                    var grouped = groupBy(res.data, "status");
                    for (const key in grouped) {
                        if (key.includes("POST")) {
                            this.posted = grouped[key];
                        } else if (key.includes("APPROVE")) {
                            this.approved = grouped[key];
                        } else if (key.includes("RETURN")) {
                            this.returned = grouped[key];
                        }
                    }
                })
                .catch((err) => {
                    this.cartBusy = false;
                    this.showToast("Something went wrong!","error");
                });
            // this.$store
            //     .dispatch("pr/GetPostedPr", cycle)
            //     .then((res) => {
            //         this.prBusy = false;
            //         if (res.data.error) {
            //             return (this.alert = {
            //                 type: "success",
            //                 message: res.data.errorMessage,
            //             });
            //         }
            //         res.data.forEach((item) => {
            //             item.visible = false;
            //             item.itemLoaded = false;
            //             item.itemLoading = false;
            //             item.prItems = [];
            //         });
            //         this.posted = res.data
            //     })
            //     .catch((err) => {
            //         this.cartBusy = false;
            //         this.alert = {
            //             type: "danger",
            //             message: "Something went wrong!",
            //         };
            //     });
            // this.$store
            //     .dispatch("pr/GetApprovedPr", cycle)
            //     .then((res) => {
            //         this.prBusy = false;
            //         if (res.data.error) {
            //             return (this.alert = {
            //                 type: "success",
            //                 message: res.data.errorMessage,
            //             });
            //         }
            //         res.data.forEach((item) => {
            //             item.visible = false;
            //             item.itemLoaded = false;
            //             item.itemLoading = false;
            //             item.prItems = [];
            //         });
            //         this.approved = res.data
            //     })
            //     .catch((err) => {
            //         this.cartBusy = false;
            //         this.alert = {
            //             type: "danger",
            //             message: "Something went wrong!",
            //         };
            //     });
            // this.$store
            //     .dispatch("pr/GetReturnedPr", cycle)
            //     .then((res) => {
            //         this.prBusy = false;
            //         if (res.data.error) {
            //             return (this.alert = {
            //                 type: "success",
            //                 message: res.data.errorMessage,
            //             });
            //         }
            //         res.data.forEach((item) => {
            //             item.visible = false;
            //             item.itemLoaded = false;
            //             item.itemLoading = false;
            //             item.prItems = [];
            //         });
            //         this.returned = res.data
            //     })
            //     .catch((err) => {
            //         this.cartBusy = false;
            //         this.alert = {
            //             type: "danger",
            //             message: "Something went wrong!",
            //         };
            //     });
        },
        refreshData(idx) {
            if (idx == this.tabIndex) return;
            if (idx == 0) {
                this.getAvailableItems(this.$store.state.data.cycle);
            } else if (idx == 1) {
                this.showUpdatePR = false;
                this.getCartItems(this.$store.state.data.cycle);
            } else if (idx == 2) {
                this.getAllMyPR(this.$store.state.data.cycle);
            }
        },
        toggleSelectionMode() {
            this.singleSelection = !this.singleSelection;
            this.availableTable.forEach((item) => {
                item.checkAllWork = false;
                this.checkEntireWork(item);
            });
        },
        checkEntireWork(x) {
            x.apiResources.forEach((item) => {
                item.toggleSelected = x.checkAllWork;
            });
        },
        checkApiResource(y) {
            let count = 0;
            y.apiResources.forEach((item) => {
                item.toggleSelected && count++;
            });
            y.checkAllWork = count == y.apiResources.length ? true : false;
        },
        sumUp(row) {
            row.submitError = false;
            row.q1 =
                (row.JanValue ? parseFloat(row.JanValue) : 0) +
                (row.FebValue ? parseFloat(row.FebValue) : 0) +
                (row.MarValue ? parseFloat(row.MarValue) : 0);
            row.q2 =
                (row.AprValue ? parseFloat(row.AprValue) : 0) +
                (row.MayValue ? parseFloat(row.MayValue) : 0) +
                (row.JuneValue ? parseFloat(row.JuneValue) : 0);
            row.q3 =
                (row.JulyValue ? parseFloat(row.JulyValue) : 0) +
                (row.AugValue ? parseFloat(row.AugValue) : 0) +
                (row.SepValue ? parseFloat(row.SepValue) : 0);
            row.q4 =
                (row.OctValue ? parseFloat(row.OctValue) : 0) +
                (row.NovValue ? parseFloat(row.NovValue) : 0) +
                (row.DecValue ? parseFloat(row.DecValue) : 0);
            row.totalQuantity = row.q1 + row.q2 + row.q3 + row.q4;
            row.total =
                parseFloat(row.totalQuantity) * parseFloat(row.unitCost);
        },
        addToCart(x) {
            this.modalTitle = "PR Item Details";
            this.selectedItems = cloneDeep(x);
            this.selectedItems.forEach((item) => {
                item.JanValue = item.Jan ? "1" : 0;
                item.FebValue = item.Feb ? "1" : 0;
                item.MarValue = item.Mar ? "1" : 0;
                item.AprValue = item.Apr ? "1" : 0;
                item.MayValue = item.May ? "1" : 0;
                item.JuneValue = item.June ? "1" : 0;
                item.JulyValue = item.July ? "1" : 0;
                item.AugValue = item.Aug ? "1" : 0;
                item.SepValue = item.Sep ? "1" : 0;
                item.OctValue = item.Oct ? "1" : 0;
                item.NovValue = item.Nov ? "1" : 0;
                item.DecValue = item.Dec ? "1" : 0;
                this.sumUp(item);
            });
            this.$bvModal.show("order-details-modal");
        },
        checkItems(row, type = 0) {
            var error = 0;
            var resultArray = [];
            if (row.JanValue || type == 1) {
                resultArray.push({
                    id: row.JanId ? row.JanId : 0,
                    monthId: 1,
                    quantity: row.JanValue ? parseFloat(row.JanValue) : 0,
                });
                if (row.JanValue > row.JanMax) {
                    error++;
                }
            }
            if (row.FebValue || type == 1) {
                resultArray.push({
                    id: row.FebId ? row.FebId : 0,
                    monthId: 2,
                    quantity: row.FebValue ? parseFloat(row.FebValue) : 0,
                });
                if (row.FebValue > row.FebMax) {
                    error++;
                }
            }
            if (row.MarValue || type == 1) {
                resultArray.push({
                    id: row.MarId ? row.MarId : 0,
                    monthId: 3,
                    quantity: row.MarValue ? parseFloat(row.MarValue) : 0,
                });
                if (row.MarValue > row.MarMax) {
                    error++;
                }
            }
            if (row.AprValue || type == 1) {
                resultArray.push({
                    id: row.AprId ? row.AprId : 0,
                    monthId: 4,
                    quantity: row.AprValue ? parseFloat(row.AprValue) : 0,
                });
                if (row.AprValue > row.AprMax) {
                    error++;
                }
            }
            if (row.MayValue || type == 1) {
                resultArray.push({
                    id: row.MayId ? row.MayId : 0,
                    monthId: 5,
                    quantity: row.MayValue ? parseFloat(row.MayValue) : 0,
                });
                if (row.MayValue > row.MayMax) {
                    error++;
                }
            }
            if (row.JuneValue || type == 1) {
                resultArray.push({
                    id: row.JuneId ? row.JuneId : 0,
                    monthId: 6,
                    quantity: row.JuneValue ? parseFloat(row.JuneValue) : 0,
                });
                if (row.JuneValue > row.JuneMax) {
                    error++;
                }
            }
            if (row.JulyValue || type == 1) {
                resultArray.push({
                    id: row.JulyId ? row.JulyId : 0,
                    prItemId: row.id,
                    monthId: 7,
                    quantity: row.JulyValue ? parseFloat(row.JulyValue) : 0,
                });
                if (row.JulyValue > row.JulyMax) {
                    error++;
                }
            }
            if (row.AugValue || type == 1) {
                resultArray.push({
                    id: row.AugId ? row.AugId : 0,
                    monthId: 8,
                    quantity: row.AugValue ? parseFloat(row.AugValue) : 0,
                });
                if (row.AugValue > row.AugMax) {
                    error++;
                }
            }
            if (row.SepValue || type == 1) {
                resultArray.push({
                    id: row.SepId ? row.SepId : 0,
                    monthId: 9,
                    quantity: row.SepValue ? parseFloat(row.SepValue) : 0,
                });
                if (row.SepValue > row.SepMax) {
                    error++;
                }
            }
            if (row.OctValue || type == 1) {
                resultArray.push({
                    id: row.OctId ? row.OctId : 0,
                    monthId: 10,
                    quantity: row.OctValue ? parseFloat(row.OctValue) : 0,
                });
                if (row.OctValue > row.OctMax) {
                    error++;
                }
            }
            if (row.NovValue || type == 1) {
                resultArray.push({
                    id: row.NovId ? row.NovId : 0,
                    monthId: 11,
                    quantity: row.NovValue ? parseFloat(row.NovValue) : 0,
                });
                if (row.NovValue > row.NovMax) {
                    error++;
                }
            }
            if (row.DecValue || type == 1) {
                resultArray.push({
                    id: row.DecId ? row.DecId : 0,
                    monthId: 12,
                    quantity: row.DecValue ? parseFloat(row.DecValue) : 0,
                });
                if (row.DecValue > row.DecMax) {
                    error++;
                }
            }
            return { result: resultArray, error: error > 0 ? true : false };
        },
        loopMonthsForDeduction(row, result) {
            this.monthsNickname.forEach((item) => {
                if (
                    row[`${item}Value`] &&
                    parseFloat(row[`${item}Value`]) > 0
                ) {
                    result[`${item}Max`] =
                        parseFloat(result[`${item}Max`]) -
                        parseFloat(row[`${item}Value`]);
                    result[`${item}Value`] = result[`${item}Max`];
                }
            });
        },
        totalOrderedAmt() {
            return this.selectedItems.reduce((pv, cv) => {
                return pv + parseFloat(cv.total);
            }, 0);
        },
        totalCartAmt() {
            return this.cartItems.reduce((pv, cv) => {
                return pv + parseFloat(cv.total);
            }, 0);
        },
        totalUpdateAmt() {
            return this.updateItems.reduce((pv, cv) => {
                return pv + parseFloat(cv.total);
            }, 0);
        },
        deductQty(row) {
            this.availableTable.forEach((item) => {
                let result = item.apiResources.find((x) => x.id == row.id);
                console.log(result);
                if(result){
                    this.loopMonthsForDeduction(row, result);
                    this.sumUp(result);
                    if(result.totalQuantity == 0){
                        this.availableTable.splice(this.availableTable.indexOf(item), 1);
                    }
                }
            });
        },
        async onCreatePRItems() {
            var errors = 0;
            this.selectedItems.forEach((x) => {
                let result = this.checkItems(x);
                if (result.error) {
                    x.submitError = true;
                    errors++;
                }
            });
            if (errors > 0) {
                return;
            }
            for (const x of this.selectedItems){
                x.submitError = false;
                let prItemDetails = this.checkItems(x);
                let data = {
                    cycle: this.$store.state.data.cycle,
                    fromList: true,
                    apiResourceId: x.id,
                    prItemDetails: prItemDetails.result,
                };
                await this.$store
                    .dispatch("pritem/CreatePrItem", data)
                    .then((res) => {
                        if (res.data.error) {
                            return this.showToast(res.data.erroMessage,"warning");
                        }
                        x.prId = res.data.id;
                        x.apiResource = {
                            id: x.id,
                            apiId: x.apiId,
                            apiResourceDetails: x.apiResourceDetails,
                            itemName: x.itemName,
                            description: x.description,
                        };
                        if (
                            !this.cartItems.find(
                                (item) => item.apiResource.id == x.id
                            )
                        ) {
                            this.cartItems.push(x);
                            this.cartCount++;
                        }
                        this.deductQty(x);
                        this.showToast("Successfully added to cart!","success");
                        this.$bvModal.hide("order-details-modal");
                    })
                    .catch((err) => {
                        console.log(err)
                        this.showToast("PR Item went wrong!","error");
                    });
            }
        },
        deleteCartItem(x) {
            var index = this.cartItems.indexOf(x);
            Swal.fire({
                title: "Are you sure?",
                text: "You won't be able to revert this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#dc3545",
                cancelButtonColor: "#5c636a",
                confirmButtonText: "Yes, delete it!",
            }).then((result) => {
                if (result.value) {
                    this.$store
                        .dispatch("pritem/DeletePrItem", x.id)
                        .then((res) => {
                            if (res.data.error) {
                                return this.showToast(res.data.erroMessage,"warning");
                            }
                            this.cartItems.splice(index, 1);
                            this.cartCount--;
                            this.showToast("Successfully deleted!","success");
                        })
                        .catch((err) => {
                            this.showToast("Something went wrong!","error");
                        });
                }
            });
        },
        openPopOver(x) {
            x.editQty = true;
            x.submitError = false;
            this.cartVariables = cloneDeep(x);
        },
        hidePopOver(x) {
            x.editQty = false;
        },
        onShownPopOver(x) {
            this.focusRef(this.$refs[`po-${x.id}`][0]);
        },
        focusRef(ref) {
            this.$nextTick(() => {
                this.$nextTick(() => {
                    (ref.$el || ref).focus();
                });
            });
        },
        saveCartItem(x) {
            var index = this.cartItems.indexOf(x);
            let result = this.checkItems(this.cartVariables, 1);
            if (result.error) {
                x.submitError = true;
                return;
            }
            let data = {
                cycle: this.$store.state.data.cycle,
                apiResourceId: x.apiResourceId,
                fromList: false,
                prItemDetails: result.result,
            };
            this.$store
                .dispatch("pritem/CreatePrItem", data)
                .then((res) => {
                    if (res.data.error) {
                        return this.showToast(res.data.erroMessage,"warning");
                    }
                    this.cartVariables.editQty = false;
                    this.sumUp(this.cartVariables);
                    this.cartItems.splice(index, 1, this.cartVariables);
                    this.showToast("Successfully updated!","success");
                })
                .catch((err) => {
                    this.showToast("Something went wrong!","error");
                });
        },
        savePRItem(x) {
            var index = this.updateItems.indexOf(x);
            let result = this.checkItems(this.cartVariables, 1);
            if (result.error) {
                x.submitError = true;
                return;
            }
            let data = {
                id: x.id,
                prItemDetails: result.result,
            };
            this.$store
                .dispatch("pritem/UpdatePrItem", data)
                .then((res) => {
                    if (res.data.error) {
                        return this.showToast(res.data.erroMessage,"warning");
                    }
                    this.cartVariables.editQty = false;
                    this.sumUp(this.cartVariables);
                    this.updateItems.splice(index, 1, this.cartVariables);
                    this.showToast("Successfully updated!","success");
                })
                .catch((err) => {
                    this.showToast("Something went wrong!","error");
                });
        },
        checkOut() {
            this.$v.pr.$touch();
            if (this.$v.pr.$invalid) {
                return;
            }
            if (this.cartItems.length == 0) {
                return this.showToast("Please add items to cart!","warning");
            }
            Swal.fire({
                title: "Are you sure?",
                text: "You want to post this?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#34c38f",
                cancelButtonColor: "#f46a6a",
                confirmButtonText: "Yes, post it!",
            }).then((result) => {
                if (result.value) {
                    this.$store
                        .dispatch("pr/PostPr", this.pr)
                        .then((res) => {
                            if (res.data.error) {
                                return this.showToast(res.data.erroMessage,"warning");
                            }
                            this.cartItems = [];
                            this.cartCount = 0;
                            this.pr = { id: 0, description: "" };
                            this.tabIndex = 0;
                            this.showToast("Successfully checkout!","success");
                        })
                        .catch((err) => {
                            this.showToast("Something went wrong!","error");
                        });
                }
            });
        },
        savePR() {
            this.$v.prHeader.$touch();
            if (this.$v.prHeader.$invalid) {
                return;
            }
            if (this.updateItems.length == 0) {
                return this.showToast("Please add items to cart!","warning");
            }
            Swal.fire({
                title: "Are you sure?",
                text: "You want to save this?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#34c38f",
                cancelButtonColor: "#f46a6a",
                confirmButtonText: "Yes, save it!",
            }).then((result) => {
                if (result.value) {
                    this.$store
                        .dispatch("pr/PostPr", this.prHeader)
                        .then((res) => {
                            if (res.data.error) {
                                return this.showToast(res.data.erroMessage,"warning");
                            }
                            this.getAllMyPR(this.$store.state.data.cycle);
                            this.tabIndex = 2;
                            this.dismissUpdate();
                            this.showToast("Successfully updated!","success");
                        })
                        .catch((err) => {
                            this.showToast("Something went wrong!","error");
                        });
                }
            });
        },
        getPrItems(x) {
            x.visible = !x.visible;
            if (x.visible && !x.itemLoaded) {
                x.itemLoading = true;
                this.$store
                    .dispatch("pritem/GetPrItems", x.id)
                    .then((res) => {
                        if (res.data.error) {
                            return this.showToast(res.data.erroMessage,"warning");
                        }
                        res.data.forEach((item) => (item.editQty = false));
                        x.prItems = res.data;
                        x.itemLoading = false;
                        x.itemLoaded = true;
                    })
                    .catch((err) => {
                        this.showToast("Something went wrong!","error");
                    });
            }
        },
        getTotalPerPR(prItems) {
            return prItems.reduce((pv, cv) => {
                return pv + parseFloat(cv.total);
            }, 0);
        },
        updatePR(row) {
            this.showUpdatePR = true;
            row.prItems.forEach((item) => {
                item.submitError = false;
                item.apiResource.apiResourceDetails.forEach((y) => {
                    if (y.monthId == 1) {
                        item.Jan = 2;
                        item.JanMax = parseFloat(y.available);
                    }
                    if (y.monthId == 2) {
                        item.Feb = 2;
                        item.FebMax = parseFloat(y.available);
                    }
                    if (y.monthId == 3) {
                        item.Mar = 2;
                        item.MarMax = parseFloat(y.available);
                    }
                    if (y.monthId == 4) {
                        item.Apr = 2;
                        item.AprMax = parseFloat(y.available);
                    }
                    if (y.monthId == 5) {
                        item.May = 2;
                        item.MayMax = parseFloat(y.available);
                    }
                    if (y.monthId == 6) {
                        item.June = 2;
                        item.JuneMax = parseFloat(y.available);
                    }
                    if (y.monthId == 7) {
                        item.July = 2;
                        item.JulyMax = parseFloat(y.available);
                    }
                    if (y.monthId == 8) {
                        item.Aug = 2;
                        item.AugMax = parseFloat(y.available);
                    }
                    if (y.monthId == 9) {
                        item.Sep = 2;
                        item.SepMax = parseFloat(y.available);
                    }
                    if (y.monthId == 10) {
                        item.Oct = 2;
                        item.OctMax = parseFloat(y.available);
                    }
                    if (y.monthId == 11) {
                        item.Nov = 2;
                        item.NovMax = parseFloat(y.available);
                    }
                    if (y.monthId == 12) {
                        item.Dec = 2;
                        item.DecMax = parseFloat(y.available);
                    }
                });
                item.prItemDetails.forEach((x) => {
                    if (item.Jan == 2) {
                        if (x.monthId == 1) {
                            item.JanId = x.id;
                            item.JanValue = parseFloat(x.quantity).toString();
                            item.JanMax += parseFloat(x.quantity);
                        }
                    }
                    if (item.Feb == 2) {
                        if (x.monthId == 2) {
                            item.FebId = x.id;
                            item.FebValue = parseFloat(x.quantity).toString();
                            item.FebMax += parseFloat(x.quantity);
                        }
                    }
                    if (item.Mar == 2) {
                        if (x.monthId == 3) {
                            item.MarId = x.id;
                            item.MarValue = parseFloat(x.quantity).toString();
                            item.MarMax += parseFloat(x.quantity);
                        }
                    }
                    if (item.Apr == 2) {
                        if (x.monthId == 4) {
                            item.AprId = x.id;
                            item.AprValue = parseFloat(x.quantity).toString();
                            item.AprMax += parseFloat(x.quantity);
                        }
                    }
                    if (item.May == 2) {
                        if (x.monthId == 5) {
                            item.MayId = x.id;
                            item.MayValue = parseFloat(x.quantity).toString();
                            item.MayMax += parseFloat(x.quantity);
                        }
                    }
                    if (item.June == 2) {
                        if (x.monthId == 6) {
                            item.JuneId = x.id;
                            item.JuneValue = parseFloat(x.quantity).toString();
                            item.JuneMax += parseFloat(x.quantity);
                        }
                    }
                    if (item.July == 2) {
                        if (x.monthId == 7) {
                            item.JulyId = x.id;
                            item.JulyValue = parseFloat(x.quantity).toString();
                            item.JulyMax += parseFloat(x.quantity);
                        }
                    }
                    if (item.Aug == 2) {
                        if (x.monthId == 8) {
                            item.AugId = x.id;
                            item.AugValue = parseFloat(x.quantity).toString();
                            item.AugMax += parseFloat(x.quantity);
                        }
                    }
                    if (item.Sep == 2) {
                        if (x.monthId == 9) {
                            item.SepId = x.id;
                            item.SepValue = parseFloat(x.quantity).toString();
                            item.SepMax += parseFloat(x.quantity);
                        }
                    }
                    if (item.Oct == 2) {
                        if (x.monthId == 10) {
                            item.OctId = x.id;
                            item.OctValue = parseFloat(x.quantity).toString();
                            item.OctMax += parseFloat(x.quantity);
                        }
                    }
                    if (item.Nov == 2) {
                        if (x.monthId == 11) {
                            item.NovId = x.id;
                            item.NovValue = parseFloat(x.quantity).toString();
                            item.NovMax += parseFloat(x.quantity);
                        }
                    }
                    if (item.Dec == 2) {
                        if (x.monthId == 12) {
                            item.DecId = x.id;
                            item.DecValue = parseFloat(x.quantity).toString();
                            item.DecMax += parseFloat(x.quantity);
                        }
                    }
                });
            });
            this.updateItems = row.prItems;
            this.prHeader = {
                id: row.id,
                description: row.description,
            };
            setTimeout(() => {
                this.tabIndex = 3;
            }, 200);
        },
        dismissUpdate() {
            this.tabIndex = 2;
            this.showUpdatePR = false;
            this.updateItems = [];
        },
        openDocument(x){
            window.open(`${this.$store.state.data.rootFileDirectory}${x.folder}/${x.fileName}`);
        },
        searchDocu(row) {
            let data = row.attachments;
            if (row.fileSearch.trim() != "" && row.fileSearch) {
                data = data.filter((item) => {
                    return item.description
                        .toUpperCase()
                        .includes(row.fileSearch.toUpperCase());
                });
            }
            return data;
        },
        getAttachments(row) {
            row.showAttachments = !row.showAttachments;
            if(row.showAttachments){
                row.attachments = [];
                row.attachmentLoading = true;
                this.$store
                    .dispatch("filemanager/GetFiles", {
                        id: row.id,
                        type: "Purchase Request",
                    })
                    .then((res) => {
                        row.attachmentLoading = false;
                        row.attachments = res.data;
                    })
                    .catch(() => {
                        row.attachmentLoading = false;
                        this.showToast(
                            "Something went wrong! - getting documents",
                            "error"
                        );
                    });
            }
        },
    },
};
</script>
<template>
    <Layout @changeCycle="changeCycle">
        <PageHeader :title="title" :items="items" />
        <b-modal
            id="order-details-modal"
            :title="modalTitle"
            size="lg"
            title-class="font-18"
            hide-footer
            no-close-on-backdrop
        >
            <form
                @submit.prevent="onCreatePRItems"
                class="needs-validation"
                ref="apiForm"
            >
                <b-row>
                    <b-col>
                        <table class="table table-centered table-nowrap">
                            <thead>
                                <tr>
                                    <th scope="col">Product Name</th>
                                    <th scope="col" width="150px">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                <template v-for="x in selectedItems">
                                    <tr :key="x.id">
                                        <td>
                                            <div>
                                                <h5 class="mb-0">
                                                    {{ x.itemName }}
                                                </h5>
                                                <small
                                                    >{{
                                                        Intl.NumberFormat(
                                                            "ja-JP",
                                                            {
                                                                currency: "PHP",
                                                                style: "currency",
                                                            }
                                                        ).format(x.unitCost)
                                                    }}
                                                    X {{ x.totalQuantity }}
                                                    <a
                                                        href="javascript:void(0);"
                                                        @click="
                                                            x.editQty =
                                                                !x.editQty
                                                        "
                                                        >[{{
                                                            x.editQty
                                                                ? "Hide"
                                                                : "Edit"
                                                        }}
                                                        Quantity]</a
                                                    ></small
                                                >
                                                <span
                                                    v-if="x.submitError"
                                                    class="badge bg-danger ms-2"
                                                    >Qty must not exceed to
                                                    available</span
                                                >
                                            </div>
                                        </td>
                                        <td>
                                            {{
                                                Intl.NumberFormat("ja-JP", {
                                                    currency: "PHP",
                                                    style: "currency",
                                                }).format(x.total)
                                            }}
                                        </td>
                                    </tr>
                                    <template>
                                        <tr
                                            :key="`qty${x.id}`"
                                            v-if="x.editQty"
                                        >
                                            <td colspan="2">
                                                <table>
                                                    <tr>
                                                        <td
                                                            class="align-middle"
                                                            style="width: 120px"
                                                        >
                                                            Quarter 1
                                                        </td>
                                                        <td>
                                                            <div class="mx-2">
                                                                <small
                                                                    >January</small
                                                                >
                                                                <div
                                                                    v-if="
                                                                        !x.Jan
                                                                    "
                                                                >
                                                                    <input
                                                                        type="text"
                                                                        placeholder="No available quantity"
                                                                        class="
                                                                            form-control
                                                                        "
                                                                        disabled
                                                                    />
                                                                </div>
                                                                <div
                                                                    class="
                                                                        text-center
                                                                        position-relative
                                                                    "
                                                                    v-if="
                                                                        x.Jan >
                                                                        1
                                                                    "
                                                                >
                                                                    <masked-input
                                                                        type="text"
                                                                        class="
                                                                            form-control
                                                                        "
                                                                        v-model="
                                                                            x.JanValue
                                                                        "
                                                                        :mask="
                                                                            currencyMask
                                                                        "
                                                                        @input="
                                                                            sumUp(
                                                                                x
                                                                            )
                                                                        "
                                                                    ></masked-input>
                                                                    <p
                                                                        v-if="
                                                                            x.JanValue
                                                                        "
                                                                        class="
                                                                            badge
                                                                            position-absolute
                                                                        "
                                                                        style="
                                                                            top: -5px;
                                                                            right: -5px;
                                                                        "
                                                                        :class="{
                                                                            'bg-success':
                                                                                x.JanValue <=
                                                                                x.JanMax,
                                                                            'bg-danger':
                                                                                x.JanValue >
                                                                                x.JanMax,
                                                                        }"
                                                                    >
                                                                        {{
                                                                            x.JanValue
                                                                        }}
                                                                        /
                                                                        {{
                                                                            x.JanMax
                                                                        }}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div class="mx-2">
                                                                <small
                                                                    >February</small
                                                                >
                                                                <div
                                                                    v-if="
                                                                        !x.Feb
                                                                    "
                                                                >
                                                                    <input
                                                                        type="text"
                                                                        placeholder="No available quantity"
                                                                        class="
                                                                            form-control
                                                                        "
                                                                        disabled
                                                                    />
                                                                </div>
                                                                <div
                                                                    class="
                                                                        text-center
                                                                        position-relative
                                                                    "
                                                                    v-if="
                                                                        x.Feb >
                                                                        1
                                                                    "
                                                                >
                                                                    <masked-input
                                                                        type="text"
                                                                        class="
                                                                            form-control
                                                                        "
                                                                        v-model="
                                                                            x.FebValue
                                                                        "
                                                                        :mask="
                                                                            currencyMask
                                                                        "
                                                                        @input="
                                                                            sumUp(
                                                                                x
                                                                            )
                                                                        "
                                                                    ></masked-input>
                                                                    <p
                                                                        v-if="
                                                                            x.FebValue
                                                                        "
                                                                        class="
                                                                            badge
                                                                            position-absolute
                                                                        "
                                                                        style="
                                                                            top: -5px;
                                                                            right: -5px;
                                                                        "
                                                                        :class="{
                                                                            'bg-success':
                                                                                x.FebValue <=
                                                                                x.FebMax,
                                                                            'bg-danger':
                                                                                x.FebValue >
                                                                                x.FebMax,
                                                                        }"
                                                                    >
                                                                        {{
                                                                            x.FebValue
                                                                        }}
                                                                        /
                                                                        {{
                                                                            x.FebMax
                                                                        }}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div class="mx-2">
                                                                <small
                                                                    >March
                                                                </small>
                                                                <div
                                                                    v-if="
                                                                        !x.Mar
                                                                    "
                                                                >
                                                                    <input
                                                                        type="text"
                                                                        placeholder="No available quantity"
                                                                        class="
                                                                            form-control
                                                                        "
                                                                        disabled
                                                                    />
                                                                </div>
                                                                <div
                                                                    class="
                                                                        text-center
                                                                        position-relative
                                                                    "
                                                                    v-if="
                                                                        x.Mar >
                                                                        1
                                                                    "
                                                                >
                                                                    <masked-input
                                                                        type="text"
                                                                        class="
                                                                            form-control
                                                                        "
                                                                        v-model="
                                                                            x.MarValue
                                                                        "
                                                                        :mask="
                                                                            currencyMask
                                                                        "
                                                                        @input="
                                                                            sumUp(
                                                                                x
                                                                            )
                                                                        "
                                                                    ></masked-input>
                                                                    <p
                                                                        v-if="
                                                                            x.MarValue
                                                                        "
                                                                        class="
                                                                            badge
                                                                            position-absolute
                                                                        "
                                                                        style="
                                                                            top: -5px;
                                                                            right: -5px;
                                                                        "
                                                                        :class="{
                                                                            'bg-success':
                                                                                x.MarValue <=
                                                                                x.MarMax,
                                                                            'bg-danger':
                                                                                x.MarValue >
                                                                                x.MarMax,
                                                                        }"
                                                                    >
                                                                        {{
                                                                            x.MarValue
                                                                        }}
                                                                        /
                                                                        {{
                                                                            x.MarMax
                                                                        }}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            class="align-middle"
                                                            style="width: 120px"
                                                        >
                                                            Quarter 2
                                                        </td>
                                                        <td>
                                                            <div class="mx-2">
                                                                <small
                                                                    >April</small
                                                                >
                                                                <div
                                                                    v-if="
                                                                        !x.Apr
                                                                    "
                                                                >
                                                                    <input
                                                                        type="text"
                                                                        placeholder="No available quantity"
                                                                        class="
                                                                            form-control
                                                                        "
                                                                        disabled
                                                                    />
                                                                </div>
                                                                <div
                                                                    class="
                                                                        text-center
                                                                        position-relative
                                                                    "
                                                                    v-if="
                                                                        x.Apr >
                                                                        1
                                                                    "
                                                                >
                                                                    <masked-input
                                                                        type="text"
                                                                        class="
                                                                            form-control
                                                                        "
                                                                        v-model="
                                                                            x.AprValue
                                                                        "
                                                                        :mask="
                                                                            currencyMask
                                                                        "
                                                                        @input="
                                                                            sumUp(
                                                                                x
                                                                            )
                                                                        "
                                                                    ></masked-input>
                                                                    <p
                                                                        v-if="
                                                                            x.AprValue
                                                                        "
                                                                        class="
                                                                            badge
                                                                            position-absolute
                                                                        "
                                                                        style="
                                                                            top: -5px;
                                                                            right: -5px;
                                                                        "
                                                                        :class="{
                                                                            'bg-success':
                                                                                x.AprValue <=
                                                                                x.AprMax,
                                                                            'bg-danger':
                                                                                x.AprValue >
                                                                                x.AprMax,
                                                                        }"
                                                                    >
                                                                        {{
                                                                            x.AprValue
                                                                        }}
                                                                        /
                                                                        {{
                                                                            x.AprMax
                                                                        }}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div class="mx-2">
                                                                <small
                                                                    >May</small
                                                                >
                                                                <div
                                                                    v-if="
                                                                        !x.May
                                                                    "
                                                                >
                                                                    <input
                                                                        type="text"
                                                                        placeholder="No available quantity"
                                                                        class="
                                                                            form-control
                                                                        "
                                                                        disabled
                                                                    />
                                                                </div>
                                                                <div
                                                                    class="
                                                                        text-center
                                                                        position-relative
                                                                    "
                                                                    v-if="
                                                                        x.May >
                                                                        1
                                                                    "
                                                                >
                                                                    <masked-input
                                                                        type="text"
                                                                        class="
                                                                            form-control
                                                                        "
                                                                        v-model="
                                                                            x.MayValue
                                                                        "
                                                                        :mask="
                                                                            currencyMask
                                                                        "
                                                                        @input="
                                                                            sumUp(
                                                                                x
                                                                            )
                                                                        "
                                                                    ></masked-input>
                                                                    <p
                                                                        v-if="
                                                                            x.MayValue
                                                                        "
                                                                        class="
                                                                            badge
                                                                            position-absolute
                                                                        "
                                                                        style="
                                                                            top: -5px;
                                                                            right: -5px;
                                                                        "
                                                                        :class="{
                                                                            'bg-success':
                                                                                x.MayValue <=
                                                                                x.MayMax,
                                                                            'bg-danger':
                                                                                x.MayValue >
                                                                                x.MayMax,
                                                                        }"
                                                                    >
                                                                        {{
                                                                            x.MayValue
                                                                        }}
                                                                        /
                                                                        {{
                                                                            x.MayMax
                                                                        }}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div class="mx-2">
                                                                <small
                                                                    >June
                                                                </small>
                                                                <div
                                                                    v-if="
                                                                        !x.June
                                                                    "
                                                                >
                                                                    <input
                                                                        type="text"
                                                                        placeholder="No available quantity"
                                                                        class="
                                                                            form-control
                                                                        "
                                                                        disabled
                                                                    />
                                                                </div>
                                                                <div
                                                                    class="
                                                                        text-center
                                                                        position-relative
                                                                    "
                                                                    v-if="
                                                                        x.June >
                                                                        1
                                                                    "
                                                                >
                                                                    <masked-input
                                                                        type="text"
                                                                        class="
                                                                            form-control
                                                                        "
                                                                        v-model="
                                                                            x.JuneValue
                                                                        "
                                                                        :mask="
                                                                            currencyMask
                                                                        "
                                                                        @input="
                                                                            sumUp(
                                                                                x
                                                                            )
                                                                        "
                                                                    ></masked-input>
                                                                    <p
                                                                        v-if="
                                                                            x.JuneValue
                                                                        "
                                                                        class="
                                                                            badge
                                                                            position-absolute
                                                                        "
                                                                        style="
                                                                            top: -5px;
                                                                            right: -5px;
                                                                        "
                                                                        :class="{
                                                                            'bg-success':
                                                                                x.JuneValue <=
                                                                                x.JuneMax,
                                                                            'bg-danger':
                                                                                x.JuneValue >
                                                                                x.JuneMax,
                                                                        }"
                                                                    >
                                                                        {{
                                                                            x.JuneValue
                                                                        }}
                                                                        /
                                                                        {{
                                                                            x.JuneMax
                                                                        }}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            class="align-middle"
                                                            style="width: 120px"
                                                        >
                                                            Quarter 3
                                                        </td>
                                                        <td>
                                                            <div class="mx-2">
                                                                <small
                                                                    >July</small
                                                                >
                                                                <div
                                                                    v-if="
                                                                        !x.July
                                                                    "
                                                                >
                                                                    <input
                                                                        type="text"
                                                                        placeholder="No available quantity"
                                                                        class="
                                                                            form-control
                                                                        "
                                                                        disabled
                                                                    />
                                                                </div>
                                                                <div
                                                                    class="
                                                                        text-center
                                                                        position-relative
                                                                    "
                                                                    v-if="
                                                                        x.July >
                                                                        1
                                                                    "
                                                                >
                                                                    <masked-input
                                                                        type="text"
                                                                        class="
                                                                            form-control
                                                                        "
                                                                        v-model="
                                                                            x.JulyValue
                                                                        "
                                                                        :mask="
                                                                            currencyMask
                                                                        "
                                                                        @input="
                                                                            sumUp(
                                                                                x
                                                                            )
                                                                        "
                                                                    ></masked-input>
                                                                    <p
                                                                        v-if="
                                                                            x.JulyValue
                                                                        "
                                                                        class="
                                                                            badge
                                                                            position-absolute
                                                                        "
                                                                        style="
                                                                            top: -5px;
                                                                            right: -5px;
                                                                        "
                                                                        :class="{
                                                                            'bg-success':
                                                                                x.JulyValue <=
                                                                                x.JulyMax,
                                                                            'bg-danger':
                                                                                x.JulyValue >
                                                                                x.JulyMax,
                                                                        }"
                                                                    >
                                                                        {{
                                                                            x.JulyValue
                                                                        }}
                                                                        /
                                                                        {{
                                                                            x.JulyMax
                                                                        }}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div class="mx-2">
                                                                <small
                                                                    >August</small
                                                                >
                                                                <div
                                                                    v-if="
                                                                        !x.Aug
                                                                    "
                                                                >
                                                                    <input
                                                                        type="text"
                                                                        placeholder="No available quantity"
                                                                        class="
                                                                            form-control
                                                                        "
                                                                        disabled
                                                                    />
                                                                </div>
                                                                <div
                                                                    class="
                                                                        text-center
                                                                        position-relative
                                                                    "
                                                                    v-if="
                                                                        x.Aug >
                                                                        1
                                                                    "
                                                                >
                                                                    <masked-input
                                                                        type="text"
                                                                        class="
                                                                            form-control
                                                                        "
                                                                        v-model="
                                                                            x.AugValue
                                                                        "
                                                                        :mask="
                                                                            currencyMask
                                                                        "
                                                                        @input="
                                                                            sumUp(
                                                                                x
                                                                            )
                                                                        "
                                                                    ></masked-input>
                                                                    <p
                                                                        v-if="
                                                                            x.AugValue
                                                                        "
                                                                        class="
                                                                            badge
                                                                            position-absolute
                                                                        "
                                                                        style="
                                                                            top: -5px;
                                                                            right: -5px;
                                                                        "
                                                                        :class="{
                                                                            'bg-success':
                                                                                x.AugValue <=
                                                                                x.AugMax,
                                                                            'bg-danger':
                                                                                x.AugValue >
                                                                                x.AugMax,
                                                                        }"
                                                                    >
                                                                        {{
                                                                            x.AugValue
                                                                        }}
                                                                        /
                                                                        {{
                                                                            x.AugMax
                                                                        }}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div class="mx-2">
                                                                <small
                                                                    >September
                                                                </small>
                                                                <div
                                                                    v-if="
                                                                        !x.Sep
                                                                    "
                                                                >
                                                                    <input
                                                                        type="text"
                                                                        placeholder="No available quantity"
                                                                        class="
                                                                            form-control
                                                                        "
                                                                        disabled
                                                                    />
                                                                </div>
                                                                <div
                                                                    class="
                                                                        text-center
                                                                        position-relative
                                                                    "
                                                                    v-if="
                                                                        x.Sep >
                                                                        1
                                                                    "
                                                                >
                                                                    <masked-input
                                                                        type="text"
                                                                        class="
                                                                            form-control
                                                                        "
                                                                        v-model="
                                                                            x.SepValue
                                                                        "
                                                                        :mask="
                                                                            currencyMask
                                                                        "
                                                                        @input="
                                                                            sumUp(
                                                                                x
                                                                            )
                                                                        "
                                                                    ></masked-input>
                                                                    <p
                                                                        v-if="
                                                                            x.SepValue
                                                                        "
                                                                        class="
                                                                            badge
                                                                            position-absolute
                                                                        "
                                                                        style="
                                                                            top: -5px;
                                                                            right: -5px;
                                                                        "
                                                                        :class="{
                                                                            'bg-success':
                                                                                x.SepValue <=
                                                                                x.SepMax,
                                                                            'bg-danger':
                                                                                x.SepValue >
                                                                                x.SepMax,
                                                                        }"
                                                                    >
                                                                        {{
                                                                            x.SepValue
                                                                        }}
                                                                        /
                                                                        {{
                                                                            x.SepMax
                                                                        }}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            class="align-middle"
                                                            style="width: 120px"
                                                        >
                                                            Quarter 4
                                                        </td>
                                                        <td>
                                                            <div class="mx-2">
                                                                <small
                                                                    >October</small
                                                                >
                                                                <div
                                                                    v-if="
                                                                        !x.Oct
                                                                    "
                                                                >
                                                                    <input
                                                                        type="text"
                                                                        placeholder="No available quantity"
                                                                        class="
                                                                            form-control
                                                                        "
                                                                        disabled
                                                                    />
                                                                </div>
                                                                <div
                                                                    class="
                                                                        text-center
                                                                        position-relative
                                                                    "
                                                                    v-if="
                                                                        x.Oct >
                                                                        1
                                                                    "
                                                                >
                                                                    <masked-input
                                                                        type="text"
                                                                        class="
                                                                            form-control
                                                                        "
                                                                        v-model="
                                                                            x.OctValue
                                                                        "
                                                                        :mask="
                                                                            currencyMask
                                                                        "
                                                                        @input="
                                                                            sumUp(
                                                                                x
                                                                            )
                                                                        "
                                                                    ></masked-input>
                                                                    <p
                                                                        v-if="
                                                                            x.OctValue
                                                                        "
                                                                        class="
                                                                            badge
                                                                            position-absolute
                                                                        "
                                                                        style="
                                                                            top: -5px;
                                                                            right: -5px;
                                                                        "
                                                                        :class="{
                                                                            'bg-success':
                                                                                x.OctValue <=
                                                                                x.OctMax,
                                                                            'bg-danger':
                                                                                x.OctValue >
                                                                                x.OctMax,
                                                                        }"
                                                                    >
                                                                        {{
                                                                            x.OctValue
                                                                        }}
                                                                        /
                                                                        {{
                                                                            x.OctMax
                                                                        }}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div class="mx-2">
                                                                <small
                                                                    >November</small
                                                                >
                                                                <div
                                                                    v-if="
                                                                        !x.Nov
                                                                    "
                                                                >
                                                                    <input
                                                                        type="text"
                                                                        placeholder="No available quantity"
                                                                        class="
                                                                            form-control
                                                                        "
                                                                        disabled
                                                                    />
                                                                </div>
                                                                <div
                                                                    class="
                                                                        text-center
                                                                        position-relative
                                                                    "
                                                                    v-if="
                                                                        x.Nov >
                                                                        1
                                                                    "
                                                                >
                                                                    <masked-input
                                                                        type="text"
                                                                        class="
                                                                            form-control
                                                                        "
                                                                        v-model="
                                                                            x.NovValue
                                                                        "
                                                                        :mask="
                                                                            currencyMask
                                                                        "
                                                                        @input="
                                                                            sumUp(
                                                                                x
                                                                            )
                                                                        "
                                                                    ></masked-input>
                                                                    <p
                                                                        v-if="
                                                                            x.NovValue
                                                                        "
                                                                        class="
                                                                            badge
                                                                            position-absolute
                                                                        "
                                                                        style="
                                                                            top: -5px;
                                                                            right: -5px;
                                                                        "
                                                                        :class="{
                                                                            'bg-success':
                                                                                x.NovValue <=
                                                                                x.NovMax,
                                                                            'bg-danger':
                                                                                x.NovValue >
                                                                                x.NovMax,
                                                                        }"
                                                                    >
                                                                        {{
                                                                            x.NovValue
                                                                        }}
                                                                        /
                                                                        {{
                                                                            x.NovMax
                                                                        }}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div class="mx-2">
                                                                <small
                                                                    >December
                                                                </small>
                                                                <div
                                                                    v-if="
                                                                        !x.Dec
                                                                    "
                                                                >
                                                                    <input
                                                                        type="text"
                                                                        placeholder="No available quantity"
                                                                        class="
                                                                            form-control
                                                                        "
                                                                        disabled
                                                                    />
                                                                </div>
                                                                <div
                                                                    class="
                                                                        text-center
                                                                        position-relative
                                                                    "
                                                                    v-if="
                                                                        x.Dec >
                                                                        1
                                                                    "
                                                                >
                                                                    <masked-input
                                                                        type="text"
                                                                        class="
                                                                            form-control
                                                                        "
                                                                        v-model="
                                                                            x.DecValue
                                                                        "
                                                                        :mask="
                                                                            currencyMask
                                                                        "
                                                                        @input="
                                                                            sumUp(
                                                                                x
                                                                            )
                                                                        "
                                                                    ></masked-input>
                                                                    <p
                                                                        v-if="
                                                                            x.DecValue
                                                                        "
                                                                        class="
                                                                            badge
                                                                            position-absolute
                                                                        "
                                                                        style="
                                                                            top: -5px;
                                                                            right: -5px;
                                                                        "
                                                                        :class="{
                                                                            'bg-success':
                                                                                x.DecValue <=
                                                                                x.DecMax,
                                                                            'bg-danger':
                                                                                x.DecValue >
                                                                                x.DecMax,
                                                                        }"
                                                                    >
                                                                        {{
                                                                            x.DecValue
                                                                        }}
                                                                        /
                                                                        {{
                                                                            x.DecMax
                                                                        }}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </template>
                                </template>
                                <tr>
                                    <td class="text-right">Total Amount</td>
                                    <td>
                                        {{
                                            Intl.NumberFormat("ja-JP", {
                                                currency: "PHP",
                                                style: "currency",
                                            }).format(totalOrderedAmt())
                                        }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </b-col>
                </b-row>
                <div class="modal-footer">
                    <button type="submit" class="btn btn-primary">
                        Add to Cart
                    </button>
                    <button
                        type="button"
                        class="btn btn-link"
                        @click="$bvModal.hide('order-details-modal')"
                    >
                        Close
                    </button>
                </div>
            </form>
        </b-modal>
        <b-tabs content-class="pt-3 pb-3 text-muted" v-model="tabIndex" nav-class="nav-tabs-custom">
            <b-tab @click="refreshData(0)">
                <template v-slot:title>
                    <span class="d-inline-block d-sm-none">
                        <i class="bx bx-home"></i>
                    </span>
                    <span class="d-none d-sm-inline-block"
                        >Available Items</span
                    >
                </template>
                <div class="row">
                    <div class="col-md-6">
                        <h5 class="mb-0">List of Available Items</h5>
                        <div>
                            <small
                                class="cursor-pointer"
                                @click="toggleSelectionMode"
                                >{{
                                    singleSelection
                                        ? "Single Selection"
                                        : "Mutiple Selection"
                                }}</small
                            >
                        </div>
                    </div>
                    <div class="col-md-6 text-right">
                        <div
                            id="tickets-table_filter"
                            class="dataTables_filter me-1"
                        >
                            <label class="d-inline-flex align-items-center">
                                <b-form-input
                                    autocomplete="off"
                                    v-model="filterItem"
                                    type="search"
                                    placeholder="Search Items..."
                                    class="form-control"
                                ></b-form-input>
                            </label>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-lg-12">
                        <div>
                            <div class="">
                                <table
                                    class="
                                        table
                                        project-list-table
                                        table-centered table-borderless
                                    "
                                >
                                    <thead>
                                        <tr>
                                            <th
                                                scope="col"
                                                style="width: 500px"
                                                class="
                                                    align-middle
                                                    border-2
                                                    border-top-0
                                                    border-start-0
                                                    border-bottom-0
                                                    border-dark-app
                                                "
                                            >
                                                Item Name
                                            </th>
                                            <th
                                                class="
                                                    text-center
                                                    border-2
                                                    border-top-0
                                                    border-start-0
                                                    border-bottom-0
                                                    border-dark-app
                                                    p-0
                                                "
                                                style="width: 500px"
                                            >
                                                <div class="text-center">
                                                    <div
                                                        class="
                                                            border-dark-bottom
                                                            py-1
                                                        "
                                                    >
                                                        Available Quantity
                                                    </div>
                                                    <div class="d-flex">
                                                        <div
                                                            class="
                                                                w-25
                                                                border-dark-right
                                                                p-1
                                                            "
                                                        >
                                                            Quarter 1
                                                        </div>
                                                        <div
                                                            class="
                                                                w-25
                                                                border-dark-right
                                                                py-1
                                                            "
                                                        >
                                                            Quarter 2
                                                        </div>
                                                        <div
                                                            class="
                                                                w-25
                                                                border-dark-right
                                                                py-1
                                                            "
                                                        >
                                                            Quarter 3
                                                        </div>
                                                        <div class="w-25 py-1">
                                                            Quarter 4
                                                        </div>
                                                    </div>
                                                </div>
                                            </th>
                                            <th
                                                class="
                                                    align-middle
                                                    border-2
                                                    border-top-0
                                                    border-start-0
                                                    border-bottom-0
                                                    border-dark-app
                                                    text-center
                                                "
                                            >
                                                Total Qty
                                            </th>
                                            <th
                                                class="
                                                    align-middle
                                                    border-2
                                                    border-top-0
                                                    border-start-0
                                                    border-bottom-0
                                                    border-dark-app
                                                "
                                            >
                                                Unit Cost
                                            </th>
                                            <th
                                                class="
                                                    align-middle
                                                    border-2
                                                    border-top-0
                                                    border-start-0
                                                    border-bottom-0
                                                    border-dark-app
                                                "
                                            >
                                                Total Amount
                                            </th>
                                            <th
                                                scope="col"
                                                width="120px"
                                                class="text-center align-middle"
                                                v-if="singleSelection"
                                            >
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-if="availableBusy">
                                            <td
                                                :colspan="
                                                    singleSelection ? 6 : 5
                                                "
                                            >
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
                                            </td>
                                        </tr>
                                        <tr
                                            v-if="
                                                filteredAvailableItems.length ==
                                                    0 && !availableBusy
                                            "
                                        >
                                            <td
                                                :colspan="
                                                    singleSelection ? 6 : 5
                                                "
                                                class="text-muted text-center"
                                            >
                                                <i
                                                    class="
                                                        dripicons-warning
                                                        me-1
                                                    "
                                                ></i
                                                >No data found
                                            </td>
                                        </tr>
                                        <template
                                            v-for="y in filteredAvailableItems"
                                        >
                                            <tr
                                                :key="'A' + y.id"
                                                style="
                                                    background-color: transparent;
                                                    box-shadow: none;
                                                "
                                            >
                                                <td
                                                    :colspan="
                                                        singleSelection ? 6 : 5
                                                    "
                                                    class="py-0"
                                                >
                                                    <div
                                                        v-if="!singleSelection"
                                                        class="
                                                            form-check
                                                            form-checkbox-outline
                                                            form-check-success
                                                            mb-0
                                                        "
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            :id="`work-${y.id}`"
                                                            checked="checked"
                                                            class="
                                                                form-check-input
                                                            "
                                                            v-model="
                                                                y.checkAllWork
                                                            "
                                                            @change="
                                                                checkEntireWork(
                                                                    y
                                                                )
                                                            "
                                                        /><label
                                                            :for="`work-${y.id}`"
                                                            class="
                                                                form-check-label
                                                            "
                                                        >
                                                            <h5
                                                                class="
                                                                    text-dark
                                                                    mb-0
                                                                "
                                                            >
                                                                {{ y.name }}
                                                            </h5>
                                                        </label>
                                                    </div>
                                                    <div v-else>
                                                        <h5
                                                            class="
                                                                text-dark
                                                                mb-0
                                                            "
                                                        >
                                                            {{ y.name }}
                                                        </h5>
                                                    </div>
                                                </td>
                                            </tr>
                                            <template
                                                v-for="x in y.apiResources"
                                            >
                                                <tr
                                                    :key="x.id"
                                                    class="position-relative"
                                                    :class="{
                                                        'border-1 border-danger':
                                                            x.submitError,
                                                    }"
                                                >
                                                    <td class="align-middle">
                                                        <small
                                                            v-if="x.submitError"
                                                            class="
                                                                position-absolute
                                                                text-white
                                                                error-message
                                                                px-1
                                                            "
                                                            >Quantity must not
                                                            exceed the max
                                                            Quantity</small
                                                        >
                                                        <div
                                                            class="
                                                                form-check
                                                                form-checkbox-outline
                                                                form-check-success
                                                                mb-0
                                                                ms-3
                                                            "
                                                            v-if="
                                                                !singleSelection
                                                            "
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                :id="`resources-${x.id}`"
                                                                checked="checked"
                                                                class="
                                                                    form-check-input
                                                                "
                                                                v-model="
                                                                    x.toggleSelected
                                                                "
                                                                @change="
                                                                    checkApiResource(
                                                                        y
                                                                    )
                                                                "
                                                            /><label
                                                                :for="`resources-${x.id}`"
                                                                class="
                                                                    form-check-label
                                                                "
                                                            >
                                                                <span
                                                                    class="
                                                                        cursor-pointer
                                                                    "
                                                                    :id="`popover-${x.id}`"
                                                                    >{{
                                                                        x.itemName
                                                                    }}
                                                                    ({{
                                                                        x.description
                                                                    }})</span
                                                                >
                                                            </label>
                                                        </div>
                                                        <div
                                                            class="ms-3"
                                                            v-else
                                                        >
                                                            <span
                                                                class="
                                                                    cursor-pointer
                                                                "
                                                                :id="`popover-${x.id}`"
                                                                >{{
                                                                    x.itemName
                                                                }}
                                                                ({{
                                                                    x.description
                                                                }})</span
                                                            >
                                                        </div>
                                                        <b-popover
                                                            :target="`popover-${x.id}`"
                                                            triggers="hover"
                                                            placement="righttop"
                                                        >
                                                            <template
                                                                v-slot:title
                                                                ><small
                                                                    >Other
                                                                    Details</small
                                                                ></template
                                                            >
                                                            <div
                                                                v-if="
                                                                    x.apiResource
                                                                "
                                                            >
                                                                <small
                                                                    ><u
                                                                        >Type:</u
                                                                    ></small
                                                                >
                                                                <div>
                                                                    {{
                                                                        x
                                                                            .apiResource
                                                                            .type
                                                                    }}
                                                                </div>
                                                            </div>
                                                            <div
                                                                class="mt-2"
                                                                v-if="
                                                                    x.apiResource
                                                                "
                                                            >
                                                                <small
                                                                    ><u
                                                                        >Item
                                                                        Category:</u
                                                                    ></small
                                                                >
                                                                <div>
                                                                    {{
                                                                        x
                                                                            .apiResource
                                                                            .itemCategory
                                                                            .name
                                                                    }}
                                                                </div>
                                                            </div>
                                                        </b-popover>
                                                    </td>
                                                    <td
                                                        class="align-middle p-0"
                                                    >
                                                        <div
                                                            class="
                                                                text-center
                                                                d-flex
                                                            "
                                                        >
                                                            <div
                                                                class="
                                                                    w-25
                                                                    d-flex
                                                                    align-items-center
                                                                    justify-content-center
                                                                    py-2
                                                                "
                                                            >
                                                                {{ x.q1 }}
                                                            </div>
                                                            <div
                                                                class="
                                                                    w-25
                                                                    d-flex
                                                                    align-items-center
                                                                    justify-content-center
                                                                "
                                                            >
                                                                {{ x.q2 }}
                                                            </div>
                                                            <div
                                                                class="
                                                                    w-25
                                                                    d-flex
                                                                    align-items-center
                                                                    justify-content-center
                                                                "
                                                            >
                                                                {{ x.q3 }}
                                                            </div>
                                                            <div
                                                                class="
                                                                    w-25
                                                                    d-flex
                                                                    align-items-center
                                                                    justify-content-center
                                                                "
                                                            >
                                                                {{ x.q4 }}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td
                                                        class="
                                                            text-center
                                                            align-middle
                                                        "
                                                    >
                                                        {{ x.totalQuantity }}
                                                    </td>
                                                    <td class="align-middle">
                                                        {{
                                                            Intl.NumberFormat(
                                                                "ja-JP",
                                                                {
                                                                    currency:
                                                                        "PHP",
                                                                    style: "currency",
                                                                }
                                                            ).format(x.unitCost)
                                                        }}
                                                    </td>
                                                    <td class="align-middle">
                                                        {{
                                                            Intl.NumberFormat(
                                                                "ja-JP",
                                                                {
                                                                    currency:
                                                                        "PHP",
                                                                    style: "currency",
                                                                }
                                                            ).format(x.total)
                                                        }}
                                                    </td>
                                                    <td
                                                        v-if="singleSelection"
                                                        class="
                                                            align-middle
                                                            text-center
                                                        "
                                                    >
                                                        <div
                                                            class="
                                                                d-flex
                                                                align-items-center
                                                                text-success
                                                                cursor-pointer
                                                            "
                                                            @click="
                                                                addToCart([x])
                                                            "
                                                        >
                                                            <i
                                                                class="
                                                                    bx bx-cart
                                                                    me-1
                                                                "
                                                            ></i
                                                            >Add to Cart
                                                        </div>
                                                    </td>
                                                </tr>
                                            </template>
                                        </template>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </b-tab>
            <b-tab @click="refreshData(1)">
                <template v-slot:title>
                    <span class="d-inline-block d-sm-none">
                        <i class="bx bx-home"></i>
                    </span>
                    <span
                        class="d-none d-sm-inline-block position-relative me-2"
                        >Purchase Request Cart
                        <small
                            ><span
                                class="
                                    badge
                                    bg-danger
                                    position-absolute
                                    py-1
                                    ms-1
                                "
                                style="top: -2px"
                                v-if="cartCount > 0"
                                >{{ cartCount }}</span
                            ></small
                        ></span
                    >
                </template>
                <div class="row">
                    <div class="col-xl-8">
                        <div class="card">
                            <div class="card-body">
                                <div class="row mb-2">
                                    <div class="col-md-6">
                                        <h5 class="mb-0">
                                            Purchase Request Cart
                                        </h5>
                                        <small>List of items in cart</small>
                                    </div>
                                    <div
                                        class="
                                            col-md-6
                                            d-flex
                                            justify-content-end
                                        "
                                    >
                                        <div
                                            id="tickets-table_filter"
                                            class="dataTables_filter me-1"
                                        >
                                            <label
                                                class="
                                                    d-inline-flex
                                                    align-items-center
                                                "
                                            >
                                                <b-form-input
                                                    autocomplete="off"
                                                    v-model="filterCartItems"
                                                    type="search"
                                                    placeholder="Search Items..."
                                                    class="form-control"
                                                ></b-form-input>
                                            </label>
                                        </div>
                                        <div
                                            id="tickets-table_length"
                                            class="dataTables_length"
                                        >
                                            <label
                                                class="
                                                    d-inline-flex
                                                    align-items-center
                                                    mb-0
                                                "
                                            >
                                                <b-form-select
                                                    class="form-select"
                                                    v-model="perPageItem"
                                                    size="sm"
                                                    :options="pageOptions"
                                                ></b-form-select>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div class="table-responsive">
                                    <table
                                        class="
                                            table
                                            align-middle
                                            mb-0
                                            table-nowrap
                                        "
                                    >
                                        <thead class="table-light">
                                            <tr>
                                                <th>Product Desc</th>
                                                <th width="150px">Price</th>
                                                <th width="150px">Quantity</th>
                                                <th colspan="2">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <template
                                                v-if="
                                                    filteredCartItems.length >
                                                        0 && !cartBusy
                                                "
                                            >
                                                <tr
                                                    v-for="x in filteredCartItems"
                                                    :key="x.id"
                                                >
                                                    <td>
                                                        <h5
                                                            class="
                                                                font-size-14
                                                                text-truncate
                                                            "
                                                        >
                                                            <a
                                                                href="javascript:void(0);"
                                                                class="
                                                                    text-dark
                                                                "
                                                                >{{
                                                                    x
                                                                        .apiResource
                                                                        .itemName
                                                                }}</a
                                                            >
                                                        </h5>
                                                        <p class="mb-0">
                                                            Description :
                                                            <span
                                                                class="
                                                                    fw-medium
                                                                "
                                                                >{{
                                                                    x
                                                                        .apiResource
                                                                        .description
                                                                }}</span
                                                            >
                                                        </p>
                                                    </td>
                                                    <td>
                                                        {{
                                                            Intl.NumberFormat(
                                                                "ja-JP",
                                                                {
                                                                    currency:
                                                                        "PHP",
                                                                    style: "currency",
                                                                }
                                                            ).format(x.unitCost)
                                                        }}
                                                    </td>
                                                    <td>
                                                        <span
                                                            @click="
                                                                openPopOver(x)
                                                            "
                                                            class="
                                                                form-control
                                                                cursor-pointer
                                                            "
                                                            :id="`editQ-${x.id}`"
                                                            >{{
                                                                x.totalQuantity
                                                            }}</span
                                                        >
                                                        <b-popover
                                                            :show.sync="
                                                                x.editQty
                                                            "
                                                            :target="`editQ-${x.id}`"
                                                            :custom-class="
                                                                x.submitError
                                                                    ? 'custom error'
                                                                    : 'custom'
                                                            "
                                                            triggers="click blur"
                                                            placement="leftbottom"
                                                            @shown="
                                                                onShownPopOver(
                                                                    x
                                                                )
                                                            "
                                                        >
                                                            <template
                                                                v-slot:title
                                                            >
                                                                <small
                                                                    v-if="
                                                                        x.submitError
                                                                    "
                                                                    class="
                                                                        position-absolute
                                                                        text-white
                                                                        error-message
                                                                        px-1
                                                                    "
                                                                    >Quantity
                                                                    must not
                                                                    exceed the
                                                                    max
                                                                    Quantity</small
                                                                >
                                                                <div
                                                                    class="
                                                                        d-flex
                                                                        align-items-center
                                                                        justify-content-between
                                                                    "
                                                                >
                                                                    <small>
                                                                        Edit
                                                                        Quantity
                                                                    </small>
                                                                    <span
                                                                        class="
                                                                            bx
                                                                            bx-x
                                                                            font-size-14
                                                                            cursor-pointer
                                                                        "
                                                                        @click="
                                                                            hidePopOver(
                                                                                x
                                                                            )
                                                                        "
                                                                    ></span>
                                                                </div>
                                                            </template>
                                                            <div class="mb-3">
                                                                <div
                                                                    class="
                                                                        d-flex
                                                                    "
                                                                >
                                                                    <div
                                                                        class="
                                                                            mx-2
                                                                        "
                                                                    >
                                                                        <small
                                                                            >January</small
                                                                        >
                                                                        <div
                                                                            v-if="
                                                                                !cartVariables.Jan
                                                                            "
                                                                        >
                                                                            <input
                                                                                type="text"
                                                                                placeholder="N/A"
                                                                                class="
                                                                                    form-control
                                                                                    form-control-sm
                                                                                "
                                                                                disabled
                                                                            />
                                                                        </div>
                                                                        <div
                                                                            class="
                                                                                text-center
                                                                                position-relative
                                                                            "
                                                                            v-if="
                                                                                cartVariables.Jan >
                                                                                1
                                                                            "
                                                                        >
                                                                            <masked-input
                                                                                type="text"
                                                                                class="
                                                                                    form-control
                                                                                    form-control-sm
                                                                                "
                                                                                v-model="
                                                                                    cartVariables.JanValue
                                                                                "
                                                                                :mask="
                                                                                    currencyMask
                                                                                "
                                                                                @input="
                                                                                    sumUp(
                                                                                        x
                                                                                    )
                                                                                "
                                                                            ></masked-input>
                                                                            <p
                                                                                v-if="
                                                                                    cartVariables.JanValue
                                                                                "
                                                                                class="
                                                                                    badge
                                                                                    position-absolute
                                                                                "
                                                                                style="
                                                                                    top: -5px;
                                                                                    right: -5px;
                                                                                "
                                                                                :class="{
                                                                                    'bg-success':
                                                                                        cartVariables.JanValue <=
                                                                                        cartVariables.JanMax,
                                                                                    'bg-danger':
                                                                                        cartVariables.JanValue >
                                                                                        cartVariables.JanMax,
                                                                                }"
                                                                            >
                                                                                {{
                                                                                    cartVariables.JanValue
                                                                                }}
                                                                                /
                                                                                {{
                                                                                    cartVariables.JanMax
                                                                                }}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div
                                                                        class="
                                                                            mx-2
                                                                        "
                                                                    >
                                                                        <small
                                                                            >February</small
                                                                        >
                                                                        <div
                                                                            v-if="
                                                                                !cartVariables.Feb
                                                                            "
                                                                        >
                                                                            <input
                                                                                type="text"
                                                                                placeholder="N/A"
                                                                                class="
                                                                                    form-control
                                                                                    form-control-sm
                                                                                "
                                                                                disabled
                                                                            />
                                                                        </div>
                                                                        <div
                                                                            class="
                                                                                text-center
                                                                                position-relative
                                                                            "
                                                                            v-if="
                                                                                cartVariables.Feb >
                                                                                1
                                                                            "
                                                                        >
                                                                            <masked-input
                                                                                type="text"
                                                                                class="
                                                                                    form-control
                                                                                    form-control-sm
                                                                                "
                                                                                v-model="
                                                                                    cartVariables.FebValue
                                                                                "
                                                                                :mask="
                                                                                    currencyMask
                                                                                "
                                                                                @input="
                                                                                    sumUp(
                                                                                        x
                                                                                    )
                                                                                "
                                                                            ></masked-input>
                                                                            <p
                                                                                v-if="
                                                                                    cartVariables.FebValue
                                                                                "
                                                                                class="
                                                                                    badge
                                                                                    position-absolute
                                                                                "
                                                                                style="
                                                                                    top: -5px;
                                                                                    right: -5px;
                                                                                "
                                                                                :class="{
                                                                                    'bg-success':
                                                                                        cartVariables.FebValue <=
                                                                                        cartVariables.FebMax,
                                                                                    'bg-danger':
                                                                                        cartVariables.FebValue >
                                                                                        cartVariables.FebMax,
                                                                                }"
                                                                            >
                                                                                {{
                                                                                    cartVariables.FebValue
                                                                                }}
                                                                                /
                                                                                {{
                                                                                    cartVariables.FebMax
                                                                                }}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div
                                                                        class="
                                                                            mx-2
                                                                        "
                                                                    >
                                                                        <small
                                                                            >March</small
                                                                        >
                                                                        <div
                                                                            v-if="
                                                                                !cartVariables.Mar
                                                                            "
                                                                        >
                                                                            <input
                                                                                type="text"
                                                                                placeholder="N/A"
                                                                                class="
                                                                                    form-control
                                                                                    form-control-sm
                                                                                "
                                                                                disabled
                                                                            />
                                                                        </div>
                                                                        <div
                                                                            class="
                                                                                text-center
                                                                                position-relative
                                                                            "
                                                                            v-if="
                                                                                cartVariables.Mar >
                                                                                1
                                                                            "
                                                                        >
                                                                            <masked-input
                                                                                type="text"
                                                                                class="
                                                                                    form-control
                                                                                    form-control-sm
                                                                                "
                                                                                v-model="
                                                                                    cartVariables.MarValue
                                                                                "
                                                                                :mask="
                                                                                    currencyMask
                                                                                "
                                                                                @input="
                                                                                    sumUp(
                                                                                        x
                                                                                    )
                                                                                "
                                                                            ></masked-input>
                                                                            <p
                                                                                v-if="
                                                                                    cartVariables.MarValue
                                                                                "
                                                                                class="
                                                                                    badge
                                                                                    position-absolute
                                                                                "
                                                                                style="
                                                                                    top: -5px;
                                                                                    right: -5px;
                                                                                "
                                                                                :class="{
                                                                                    'bg-success':
                                                                                        cartVariables.MarValue <=
                                                                                        cartVariables.MarMax,
                                                                                    'bg-danger':
                                                                                        cartVariables.MarValue >
                                                                                        cartVariables.MarMax,
                                                                                }"
                                                                            >
                                                                                {{
                                                                                    cartVariables.MarValue
                                                                                }}
                                                                                /
                                                                                {{
                                                                                    cartVariables.MarMax
                                                                                }}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div
                                                                    class="
                                                                        d-flex
                                                                        mt-1
                                                                    "
                                                                >
                                                                    <div
                                                                        class="
                                                                            mx-2
                                                                        "
                                                                    >
                                                                        <small
                                                                            >April</small
                                                                        >
                                                                        <div
                                                                            v-if="
                                                                                !cartVariables.Apr
                                                                            "
                                                                        >
                                                                            <input
                                                                                type="text"
                                                                                placeholder="N/A"
                                                                                class="
                                                                                    form-control
                                                                                    form-control-sm
                                                                                "
                                                                                disabled
                                                                            />
                                                                        </div>
                                                                        <div
                                                                            class="
                                                                                text-center
                                                                                position-relative
                                                                            "
                                                                            v-if="
                                                                                cartVariables.Apr >
                                                                                1
                                                                            "
                                                                        >
                                                                            <masked-input
                                                                                type="text"
                                                                                class="
                                                                                    form-control
                                                                                    form-control-sm
                                                                                "
                                                                                v-model="
                                                                                    cartVariables.AprValue
                                                                                "
                                                                                :mask="
                                                                                    currencyMask
                                                                                "
                                                                                @input="
                                                                                    sumUp(
                                                                                        x
                                                                                    )
                                                                                "
                                                                            ></masked-input>
                                                                            <p
                                                                                v-if="
                                                                                    cartVariables.AprValue
                                                                                "
                                                                                class="
                                                                                    badge
                                                                                    position-absolute
                                                                                "
                                                                                style="
                                                                                    top: -5px;
                                                                                    right: -5px;
                                                                                "
                                                                                :class="{
                                                                                    'bg-success':
                                                                                        cartVariables.AprValue <=
                                                                                        cartVariables.AprMax,
                                                                                    'bg-danger':
                                                                                        cartVariables.AprValue >
                                                                                        cartVariables.AprMax,
                                                                                }"
                                                                            >
                                                                                {{
                                                                                    cartVariables.AprValue
                                                                                }}
                                                                                /
                                                                                {{
                                                                                    cartVariables.AprMax
                                                                                }}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div
                                                                        class="
                                                                            mx-2
                                                                        "
                                                                    >
                                                                        <small
                                                                            >May</small
                                                                        >
                                                                        <div
                                                                            v-if="
                                                                                !cartVariables.May
                                                                            "
                                                                        >
                                                                            <input
                                                                                type="text"
                                                                                placeholder="N/A"
                                                                                class="
                                                                                    form-control
                                                                                    form-control-sm
                                                                                "
                                                                                disabled
                                                                            />
                                                                        </div>
                                                                        <div
                                                                            class="
                                                                                text-center
                                                                                position-relative
                                                                            "
                                                                            v-if="
                                                                                cartVariables.May >
                                                                                1
                                                                            "
                                                                        >
                                                                            <masked-input
                                                                                type="text"
                                                                                class="
                                                                                    form-control
                                                                                    form-control-sm
                                                                                "
                                                                                v-model="
                                                                                    cartVariables.MayValue
                                                                                "
                                                                                :mask="
                                                                                    currencyMask
                                                                                "
                                                                                @input="
                                                                                    sumUp(
                                                                                        x
                                                                                    )
                                                                                "
                                                                            ></masked-input>
                                                                            <p
                                                                                v-if="
                                                                                    cartVariables.MayValue
                                                                                "
                                                                                class="
                                                                                    badge
                                                                                    position-absolute
                                                                                "
                                                                                style="
                                                                                    top: -5px;
                                                                                    right: -5px;
                                                                                "
                                                                                :class="{
                                                                                    'bg-success':
                                                                                        cartVariables.MayValue <=
                                                                                        cartVariables.MayMax,
                                                                                    'bg-danger':
                                                                                        cartVariables.MayValue >
                                                                                        cartVariables.MayMax,
                                                                                }"
                                                                            >
                                                                                {{
                                                                                    cartVariables.MayValue
                                                                                }}
                                                                                /
                                                                                {{
                                                                                    cartVariables.MayMax
                                                                                }}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div
                                                                        class="
                                                                            mx-2
                                                                        "
                                                                    >
                                                                        <small
                                                                            >June</small
                                                                        >
                                                                        <div
                                                                            v-if="
                                                                                !cartVariables.June
                                                                            "
                                                                        >
                                                                            <input
                                                                                type="text"
                                                                                placeholder="N/A"
                                                                                class="
                                                                                    form-control
                                                                                    form-control-sm
                                                                                "
                                                                                disabled
                                                                            />
                                                                        </div>
                                                                        <div
                                                                            class="
                                                                                text-center
                                                                                position-relative
                                                                            "
                                                                            v-if="
                                                                                cartVariables.June >
                                                                                1
                                                                            "
                                                                        >
                                                                            <masked-input
                                                                                type="text"
                                                                                class="
                                                                                    form-control
                                                                                    form-control-sm
                                                                                "
                                                                                v-model="
                                                                                    cartVariables.JuneValue
                                                                                "
                                                                                :mask="
                                                                                    currencyMask
                                                                                "
                                                                                @input="
                                                                                    sumUp(
                                                                                        x
                                                                                    )
                                                                                "
                                                                            ></masked-input>
                                                                            <p
                                                                                v-if="
                                                                                    cartVariables.JuneValue
                                                                                "
                                                                                class="
                                                                                    badge
                                                                                    position-absolute
                                                                                "
                                                                                style="
                                                                                    top: -5px;
                                                                                    right: -5px;
                                                                                "
                                                                                :class="{
                                                                                    'bg-success':
                                                                                        cartVariables.JuneValue <=
                                                                                        cartVariables.JuneMax,
                                                                                    'bg-danger':
                                                                                        cartVariables.JuneValue >
                                                                                        cartVariables.JuneMax,
                                                                                }"
                                                                            >
                                                                                {{
                                                                                    cartVariables.JuneValue
                                                                                }}
                                                                                /
                                                                                {{
                                                                                    cartVariables.JuneMax
                                                                                }}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div
                                                                    class="
                                                                        d-flex
                                                                        mt-1
                                                                    "
                                                                >
                                                                    <div
                                                                        class="
                                                                            mx-2
                                                                        "
                                                                    >
                                                                        <small
                                                                            >July</small
                                                                        >
                                                                        <div
                                                                            v-if="
                                                                                !cartVariables.July
                                                                            "
                                                                        >
                                                                            <input
                                                                                type="text"
                                                                                placeholder="N/A"
                                                                                class="
                                                                                    form-control
                                                                                    form-control-sm
                                                                                "
                                                                                disabled
                                                                            />
                                                                        </div>
                                                                        <div
                                                                            class="
                                                                                text-center
                                                                                position-relative
                                                                            "
                                                                            v-if="
                                                                                cartVariables.July >
                                                                                1
                                                                            "
                                                                        >
                                                                            <masked-input
                                                                                type="text"
                                                                                class="
                                                                                    form-control
                                                                                    form-control-sm
                                                                                "
                                                                                v-model="
                                                                                    cartVariables.JulyValue
                                                                                "
                                                                                :mask="
                                                                                    currencyMask
                                                                                "
                                                                                @input="
                                                                                    sumUp(
                                                                                        x
                                                                                    )
                                                                                "
                                                                            ></masked-input>
                                                                            <p
                                                                                v-if="
                                                                                    cartVariables.JulyValue
                                                                                "
                                                                                class="
                                                                                    badge
                                                                                    position-absolute
                                                                                "
                                                                                style="
                                                                                    top: -5px;
                                                                                    right: -5px;
                                                                                "
                                                                                :class="{
                                                                                    'bg-success':
                                                                                        cartVariables.JulyValue <=
                                                                                        cartVariables.JulyMax,
                                                                                    'bg-danger':
                                                                                        cartVariables.JulyValue >
                                                                                        cartVariables.JulyMax,
                                                                                }"
                                                                            >
                                                                                {{
                                                                                    cartVariables.JulyValue
                                                                                }}
                                                                                /
                                                                                {{
                                                                                    cartVariables.JulyMax
                                                                                }}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div
                                                                        class="
                                                                            mx-2
                                                                        "
                                                                    >
                                                                        <small
                                                                            >August</small
                                                                        >
                                                                        <div
                                                                            v-if="
                                                                                !cartVariables.Aug
                                                                            "
                                                                        >
                                                                            <input
                                                                                type="text"
                                                                                placeholder="N/A"
                                                                                class="
                                                                                    form-control
                                                                                    form-control-sm
                                                                                "
                                                                                disabled
                                                                            />
                                                                        </div>
                                                                        <div
                                                                            class="
                                                                                text-center
                                                                                position-relative
                                                                            "
                                                                            v-if="
                                                                                cartVariables.Aug >
                                                                                1
                                                                            "
                                                                        >
                                                                            <masked-input
                                                                                type="text"
                                                                                class="
                                                                                    form-control
                                                                                    form-control-sm
                                                                                "
                                                                                v-model="
                                                                                    cartVariables.AugValue
                                                                                "
                                                                                :mask="
                                                                                    currencyMask
                                                                                "
                                                                                @input="
                                                                                    sumUp(
                                                                                        x
                                                                                    )
                                                                                "
                                                                            ></masked-input>
                                                                            <p
                                                                                v-if="
                                                                                    cartVariables.AugValue
                                                                                "
                                                                                class="
                                                                                    badge
                                                                                    position-absolute
                                                                                "
                                                                                style="
                                                                                    top: -5px;
                                                                                    right: -5px;
                                                                                "
                                                                                :class="{
                                                                                    'bg-success':
                                                                                        cartVariables.AugValue <=
                                                                                        cartVariables.AugMax,
                                                                                    'bg-danger':
                                                                                        cartVariables.AugValue >
                                                                                        cartVariables.AugMax,
                                                                                }"
                                                                            >
                                                                                {{
                                                                                    cartVariables.AugValue
                                                                                }}
                                                                                /
                                                                                {{
                                                                                    cartVariables.AugMax
                                                                                }}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div
                                                                        class="
                                                                            mx-2
                                                                        "
                                                                    >
                                                                        <small
                                                                            >September</small
                                                                        >
                                                                        <div
                                                                            v-if="
                                                                                !cartVariables.Sep
                                                                            "
                                                                        >
                                                                            <input
                                                                                type="text"
                                                                                placeholder="N/A"
                                                                                class="
                                                                                    form-control
                                                                                    form-control-sm
                                                                                "
                                                                                disabled
                                                                            />
                                                                        </div>
                                                                        <div
                                                                            class="
                                                                                text-center
                                                                                position-relative
                                                                            "
                                                                            v-if="
                                                                                cartVariables.Sep >
                                                                                1
                                                                            "
                                                                        >
                                                                            <masked-input
                                                                                type="text"
                                                                                class="
                                                                                    form-control
                                                                                    form-control-sm
                                                                                "
                                                                                v-model="
                                                                                    cartVariables.SepValue
                                                                                "
                                                                                :mask="
                                                                                    currencyMask
                                                                                "
                                                                                @input="
                                                                                    sumUp(
                                                                                        x
                                                                                    )
                                                                                "
                                                                            ></masked-input>
                                                                            <p
                                                                                v-if="
                                                                                    cartVariables.SepValue
                                                                                "
                                                                                class="
                                                                                    badge
                                                                                    position-absolute
                                                                                "
                                                                                style="
                                                                                    top: -5px;
                                                                                    right: -5px;
                                                                                "
                                                                                :class="{
                                                                                    'bg-success':
                                                                                        cartVariables.SepValue <=
                                                                                        cartVariables.SepMax,
                                                                                    'bg-danger':
                                                                                        cartVariables.SepValue >
                                                                                        cartVariables.SepMax,
                                                                                }"
                                                                            >
                                                                                {{
                                                                                    cartVariables.SepValue
                                                                                }}
                                                                                /
                                                                                {{
                                                                                    cartVariables.SepMax
                                                                                }}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div
                                                                    class="
                                                                        d-flex
                                                                        mt-1
                                                                    "
                                                                >
                                                                    <div
                                                                        class="
                                                                            mx-2
                                                                        "
                                                                    >
                                                                        <small
                                                                            >October</small
                                                                        >
                                                                        <div
                                                                            v-if="
                                                                                !cartVariables.Oct
                                                                            "
                                                                        >
                                                                            <input
                                                                                type="text"
                                                                                placeholder="N/A"
                                                                                class="
                                                                                    form-control
                                                                                    form-control-sm
                                                                                "
                                                                                disabled
                                                                            />
                                                                        </div>
                                                                        <div
                                                                            class="
                                                                                text-center
                                                                                position-relative
                                                                            "
                                                                            v-if="
                                                                                cartVariables.Oct >
                                                                                1
                                                                            "
                                                                        >
                                                                            <masked-input
                                                                                type="text"
                                                                                class="
                                                                                    form-control
                                                                                    form-control-sm
                                                                                "
                                                                                v-model="
                                                                                    cartVariables.OctValue
                                                                                "
                                                                                :mask="
                                                                                    currencyMask
                                                                                "
                                                                                @input="
                                                                                    sumUp(
                                                                                        x
                                                                                    )
                                                                                "
                                                                            ></masked-input>
                                                                            <p
                                                                                v-if="
                                                                                    cartVariables.OctValue
                                                                                "
                                                                                class="
                                                                                    badge
                                                                                    position-absolute
                                                                                "
                                                                                style="
                                                                                    top: -5px;
                                                                                    right: -5px;
                                                                                "
                                                                                :class="{
                                                                                    'bg-success':
                                                                                        cartVariables.OctValue <=
                                                                                        cartVariables.OctMax,
                                                                                    'bg-danger':
                                                                                        cartVariables.OctValue >
                                                                                        cartVariables.OctMax,
                                                                                }"
                                                                            >
                                                                                {{
                                                                                    cartVariables.OctValue
                                                                                }}
                                                                                /
                                                                                {{
                                                                                    cartVariables.OctMax
                                                                                }}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div
                                                                        class="
                                                                            mx-2
                                                                        "
                                                                    >
                                                                        <small
                                                                            >November</small
                                                                        >
                                                                        <div
                                                                            v-if="
                                                                                !cartVariables.Nov
                                                                            "
                                                                        >
                                                                            <input
                                                                                type="text"
                                                                                placeholder="N/A"
                                                                                class="
                                                                                    form-control
                                                                                    form-control-sm
                                                                                "
                                                                                disabled
                                                                            />
                                                                        </div>
                                                                        <div
                                                                            class="
                                                                                text-center
                                                                                position-relative
                                                                            "
                                                                            v-if="
                                                                                cartVariables.Nov >
                                                                                1
                                                                            "
                                                                        >
                                                                            <masked-input
                                                                                type="text"
                                                                                class="
                                                                                    form-control
                                                                                    form-control-sm
                                                                                "
                                                                                v-model="
                                                                                    cartVariables.NovValue
                                                                                "
                                                                                :mask="
                                                                                    currencyMask
                                                                                "
                                                                                @input="
                                                                                    sumUp(
                                                                                        x
                                                                                    )
                                                                                "
                                                                            ></masked-input>
                                                                            <p
                                                                                v-if="
                                                                                    cartVariables.NovValue
                                                                                "
                                                                                class="
                                                                                    badge
                                                                                    position-absolute
                                                                                "
                                                                                style="
                                                                                    top: -5px;
                                                                                    right: -5px;
                                                                                "
                                                                                :class="{
                                                                                    'bg-success':
                                                                                        cartVariables.NovValue <=
                                                                                        cartVariables.NovMax,
                                                                                    'bg-danger':
                                                                                        cartVariables.NovValue >
                                                                                        cartVariables.NovMax,
                                                                                }"
                                                                            >
                                                                                {{
                                                                                    cartVariables.NovValue
                                                                                }}
                                                                                /
                                                                                {{
                                                                                    cartVariables.NovMax
                                                                                }}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div
                                                                        class="
                                                                            mx-2
                                                                        "
                                                                    >
                                                                        <small
                                                                            >December</small
                                                                        >
                                                                        <div
                                                                            v-if="
                                                                                !cartVariables.Dec
                                                                            "
                                                                        >
                                                                            <input
                                                                                type="text"
                                                                                placeholder="N/A"
                                                                                class="
                                                                                    form-control
                                                                                    form-control-sm
                                                                                "
                                                                                disabled
                                                                            />
                                                                        </div>
                                                                        <div
                                                                            class="
                                                                                text-center
                                                                                position-relative
                                                                            "
                                                                            v-if="
                                                                                cartVariables.Dec >
                                                                                1
                                                                            "
                                                                        >
                                                                            <masked-input
                                                                                type="text"
                                                                                class="
                                                                                    form-control
                                                                                    form-control-sm
                                                                                "
                                                                                v-model="
                                                                                    cartVariables.DecValue
                                                                                "
                                                                                :mask="
                                                                                    currencyMask
                                                                                "
                                                                                @input="
                                                                                    sumUp(
                                                                                        x
                                                                                    )
                                                                                "
                                                                            ></masked-input>
                                                                            <p
                                                                                v-if="
                                                                                    cartVariables.DecValue
                                                                                "
                                                                                class="
                                                                                    badge
                                                                                    position-absolute
                                                                                "
                                                                                style="
                                                                                    top: -5px;
                                                                                    right: -5px;
                                                                                "
                                                                                :class="{
                                                                                    'bg-success':
                                                                                        cartVariables.DecValue <=
                                                                                        cartVariables.DecMax,
                                                                                    'bg-danger':
                                                                                        cartVariables.DecValue >
                                                                                        cartVariables.DecMax,
                                                                                }"
                                                                            >
                                                                                {{
                                                                                    cartVariables.DecValue
                                                                                }}
                                                                                /
                                                                                {{
                                                                                    cartVariables.DecMax
                                                                                }}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div
                                                                class="
                                                                    text-right
                                                                "
                                                            >
                                                                <button
                                                                    type="button"
                                                                    class="
                                                                        btn
                                                                        btn-success
                                                                        btn-sm
                                                                        me-2
                                                                    "
                                                                    @click="
                                                                        saveCartItem(
                                                                            x
                                                                        )
                                                                    "
                                                                >
                                                                    Save
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    class="
                                                                        btn
                                                                        btn-link
                                                                        btn-sm
                                                                    "
                                                                    @click="
                                                                        hidePopOver(
                                                                            x
                                                                        )
                                                                    "
                                                                    :ref="`po-${x.id}`"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </b-popover>
                                                    </td>
                                                    <td style="width: 150px">
                                                        {{
                                                            Intl.NumberFormat(
                                                                "ja-JP",
                                                                {
                                                                    currency:
                                                                        "PHP",
                                                                    style: "currency",
                                                                }
                                                            ).format(x.total)
                                                        }}
                                                    </td>
                                                    <td style="width: 70px">
                                                        <a
                                                            href="javascript:void(0);"
                                                            class="
                                                                action-icon
                                                                text-danger
                                                            "
                                                            @click="
                                                                deleteCartItem(
                                                                    x
                                                                )
                                                            "
                                                            ><i
                                                                class="
                                                                    mdi
                                                                    mdi-trash-can
                                                                    font-size-18
                                                                "
                                                            ></i
                                                        ></a>
                                                    </td>
                                                </tr>
                                            </template>
                                            <tr
                                                v-if="
                                                    filteredCartItems.length ==
                                                        0 &&
                                                    filterCartItems &&
                                                    !cartBusy
                                                "
                                            >
                                                <td
                                                    colspan="5"
                                                    class="text-center"
                                                >
                                                    Search not found
                                                </td>
                                            </tr>
                                            <tr
                                                v-if="
                                                    filteredCartItems.length ==
                                                        0 &&
                                                    !filterCartItems &&
                                                    !cartBusy
                                                "
                                            >
                                                <td
                                                    colspan="5"
                                                    class="text-center"
                                                >
                                                    No Cart Items found
                                                </td>
                                            </tr>
                                            <tr v-if="cartBusy">
                                                <td
                                                    colspan="5"
                                                    class="text-center"
                                                >
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
                                                        <strong
                                                            >Loading...</strong
                                                        >
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div class="row mb-2">
                                    <div class="col mb-1 mt-4">
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
                                                <!-- pagination -->
                                                <b-pagination
                                                    v-model="currentPageItem"
                                                    :total-rows="rowsCartItems"
                                                    :per-page="perPageItem"
                                                ></b-pagination>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-4">
                        <form @submit.prevent="checkOut">
                            <div class="card">
                                <div class="card-body">
                                    <h5 class="card-title mb-4">
                                        Purchase Request Details
                                    </h5>
                                    <textarea
                                        rows="8"
                                        placeholder="Purchase Request Description"
                                        class="form-control"
                                        v-model="pr.description"
                                        :class="{
                                            'is-invalid':
                                                $v.pr.description.$error,
                                        }"
                                    >
                                    </textarea>
                                    <div
                                        v-if="$v.pr.description.$error"
                                        class="invalid-feedback"
                                    >
                                        <span v-if="!$v.pr.description.required"
                                            >This value is required.</span
                                        >
                                    </div>
                                </div>
                            </div>
                            <div class="card">
                                <div class="card-body">
                                    <h4 class="card-title mb-3">
                                        Purchase Request Summary
                                    </h4>
                                    <div class="table-responsive">
                                        <table class="table mb-0">
                                            <tbody>
                                                <tr>
                                                    <td>Grand Total :</td>
                                                    <td>
                                                        {{
                                                            Intl.NumberFormat(
                                                                "ja-JP",
                                                                {
                                                                    currency:
                                                                        "PHP",
                                                                    style: "currency",
                                                                }
                                                            ).format(
                                                                totalCartAmt()
                                                            )
                                                        }}
                                                    </td>
                                                </tr>
                                                <!-- <tr>
                                                    <td>Discount :</td>
                                                    <td>
                                                        {{
                                                            Intl.NumberFormat(
                                                                "ja-JP",
                                                                {
                                                                    currency:
                                                                        "PHP",
                                                                    style: "currency",
                                                                }
                                                            ).format(0)
                                                        }}
                                                    </td>
                                                </tr> -->
                                                <tr>
                                                    <th>Total :</th>
                                                    <th>
                                                        {{
                                                            Intl.NumberFormat(
                                                                "ja-JP",
                                                                {
                                                                    currency:
                                                                        "PHP",
                                                                    style: "currency",
                                                                }
                                                            ).format(
                                                                totalCartAmt()
                                                            )
                                                        }}
                                                    </th>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <button
                                            type="submit"
                                            class="btn btn-success btn-block"
                                        >
                                            <i
                                                class="
                                                    mdi mdi-cart-arrow-right
                                                    me-1
                                                "
                                            ></i>
                                            Post PR
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </b-tab>
            <b-tab @click="refreshData(2)">
                <template v-slot:title>
                    <span class="d-inline-block d-sm-none">
                        <i class="bx bx-home"></i>
                    </span>
                    <span class="d-none d-sm-inline-block"
                        >Purchase Requests</span
                    >
                </template>
                <b-tabs
                    pills
                    vertical
                    nav-class="p-0"
                    nav-wrapper-class="col-sm-2"
                    content-class="pt-0 px-2 text-muted"
                >
                    <b-tab title-item-class="mb-2">
                        <template v-slot:title>
                            <span class="d-inline-block d-sm-none">
                                <i class="bx bx-home"></i>
                            </span>
                            <span class="d-none d-sm-inline-block"
                                >Posted (<template v-if="!prBusy">{{
                                    posted.length
                                }}</template
                                ><template v-if="prBusy"
                                    ><b-spinner
                                        type="grow"
                                        class="wh-10p"
                                        variant="success"
                                        role="status"
                                    ></b-spinner></template
                                >)</span
                            >
                        </template>
                        <div class="card">
                            <div class="card-body bg-primary bg-soft">
                                <div class="d-flex align-items-center justify-content-between mb-3">
                                    <div>
                                        <h4 class="card-title mb-0">
                                            Posted Purchase Requests
                                        </h4>
                                        <p class="card-title-desc mb-0">
                                            List of posted Purchase Requests
                                        </p>
                                    </div>
                                    <div>
                                        <b-form-input
                                            autocomplete="off"
                                            v-model="filterPosted"
                                            type="search"
                                            placeholder="Search P.R..."
                                            class="form-control"
                                        ></b-form-input>
                                    </div>
                                </div>
                                <div
                                    v-if="posted.length == 0"
                                    class="text-center"
                                >
                                    <h5>No data available</h5>
                                </div>
                                 <div
                                    v-if="filterPosted && filteredPosted.length == 0"
                                    class="text-center"
                                >
                                    <h5>Search Not Found</h5>
                                </div>
                                <template v-if="posted.length > 0">
                                    <div
                                        role="tablist"
                                        v-for="x in filteredPosted"
                                        :key="x.id"
                                    >
                                        <b-card
                                            no-body
                                            class="mb-1 shadow-none"
                                        >
                                            <b-card-header
                                                header-tag="header"
                                                role="tab"
                                            >
                                                <h6 class="m-0">
                                                    <a
                                                        @click="getPrItems(x)"
                                                        class="text-dark"
                                                        href="javascript: void(0);"
                                                        >[{{
                                                            x.prNumber
                                                        }}]:&nbsp;{{
                                                            x.description
                                                        }}</a
                                                    >
                                                </h6>
                                            </b-card-header>
                                            <b-collapse
                                                :visible="x.visible"
                                                :accordion="`posted-accordion-${x.id}`"
                                                role="tabpanel"
                                            >
                                                <b-card-body class="border px-3 py-2">
                                                    <div class="mb-3">
                                                        <div class="d-flex justify-content-between align-items-center">
                                                            <a href="javascript:void(0);" @click="getAttachments(x)">
                                                                <i class="d-flex align-items-center">
                                                                    <i class="bx bx-paperclip me-1"></i>
                                                                    <span class="me-1">Attachments</span>
                                                                    <i class="bx bx-play me-1 font-size-15 rotate" :class="{'rotate-90': x.showAttachments}"></i>
                                                                </i>
                                                            </a>
                                                            <div class="d-flex">
                                                                <input v-if="x.attachments.length > 0 && x.showAttachments" type="text" class="form-control form-control-sm" v-model="x.fileSearch" @input="searchDocu(x)" placeholder="Search Documents..."/>
                                                            </div>
                                                        </div>
                                                        <b-collapse
                                                            :visible="x.showAttachments"
                                                            :accordion="`posted-attachment-accordion-${x.id}`"
                                                            role="tabpanel"
                                                        >
                                                            <div class="mt-2">
                                                                <b-row>
                                                                    <b-col
                                                                        sm="3"
                                                                        v-for="y in searchDocu(x)"
                                                                        :key="y.id"
                                                                        class="mb-2"
                                                                    >
                                                                        <div
                                                                            class="
                                                                                position-relative
                                                                                cursor-pointer
                                                                            "
                                                                            style="z-index: 10"
                                                                            @click="openDocument(y)"
                                                                        >
                                                                            <div
                                                                                class="
                                                                                    border
                                                                                    p-3
                                                                                "
                                                                            >
                                                                                <div>
                                                                                    <div
                                                                                        class="
                                                                                            float-end
                                                                                            ms-2
                                                                                        "
                                                                                    >
                                                                                        <b-dropdown
                                                                                            id="dropdown-dropleft"
                                                                                            right
                                                                                            variant="link"
                                                                                            toggle-class="text-decoration-none text-dark font-size-16 pt-0"
                                                                                            menu-class="dropdown-menu-end"
                                                                                            no-caret
                                                                                        >
                                                                                            <template #button-content>
                                                                                                <i class="mdi mdi-dots-horizontal"></i>
                                                                                            </template>
                                                                                            <b-dropdown-item
                                                                                                @click="
                                                                                                    openDocument(
                                                                                                        y
                                                                                                    )
                                                                                                "
                                                                                                ><i
                                                                                                    class="
                                                                                                        bx
                                                                                                        bx-link-external
                                                                                                        me-1
                                                                                                    "
                                                                                                ></i
                                                                                                >Open</b-dropdown-item
                                                                                            >
                                                                                        </b-dropdown>
                                                                                    </div>
                                                                                    <div
                                                                                        class="
                                                                                            avatar-xs
                                                                                            me-3
                                                                                            mb-2
                                                                                        "
                                                                                    >
                                                                                        <div
                                                                                            class="
                                                                                                avatar-title
                                                                                                bg-transparent
                                                                                                rounded
                                                                                            "
                                                                                        >
                                                                                            <i
                                                                                                v-if="y.fileType.includes('image')"
                                                                                                class="
                                                                                                    mdi mdi-image
                                                                                                    font-size-24
                                                                                                    text-purple
                                                                                                "
                                                                                            ></i>
                                                                                            <i
                                                                                                v-if="y.fileType.includes('application')"
                                                                                                class="
                                                                                                    mdi mdi-file-pdf-outline
                                                                                                    font-size-24
                                                                                                    text-danger
                                                                                                "
                                                                                            ></i>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div
                                                                                        class="
                                                                                            d-flex
                                                                                        "
                                                                                    >
                                                                                        <div
                                                                                            class="
                                                                                                overflow-hidden
                                                                                                me-auto
                                                                                            "
                                                                                        >
                                                                                            <h5
                                                                                                class="
                                                                                                    font-size-14
                                                                                                    text-truncate
                                                                                                    mb-1
                                                                                                "
                                                                                            >
                                                                                                {{y.description}}
                                                                                            </h5>
                                                                                            <p
                                                                                                class="
                                                                                                    text-muted
                                                                                                    mb-0
                                                                                                "
                                                                                            >
                                                                                                {{formatDateWithTime(new Date(y.dateTimeUploaded))}}
                                                                                            </p>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </b-col>
                                                                </b-row>
                                                                <b-row v-if="x.attachments > 0 && searchDocu(x).length == 0">
                                                                    <b-col>Search Not Found</b-col>
                                                                </b-row>
                                                                <p
                                                                    class="mb-0 text-warning"
                                                                    v-if="
                                                                        !x.attachmentLoading &&
                                                                        x
                                                                            .attachments
                                                                            .length ==
                                                                            0
                                                                    "
                                                                >
                                                                    <i>No documents
                                                                    found</i>
                                                                </p>
                                                                <div
                                                                    v-if="x.attachmentLoading"
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
                                                                        <div
                                                                            class="
                                                                                status
                                                                            "
                                                                        >
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
                                                                    <strong
                                                                        >Loading...</strong
                                                                    >
                                                                </div>
                                                            </div>
                                                        </b-collapse>
                                                    </div>
                                                    <div class="border border-secondary position-relative mb-3 p-3">
                                                        <div class="isCatchup"><i>List of Items</i></div>
                                                        <div
                                                            v-if="
                                                                !x.itemLoaded &&
                                                                x.itemLoading
                                                            "
                                                        >
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
                                                                    <div
                                                                        class="
                                                                            status
                                                                        "
                                                                    >
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
                                                                <strong
                                                                    >Loading...</strong
                                                                >
                                                            </div>
                                                        </div>
                                                        <div
                                                            v-if="
                                                                x.itemLoaded &&
                                                                x.prItems.length ==
                                                                    0
                                                            "
                                                            class="text-center"
                                                        >
                                                            No items found
                                                        </div>
                                                        <table
                                                            width="100%"
                                                            v-if="
                                                                x.prItems.length > 0
                                                            "
                                                        >
                                                            <tr>
                                                                <th></th>
                                                                <th
                                                                    style="
                                                                        width: 160px;
                                                                    "
                                                                    class="
                                                                        text-right
                                                                    "
                                                                ></th>
                                                                <th
                                                                    style="
                                                                        width: 160px;
                                                                    "
                                                                    class="
                                                                        text-right
                                                                    "
                                                                ></th>
                                                            </tr>
                                                            <tr
                                                                v-for="y in x.prItems"
                                                                :key="y.id"
                                                            >
                                                                <td>
                                                                    {{
                                                                        y.totalQuantity
                                                                    }}
                                                                    x
                                                                    {{
                                                                        y
                                                                            .apiResource
                                                                            .itemName
                                                                    }}
                                                                </td>
                                                                <td>
                                                                    {{
                                                                        Intl.NumberFormat(
                                                                            "ja-JP",
                                                                            {
                                                                                currency:
                                                                                    "PHP",
                                                                                style: "currency",
                                                                            }
                                                                        ).format(
                                                                            y.unitCost
                                                                        )
                                                                    }}
                                                                </td>
                                                                <td>
                                                                    {{
                                                                        Intl.NumberFormat(
                                                                            "ja-JP",
                                                                            {
                                                                                currency:
                                                                                    "PHP",
                                                                                style: "currency",
                                                                            }
                                                                        ).format(
                                                                            y.total
                                                                        )
                                                                    }}
                                                                </td>
                                                            </tr>
                                                            <tr
                                                                class="
                                                                    border
                                                                    border-dashed
                                                                "
                                                            >
                                                                <td
                                                                    class="py-2"
                                                                ></td>
                                                                <td
                                                                    class="
                                                                        text-right
                                                                        py-2
                                                                        px-2
                                                                    "
                                                                >
                                                                    Total:
                                                                </td>
                                                                <td
                                                                    colspan="3"
                                                                    class="py-2"
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
                                                                            getTotalPerPR(
                                                                                x.prItems
                                                                            )
                                                                        )
                                                                    }}
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </div>
                                                </b-card-body>
                                            </b-collapse>
                                        </b-card>
                                    </div>
                                </template>
                                <div class="text-right" v-if="posted.length > 0">
                                    <ul
                                        class="
                                            pagination
                                            justify-content-end
                                            px-2
                                            mb-0
                                            mt-3
                                        "
                                        style="z-index: -1"
                                    >
                                        <b-pagination
                                            size="sm"
                                            v-model="
                                                currentPagePR
                                            "
                                            :total-rows="
                                                rowsPosted
                                            "
                                            :per-page="
                                                perPagePR
                                            "
                                        ></b-pagination>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </b-tab>
                    <b-tab title-item-class="mb-2">
                        <template v-slot:title>
                            <span class="d-inline-block d-sm-none">
                                <i class="bx bx-home"></i>
                            </span>
                            <span class="d-none d-sm-inline-block"
                                >Approved (<template v-if="!prBusy">{{
                                    approved.length
                                }}</template
                                ><template v-if="prBusy"
                                    ><b-spinner
                                        type="grow"
                                        class="wh-10p"
                                        variant="success"
                                        role="status"
                                    ></b-spinner></template
                                >)</span
                            >
                        </template>
                        <div class="card">
                            <div class="card-body bg-success bg-soft">
                                <div class="d-flex align-items-center justify-content-between mb-3">
                                    <div>
                                        <h4 class="card-title mb-0">
                                            Approved Purchase Requests
                                        </h4>
                                        <p class="card-title-desc mb-0">
                                            List of approved Purchase Requests
                                        </p>
                                    </div>
                                    <div>
                                        <b-form-input
                                            autocomplete="off"
                                            v-model="filterApproved"
                                            type="search"
                                            placeholder="Search P.R..."
                                            class="form-control"
                                        ></b-form-input>
                                    </div>
                                </div>
                                <div
                                    v-if="approved.length == 0"
                                    class="text-center"
                                >
                                    <h5>No data available</h5>
                                </div>
                                <div
                                    v-if="filterApproved && filteredApproved.length == 0"
                                    class="text-center"
                                >
                                    <h5>Search Not Found</h5>
                                </div>
                                <template v-if="approved.length > 0">
                                    <div
                                        role="tablist"
                                        v-for="x in filteredApproved"
                                        :key="x.id"
                                    >
                                        <b-card
                                            no-body
                                            class="mb-1 shadow-none"
                                        >
                                            <b-card-header
                                                header-tag="header"
                                                role="tab"
                                            >
                                                <h6 class="m-0">
                                                    <a
                                                        @click="getPrItems(x)"
                                                        class="text-dark"
                                                        href="javascript: void(0);"
                                                        >[{{
                                                            x.prNumber
                                                        }}]:&nbsp;{{
                                                            x.description
                                                        }}</a
                                                    >
                                                </h6>
                                            </b-card-header>
                                            <b-collapse
                                                :visible="x.visible"
                                                :accordion="`posted-accordion-${x.id}`"
                                                role="tabpanel"
                                            >
                                                <b-card-body class="border px-3 py-2">
                                                    <div class="mb-3">
                                                        <div class="d-flex justify-content-between align-items-center">
                                                            <a href="javascript:void(0);" @click="getAttachments(x)">
                                                                <i class="d-flex align-items-center">
                                                                    <i class="bx bx-paperclip me-1"></i>
                                                                    <span class="me-1">Attachments</span>
                                                                    <i class="bx bx-play me-1 font-size-15 rotate" :class="{'rotate-90': x.showAttachments}"></i>
                                                                </i>
                                                            </a>
                                                            <div class="d-flex">
                                                                <input v-if="x.attachments.length > 0 && x.showAttachments" type="text" class="form-control form-control-sm" v-model="x.fileSearch" @input="searchDocu(x)" placeholder="Search Documents..."/>
                                                            </div>
                                                        </div>
                                                        <b-collapse
                                                            :visible="x.showAttachments"
                                                            :accordion="`posted-attachment-accordion-${x.id}`"
                                                            role="tabpanel"
                                                        >
                                                            <div class="mt-2">
                                                                <b-row>
                                                                    <b-col
                                                                        sm="3"
                                                                        v-for="y in searchDocu(x)"
                                                                        :key="y.id"
                                                                        class="mb-2"
                                                                    >
                                                                        <div
                                                                            class="
                                                                                position-relative
                                                                                cursor-pointer
                                                                            "
                                                                            style="z-index: 10"
                                                                            @click="openDocument(y)"
                                                                        >
                                                                            <div
                                                                                class="
                                                                                    border
                                                                                    p-3
                                                                                "
                                                                            >
                                                                                <div>
                                                                                    <div
                                                                                        class="
                                                                                            float-end
                                                                                            ms-2
                                                                                        "
                                                                                    >
                                                                                        <b-dropdown
                                                                                            id="dropdown-dropleft"
                                                                                            right
                                                                                            variant="link"
                                                                                            toggle-class="text-decoration-none text-dark font-size-16 pt-0"
                                                                                            menu-class="dropdown-menu-end"
                                                                                            no-caret
                                                                                        >
                                                                                            <template #button-content>
                                                                                                <i class="mdi mdi-dots-horizontal"></i>
                                                                                            </template>
                                                                                            <b-dropdown-item
                                                                                                @click="
                                                                                                    openDocument(
                                                                                                        y
                                                                                                    )
                                                                                                "
                                                                                                ><i
                                                                                                    class="
                                                                                                        bx
                                                                                                        bx-link-external
                                                                                                        me-1
                                                                                                    "
                                                                                                ></i
                                                                                                >Open</b-dropdown-item
                                                                                            >
                                                                                        </b-dropdown>
                                                                                    </div>
                                                                                    <div
                                                                                        class="
                                                                                            avatar-xs
                                                                                            me-3
                                                                                            mb-2
                                                                                        "
                                                                                    >
                                                                                        <div
                                                                                            class="
                                                                                                avatar-title
                                                                                                bg-transparent
                                                                                                rounded
                                                                                            "
                                                                                        >
                                                                                            <i
                                                                                                v-if="y.fileType.includes('image')"
                                                                                                class="
                                                                                                    mdi mdi-image
                                                                                                    font-size-24
                                                                                                    text-purple
                                                                                                "
                                                                                            ></i>
                                                                                            <i
                                                                                                v-if="y.fileType.includes('application')"
                                                                                                class="
                                                                                                    mdi mdi-file-pdf-outline
                                                                                                    font-size-24
                                                                                                    text-danger
                                                                                                "
                                                                                            ></i>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div
                                                                                        class="
                                                                                            d-flex
                                                                                        "
                                                                                    >
                                                                                        <div
                                                                                            class="
                                                                                                overflow-hidden
                                                                                                me-auto
                                                                                            "
                                                                                        >
                                                                                            <h5
                                                                                                class="
                                                                                                    font-size-14
                                                                                                    text-truncate
                                                                                                    mb-1
                                                                                                "
                                                                                            >
                                                                                                {{y.description}}
                                                                                            </h5>
                                                                                            <p
                                                                                                class="
                                                                                                    text-muted
                                                                                                    mb-0
                                                                                                "
                                                                                            >
                                                                                                {{formatDateWithTime(new Date(y.dateTimeUploaded))}}
                                                                                            </p>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </b-col>
                                                                </b-row>
                                                                <b-row v-if="x.attachments > 0 && searchDocu(x).length == 0">
                                                                    <b-col>Search Not Found</b-col>
                                                                </b-row>
                                                                <p
                                                                    class="mb-0 text-warning"
                                                                    v-if="
                                                                        !x.attachmentLoading &&
                                                                        x
                                                                            .attachments
                                                                            .length ==
                                                                            0
                                                                    "
                                                                >
                                                                    <i>No documents
                                                                    found</i>
                                                                </p>
                                                                <div
                                                                    v-if="x.attachmentLoading"
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
                                                                        <div
                                                                            class="
                                                                                status
                                                                            "
                                                                        >
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
                                                                    <strong
                                                                        >Loading...</strong
                                                                    >
                                                                </div>
                                                            </div>
                                                        </b-collapse>
                                                    </div>
                                                    <div class="border border-secondary position-relative mb-3 p-3">
                                                        <div class="isCatchup"><i>List of Items</i></div>
                                                        <div
                                                            class="
                                                                d-flex
                                                                justify-content-center
                                                                align-items-center
                                                            "
                                                            v-if="
                                                                !x.itemLoaded &&
                                                                x.itemLoading
                                                            "
                                                        >
                                                            <div
                                                                class="
                                                                    preloader-component
                                                                    me-2
                                                                "
                                                            >
                                                                <div
                                                                    class="
                                                                        status
                                                                    "
                                                                >
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
                                                            <strong
                                                                >Loading...</strong
                                                            >
                                                        </div>
                                                        <div
                                                            v-if="
                                                                x.itemLoaded &&
                                                                x.prItems.length ==
                                                                    0
                                                            "
                                                            class="text-center"
                                                        >
                                                            No items found
                                                        </div>
                                                        <table
                                                            width="100%"
                                                            v-if="
                                                                x.prItems.length > 0
                                                            "
                                                        >
                                                            <tr>
                                                                <th></th>
                                                                <th
                                                                    style="
                                                                        width: 160px;
                                                                    "
                                                                    class="
                                                                        text-right
                                                                    "
                                                                ></th>
                                                                <th
                                                                    style="
                                                                        width: 160px;
                                                                    "
                                                                    class="
                                                                        text-right
                                                                    "
                                                                ></th>
                                                            </tr>
                                                            <tr
                                                                v-for="y in x.prItems"
                                                                :key="y.id"
                                                            >
                                                                <td>
                                                                    {{
                                                                        y.totalQuantity
                                                                    }}
                                                                    x
                                                                    {{
                                                                        y
                                                                            .apiResource
                                                                            .itemName
                                                                    }}
                                                                </td>
                                                                <td>
                                                                    {{
                                                                        Intl.NumberFormat(
                                                                            "ja-JP",
                                                                            {
                                                                                currency:
                                                                                    "PHP",
                                                                                style: "currency",
                                                                            }
                                                                        ).format(
                                                                            y.unitCost
                                                                        )
                                                                    }}
                                                                </td>
                                                                <td>
                                                                    {{
                                                                        Intl.NumberFormat(
                                                                            "ja-JP",
                                                                            {
                                                                                currency:
                                                                                    "PHP",
                                                                                style: "currency",
                                                                            }
                                                                        ).format(
                                                                            y.total
                                                                        )
                                                                    }}
                                                                </td>
                                                            </tr>
                                                            <tr
                                                                class="
                                                                    border
                                                                    border-dashed
                                                                "
                                                            >
                                                                <td
                                                                    class="py-2"
                                                                ></td>
                                                                <td
                                                                    class="
                                                                        text-right
                                                                        py-2
                                                                        px-2
                                                                    "
                                                                >
                                                                    Total:
                                                                </td>
                                                                <td
                                                                    colspan="3"
                                                                    class="py-2"
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
                                                                            getTotalPerPR(
                                                                                x.prItems
                                                                            )
                                                                        )
                                                                    }}
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </div>
                                                </b-card-body>
                                            </b-collapse>
                                        </b-card>
                                    </div>
                                </template>
                                <div class="text-right" v-if="approved.length > 0">
                                    <ul
                                        class="
                                            pagination
                                            justify-content-end
                                            px-2
                                            mb-0
                                            mt-3
                                        "
                                        style="z-index: -1"
                                    >
                                        <b-pagination
                                            size="sm"
                                            v-model="
                                                currentPagePR
                                            "
                                            :total-rows="
                                                rowsPosted
                                            "
                                            :per-page="
                                                perPagePR
                                            "
                                        ></b-pagination>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </b-tab>
                    <b-tab title-item-class="mb-2">
                        <template v-slot:title>
                            <span class="d-inline-block d-sm-none">
                                <i class="bx bx-home"></i>
                            </span>
                            <span class="d-none d-sm-inline-block"
                                >Returned (<template v-if="!prBusy">{{
                                    returned.length
                                }}</template
                                ><template v-if="prBusy"
                                    ><b-spinner
                                        type="grow"
                                        class="wh-10p"
                                        variant="success"
                                        role="status"
                                    ></b-spinner></template
                                >)</span
                            >
                        </template>
                        <div class="card">
                            <div class="card-body bg-warning bg-soft">
                                <div class="d-flex align-items-center justify-content-between mb-3">
                                    <div>
                                        <h4 class="card-title mb-0">
                                            Returned Purchase Requests
                                        </h4>
                                        <p class="card-title-desc mb-0">
                                            List of returned Purchase Requests
                                        </p>
                                    </div>
                                    <div>
                                        <b-form-input
                                            autocomplete="off"
                                            v-model="filterReturn"
                                            type="search"
                                            placeholder="Search P.R..."
                                            class="form-control"
                                        ></b-form-input>
                                    </div>
                                </div>
                                <div
                                    v-if="returned.length == 0"
                                    class="text-center"
                                >
                                    <h5>No data available</h5>
                                </div>
                                <div
                                    v-if="filterReturn && filteredReturn.length == 0"
                                    class="text-center"
                                >
                                    <h5>Search Not Found</h5>
                                </div>
                                <template v-if="returned.length > 0">
                                    <div
                                        role="tablist"
                                        v-for="x in filteredReturn"
                                        :key="x.id"
                                    >
                                        <b-card
                                            no-body
                                            class="mb-1 shadow-none"
                                        >
                                            <b-card-header
                                                header-tag="header"
                                                role="tab"
                                            >
                                                <div
                                                    class="
                                                        d-flex
                                                        justify-content-between
                                                        align-items-center
                                                    "
                                                >
                                                    <h6 class="m-0">
                                                        <a
                                                            @click="
                                                                getPrItems(x)
                                                            "
                                                            class="text-dark"
                                                            href="javascript: void(0);"
                                                            >[{{
                                                                x.prNumber
                                                            }}]:&nbsp;{{
                                                                x.description
                                                            }}</a
                                                        >
                                                    </h6>
                                                    <button
                                                        @click="updatePR(x)"
                                                        type="button"
                                                        class="
                                                            btn
                                                            btn-sm
                                                            btn-success
                                                        "
                                                        v-if="x.visible"
                                                    >
                                                        <i
                                                            class="
                                                                bx bx-edit
                                                                me-1
                                                            "
                                                        ></i
                                                        >Update Item
                                                    </button>
                                                </div>
                                            </b-card-header>
                                            <b-collapse
                                                :visible="x.visible"
                                                :accordion="`posted-accordion-${x.id}`"
                                                role="tabpanel"
                                            >
                                                
                                                <b-card-body class="border px-3 py-2">
                                                    <div class="mb-3">
                                                        <div class="d-flex justify-content-between align-items-center">
                                                            <a href="javascript:void(0);" @click="getAttachments(x)">
                                                                <i class="d-flex align-items-center">
                                                                    <i class="bx bx-paperclip me-1"></i>
                                                                    <span class="me-1">Attachments</span>
                                                                    <i class="bx bx-play me-1 font-size-15 rotate" :class="{'rotate-90': x.showAttachments}"></i>
                                                                </i>
                                                            </a>
                                                            <div class="d-flex">
                                                                <input v-if="x.attachments.length > 0 && x.showAttachments" type="text" class="form-control form-control-sm" v-model="x.fileSearch" @input="searchDocu(x)" placeholder="Search Documents..."/>
                                                            </div>
                                                        </div>
                                                        <b-collapse
                                                            :visible="x.showAttachments"
                                                            :accordion="`posted-attachment-accordion-${x.id}`"
                                                            role="tabpanel"
                                                        >
                                                            <div class="mt-2">
                                                                <b-row>
                                                                    <b-col
                                                                        sm="3"
                                                                        v-for="y in searchDocu(x)"
                                                                        :key="y.id"
                                                                        class="mb-2"
                                                                    >
                                                                        <div
                                                                            class="
                                                                                position-relative
                                                                                cursor-pointer
                                                                            "
                                                                            style="z-index: 10"
                                                                            @click="openDocument(y)"
                                                                        >
                                                                            <div
                                                                                class="
                                                                                    border
                                                                                    p-3
                                                                                "
                                                                            >
                                                                                <div>
                                                                                    <div
                                                                                        class="
                                                                                            float-end
                                                                                            ms-2
                                                                                        "
                                                                                    >
                                                                                        <b-dropdown
                                                                                            id="dropdown-dropleft"
                                                                                            right
                                                                                            variant="link"
                                                                                            toggle-class="text-decoration-none text-dark font-size-16 pt-0"
                                                                                            menu-class="dropdown-menu-end"
                                                                                            no-caret
                                                                                        >
                                                                                            <template #button-content>
                                                                                                <i class="mdi mdi-dots-horizontal"></i>
                                                                                            </template>
                                                                                            <b-dropdown-item
                                                                                            @click="
                                                                                                openDocument(
                                                                                                    y
                                                                                                )
                                                                                            "
                                                                                            ><i
                                                                                                class="
                                                                                                    bx
                                                                                                    bx-link-external
                                                                                                    me-1
                                                                                                "
                                                                                            ></i
                                                                                            >Open</b-dropdown-item
                                                                                        >
                                                                                        </b-dropdown>
                                                                                    </div>
                                                                                    <div
                                                                                        class="
                                                                                            avatar-xs
                                                                                            me-3
                                                                                            mb-2
                                                                                        "
                                                                                    >
                                                                                        <div
                                                                                            class="
                                                                                                avatar-title
                                                                                                bg-transparent
                                                                                                rounded
                                                                                            "
                                                                                        >
                                                                                            <i
                                                                                                v-if="y.fileType.includes('image')"
                                                                                                class="
                                                                                                    mdi mdi-image
                                                                                                    font-size-24
                                                                                                    text-purple
                                                                                                "
                                                                                            ></i>
                                                                                            <i
                                                                                                v-if="y.fileType.includes('application')"
                                                                                                class="
                                                                                                    mdi mdi-file-pdf-outline
                                                                                                    font-size-24
                                                                                                    text-danger
                                                                                                "
                                                                                            ></i>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div
                                                                                        class="
                                                                                            d-flex
                                                                                        "
                                                                                    >
                                                                                        <div
                                                                                            class="
                                                                                                overflow-hidden
                                                                                                me-auto
                                                                                            "
                                                                                        >
                                                                                            <h5
                                                                                                class="
                                                                                                    font-size-14
                                                                                                    text-truncate
                                                                                                    mb-1
                                                                                                "
                                                                                            >
                                                                                                {{y.description}}
                                                                                            </h5>
                                                                                            <p
                                                                                                class="
                                                                                                    text-muted
                                                                                                    mb-0
                                                                                                "
                                                                                            >
                                                                                                {{formatDateWithTime(new Date(y.dateTimeUploaded))}}
                                                                                            </p>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </b-col>
                                                                </b-row>
                                                                <b-row v-if="x.attachments > 0 && searchDocu(x).length == 0">
                                                                    <b-col>Search Not Found</b-col>
                                                                </b-row>
                                                                <p
                                                                    class="mb-0 text-warning"
                                                                    v-if="
                                                                        !x.attachmentLoading &&
                                                                        x
                                                                            .attachments
                                                                            .length ==
                                                                            0
                                                                    "
                                                                >
                                                                    <i>No documents
                                                                    found</i>
                                                                </p>
                                                                <div
                                                                    v-if="x.attachmentLoading"
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
                                                                        <div
                                                                            class="
                                                                                status
                                                                            "
                                                                        >
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
                                                                    <strong
                                                                        >Loading...</strong
                                                                    >
                                                                </div>
                                                            </div>
                                                        </b-collapse>
                                                    </div>
                                                    <div class="border border-secondary position-relative mb-3 p-3">
                                                        <div class="isCatchup"><i>List of Items</i></div>
                                                        <div
                                                            v-if="
                                                                !x.itemLoaded &&
                                                                x.itemLoading
                                                            "
                                                        >
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
                                                                    <div
                                                                        class="
                                                                            status
                                                                        "
                                                                    >
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
                                                                <strong
                                                                    >Loading...</strong
                                                                >
                                                            </div>
                                                        </div>
                                                        <div
                                                            v-if="
                                                                x.itemLoaded &&
                                                                x.prItems.length ==
                                                                    0
                                                            "
                                                            class="text-center"
                                                        >
                                                            No items found
                                                        </div>
                                                        <table
                                                            width="100%"
                                                            v-if="
                                                                x.prItems.length > 0
                                                            "
                                                        >
                                                            <tr>
                                                                <th></th>
                                                                <th
                                                                    style="
                                                                        width: 160px;
                                                                    "
                                                                    class="
                                                                        text-right
                                                                    "
                                                                ></th>
                                                                <th
                                                                    style="
                                                                        width: 160px;
                                                                    "
                                                                    class="
                                                                        text-right
                                                                    "
                                                                ></th>
                                                            </tr>
                                                            <tr
                                                                v-for="y in x.prItems"
                                                                :key="y.id"
                                                            >
                                                                <td>
                                                                    {{
                                                                        y.totalQuantity
                                                                    }}
                                                                    x
                                                                    {{
                                                                        y
                                                                            .apiResource
                                                                            .itemName
                                                                    }}
                                                                </td>
                                                                <td>
                                                                    {{
                                                                        Intl.NumberFormat(
                                                                            "ja-JP",
                                                                            {
                                                                                currency:
                                                                                    "PHP",
                                                                                style: "currency",
                                                                            }
                                                                        ).format(
                                                                            y.unitCost
                                                                        )
                                                                    }}
                                                                </td>
                                                                <td>
                                                                    {{
                                                                        Intl.NumberFormat(
                                                                            "ja-JP",
                                                                            {
                                                                                currency:
                                                                                    "PHP",
                                                                                style: "currency",
                                                                            }
                                                                        ).format(
                                                                            y.total
                                                                        )
                                                                    }}
                                                                </td>
                                                            </tr>
                                                            <tr
                                                                class="
                                                                    border
                                                                    border-dashed
                                                                "
                                                            >
                                                                <td
                                                                    class="py-2"
                                                                ></td>
                                                                <td
                                                                    class="
                                                                        text-right
                                                                        py-2
                                                                        px-2
                                                                    "
                                                                >
                                                                    Total:
                                                                </td>
                                                                <td
                                                                    colspan="3"
                                                                    class="py-2"
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
                                                                            getTotalPerPR(
                                                                                x.prItems
                                                                            )
                                                                        )
                                                                    }}
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </div>
                                                </b-card-body>
                                            </b-collapse>
                                        </b-card>
                                    </div>
                                </template>
                                <div class="text-right" v-if="returned.length > 0">
                                    <ul
                                        class="
                                            pagination
                                            justify-content-end
                                            px-2
                                            mb-0
                                            mt-3
                                        "
                                        style="z-index: -1"
                                    >
                                        <b-pagination
                                            size="sm"
                                            v-model="
                                                currentPagePR
                                            "
                                            :total-rows="
                                                rowsReturn
                                            "
                                            :per-page="
                                                perPagePR
                                            "
                                        ></b-pagination>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </b-tab>
                </b-tabs>
            </b-tab>
            <b-tab v-if="showUpdatePR">
                <template v-slot:title>
                    <span class="d-inline-block d-sm-none">
                        <i class="bx bx-home"></i>
                    </span>
                    <span class="d-none d-sm-inline-block">Update PR</span
                    ><i
                        class="bx bx-x ms-5 cursor-pointer"
                        @click="dismissUpdate()"
                    ></i>
                </template>
                <div class="row">
                    <div class="col-xl-8">
                        <div class="card">
                            <div class="card-body">
                                <div class="row mb-2">
                                    <div class="col-md-6">
                                        <h5 class="mb-0">
                                            Returned Purchase Request
                                        </h5>
                                        <small
                                            >List of items in returned Purchase
                                            Request</small
                                        >
                                    </div>
                                    <div
                                        class="
                                            col-md-6
                                            d-flex
                                            justify-content-end
                                        "
                                    >
                                        <div
                                            id="tickets-table_filter"
                                            class="dataTables_filter me-1"
                                        >
                                            <label
                                                class="
                                                    d-inline-flex
                                                    align-items-center
                                                "
                                            >
                                                <b-form-input
                                                    autocomplete="off"
                                                    v-model="filterUpdateItems"
                                                    type="search"
                                                    placeholder="Search Items..."
                                                    class="form-control"
                                                ></b-form-input>
                                            </label>
                                        </div>
                                        <div
                                            id="tickets-table_length"
                                            class="dataTables_length"
                                        >
                                            <label
                                                class="
                                                    d-inline-flex
                                                    align-items-center
                                                    mb-0
                                                "
                                            >
                                                <b-form-select
                                                    class="form-select"
                                                    v-model="perPageUpdate"
                                                    size="sm"
                                                    :options="pageOptions"
                                                ></b-form-select>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div class="table-responsive">
                                    <table
                                        class="
                                            table
                                            align-middle
                                            mb-0
                                            table-nowrap
                                        "
                                    >
                                        <thead class="table-light">
                                            <tr>
                                                <th>Product Desc</th>
                                                <th width="150px">Price</th>
                                                <th width="150px">Quantity</th>
                                                <th colspan="2">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <template
                                                v-if="
                                                    filteredUpdateItems.length >
                                                        0 && !updateBusy
                                                "
                                            >
                                                <tr
                                                    v-for="x in filteredUpdateItems"
                                                    :key="x.id"
                                                >
                                                    <td>
                                                        <h5
                                                            class="
                                                                font-size-14
                                                                text-truncate
                                                            "
                                                        >
                                                            <a
                                                                href="javascript:void(0);"
                                                                class="
                                                                    text-dark
                                                                "
                                                                >{{
                                                                    x
                                                                        .apiResource
                                                                        .itemName
                                                                }}</a
                                                            >
                                                        </h5>
                                                        <p class="mb-0">
                                                            Description :
                                                            <span
                                                                class="
                                                                    fw-medium
                                                                "
                                                                >{{
                                                                    x
                                                                        .apiResource
                                                                        .description
                                                                }}</span
                                                            >
                                                        </p>
                                                    </td>
                                                    <td>
                                                        {{
                                                            Intl.NumberFormat(
                                                                "ja-JP",
                                                                {
                                                                    currency:
                                                                        "PHP",
                                                                    style: "currency",
                                                                }
                                                            ).format(x.unitCost)
                                                        }}
                                                    </td>
                                                    <td>
                                                        <span
                                                            @click="
                                                                openPopOver(x)
                                                            "
                                                            class="
                                                                form-control
                                                                cursor-pointer
                                                            "
                                                            :id="`editQU-${x.id}`"
                                                            >{{
                                                                x.totalQuantity
                                                            }}</span
                                                        >
                                                        <b-popover
                                                            :show.sync="
                                                                x.editQty
                                                            "
                                                            :target="`editQU-${x.id}`"
                                                            :custom-class="
                                                                x.submitError
                                                                    ? 'custom error'
                                                                    : 'custom'
                                                            "
                                                            triggers="click blur"
                                                            placement="leftbottom"
                                                            @shown="
                                                                onShownPopOver(
                                                                    x
                                                                )
                                                            "
                                                        >
                                                            <template
                                                                v-slot:title
                                                            >
                                                                <small
                                                                    v-if="
                                                                        x.submitError
                                                                    "
                                                                    class="
                                                                        position-absolute
                                                                        text-white
                                                                        error-message
                                                                        px-1
                                                                    "
                                                                    >Quantity
                                                                    must not
                                                                    exceed the
                                                                    max
                                                                    Quantity</small
                                                                >
                                                                <div
                                                                    class="
                                                                        d-flex
                                                                        align-items-center
                                                                        justify-content-between
                                                                    "
                                                                >
                                                                    <small>
                                                                        Edit
                                                                        Quantity
                                                                    </small>
                                                                    <span
                                                                        class="
                                                                            bx
                                                                            bx-x
                                                                            font-size-14
                                                                            cursor-pointer
                                                                        "
                                                                        @click="
                                                                            hidePopOver(
                                                                                x
                                                                            )
                                                                        "
                                                                    ></span>
                                                                </div>
                                                            </template>
                                                            <div class="mb-3">
                                                                <div
                                                                    class="
                                                                        d-flex
                                                                    "
                                                                >
                                                                    <div
                                                                        class="
                                                                            mx-2
                                                                        "
                                                                    >
                                                                        <small
                                                                            >January</small
                                                                        >
                                                                        <div
                                                                            v-if="
                                                                                !cartVariables.Jan
                                                                            "
                                                                        >
                                                                            <input
                                                                                type="text"
                                                                                placeholder="N/A"
                                                                                class="
                                                                                    form-control
                                                                                    form-control-sm
                                                                                "
                                                                                disabled
                                                                            />
                                                                        </div>
                                                                        <div
                                                                            class="
                                                                                text-center
                                                                                position-relative
                                                                            "
                                                                            v-if="
                                                                                cartVariables.Jan >
                                                                                1
                                                                            "
                                                                        >
                                                                            <masked-input
                                                                                type="text"
                                                                                class="
                                                                                    form-control
                                                                                    form-control-sm
                                                                                "
                                                                                v-model="
                                                                                    cartVariables.JanValue
                                                                                "
                                                                                :mask="
                                                                                    currencyMask
                                                                                "
                                                                                @input="
                                                                                    sumUp(
                                                                                        x
                                                                                    )
                                                                                "
                                                                            ></masked-input>
                                                                            <p
                                                                                v-if="
                                                                                    cartVariables.JanValue
                                                                                "
                                                                                class="
                                                                                    badge
                                                                                    position-absolute
                                                                                "
                                                                                style="
                                                                                    top: -5px;
                                                                                    right: -5px;
                                                                                "
                                                                                :class="{
                                                                                    'bg-success':
                                                                                        cartVariables.JanValue <=
                                                                                        cartVariables.JanMax,
                                                                                    'bg-danger':
                                                                                        cartVariables.JanValue >
                                                                                        cartVariables.JanMax,
                                                                                }"
                                                                            >
                                                                                {{
                                                                                    cartVariables.JanValue
                                                                                }}
                                                                                /
                                                                                {{
                                                                                    cartVariables.JanMax
                                                                                }}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div
                                                                        class="
                                                                            mx-2
                                                                        "
                                                                    >
                                                                        <small
                                                                            >February</small
                                                                        >
                                                                        <div
                                                                            v-if="
                                                                                !cartVariables.Feb
                                                                            "
                                                                        >
                                                                            <input
                                                                                type="text"
                                                                                placeholder="N/A"
                                                                                class="
                                                                                    form-control
                                                                                    form-control-sm
                                                                                "
                                                                                disabled
                                                                            />
                                                                        </div>
                                                                        <div
                                                                            class="
                                                                                text-center
                                                                                position-relative
                                                                            "
                                                                            v-if="
                                                                                cartVariables.Feb >
                                                                                1
                                                                            "
                                                                        >
                                                                            <masked-input
                                                                                type="text"
                                                                                class="
                                                                                    form-control
                                                                                    form-control-sm
                                                                                "
                                                                                v-model="
                                                                                    cartVariables.FebValue
                                                                                "
                                                                                :mask="
                                                                                    currencyMask
                                                                                "
                                                                                @input="
                                                                                    sumUp(
                                                                                        x
                                                                                    )
                                                                                "
                                                                            ></masked-input>
                                                                            <p
                                                                                v-if="
                                                                                    cartVariables.FebValue
                                                                                "
                                                                                class="
                                                                                    badge
                                                                                    position-absolute
                                                                                "
                                                                                style="
                                                                                    top: -5px;
                                                                                    right: -5px;
                                                                                "
                                                                                :class="{
                                                                                    'bg-success':
                                                                                        cartVariables.FebValue <=
                                                                                        cartVariables.FebMax,
                                                                                    'bg-danger':
                                                                                        cartVariables.FebValue >
                                                                                        cartVariables.FebMax,
                                                                                }"
                                                                            >
                                                                                {{
                                                                                    cartVariables.FebValue
                                                                                }}
                                                                                /
                                                                                {{
                                                                                    cartVariables.FebMax
                                                                                }}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div
                                                                        class="
                                                                            mx-2
                                                                        "
                                                                    >
                                                                        <small
                                                                            >March</small
                                                                        >
                                                                        <div
                                                                            v-if="
                                                                                !cartVariables.Mar
                                                                            "
                                                                        >
                                                                            <input
                                                                                type="text"
                                                                                placeholder="N/A"
                                                                                class="
                                                                                    form-control
                                                                                    form-control-sm
                                                                                "
                                                                                disabled
                                                                            />
                                                                        </div>
                                                                        <div
                                                                            class="
                                                                                text-center
                                                                                position-relative
                                                                            "
                                                                            v-if="
                                                                                cartVariables.Mar >
                                                                                1
                                                                            "
                                                                        >
                                                                            <masked-input
                                                                                type="text"
                                                                                class="
                                                                                    form-control
                                                                                    form-control-sm
                                                                                "
                                                                                v-model="
                                                                                    cartVariables.MarValue
                                                                                "
                                                                                :mask="
                                                                                    currencyMask
                                                                                "
                                                                                @input="
                                                                                    sumUp(
                                                                                        x
                                                                                    )
                                                                                "
                                                                            ></masked-input>
                                                                            <p
                                                                                v-if="
                                                                                    cartVariables.MarValue
                                                                                "
                                                                                class="
                                                                                    badge
                                                                                    position-absolute
                                                                                "
                                                                                style="
                                                                                    top: -5px;
                                                                                    right: -5px;
                                                                                "
                                                                                :class="{
                                                                                    'bg-success':
                                                                                        cartVariables.MarValue <=
                                                                                        cartVariables.MarMax,
                                                                                    'bg-danger':
                                                                                        cartVariables.MarValue >
                                                                                        cartVariables.MarMax,
                                                                                }"
                                                                            >
                                                                                {{
                                                                                    cartVariables.MarValue
                                                                                }}
                                                                                /
                                                                                {{
                                                                                    cartVariables.MarMax
                                                                                }}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div
                                                                    class="
                                                                        d-flex
                                                                        mt-1
                                                                    "
                                                                >
                                                                    <div
                                                                        class="
                                                                            mx-2
                                                                        "
                                                                    >
                                                                        <small
                                                                            >April</small
                                                                        >
                                                                        <div
                                                                            v-if="
                                                                                !cartVariables.Apr
                                                                            "
                                                                        >
                                                                            <input
                                                                                type="text"
                                                                                placeholder="N/A"
                                                                                class="
                                                                                    form-control
                                                                                    form-control-sm
                                                                                "
                                                                                disabled
                                                                            />
                                                                        </div>
                                                                        <div
                                                                            class="
                                                                                text-center
                                                                                position-relative
                                                                            "
                                                                            v-if="
                                                                                cartVariables.Apr >
                                                                                1
                                                                            "
                                                                        >
                                                                            <masked-input
                                                                                type="text"
                                                                                class="
                                                                                    form-control
                                                                                    form-control-sm
                                                                                "
                                                                                v-model="
                                                                                    cartVariables.AprValue
                                                                                "
                                                                                :mask="
                                                                                    currencyMask
                                                                                "
                                                                                @input="
                                                                                    sumUp(
                                                                                        x
                                                                                    )
                                                                                "
                                                                            ></masked-input>
                                                                            <p
                                                                                v-if="
                                                                                    cartVariables.AprValue
                                                                                "
                                                                                class="
                                                                                    badge
                                                                                    position-absolute
                                                                                "
                                                                                style="
                                                                                    top: -5px;
                                                                                    right: -5px;
                                                                                "
                                                                                :class="{
                                                                                    'bg-success':
                                                                                        cartVariables.AprValue <=
                                                                                        cartVariables.AprMax,
                                                                                    'bg-danger':
                                                                                        cartVariables.AprValue >
                                                                                        cartVariables.AprMax,
                                                                                }"
                                                                            >
                                                                                {{
                                                                                    cartVariables.AprValue
                                                                                }}
                                                                                /
                                                                                {{
                                                                                    cartVariables.AprMax
                                                                                }}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div
                                                                        class="
                                                                            mx-2
                                                                        "
                                                                    >
                                                                        <small
                                                                            >May</small
                                                                        >
                                                                        <div
                                                                            v-if="
                                                                                !cartVariables.May
                                                                            "
                                                                        >
                                                                            <input
                                                                                type="text"
                                                                                placeholder="N/A"
                                                                                class="
                                                                                    form-control
                                                                                    form-control-sm
                                                                                "
                                                                                disabled
                                                                            />
                                                                        </div>
                                                                        <div
                                                                            class="
                                                                                text-center
                                                                                position-relative
                                                                            "
                                                                            v-if="
                                                                                cartVariables.May >
                                                                                1
                                                                            "
                                                                        >
                                                                            <masked-input
                                                                                type="text"
                                                                                class="
                                                                                    form-control
                                                                                    form-control-sm
                                                                                "
                                                                                v-model="
                                                                                    cartVariables.MayValue
                                                                                "
                                                                                :mask="
                                                                                    currencyMask
                                                                                "
                                                                                @input="
                                                                                    sumUp(
                                                                                        x
                                                                                    )
                                                                                "
                                                                            ></masked-input>
                                                                            <p
                                                                                v-if="
                                                                                    cartVariables.MayValue
                                                                                "
                                                                                class="
                                                                                    badge
                                                                                    position-absolute
                                                                                "
                                                                                style="
                                                                                    top: -5px;
                                                                                    right: -5px;
                                                                                "
                                                                                :class="{
                                                                                    'bg-success':
                                                                                        cartVariables.MayValue <=
                                                                                        cartVariables.MayMax,
                                                                                    'bg-danger':
                                                                                        cartVariables.MayValue >
                                                                                        cartVariables.MayMax,
                                                                                }"
                                                                            >
                                                                                {{
                                                                                    cartVariables.MayValue
                                                                                }}
                                                                                /
                                                                                {{
                                                                                    cartVariables.MayMax
                                                                                }}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div
                                                                        class="
                                                                            mx-2
                                                                        "
                                                                    >
                                                                        <small
                                                                            >June</small
                                                                        >
                                                                        <div
                                                                            v-if="
                                                                                !cartVariables.June
                                                                            "
                                                                        >
                                                                            <input
                                                                                type="text"
                                                                                placeholder="N/A"
                                                                                class="
                                                                                    form-control
                                                                                    form-control-sm
                                                                                "
                                                                                disabled
                                                                            />
                                                                        </div>
                                                                        <div
                                                                            class="
                                                                                text-center
                                                                                position-relative
                                                                            "
                                                                            v-if="
                                                                                cartVariables.June >
                                                                                1
                                                                            "
                                                                        >
                                                                            <masked-input
                                                                                type="text"
                                                                                class="
                                                                                    form-control
                                                                                    form-control-sm
                                                                                "
                                                                                v-model="
                                                                                    cartVariables.JuneValue
                                                                                "
                                                                                :mask="
                                                                                    currencyMask
                                                                                "
                                                                                @input="
                                                                                    sumUp(
                                                                                        x
                                                                                    )
                                                                                "
                                                                            ></masked-input>
                                                                            <p
                                                                                v-if="
                                                                                    cartVariables.JuneValue
                                                                                "
                                                                                class="
                                                                                    badge
                                                                                    position-absolute
                                                                                "
                                                                                style="
                                                                                    top: -5px;
                                                                                    right: -5px;
                                                                                "
                                                                                :class="{
                                                                                    'bg-success':
                                                                                        cartVariables.JuneValue <=
                                                                                        cartVariables.JuneMax,
                                                                                    'bg-danger':
                                                                                        cartVariables.JuneValue >
                                                                                        cartVariables.JuneMax,
                                                                                }"
                                                                            >
                                                                                {{
                                                                                    cartVariables.JuneValue
                                                                                }}
                                                                                /
                                                                                {{
                                                                                    cartVariables.JuneMax
                                                                                }}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div
                                                                    class="
                                                                        d-flex
                                                                        mt-1
                                                                    "
                                                                >
                                                                    <div
                                                                        class="
                                                                            mx-2
                                                                        "
                                                                    >
                                                                        <small
                                                                            >July</small
                                                                        >
                                                                        <div
                                                                            v-if="
                                                                                !cartVariables.July
                                                                            "
                                                                        >
                                                                            <input
                                                                                type="text"
                                                                                placeholder="N/A"
                                                                                class="
                                                                                    form-control
                                                                                    form-control-sm
                                                                                "
                                                                                disabled
                                                                            />
                                                                        </div>
                                                                        <div
                                                                            class="
                                                                                text-center
                                                                                position-relative
                                                                            "
                                                                            v-if="
                                                                                cartVariables.July >
                                                                                1
                                                                            "
                                                                        >
                                                                            <masked-input
                                                                                type="text"
                                                                                class="
                                                                                    form-control
                                                                                    form-control-sm
                                                                                "
                                                                                v-model="
                                                                                    cartVariables.JulyValue
                                                                                "
                                                                                :mask="
                                                                                    currencyMask
                                                                                "
                                                                                @input="
                                                                                    sumUp(
                                                                                        x
                                                                                    )
                                                                                "
                                                                            ></masked-input>
                                                                            <p
                                                                                v-if="
                                                                                    cartVariables.JulyValue
                                                                                "
                                                                                class="
                                                                                    badge
                                                                                    position-absolute
                                                                                "
                                                                                style="
                                                                                    top: -5px;
                                                                                    right: -5px;
                                                                                "
                                                                                :class="{
                                                                                    'bg-success':
                                                                                        cartVariables.JulyValue <=
                                                                                        cartVariables.JulyMax,
                                                                                    'bg-danger':
                                                                                        cartVariables.JulyValue >
                                                                                        cartVariables.JulyMax,
                                                                                }"
                                                                            >
                                                                                {{
                                                                                    cartVariables.JulyValue
                                                                                }}
                                                                                /
                                                                                {{
                                                                                    cartVariables.JulyMax
                                                                                }}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div
                                                                        class="
                                                                            mx-2
                                                                        "
                                                                    >
                                                                        <small
                                                                            >August</small
                                                                        >
                                                                        <div
                                                                            v-if="
                                                                                !cartVariables.Aug
                                                                            "
                                                                        >
                                                                            <input
                                                                                type="text"
                                                                                placeholder="N/A"
                                                                                class="
                                                                                    form-control
                                                                                    form-control-sm
                                                                                "
                                                                                disabled
                                                                            />
                                                                        </div>
                                                                        <div
                                                                            class="
                                                                                text-center
                                                                                position-relative
                                                                            "
                                                                            v-if="
                                                                                cartVariables.Aug >
                                                                                1
                                                                            "
                                                                        >
                                                                            <masked-input
                                                                                type="text"
                                                                                class="
                                                                                    form-control
                                                                                    form-control-sm
                                                                                "
                                                                                v-model="
                                                                                    cartVariables.AugValue
                                                                                "
                                                                                :mask="
                                                                                    currencyMask
                                                                                "
                                                                                @input="
                                                                                    sumUp(
                                                                                        x
                                                                                    )
                                                                                "
                                                                            ></masked-input>
                                                                            <p
                                                                                v-if="
                                                                                    cartVariables.AugValue
                                                                                "
                                                                                class="
                                                                                    badge
                                                                                    position-absolute
                                                                                "
                                                                                style="
                                                                                    top: -5px;
                                                                                    right: -5px;
                                                                                "
                                                                                :class="{
                                                                                    'bg-success':
                                                                                        cartVariables.AugValue <=
                                                                                        cartVariables.AugMax,
                                                                                    'bg-danger':
                                                                                        cartVariables.AugValue >
                                                                                        cartVariables.AugMax,
                                                                                }"
                                                                            >
                                                                                {{
                                                                                    cartVariables.AugValue
                                                                                }}
                                                                                /
                                                                                {{
                                                                                    cartVariables.AugMax
                                                                                }}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div
                                                                        class="
                                                                            mx-2
                                                                        "
                                                                    >
                                                                        <small
                                                                            >September</small
                                                                        >
                                                                        <div
                                                                            v-if="
                                                                                !cartVariables.Sep
                                                                            "
                                                                        >
                                                                            <input
                                                                                type="text"
                                                                                placeholder="N/A"
                                                                                class="
                                                                                    form-control
                                                                                    form-control-sm
                                                                                "
                                                                                disabled
                                                                            />
                                                                        </div>
                                                                        <div
                                                                            class="
                                                                                text-center
                                                                                position-relative
                                                                            "
                                                                            v-if="
                                                                                cartVariables.Sep >
                                                                                1
                                                                            "
                                                                        >
                                                                            <masked-input
                                                                                type="text"
                                                                                class="
                                                                                    form-control
                                                                                    form-control-sm
                                                                                "
                                                                                v-model="
                                                                                    cartVariables.SepValue
                                                                                "
                                                                                :mask="
                                                                                    currencyMask
                                                                                "
                                                                                @input="
                                                                                    sumUp(
                                                                                        x
                                                                                    )
                                                                                "
                                                                            ></masked-input>
                                                                            <p
                                                                                v-if="
                                                                                    cartVariables.SepValue
                                                                                "
                                                                                class="
                                                                                    badge
                                                                                    position-absolute
                                                                                "
                                                                                style="
                                                                                    top: -5px;
                                                                                    right: -5px;
                                                                                "
                                                                                :class="{
                                                                                    'bg-success':
                                                                                        cartVariables.SepValue <=
                                                                                        cartVariables.SepMax,
                                                                                    'bg-danger':
                                                                                        cartVariables.SepValue >
                                                                                        cartVariables.SepMax,
                                                                                }"
                                                                            >
                                                                                {{
                                                                                    cartVariables.SepValue
                                                                                }}
                                                                                /
                                                                                {{
                                                                                    cartVariables.SepMax
                                                                                }}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div
                                                                    class="
                                                                        d-flex
                                                                        mt-1
                                                                    "
                                                                >
                                                                    <div
                                                                        class="
                                                                            mx-2
                                                                        "
                                                                    >
                                                                        <small
                                                                            >October</small
                                                                        >
                                                                        <div
                                                                            v-if="
                                                                                !cartVariables.Oct
                                                                            "
                                                                        >
                                                                            <input
                                                                                type="text"
                                                                                placeholder="N/A"
                                                                                class="
                                                                                    form-control
                                                                                    form-control-sm
                                                                                "
                                                                                disabled
                                                                            />
                                                                        </div>
                                                                        <div
                                                                            class="
                                                                                text-center
                                                                                position-relative
                                                                            "
                                                                            v-if="
                                                                                cartVariables.Oct >
                                                                                1
                                                                            "
                                                                        >
                                                                            <masked-input
                                                                                type="text"
                                                                                class="
                                                                                    form-control
                                                                                    form-control-sm
                                                                                "
                                                                                v-model="
                                                                                    cartVariables.OctValue
                                                                                "
                                                                                :mask="
                                                                                    currencyMask
                                                                                "
                                                                                @input="
                                                                                    sumUp(
                                                                                        x
                                                                                    )
                                                                                "
                                                                            ></masked-input>
                                                                            <p
                                                                                v-if="
                                                                                    cartVariables.OctValue
                                                                                "
                                                                                class="
                                                                                    badge
                                                                                    position-absolute
                                                                                "
                                                                                style="
                                                                                    top: -5px;
                                                                                    right: -5px;
                                                                                "
                                                                                :class="{
                                                                                    'bg-success':
                                                                                        cartVariables.OctValue <=
                                                                                        cartVariables.OctMax,
                                                                                    'bg-danger':
                                                                                        cartVariables.OctValue >
                                                                                        cartVariables.OctMax,
                                                                                }"
                                                                            >
                                                                                {{
                                                                                    cartVariables.OctValue
                                                                                }}
                                                                                /
                                                                                {{
                                                                                    cartVariables.OctMax
                                                                                }}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div
                                                                        class="
                                                                            mx-2
                                                                        "
                                                                    >
                                                                        <small
                                                                            >November</small
                                                                        >
                                                                        <div
                                                                            v-if="
                                                                                !cartVariables.Nov
                                                                            "
                                                                        >
                                                                            <input
                                                                                type="text"
                                                                                placeholder="N/A"
                                                                                class="
                                                                                    form-control
                                                                                    form-control-sm
                                                                                "
                                                                                disabled
                                                                            />
                                                                        </div>
                                                                        <div
                                                                            class="
                                                                                text-center
                                                                                position-relative
                                                                            "
                                                                            v-if="
                                                                                cartVariables.Nov >
                                                                                1
                                                                            "
                                                                        >
                                                                            <masked-input
                                                                                type="text"
                                                                                class="
                                                                                    form-control
                                                                                    form-control-sm
                                                                                "
                                                                                v-model="
                                                                                    cartVariables.NovValue
                                                                                "
                                                                                :mask="
                                                                                    currencyMask
                                                                                "
                                                                                @input="
                                                                                    sumUp(
                                                                                        x
                                                                                    )
                                                                                "
                                                                            ></masked-input>
                                                                            <p
                                                                                v-if="
                                                                                    cartVariables.NovValue
                                                                                "
                                                                                class="
                                                                                    badge
                                                                                    position-absolute
                                                                                "
                                                                                style="
                                                                                    top: -5px;
                                                                                    right: -5px;
                                                                                "
                                                                                :class="{
                                                                                    'bg-success':
                                                                                        cartVariables.NovValue <=
                                                                                        cartVariables.NovMax,
                                                                                    'bg-danger':
                                                                                        cartVariables.NovValue >
                                                                                        cartVariables.NovMax,
                                                                                }"
                                                                            >
                                                                                {{
                                                                                    cartVariables.NovValue
                                                                                }}
                                                                                /
                                                                                {{
                                                                                    cartVariables.NovMax
                                                                                }}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div
                                                                        class="
                                                                            mx-2
                                                                        "
                                                                    >
                                                                        <small
                                                                            >December</small
                                                                        >
                                                                        <div
                                                                            v-if="
                                                                                !cartVariables.Dec
                                                                            "
                                                                        >
                                                                            <input
                                                                                type="text"
                                                                                placeholder="N/A"
                                                                                class="
                                                                                    form-control
                                                                                    form-control-sm
                                                                                "
                                                                                disabled
                                                                            />
                                                                        </div>
                                                                        <div
                                                                            class="
                                                                                text-center
                                                                                position-relative
                                                                            "
                                                                            v-if="
                                                                                cartVariables.Dec >
                                                                                1
                                                                            "
                                                                        >
                                                                            <masked-input
                                                                                type="text"
                                                                                class="
                                                                                    form-control
                                                                                    form-control-sm
                                                                                "
                                                                                v-model="
                                                                                    cartVariables.DecValue
                                                                                "
                                                                                :mask="
                                                                                    currencyMask
                                                                                "
                                                                                @input="
                                                                                    sumUp(
                                                                                        x
                                                                                    )
                                                                                "
                                                                            ></masked-input>
                                                                            <p
                                                                                v-if="
                                                                                    cartVariables.DecValue
                                                                                "
                                                                                class="
                                                                                    badge
                                                                                    position-absolute
                                                                                "
                                                                                style="
                                                                                    top: -5px;
                                                                                    right: -5px;
                                                                                "
                                                                                :class="{
                                                                                    'bg-success':
                                                                                        cartVariables.DecValue <=
                                                                                        cartVariables.DecMax,
                                                                                    'bg-danger':
                                                                                        cartVariables.DecValue >
                                                                                        cartVariables.DecMax,
                                                                                }"
                                                                            >
                                                                                {{
                                                                                    cartVariables.DecValue
                                                                                }}
                                                                                /
                                                                                {{
                                                                                    cartVariables.DecMax
                                                                                }}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div
                                                                class="
                                                                    text-right
                                                                "
                                                            >
                                                                <button
                                                                    type="button"
                                                                    class="
                                                                        btn
                                                                        btn-success
                                                                        btn-sm
                                                                        me-2
                                                                    "
                                                                    @click="
                                                                        savePRItem(
                                                                            x
                                                                        )
                                                                    "
                                                                >
                                                                    Save
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    class="
                                                                        btn
                                                                        btn-link
                                                                        btn-sm
                                                                    "
                                                                    @click="
                                                                        hidePopOver(
                                                                            x
                                                                        )
                                                                    "
                                                                    :ref="`po-${x.id}`"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </b-popover>
                                                    </td>
                                                    <td style="width: 150px">
                                                        {{
                                                            Intl.NumberFormat(
                                                                "ja-JP",
                                                                {
                                                                    currency:
                                                                        "PHP",
                                                                    style: "currency",
                                                                }
                                                            ).format(x.total)
                                                        }}
                                                    </td>
                                                    <td style="width: 70px">
                                                        <a
                                                            href="javascript:void(0);"
                                                            class="
                                                                action-icon
                                                                text-danger
                                                            "
                                                            @click="
                                                                deleteCartItem(
                                                                    x
                                                                )
                                                            "
                                                            ><i
                                                                class="
                                                                    mdi
                                                                    mdi-trash-can
                                                                    font-size-18
                                                                "
                                                            ></i
                                                        ></a>
                                                    </td>
                                                </tr>
                                            </template>
                                            <tr
                                                v-if="
                                                    filteredUpdateItems.length ==
                                                        0 &&
                                                    filterUpdateItems &&
                                                    !updateBusy
                                                "
                                            >
                                                <td
                                                    colspan="5"
                                                    class="text-center"
                                                >
                                                    Search not found
                                                </td>
                                            </tr>
                                            <tr
                                                v-if="
                                                    filteredUpdateItems.length ==
                                                        0 &&
                                                    !filterUpdateItems &&
                                                    !cartBusy
                                                "
                                            >
                                                <td
                                                    colspan="5"
                                                    class="text-center"
                                                >
                                                    No Items found
                                                </td>
                                            </tr>
                                            <tr v-if="updateBusy">
                                                <td
                                                    colspan="5"
                                                    class="text-center"
                                                >
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
                                                        <strong
                                                            >Loading...</strong
                                                        >
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div class="row mb-2">
                                    <div class="col mb-1 mt-4">
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
                                                <!-- pagination -->
                                                <b-pagination
                                                    v-model="currentPageUpdate"
                                                    :total-rows="
                                                        rowsUpdateItems
                                                    "
                                                    :per-page="perPageUpdate"
                                                ></b-pagination>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-4">
                        <form @submit.prevent="savePR">
                            <div class="card">
                                <div class="card-body">
                                    <h5 class="card-title mb-4">
                                        Purchase Request Details
                                    </h5>
                                    <textarea
                                        rows="8"
                                        placeholder="Purchase Request Description"
                                        v-model="prHeader.description"
                                        class="form-control"
                                        :class="{
                                            'is-invalid':
                                                $v.prHeader.description.$error,
                                        }"
                                    >
                                    </textarea>
                                    <div
                                        v-if="$v.prHeader.description.$error"
                                        class="invalid-feedback"
                                    >
                                        <span
                                            v-if="
                                                !$v.prHeader.description
                                                    .required
                                            "
                                            >This value is required.</span
                                        >
                                    </div>
                                </div>
                            </div>
                            <div class="card">
                                <div class="card-body">
                                    <h4 class="card-title mb-3">
                                        Purchase Request Summary
                                    </h4>
                                    <div class="table-responsive">
                                        <table class="table mb-0">
                                            <tbody>
                                                <tr>
                                                    <td>Grand Total :</td>
                                                    <td>
                                                        {{
                                                            Intl.NumberFormat(
                                                                "ja-JP",
                                                                {
                                                                    currency:
                                                                        "PHP",
                                                                    style: "currency",
                                                                }
                                                            ).format(
                                                                totalUpdateAmt()
                                                            )
                                                        }}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>Discount :</td>
                                                    <td>
                                                        {{
                                                            Intl.NumberFormat(
                                                                "ja-JP",
                                                                {
                                                                    currency:
                                                                        "PHP",
                                                                    style: "currency",
                                                                }
                                                            ).format(0)
                                                        }}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <th>Total :</th>
                                                    <th>
                                                        {{
                                                            Intl.NumberFormat(
                                                                "ja-JP",
                                                                {
                                                                    currency:
                                                                        "PHP",
                                                                    style: "currency",
                                                                }
                                                            ).format(
                                                                totalUpdateAmt()
                                                            )
                                                        }}
                                                    </th>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <button
                                            type="submit"
                                            class="btn btn-success btn-block"
                                        >
                                            <i class="bx bx-save me-1"></i>
                                            Save & Update
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </b-tab>
        </b-tabs>
        <div class="position-absolute" style="bottom: 100px; right: 100px">
            <div class="position-relative" v-if="selectedAvailableItems.length > 0">
                <button
                    class="
                        btn btn-success
                        d-flex
                        align-items-center
                        rounded-pill
                        hover-max-width
                    "
                    type="button"
                    @click="addToCart(selectedAvailableItems)"
                >
                    <i class="bx bx-cart font-size-18"></i><span>Add to Cart</span>
                </button>
                <small
                    class="position-absolute badge bg-danger"
                    style="top: -5px; right: -5px; z-index: 10px"
                    >{{ selectedAvailableItems.length }}</small
                >
            </div>
        </div>
    </Layout>
</template>