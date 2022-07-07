<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import { cloneDeep } from "lodash";
import { required } from "vuelidate/lib/validators";
import Swal from "sweetalert2";
import DatePicker from "vue2-datepicker";
import Multiselect from "vue-multiselect";
import createNumberMask from "text-mask-addons/dist/createNumberMask";
import MaskedInput from "vue-text-mask";
import SupplierRfq from "@/components/modals/supplier-rfq";
import PrintOptions from "@/components/modals/print-options.vue";

export default {
    page: {
        title: "Request for Quotation",
    },
    components: {
        Layout,
        PageHeader,
        MaskedInput,
        DatePicker,
        Multiselect,
        SupplierRfq,
        PrintOptions,
    },
    data() {
        return {
            title: "Request for Quotation",
            submitted: false,
            items: [
                {
                    text: "Dashboards",
                    href: "/",
                },
                {
                    text: "Request for Quotation",
                    active: true,
                },
            ],
            singleSelection: false,
            currencyMask: createNumberMask({
                prefix: "",
                includeThousandsSeparator: true,
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
            rfq: {
                id: 0,
                description: "",
                tracking: "",
                resolutionNumber: "",
                modeOfProcurement: "",
                deliveryPeriod: "",
                deadline: "",
                supplierIds: [],
                cycle: this.$store.state.data.cycle,
            },
            rfqHeader: {
                id: 0,
                description: "",
            },
            form: {
                id: "",
                remarks: "",
            },
            tabIndex: 0,
            posted: [],
            returned: [],
            submittedRFQ: [],
            postedBusy: false,
            returnBusy: false,
            submittedBusy: false,
            updateItems: [],
            cartBusy: false,
            updateBusy: false,
            suppliers: [],
            selectedSupplier: [],
            mop: [],
            units: [],
            offers: [],

            filterSubmittedRFQ: "",
            filterPostedRFQ: "",
            addSupplier: {},
            selectedRFQ: {},
            addItem: false,

            po: {
                description: "",
                cycle: this.$store.state.data.cycle,
                rfqSupplierId: 0,
                poDateReceived: new Date(),
            },
        };
    },
    async created() {
        await this.getMOP();
        await this.getUnits();
        this.changeCycle(this.$store.state.data.cycle);
    },
    validations: {
        rfq: {
            description: { required },
            tracking: { required },
            resolutionNumber: { required },
            modeOfProcurement: { required },
            deliveryPeriod: { required },
            deadline: { required },
        },
        selectedSupplier: { required },
        addSupplier: { required },
        form: { remarks: { required } },
        po: { description: { required } },
    },
    computed: {
        filteredAvailableItems() {
            let data = this.availableTable;
            var total = this.currentPageItem * this.perPageItem;
            if (this.filterItem.trim() != "" && this.filterItem) {
                data = data.filter((item) => {
                    return item.searchKey
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
                item.prItems.forEach((x) => {
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
                    return item.prItem.apiResource.itemName
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
        filteredSubmittedRFQ() {
            let data = this.submittedRFQ;
            var total = this.currentPageItem * this.perPageItem;
            if (
                this.filterSubmittedRFQ.trim() != "" &&
                this.filterSubmittedRFQ
            ) {
                data = data.filter((item) => {
                    return item.searchKey
                        .toUpperCase()
                        .includes(this.filterSubmittedRFQ.toUpperCase());
                });
            }
            data = data.slice(total - this.perPageItem, total);
            return data;
        },
        filteredPostedRFQ() {
            let data = this.posted;
            var total = this.currentPageItem * this.perPageItem;
            if (this.filterPostedRFQ.trim() != "" && this.filterPostedRFQ) {
                data = data.filter((item) => {
                    return item.searchKey
                        .toUpperCase()
                        .includes(this.filterPostedRFQ.toUpperCase());
                });
            }
            data = data.slice(total - this.perPageItem, total);
            return data;
        },
    },
    methods: {
        changeCycle(cycle) {
            this.getAvailableItems(cycle);
            this.getCartItems(cycle);
            this.getPostedRFQ(cycle);
            // this.getReturnedRFQ(cycle);
            this.getSubmittedRFQ(cycle);
        },
        getPostedRFQ(cycle) {
            this.$store
                .dispatch("rfq/GetPostedRfq", cycle)
                .then((res) => {
                    res.data.forEach((item) => {
                        item.searchKey =  `${item.description} ${item.rfqNumber}`;
                        item.itemLoaded = false;
                        item.itemLoading = false;
                        item.visible = true;
                        item.itemVisible = false;
                        item.mop = this.mop.find(
                            (x) => x.value == item.modeOfProcurement
                        );
                        item.supplierShow = true;
                        item.detailShow = true;
                        item.generatePO = false;
                        item.generatingPO = false;
                        item.itemMessage = "";
                        item.itemMsgType = "";
                        item.rfqItems.forEach((x) => {
                            var unit = this.units.find(
                                (y) => y.id == x.prItem.apiResource.unitId
                            );
                            x.offer = {
                                id: 0,
                                rfqSupplierId: 0,
                                rfqItemId: x.id,
                                itemName: x.prItem.apiResource.itemName,
                                description: x.prItem.apiResource.description,
                                unitId: "",
                                unit: unit ? unit : {},
                                unitCost: "0",
                                quantity: "0",
                                note: "",
                                isWinner: false,
                                totalAmt: 0,
                                specification: "",
                                brand: "",
                                model: "",
                                color: "",
                                dimensionDescription: "",
                                materialUsed: "",
                                packageDescription: "",
                                condition: "",
                            };
                            x.prItem.apiResource.unit = unit ? unit : {};
                        });
                        item.rfqSuppliers.forEach((x) => {
                            var isWinner = false;
                            x.rfqSupplierOffers.forEach((y) => {
                                if (y.isWinner) {
                                    isWinner = true;
                                }
                                y.unit = this.units.find(
                                    (z) => z.id == y.unitId
                                );
                                y.totalAmt =
                                    parseFloat(y.quantity) *
                                    parseFloat(y.unitCost);
                            });
                            x.isWinner = isWinner;
                            x.visible = false;
                        });
                    });
                    this.posted = res.data;
                })
                .catch((err) => {
                    this.showToast(
                        "Something went wrong - getting posted RFQ",
                        "error"
                    );
                });
        },
        getSubmittedRFQ(cycle) {
            this.$store
                .dispatch("rfq/GetSubmittedRfq", cycle)
                .then((res) => {
                    res.data.forEach((item) => {
                        item.searchKey =  `${item.description} ${item.rfqNumber}`;
                        item.itemLoaded = false;
                        item.itemLoading = false;
                        item.visible = true;
                        item.itemVisible = false;
                        item.addSupplier = false;
                        item.mop = this.mop.find(
                            (x) => x.value == item.modeOfProcurement
                        );
                        item.supplierShow = false;
                        item.detailShow = true;
                        item.generatePO = false;
                        item.supplierMessage = "";
                        item.supplierMsgType = "";
                        item.itemMessage = "";
                        item.itemMsgType = "";
                        item.isPosting = false;
                        item.postingMessage = "";
                        item.errorPost = false;
                        item.rfqItems.forEach((x) => {
                            var unit = this.units.find(
                                (y) => y.id == x.prItem.apiResource.unitId
                            );
                            x.offer = {
                                id: 0,
                                rfqSupplierId: 0,
                                rfqItemId: x.id,
                                itemName: x.prItem.apiResource.itemName,
                                description: x.prItem.apiResource.description,
                                unitId: "",
                                unit: unit ? unit : {},
                                unitCost: "0",
                                quantity: "0",
                                note: "",
                                isWinner: false,
                                totalAmt: 0,
                                specification: "",
                                brand: "",
                                model: "",
                                color: "",
                                dimensionDescription: "",
                                materialUsed: "",
                                packageDescription: "",
                                condition: "",
                            };
                            x.prItem.apiResource.unit = unit ? unit : {};
                        });
                    });
                    this.submittedRFQ = res.data;
                })
                .catch((err) => {
                    this.showToast(
                        "Something went wrong - getting submitted RFQ",
                        "error"
                    );
                });
        },
        async getMOP() {
            await this.$store
                .dispatch("modeofprocurement/GetModeOfProcurement")
                .then((res) => {
                    var mop = [{ text: "" }];
                    res.data.forEach((item) => {
                        mop.push({ text: item.name, value: item.id });
                    });
                    this.mop = mop;
                })
                .catch(() => {
                    this.showToast(
                        "Something went wrong - getting mode of procurement",
                        "error"
                    );
                });
        },
        async getUnits() {
            await this.$store
                .dispatch("unit/GetUnit")
                .then((res) => {
                    this.units = res.data;
                })
                .catch(() => {
                    this.showToast(
                        "Something went wrong - getting units",
                        "error"
                    );
                });
        },
        getAvailableItems(cycle) {
            this.availableTable = [];
            this.availableBusy = true;
            this.$store
                .dispatch("rfqitem/GetAvailablePRs", cycle)
                .then((res) => {
                    this.availableBusy = false;
                    res.data.forEach((y) => {
                        y.checkAllWork = false;
                        y.searchKey = "";
                        y.prItems.forEach((item) => {
                            item.toggleSelected = false;
                            item.submitError = false;
                            y.searchKey += item.apiResource.itemName + " ";
                        });
                    });
                    this.availableTable = res.data;
                })
                .catch((err) => {
                    this.availableBusy = false;
                    this.showToast(
                        "Something went wrong - getting available items",
                        "error"
                    );
                });
        },
        getCartItems(cycle) {
            this.cartItems = [];
            this.cartBusy = true;
            this.$store
                .dispatch("rfq/GetRFQCarts", cycle)
                .then((res) => {
                    if (res.data) {
                        this.loopCart(res.data.rfqItems);
                        this.rfq.id = res.data.id;
                        this.cartItems = res.data.rfqItems;
                        this.cartCount = this.cartItems.length;
                        this.cartBusy = false;
                    } else {
                        this.cartCount = 0;
                        this.cartBusy = false;
                    }
                })
                .catch((err) => {
                    this.cartBusy = false;
                    this.showToast(
                        "Something went wrong - getting cart items",
                        "error"
                    );
                });
        },
        loopCart(row) {
            row.forEach((item) => {
                item.editQty = false;
                item.prItem.prItemDetails.forEach((x) => {
                    if (x.monthId == 1) {
                        item.JanValue = parseFloat(x.quantity).toString();
                    }
                    if (x.monthId == 2) {
                        item.FebValue = parseFloat(x.quantity).toString();
                    }
                    if (x.monthId == 3) {
                        item.MarValue = parseFloat(x.quantity).toString();
                    }
                    if (x.monthId == 4) {
                        item.AprValue = parseFloat(x.quantity).toString();
                    }
                    if (x.monthId == 5) {
                        item.MayValue = parseFloat(x.quantity).toString();
                    }
                    if (x.monthId == 6) {
                        item.JuneValue = parseFloat(x.quantity).toString();
                    }
                    if (x.monthId == 7) {
                        item.JulyValue = parseFloat(x.quantity).toString();
                    }
                    if (x.monthId == 8) {
                        item.AugValue = parseFloat(x.quantity).toString();
                    }
                    if (x.monthId == 9) {
                        item.SepValue = parseFloat(x.quantity).toString();
                    }
                    if (x.monthId == 10) {
                        item.OctValue = parseFloat(x.quantity).toString();
                    }
                    if (x.monthId == 11) {
                        item.NovValue = parseFloat(x.quantity).toString();
                    }
                    if (x.monthId == 12) {
                        item.DecValue = parseFloat(x.quantity).toString();
                    }
                });
            });
        },
        getAllMyRFQ(cycle) {
            this.posted = [];
            this.postedBusy = true;
            this.$store
                .dispatch("rfq/GetPostedRfq", cycle)
                .then((res) => {
                    this.postedBusy = false;
                    if (res.data.error) {
                        this.showToast(res.data.errorMessage, "error");
                    }
                })
                .catch((err) => {
                    this.cartBusy = false;
                    this.showToast(
                        "Something went wrong - getting posted RFQ",
                        "error"
                    );
                });
        },
        refreshData(idx) {
            if (idx == this.tabIndex) return;
            if (idx == 0) {
                this.getAvailableItems(this.$store.state.data.cycle);
            } else if (idx == 1) {
                this.getCartItems(this.$store.state.data.cycle);
            } else if (idx == 2) {
                this.getAllMyRFQ(this.$store.state.data.cycle);
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
            x.prItems.forEach((item) => {
                item.toggleSelected = x.checkAllWork;
            });
        },
        checkApiResource(y) {
            let count = 0;
            y.prItems.forEach((item) => {
                item.toggleSelected && count++;
            });
            y.checkAllWork = count == y.prItems.length ? true : false;
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
            var selectedItems = cloneDeep(x);
            var prItemIds = [];
            var spliceThis = [];
            selectedItems.forEach((item) => {
                prItemIds.push(item.id);
                var prIndex = this.availableTable.findIndex(
                    (y) => y.id == item.prId
                );
                var prItemIndex = this.availableTable[
                    prIndex
                ].prItems.findIndex((z) => z.id == item.id);
                spliceThis.push({ prIndex: prIndex, prItemIndex: prItemIndex });
            });
            let data = {
                cycle: this.$store.state.data.cycle,
                prItemIds: prItemIds,
            };
            this.$store
                .dispatch("rfqitem/CreateRfqItem", data)
                .then((res) => {
                    if (res.data.error) {
                        return this.showToast(res.data.errorMessage, "error");
                    }
                    this.loopCart(res.data);
                    this.cartItems = res.data;
                    this.rfq.id = res.data[0].rfq.id;
                    this.cartCount = res.data.length;
                    spliceThis
                        .sort((a, b) => b.prItemIndex - a.prItemIndex)
                        .forEach((item) => {
                            this.availableTable[item.prIndex].prItems.splice(
                                item.prItemIndex,
                                1
                            );
                            if (
                                this.availableTable[item.prIndex].prItems
                                    .length == 0
                            ) {
                                this.availableTable.splice(item.prIndex, 1);
                            }
                        });
                    this.getAllMyRFQ(this.$store.state.data.cycle);
                    this.showToast("Successfully added to cart!", "success");
                })
                .catch((err) => {
                    this.showToast(
                        "Something went wrong - creating RFQ",
                        "error"
                    );
                });
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
                return pv + parseFloat(cv.prItem.total);
            }, 0);
        },
        totalUpdateAmt() {
            return this.updateItems.reduce((pv, cv) => {
                return pv + parseFloat(cv.total);
            }, 0);
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
                        .dispatch("rfqitem/DeleteRfqItem", x.id)
                        .then((res) => {
                            if (res.data.error) {
                                return this.showToast(
                                    res.data.errorMessage,
                                    "warning"
                                );
                            }
                            this.cartItems.splice(index, 1);
                            this.cartCount--;
                            var prIndex = this.availableTable.findIndex(
                                (item) => item.id == x.prItem.prId
                            );
                            if (prIndex > -1) {
                                this.availableTable[prIndex].prItems.push({
                                    ...x.prItem,
                                    submitError: false,
                                    toggleSelected: false,
                                });
                            } else {
                                delete x.prItem.pr.prItems;
                                var prItems = cloneDeep(x);
                                delete prItems.prItem.pr;
                                var object = {
                                    ...x.prItem.pr,
                                    prItems: [
                                        {
                                            ...prItems.prItem,
                                            submitError: false,
                                            toggleSelected: false,
                                        },
                                    ],
                                    checkAllWork: false,
                                };
                                this.availableTable.push(object);
                            }
                            this.showToast("Successfully deleted!", "success");
                        })
                        .catch((err) => {
                            this.showToast(
                                "Something went wrong - deleting RFQ",
                                "error"
                            );
                        });
                }
            });
        },
        openPopOver(x) {
            x.editQty = true;
            this.cartVariables = cloneDeep(x);
        },
        hidePopOver(x) {
            x.editQty = false;
        },
        onShownPopOver(x) {
            this.focusRef(this.$refs[`po-${x.id}`][0]);
        },
        onShownRFQItems(x) {
            this.focusRef(this.$refs[`rfq-${x.id}`][0]);
        },
        focusRef(ref) {
            this.$nextTick(() => {
                this.$nextTick(() => {
                    (ref.$el || ref).focus();
                });
            });
        },
        onResetRFQ() {
            this.rfq = {
                id: 0,
                description: "",
                tracking: "",
                resolutionNumber: "",
                modeOfProcurement: "",
                deliveryPeriod: "",
                deadline: "",
                supplierIds: [],
                cycle: this.$store.state.data.cycle,
            };
            this.selectedSupplier = [];
        },
        checkOut() {
            this.submitted = true;
            this.$v.rfq.$touch();
            if (this.$v.rfq.$invalid) {
                return;
            }
            this.$v.selectedSupplier.$touch();
            if (this.$v.selectedSupplier.$invalid) {
                return;
            }
            if (this.cartItems.length == 0) {
                return this.showToast("Please add items to cart!", "warning");
            }
            var data = cloneDeep(this.rfq);
            data.supplierIds = [];
            this.selectedSupplier.forEach((item) => {
                data.supplierIds.push(item.id);
            });
            data.deliveryPeriod = this.getExactAmt(this.rfq.deliveryPeriod);
            data.deadline = this.getDate(this.rfq.deadline);
            Swal.fire({
                title: "Are you sure?",
                text: "You want to submit this?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#34c38f",
                cancelButtonColor: "#f46a6a",
                confirmButtonText: "Yes, post it!",
            }).then((result) => {
                if (result.value) {
                    this.$store
                        .dispatch("rfq/SubmitRfq", data)
                        .then((res) => {
                            if (res.data.error) {
                                return this.showToast(
                                    res.data.errorMessage,
                                    "warning"
                                );
                            }
                            this.cartItems = [];
                            this.cartCount = 0;
                            this.onResetRFQ();
                            this.getSubmittedRFQ(this.$store.state.data.cycle);
                            this.tabIndex = 2;
                            this.showToast("Successfully posted!", "success");
                            this.submitted = false;
                        })
                        .catch((err) => {
                            this.submitted = false;
                            this.showToast(
                                "Something went wrong - submitting RFQ",
                                "error"
                            );
                        });
                }
            });
        },
        postRFQ(row) {
            var index = this.submittedRFQ.findIndex((x) => x.id == row.id);
            Swal.fire({
                title: "Are you sure?",
                text: "You want to post this?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#34c38f",
                cancelButtonColor: "#f46a6a",
                confirmButtonText: "Yes, post it!",
            }).then(async (result) => {
                if (result.value) {
                    row.errorPost = false;
                    const wait = (delay, ...args) =>
                        new Promise((resolve) =>
                            setTimeout(resolve, delay, ...args)
                        );
                    row.isPosting = true;
                    let winner = [];
                    if (!row.itemLoaded) {
                        this.pageLoader(true);
                        row.postingMessage = "Getting Supplier offers...";
                        await wait(1000);
                        await this.getRfqSupplier(row);
                        this.pageLoader(false);
                    }
                    this.pageLoader(true);
                    row.postingMessage = "Determining the winner/s...";
                    await wait(3000);
                    for await (const item of row.rfqSuppliers) {
                        item.rfqSupplierOffers = [];
                        item.isWinner = false;
                        for await (const x of item.supplierRFQ) {
                            if (x.offer.isWinner) {
                                let win = winner.find(
                                    (y) => y.itemId == x.offer.rfqItemId
                                );
                                if (!win) {
                                    winner.push({
                                        itemId: x.offer.rfqItemId,
                                        winCount: 1,
                                    });
                                } else {
                                    win.winCount++;
                                    winner.splice(winner.indexOf(win), 1, win);
                                }
                                item.isWinner = true;
                            }
                            if (x.offer.id > 0) {
                                item.rfqSupplierOffers.push(x.offer);
                            }
                        }
                    }
                    if (winner.length == 0) {
                        row.postingMessage =
                            "No winner yet. Please check and try posting again";
                        row.errorPost = true;
                        this.pageLoader(false);
                        await wait(5000);
                        row.isPosting = false;
                        return;
                    }
                    let anomaly = false;
                    winner.forEach((item) => {
                        if (item.winCount > 1) {
                            anomaly = true;
                        }
                    });
                    if (anomaly) {
                        row.postingMessage = `There's an anomaly in the winner/s. Please check and try posting again.`;
                        row.errorPost = true;
                        this.pageLoader(false);
                        await wait(5000);
                        row.isPosting = false;
                        return;
                    }
                    if (winner.length > row.rfqItems.length) {
                        row.postingMessage = `There's an anomaly in the winner/s. Please check and try posting again.`;
                        row.errorPost = true;
                        this.pageLoader(false);
                        await wait(5000);
                        row.isPosting = false;
                        return;
                    }
                    row.postingMessage = "Posting the RFQ...";
                    this.$store
                        .dispatch("rfq/PostRfq", row.id)
                        .then((res) => {
                            if (res.data.error) {
                                return this.showToast(
                                    res.data.errorMessage,
                                    "error"
                                );
                            }
                            row.errorPost = false;
                            row.isPosting = false;
                            this.submittedRFQ.splice(index, 1);
                            this.posted.push(row);
                            this.showToast("Successfully posted!", "success");
                        })
                        .catch((err) => {
                            this.showToast("RFQ Item went wrong!", "error");
                        });
                }
            });
        },
        returnRFQ(row) {
            this.form.id = row.id;
            this.form.remarks = "";
            this.$bvModal.show("return-modal");
        },
        async getRfqSupplier(x) {
            x.supplierShow = !x.supplierShow;
            if (x.supplierShow && !x.itemLoaded) {
                x.itemLoading = true;
                await this.$store
                    .dispatch("rfqsupplier/GetSingleRfqSupplierByRFQ", x.id)
                    .then((res) => {
                        x.itemLoading = false;
                        if (res.data.error) {
                            return this.showToast(
                                res.data.errorMessage,
                                "error"
                            );
                        }
                        res.data.forEach((z) => {
                            var rfqItems = cloneDeep(x.rfqItems);
                            rfqItems.forEach((w) => {
                                let offer = z.rfqSupplierOffers.find(
                                    (a) => a.rfqItemId == w.id
                                );
                                if (offer) {
                                    offer.unit =
                                        this.units.find(
                                            (a) => a.id == offer.unitId
                                        ) || {};
                                    offer.totalAmt =
                                        parseFloat(offer.unitCost) *
                                        parseFloat(offer.quantity);
                                    offer.showMoreSpec = false;
                                    rfqItems[rfqItems.indexOf(w)].offer = offer;
                                }
                            });
                            z.supplierRFQ = rfqItems;
                            z.visible = false;
                        });
                        x.itemLoaded = true;
                        x.rfqSuppliers = res.data;
                    })
                    .catch((err) => {
                        this.showToast("RFQ Item went wrong!", "error");
                    });
            }
        },
        getTotalPerPR(prItems) {
            return prItems.reduce((pv, cv) => {
                return pv + parseFloat(cv.prItem.total);
            }, 0);
        },
        autoGrow(element, size) {
            element.target.style.height = `${size}px`;
            element.target.style.height = `${element.target.scrollHeight}px`;
        },
        getTotalByRow(z) {
            let qty = z.quantity ? this.getExactAmt(z.quantity) : 0;
            let unitCost = z.unitCost ? this.getExactAmt(z.unitCost) : 0;
            return parseFloat(qty) * parseFloat(unitCost);
        },
        updateOffer(data, index, id) {
            data.forEach((item) => {
                item.offer.rfqSupplierId = id;
                item.offer.quantity = "" + item.offer.quantity + "";
                item.offer.unitCost = "" + item.offer.unitCost + "";
            });
            this.offers = cloneDeep(data);
            this.selectedSupplierIndex = cloneDeep(index);
            this.modalTitle = "Update Offer";
            this.$bvModal.show("offer-modal");
        },
        async saveOffers() {
            var count = 0;
            var data = [];
            this.offers.forEach((item) => {
                if (
                    !item.offer.itemName ||
                    !item.offer.description ||
                    !parseFloat(item.offer.quantity) ||
                    !parseFloat(item.offer.unitCost)
                ) {
                    count++;
                } else {
                    item.offer.unitId = item.offer.unit.id;
                    item.offer.index = this.offers.indexOf(item);
                    item.offer.totalAmt =
                        parseFloat(item.offer.quantity) *
                        parseFloat(item.offer.unitCost);
                    data.push(item.offer);
                }
            });
            if (count == this.offers.length) {
                return this.showToast("Cannot save empty offer", "warning");
            }
            if (count > 0) {
                Swal.fire({
                    title: `${count} item were not filled`,
                    text: "Are you sure you want to proceed?",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#34c38f",
                    cancelButtonColor: "#5c636a",
                    confirmButtonText: "Yes, proceed!",
                }).then((result) => {
                    if (result.value) {
                        this.saveOfferMethod(data);
                    }
                });
            } else {
                this.saveOfferMethod(data);
            }
        },
        async saveOfferMethod(data) {
            let done = 0;
            for (const offer of data) {
                if (offer.id > 0) {
                    await this.$store
                        .dispatch("rfqsupplieroffer/UpdateRSO", offer)
                        .then((res) => {
                            this.offers[offer.index].offer = offer;
                            done++;
                        })
                        .catch((err) => {
                            this.showToast("RFQ Item went wrong!", "error");
                        });
                } else {
                    await this.$store
                        .dispatch("rfqsupplieroffer/CreateRSO", offer)
                        .then((res) => {
                            offer.id = res.data.id;
                            this.offers[offer.index].offer = offer;
                            done++;
                        })
                        .catch((err) => {
                            this.showToast("RFQ Item went wrong!", "error");
                        });
                }
            }
            if (done == data.length) {
                this.showToast("Successfully saved!", "success");
                var rfqIndex = this.submittedRFQ.findIndex(
                    (x) => x.id == this.offers[0].rfqId
                );
                this.submittedRFQ[rfqIndex].rfqSuppliers[
                    this.selectedSupplierIndex
                ].supplierRFQ = this.offers;
                this.offers = [];
                this.selectedSupplierIndex = -1;
                this.$bvModal.hide("offer-modal");
            }
        },
        getTotalOffer(data, type = "submitted") {
            if (type === "submitted") {
                return data.reduce((pv, cv) => {
                    return pv + parseFloat(cv.offer.totalAmt);
                }, 0);
            } else {
                return data.reduce((pv, cv) => {
                    return pv + parseFloat(cv.totalAmt);
                }, 0);
            }
        },
        removeOffer(offer) {
            Swal.fire({
                title: "Are you sure?",
                text: "You won't be able to revert this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#dc3545",
                cancelButtonColor: "#5c636a",
                confirmButtonText: "Yes, remove it!",
            }).then((result) => {
                if (result.value) {
                    this.$store
                        .dispatch("rfqsupplieroffer/DeleteRSO", offer.id)
                        .then((res) => {
                            if (res.data.error) {
                                return this.showToast(res.data.error, "error");
                            }
                            offer.id = 0;
                            offer.rfqSupplierId = 0;
                            offer.unitCost = "0";
                            offer.quantity = "0";
                            offer.note = "";
                            offer.isWinner = false;
                            offer.totalAmt = 0;
                            this.showToast("Successfully deleted", "success");
                        })
                        .catch((err) => {
                            this.showToast("Cannot be deleted!", "error");
                        });
                }
            });
        },
        returnRFQSubmit() {
            this.submitted = true;
            this.$v.form.$touch();
            if (this.$v.form.$invalid) {
                return;
            }
            this.$store
                .dispatch("rfq/ReturnRfq", this.form)
                .then((res) => {
                    if (res.data.error) {
                        return this.showToast(res.data.errorMessage, "error");
                    }
                    var index = this.posted.findIndex(
                        (x) => x.id == this.form.id
                    );
                    let rfq = cloneDeep(this.posted[index]);
                    rfq.status = "SUBMITTED";
                    rfq.rfqSuppliers.forEach((z) => {
                        var rfqItems = cloneDeep(rfq.rfqItems);
                        rfqItems.forEach((w) => {
                            let offer = z.rfqSupplierOffers.find(
                                (a) => a.rfqItemId == w.id
                            );
                            if (offer) {
                                offer.unit =
                                    this.units.find(
                                        (a) => a.id == offer.unitId
                                    ) || {};
                                offer.totalAmt =
                                    parseFloat(offer.unitCost) *
                                    parseFloat(offer.quantity);
                                rfqItems[rfqItems.indexOf(w)].offer = offer;
                            }
                        });
                        z.supplierRFQ = rfqItems;
                        z.visible = false;
                    });
                    this.submittedRFQ.push(rfq);
                    this.posted.splice(index, 1);
                    this.showToast("Successfully returned", "success");
                    this.$bvModal.hide("return-modal");
                })
                .catch((err) => {
                    this.showToast("Something went wrong!", "error");
                });
        },
        addSup(id) {
            var index = this.submittedRFQ.findIndex((x) => x.id == id);
            var data = {
                rfqId: id,
                supplierId: this.addSupplier.id,
            };
            this.$store
                .dispatch("rfqsupplier/CreateRfqSupplier", data)
                .then((res) => {
                    if (res.data.error) {
                        return this.showToast(res.data.errorMessage, "error");
                    }
                    res.data.supplier = cloneDeep(this.addSupplier);
                    res.data.supplierRFQ = this.submittedRFQ[index].rfqItems;
                    res.data.rfqSupplierOffers = [];
                    res.data.visible = false;
                    this.submittedRFQ[index].rfqSuppliers.push(res.data);
                    this.submittedRFQ[index].addSupplier = false;
                    this.addSupplier = {};
                    this.submittedRFQ[
                        index
                    ].supplierMessage = `Successfully saved!`;
                    this.submittedRFQ[index].supplierMsgType = "success";
                    setTimeout(() => {
                        this.submittedRFQ[index].supplierMessage = "";
                    }, 5000);
                })
                .catch((err) => {
                    this.submittedRFQ[
                        index
                    ].supplierMessage = `Error adding supplier!`;
                    this.submittedRFQ[index].supplierMsgType = "danger";
                    setTimeout(() => {
                        this.submittedRFQ[index].supplierMessage = "";
                    }, 5000);
                });
        },
        removeSup(xId, yId) {
            Swal.fire({
                title: "Are you sure?",
                text: "You won't be able to revert this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#dc3545",
                cancelButtonColor: "#5c636a",
                confirmButtonText: "Yes, remove it!",
            }).then((result) => {
                if (result.value) {
                    var xIndex = this.submittedRFQ.findIndex(
                        (x) => x.id == xId
                    );
                    var yIndex = this.submittedRFQ[
                        xIndex
                    ].rfqSuppliers.findIndex((x) => x.id == yId);
                    this.$store
                        .dispatch("rfqsupplier/DeleteRfqSupplier", yId)
                        .then((res) => {
                            if (res.data.error) {
                                return this.showToast(
                                    res.data.errorMessage,
                                    "error"
                                );
                            }
                            this.submittedRFQ[xIndex].rfqSuppliers.splice(
                                yIndex,
                                1
                            );
                            this.showToast("Successfully deleted", "success");
                        })
                        .catch((err) => {
                            this.showToast("Cannot be deleted", "error");
                        });
                }
            });
        },
        clearSelection() {
            this.availableTable.forEach((item) => {
                item.prItems.forEach((x) => {
                    x.toggleSelected = false;
                });
            });
        },
        async addMoreItems(row) {
            if (!row.itemLoaded) {
                this.pageLoader(true);
                await this.getRfqSupplier(row);
                this.pageLoader(false);
            }
            this.addItem = true;
            this.selectedRFQ = cloneDeep(row);
            this.selectedItems = [];
            this.tabIndex = 0;
        },
        cancelItems() {
            this.addItem = false;
            this.selectedRFQ = {};
            this.clearSelection();
            setTimeout(() => {
                this.tabIndex = 2;
            }, 50);
        },
        async addToRFQ() {
            var spliceThis = [];
            var done = 0;
            var xIndex = this.submittedRFQ.findIndex(
                (x) => x.id == this.selectedRFQ.id
            );
            for (const item of this.selectedAvailableItems) {
                var prIndex = this.availableTable.findIndex(
                    (y) => y.id == item.prId
                );
                var prItemIndex = this.availableTable[
                    prIndex
                ].prItems.findIndex((z) => z.id == item.id);
                spliceThis.push({ prIndex: prIndex, prItemIndex: prItemIndex });
                var data = {
                    rfqId: this.selectedRFQ.id,
                    prItemId: item.id,
                };
                await this.$store
                    .dispatch("rfqitem/CreateSingleRfqItem", data)
                    .then((res) => {
                        if (res.data.error) {
                            return this.showToast(
                                res.data.errorMessage,
                                "error"
                            );
                        }
                        var unit = this.units.find(
                            (y) => y.id == res.data.prItem.apiResource.unitId
                        );
                        res.data.offer = {
                            id: 0,
                            rfqSupplierId: 0,
                            rfqItemId: res.data.id,
                            itemName: res.data.prItem.apiResource.itemName,
                            description:
                                res.data.prItem.apiResource.description,
                            unitId: "",
                            unit: unit ? unit : {},
                            unitCost: "0",
                            quantity: "0",
                            note: "",
                            isWinner: false,
                            totalAmt: 0,
                        };
                        res.data.prItem.apiResource.unit = unit ? unit : {};
                        this.submittedRFQ[xIndex].rfqItems.push(res.data);
                        this.submittedRFQ[xIndex].rfqSuppliers.forEach((z) => {
                            var rfqItems = cloneDeep(
                                this.submittedRFQ[xIndex].rfqItems
                            );
                            rfqItems.forEach((w) => {
                                let offer = z.rfqSupplierOffers.find(
                                    (a) => a.rfqItemId == w.id
                                );
                                if (offer) {
                                    offer.unit =
                                        this.units.find(
                                            (a) => a.id == offer.unitId
                                        ) || {};
                                    offer.totalAmt =
                                        parseFloat(offer.unitCost) *
                                        parseFloat(offer.quantity);
                                    rfqItems[rfqItems.indexOf(w)].offer = offer;
                                }
                            });
                            z.supplierRFQ = rfqItems;
                            z.visible = false;
                        });
                        done++;
                    })
                    .catch((err) => {
                        this.showToast("Something went wrong!", "error");
                    });
            }
            if (done == this.selectedAvailableItems.length) {
                spliceThis
                    .sort((a, b) => b.prItemIndex - a.prItemIndex)
                    .forEach((item) => {
                        this.availableTable[item.prIndex].prItems.splice(
                            item.prItemIndex,
                            1
                        );
                        if (
                            this.availableTable[item.prIndex].prItems.length ==
                            0
                        ) {
                            this.availableTable.splice(item.prIndex, 1);
                        }
                    });
                this.cancelItems();
                this.submittedRFQ[xIndex].itemMessage = "Successfully added!";
                this.submittedRFQ[xIndex].itemMsgType = "success";
                setTimeout(() => {
                    this.submittedRFQ[xIndex].itemMessage = "";
                }, 5000);
            } else {
                this.cancelItems();
                this.submittedRFQ[xIndex].itemMessage = "Something went wrong!";
                this.submittedRFQ[xIndex].itemMsgType = "danger";
                setTimeout(() => {
                    this.submittedRFQ[xIndex].itemMessage = "";
                }, 5000);
            }
        },
        async removeItem(row) {
            var xIndex = this.submittedRFQ.findIndex((x) => x.id == row.rfqId);
            var yIndex = this.submittedRFQ[xIndex].rfqItems.findIndex(
                (x) => x.id == row.id
            );
            if (row.prItem.pr == null) {
                this.pageLoader(true);
                await this.$store
                    .dispatch("pr/GetSinglePr", row.prItem.prId)
                    .then((res) => {
                        if (res.data.error) {
                            this.submittedRFQ[xIndex].itemMsgType = "danger";
                            this.submittedRFQ[xIndex].itemMessage =
                                res.data.errorMessage;
                            return;
                        }
                        row.prItem.pr = res.data;
                    })
                    .catch((err) => {
                        this.submittedRFQ[xIndex].itemMsgType = "danger";
                        this.submittedRFQ[xIndex].itemMessage = "PR Went Wrong";
                    });
                this.pageLoader(false);
            }
            Swal.fire({
                title: "Are you sure?",
                text: "You won't be able to revert this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#dc3545",
                cancelButtonColor: "#5c636a",
                confirmButtonText: "Yes, remove it!",
            }).then((result) => {
                if (result.value) {
                    this.$store
                        .dispatch("rfqitem/DeleteRfqItem", row.id)
                        .then((res) => {
                            if (res.data.error) {
                                return this.showToast(
                                    res.data.errorMessage,
                                    "error"
                                );
                            }
                            this.submittedRFQ[xIndex].rfqItems.splice(
                                yIndex,
                                1
                            );
                            var prIndex = this.availableTable.findIndex(
                                (item) => item.id == row.prItem.prId
                            );
                            if (prIndex > -1) {
                                this.availableTable[prIndex].prItems.push({
                                    ...row.prItem,
                                    submitError: false,
                                    toggleSelected: false,
                                });
                            } else {
                                delete row.prItem.pr.prItems;
                                var prItems = cloneDeep(row);
                                delete prItems.prItem.pr;
                                var object = {
                                    ...row.prItem.pr,
                                    prItems: [
                                        {
                                            ...prItems.prItem,
                                            submitError: false,
                                            toggleSelected: false,
                                        },
                                    ],
                                    checkAllWork: false,
                                };
                                this.availableTable.push(object);
                            }
                            this.submittedRFQ[
                                xIndex
                            ].itemMessage = `Successfully removed!`;
                            this.submittedRFQ[xIndex].itemMsgType = "success";
                            setTimeout(() => {
                                this.submittedRFQ[xIndex].itemMessage = "";
                            }, 5000);
                        })
                        .catch((err) => {
                            this.submittedRFQ[
                                xIndex
                            ].itemMessage = `Item has offers. Cannot be deleted!`;
                            this.submittedRFQ[xIndex].itemMsgType = "danger";
                            setTimeout(() => {
                                this.submittedRFQ[xIndex].itemMessage = "";
                            }, 5000);
                        });
                }
            });
        },
        printRFQ(id) {
            this.$refs.printOpt.putOptions({
                apiUrl: "procurement/Rfq/Print",
                routeVariables: [id],
            });
            this.$bvModal.show("print-options-modal");
        },
        printNOA(id) {
            this.$refs.printOpt.putOptions({
                apiUrl: "procurement/Rfq/Print/NOA",
                routeVariables: [id],
            });
            this.$bvModal.show("print-options-modal");
        },
        printAbstract(id) {
            this.$refs.printOpt.putOptions({
                apiUrl: "procurement/Rfq/Print/Abstract",
                routeVariables: [id],
            });
            this.$bvModal.show("print-options-modal");
        },
        openPO(item) {
            console.log(item)
            item.generatePO = true;
            this.po = {
                description: "",
                cycle: this.$store.state.data.cycle,
                rfqSupplierId: 0,
                poDateReceived: new Date(),
            };
        },
        async generatePO(item) {
            for (const x of item.rfqSuppliers) {
                if (x.isWinner) {
                    var data = {
                        ...this.po,
                        rfqSupplierId: x.id,
                    };
                    await this.$store
                        .dispatch("po/CreatePo", data)
                        .then((res) => {
                            this.showToast(
                                "Successfully generated P.O - " +
                                    x.supplier.name,
                                "success"
                            );
                        })
                        .catch((err) => {
                            this.showToast(
                                x.supplier.name -
                                    +"P.O Generation unsuccessful",
                                "error"
                            );
                        });
                }
            }
            item.generatePO = false;
        },
        getSuppliers(){
            if(this.cartItems.length == 0){
                return this.showToast('No items in cart', 'warning');
            }
            this.$refs.supplier.onModalOpen({supplierSelected: this.selectedSupplier});
            this.$refs.supplier.getData(this.rfq.id);
            this.$bvModal.show('rfq-supplier-modal');
        },
        dropSuppliers(data){
            this.selectedSupplier = cloneDeep(data);
        },
        removeSupplier(idx){
            this.selectedSupplier.splice(idx, 1)
        },
        async addMoreSupplier(row){
            let ssup = [];
            this.suppliers = [];
            row.rfqSuppliers.forEach(item => {
                ssup.push(item.supplier);
            })
            this.$refs.supplier.onModalOpen({supplierSelected: ssup});
            await this.$refs.supplier.getData(row.id);
            let suppliers = this.$refs.supplier.getSuppliers();
            suppliers.forEach(item => {
                !item.selectedSup && this.suppliers.push(item);
            })
            row.addSupplier = true;
        }
    },
};
</script>
<template>
    <Layout @changeCycle="changeCycle">
        <PageHeader :title="title" :items="items" />
        <b-modal
            id="offer-modal"
            :title="modalTitle"
            size="xl"
            title-class="font-18"
            hide-footer
            no-close-on-backdrop
        >
            <table class="table table-bordered">
                <thead>
                    <tr>
                        <th>
                            Item Name
                            <div>
                                <small>Item Description</small>
                            </div>
                        </th>
                        <th style="width: 120px">Unit</th>
                        <th style="width: 90px">Qty</th>
                        <th style="width: 150px">Unit Cost</th>
                        <th style="width: 150px">Total</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="offer in offers">
                        <tr :key="offer.id">
                            <td class="position-relative">
                                <div class="rotate-270">
                                    <span class="badge bg-purple"
                                        >RFQ Item</span
                                    >
                                </div>
                                {{ offer.prItem.apiResource.itemName }}
                                <div>
                                    <small>
                                        {{
                                            offer.prItem.apiResource.description
                                        }}
                                    </small>
                                </div>
                            </td>
                            <td>
                                {{ offer.prItem.apiResource.unit.unitName }}
                            </td>
                            <td>
                                {{ offer.prItem.totalQuantity }}
                            </td>
                            <td>
                                {{
                                    Intl.NumberFormat("ja-JP", {
                                        currency: "PHP",
                                        style: "currency",
                                    }).format(offer.prItem.unitCost)
                                }}
                            </td>
                            <td>
                                {{
                                    Intl.NumberFormat("ja-JP", {
                                        currency: "PHP",
                                        style: "currency",
                                    }).format(offer.prItem.total)
                                }}
                            </td>
                        </tr>
                        <tr
                            :key="`offer${offer.id}`"
                            class="custom-border-2"
                            :class="{ 'border-success': offer.offer.isWinner }"
                        >
                            <td class="position-relative">
                                <div class="rotate-270">
                                    <span class="badge bg-secondary"
                                        >Item Offer</span
                                    >
                                </div>
                                <div
                                    class="position-absolute bg-dark px-1"
                                    style="right: 0; top: -10px"
                                >
                                    <div class="d-flex">
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
                                                :id="`customCheckcolor${offer.id}`"
                                                class="form-check-input"
                                                v-model="offer.offer.isWinner"
                                            />
                                            <label
                                                :for="`customCheckcolor${offer.id}`"
                                                class="form-check-label no-wrap"
                                            >
                                                Mark as Winner
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Item Name"
                                        class="w-100 custom-inline-form"
                                        v-model="offer.offer.itemName"
                                    />
                                    <textarea
                                        type="text"
                                        placeholder="Item Description"
                                        class="w-100 custom-inline-form short"
                                        @input="autoGrow($event, 15)"
                                        v-model="offer.offer.description"
                                    ></textarea>
                                    <textarea
                                        type="text"
                                        placeholder="Note Here:"
                                        class="
                                            w-100
                                            custom-inline-form
                                            text-warning
                                        "
                                        @input="autoGrow($event, 15)"
                                        v-model="offer.offer.note"
                                    ></textarea>
                                    <a
                                        href="javascript:void(0);"
                                        :id="`moreSpec${offer.id}`"
                                        ><i
                                            class="
                                                mdi mdi-triangle
                                                rotate rotate-90
                                                me-1
                                            "
                                        ></i
                                        >Add More Specifications</a
                                    >
                                    <b-popover
                                        :target="`moreSpec${offer.id}`"
                                        triggers="click"
                                        placement="right"
                                        :show.sync="offer.offer.showMoreSpec"
                                        custom-class="popover-supplier"
                                    >
                                        <template v-slot:title>
                                            <div
                                                class="
                                                    d-flex
                                                    align-items-center
                                                    justify-content-between
                                                "
                                            >
                                                <small
                                                    >More Specifications</small
                                                >
                                                <span
                                                    class="
                                                        bx bx-x
                                                        font-size-14
                                                        cursor-pointer
                                                    "
                                                    @click="
                                                        offer.offer.showMoreSpec = false
                                                    "
                                                ></span>
                                            </div>
                                        </template>
                                        <div class="row mb-2">
                                            <div class="col-md-6">
                                                <label for="" class="mb-0"
                                                    >Brand</label
                                                >
                                                <input
                                                    type="text"
                                                    placeholder="Enter Brand"
                                                    class="
                                                        form-control
                                                        form-control-sm
                                                    "
                                                    v-model="offer.offer.brand"
                                                />
                                            </div>
                                            <div class="col-md-6">
                                                <label for="" class="mb-0"
                                                    >Model</label
                                                >
                                                <input
                                                    type="text"
                                                    placeholder="Enter Model"
                                                    class="
                                                        form-control
                                                        form-control-sm
                                                    "
                                                    v-model="offer.offer.model"
                                                />
                                            </div>
                                        </div>
                                        <div class="row mb-2">
                                            <div class="col-md-6">
                                                <label for="" class="mb-0"
                                                    >Color</label
                                                >
                                                <input
                                                    type="text"
                                                    placeholder="Enter Color"
                                                    class="
                                                        form-control
                                                        form-control-sm
                                                    "
                                                    v-model="offer.offer.color"
                                                />
                                            </div>
                                            <div class="col-md-6">
                                                <label for="" class="mb-0"
                                                    >Condition</label
                                                >
                                                <input
                                                    type="text"
                                                    placeholder="Enter Condition"
                                                    class="
                                                        form-control
                                                        form-control-sm
                                                    "
                                                    v-model="
                                                        offer.offer.condition
                                                    "
                                                />
                                            </div>
                                        </div>
                                        <div class="row mb-2">
                                            <div class="col-md-6">
                                                <label for="" class="mb-0"
                                                    >Material Used</label
                                                >
                                                <input
                                                    type="text"
                                                    placeholder="Enter Material Used"
                                                    class="
                                                        form-control
                                                        form-control-sm
                                                    "
                                                    v-model="
                                                        offer.offer.materialUsed
                                                    "
                                                />
                                            </div>
                                            <div class="col-md-6">
                                                <label for="" class="mb-0"
                                                    >Package Description</label
                                                >
                                                <input
                                                    type="text"
                                                    placeholder="Enter Package Description"
                                                    class="
                                                        form-control
                                                        form-control-sm
                                                    "
                                                    v-model="
                                                        offer.offer
                                                            .packageDescription
                                                    "
                                                />
                                            </div>
                                        </div>
                                        <div class="mb-2">
                                            <label for="" class="mb-0"
                                                >Dimension Description</label
                                            >
                                            <textarea
                                                rows="2"
                                                placeholder="Enter Dimension Description"
                                                class="
                                                    form-control form-control-sm
                                                "
                                                v-model="
                                                    offer.offer
                                                        .dimensionDescription
                                                "
                                            ></textarea>
                                        </div>
                                        <div class="mb-2">
                                            <label for="" class="mb-0"
                                                >Other Specifications</label
                                            >
                                            <textarea
                                                rows="2"
                                                placeholder="Enter Other Specifications"
                                                class="
                                                    form-control form-control-sm
                                                "
                                                v-model="
                                                    offer.offer.specification
                                                "
                                            ></textarea>
                                        </div>
                                        <hr />
                                        <div class="d-flex float-end mb-3">
                                            <button
                                                type="button"
                                                class="btn btn-primary me-1"
                                                @click="
                                                    offer.offer.showMoreSpec = false
                                                "
                                            >
                                                Save
                                            </button>
                                            <button
                                                type="button"
                                                class="btn btn-link"
                                                @click="
                                                    offer.offer.showMoreSpec = false
                                                "
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </b-popover>
                                </div>
                            </td>
                            <td>
                                <multiselect
                                    v-model="offer.offer.unit"
                                    :options="units"
                                    :searchable="true"
                                    :close-on-select="true"
                                    label="unitName"
                                    :show-labels="false"
                                    :allow-empty="false"
                                    placeholder="Pick a value"
                                    class="border-0"
                                ></multiselect>
                            </td>
                            <td>
                                <masked-input
                                    type="text"
                                    placeholder="Qty"
                                    class="w-100 form-control"
                                    :mask="currencyMask"
                                    v-model="offer.offer.quantity"
                                ></masked-input>
                            </td>
                            <td>
                                <masked-input
                                    placeholder="Unit Cost"
                                    class="w-100 form-control"
                                    :mask="currencyMask"
                                    v-model="offer.offer.unitCost"
                                ></masked-input>
                            </td>
                            <td>
                                {{
                                    Intl.NumberFormat("ja-JP", {
                                        currency: "PHP",
                                        style: "currency",
                                    }).format(getTotalByRow(offer.offer))
                                }}
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>
            <div class="modal-footer">
                <button
                    type="button"
                    class="btn btn-primary"
                    @click="saveOffers()"
                >
                    Save & Apply Changes
                </button>
                <button
                    type="button"
                    class="btn btn-link"
                    @click="$bvModal.hide('offer-modal')"
                >
                    Close
                </button>
            </div>
        </b-modal>
        <b-modal
            id="return-modal"
            title="Return Remarks"
            size="md"
            title-class="font-18"
            hide-footer
            no-close-on-backdrop
        >
            <form @submit.prevent="returnRFQSubmit" class="needs-validation">
                <b-row>
                    <b-col>
                        <div class="mb-3">
                            <label for="description">Remarks </label>
                            <textarea
                                id="description"
                                rows="3"
                                v-model="form.remarks"
                                placeholder="Enter Remarks..."
                                class="form-control"
                                :class="{
                                    'is-invalid':
                                        submitted && $v.form.remarks.$error,
                                }"
                            ></textarea>
                            <div
                                v-if="submitted && $v.form.remarks.$error"
                                class="invalid-feedback"
                            >
                                <span v-if="!$v.form.remarks.required"
                                    >This value is required.</span
                                >
                            </div>
                        </div>
                    </b-col>
                </b-row>
                <div class="modal-footer">
                    <button type="submit" class="btn btn-primary">
                        Return RFQ
                    </button>
                    <button
                        type="button"
                        class="btn btn-link"
                        @click="$bvModal.hide('return-modal')"
                    >
                        Close
                    </button>
                </div>
            </form>
        </b-modal>
        <b-tabs
            content-class="pt-3 pb-3 text-muted"
            v-model="tabIndex"
            nav-class="nav-tabs-custom"
        >
            <b-tab>
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
                                                                {{
                                                                    y.description
                                                                }}
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
                                                            {{ y.description }}
                                                        </h5>
                                                    </div>
                                                </td>
                                            </tr>
                                            <template v-for="x in y.prItems">
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
                                                                        x
                                                                            .apiResource
                                                                            .itemName
                                                                    }}
                                                                    ({{
                                                                        x
                                                                            .apiResource
                                                                            .description
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
                                                                >{{
                                                                    x
                                                                        .apiResource
                                                                        .itemName
                                                                }}
                                                                ({{
                                                                    x
                                                                        .apiResource
                                                                        .description
                                                                }})</span
                                                            >
                                                        </div>
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
            <b-tab :disabled="addItem">
                <template v-slot:title>
                    <span class="d-inline-block d-sm-none">
                        <i class="bx bx-home"></i>
                    </span>
                    <span
                        class="d-none d-sm-inline-block position-relative me-2"
                        >RFQ Cart
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
                                        <h5 class="mb-0">RFQ Cart</h5>
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
                                                                mb-0
                                                            "
                                                        >
                                                            <span
                                                                class="
                                                                    text-dark
                                                                "
                                                                >{{
                                                                    x.prItem
                                                                        .apiResource
                                                                        .itemName
                                                                }}</span
                                                            >
                                                        </h5>
                                                        <p class="mb-0">
                                                            <small>{{
                                                                x.prItem
                                                                    .apiResource
                                                                    .description
                                                            }}</small>
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
                                                            ).format(
                                                                x.prItem
                                                                    .unitCost
                                                            )
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
                                                                x.prItem
                                                                    .totalQuantity
                                                            }}</span
                                                        >
                                                        <b-popover
                                                            :show.sync="
                                                                x.editQty
                                                            "
                                                            :target="`editQ-${x.id}`"
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
                                                                <div
                                                                    class="
                                                                        d-flex
                                                                        align-items-center
                                                                        justify-content-between
                                                                    "
                                                                >
                                                                    <small
                                                                        >Quantity
                                                                    </small>
                                                                    <button
                                                                        type="button"
                                                                        class="
                                                                            bx
                                                                            bx-x
                                                                            font-size-14
                                                                            cursor-pointer
                                                                            border-0
                                                                            bg-clear
                                                                        "
                                                                        @click="
                                                                            hidePopOver(
                                                                                x
                                                                            )
                                                                        "
                                                                        :ref="`po-${x.id}`"
                                                                    ></button>
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
                                                                        <div>
                                                                            <input
                                                                                type="text"
                                                                                class="
                                                                                    form-control
                                                                                    form-control-sm
                                                                                "
                                                                                v-model="
                                                                                    cartVariables.JanValue
                                                                                "
                                                                                disabled
                                                                            />
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
                                                                        <div>
                                                                            <input
                                                                                type="text"
                                                                                class="
                                                                                    form-control
                                                                                    form-control-sm
                                                                                "
                                                                                v-model="
                                                                                    cartVariables.FebValue
                                                                                "
                                                                                disabled
                                                                            />
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
                                                                        <div>
                                                                            <input
                                                                                type="text"
                                                                                class="
                                                                                    form-control
                                                                                    form-control-sm
                                                                                "
                                                                                v-model="
                                                                                    cartVariables.MarValue
                                                                                "
                                                                                disabled
                                                                            />
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
                                                                        <div>
                                                                            <input
                                                                                type="text"
                                                                                class="
                                                                                    form-control
                                                                                    form-control-sm
                                                                                "
                                                                                v-model="
                                                                                    cartVariables.AprValue
                                                                                "
                                                                                disabled
                                                                            />
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
                                                                        <div>
                                                                            <input
                                                                                type="text"
                                                                                class="
                                                                                    form-control
                                                                                    form-control-sm
                                                                                "
                                                                                v-model="
                                                                                    cartVariables.MayValue
                                                                                "
                                                                                disabled
                                                                            />
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
                                                                        <div>
                                                                            <input
                                                                                type="text"
                                                                                class="
                                                                                    form-control
                                                                                    form-control-sm
                                                                                "
                                                                                v-model="
                                                                                    cartVariables.JuneValue
                                                                                "
                                                                                disabled
                                                                            />
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
                                                                        <div>
                                                                            <input
                                                                                type="text"
                                                                                class="
                                                                                    form-control
                                                                                    form-control-sm
                                                                                "
                                                                                v-model="
                                                                                    cartVariables.JulyValue
                                                                                "
                                                                                disabled
                                                                            />
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
                                                                        <div>
                                                                            <input
                                                                                type="text"
                                                                                class="
                                                                                    form-control
                                                                                    form-control-sm
                                                                                "
                                                                                v-model="
                                                                                    cartVariables.AugValue
                                                                                "
                                                                                disabled
                                                                            />
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
                                                                        <div>
                                                                            <input
                                                                                type="text"
                                                                                class="
                                                                                    form-control
                                                                                    form-control-sm
                                                                                "
                                                                                v-model="
                                                                                    cartVariables.SepValue
                                                                                "
                                                                                disabled
                                                                            />
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
                                                                        <div>
                                                                            <input
                                                                                type="text"
                                                                                class="
                                                                                    form-control
                                                                                    form-control-sm
                                                                                "
                                                                                v-model="
                                                                                    cartVariables.OctValue
                                                                                "
                                                                                disabled
                                                                            />
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
                                                                        <div>
                                                                            <input
                                                                                type="text"
                                                                                class="
                                                                                    form-control
                                                                                    form-control-sm
                                                                                "
                                                                                v-model="
                                                                                    cartVariables.NovValue
                                                                                "
                                                                                disabled
                                                                            />
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
                                                                        <div>
                                                                            <input
                                                                                type="text"
                                                                                class="
                                                                                    form-control
                                                                                    form-control-sm
                                                                                "
                                                                                v-model="
                                                                                    cartVariables.DecValue
                                                                                "
                                                                                disabled
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
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
                                                            ).format(
                                                                x.prItem.total
                                                            )
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
                                                <tr>
                                                    <td
                                                        colspan="3"
                                                        class="text-right"
                                                    >
                                                        <h5 class="mb-0">
                                                            Grand Total:
                                                        </h5>
                                                    </td>
                                                    <td colspan="2">
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
                                    <div class="mb-3">
                                        <h5 class="card-title mb-4">
                                            RFQ Details
                                        </h5>
                                        <textarea
                                            rows="7"
                                            placeholder="RFQ Description"
                                            class="form-control"
                                            v-model="rfq.description"
                                            :class="{
                                                'is-invalid':
                                                    submitted &&
                                                    $v.rfq.description.$error,
                                            }"
                                        >
                                        </textarea>
                                        <div
                                            v-if="
                                                submitted &&
                                                $v.rfq.description.$error
                                            "
                                            class="invalid-feedback"
                                        >
                                            <span
                                                v-if="
                                                    !$v.rfq.description.required
                                                "
                                                >This value is required.</span
                                            >
                                        </div>
                                    </div>

                                    <b-row class="mb-3">
                                        <b-col>
                                            <label for="tracking"
                                                >Tracking Number
                                            </label>
                                            <input
                                                id="tracking"
                                                type="text"
                                                v-model="rfq.tracking"
                                                placeholder="Enter Tracking Number..."
                                                class="form-control"
                                                :class="{
                                                    'is-invalid':
                                                        submitted &&
                                                        $v.rfq.tracking.$error,
                                                }"
                                                autocomplete="off"
                                            />
                                            <div
                                                v-if="
                                                    submitted &&
                                                    $v.rfq.tracking.$error
                                                "
                                                class="invalid-feedback"
                                            >
                                                <span
                                                    v-if="
                                                        !$v.rfq.tracking
                                                            .required
                                                    "
                                                    >This value is
                                                    required.</span
                                                >
                                            </div>
                                        </b-col>
                                        <b-col>
                                            <label for="resolutionNumber"
                                                >Resolution Number
                                            </label>
                                            <input
                                                id="resolutionNumber"
                                                type="text"
                                                v-model="rfq.resolutionNumber"
                                                placeholder="Enter Resolution Number..."
                                                class="form-control"
                                                :class="{
                                                    'is-invalid':
                                                        submitted &&
                                                        $v.rfq.resolutionNumber
                                                            .$error,
                                                }"
                                                autocomplete="off"
                                            />
                                            <div
                                                v-if="
                                                    submitted &&
                                                    $v.rfq.resolutionNumber
                                                        .$error
                                                "
                                                class="invalid-feedback"
                                            >
                                                <span
                                                    v-if="
                                                        !$v.rfq.resolutionNumber
                                                            .required
                                                    "
                                                    >This value is
                                                    required.</span
                                                >
                                            </div>
                                        </b-col>
                                    </b-row>
                                    <div class="mb-3">
                                        <label for="modeOfProcurement"
                                            >Mode of Procurement
                                        </label>
                                        <b-form-select
                                            class="form-select"
                                            v-model="rfq.modeOfProcurement"
                                            size="sm"
                                            :options="mop"
                                            :class="{
                                                'is-invalid':
                                                    submitted &&
                                                    $v.rfq.modeOfProcurement
                                                        .$error,
                                            }"
                                        ></b-form-select>
                                        <div
                                            v-if="
                                                submitted &&
                                                $v.rfq.modeOfProcurement.$error
                                            "
                                            class="invalid-feedback"
                                        >
                                            <span
                                                v-if="
                                                    !$v.rfq.modeOfProcurement
                                                        .required
                                                "
                                                >This value is required.</span
                                            >
                                        </div>
                                    </div>
                                    <b-row class="mb-3">
                                        <b-col>
                                            <label for="deliveryPeriod"
                                                >Delivery Period
                                            </label>
                                            <masked-input
                                                id="deliveryPeriod"
                                                type="text"
                                                v-model="rfq.deliveryPeriod"
                                                placeholder="Enter Delivery Period..."
                                                class="form-control"
                                                :class="{
                                                    'is-invalid':
                                                        submitted &&
                                                        $v.rfq.deliveryPeriod
                                                            .$error,
                                                }"
                                                :mask="currencyMask"
                                                autocomplete="off"
                                            ></masked-input>
                                            <div
                                                v-if="
                                                    submitted &&
                                                    $v.rfq.deliveryPeriod.$error
                                                "
                                                class="invalid-feedback"
                                            >
                                                <span
                                                    v-if="
                                                        !$v.rfq.deliveryPeriod
                                                            .required
                                                    "
                                                    >This value is
                                                    required.</span
                                                >
                                            </div>
                                        </b-col>
                                        <b-col>
                                            <label for="deadline"
                                                >Price Validity
                                            </label>
                                            <date-picker
                                                v-model="rfq.deadline"
                                                :first-day-of-week="1"
                                                lang="en"
                                                placeholder="Enter Price Validity..."
                                                :class="{
                                                    'is-invalid':
                                                        submitted &&
                                                        $v.rfq.deadline.$error,
                                                }"
                                            ></date-picker>
                                            <div
                                                v-if="
                                                    submitted &&
                                                    $v.rfq.deadline.$error
                                                "
                                                class="invalid-feedback"
                                            >
                                                <span
                                                    v-if="
                                                        !$v.rfq.deadline
                                                            .required
                                                    "
                                                    >This value is
                                                    required.</span
                                                >
                                            </div>
                                        </b-col>
                                    </b-row>
                                    <div class="mb-3">
                                        <div
                                            class="
                                                d-flex
                                                align-items-center
                                                justify-content-between
                                                mb-2
                                            "
                                        >
                                            <label for="deadline" class="mb-0"
                                                >Supplier
                                            </label>
                                            <button
                                                type="button"
                                                class="
                                                    btn
                                                    btn-sm
                                                    btn-outline-success
                                                "
                                                @click="getSuppliers()"
                                            >
                                                <i class="bx bx-plus me-1"></i
                                                >Add Suppliers
                                            </button>
                                        </div>
                                        <div class="multiselect__tags" :class="{
                                                    'is-invalid':
                                                        submitted &&
                                                        $v.selectedSupplier.$error,
                                                }">
                                            <div
                                                class="multiselect__tags-wrap"
                                                
                                            >
                                                <span class="multiselect__tag" v-for="(supplier, index) in selectedSupplier" :key="supplier.id">
                                                    <span
                                                        >{{supplier.name}}</span
                                                    >
                                                    <i
                                                        class="
                                                            multiselect__tag-icon
                                                        "
                                                        @click="removeSupplier(index)"
                                                    ></i></span
                                                >
                                            </div>
                                        </div>
                                        <div
                                            v-if="
                                                submitted &&
                                                $v.selectedSupplier.$error
                                            "
                                            class="invalid-feedback"
                                        >
                                            <span
                                                v-if="
                                                    !$v.selectedSupplier
                                                        .required
                                                "
                                                >This value is required.</span
                                            >
                                        </div>
                                    </div>
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
                                        Submit RFQ
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </b-tab>
            <b-tab :disabled="addItem">
                <template v-slot:title>
                    <span class="d-inline-block d-sm-none">
                        <i class="bx bx-home"></i>
                    </span>
                    <span class="d-none d-sm-inline-block"
                        >Request for Quotation List</span
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
                                >Submitted (<template v-if="!submittedBusy">{{
                                    submittedRFQ.length
                                }}</template
                                ><template v-if="submittedBusy"
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
                                <div
                                    class="
                                        d-flex
                                        justify-content-between
                                        align-items-center
                                        mb-3
                                    "
                                >
                                    <div>
                                        <h4 class="card-title mb-0">
                                            Submitted Request for Quotation
                                        </h4>
                                        <p class="card-title-desc mb-0">
                                            List of submitted Request for
                                            Quotation
                                        </p>
                                    </div>
                                    <div v-if="filteredSubmittedRFQ.length > 0">
                                        <input
                                            autocomplete="off"
                                            id="name"
                                            type="text"
                                            v-model="filterSubmittedRFQ"
                                            placeholder="Search RFQ..."
                                            class="form-control"
                                        />
                                    </div>
                                </div>
                                <div
                                    v-if="submittedRFQ.length == 0"
                                    class="text-center"
                                >
                                    <h5>No data available</h5>
                                </div>
                                <div
                                    v-if="
                                        filterSubmittedRFQ &&
                                        filteredSubmittedRFQ.length == 0
                                    "
                                    class="text-center"
                                >
                                    <h5>Search not found</h5>
                                </div>
                                <template v-if="submittedRFQ.length > 0">
                                    <div
                                        role="tablist"
                                        v-for="x in filteredSubmittedRFQ"
                                        :key="x.id"
                                    >
                                        <b-card
                                            no-body
                                            class="mb-1 shadow-none"
                                        >
                                            <b-card-header
                                                header-tag="header"
                                                role="tab"
                                                header-class="cursor-pointer"
                                                @click="x.visible = !x.visible"
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
                                                            class="text-dark"
                                                            href="javascript: void(0);"
                                                            >[{{
                                                                x.rfqNumber
                                                            }}]:&nbsp;{{
                                                                x.description
                                                            }}</a
                                                        >
                                                    </h6>
                                                    <div
                                                        class="
                                                            d-flex
                                                            align-items-center
                                                        "
                                                    >
                                                        <div>
                                                            <span
                                                                class="
                                                                    d-flex
                                                                    align-items-center
                                                                "
                                                                ><small
                                                                    v-if="
                                                                        !x.visible
                                                                    "
                                                                    >Click here
                                                                    to
                                                                    expand</small
                                                                ><i
                                                                    class="
                                                                        bx
                                                                        bx-chevron-right
                                                                        rotate
                                                                        font-size-18
                                                                        ms-3
                                                                    "
                                                                    :class="{
                                                                        'rotate-90':
                                                                            x.visible,
                                                                    }"
                                                                ></i
                                                            ></span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </b-card-header>
                                            <b-collapse
                                                :visible="x.visible"
                                                :accordion="`posted-accordion-${x.id}`"
                                                role="tabpanel"
                                            >
                                                <b-card-body class="border">
                                                    <div
                                                        class="
                                                            d-flex
                                                            align-items-center
                                                            justify-content-between
                                                            cursor-pointer
                                                        "
                                                    >
                                                        <h5 class="mb-0">
                                                            Details
                                                        </h5>
                                                        <h5 class="mb-0">
                                                            <i
                                                                class="
                                                                    bx
                                                                    bx-chevron-right
                                                                    rotate
                                                                "
                                                                :class="{
                                                                    'rotate-90':
                                                                        x.detailShow,
                                                                }"
                                                            ></i>
                                                        </h5>
                                                    </div>
                                                    <b-collapse
                                                        :visible="x.detailShow"
                                                        :accordion="`rfq-details-accordion-${x.id}`"
                                                        role="tabpanel"
                                                    >
                                                        <hr />
                                                        <div>
                                                            <div>
                                                                <label
                                                                    class="me-1"
                                                                    ><i
                                                                        class="
                                                                            bx
                                                                            bx-receipt
                                                                            me-1
                                                                        "
                                                                    ></i
                                                                    >Tracking
                                                                    Number:</label
                                                                >
                                                                <u>{{
                                                                    x.tracking
                                                                }}</u>
                                                            </div>
                                                            <div>
                                                                <label
                                                                    class="me-1"
                                                                    ><i
                                                                        class="
                                                                            bx
                                                                            bx-list-ol
                                                                            me-1
                                                                        "
                                                                    ></i
                                                                    >Resolution
                                                                    Number:</label
                                                                >
                                                                <u>{{
                                                                    x.resolutionNumber
                                                                }}</u>
                                                            </div>
                                                            <div>
                                                                <label
                                                                    class="me-1"
                                                                    ><i
                                                                        class="
                                                                            bx
                                                                            bx-link-external
                                                                            me-1
                                                                        "
                                                                    ></i
                                                                    >Mode of
                                                                    Procurement:</label
                                                                >
                                                                <u>{{
                                                                    x.mop.text
                                                                }}</u>
                                                            </div>
                                                            <div>
                                                                <label
                                                                    class="me-1"
                                                                    ><i
                                                                        class="
                                                                            bx
                                                                            bx-package
                                                                            me-1
                                                                        "
                                                                    ></i
                                                                    >Delivery
                                                                    Period:</label
                                                                >
                                                                <u
                                                                    >{{
                                                                        x.deliveryPeriod
                                                                    }}
                                                                    day/s</u
                                                                >
                                                            </div>
                                                            <div>
                                                                <label
                                                                    class="me-1"
                                                                    ><i
                                                                        class="
                                                                            bx
                                                                            bx-calendar-event
                                                                            me-1
                                                                        "
                                                                    ></i
                                                                    >Deadline:</label
                                                                >
                                                                <u>{{
                                                                    formatDate(
                                                                        new Date(
                                                                            x.deadline
                                                                        )
                                                                    )
                                                                }}</u>
                                                            </div>
                                                        </div>
                                                    </b-collapse>
                                                    <hr />
                                                    <div
                                                        class="
                                                            d-flex
                                                            align-items-center
                                                            justify-content-between
                                                            cursor-pointer
                                                        "
                                                        @click="
                                                            x.itemVisible =
                                                                !x.itemVisible
                                                        "
                                                    >
                                                        <h5 class="mb-0">
                                                            RFQ Items
                                                        </h5>
                                                        <h5 class="mb-0">
                                                            <i
                                                                class="
                                                                    bx
                                                                    bx-chevron-right
                                                                    rotate
                                                                "
                                                                :class="{
                                                                    'rotate-90':
                                                                        x.itemVisible,
                                                                }"
                                                            ></i>
                                                        </h5>
                                                    </div>
                                                    <b-collapse
                                                        :visible="x.itemVisible"
                                                        :accordion="`rfq-item-accordion-${x.id}`"
                                                        role="tabpanel"
                                                    >
                                                        <hr />
                                                        <div
                                                            class="
                                                                d-flex
                                                                justify-content-between
                                                                mb-3
                                                            "
                                                        >
                                                            <p
                                                                class="mb-0"
                                                                :class="{
                                                                    'text-success':
                                                                        x.itemMsgType ===
                                                                        'success',
                                                                    'text-danger':
                                                                        x.itemMsgType ===
                                                                        'danger',
                                                                }"
                                                            >
                                                                {{
                                                                    x.itemMessage
                                                                }}
                                                            </p>
                                                            <a
                                                                href="javascript:void(0);"
                                                                class="
                                                                    border
                                                                    border-primary
                                                                    text-primary
                                                                    p-2
                                                                "
                                                                @click="
                                                                    addMoreItems(
                                                                        x
                                                                    )
                                                                "
                                                                ><i
                                                                    class="
                                                                        bx
                                                                        bx-plus
                                                                    "
                                                                ></i>
                                                                Add More
                                                                Items</a
                                                            >
                                                        </div>
                                                        <table
                                                            class="
                                                                table
                                                                table-bordered
                                                            "
                                                        >
                                                            <thead>
                                                                <tr
                                                                    class="
                                                                        custom-border-2
                                                                    "
                                                                >
                                                                    <th>
                                                                        Item
                                                                        Name
                                                                        <div>
                                                                            <small
                                                                                >Item
                                                                                Description</small
                                                                            >
                                                                        </div>
                                                                    </th>
                                                                    <th
                                                                        style="
                                                                            width: 120px;
                                                                        "
                                                                    >
                                                                        Unit
                                                                    </th>
                                                                    <th
                                                                        style="
                                                                            width: 70px;
                                                                        "
                                                                    >
                                                                        Qty
                                                                    </th>
                                                                    <th
                                                                        style="
                                                                            width: 150px;
                                                                        "
                                                                    >
                                                                        Unit
                                                                        Cost
                                                                    </th>
                                                                    <th
                                                                        style="
                                                                            width: 150px;
                                                                        "
                                                                    >
                                                                        Total
                                                                    </th>
                                                                    <th
                                                                        style="
                                                                            width: 50px;
                                                                        "
                                                                    ></th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                <tr
                                                                    v-for="z in x.rfqItems"
                                                                    :key="`poffer-${z.id}`"
                                                                >
                                                                    <td>
                                                                        {{
                                                                            z
                                                                                .prItem
                                                                                .apiResource
                                                                                .itemName
                                                                        }}
                                                                        <div>
                                                                            <small>
                                                                                {{
                                                                                    z
                                                                                        .prItem
                                                                                        .apiResource
                                                                                        .description
                                                                                }}
                                                                            </small>
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        {{
                                                                            z
                                                                                .prItem
                                                                                .apiResource
                                                                                .unit
                                                                                .unitName
                                                                        }}
                                                                    </td>
                                                                    <td>
                                                                        {{
                                                                            z
                                                                                .prItem
                                                                                .totalQuantity
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
                                                                                z
                                                                                    .prItem
                                                                                    .unitCost
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
                                                                                z
                                                                                    .prItem
                                                                                    .total
                                                                            )
                                                                        }}
                                                                        <div
                                                                            class="
                                                                                mt-2
                                                                                text-center
                                                                            "
                                                                            v-if="
                                                                                z
                                                                                    .prItem
                                                                                    .apiResource
                                                                                    .isWinner
                                                                            "
                                                                        >
                                                                            <small
                                                                                class="
                                                                                    badge
                                                                                    bg-success
                                                                                    px-2
                                                                                "
                                                                                ><i
                                                                                    class="
                                                                                        bx
                                                                                        bx-crown
                                                                                    "
                                                                                ></i
                                                                                >Winner</small
                                                                            >
                                                                        </div>
                                                                    </td>
                                                                    <td
                                                                        class="
                                                                            text-center
                                                                        "
                                                                    >
                                                                        <a
                                                                            href="javascript:void(0);"
                                                                            title="Remove Item"
                                                                            @click="
                                                                                removeItem(
                                                                                    z
                                                                                )
                                                                            "
                                                                            ><i
                                                                                class="
                                                                                    bx
                                                                                    bx-trash
                                                                                    text-danger
                                                                                    font-size-18
                                                                                "
                                                                            ></i
                                                                        ></a>
                                                                    </td>
                                                                </tr>
                                                                <tr
                                                                    v-if="
                                                                        x
                                                                            .rfqItems
                                                                            .length ==
                                                                        0
                                                                    "
                                                                >
                                                                    <td
                                                                        colspan="6"
                                                                        class="
                                                                            text-center
                                                                        "
                                                                    >
                                                                        <i
                                                                            >No
                                                                            items
                                                                            found</i
                                                                        >
                                                                    </td>
                                                                </tr>
                                                                <tr
                                                                    class="
                                                                        border
                                                                        border-dashed
                                                                    "
                                                                >
                                                                    <td
                                                                        colspan="4"
                                                                        class="
                                                                            text-right
                                                                            py-2
                                                                            px-2
                                                                        "
                                                                    >
                                                                        Total
                                                                        RFQ
                                                                        Amount:
                                                                    </td>
                                                                    <td
                                                                        colspan="2"
                                                                        class="
                                                                            py-2
                                                                        "
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
                                                                                    x.rfqItems
                                                                                )
                                                                            )
                                                                        }}
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </b-collapse>
                                                    <hr />
                                                    <div
                                                        class="
                                                            d-flex
                                                            align-items-center
                                                            justify-content-between
                                                            cursor-pointer
                                                        "
                                                        @click="
                                                            getRfqSupplier(x)
                                                        "
                                                    >
                                                        <h5 class="mb-0">
                                                            Suppliers & Offers
                                                        </h5>
                                                        <h5 class="mb-0">
                                                            <i
                                                                class="
                                                                    bx
                                                                    bx-chevron-right
                                                                    rotate
                                                                "
                                                                :class="{
                                                                    'rotate-90':
                                                                        x.supplierShow,
                                                                }"
                                                            ></i>
                                                        </h5>
                                                    </div>
                                                    <b-collapse
                                                        :visible="
                                                            x.supplierShow
                                                        "
                                                        :accordion="`supplier-accordion-${x.id}`"
                                                        role="tabpanel"
                                                    >
                                                        <hr />
                                                        <div
                                                            class="
                                                                d-flex
                                                                align-items-end
                                                                justify-content-between
                                                                mb-3
                                                            "
                                                        >
                                                            <div class="d-flex">
                                                                <p
                                                                    class="mb-0"
                                                                    v-if="
                                                                        x
                                                                            .rfqSuppliers
                                                                            .length ==
                                                                            0 &&
                                                                        !x.itemLoading
                                                                    "
                                                                >
                                                                    No suppliers
                                                                    found
                                                                </p>
                                                                <p
                                                                    class="mb-0"
                                                                    :class="{
                                                                        'text-success':
                                                                            x.supplierMsgType ===
                                                                            'success',
                                                                        'text-danger':
                                                                            x.supplierMsgType ===
                                                                            'danger',
                                                                    }"
                                                                >
                                                                    {{
                                                                        x.supplierMessage
                                                                    }}
                                                                </p>
                                                            </div>
                                                            <div class="">
                                                                <a
                                                                    href="javascript:void(0);"
                                                                    class="
                                                                        text-primary
                                                                        border-primary
                                                                        border
                                                                        p-2
                                                                    "
                                                                    :id="`supplier-popover-${x.id}`"
                                                                    @click="
                                                                        addMoreSupplier(x)
                                                                    "
                                                                    ><i
                                                                        class="
                                                                            bx
                                                                            bx-plus
                                                                        "
                                                                    ></i>
                                                                    Add More
                                                                    Supplier</a
                                                                >
                                                                <b-popover
                                                                    :target="`supplier-popover-${x.id}`"
                                                                    triggers="click"
                                                                    placement="left"
                                                                    custom-class="popover-supplier"
                                                                    :show.sync="
                                                                        x.addSupplier
                                                                    "
                                                                >
                                                                    <template
                                                                        v-slot:title
                                                                    >
                                                                        <div
                                                                            class="
                                                                                d-flex
                                                                                align-items-center
                                                                                justify-content-between
                                                                            "
                                                                        >
                                                                            <small
                                                                                >Add
                                                                                More
                                                                                Supplier</small
                                                                            >
                                                                            <span
                                                                                class="
                                                                                    bx
                                                                                    bx-x
                                                                                    font-size-14
                                                                                    cursor-pointer
                                                                                "
                                                                                @click="
                                                                                    x.addSupplier = false
                                                                                "
                                                                            ></span>
                                                                        </div>
                                                                    </template>
                                                                    <multiselect
                                                                        v-model="
                                                                            addSupplier
                                                                        "
                                                                        :options="
                                                                            suppliers
                                                                        "
                                                                        label="name"
                                                                        track-by="id"
                                                                        value="id"
                                                                        :allow-empty="
                                                                            false
                                                                        "
                                                                        :class="{
                                                                            'is-invalid':
                                                                                submitted &&
                                                                                $v
                                                                                    .addSupplier
                                                                                    .$error,
                                                                        }"
                                                                    />
                                                                    <div
                                                                        v-if="
                                                                            submitted &&
                                                                            $v
                                                                                .addSupplier
                                                                                .$error
                                                                        "
                                                                        class="
                                                                            invalid-feedback
                                                                        "
                                                                    >
                                                                        <span
                                                                            v-if="
                                                                                !$v
                                                                                    .addSupplier
                                                                                    .required
                                                                            "
                                                                            >This
                                                                            value
                                                                            is
                                                                            required.</span
                                                                        >
                                                                    </div>
                                                                    <hr />
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
                                                                                me-1
                                                                            "
                                                                            @click="
                                                                                addSup(
                                                                                    x.id
                                                                                )
                                                                            "
                                                                        >
                                                                            <i
                                                                                class="
                                                                                    bx
                                                                                    bx-save
                                                                                    me-1
                                                                                "
                                                                            ></i
                                                                            >Add
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            class="
                                                                                btn
                                                                                btn-sm
                                                                            "
                                                                            @click="
                                                                                x.addSupplier = false
                                                                            "
                                                                        >
                                                                            <i
                                                                                class="
                                                                                    bx
                                                                                    bx-x
                                                                                    me-1
                                                                                "
                                                                            ></i
                                                                            >Cancel
                                                                        </button>
                                                                    </div>
                                                                </b-popover>
                                                            </div>
                                                        </div>
                                                        <div
                                                            class="my-3"
                                                            v-if="x.itemLoading"
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
                                                        <b-card
                                                            no-body
                                                            class="
                                                                mb-1
                                                                shadow-none
                                                            "
                                                            v-for="(
                                                                y, index
                                                            ) in x.rfqSuppliers"
                                                            :key="y.id"
                                                        >
                                                            <b-card-header
                                                                header-tag="header"
                                                                role="tab"
                                                                class="border"
                                                            >
                                                                <div
                                                                    class="
                                                                        d-flex
                                                                        justify-content-between
                                                                        align-items-center
                                                                    "
                                                                >
                                                                    <div
                                                                        class="
                                                                            d-flex
                                                                            align-items-center
                                                                        "
                                                                    >
                                                                        <div
                                                                            style="
                                                                                min-width: 30px;
                                                                            "
                                                                            class="
                                                                                bg-success
                                                                                bg-gradient
                                                                                text-center
                                                                                me-2
                                                                                py-1
                                                                            "
                                                                        >
                                                                            <h3
                                                                                class="
                                                                                    mb-0
                                                                                "
                                                                            >
                                                                                {{
                                                                                    index +
                                                                                    1
                                                                                }}
                                                                            </h3>
                                                                        </div>
                                                                        <div>
                                                                            <h5
                                                                                class="
                                                                                    mb-0
                                                                                "
                                                                            >
                                                                                {{
                                                                                    y
                                                                                        .supplier
                                                                                        .name
                                                                                }}
                                                                            </h5>
                                                                            <div
                                                                                class="
                                                                                    d-flex
                                                                                    align-items-center
                                                                                "
                                                                            >
                                                                                <small
                                                                                    class="
                                                                                        me-1
                                                                                    "
                                                                                    >{{
                                                                                        y
                                                                                            .supplier
                                                                                            .address
                                                                                    }}</small
                                                                                >
                                                                                |
                                                                                <small
                                                                                    class="
                                                                                        cursor-pointer
                                                                                    "
                                                                                    @click="
                                                                                        removeSup(
                                                                                            x.id,
                                                                                            y.id
                                                                                        )
                                                                                    "
                                                                                    ><b
                                                                                        class="
                                                                                            ms-1
                                                                                            text-danger
                                                                                        "
                                                                                        ><i
                                                                                            class="
                                                                                                bx
                                                                                                bx-trash
                                                                                            "
                                                                                        ></i>
                                                                                        Remove
                                                                                        Supplier</b
                                                                                    ></small
                                                                                >
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div
                                                                        class="
                                                                            d-flex
                                                                            align-items-center
                                                                        "
                                                                    >
                                                                        <button
                                                                            class="
                                                                                btn
                                                                                border-success
                                                                                me-3
                                                                                text-success
                                                                            "
                                                                            type="button"
                                                                            @click="
                                                                                updateOffer(
                                                                                    y.supplierRFQ,
                                                                                    index,
                                                                                    y.id
                                                                                )
                                                                            "
                                                                        >
                                                                            Update
                                                                            Offer
                                                                        </button>
                                                                        <a
                                                                            href="javascript: void(0);"
                                                                            class="
                                                                                d-flex
                                                                                align-items-center
                                                                                text-info
                                                                            "
                                                                            @click="
                                                                                y.visible =
                                                                                    !y.visible
                                                                            "
                                                                        >
                                                                            {{
                                                                                y.visible
                                                                                    ? "Hide"
                                                                                    : "Show"
                                                                            }}
                                                                            Offer
                                                                            <i
                                                                                class="
                                                                                    bx
                                                                                    bx-chevron-right
                                                                                    rotate
                                                                                    font-size-14
                                                                                "
                                                                                :class="{
                                                                                    'rotate-90':
                                                                                        y.visible,
                                                                                }"
                                                                            ></i>
                                                                        </a>
                                                                    </div>
                                                                </div>
                                                            </b-card-header>
                                                            <b-collapse
                                                                :visible="
                                                                    y.visible
                                                                "
                                                                :accordion="`posted-supplier-${y.id}`"
                                                                role="tabpanel"
                                                            >
                                                                <div
                                                                    class="
                                                                        px-2
                                                                        py-1
                                                                    "
                                                                >
                                                                    <table
                                                                        class="
                                                                            table
                                                                            table-bordered
                                                                        "
                                                                    >
                                                                        <thead>
                                                                            <tr>
                                                                                <th>
                                                                                    Item
                                                                                    Name
                                                                                    <div>
                                                                                        <small
                                                                                            >Item
                                                                                            Description</small
                                                                                        >
                                                                                    </div>
                                                                                </th>
                                                                                <th
                                                                                    style="
                                                                                        width: 120px;
                                                                                    "
                                                                                >
                                                                                    Unit
                                                                                </th>
                                                                                <th
                                                                                    style="
                                                                                        width: 70px;
                                                                                    "
                                                                                >
                                                                                    Qty
                                                                                </th>
                                                                                <th
                                                                                    style="
                                                                                        width: 150px;
                                                                                    "
                                                                                >
                                                                                    Unit
                                                                                    Cost
                                                                                </th>
                                                                                <th
                                                                                    style="
                                                                                        width: 150px;
                                                                                    "
                                                                                >
                                                                                    Total
                                                                                </th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            <template
                                                                                v-for="(
                                                                                    z,
                                                                                    zIndex
                                                                                ) in y.supplierRFQ"
                                                                            >
                                                                                <tr
                                                                                    :key="
                                                                                        z.id
                                                                                    "
                                                                                >
                                                                                    <td
                                                                                        class="
                                                                                            position-relative
                                                                                        "
                                                                                    >
                                                                                        <div
                                                                                            class="
                                                                                                position-absolute
                                                                                                bg-purple
                                                                                                text-center
                                                                                                item-index
                                                                                            "
                                                                                        >
                                                                                            <span
                                                                                                class="
                                                                                                    badge
                                                                                                "
                                                                                                >{{
                                                                                                    zIndex +
                                                                                                    1
                                                                                                }}</span
                                                                                            >
                                                                                        </div>
                                                                                        {{
                                                                                            z
                                                                                                .prItem
                                                                                                .apiResource
                                                                                                .itemName
                                                                                        }}
                                                                                        <div>
                                                                                            <small>
                                                                                                {{
                                                                                                    z
                                                                                                        .prItem
                                                                                                        .apiResource
                                                                                                        .description
                                                                                                }}
                                                                                            </small>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        {{
                                                                                            z
                                                                                                .prItem
                                                                                                .apiResource
                                                                                                .unit
                                                                                                .unitName
                                                                                        }}
                                                                                    </td>
                                                                                    <td>
                                                                                        {{
                                                                                            z
                                                                                                .prItem
                                                                                                .totalQuantity
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
                                                                                                z
                                                                                                    .prItem
                                                                                                    .unitCost
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
                                                                                                z
                                                                                                    .prItem
                                                                                                    .total
                                                                                            )
                                                                                        }}
                                                                                    </td>
                                                                                </tr>
                                                                                <tr
                                                                                    :key="`offer-${z.id}`"
                                                                                    v-if="
                                                                                        z
                                                                                            .offer
                                                                                            .id >
                                                                                        0
                                                                                    "
                                                                                    class="
                                                                                        custom-border-2
                                                                                    "
                                                                                >
                                                                                    <td
                                                                                        class="
                                                                                            position-relative
                                                                                        "
                                                                                    >
                                                                                        <div
                                                                                            class="
                                                                                                bg-secondary
                                                                                                bg-soft
                                                                                                rotate-270
                                                                                            "
                                                                                        >
                                                                                            <span
                                                                                                class="
                                                                                                    badge
                                                                                                "
                                                                                                >Item
                                                                                                Offer</span
                                                                                            >
                                                                                        </div>
                                                                                        {{
                                                                                            z
                                                                                                .offer
                                                                                                .itemName
                                                                                        }}
                                                                                        <div>
                                                                                            <small>
                                                                                                {{
                                                                                                    z
                                                                                                        .offer
                                                                                                        .description
                                                                                                }}
                                                                                            </small>
                                                                                        </div>
                                                                                        <div>
                                                                                            <small
                                                                                                class="
                                                                                                    text-warning
                                                                                                "
                                                                                            >
                                                                                                {{
                                                                                                    z
                                                                                                        .offer
                                                                                                        .note
                                                                                                }}
                                                                                            </small>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        {{
                                                                                            z
                                                                                                .offer
                                                                                                .unit
                                                                                                .unitName
                                                                                        }}
                                                                                    </td>
                                                                                    <td>
                                                                                        {{
                                                                                            z
                                                                                                .offer
                                                                                                .quantity
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
                                                                                                z
                                                                                                    .offer
                                                                                                    .unitCost
                                                                                            )
                                                                                        }}
                                                                                    </td>
                                                                                    <td
                                                                                        class="
                                                                                            position-relative
                                                                                        "
                                                                                    >
                                                                                        <div
                                                                                            class="
                                                                                                position-absolute
                                                                                                cursor-pointer
                                                                                            "
                                                                                            @click="
                                                                                                removeOffer(
                                                                                                    z.offer
                                                                                                )
                                                                                            "
                                                                                            style="
                                                                                                right: 0;
                                                                                                top: -12px;
                                                                                            "
                                                                                        >
                                                                                            <span
                                                                                                class="
                                                                                                    badge
                                                                                                    bg-danger
                                                                                                    px-1
                                                                                                "
                                                                                                ><i
                                                                                                    class="
                                                                                                        bx
                                                                                                        bx-trash
                                                                                                        me-1
                                                                                                    "
                                                                                                ></i
                                                                                                >Remove
                                                                                                offer</span
                                                                                            >
                                                                                        </div>
                                                                                        {{
                                                                                            Intl.NumberFormat(
                                                                                                "ja-JP",
                                                                                                {
                                                                                                    currency:
                                                                                                        "PHP",
                                                                                                    style: "currency",
                                                                                                }
                                                                                            ).format(
                                                                                                parseFloat(
                                                                                                    z
                                                                                                        .offer
                                                                                                        .unitCost
                                                                                                ) *
                                                                                                    parseFloat(
                                                                                                        z
                                                                                                            .offer
                                                                                                            .quantity
                                                                                                    )
                                                                                            )
                                                                                        }}
                                                                                        <div
                                                                                            class="
                                                                                                mt-2
                                                                                                text-center
                                                                                            "
                                                                                            v-if="
                                                                                                z
                                                                                                    .offer
                                                                                                    .isWinner
                                                                                            "
                                                                                        >
                                                                                            <small
                                                                                                class="
                                                                                                    badge
                                                                                                    bg-success
                                                                                                    px-2
                                                                                                "
                                                                                                ><i
                                                                                                    class="
                                                                                                        bx
                                                                                                        bx-crown
                                                                                                    "
                                                                                                ></i
                                                                                                >Winner</small
                                                                                            >
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>
                                                                                <tr
                                                                                    :key="`no-offer-${z.id}`"
                                                                                    v-else
                                                                                >
                                                                                    <td
                                                                                        colspan="5"
                                                                                        class="
                                                                                            text-center
                                                                                        "
                                                                                    >
                                                                                        <i
                                                                                            >No
                                                                                            offer
                                                                                            yet</i
                                                                                        >
                                                                                    </td>
                                                                                </tr>
                                                                            </template>
                                                                            <tr
                                                                                class="
                                                                                    border
                                                                                    border-dashed
                                                                                "
                                                                            >
                                                                                <td
                                                                                    class="
                                                                                        py-2
                                                                                    "
                                                                                    colspan="3"
                                                                                ></td>
                                                                                <td
                                                                                    class="
                                                                                        text-right
                                                                                        py-2
                                                                                        px-2
                                                                                    "
                                                                                >
                                                                                    Total
                                                                                    RFQ
                                                                                    Amount:
                                                                                </td>
                                                                                <td
                                                                                    colspan="2"
                                                                                    class="
                                                                                        py-2
                                                                                    "
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
                                                                                                x.rfqItems
                                                                                            )
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
                                                                                    class="
                                                                                        py-2
                                                                                    "
                                                                                    colspan="3"
                                                                                ></td>
                                                                                <td
                                                                                    class="
                                                                                        text-right
                                                                                        py-2
                                                                                        px-2
                                                                                    "
                                                                                >
                                                                                    Total
                                                                                    Offer
                                                                                    Amount:
                                                                                </td>
                                                                                <td
                                                                                    colspan="2"
                                                                                    class="
                                                                                        py-2
                                                                                    "
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
                                                                                            getTotalOffer(
                                                                                                y.supplierRFQ
                                                                                            )
                                                                                        )
                                                                                    }}
                                                                                </td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </b-collapse>
                                                        </b-card>
                                                    </b-collapse>
                                                    <hr />
                                                    <div class="d-flex">
                                                        <button
                                                            type="button"
                                                            class="
                                                                btn btn-success
                                                                me-2
                                                            "
                                                            @click="postRFQ(x)"
                                                        >
                                                            <i
                                                                class="
                                                                    bx bx-check
                                                                    me-1
                                                                "
                                                            ></i
                                                            >Post RFQ
                                                        </button>
                                                        <button
                                                            type="button"
                                                            class="
                                                                btn btn-purple
                                                            "
                                                            @click="printRFQ(x.id)"
                                                        >
                                                            <i
                                                                class="
                                                                    bx
                                                                    bxs-printer
                                                                    me-1
                                                                "
                                                            ></i
                                                            >Print RFQ
                                                        </button>
                                                    </div>
                                                    <div
                                                        class="
                                                            d-flex
                                                            mt-2
                                                            align-items-center
                                                        "
                                                        v-if="x.isPosting"
                                                    >
                                                        <div
                                                            class="
                                                                spinner-border
                                                                text-success
                                                            "
                                                            role="status"
                                                            style="
                                                                width: 15px;
                                                                height: 15px;
                                                            "
                                                            v-if="!x.errorPost"
                                                        >
                                                            <span
                                                                class="sr-only"
                                                                >Loading...</span
                                                            >
                                                        </div>
                                                        <div
                                                            class="ms-1"
                                                            :class="{
                                                                'text-danger':
                                                                    x.errorPost,
                                                            }"
                                                        >
                                                            {{
                                                                x.postingMessage
                                                            }}
                                                        </div>
                                                    </div>
                                                </b-card-body>
                                            </b-collapse>
                                        </b-card>
                                    </div>
                                </template>
                            </div>
                        </div>
                    </b-tab>
                    <b-tab title-item-class="mb-2">
                        <template v-slot:title>
                            <span class="d-inline-block d-sm-none">
                                <i class="bx bx-home"></i>
                            </span>
                            <span class="d-none d-sm-inline-block"
                                >Posted (<template v-if="!postedBusy">{{
                                    posted.length
                                }}</template
                                ><template v-if="postedBusy"
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
                                <div
                                    class="
                                        d-flex
                                        align-items-center
                                        mb-3
                                        justify-content-between
                                    "
                                >
                                    <div>
                                        <h4 class="card-title mb-0">
                                            Posted Request for Quotation
                                        </h4>
                                        <p class="card-title-desc mb-0">
                                            List of posted Request for Quotation
                                        </p>
                                    </div>
                                    <div v-if="posted.length > 0">
                                        <input
                                            autocomplete="off"
                                            id="name"
                                            type="text"
                                            v-model="filterPostedRFQ"
                                            placeholder="Search RFQ..."
                                            class="form-control"
                                        />
                                    </div>
                                </div>

                                <div
                                    v-if="
                                        posted.length == 0 && !filterPostedRFQ
                                    "
                                    class="text-center"
                                >
                                    <h5>No data available</h5>
                                </div>
                                <div
                                    v-if="
                                        filteredPostedRFQ.length == 0 &&
                                        filterPostedRFQ
                                    "
                                    class="text-center"
                                >
                                    <h5>Search not found</h5>
                                </div>
                                <template v-if="posted.length > 0">
                                    <div
                                        role="tablist"
                                        v-for="x in filteredPostedRFQ"
                                        :key="x.id"
                                    >
                                        <b-card
                                            no-body
                                            class="mb-1 shadow-none"
                                        >
                                            <b-card-header
                                                header-tag="header"
                                                role="tab"
                                                header-class="cursor-pointer"
                                                @click="x.visible = !x.visible"
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
                                                            class="text-dark"
                                                            href="javascript: void(0);"
                                                            >[{{
                                                                x.rfqNumber
                                                            }}]:&nbsp;{{
                                                                x.description
                                                            }}</a
                                                        >
                                                    </h6>
                                                    <div
                                                        class="
                                                            d-flex
                                                            align-items-center
                                                        "
                                                    >
                                                        <div>
                                                            <span
                                                                class="
                                                                    d-flex
                                                                    align-items-center
                                                                "
                                                                ><small
                                                                    v-if="
                                                                        !x.visible
                                                                    "
                                                                    >Click here
                                                                    to
                                                                    expand</small
                                                                ><i
                                                                    class="
                                                                        bx
                                                                        bx-chevron-right
                                                                        rotate
                                                                        font-size-18
                                                                        ms-3
                                                                    "
                                                                    :class="{
                                                                        'rotate-90':
                                                                            x.visible,
                                                                    }"
                                                                ></i
                                                            ></span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </b-card-header>
                                            <b-collapse
                                                :visible="x.visible"
                                                :accordion="`posted-accordion-${x.id}`"
                                                role="tabpanel"
                                            >
                                                <b-card-body class="border">
                                                    <div
                                                        class="
                                                            d-flex
                                                            align-items-center
                                                            justify-content-between
                                                            cursor-pointer
                                                        "
                                                    >
                                                        <h5 class="mb-0">
                                                            Details
                                                        </h5>
                                                        <h5 class="mb-0">
                                                            <i
                                                                class="
                                                                    bx
                                                                    bx-chevron-right
                                                                    rotate
                                                                "
                                                                :class="{
                                                                    'rotate-90':
                                                                        x.detailShow,
                                                                }"
                                                            ></i>
                                                        </h5>
                                                    </div>
                                                    <b-collapse
                                                        :visible="x.detailShow"
                                                        :accordion="`rfq-details-accordion-${x.id}`"
                                                        role="tabpanel"
                                                    >
                                                        <hr />
                                                        <div>
                                                            <div>
                                                                <label
                                                                    class="me-1"
                                                                    ><i
                                                                        class="
                                                                            bx
                                                                            bx-receipt
                                                                            me-1
                                                                        "
                                                                    ></i
                                                                    >Tracking
                                                                    Number:</label
                                                                >
                                                                <u>{{
                                                                    x.tracking
                                                                }}</u>
                                                            </div>
                                                            <div>
                                                                <label
                                                                    class="me-1"
                                                                    ><i
                                                                        class="
                                                                            bx
                                                                            bx-list-ol
                                                                            me-1
                                                                        "
                                                                    ></i
                                                                    >Resolution
                                                                    Number:</label
                                                                >
                                                                <u>{{
                                                                    x.resolutionNumber
                                                                }}</u>
                                                            </div>
                                                            <div>
                                                                <label
                                                                    class="me-1"
                                                                    ><i
                                                                        class="
                                                                            bx
                                                                            bx-link-external
                                                                            me-1
                                                                        "
                                                                    ></i
                                                                    >Mode of
                                                                    Procurement:</label
                                                                >
                                                                <u>{{
                                                                    x.mop.text
                                                                }}</u>
                                                            </div>
                                                            <div>
                                                                <label
                                                                    class="me-1"
                                                                    ><i
                                                                        class="
                                                                            bx
                                                                            bx-package
                                                                            me-1
                                                                        "
                                                                    ></i
                                                                    >Delivery
                                                                    Period:</label
                                                                >
                                                                <u
                                                                    >{{
                                                                        x.deliveryPeriod
                                                                    }}
                                                                    day/s</u
                                                                >
                                                            </div>
                                                            <div class="mb-2">
                                                                <label
                                                                    class="me-1"
                                                                    ><i
                                                                        class="
                                                                            bx
                                                                            bx-calendar-event
                                                                            me-1
                                                                        "
                                                                    ></i
                                                                    >Deadline:</label
                                                                >
                                                                <u>{{
                                                                    formatDate(
                                                                        new Date(
                                                                            x.deadline
                                                                        )
                                                                    )
                                                                }}</u>
                                                            </div>
                                                        </div>
                                                    </b-collapse>
                                                    <hr />
                                                    <div
                                                        class="
                                                            d-flex
                                                            align-items-center
                                                            justify-content-between
                                                            cursor-pointer
                                                        "
                                                        @click="
                                                            x.itemVisible =
                                                                !x.itemVisible
                                                        "
                                                    >
                                                        <h5 class="mb-0">
                                                            RFQ Items
                                                        </h5>
                                                        <h5 class="mb-0">
                                                            <i
                                                                class="
                                                                    bx
                                                                    bx-chevron-right
                                                                    rotate
                                                                "
                                                                :class="{
                                                                    'rotate-90':
                                                                        x.itemVisible,
                                                                }"
                                                            ></i>
                                                        </h5>
                                                    </div>
                                                    <b-collapse
                                                        :visible="x.itemVisible"
                                                        :accordion="`rfq-item-accordion-${x.id}`"
                                                        role="tabpanel"
                                                    >
                                                        <hr />
                                                        <table
                                                            class="
                                                                table
                                                                table-bordered
                                                            "
                                                        >
                                                            <thead>
                                                                <tr
                                                                    class="
                                                                        custom-border-2
                                                                    "
                                                                >
                                                                    <th>
                                                                        Item
                                                                        Name
                                                                        <div>
                                                                            <small
                                                                                >Item
                                                                                Description</small
                                                                            >
                                                                        </div>
                                                                    </th>
                                                                    <th
                                                                        style="
                                                                            width: 120px;
                                                                        "
                                                                    >
                                                                        Unit
                                                                    </th>
                                                                    <th
                                                                        style="
                                                                            width: 70px;
                                                                        "
                                                                    >
                                                                        Qty
                                                                    </th>
                                                                    <th
                                                                        style="
                                                                            width: 150px;
                                                                        "
                                                                    >
                                                                        Unit
                                                                        Cost
                                                                    </th>
                                                                    <th
                                                                        style="
                                                                            width: 150px;
                                                                        "
                                                                    >
                                                                        Total
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                <tr
                                                                    v-for="z in x.rfqItems"
                                                                    :key="`poffer-${z.id}`"
                                                                >
                                                                    <td>
                                                                        {{
                                                                            z
                                                                                .prItem
                                                                                .apiResource
                                                                                .itemName
                                                                        }}
                                                                        <div>
                                                                            <small>
                                                                                {{
                                                                                    z
                                                                                        .prItem
                                                                                        .apiResource
                                                                                        .description
                                                                                }}
                                                                            </small>
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        {{
                                                                            z
                                                                                .prItem
                                                                                .apiResource
                                                                                .unit
                                                                                .unitName
                                                                        }}
                                                                    </td>
                                                                    <td>
                                                                        {{
                                                                            z
                                                                                .prItem
                                                                                .totalQuantity
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
                                                                                z
                                                                                    .prItem
                                                                                    .unitCost
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
                                                                                z
                                                                                    .prItem
                                                                                    .total
                                                                            )
                                                                        }}
                                                                        <div
                                                                            class="
                                                                                mt-2
                                                                                text-center
                                                                            "
                                                                            v-if="
                                                                                z
                                                                                    .prItem
                                                                                    .apiResource
                                                                                    .isWinner
                                                                            "
                                                                        >
                                                                            <small
                                                                                class="
                                                                                    badge
                                                                                    bg-success
                                                                                    px-2
                                                                                "
                                                                                ><i
                                                                                    class="
                                                                                        bx
                                                                                        bx-crown
                                                                                    "
                                                                                ></i
                                                                                >Winner</small
                                                                            >
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                                <tr
                                                                    v-if="
                                                                        x
                                                                            .rfqItems
                                                                            .length ==
                                                                        0
                                                                    "
                                                                >
                                                                    <td
                                                                        colspan="5"
                                                                        class="
                                                                            text-center
                                                                        "
                                                                    >
                                                                        <i
                                                                            >No
                                                                            offer
                                                                            yet</i
                                                                        >
                                                                    </td>
                                                                </tr>
                                                                <tr
                                                                    class="
                                                                        border
                                                                        border-dashed
                                                                    "
                                                                >
                                                                    <td
                                                                        colspan="4"
                                                                        class="
                                                                            text-right
                                                                            py-2
                                                                            px-2
                                                                        "
                                                                    >
                                                                        Total
                                                                        RFQ
                                                                        Amount:
                                                                    </td>
                                                                    <td
                                                                        colspan="2"
                                                                        class="
                                                                            py-2
                                                                        "
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
                                                                                    x.rfqItems
                                                                                )
                                                                            )
                                                                        }}
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </b-collapse>
                                                    <hr />
                                                    <div
                                                        class="
                                                            d-flex
                                                            align-items-center
                                                            justify-content-between
                                                            cursor-pointer
                                                        "
                                                        @click="
                                                            x.supplierShow =
                                                                !x.supplierShow
                                                        "
                                                    >
                                                        <h5 class="mb-0">
                                                            Suppliers & Offers
                                                        </h5>
                                                        <h5 class="mb-0">
                                                            <i
                                                                class="
                                                                    bx
                                                                    bx-chevron-right
                                                                    rotate
                                                                "
                                                                :class="{
                                                                    'rotate-90':
                                                                        x.supplierShow,
                                                                }"
                                                            ></i>
                                                        </h5>
                                                    </div>
                                                    <b-collapse
                                                        :visible="
                                                            x.supplierShow
                                                        "
                                                        :accordion="`supplier-accordion-${x.id}`"
                                                        role="tabpanel"
                                                    >
                                                        <hr />
                                                        <b-card
                                                            no-body
                                                            class="
                                                                mb-1
                                                                shadow-none
                                                            "
                                                            v-for="(
                                                                y, index
                                                            ) in x.rfqSuppliers"
                                                            :key="y.id"
                                                        >
                                                            <b-card-header
                                                                header-tag="header"
                                                                role="tab"
                                                                class="border"
                                                                :class="{
                                                                    'border-success':
                                                                        y.isWinner,
                                                                }"
                                                            >
                                                                <div
                                                                    class="
                                                                        d-flex
                                                                        justify-content-between
                                                                        align-items-center
                                                                    "
                                                                >
                                                                    <div
                                                                        class="
                                                                            d-flex
                                                                            align-items-center
                                                                        "
                                                                    >
                                                                        <div
                                                                            style="
                                                                                min-width: 30px;
                                                                            "
                                                                            class="
                                                                                bg-success
                                                                                bg-gradient
                                                                                text-center
                                                                                me-2
                                                                                py-1
                                                                                position-relative
                                                                            "
                                                                        >
                                                                            <h3
                                                                                class="
                                                                                    mb-0
                                                                                    position-relative
                                                                                "
                                                                            >
                                                                                {{
                                                                                    index +
                                                                                    1
                                                                                }}
                                                                                <i
                                                                                    class="
                                                                                        bx
                                                                                        bx-crown
                                                                                        position-absolute
                                                                                        winner-crown
                                                                                        font-size-14
                                                                                    "
                                                                                    v-if="
                                                                                        y.isWinner
                                                                                    "
                                                                                ></i>
                                                                            </h3>
                                                                        </div>
                                                                        <div
                                                                            class="
                                                                                text-muted
                                                                            "
                                                                        >
                                                                            <h5
                                                                                class="
                                                                                    mb-0
                                                                                "
                                                                            >
                                                                                {{
                                                                                    y
                                                                                        .supplier
                                                                                        .name
                                                                                }}
                                                                            </h5>
                                                                            <div
                                                                                style="
                                                                                    line-height: 0.8;
                                                                                "
                                                                            >
                                                                                <small
                                                                                    >{{
                                                                                        y
                                                                                            .supplier
                                                                                            .address
                                                                                    }}</small
                                                                                >
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div
                                                                        class="
                                                                            d-flex
                                                                            align-items-center
                                                                        "
                                                                    >
                                                                        <button
                                                                            type="button"
                                                                            class="
                                                                                btn btn-purple
                                                                                me-2
                                                                            "
                                                                            v-if="
                                                                                y.isWinner
                                                                            "
                                                                            @click="printNOA(x.id)"
                                                                        >
                                                                            <i
                                                                                class="
                                                                                    bx
                                                                                    bxs-printer
                                                                                    me-1
                                                                                "
                                                                            ></i
                                                                            >Print NOA
                                                                        </button>
                                                                        <a
                                                                            href="javascript: void(0);"
                                                                            class="
                                                                                text-success
                                                                                d-flex
                                                                                align-items-center
                                                                            "
                                                                            @click="
                                                                                y.visible =
                                                                                    !y.visible
                                                                            "
                                                                        >
                                                                            {{
                                                                                y.visible
                                                                                    ? "Hide"
                                                                                    : "Show"
                                                                            }}
                                                                            Offer
                                                                            <i
                                                                                class="
                                                                                    bx
                                                                                    bx-chevron-right
                                                                                    rotate
                                                                                    font-size-14
                                                                                "
                                                                                :class="{
                                                                                    'rotate-90':
                                                                                        y.visible,
                                                                                }"
                                                                            ></i>
                                                                        </a>
                                                                    </div>
                                                                </div>
                                                            </b-card-header>
                                                            <b-collapse
                                                                :visible="
                                                                    y.visible
                                                                "
                                                                :accordion="`posted-supplier-${y.id}`"
                                                                role="tabpanel"
                                                            >
                                                                <table
                                                                    class="
                                                                        table
                                                                        table-bordered
                                                                    "
                                                                >
                                                                    <thead>
                                                                        <tr>
                                                                            <th>
                                                                                Item
                                                                                Name
                                                                                <div>
                                                                                    <small
                                                                                        >Item
                                                                                        Description</small
                                                                                    >
                                                                                </div>
                                                                            </th>
                                                                            <th
                                                                                style="
                                                                                    width: 120px;
                                                                                "
                                                                            >
                                                                                Unit
                                                                            </th>
                                                                            <th
                                                                                style="
                                                                                    width: 70px;
                                                                                "
                                                                            >
                                                                                Qty
                                                                            </th>
                                                                            <th
                                                                                style="
                                                                                    width: 150px;
                                                                                "
                                                                            >
                                                                                Unit
                                                                                Cost
                                                                            </th>
                                                                            <th
                                                                                style="
                                                                                    width: 150px;
                                                                                "
                                                                            >
                                                                                Total
                                                                            </th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        <tr
                                                                            v-for="z in y.rfqSupplierOffers"
                                                                            :key="`poffer-${z.id}`"
                                                                            :class="{
                                                                                'custom-border-2 border-success':
                                                                                    z.isWinner,
                                                                            }"
                                                                        >
                                                                            <td>
                                                                                {{
                                                                                    z.itemName
                                                                                }}
                                                                                <div>
                                                                                    <small>
                                                                                        {{
                                                                                            z.description
                                                                                        }}
                                                                                    </small>
                                                                                </div>
                                                                                <div>
                                                                                    <small
                                                                                        class="
                                                                                            text-warning
                                                                                        "
                                                                                    >
                                                                                        {{
                                                                                            z.note
                                                                                        }}
                                                                                    </small>
                                                                                </div>
                                                                            </td>
                                                                            <td>
                                                                                {{
                                                                                    z
                                                                                        .unit
                                                                                        .unitName
                                                                                }}
                                                                            </td>
                                                                            <td>
                                                                                {{
                                                                                    z.quantity
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
                                                                                        z.unitCost
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
                                                                                        parseFloat(
                                                                                            z.unitCost
                                                                                        ) *
                                                                                            parseFloat(
                                                                                                z.quantity
                                                                                            )
                                                                                    )
                                                                                }}
                                                                                <div
                                                                                    class="
                                                                                        mt-2
                                                                                    "
                                                                                    v-if="
                                                                                        z.isWinner
                                                                                    "
                                                                                >
                                                                                    <small
                                                                                        class="
                                                                                            badge
                                                                                        "
                                                                                        ><i
                                                                                            class="
                                                                                                bx
                                                                                                bx-crown
                                                                                            "
                                                                                        ></i
                                                                                        >Winner</small
                                                                                    >
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                        <tr
                                                                            v-if="
                                                                                y
                                                                                    .rfqSupplierOffers
                                                                                    .length ==
                                                                                0
                                                                            "
                                                                        >
                                                                            <td
                                                                                colspan="5"
                                                                                class="
                                                                                    text-center
                                                                                "
                                                                            >
                                                                                <i
                                                                                    >No
                                                                                    offer
                                                                                    yet</i
                                                                                >
                                                                            </td>
                                                                        </tr>
                                                                        <tr
                                                                            class="
                                                                                border
                                                                                border-dashed
                                                                            "
                                                                        >
                                                                            <td
                                                                                class="
                                                                                    py-2
                                                                                "
                                                                                colspan="3"
                                                                            ></td>
                                                                            <td
                                                                                class="
                                                                                    text-right
                                                                                    py-2
                                                                                    px-2
                                                                                "
                                                                            >
                                                                                Total
                                                                                Offer
                                                                                Amount:
                                                                            </td>
                                                                            <td
                                                                                colspan="2"
                                                                                class="
                                                                                    py-2
                                                                                "
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
                                                                                        getTotalOffer(
                                                                                            y.rfqSupplierOffers,
                                                                                            "posted"
                                                                                        )
                                                                                    )
                                                                                }}
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </b-collapse>
                                                        </b-card>
                                                    </b-collapse>
                                                    <hr />
                                                    <div class="d-flex">
                                                        <button
                                                            type="button"
                                                            class="
                                                                btn btn-warning
                                                                me-1
                                                            "
                                                            @click="
                                                                returnRFQ(x)
                                                            "
                                                        >
                                                            <i
                                                                class="
                                                                    bx bx-reply
                                                                    me-1
                                                                "
                                                            ></i
                                                            >Return RFQ
                                                        </button>
                                                        <button
                                                            type="button"
                                                            class="
                                                                btn btn-purple
                                                                me-1
                                                            "
                                                            @click="printAbstract(x.id)"
                                                        >
                                                            <i
                                                                class="
                                                                    bx
                                                                    bxs-printer
                                                                    me-1
                                                                "
                                                            ></i
                                                            >Print Abstract
                                                        </button>
                                                        <button
                                                            type="button"
                                                            class="btn btn-info"
                                                            :id="`gpo-popover-${x.id}`"
                                                            @click="openPO(x)"
                                                        >
                                                            <i
                                                                class="
                                                                    bx
                                                                    bxs-printer
                                                                    me-1
                                                                "
                                                            ></i
                                                            >Generate P.O
                                                        </button>
                                                        <b-popover
                                                            :target="`gpo-popover-${x.id}`"
                                                            triggers="click"
                                                            placement="righttop"
                                                            custom-class="popover-supplier"
                                                            :show.sync="
                                                                x.generatePO
                                                            "
                                                        >
                                                            <template
                                                                v-slot:title
                                                            >
                                                                <div
                                                                    class="
                                                                        d-flex
                                                                        align-items-center
                                                                        justify-content-between
                                                                    "
                                                                >
                                                                    <small
                                                                        >P.O
                                                                        Description</small
                                                                    >
                                                                    <span
                                                                        class="
                                                                            bx
                                                                            bx-x
                                                                            font-size-14
                                                                            cursor-pointer
                                                                        "
                                                                        @click="
                                                                            x.generatePO = false
                                                                        "
                                                                    ></span>
                                                                </div>
                                                            </template>
                                                            <textarea
                                                                v-model="
                                                                    po.description
                                                                "
                                                                placeholder="Enter P.O Description"
                                                                rows="5"
                                                                class="
                                                                    form-control
                                                                "
                                                                :class="{
                                                                    'is-invalid':
                                                                        submitted &&
                                                                        $v.po
                                                                            .description
                                                                            .$error,
                                                                }"
                                                            ></textarea>
                                                            <div
                                                                v-if="
                                                                    submitted &&
                                                                    $v.po
                                                                        .description
                                                                        .$error
                                                                "
                                                                class="
                                                                    invalid-feedback
                                                                "
                                                            >
                                                                <span
                                                                    v-if="
                                                                        !$v.po
                                                                            .description
                                                                            .required
                                                                    "
                                                                    >This value
                                                                    is
                                                                    required.</span
                                                                >
                                                            </div>
                                                            <hr />
                                                            <div
                                                                class="
                                                                    text-right
                                                                "
                                                            >
                                                                <button
                                                                    type="button"
                                                                    class="
                                                                        btn
                                                                        btn-info
                                                                        btn-sm
                                                                        me-1
                                                                    "
                                                                    @click="
                                                                        generatePO(
                                                                            x
                                                                        )
                                                                    "
                                                                >
                                                                    <i
                                                                        class="
                                                                            bx
                                                                            bx-save
                                                                            me-1
                                                                        "
                                                                    ></i
                                                                    >Generate
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    class="
                                                                        btn
                                                                        btn-sm
                                                                    "
                                                                    @click="
                                                                        x.generatePO = false
                                                                    "
                                                                >
                                                                    <i
                                                                        class="
                                                                            bx
                                                                            bx-x
                                                                            me-1
                                                                        "
                                                                    ></i
                                                                    >Cancel
                                                                </button>
                                                            </div>
                                                            <div
                                                                v-if="
                                                                    x.generatingPO
                                                                "
                                                            >
                                                                <p
                                                                    class="mb-0"
                                                                    :class="{
                                                                        'text-success':
                                                                            x.itemMsgType ===
                                                                            'success',
                                                                        'text-danger':
                                                                            x.itemMsgType ===
                                                                            'danger',
                                                                    }"
                                                                >
                                                                    {{
                                                                        x.itemMessage
                                                                    }}
                                                                </p>
                                                            </div>
                                                        </b-popover>
                                                    </div>
                                                </b-card-body>
                                            </b-collapse>
                                        </b-card>
                                    </div>
                                </template>
                            </div>
                        </div>
                    </b-tab>
                </b-tabs>
            </b-tab>
        </b-tabs>
        <div class="position-absolute" style="bottom: 100px; right: 100px">
            <div
                class="position-relative"
                v-if="
                    selectedAvailableItems.length > 0 &&
                    !addItem &&
                    tabIndex == 0
                "
            >
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
                    <i class="bx bx-cart font-size-18"></i
                    ><span>Add to Cart</span>
                </button>
                <small
                    class="position-absolute badge bg-danger"
                    style="top: -5px; right: 0; z-index: 10px"
                    >{{ selectedAvailableItems.length }}</small
                >
            </div>
        </div>
        <div
            v-if="selectedRFQ.id"
            class="position-fixed custom-border-2"
            style="top: 125px; right: 0; left: 0; bottom: 60px; z-index: -1"
        >
            <div class="position-relative">
                <span class="bg-secondary badge p-2 font-size-12"
                    >Add More Item for RFQ:<u>
                        {{ selectedRFQ.description }}</u
                    ></span
                >
            </div>
        </div>
        <div
            class="position-absolute"
            style="bottom: 100px; right: 100px"
            v-if="addItem"
        >
            <div class="d-flex">
                <div
                    class="position-relative"
                    v-if="selectedAvailableItems.length > 0"
                >
                    <button
                        class="
                            btn btn-success
                            d-flex
                            align-items-center
                            rounded-pill
                            hover-max-width
                            me-3
                        "
                        type="button"
                        @click="addToRFQ(selectedAvailableItems)"
                    >
                        <i class="bx bx-cart font-size-18"></i
                        ><span>Add to RFQ: {{ selectedRFQ.rfqNumber }}</span>
                    </button>
                    <small
                        class="position-absolute badge bg-danger"
                        style="top: -5px; right: 13px; z-index: 10px"
                        >{{ selectedAvailableItems.length }}</small
                    >
                </div>
                <button type="button" class="btn border" @click="cancelItems()">
                    <i class="bx bx-x me-1"></i>Cancel
                </button>
            </div>
        </div>
        <supplier-rfq ref="supplier" @dropData="dropSuppliers($event)"></supplier-rfq>
        <print-options ref="printOpt"></print-options>
    </Layout>
</template>