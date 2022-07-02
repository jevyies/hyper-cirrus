<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import Swal from "sweetalert2";
import { cloneDeep, groupBy } from "lodash";
import { required } from "vuelidate/lib/validators";
import ApiType from "@/components/modals/api-type.vue";
import { Carousel, Slide } from "vue-carousel";
import ItemList from "@/components/modals/item-list.vue";
import ItemCategory from "@/components/modals/item-category.vue";
import ApiResourceLogs from "@/components/modals/api-resource-logs.vue";
import BackLogModal from "@/components/modals/backlogs.vue";
import Unit from "@/components/modals/unit.vue";
import Multiselect from "vue-multiselect";
import createNumberMask from "text-mask-addons/dist/createNumberMask";
import MaskedInput from "vue-text-mask";
import UploadPopover from "@/components/widgets/upload-popover.vue";
import PrintOptions from "@/components/modals/print-options.vue";

const greaterThanZero = (value) => value.replace(/,/g, "") > 0;
export default {
    page: {
        title: "My OPCRs",
    },
    components: {
        Layout,
        PageHeader,
        ApiType,
        Carousel,
        Slide,
        ItemList,
        ItemCategory,
        Unit,
        Multiselect,
        MaskedInput,
        ApiResourceLogs,
        BackLogModal,
        UploadPopover,
        PrintOptions,
    },
    data() {
        return {
            title: "My OPCR",
            submitted: false,
            items: [
                {
                    text: "Dashboards",
                    href: "/",
                },
                {
                    text: "My OPCRs",
                    active: true,
                },
            ],
            currencyMask: createNumberMask({
                prefix: "",
                allowDecimal: true,
            }),
            targetData: [],
            modalTitle: "",
            totalRows: 1,
            currentPage: 1,
            perPage: 5,
            pageOptions: [5, 10, 25, 50, 100],
            filter: null,
            filterOn: [],
            sortBy: "name",
            sortDesc: false,
            fields: [
                {
                    key: "name",
                    label: "API Name",
                    sortable: true,
                },
                {
                    key: "score",
                    sortable: true,
                    thStyle: { width: "150px" },
                },
                {
                    key: "status",
                    sortable: true,
                    thStyle: { width: "200px" },
                },
                {
                    key: "actions",
                    thStyle: { width: "90px" },
                },
            ],
            form: {
                id: 0,
                name: "",
                description: "",
                isCatchUp: false,
                apiTypeId: "",
                scoreEfficiency: "",
                scoreQuality: "",
                scoreTimeliness: "",
                finalRemarks: "",
                catchUpPlans: "",
                isCompleted: false,
                dateCompleted: "",
            },
            indexSelected: -1,
            tableBusy: false,
            apiType: "",
            cycle: "",
            itemList: [],
            perPageItem: 4,
            currentPageItem: 1,
            filterItem: "",
            loadItems: false,
            selectedItem: 0,
            selectedApi: "",
            selectedApiId: 0,
            budgetItem: "",
            ppmpIndex: -1,
            apiName: "",
            selectedPPMPStatus: "",
            bliExpired: false,
            //budget
            currentPageBudget: 1,
            perPageBudget: 10,
            filterBudget: "",
            budgetData: [],
            budgetBusy: false,
            selectedBudgetAmount: 0,
            item: {
                id: 0,
                itemName: "",
                description: "",
                unitId: "",
                type: "NON-CSE",
                itemCategoryId: "",
                unitCost: "0",
                cseId: 0,
                apiId: 0,
                deliveryUnitBudgetItemId: 0,
                isProcurable: false,
            },

            // resource items
            itemLoading: false,
            resourceItems: [],
            selectedBudget: "",
            selectedBudgetId: 0,
            selectedResourceStatus: "",
            itemIndex: -1,
            editMode: false,
            itemCategory: "",
            unit: "",

            // resource item details
            itemDetails: [],
            itemDetailFields: [
                {
                    key: "month.monthName",
                    label: "Month",
                    variant: "primary",
                },
                {
                    key: "quantity",
                    label: "Qty",
                    variant: "primary",
                    thStyle: { width: "120px" },
                },
                {
                    label: "Total",
                    key: "total",
                    variant: "primary",
                    thStyle: { width: "200px" },
                },
                {
                    key: "actions",
                    variant: "primary",
                    thStyle: { width: "90px" },
                    thClass: "text-center",
                    tdClass: "text-center",
                },
            ],
            detailError: false,
            detail: {
                id: 0,
                monthId: 0,
                quantity: "1",
                totalAmt: '0',
            },
            detailCopy: {
                id: 0,
                monthId: 0,
                quantity: "1",
                totalAmt: '0',
            },
            detailIndex: -1,
            apiIndex: -1,
            months: [],
            selectedFS: "",
            viewMenu: false,
            top: "0px",
            left: "0px",
            viewDetail: false,
            previousWork: {},
            uploadOptions: {
                type: "API",
                placement: "lefttop",
                folder: "Planning",
            },
            subType: "",
            budgetCopy: 0,
        };
    },
    validations: {
        form: {
            name: { required },
            description: { required },
            apiTypeId: { required },
        },
        previousWork: {
            name: { required },
        },
        item: {
            itemName: { required },
            description: { required },
            unitId: { required },
            type: { required },
            itemCategoryId: { required },
            unitCost: { required, greaterThanZero },
        },
        detail: {
            month: { required },
            quantity: { required },
        },
        subType: { required },
    },
    computed: {
        rows() {
            if (this.filter) {
                return this.totalRows;
            }
            return this.targetData.length;
        },
        filteredItems() {
            let data = this.itemList;
            var total = this.currentPageItem * this.perPageItem;
            if (this.filterItem.trim() != "" && this.filterItem) {
                data = data.filter((item) => {
                    return item.indicatorItem.indicatorItemName
                        .toUpperCase()
                        .includes(this.filterItem.toUpperCase());
                });
            }
            data = data.slice(total - this.perPageItem, total);
            return data;
        },
        filteredItemDetails(){
            let data = this.itemDetails
            return data.sort((a, b) => a.monthId - b.monthId)
        },
        rowsItems() {
            if (this.filterItem.trim() != "" && this.filterItem) {
                return this.filteredItems.length;
            } else {
                return this.itemList.length;
            }
        },
        filteredBudget() {
            let data = this.budgetData;
            var total = this.currentPageBudget * this.perPageBudget;
            if (this.filterBudget.trim() != "" && this.filterBudget) {
                data = data.filter((item) => {
                    return item.fsName
                        .toUpperCase()
                        .includes(this.filterBudget.toUpperCase());
                });
            }
            var currentData = data.slice(total - this.perPageBudget, total);
            if (this.currentPageBudget > 1 && currentData.length == 0) {
                total = (this.currentPageBudget - 1) * this.perPageBudget;
                currentData = data.slice(total - this.perPageBudget, total);
            }
            return currentData;
        },
        rowsBudget() {
            if (this.filterBudget.trim() != "" && this.filterBudget) {
                return this.filteredBudget.length;
            } else {
                return this.budgetData.length;
            }
        },
        filteredResourceItems() {
            let data = this.resourceItems;
            var total = this.currentPageItem * this.perPageItem;
            if (this.filterItem.trim() != "" && this.filterItem) {
                data = data.filter((item) => {
                    return item.itemName
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
        rowsResourceItem() {
            if (this.filterItem.trim() != "" && this.filterItem) {
                return this.filteredResourceItems.length;
            } else {
                return this.resourceItems.length;
            }
        },
        totalBudget() {
            var totalBalance = this.selectedBudgetAmount;
            return (totalBalance -= parseFloat(this.getExactAmt(this.detail.totalAmt)));
        },
        quantityTotal() {
            var data = this.itemDetails;
            return data.reduce((pv, cv) => {
                return parseFloat(pv) + parseFloat(cv.quantity);
            }, 0);
        },
        amountTotal() {
            var data = this.itemDetails;
            var sum = data.reduce((pv, cv) => {
                return parseFloat(pv) + parseFloat(cv.totalAmt);
            }, 0);
            return Intl.NumberFormat("ja-JP", {
                currency: "PHP",
                style: "currency",
            }).format(sum);
        },
        detailChecker() {
            return this.itemDetails.length;
        },
    },
    created() {
        this.totalRows = this.items.length;
        this.$store
            .dispatch("month/GetAllMonths")
            .then((res) => {
                this.months = res.data;
            })
            .catch(() => {
                this.showToast("Something went wrong!", "error");
            });
        this.changeCycle(this.$store.state.data.cycle, true);
    },
    methods: {
        totalResourceItemAmt() {
            var data = this.resourceItems;
            var sum = 0;
            data.forEach((item) => {
                sum += parseFloat(item.total);
            });
            return Intl.NumberFormat("ja-JP", {
                currency: "PHP",
                style: "currency",
            }).format(sum);
        },
        onFiltered(filteredItems) {
            this.totalRows = filteredItems.length;
            this.currentPage = 1;
        },
        addApi() {
            this.onReset();
            this.modalTitle = "Create New API";
            this.$bvModal.show("modal-standard");
        },
        onCreate() {
            this.submitted = true;
            this.$v.form.$touch();
            if (this.$v.form.$invalid) {
                return;
            }
            if (this.form.isCatchUp) {
                this.$v.previousWork.$touch();
                if (this.$v.previousWork.$invalid) {
                    return;
                }
            } else {
                this.$v.previousWork.$reset();
            }
            var data = cloneDeep(this.form);
            data.dateCompleted = data.isCompleted
                ? this.getDate(this.form.dateCompleted)
                : this.getDate(new Date());
            data.targetId = this.selectedItem;
            if (this.form.id > 0) {
                this.$store
                    .dispatch("api/UpdateApi", data)
                    .then((res) => {
                        this.targetData.splice(this.indexSelected, 1, res.data);
                        this.$bvModal.hide("modal-standard");
                        this.showToast("Successfully updated!", "success");
                    })
                    .catch(() => {
                        this.showToast("Something went wrong!", "error");
                    });
            } else {
                this.$store
                    .dispatch("api/CreateApi", data)
                    .then((res) => {
                        this.targetData.push(res.data);
                        this.$bvModal.hide("modal-standard");
                        this.showToast("Successfully created!", "success");
                    })
                    .catch(() => {
                        this.showToast("Something went wrong!", "error");
                    });
            }
            this.submitted = false;
        },
        onReset() {
            this.form = {
                id: 0,
                name: "",
                description: "",
                isCatchUp: false,
                apiTypeId: "",
                catchUpPlans: "",
                finalRemarks: "",
            };
            this.apiType = "";
            this.$v.form.$reset();
            this.$v.previousWork.$reset();
        },
        hideModal() {
            this.$bvModal.hide("modal-standard");
        },
        updateItem(props) {
            this.form = cloneDeep(props.item);
            this.form.dateCompleted = new Date(props.item.dateCompleted);
            this.apiType = props.item.apiType.type;
            this.indexSelected = this.targetData.indexOf(props.item);
            this.$v.form.$reset();
            this.$v.previousWork.$reset();
            this.modalTitle = "Update Api";
            this.$bvModal.show("modal-standard");
        },
        deleteItem(props) {
            var index = this.targetData.indexOf(props.item);
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
                        .dispatch("api/DeleteApi", props.item.id)
                        .then((res) => {
                            if (res.status == 204) {
                                this.targetData.splice(index, 1);
                                this.showToast(
                                    "Successfully deleted!",
                                    "success"
                                );
                            }
                        })
                        .catch(() => {
                            this.showToast("Cannot be deleted!", "error");
                        });
                }
            });
        },
        postPPMP(row) {
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
                    this.pageLoader(true);
                    const resItem = await this.$store.dispatch(
                        "apiresource/GetAllResourceByAPI",
                        row.id
                    );
                    this.pageLoader(false);
                    if (resItem.data.error) {
                        return this.showToast(
                            resItem.data.errorMessage,
                            "warning"
                        );
                    }
                    if (resItem.data.length == 0) {
                        return this.showToast(
                            "Please add resource before posting",
                            "warning"
                        );
                    }
                    this.$store
                        .dispatch("api/PostApi", row.id)
                        .then((res) => {
                            if (res.data.error) {
                                return this.showToast(
                                    res.data.errorMessage,
                                    "warning"
                                );
                            }
                            row.status = "Posted";
                            this.showToast("Successfully posted!", "success");
                        })
                        .catch((err) => {
                            this.showToast("Something went wrong!", "error");
                        });
                }
            });
        },
        postWork() {
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
                    this.pageLoader(true);
                    const resItem = await this.$store.dispatch(
                        "apiresource/GetAllResourceByAPI",
                        this.selectedApiId
                    );
                    this.pageLoader(false);
                    if (resItem.data.error) {
                        return this.showToast(
                            resItem.data.errorMessage,
                            "warning"
                        );
                    }
                    if (resItem.data.length == 0) {
                        return this.showToast(
                            "Please add resource before posting",
                            "warning"
                        );
                    }
                    this.$store
                        .dispatch("api/PostApi", this.selectedApiId)
                        .then((res) => {
                            if (res.data.error) {
                                return this.showToast(
                                    res.data.errorMessage,
                                    "warning"
                                );
                            }
                            this.selectedPPMPStatus = "POSTED";
                            this.targetData[this.apiIndex].status = "Posted";
                            this.showToast("Successfully posted!", "success");
                            this.$refs.carousel.goToPage(0);
                        })
                        .catch((err) => {
                            this.showToast("Something went wrong!", "error");
                        });
                }
            });
        },
        getApiType() {
            this.$bvModal.show("api-type-modal");
        },
        dropType(data) {
            this.apiType = data.type;
            this.form.apiTypeId = data.id;
        },
        changeCycle(cycle, created = false) {
            if(!created){
                this.$refs.carousel.goToPage(0);
            }
            this.selectedItem = 0;
            this.targetData = [];
            this.itemList = [];
            this.loadItems = true;
            this.apiName = "";
            this.$store
                .dispatch("target/GetMyTarget", cycle)
                .then((res) => {
                    this.loadItems = false;
                    res.data.forEach((item) => {
                        item.actualQ1 = item.actual ? item.actual[0].q1 : "0";
                        item.actualQ2 = item.actual ? item.actual[0].q2 : "0";
                        item.actualQ3 = item.actual ? item.actual[0].q3 : "0";
                        item.actualQ4 = item.actual ? item.actual[0].q4 : "0";
                    });
                    res.data.sort((a, b) => b.id - a.id);
                    this.itemList = res.data;
                })
                .catch(() => {
                    this.loadItems = false;
                    this.showToast("Getting Target went wrong!", "error");
                });
        },
        selectIndicatorItem(row) {
            if (this.selectedItem == row.id) return;
            this.selectedItem = row.id;
            this.apiName = row.indicatorItem.indicatorItemName;
            this.tableBusy = true;
            this.$store
                .dispatch("api/GetApiByTarget", row.id)
                .then((res) => {
                    this.tableBusy = false;
                    if (res.data) {
                        res.data.forEach((item) => {
                            item.showAttachments = false;
                            item.attachmentLoading = false;
                            item.addDocu = false;
                            item.fileSearch = "";
                            item.attachments = [];
                        });
                        console.log(res.data)
                        this.targetData = res.data;
                    } else {
                        this.targetData = [];
                    }
                })
                .catch(() => {
                    this.tableBusy = false;
                    this.showToast("Something went wrong!", "error");
                });
        },
        goToPPMP(row) {
            this.selectedApi = row.name;
            this.selectedApiId = row.id;
            this.selectedPPMPStatus = row.status.toUpperCase();
            this.apiIndex = this.targetData.indexOf(row);
            this.title = "Office Budget Line Items";
            this.$refs.carousel.goToPage(this.$refs.carousel.getNextPage());
            this.scrollToTop();
            this.getAllBudgets(row.id);
        },
        getAllBudgets(id) {
            this.budgetData = [];
            this.budgetBusy = true;
            this.$store
                .dispatch("api/GetApiOfficeBudgetItem", id)
                .then((res) => {
                    res.data.forEach((item) => {
                        var date1 = new Date();
                        var date2 = new Date(item.expiry);
                        var diffTime = date2 - date1;
                        var diffDays = Math.ceil(
                            diffTime / (1000 * 60 * 60 * 24)
                        );
                        item.expired = diffDays <= 0 ? true : false;
                        item.fundClass =
                            item.objectOfExpenditure.account.accountGroup.fundClassification.classification;
                        item.fundSource =
                            item.objectOfExpenditure.fundSource.sourceName;
                        item.accountGroup =
                            item.objectOfExpenditure.account.accountGroup.groupName;
                    });
                    var groupedFS = groupBy(res.data, "fundSource");
                    var grouped = [];
                    var id = 1;
                    var FCID = 1;
                    var AGID = 1;
                    for (const key in groupedFS) {
                        var sumBalance = 0;
                        var sumAllocated = 0;
                        groupedFS[key].forEach((a) => {
                            sumBalance += a.balance;
                            sumAllocated += a.allocated;
                        });
                        var group = groupBy(groupedFS[key], "fundClass");
                        var FC = [];
                        for (const y in group) {
                            var agGrp = groupBy(group[y], "accountGroup");
                            var ag = [];
                            for (const z in agGrp) {
                                ag.push({
                                    id: AGID++,
                                    data: agGrp[z],
                                    key: z,
                                });
                            }
                            FC.push({
                                id: FCID++,
                                data: ag,
                                key: y,
                            });
                        }
                        grouped.push({
                            id: id++,
                            fsName: key,
                            data: FC,
                            balance: sumBalance,
                            allocated: sumAllocated,
                            showData: false,
                        });
                    }
                    this.budgetData = grouped;
                    this.budgetBusy = false;
                })
                .catch((err) => {
                    this.budgetBusy = false;
                    this.showToast("Something went wrong!", "error");
                });
        },
        returnToApi() {
            this.title = "My OPCR";
            this.$refs.carousel.goToPage(this.$refs.carousel.getPreviousPage());
        },
        viewItems(row) {
            this.bliExpired = row.expired;
            this.selectedBudget = row.objectOfExpenditure.account.accountName;
            this.selectedFS = row.fundSource;
            this.selectedBudgetId = row.id;
            this.selectedBudgetAmount = row.balance;
            this.selectedResourceStatus = row.status;
            this.budgetIndex = this.budgetData.indexOf(row);
            this.title = "Resource Item Details";
            this.$refs.carousel.goToPage(this.$refs.carousel.getNextPage());
            this.budgetCopy = this.totalBudget;
            this.scrollToTop();
            this.getResourceDetails(row.id);
        },
        getResourceDetails(id) {
            this.resourceItems = []
            this.itemLoading = true;
            this.$store
                .dispatch("apiresource/GetResourceItemByAPI", {
                    apiId: this.selectedApiId,
                    bli: id,
                })
                .then((res) => {
                    this.resourceItems = res.data;
                    this.itemLoading = false;
                })
                .catch(() => {
                    this.itemLoading = false;
                    this.showToast("Something went wrong!", "error");
                });
        },
        addNewItem() {
            this.onResetResourceItem();
            this.selectedBudgetAmount = cloneDeep(
                this.budgetData[this.budgetIndex].balance
            );
            this.detailError = false;
            this.modalTitle = "Create New Resource Item";
            this.$bvModal.show("create-item-modal");
        },
        onResetResourceItem() {
            this.item = {
                id: 0,
                itemName: "",
                description: "",
                unitId: "",
                type: "NON-CSE",
                itemCategoryId: "",
                unitCost: "0",
                cseId: 0,
                apiId: 0,
                deliveryUnitBudgetItemId: 0,
                isProcurable: false,
                subType: "",
            };
            this.subType = "";
            this.$v.item.$reset();
            this.$v.subType.$reset();
            this.selectedBudgetAmount += this.itemDetails.reduce((pv, cv) => {
                return parseFloat(pv) + parseFloat(cv.totalAmt);
            }, 0);
            this.itemDetails = [];
            this.itemDetailCopy = [];
            this.unit = "";
            this.itemCategory = "";
            this.$v.item.$reset();
            this.onResetDetail();
        },
        onResetDetail() {
            if (this.editMode) {
                this.selectedBudgetAmount -= parseFloat(this.getExactAmt(this.detailCopy.totalAmt));
            }
            this.detail = {
                id: 0,
                monthId: 0,
                quantity: "1",
                totalAmt: '0',
            };
            this.$v.detail.$reset();
            this.detailIndex = -1;
            this.editMode = false;
        },
        hideModalDetail() {
            this.$bvModal.hide("create-item-modal");
        },
        selectMonth(data) {
            this.detail.monthId = data.id;
            this.calculateTotal();
        },
        getItems() {
            this.$bvModal.show("item-list-modal");
        },
        dropItem(data) {
            this.item = cloneDeep(data);
            if (data.inDbm) {
                this.item.type = "CSE";
            } else {
                this.item.type = "NON-CSE";
            }
            this.item.cseId = data.id;
            this.item.id = 0;
            this.item.unitCost = this.numberWithCommas(data.unitCost);
            this.unit = data.unit.shortName;
            this.itemCategory = data.itemCategory.name;
            this.calculateTotal();
            this.calculateAll(this.item.unitCost)
        },
        getUnit() {
            this.$refs.unit.getData();
            this.$bvModal.show("unit-modal");
        },
        dropUnit(data) {
            this.unit = data.shortName;
            this.item.unitId = data.id;
        },
        getItemCategory() {
            this.$bvModal.show("item-category-modal");
        },
        dropItemCat(data) {
            this.itemCategory = data.name;
            this.item.itemCategoryId = data.id;
        },
        onSubmitResourceItem() {
            this.detailError = false;
            this.submitted = true;
            this.$v.item.$touch();
            if (this.$v.item.$invalid) {
                return;
            }
            if (this.item.isProcurable) {
                this.$v.subType.$touch();
                if (this.$v.subType.$invalid) {
                    return;
                }
                this.item.subType = cloneDeep(this.subType);
            } else {
                this.item.subType = "";
            }
            if (this.detailChecker == 0) {
                return (this.detailError = true);
            }
            if(this.totalBudget < 0){
                return;
            }
            this.pageLoader(true);
            var data = cloneDeep(this.item);
            if (this.item.id > 0) {
                this.$store
                    .dispatch("apiresource/UpdatePPMPItem", data)
                    .then((res) => {
                        if (res.data.error) {
                            this.pageLoader(false);
                            return this.showToast(
                                res.data.errorMessage,
                                "error"
                            );
                        }
                        this.budgetCopy = this.totalBudget;
                        this.resourceItems.splice(this.itemIndex, 1, res.data);
                        this.submitDetails(res.data.id, 1);
                    })
                    .catch(() => {
                        this.showToast("Something went wrong!", "error");
                        this.submitted = false;
                        this.pageLoader(false);
                    });
            } else {
                data.apiId = this.selectedApiId;
                data.deliveryUnitBudgetItemId = this.selectedBudgetId;
                this.$store
                    .dispatch("apiresource/CreatePPMPItem", data)
                    .then((res) => {
                        if (res.data.error) {
                            this.pageLoader(false);
                            return this.showToast(
                                res.data.errorMessage,
                                "error"
                            );
                        }
                        this.budgetCopy = this.totalBudget;
                        this.resourceItems.push(res.data);
                        this.submitDetails(res.data.id, 0);
                    })
                    .catch((e) => {
                        this.showToast("Something went wrong!", "error");
                        this.submitted = false;
                        this.pageLoader(false);
                    });
            }
        },
        async submitDetails(id, opt) {
            var sum = 0;
            for await (const item of this.itemDetails) {
                sum += parseFloat(item.totalAmt);
                item.apiResourceId = id;
                if (item.id > 0) {
                    this.$store.dispatch(
                        "apiresourcedetail/UpdateApiResourceDetail",
                        item
                    );
                } else {
                    this.$store.dispatch(
                        "apiresourcedetail/CreateApiResourceDetail",
                        item
                    );
                }
            }
            this.$bvModal.hide("create-item-modal");
            if (opt == 1) {
                this.showToast("Successfully updated!", "success");
            } else {
                this.$bvModal.hide("create-item-modal");
                this.showToast("Successfully created!", "success");
            }
            this.selectedBudgetAmount = cloneDeep(this.totalBudget);
            this.resourceItems.find((e) => e.id === id).total = sum;
            this.budgetData[this.budgetIndex].balance = cloneDeep(
                this.totalBudget
            );
            this.submitted = false;
            this.pageLoader(false);
        },
        calculateTotal() {
            let unitCost = this.item.unitCost ? this.getExactAmt(this.item.unitCost) : 0;
            let quantity = this.detail.quantity ? this.getExactAmt(this.detail.quantity) : 0;
            let totalAmt = parseFloat(unitCost) *
                parseFloat(quantity);
            this.detail.totalAmt = this.numberWithCommas(totalAmt)
        },
        calculateAll($event) {
            let amount = $event ? this.getExactAmt($event) : 0;
            this.onResetDetail();
            var sum = this.itemDetails.reduce((pv, cv) => {
                return parseFloat(pv) + parseFloat(cv.totalAmt);
            }, 0);
            this.selectedBudgetAmount += sum;
            var data = this.itemDetails;
            var newSum = 0;
            data.forEach((item) => {
                item.totalAmt =
                    parseFloat(amount) *
                    parseFloat(item.quantity);
                item.total = Intl.NumberFormat("ja-JP", {
                    currency: "PHP",
                    style: "currency",
                }).format(item.totalAmt);
                newSum += item.totalAmt;
            });
            this.selectedBudgetAmount -= newSum;
        },
        onSubmitItemDetail() {
            if (this.selectedPPMPStatus === "POSTED") {
                return this.showToast(
                    "Already Posted! Contact Procurement for more info",
                    "warning"
                );
            }
            if (this.selectedPPMPStatus === "APPROVED") {
                return this.showToast(
                    "Already Approved! Contact Procurement for more info",
                    "warning"
                );
            }
            this.$v.item.$touch();
            if (this.$v.item.$invalid) {
                return;
            }
            this.$v.detail.$touch();
            if (this.$v.detail.$invalid) {
                return;
            }
            if(this.totalBudget < 0){
                return;
            }
            var data = cloneDeep(this.detail);
            data.totalAmt = this.getExactAmt(this.detail.totalAmt)
            data.total = Intl.NumberFormat("ja-JP", {
                currency: "PHP",
                style: "currency",
            }).format(data.totalAmt);
            if (this.detailIndex > -1) {
                this.editMode = false;
                this.selectedBudgetAmount -= data.totalAmt;
                this.itemDetails.splice(this.detailIndex, 1, data);
            } else {
                var exist = this.itemDetails.find(
                    (x) => x.month.id == data.month.id
                );
                this.selectedBudgetAmount -= data.totalAmt;
                if (!exist) {
                    this.itemDetails.push(data);
                } else {
                    var index = this.itemDetails.indexOf(exist);
                    var totalAmt =
                        parseFloat(data.totalAmt) +
                        parseFloat(this.itemDetails[index].totalAmt);
                    this.itemDetails[index].totalAmt = totalAmt;
                    var totalQty =
                        parseFloat(data.quantity) +
                        parseFloat(this.itemDetails[index].quantity);
                    this.itemDetails[index].quantity = totalQty;
                    this.itemDetails[index].total = Intl.NumberFormat("ja-JP", {
                        currency: "PHP",
                        style: "currency",
                    }).format(totalAmt);
                }
            }
            this.onResetDetail();
        },
        returnToBudget() {
            this.title = "Resources For:";
            this.$refs.carousel.goToPage(this.$refs.carousel.getPreviousPage());
        },
        deleteResourceItem(props) {
            var index = this.resourceItems.indexOf(props);
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
                        .dispatch("apiresource/DeletePPMPItem", props.id)
                        .then((res) => {
                            if (res.status == 204) {
                                this.resourceItems.splice(index, 1);
                                this.selectedBudgetAmount += props.total;
                                this.budgetData[this.budgetIndex].balance =
                                    cloneDeep(this.selectedBudgetAmount);
                                this.showToast(
                                    "Successfully deleted!",
                                    "success"
                                );
                            }
                        })
                        .catch((err) => {
                            this.showToast("Cannot be deleted!", "error");
                        });
                }
            });
        },
        viewItemLogs({ id }) {
            this.$refs.itemlog.getData(id);
            this.$bvModal.show("api-resoure-log-modal");
        },
        resubmitItem(x) {
            this.$store
                .dispatch("apiresource/ResubmitPPMPItem", x.id)
                .then((res) => {
                    if (res.data.error) {
                        return this.showToast(res.data.errorMessage, "error");
                    }
                    x.technicalReviewStatus = "PENDING";
                    this.budgetData[this.budgetIndex].notification--;
                    this.targetData[this.apiIndex].notification--;
                    this.showToast("Successfully resubmitted!", "success");
                })
                .catch((err) => {
                    this.showToast("Something went wrong!", "error");
                });
        },
        updateResourceItem(props, type = "edit") {
            if (type === "view") {
                this.viewDetail = true;
            } else {
                this.viewDetail = false;
            }
            this.item = cloneDeep(props);
            this.item.unitCost = this.numberWithCommas(props.unitCost);
            this.unit = props.unit.shortName;
            this.itemCategory = props.itemCategory.name;
            this.itemIndex = this.resourceItems.indexOf(props);
            this.selectedBudgetAmount = cloneDeep(
                this.budgetData[this.budgetIndex].balance
            );
            this.modalTitle = "Update Resource Item";
            this.$bvModal.show("create-item-modal");
            this.getItemDetails(props.id);
        },
        getItemDetails(id) {
            this.$store
                .dispatch(
                    "apiresourcedetail/GetApiResourceDetailByApiResource",
                    id
                )
                .then((res) => {
                    res.data.forEach((item) => {
                        item.totalAmt =
                            parseFloat(item.quantity) *
                            parseFloat(this.getExactAmt(this.item.unitCost));
                        item.total = Intl.NumberFormat("ja-JP", {
                            currency: "PHP",
                            style: "currency",
                        }).format(item.totalAmt);
                    });
                    this.itemDetailCopy = cloneDeep(res.data);
                    this.itemDetails = res.data;
                })
                .catch(() => {
                    this.showToast("Something went wrong!", "error");
                });
        },
        updateItemDetail(row) {
            this.selectedBudgetAmount += parseFloat(row.item.totalAmt);
            this.editMode = true;
            this.detailCopy = cloneDeep(row.item);
            this.detail = cloneDeep(row.item);
            this.detail.quantity = row.item.quantity.toString();
            this.detail.totalAmt = this.numberWithCommas(row.item.totalAmt);
            this.detailCopy.quantity = row.item.quantity.toString();
            this.detailCopy.totalAmt = this.numberWithCommas(row.item.totalAmt);
            this.detailIndex = this.itemDetails.indexOf(row.item);
        },
        deleteItemDetail(row) {
            var index = this.itemDetails.indexOf(row.item);
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
                    if (row.item.id > 0) {
                        this.$store
                            .dispatch(
                                "apiresourcedetail/DeleteApiResourceDetail",
                                row.item.id
                            )
                            .then((res) => {
                                if (res.data.error) {
                                    return this.showToast(
                                        res.data.errorMessage,
                                        "error"
                                    );
                                }
                                if (res.status == 204) {
                                    this.selectedBudgetAmount +=
                                        parseFloat(row.item.totalAmt);
                                    this.itemDetails.splice(index, 1);
                                    let copy = this.itemDetailCopy.find(x => x.id == row.item.id);
                                    if(copy){
                                        this.resourceItems[this.itemIndex].total -=
                                            parseFloat(copy.totalAmt);
                                    }
                                    this.budgetData[this.budgetIndex].balance =
                                        cloneDeep(this.selectedBudgetAmount);
                                    this.showToast(
                                        "Successfully deleted!",
                                        "success"
                                    );
                                }
                            })
                            .catch(() => {
                                this.showToast("Cannot be deleted!", "error");
                            });
                    } else {
                        this.selectedBudgetAmount += parseFloat(row.item.totalAmt);
                        this.itemDetails.splice(index, 1);
                        this.showToast("Successfully deleted!","success");
                    }
                }
            });
        },
        getWork() {
            this.$refs.backlog.getData();
            this.$bvModal.show("backlog-modal");
        },
        dropWork(data) {
            this.previousWork = cloneDeep(data);
            this.form.apiId = data.id;
        },
        showDtls(row) {
            if (row.item.showAttachments) {
                row.item.showAttachments = !row.item.showAttachments;
                setTimeout(() => {
                    row.toggleDetails();
                }, 600);
            } else {
                this.getAttachments(row.item);
                row.toggleDetails();
                setTimeout(() => {
                    row.item.showAttachments = !row.item.showAttachments;
                }, 50);
            }
        },
        getAttachments(row) {
            row.attachmentLoading = true;
            row.attachments = [];
            this.$store
                .dispatch("filemanager/GetFiles", {
                    id: row.id,
                    type: this.uploadOptions.type,
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
        },
        removeFile(id, parentId) {
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
                        .dispatch("filemanager/DeleteFile", id)
                        .then((res) => {
                            if (res.data.error) {
                                return this.showToast(
                                    res.data.errorMessage,
                                    "error"
                                );
                            }
                            let index = this.targetData.findIndex(
                                (item) => item.id == parentId
                            );
                            let yIndex = this.targetData[
                                index
                            ].attachments.findIndex((item) => item.id == id);
                            this.targetData[index].attachments.splice(
                                yIndex,
                                1
                            );
                            this.showToast("Successfully removed!", "success");
                        })
                        .catch(() => {
                            this.showToast("Cannot be removed!", "error");
                        });
                }
            });
        },
        uploadedDocument(response, id) {
            let index = this.targetData.findIndex((item) => item.id == id);
            this.targetData[index].attachments.push(response);
        },
        openDocument(x) {
            window.open(
                `${this.$store.state.data.rootFileDirectory}${x.folder}/${x.fileName}`
            );
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
        async printPPMP() {
            this.$refs.printOpt.putOptions({
                apiUrl: "api/Api/Print/My/PPMP",
                routeVariables: [this.$store.state.data.cycle],
            });
            this.$bvModal.show("print-options-modal");
        },
    },
};
</script>

<template>
    <Layout @changeCycle="changeCycle">
        <PageHeader :title="title" :items="items" />
        <b-modal
            id="create-item-modal"
            :title="modalTitle"
            size="lg"
            title-class="font-18"
            hide-footer
            no-close-on-backdrop
        >
            <div class="d-flex justify-content-between mb-1" v-if="!viewDetail" :class="{'align-items-center': selectedBudget.length <= 60}">
                <div class="d-flex" :class="{'flex-column me-2': selectedBudget.length > 60}">
                    <span class="bg-secondary text-white px-2 py-1 no-wrap w-content" :class="{'me-2': selectedBudget.length <= 60, 'mb-2': selectedBudget.length > 60 }">{{
                        selectedFS
                    }}</span>
                    <span class="bg-purple text-white  px-2 py-1  no-wrap w-content">{{
                        selectedBudget
                    }}</span>
                </div>
                <h4 class="mb-0" :class="{'text-danger': totalBudget < 0}">
                    Balance:
                    <span class="text-muted">{{
                        new Intl.NumberFormat("ja-JP", {
                            currency: "PHP",
                            style: "currency",
                        }).format(totalBudget)
                    }}</span>
                </h4>
            </div>
            <div class="mb-2">
                <label for="itemName" class="mb-0">Item Name</label>
                <b-input-group>
                    <template #append>
                        <b-button
                            @click="getItems"
                            variant="outline-info"
                            v-if="!viewDetail"
                            ><i
                                class="mdi mdi-clipboard-text-search-outline"
                            ></i
                        ></b-button>
                        <b-button
                            @click="onResetResourceItem"
                            variant="outline-danger"
                            v-if="!viewDetail"
                            ><i class="bx bx-x"></i
                        ></b-button>
                    </template>
                    <input
                        autocomplete="off"
                        type="text"
                        placeholder="Input/Search Item..."
                        class="form-control"
                        :class="{
                            'is-invalid': $v.item.itemName.$error,
                        }"
                        v-model="item.itemName"
                        :disabled="item.cseId > 0 || viewDetail"
                    />
                </b-input-group>
                <div v-if="$v.item.itemName.$error" class="invalid-feedback">
                    <span v-if="!$v.item.itemName.required"
                        >This value is required.</span
                    >
                </div>
            </div>
            <b-row class="mb-2">
                <b-col sm="6">
                    <label for="description" class="mb-0">Description </label>
                    <textarea
                        autocomplete="off"
                        id="name"
                        rows="6"
                        v-model="item.description"
                        placeholder="Enter Description..."
                        class="form-control"
                        :class="{
                            'is-invalid': $v.item.description.$error,
                        }"
                        :disabled="item.cseId > 0 || viewDetail"
                    ></textarea>
                    <div
                        v-if="$v.item.description.$error"
                        class="invalid-feedback"
                    >
                        <span v-if="!$v.item.description.required"
                            >This value is required.</span
                        >
                    </div>
                    <div class="mt-2 mb-2">
                        <div class="d-flex align-items-center">
                            <div class="w-50">
                                <input
                                    autocomplete="off"
                                    class="form-check-input"
                                    type="checkbox"
                                    id="isProcurable"
                                    v-model="item.isProcurable"
                                    :disabled="item.cseId > 0 || viewDetail"
                                />&nbsp;&nbsp;
                                <label
                                    class="form-check-label"
                                    for="isProcurable"
                                    >Is Procurable?</label
                                >
                            </div>
                            <div v-if="item.isProcurable" class="w-50">
                                <select
                                    class="form-select form-select-sm"
                                    id="subType"
                                    v-model="subType"
                                    placeholder="Select Sub Type..."
                                    :class="{
                                        'is-invalid':
                                            submitted && $v.subType.$error,
                                    }"
                                >
                                    <option value="">Select Sub-Type</option>
                                    <option value="Goods">Goods</option>
                                    <option value="Services">Services</option>
                                </select>
                                <div
                                    v-if="submitted && $v.subType.$error"
                                    class="invalid-feedback"
                                >
                                    <span v-if="!$v.subType.required"
                                        >This value is required.</span
                                    >
                                </div>
                            </div>
                        </div>
                    </div>
                </b-col>
                <b-col sm="6">
                    <b-row class="mb-2">
                        <b-col sm="6">
                            <label for="name" class="mb-0">Type </label>
                            <input
                                autocomplete="off"
                                id="type"
                                type="text"
                                v-model="item.type"
                                placeholder="Enter Type..."
                                class="form-control"
                                :class="{
                                    'is-invalid': $v.item.type.$error,
                                }"
                                disabled
                            />
                            <div
                                v-if="$v.item.type.$error"
                                class="invalid-feedback"
                            >
                                <span v-if="!$v.item.type.required"
                                    >This value is required.</span
                                >
                            </div>
                        </b-col>
                        <b-col sm="6">
                            <label for="unitId" class="mb-0">Unit </label>
                            <b-input-group>
                                <template #append>
                                    <b-button
                                        @click="getUnit"
                                        variant="outline-info"
                                        :disabled="item.cseId > 0"
                                        v-if="!viewDetail"
                                        ><i
                                            class="
                                                mdi
                                                mdi-clipboard-text-search-outline
                                            "
                                        ></i
                                    ></b-button>
                                </template>
                                <input
                                    autocomplete="off"
                                    type="text"
                                    disabled
                                    placeholder="Search Unit..."
                                    class="form-control"
                                    :class="{
                                        'is-invalid': $v.item.unitId.$error,
                                    }"
                                    v-model="unit"
                                />
                            </b-input-group>
                            <div
                                v-if="$v.item.unitId.$error"
                                class="invalid-feedback"
                            >
                                <span v-if="!$v.item.unitId.required"
                                    >This value is required.</span
                                >
                            </div>
                        </b-col>
                    </b-row>
                    <b-row class="mb-2">
                        <b-col sm="12">
                            <label for="itemCategoryId" class="mb-0"
                                >Item Category
                            </label>
                            <b-input-group>
                                <template #append>
                                    <b-button
                                        @click="getItemCategory"
                                        variant="outline-info"
                                        :disabled="item.cseId > 0"
                                        v-if="!viewDetail"
                                        ><i
                                            class="
                                                mdi
                                                mdi-clipboard-text-search-outline
                                            "
                                        ></i
                                    ></b-button>
                                </template>
                                <input
                                    autocomplete="off"
                                    type="text"
                                    disabled
                                    placeholder="Search Item Category..."
                                    class="form-control"
                                    :class="{
                                        'is-invalid':
                                            $v.item.itemCategoryId.$error,
                                    }"
                                    v-model="itemCategory"
                                />
                            </b-input-group>
                            <div
                                v-if="$v.item.itemCategoryId.$error"
                                class="invalid-feedback"
                            >
                                <span v-if="!$v.item.itemCategoryId.required"
                                    >This value is required.</span
                                >
                            </div>
                        </b-col>
                    </b-row>
                    <b-row>
                        <b-col sm="12">
                            <label for="unitId" class="mb-0">Unit Cost</label>
                            <masked-input
                                autocomplete="off"
                                id="unitId"
                                type="text"
                                v-model="item.unitCost"
                                class="form-control text-right"
                                :class="{
                                    'is-invalid': $v.item.unitCost.$error,
                                }"
                                @input="calculateAll($event)"
                                :mask="currencyMask"
                                :disabled="viewDetail"
                            ></masked-input>
                            <div
                                v-if="$v.item.unitCost.$error"
                                class="invalid-feedback"
                            >
                                <span v-if="!$v.item.unitCost.required"
                                    >This value is required.</span
                                >
                                <span v-if="!$v.item.unitCost.greaterThanZero"
                                    >This value must be greater than zero.</span
                                >
                            </div>
                        </b-col>
                    </b-row>
                </b-col>
            </b-row>
            <div
                class="p-2 border border-primary"
                :class="{ 'border-danger': detailChecker == 0 && detailError || totalBudget < 0 }"
            >
                <form
                    @submit.prevent="onSubmitItemDetail"
                    class="needs-validation"
                    ref="fcForm"
                    v-if="!viewDetail"
                >
                    <b-row>
                        <b-col sm="4">
                            <label for="monthId" class="mb-0">Month </label>
                            <multiselect
                                v-model="detail.month"
                                :options="months"
                                label="monthName"
                                @select="selectMonth"
                                track-by="id"
                                value="id"
                                deselect-label=""
                                select-label=""
                                :allow-empty="false"
                                :class="{
                                    'is-invalid': $v.detail.month.$error,
                                }"
                            />
                            <div
                                v-if="$v.detail.month.$error"
                                class="invalid-feedback"
                            >
                                <span v-if="!$v.detail.month.required"
                                    >This value is required.</span
                                >
                            </div>
                        </b-col>
                        <b-col sm="2">
                            <label for="qty" class="mb-0">Qty </label>
                            <masked-input
                                autocomplete="off"
                                id="qty"
                                type="text"
                                v-model="detail.quantity"
                                class="form-control text-right"
                                :class="{
                                    'is-invalid': $v.detail.quantity.$error,
                                }"
                                @input="calculateTotal()"
                                :mask="currencyMask"
                            ></masked-input>
                            <div
                                v-if="$v.detail.quantity.$error"
                                class="invalid-feedback"
                            >
                                <span v-if="!$v.detail.quantity.required"
                                    >This value is required.</span
                                >
                            </div>
                        </b-col>
                        <b-col sm="6">
                            <label for="total" class="mb-0">Total </label>
                            <div class="d-flex align-items-baseline">
                                <div class="w-75 me-2">
                                    <masked-input
                                        autocomplete="off"
                                        id="total"
                                        type="text"
                                        v-model="detail.totalAmt"
                                        disabled
                                        class="form-control text-right"
                                        :mask="currencyMask"
                                    ></masked-input>
                                </div>
                                <div>
                                    <button
                                        type="submit"
                                        class="btn btn-primary me-1"
                                    >
                                        <i class="bx bx-check"></i>
                                    </button>
                                    <button
                                        type="button"
                                        class="btn btn-light"
                                        @click="onResetDetail"
                                    >
                                        <i class="bx bx-x"></i>
                                    </button>
                                </div>
                            </div>
                        </b-col>
                    </b-row>
                </form>
                <b-row class="mt-2">
                    <b-col sm="12">
                        <b-table
                            striped
                            hover
                            :items="filteredItemDetails"
                            :fields="itemDetailFields"
                            show-empty
                        >
                            <template #empty="scope">
                                <div class="text-center">
                                    {{ scope.emptyText }}
                                </div>
                            </template>
                            <template #cell(actions)="row">
                                <b-dropdown
                                    class="card-drop"
                                    variant="dark"
                                    right
                                    toggle-class="p-0"
                                    v-if="!viewDetail"
                                >
                                    <template v-slot:button-content>
                                        <i
                                            class="mdi mdi-dots-horizontal fs-5"
                                        ></i>
                                    </template>
                                    <b-dropdown-item
                                        @click="updateItemDetail(row)"
                                        variant="dark"
                                        ><i
                                            class="bx bx-edit font-size-18 me-1"
                                        ></i
                                        >Edit</b-dropdown-item
                                    >
                                    <b-dropdown-item
                                        @click="deleteItemDetail(row)"
                                        variant="danger"
                                        ><i
                                            class="
                                                mdi mdi-trash-can
                                                font-size-18
                                                me-1
                                            "
                                        ></i
                                        >Delete</b-dropdown-item
                                    >
                                </b-dropdown>
                            </template>
                            <template #custom-foot>
                                <b-tr :class="{'border-danger': totalBudget < 0}">
                                    <b-th>Total</b-th>
                                    <b-th>{{ quantityTotal }}</b-th>
                                    <b-th>{{ amountTotal }}</b-th>
                                    <b-th>
                                    </b-th>
                                </b-tr>
                                <b-tr v-if="totalBudget < 0">
                                    <b-th colspan="2"></b-th>
                                    <b-th colspan="2" class="p-0"><small class="text-danger"
                                            >Action will lead to negativity of balance.</small
                                        ></b-th>
                                </b-tr>
                            </template>
                        </b-table>
                    </b-col>
                </b-row>
            </div>
            <span
                class="text-danger mb-2"
                v-if="detailChecker == 0 && detailError"
                >Save Details First</span
            >
            <div class="modal-footer">
                <button
                    type="button"
                    class="btn btn-primary"
                    @click="onSubmitResourceItem"
                    v-if="!viewDetail"
                >
                    Save changes
                </button>
                <button
                    type="button"
                    class="btn btn-link"
                    @click="hideModalDetail"
                >
                    Close
                </button>
            </div>
        </b-modal>
        <div class="row">
            <div class="col-12">
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
                        <b-row>
                            <b-col sm="3">
                                <b-row class="mb-3">
                                    <b-col sm="12">
                                        <div
                                            class="
                                                d-flex
                                                align-items-center
                                                justify-content-between
                                                mb-1
                                            "
                                        >
                                            <label class="mb-0"
                                                >Search Item</label
                                            >
                                            <button
                                                type="button"
                                                class="
                                                    btn
                                                    btn-sm
                                                    btn-outline-purple
                                                "
                                                @click="printPPMP()"
                                            >
                                                <i
                                                    class="bx bx-printer me-1"
                                                ></i
                                                >Print PPMP
                                            </button>
                                        </div>
                                        <input
                                            autocomplete="off"
                                            id="name"
                                            type="text"
                                            v-model="filterItem"
                                            placeholder="Search Indicator Item..."
                                            class="form-control"
                                        />
                                    </b-col>
                                </b-row>
                                <b-row class="mb-3">
                                    <b-col sm="12">
                                        <label
                                            >Select KPI
                                            <span
                                                v-if="
                                                    filteredItems.length == 0 &&
                                                    !loadItems
                                                "
                                                >- No Data Found</span
                                            >
                                            <span
                                                class="text-danger"
                                                v-if="
                                                    selectedItem == 0 &&
                                                    filteredItems.length > 0
                                                "
                                                >[Click on items]</span
                                            >
                                        </label>
                                        <div
                                            class="preloader-component ms-2"
                                            v-if="loadItems"
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
                                    </b-col>
                                    <b-col
                                        sm="12"
                                        v-for="x in filteredItems"
                                        :key="x.id"
                                    >
                                        <b-card
                                            class="
                                                p-0
                                                border
                                                shadow
                                                cursor-pointer
                                            "
                                            no-body
                                            @click="selectIndicatorItem(x)"
                                            :class="{
                                                'border-2 border-primary':
                                                    selectedItem == x.id,
                                                'border-secondary':
                                                    selectedItem != x.id,
                                            }"
                                        >
                                            <b-card-header
                                                :class="{
                                                    'bg-secondary':
                                                        selectedItem != x.id,
                                                    'bg-primary bg-soft':
                                                        selectedItem == x.id,
                                                }"
                                            >
                                                <b-card-title
                                                    :class="{
                                                        'text-white':
                                                            selectedItem !=
                                                            x.id,
                                                        'text-primary':
                                                            selectedItem ==
                                                            x.id,
                                                    }"
                                                    class="mb-0"
                                                    v-if="
                                                        selectedItem != x.id &&
                                                        x.indicatorItem
                                                            .indicatorItemName
                                                            .length > 70
                                                    "
                                                    >KPI:
                                                    {{
                                                        x.indicatorItem.indicatorItemName.substring(
                                                            0,
                                                            70
                                                        )
                                                    }}<a
                                                        class="text-dark"
                                                        href="javascript:void(0);"
                                                        >...</a
                                                    ></b-card-title
                                                >
                                                <b-card-title
                                                    :class="{
                                                        'text-white':
                                                            selectedItem !=
                                                            x.id,
                                                        'text-dark':
                                                            selectedItem ==
                                                            x.id,
                                                    }"
                                                    class="mb-0"
                                                    v-else
                                                    >KPI:
                                                    {{
                                                        x.indicatorItem
                                                            .indicatorItemName
                                                    }}</b-card-title
                                                >
                                                <!-- <small
                                                    v-if="selectedItem == x.id"
                                                    class="glow"
                                                    >Click here for more
                                                    details</small
                                                > -->
                                            </b-card-header>
                                            <b-card-body class="p-0">
                                                <div
                                                    class="mx-2 my-1"
                                                    v-if="selectedItem == x.id"
                                                >
                                                    <small
                                                        >Target Description:
                                                        {{ x.remarks }}</small
                                                    >
                                                </div>
                                                <table
                                                    class="
                                                        table table-bordered
                                                        mt-1
                                                        mb-1
                                                    "
                                                >
                                                    <tr>
                                                        <th
                                                            style="width: 60px"
                                                        ></th>
                                                        <th class="text-center">
                                                            Q1
                                                        </th>
                                                        <th class="text-center">
                                                            Q2
                                                        </th>
                                                        <th class="text-center">
                                                            Q3
                                                        </th>
                                                        <th class="text-center">
                                                            Q4
                                                        </th>
                                                    </tr>
                                                    <tr>
                                                        <td class="text-right">
                                                            <b>Actual</b>
                                                        </td>
                                                        <td class="text-center">
                                                            {{
                                                                x.indicatorItem
                                                                    .isPercentage
                                                                    ? `${x.actualQ1}%`
                                                                    : x.actualQ1
                                                            }}
                                                        </td>
                                                        <td class="text-center">
                                                            {{
                                                                x.indicatorItem
                                                                    .isPercentage
                                                                    ? `${x.actualQ2}%`
                                                                    : x.actualQ2
                                                            }}
                                                        </td>
                                                        <td class="text-center">
                                                            {{
                                                                x.indicatorItem
                                                                    .isPercentage
                                                                    ? `${x.actualQ3}%`
                                                                    : x.actualQ3
                                                            }}
                                                        </td>
                                                        <td class="text-center">
                                                            {{
                                                                x.indicatorItem
                                                                    .isPercentage
                                                                    ? `${x.actualQ4}%`
                                                                    : x.actualQ4
                                                            }}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td class="text-right">
                                                            <b>Target</b>
                                                        </td>
                                                        <td class="text-center">
                                                            {{
                                                                x.indicatorItem
                                                                    .isPercentage
                                                                    ? `${x.q1}%`
                                                                    : x.q1
                                                            }}
                                                        </td>
                                                        <td class="text-center">
                                                            {{
                                                                x.indicatorItem
                                                                    .isPercentage
                                                                    ? `${x.q2}%`
                                                                    : x.q2
                                                            }}
                                                        </td>
                                                        <td class="text-center">
                                                            {{
                                                                x.indicatorItem
                                                                    .isPercentage
                                                                    ? `${x.q3}%`
                                                                    : x.q3
                                                            }}
                                                        </td>
                                                        <td class="text-center">
                                                            {{
                                                                x.indicatorItem
                                                                    .isPercentage
                                                                    ? `${x.q4}%`
                                                                    : x.q4
                                                            }}
                                                        </td>
                                                    </tr>
                                                </table>
                                            </b-card-body>
                                        </b-card>
                                    </b-col>
                                    <b-col
                                        sm="12"
                                        v-if="
                                            filteredItems.length > 0 &&
                                            !loadItems
                                        "
                                    >
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
                                                    v-model="currentPageItem"
                                                    :total-rows="rowsItems"
                                                    :per-page="perPageItem"
                                                ></b-pagination>
                                            </ul>
                                        </div>
                                    </b-col>
                                </b-row>
                            </b-col>
                            <b-col sm="9">
                                <div class="card border shadow">
                                    <div class="card-body">
                                        <div
                                            class="
                                                d-flex
                                                justify-content-between
                                                align-items-center
                                            "
                                        >
                                            <h4 class="card-title m-0">
                                                {{ apiName }} API List
                                            </h4>
                                            <button
                                                v-if="selectedItem > 0"
                                                type="button"
                                                @click="addApi()"
                                                class="
                                                    btn btn-md btn-info
                                                    d-flex
                                                    align-items-center
                                                    no-wrap
                                                "
                                            >
                                                <i class="bx bx-plus fs-6"></i
                                                >Create New
                                            </button>
                                            <b-modal
                                                id="modal-standard"
                                                :title="modalTitle"
                                                size="md"
                                                title-class="font-18"
                                                hide-footer
                                                no-close-on-backdrop
                                            >
                                                <form
                                                    @submit.prevent="onCreate"
                                                    class="needs-validation"
                                                    ref="apiForm"
                                                >
                                                    <b-row>
                                                        <div class="col-md-12">
                                                            <div
                                                                :class="{
                                                                    'border border-primary position-relative mb-3':
                                                                        form.isCatchUp,
                                                                }"
                                                            >
                                                                <div
                                                                    :class="{
                                                                        isCatchup:
                                                                            form.isCatchUp,
                                                                    }"
                                                                    class="mb-3"
                                                                >
                                                                    <input
                                                                        autocomplete="off"
                                                                        class="
                                                                            form-check-input
                                                                        "
                                                                        type="checkbox"
                                                                        id="isCatchUp"
                                                                        v-model="
                                                                            form.isCatchUp
                                                                        "
                                                                    />&nbsp;&nbsp;
                                                                    <label
                                                                        class="
                                                                            form-check-label
                                                                        "
                                                                        for="isCatchUp"
                                                                        >Is
                                                                        CatchUp?</label
                                                                    >
                                                                </div>
                                                                <div
                                                                    class="
                                                                        mt-3
                                                                        mx-2
                                                                        mb-2
                                                                    "
                                                                    v-if="
                                                                        form.isCatchUp
                                                                    "
                                                                >
                                                                    <div
                                                                        class="
                                                                            mb-3
                                                                        "
                                                                    >
                                                                        <label
                                                                            for="previousWork"
                                                                            >Previous
                                                                            Work
                                                                        </label>
                                                                        <b-input-group>
                                                                            <template
                                                                                #append
                                                                            >
                                                                                <b-button
                                                                                    @click="
                                                                                        getWork
                                                                                    "
                                                                                    variant="outline-info"
                                                                                    ><i
                                                                                        class="
                                                                                            mdi
                                                                                            mdi-clipboard-text-search-outline
                                                                                        "
                                                                                    ></i
                                                                                ></b-button>
                                                                            </template>
                                                                            <input
                                                                                autocomplete="off"
                                                                                type="text"
                                                                                disabled
                                                                                placeholder="Search Previous Work..."
                                                                                class="
                                                                                    form-control
                                                                                "
                                                                                :class="{
                                                                                    'is-invalid':
                                                                                        submitted &&
                                                                                        $v
                                                                                            .previousWork
                                                                                            .name
                                                                                            .$error,
                                                                                }"
                                                                                v-model="
                                                                                    previousWork.name
                                                                                "
                                                                            />
                                                                        </b-input-group>
                                                                        <div
                                                                            v-if="
                                                                                submitted &&
                                                                                $v
                                                                                    .previousWork
                                                                                    .name
                                                                                    .$error
                                                                            "
                                                                            class="
                                                                                invalid-feedback
                                                                            "
                                                                        >
                                                                            <span
                                                                                v-if="
                                                                                    !$v
                                                                                        .previousWork
                                                                                        .name
                                                                                        .required
                                                                                "
                                                                                >This
                                                                                value
                                                                                is
                                                                                required.</span
                                                                            >
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <label
                                                                            for="catchUpPlans"
                                                                            >CatchUp
                                                                            Plans
                                                                        </label>
                                                                        <textarea
                                                                            id="catchUpPlans"
                                                                            rows="5"
                                                                            v-model="
                                                                                form.catchUpPlans
                                                                            "
                                                                            placeholder="Enter CatchUp Plans..."
                                                                            class="
                                                                                form-control
                                                                            "
                                                                        ></textarea>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="mb-3">
                                                            <label for="name"
                                                                >Name
                                                            </label>
                                                            <input
                                                                autocomplete="off"
                                                                id="name"
                                                                type="text"
                                                                v-model="
                                                                    form.name
                                                                "
                                                                placeholder="Enter Name..."
                                                                class="
                                                                    form-control
                                                                "
                                                                :class="{
                                                                    'is-invalid':
                                                                        submitted &&
                                                                        $v.form
                                                                            .name
                                                                            .$error,
                                                                }"
                                                            />
                                                            <div
                                                                v-if="
                                                                    submitted &&
                                                                    $v.form.name
                                                                        .$error
                                                                "
                                                                class="
                                                                    invalid-feedback
                                                                "
                                                            >
                                                                <span
                                                                    v-if="
                                                                        !$v.form
                                                                            .name
                                                                            .required
                                                                    "
                                                                    >This value
                                                                    is
                                                                    required.</span
                                                                >
                                                            </div>
                                                        </div>
                                                        <div class="mb-3">
                                                            <label
                                                                for="description"
                                                                >Description
                                                            </label>
                                                            <textarea
                                                                id="description"
                                                                rows="5"
                                                                v-model="
                                                                    form.description
                                                                "
                                                                placeholder="Enter Description..."
                                                                class="
                                                                    form-control
                                                                "
                                                                :class="{
                                                                    'is-invalid':
                                                                        submitted &&
                                                                        $v.form
                                                                            .description
                                                                            .$error,
                                                                }"
                                                            ></textarea>
                                                            <div
                                                                v-if="
                                                                    submitted &&
                                                                    $v.form
                                                                        .description
                                                                        .$error
                                                                "
                                                                class="
                                                                    invalid-feedback
                                                                "
                                                            >
                                                                <span
                                                                    v-if="
                                                                        !$v.form
                                                                            .description
                                                                            .required
                                                                    "
                                                                    >This value
                                                                    is
                                                                    required.</span
                                                                >
                                                            </div>
                                                        </div>
                                                        <div class="mb-3">
                                                            <label
                                                                for="apiTypeId"
                                                                >API Type
                                                            </label>
                                                            <b-input-group>
                                                                <template
                                                                    #append
                                                                >
                                                                    <b-button
                                                                        @click="
                                                                            getApiType
                                                                        "
                                                                        variant="outline-info"
                                                                        ><i
                                                                            class="
                                                                                mdi
                                                                                mdi-clipboard-text-search-outline
                                                                            "
                                                                        ></i
                                                                    ></b-button>
                                                                </template>
                                                                <input
                                                                    autocomplete="off"
                                                                    type="text"
                                                                    disabled
                                                                    placeholder="Search API Type..."
                                                                    class="
                                                                        form-control
                                                                    "
                                                                    :class="{
                                                                        'is-invalid':
                                                                            submitted &&
                                                                            $v
                                                                                .form
                                                                                .apiTypeId
                                                                                .$error,
                                                                    }"
                                                                    v-model="
                                                                        apiType
                                                                    "
                                                                />
                                                            </b-input-group>
                                                            <div
                                                                v-if="
                                                                    submitted &&
                                                                    $v.form
                                                                        .apiTypeId
                                                                        .$error
                                                                "
                                                                class="
                                                                    invalid-feedback
                                                                "
                                                            >
                                                                <span
                                                                    v-if="
                                                                        !$v.form
                                                                            .apiTypeId
                                                                            .required
                                                                    "
                                                                    >This value
                                                                    is
                                                                    required.</span
                                                                >
                                                            </div>
                                                        </div>
                                                        <!-- <div>
                                                                <label
                                                                    for="scoreEfficiency"
                                                                    >Score
                                                                </label>
                                                                <b-row
                                                                    class="mb-3"
                                                                >
                                                                    <b-col>
                                                                        <input
                                                                            autocomplete="off"
                                                                            id="scoreEfficiency"
                                                                            type="text"
                                                                            v-model="
                                                                                form.scoreEfficiency
                                                                            "
                                                                            placeholder="Enter Efficiency..."
                                                                            class="
                                                                                form-control
                                                                            "
                                                                            :class="{
                                                                                'is-invalid':
                                                                                    submitted &&
                                                                                    $v
                                                                                        .form
                                                                                        .scoreEfficiency
                                                                                        .$error,
                                                                            }"
                                                                        />
                                                                        <div
                                                                            v-if="
                                                                                submitted &&
                                                                                $v
                                                                                    .form
                                                                                    .scoreEfficiency
                                                                                    .$error
                                                                            "
                                                                            class="
                                                                                invalid-feedback
                                                                            "
                                                                        >
                                                                            <span
                                                                                v-if="
                                                                                    !$v
                                                                                        .form
                                                                                        .scoreEfficiency
                                                                                        .required
                                                                                "
                                                                                >This
                                                                                value
                                                                                is
                                                                                required.</span
                                                                            >
                                                                            <span
                                                                                v-if="
                                                                                    !$v
                                                                                        .form
                                                                                        .scoreEfficiency
                                                                                        .numeric
                                                                                "
                                                                                >This
                                                                                value
                                                                                should
                                                                                be
                                                                                a
                                                                                valid
                                                                                number.</span
                                                                            >
                                                                        </div>
                                                                        <small
                                                                            v-if="
                                                                                form.scoreEfficiency
                                                                            "
                                                                            >Efficiency</small
                                                                        >
                                                                    </b-col>
                                                                    <b-col>
                                                                        <input
                                                                            autocomplete="off"
                                                                            id="scoreQuality"
                                                                            type="text"
                                                                            v-model="
                                                                                form.scoreQuality
                                                                            "
                                                                            placeholder="Enter Quality..."
                                                                            class="
                                                                                form-control
                                                                            "
                                                                            :class="{
                                                                                'is-invalid':
                                                                                    submitted &&
                                                                                    $v
                                                                                        .form
                                                                                        .scoreQuality
                                                                                        .$error,
                                                                            }"
                                                                        />
                                                                        <div
                                                                            v-if="
                                                                                submitted &&
                                                                                $v
                                                                                    .form
                                                                                    .scoreQuality
                                                                                    .$error
                                                                            "
                                                                            class="
                                                                                invalid-feedback
                                                                            "
                                                                        >
                                                                            <span
                                                                                v-if="
                                                                                    !$v
                                                                                        .form
                                                                                        .scoreQuality
                                                                                        .required
                                                                                "
                                                                                >This
                                                                                value
                                                                                is
                                                                                required.</span
                                                                            >
                                                                            <span
                                                                                v-if="
                                                                                    !$v
                                                                                        .form
                                                                                        .scoreQuality
                                                                                        .numeric
                                                                                "
                                                                                >This
                                                                                value
                                                                                should
                                                                                be
                                                                                a
                                                                                valid
                                                                                number.</span
                                                                            >
                                                                        </div>
                                                                        <small
                                                                            v-if="
                                                                                form.scoreQuality
                                                                            "
                                                                            >Quality</small
                                                                        >
                                                                    </b-col>
                                                                    <b-col>
                                                                        <input
                                                                            autocomplete="off"
                                                                            id="scoreTimeliness"
                                                                            type="text"
                                                                            v-model="
                                                                                form.scoreTimeliness
                                                                            "
                                                                            placeholder="Enter Timelines..."
                                                                            class="
                                                                                form-control
                                                                            "
                                                                            :class="{
                                                                                'is-invalid':
                                                                                    submitted &&
                                                                                    $v
                                                                                        .form
                                                                                        .scoreTimeliness
                                                                                        .$error,
                                                                            }"
                                                                        />
                                                                        <div
                                                                            v-if="
                                                                                submitted &&
                                                                                $v
                                                                                    .form
                                                                                    .scoreTimeliness
                                                                                    .$error
                                                                            "
                                                                            class="
                                                                                invalid-feedback
                                                                            "
                                                                        >
                                                                            <span
                                                                                v-if="
                                                                                    !$v
                                                                                        .form
                                                                                        .scoreTimeliness
                                                                                        .required
                                                                                "
                                                                                >This
                                                                                value
                                                                                is
                                                                                required.</span
                                                                            >
                                                                            <span
                                                                                v-if="
                                                                                    !$v
                                                                                        .form
                                                                                        .scoreTimeliness
                                                                                        .numeric
                                                                                "
                                                                                >This
                                                                                value
                                                                                should
                                                                                be
                                                                                a
                                                                                valid
                                                                                number.</span
                                                                            >
                                                                        </div>
                                                                        <small
                                                                            v-if="
                                                                                form.scoreTimeliness
                                                                            "
                                                                            >Timelines</small
                                                                        >
                                                                    </b-col>
                                                                </b-row>
                                                            </div> -->
                                                        <!-- </b-col> -->
                                                        <!-- <b-col>
                                                            <div class="mb-3">
                                                                <label
                                                                    for="finalRemarks"
                                                                    >Final
                                                                    Remarks
                                                                </label>
                                                                <textarea
                                                                    id="finalRemarks"
                                                                    rows="3"
                                                                    v-model="
                                                                        form.finalRemarks
                                                                    "
                                                                    placeholder="Enter Final Remarks..."
                                                                    class="
                                                                        form-control
                                                                    "
                                                                    :class="{
                                                                        'is-invalid':
                                                                            submitted &&
                                                                            $v
                                                                                .form
                                                                                .finalRemarks
                                                                                .$error,
                                                                    }"
                                                                ></textarea>
                                                                <div
                                                                    v-if="
                                                                        submitted &&
                                                                        $v.form
                                                                            .finalRemarks
                                                                            .$error
                                                                    "
                                                                    class="
                                                                        invalid-feedback
                                                                    "
                                                                >
                                                                    <span
                                                                        v-if="
                                                                            !$v
                                                                                .form
                                                                                .finalRemarks
                                                                                .required
                                                                        "
                                                                        >This
                                                                        value is
                                                                        required.</span
                                                                    >
                                                                </div>
                                                            </div>
                                                            <div class="mb-3">
                                                                <input
                                                                    class="
                                                                        form-check-input
                                                                    "
                                                                    type="checkbox"
                                                                    id="isCompleted"
                                                                    v-model="
                                                                        form.isCompleted
                                                                    "
                                                                />&nbsp;&nbsp;
                                                                <label
                                                                    class="
                                                                        form-check-label
                                                                    "
                                                                    for="isCompleted"
                                                                    >Is
                                                                    Completed?</label
                                                                >
                                                            </div>
                                                            <div
                                                                class="mb-3"
                                                                v-if="
                                                                    form.isCompleted
                                                                "
                                                            >
                                                                <label
                                                                    for="dateCompleted"
                                                                    >Date
                                                                    Completed
                                                                </label>
                                                                <date-picker
                                                                    v-model="
                                                                        form.dateCompleted
                                                                    "
                                                                    :first-day-of-week="
                                                                        1
                                                                    "
                                                                    lang="en"
                                                                    placeholder="Enter Date Completed..."
                                                                ></date-picker>
                                                            </div>
                                                            <div
                                                                class="mb-3"
                                                                v-if="
                                                                    !form.isCompleted
                                                                "
                                                            >
                                                                <input
                                                                    class="
                                                                        form-check-input
                                                                    "
                                                                    type="checkbox"
                                                                    id="isCatchUp"
                                                                    v-model="
                                                                        form.isCatchUp
                                                                    "
                                                                />&nbsp;&nbsp;
                                                                <label
                                                                    class="
                                                                        form-check-label
                                                                    "
                                                                    for="isCatchUp"
                                                                    >Is
                                                                    CatchUp?</label
                                                                >
                                                            </div>
                                                            <div
                                                                class="mb-3"
                                                                v-if="
                                                                    form.isCatchUp &&
                                                                    !form.isCompleted
                                                                "
                                                            >
                                                                <label
                                                                    for="catchUpPlans"
                                                                    >CatchUp
                                                                    Plans
                                                                </label>
                                                                <textarea
                                                                    id="catchUpPlans"
                                                                    rows="5"
                                                                    v-model="
                                                                        form.catchUpPlans
                                                                    "
                                                                    placeholder="Enter CatchUp Plans..."
                                                                    class="
                                                                        form-control
                                                                    "
                                                                ></textarea>
                                                            </div>
                                                        </b-col> -->
                                                    </b-row>
                                                    <div class="modal-footer">
                                                        <button
                                                            type="submit"
                                                            class="
                                                                btn btn-primary
                                                            "
                                                        >
                                                            Save changes
                                                        </button>
                                                        <button
                                                            type="button"
                                                            class="btn btn-link"
                                                            @click="hideModal"
                                                        >
                                                            Close
                                                        </button>
                                                    </div>
                                                </form>
                                            </b-modal>
                                        </div>
                                        <div class="row mt-4">
                                            <div class="col-sm-12 col-md-6">
                                                <div
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
                                                                mx-1
                                                            "
                                                            v-model="perPage"
                                                            size="sm"
                                                            :options="
                                                                pageOptions
                                                            "
                                                        ></b-form-select
                                                        >&nbsp;entries
                                                    </label>
                                                </div>
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
                                                        <b-form-input
                                                            autocomplete="off"
                                                            v-model="filter"
                                                            type="search"
                                                            placeholder="Search..."
                                                            class="
                                                                form-control
                                                                form-control-sm
                                                                ms-2
                                                            "
                                                        ></b-form-input>
                                                    </label>
                                                </div>
                                            </div>
                                            <!-- End search -->
                                        </div>
                                        <div class="table-responsive mb-0">
                                            <b-table
                                                class="datatables"
                                                :items="targetData"
                                                :fields="fields"
                                                responsive="sm"
                                                :per-page="perPage"
                                                :current-page="currentPage"
                                                :sort-by.sync="sortBy"
                                                :sort-desc.sync="sortDesc"
                                                :filter="filter"
                                                :filter-included-fields="
                                                    filterOn
                                                "
                                                :busy="tableBusy"
                                                @filtered="onFiltered"
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
                                                        <strong
                                                            >Loading...</strong
                                                        >
                                                    </div>
                                                </template>
                                                <template #cell(name)="data">
                                                    <a
                                                        href="javascript:void(0);"
                                                        class="
                                                            d-flex
                                                            justify-content-start
                                                        "
                                                        @click="
                                                            goToPPMP(data.item)
                                                        "
                                                    >
                                                        <b
                                                            class="text-white"
                                                            :id="`${data.item.id}`"
                                                            >{{
                                                                data.item.name
                                                            }}</b
                                                        >
                                                        <div>
                                                            <span
                                                                class="
                                                                    badge
                                                                    rounded-pill
                                                                    bg-danger
                                                                    float-end
                                                                "
                                                                style="
                                                                    font-size: 8px;
                                                                "
                                                                >{{
                                                                    data.item
                                                                        .notification >
                                                                    0
                                                                        ? data
                                                                              .item
                                                                              .notification
                                                                        : ""
                                                                }}</span
                                                            >
                                                        </div>
                                                    </a>
                                                    <div class="text-muted">
                                                        {{
                                                            data.item
                                                                .description
                                                        }}
                                                    </div>
                                                    <a
                                                        href="javascript:void(0);"
                                                        @click="showDtls(data)"
                                                    >
                                                        <i
                                                            class="
                                                                d-flex
                                                                align-items-center
                                                            "
                                                        >
                                                            <i
                                                                class="
                                                                    bx
                                                                    bx-paperclip
                                                                    me-1
                                                                "
                                                            ></i>
                                                            <span class="me-1"
                                                                >Attachments</span
                                                            >
                                                            <i
                                                                class="
                                                                    bx bx-play
                                                                    me-1
                                                                    font-size-15
                                                                    rotate
                                                                "
                                                                :class="{
                                                                    'rotate-90':
                                                                        data
                                                                            .item
                                                                            .showAttachments,
                                                                }"
                                                            ></i>
                                                        </i>
                                                    </a>
                                                </template>
                                                <template #cell(status)="data">
                                                    <div>
                                                        <span>Status: </span>
                                                        <template
                                                            v-if="
                                                                data.value.toUpperCase() ===
                                                                'POSTED'
                                                            "
                                                        >
                                                            <span
                                                                class="
                                                                    badge
                                                                    bg-success
                                                                    font-size-12
                                                                "
                                                                >{{
                                                                    data.value
                                                                }}</span
                                                            >
                                                        </template>
                                                        <template
                                                            v-else-if="
                                                                data.value.toUpperCase() ===
                                                                'APPROVED'
                                                            "
                                                        >
                                                            <span
                                                                class="
                                                                    badge
                                                                    bg-success
                                                                    bg-soft
                                                                    font-size-12
                                                                    text-success
                                                                "
                                                                >{{
                                                                    data.value
                                                                }}</span
                                                            >
                                                        </template>
                                                        <template
                                                            v-else-if="
                                                                data.value.toUpperCase() ===
                                                                'RETURN'
                                                            "
                                                        >
                                                            <span
                                                                class="
                                                                    badge
                                                                    bg-warning
                                                                    bg-soft
                                                                    font-size-12
                                                                    text-warning
                                                                "
                                                                >{{
                                                                    data.value
                                                                }}</span
                                                            >
                                                        </template>
                                                        <template v-else>
                                                            {{ data.value }}
                                                        </template>
                                                    </div>
                                                    <div class="mt-1">
                                                        Financial:
                                                        <template v-if="data.item.financialStatus">
                                                            <template
                                                                v-if="
                                                                    data.item.financialStatus.toUpperCase() ===
                                                                    'APPROVED'
                                                                "
                                                            >
                                                                <span
                                                                    class="
                                                                        badge
                                                                        bg-success
                                                                        bg-soft
                                                                        font-size-12
                                                                        text-success
                                                                    "
                                                                    >{{
                                                                        data.item
                                                                            .financialStatus
                                                                    }}</span
                                                                >
                                                            </template>
                                                            <template
                                                                v-else-if="
                                                                    data.item.financialStatus.toUpperCase() ===
                                                                    'RETURN'
                                                                "
                                                            >
                                                                <span
                                                                    class="
                                                                        badge
                                                                        bg-warning
                                                                        bg-soft
                                                                        font-size-12
                                                                        text-warning
                                                                    "
                                                                    >{{
                                                                        data.item
                                                                            .financialStatus
                                                                    }}</span
                                                                >
                                                            </template>
                                                            <template v-else>
                                                                {{
                                                                    data.item
                                                                        .financialStatus
                                                                }}
                                                            </template>
                                                        </template>
                                                        <template v-else>
                                                            PENDING
                                                        </template>
                                                    </div>
                                                </template>
                                                <template
                                                    #cell(catchUpPlans)="data"
                                                >
                                                    <div class="text-muted">
                                                        {{
                                                            data.item.isCatchUp
                                                                ? data.value
                                                                : "N/A"
                                                        }}
                                                    </div>
                                                </template>
                                                <template #cell(score)="data">
                                                    <div>
                                                        <b>Efficiency:</b
                                                        >&nbsp;{{
                                                            data.item
                                                                .scoreEfficiency
                                                        }}
                                                    </div>
                                                    <div>
                                                        <b>Quality:</b>&nbsp;{{
                                                            data.item
                                                                .scoreQuality
                                                        }}
                                                    </div>
                                                    <div>
                                                        <b>Timeliness:</b
                                                        >&nbsp;{{
                                                            data.item
                                                                .scoreTimeliness
                                                        }}
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
                                                            <template
                                                                #button-content
                                                            >
                                                                <i
                                                                    class="
                                                                        fas
                                                                        fa-ellipsis-v
                                                                    "
                                                                ></i>
                                                            </template>

                                                            <b-dropdown-item
                                                                @click="
                                                                    goToPPMP(
                                                                        row.item
                                                                    )
                                                                "
                                                                variant="dark"
                                                                ><i
                                                                    class="
                                                                        bx
                                                                        bx-notepad
                                                                        font-size-18
                                                                        me-1
                                                                    "
                                                                ></i
                                                                >Resources</b-dropdown-item
                                                            >
                                                            <b-dropdown-item
                                                                @click="
                                                                    updateItem(
                                                                        row
                                                                    )
                                                                "
                                                                variant="dark"
                                                                v-if="
                                                                    row.item.status.toUpperCase() !==
                                                                        'POSTED' &&
                                                                    row.item.status.toUpperCase() !==
                                                                        'APPROVED' &&
                                                                    !row.item
                                                                        .priority
                                                                "
                                                                ><i
                                                                    class="
                                                                        bx
                                                                        bx-edit
                                                                        font-size-18
                                                                        me-1
                                                                    "
                                                                ></i
                                                                >Edit</b-dropdown-item
                                                            >
                                                            <b-dropdown-item
                                                                @click="
                                                                    deleteItem(
                                                                        row
                                                                    )
                                                                "
                                                                variant="danger"
                                                                v-if="
                                                                    row.item.status.toUpperCase() !==
                                                                        'POSTED' &&
                                                                    row.item.status.toUpperCase() !==
                                                                        'APPROVED' &&
                                                                    !row.item
                                                                        .priority
                                                                "
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
                                                            <b-dropdown-item
                                                                v-if="
                                                                    row.item.status.toUpperCase() !==
                                                                        'POSTED' &&
                                                                    row.item.status.toUpperCase() !==
                                                                        'APPROVED'
                                                                "
                                                                @click="
                                                                    postPPMP(
                                                                        row.item
                                                                    )
                                                                "
                                                                variant="success"
                                                                ><i
                                                                    class="
                                                                        bx
                                                                        bx-check
                                                                        font-size-18
                                                                        me-1
                                                                    "
                                                                ></i
                                                                >Post this
                                                                Work</b-dropdown-item
                                                            >
                                                        </b-dropdown>
                                                    </div>
                                                </template>
                                                <template #row-details="row">
                                                    <transition
                                                        name="max-height"
                                                    >
                                                        <div
                                                            v-if="
                                                                row.item
                                                                    .showAttachments
                                                            "
                                                        >
                                                            <div
                                                                class="
                                                                    d-flex
                                                                    justify-content-between
                                                                    align-items-center
                                                                "
                                                            >
                                                                <div>
                                                                    <input
                                                                        type="search"
                                                                        class="
                                                                            form-control
                                                                            form-control-sm
                                                                        "
                                                                        placeholder="Search Attachments"
                                                                        v-model="
                                                                            row
                                                                                .item
                                                                                .fileSearch
                                                                        "
                                                                        @input="
                                                                            searchDocu(
                                                                                row.item
                                                                            )
                                                                        "
                                                                    />
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    class="
                                                                        btn
                                                                        btn-outline-success
                                                                        no-wrap
                                                                        btn-sm
                                                                    "
                                                                    :id="`api-document${row.item.id}`"
                                                                    @click="
                                                                        row.item.addDocu = true
                                                                    "
                                                                >
                                                                    <i
                                                                        class="
                                                                            bx
                                                                            bx-upload
                                                                            me-1
                                                                        "
                                                                    ></i>
                                                                    Upload
                                                                    Document
                                                                </button>
                                                                <upload-popover
                                                                    :option="
                                                                        uploadOptions
                                                                    "
                                                                    :sourceId="
                                                                        row.item
                                                                            .id
                                                                    "
                                                                    @uploaded="
                                                                        uploadedDocument(
                                                                            $event,
                                                                            row
                                                                                .item
                                                                                .id
                                                                        )
                                                                    "
                                                                    :showPV="
                                                                        row.item
                                                                            .addDocu
                                                                    "
                                                                    @closePopover="
                                                                        row.item.addDocu = false
                                                                    "
                                                                    :dzId="`dropzone-api${row.item.id}`"
                                                                    :pvId="`api-document${row.item.id}`"
                                                                ></upload-popover>
                                                            </div>
                                                            <div
                                                                class="
                                                                    d-flex
                                                                    justify-content-center
                                                                    align-items-center
                                                                "
                                                                v-if="
                                                                    row.item
                                                                        .attachmentLoading
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
                                                                class="row"
                                                                v-if="
                                                                    !row.item
                                                                        .attachmentLoading
                                                                "
                                                            >
                                                                <div
                                                                    class="
                                                                        col-md-4
                                                                        mb-2
                                                                    "
                                                                    v-for="(
                                                                        y, index
                                                                    ) in searchDocu(
                                                                        row.item
                                                                    )"
                                                                    :key="y.id"
                                                                >
                                                                    <div
                                                                        class="
                                                                            position-relative
                                                                            cursor-pointer
                                                                            border
                                                                            mt-2
                                                                            border-secondary
                                                                            br-5
                                                                        "
                                                                        :style="`z-index: ${
                                                                            searchDocu(
                                                                                row.item
                                                                            )
                                                                                .length -
                                                                            index
                                                                        }`"
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
                                                                                        <template
                                                                                            #button-content
                                                                                        >
                                                                                            <i
                                                                                                class="
                                                                                                    mdi
                                                                                                    mdi-dots-horizontal
                                                                                                "
                                                                                            ></i>
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
                                                                                        <b-dropdown-item
                                                                                            variant="danger"
                                                                                            @click="
                                                                                                removeFile(
                                                                                                    y.id,
                                                                                                    row
                                                                                                        .item
                                                                                                        .id
                                                                                                )
                                                                                            "
                                                                                            ><i
                                                                                                class="
                                                                                                    bx
                                                                                                    bx-trash
                                                                                                    me-1
                                                                                                "
                                                                                            ></i
                                                                                            >Remove</b-dropdown-item
                                                                                        >
                                                                                    </b-dropdown>
                                                                                </div>
                                                                                <div
                                                                                    class="
                                                                                        avatar-xs
                                                                                        me-3
                                                                                        mb-2
                                                                                    "
                                                                                    @click="
                                                                                        openDocument(
                                                                                            y
                                                                                        )
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
                                                                                            v-if="
                                                                                                y.fileType.includes(
                                                                                                    'image'
                                                                                                )
                                                                                            "
                                                                                            class="
                                                                                                mdi
                                                                                                mdi-image
                                                                                                font-size-24
                                                                                                text-purple
                                                                                            "
                                                                                        ></i>
                                                                                        <i
                                                                                            v-if="
                                                                                                y.fileType.includes(
                                                                                                    'application'
                                                                                                )
                                                                                            "
                                                                                            class="
                                                                                                mdi
                                                                                                mdi-file-pdf-outline
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
                                                                                    @click="
                                                                                        openDocument(
                                                                                            y
                                                                                        )
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
                                                                                            {{
                                                                                                y.description
                                                                                            }}
                                                                                        </h5>
                                                                                        <p
                                                                                            class="
                                                                                                text-muted
                                                                                                mb-0
                                                                                            "
                                                                                        >
                                                                                            {{
                                                                                                formatDateWithTime(
                                                                                                    new Date(
                                                                                                        y.dateTimeUploaded
                                                                                                    )
                                                                                                )
                                                                                            }}
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div
                                                                    class="
                                                                        col-md-12
                                                                        text-center
                                                                        mt-2
                                                                    "
                                                                    v-if="
                                                                        searchDocu(
                                                                            row.item
                                                                        )
                                                                            .length ==
                                                                            0 &&
                                                                        row.item
                                                                            .attachments
                                                                            .length >
                                                                            0
                                                                    "
                                                                >
                                                                    Search Not
                                                                    Found
                                                                </div>
                                                                <div
                                                                    class="
                                                                        col-md-12
                                                                        text-center
                                                                        mt-2
                                                                    "
                                                                    v-if="
                                                                        row.item
                                                                            .attachments
                                                                            .length ==
                                                                        0
                                                                    "
                                                                >
                                                                    No Document
                                                                    Found
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </transition>
                                                </template>
                                            </b-table>
                                        </div>
                                        <div class="row">
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
                                                        <!-- pagination -->
                                                        <b-pagination
                                                            v-model="
                                                                currentPage
                                                            "
                                                            :total-rows="rows"
                                                            :per-page="perPage"
                                                        ></b-pagination>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </b-col>
                        </b-row>
                    </slide>
                    <slide>
                        <b-row>
                            <b-col sm="6" class="d-flex align-items-center">
                                <div class="d-flex align-items-center">
                                    <a
                                        href="javascript:void(0);"
                                        class="me-1"
                                        @click="returnToApi()"
                                        ><i
                                            class="bx bx-left-arrow-alt fs-2"
                                        ></i
                                    ></a>
                                    <h4 class="mb-0">{{ selectedApi }}</h4>
                                </div>
                            </b-col>
                            <div class="col-md-6 text-right">
                                <div class="d-flex float-end">
                                    <div
                                        class="me-2"
                                        v-if="
                                            selectedPPMPStatus !== 'POSTED' &&
                                            selectedPPMPStatus !== 'APPROVED'
                                        "
                                    >
                                        <button
                                            type="button"
                                            class="btn btn-success no-wrap"
                                            @click="postWork()"
                                        >
                                            <i class="bx bx-check"></i>Post this
                                            Work
                                        </button>
                                    </div>
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
                                                v-model="filterBudget"
                                                type="search"
                                                placeholder="Search Budget..."
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
                                                v-model="perPageBudget"
                                                size="sm"
                                                :options="pageOptions"
                                            ></b-form-select>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </b-row>
                        <div class="row">
                            <div class="col-lg-12">
                                <div>
                                    <div class="table-responsive">
                                        <table
                                            class="
                                                table
                                                table-nowrap
                                                table-centered
                                                align-middle
                                                project-list-table
                                                border-collapse-none
                                            "
                                        >
                                            <thead>
                                                <tr>
                                                    <th
                                                        scope="col"
                                                        width="50px"
                                                    ></th>
                                                    <th scope="col">
                                                        Account Name
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        width="250px"
                                                    >
                                                        Budget Allocated
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        width="250px"
                                                    >
                                                        Balance
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        width="200px"
                                                    >
                                                        Expiry
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        width="150px"
                                                        class="text-center"
                                                    >
                                                        Action
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr v-if="budgetBusy">
                                                    <td colspan="6">
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
                                                    </td>
                                                </tr>
                                                <tr
                                                    v-if="
                                                        budgetData.length ==
                                                            0 && !budgetBusy
                                                    "
                                                >
                                                    <td
                                                        colspan="6"
                                                        class="
                                                            text-muted
                                                            text-center
                                                        "
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
                                                <tr
                                                    v-if="
                                                        filteredBudget.length ==
                                                            0 &&
                                                        filterBudget &&
                                                        !budgetBusy
                                                    "
                                                >
                                                    <td
                                                        colspan="6"
                                                        class="
                                                            text-muted
                                                            text-center
                                                        "
                                                    >
                                                        <i
                                                            class="
                                                                dripicons-warning
                                                                me-1
                                                            "
                                                        ></i
                                                        >Search not found
                                                    </td>
                                                </tr>
                                                <template
                                                    v-for="y in filteredBudget"
                                                >
                                                    <tr
                                                        :key="'A' + y.id"
                                                        style="
                                                            background-color: transparent;
                                                            box-shadow: none;
                                                        "
                                                    >
                                                        <td
                                                            colspan="2"
                                                            class="pad-2rem"
                                                        >
                                                            <div
                                                                class="
                                                                    d-flex
                                                                    align-item-center
                                                                    cursor-pointer
                                                                "
                                                                @click="y.showData = !y.showData"
                                                            >
                                                                <span
                                                                    class="
                                                                        bx
                                                                        text-warning
                                                                        me-1
                                                                    "
                                                                    :class="{'bx-plus': !y.showData, 'bx-minus': y.showData}"
                                                                    style="
                                                                        line-height: unset;
                                                                    "
                                                                ></span>
                                                                <h5
                                                                    class="
                                                                        text-dark
                                                                        mb-0
                                                                    "
                                                                >
                                                                    {{
                                                                        y.fsName
                                                                    }}
                                                                </h5>
                                                            </div>
                                                        </td>
                                                        <td class="py-2">
                                                            <h5
                                                                    class="
                                                                        text-dark
                                                                        mb-0
                                                                    "
                                                                >
                                                            {{
                                                                new Intl.NumberFormat(
                                                                    "ja-JP",
                                                                    {
                                                                        currency:
                                                                            "PHP",
                                                                        style: "currency",
                                                                    }
                                                                ).format(
                                                                    y.allocated
                                                                )
                                                            }}
                                                            </h5>
                                                        </td>
                                                        <td class="py-0">
                                                            <h5
                                                                class="
                                                                    text-dark
                                                                    mb-0
                                                                "
                                                            >
                                                            {{
                                                                new Intl.NumberFormat(
                                                                    "ja-JP",
                                                                    {
                                                                        currency:
                                                                            "PHP",
                                                                        style: "currency",
                                                                    }
                                                                ).format(
                                                                    y.balance
                                                                )
                                                            }}
                                                            </h5>
                                                        </td>
                                                        <td class="py-0"></td>
                                                        <td class="py-0"></td>
                                                    </tr>
                                                    <template v-if="y.showData">
                                                        <template
                                                            v-for="(z, zIndex) in y.data"
                                                        >
                                                            <tr 
                                                                class="classic-tr"
                                                                :key="'B' + z.id"
                                                                >
                                                                <td
                                                                    colspan="6"
                                                                    class="pad-2rem-5px position-relative"
                                                                >
                                                                    <div class="line-vertical-middle"></div>
                                                                    <div
                                                                        class="
                                                                            d-flex
                                                                            align-items-center
                                                                        "
                                                                    >
                                                                        <div class="line-horizontal-middle w-20px"></div>
                                                                        <!-- <span
                                                                            class="
                                                                                bx
                                                                                bx-checkbox-square
                                                                                text-success
                                                                                me-1
                                                                            "
                                                                            style="
                                                                                line-height: unset;
                                                                            "
                                                                        ></span> -->
                                                                        <b
                                                                            class="
                                                                                text-dark
                                                                            "
                                                                            >{{
                                                                                z.key
                                                                            }}</b
                                                                        >
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                            <template
                                                                v-for="(w, wIndex) in z.data"
                                                            >
                                                                <tr
                                                                    :key="
                                                                        'W' + w.id
                                                                    "
                                                                    class="classic-tr"
                                                                >
                                                                    <td
                                                                        colspan="6"
                                                                        class="pad-2rem-5px position-relative"
                                                                    >
                                                                        <div class="line-vertical-middle"></div>
                                                                        <div
                                                                            class="
                                                                                d-flex
                                                                                align-items-center
                                                                            "
                                                                        >
                                                                            <!-- <span
                                                                                class="
                                                                                    bx
                                                                                    bxs-polygon
                                                                                    text-primary
                                                                                    me-1
                                                                                "
                                                                                style="
                                                                                    line-height: unset;
                                                                                "
                                                                            ></span> -->
                                                                            <div class="line-horizontal-middle w-30px"></div>
                                                                            <b
                                                                                class="
                                                                                    text-dark
                                                                                "
                                                                            >
                                                                                {{
                                                                                    w.key
                                                                                }}</b
                                                                            >
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                                <tr
                                                                    v-for="(x, xIndex) in w.data"
                                                                    :key="x.id"
                                                                    class="classic-tr"
                                                                >
                                                                    <td class="pl-5px position-relative">
                                                                        <div class="line-vertical-middle" :class="{'bottom-50': (y.data.length - 1) == zIndex && (z.data.length - 1) == wIndex && (w.data.length - 1) == xIndex}"></div>
                                                                        <div class="d-flex align-items-center">
                                                                            <div class="line-horizontal-middle w-100"></div>
                                                                        </div>
                                                                    </td>
                                                                    <td
                                                                        class="
                                                                            bg-table-tr
                                                                        "
                                                                        :class="{'border-top-white': xIndex > 0}"
                                                                    >
                                                                        <h5
                                                                            class="
                                                                                text-truncate
                                                                                font-size-14
                                                                                mb-0
                                                                                d-flex
                                                                            "
                                                                        >
                                                                            <a
                                                                                href="javascript: void(0);"
                                                                                class="
                                                                                    text-dark
                                                                                "
                                                                                @click="
                                                                                    viewItems(
                                                                                        x
                                                                                    )
                                                                                "
                                                                                >{{
                                                                                    x
                                                                                        .objectOfExpenditure
                                                                                        .account
                                                                                        .accountName
                                                                                }}</a
                                                                            >
                                                                            <div>
                                                                                <span
                                                                                    class="
                                                                                        badge
                                                                                        rounded-pill
                                                                                        bg-danger
                                                                                        float-end
                                                                                    "
                                                                                    style="
                                                                                        font-size: 8px;
                                                                                    "
                                                                                    >{{
                                                                                        x.notification >
                                                                                        0
                                                                                            ? x.notification
                                                                                            : ""
                                                                                    }}</span
                                                                                >
                                                                            </div>
                                                                        </h5>
                                                                        <small>{{
                                                                            x
                                                                                .objectOfExpenditure
                                                                                .prexc
                                                                                .prexcName
                                                                        }}</small>
                                                                    </td>
                                                                    <td
                                                                        class="
                                                                            bg-table-tr
                                                                        "
                                                                        :class="{'border-top-white': xIndex > 0}"
                                                                    >
                                                                        {{
                                                                            new Intl.NumberFormat(
                                                                                "ja-JP",
                                                                                {
                                                                                    currency:
                                                                                        "PHP",
                                                                                    style: "currency",
                                                                                }
                                                                            ).format(
                                                                                x.allocated
                                                                            )
                                                                        }}
                                                                    </td>
                                                                    <td
                                                                        class="
                                                                            bg-table-tr
                                                                        "
                                                                        :class="{'border-top-white': xIndex > 0}"
                                                                    >
                                                                        {{
                                                                            new Intl.NumberFormat(
                                                                                "ja-JP",
                                                                                {
                                                                                    currency:
                                                                                        "PHP",
                                                                                    style: "currency",
                                                                                }
                                                                            ).format(
                                                                                x.balance
                                                                            )
                                                                        }}
                                                                    </td>
                                                                    <td
                                                                        class="
                                                                            bg-table-tr
                                                                        "
                                                                        :class="{'border-top-white': xIndex > 0}"
                                                                    >
                                                                        <span
                                                                            v-if="
                                                                                !x.expired
                                                                            "
                                                                            >Expires
                                                                            on
                                                                            {{
                                                                                formatDate(
                                                                                    new Date(
                                                                                        x.expiry
                                                                                    )
                                                                                )
                                                                            }}</span
                                                                        >
                                                                        <span
                                                                            v-else
                                                                            class="
                                                                                badge
                                                                                bg-warning
                                                                                bg-soft
                                                                                text-warning
                                                                                fs-6
                                                                            "
                                                                            ><b
                                                                                >Expired</b
                                                                            ></span
                                                                        >
                                                                    </td>
                                                                    <td
                                                                        class="
                                                                            text-center
                                                                            bg-table-tr
                                                                        "
                                                                        :class="{'border-top-white': xIndex > 0}"
                                                                    >
                                                                        <div
                                                                            class="
                                                                                d-flex
                                                                                justify-content-center
                                                                            "
                                                                        >
                                                                            <a
                                                                                href="javascript:void(0)"
                                                                                @click="
                                                                                    viewItems(
                                                                                        x
                                                                                    )
                                                                                "
                                                                                class="
                                                                                    d-flex
                                                                                    align-items-center
                                                                                "
                                                                            >
                                                                                <span
                                                                                    >View
                                                                                    Items</span
                                                                                >
                                                                                <i
                                                                                    title="View Items"
                                                                                    class="
                                                                                        mdi
                                                                                        mdi-chevron-right
                                                                                        font-size-18
                                                                                        text-primary
                                                                                        cursor-pointer
                                                                                    "
                                                                                ></i>
                                                                            </a>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            </template>
                                                        </template>
                                                    </template>
                                                </template>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="row mb-3">
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
                                            pagination pagination-rounded
                                            mb-0
                                        "
                                    >
                                        <!-- pagination -->
                                        <b-pagination
                                            v-model="currentPageBudget"
                                            :total-rows="rowsBudget"
                                            :per-page="perPageBudget"
                                        ></b-pagination>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </slide>
                    <slide>
                        <div class="row">
                            <b-col sm="6">
                                <div class="d-flex align-items-center">
                                    <a
                                        href="javascript:void(0);"
                                        class="me-1"
                                        @click="returnToBudget()"
                                        ><i
                                            class="bx bx-left-arrow-alt fs-2"
                                        ></i
                                    ></a>
                                    <div>
                                        <h4 class="m-0">
                                            {{ selectedApi }}'s Items
                                        </h4>
                                        <span class="badge bg-secondary me-2">{{
                                            selectedFS
                                        }}</span>
                                        <span class="badge bg-purple">{{
                                            selectedBudget
                                        }}</span>
                                    </div>
                                </div>
                            </b-col>
                            <b-col sm="6" class="text-right">
                                <h4 class="text-muted mb-0">
                                    <div class="">
                                        Balance:
                                        <b class="text-success">{{
                                            Intl.NumberFormat("ja-JP", {
                                                currency: "PHP",
                                                style: "currency",
                                            }).format(budgetCopy)
                                        }}</b>
                                    </div>
                                    <div class="">
                                        Total:
                                        <b class="text-warning">{{
                                            totalResourceItemAmt()
                                        }}</b>
                                    </div>
                                </h4>
                            </b-col>
                        </div>
                        <b-row>
                            <b-col sm="12" class="mt-2">
                                <div class="row">
                                    <div class="col-md-6 d-flex">
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
                                                    v-model="filterItem"
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
                                    <div class="col-md-6">
                                        <button
                                            class="
                                                btn btn-info
                                                d-flex
                                                align-items-center
                                                float-end
                                            "
                                            @click="addNewItem"
                                            v-if="
                                                !bliExpired &&
                                                selectedPPMPStatus !==
                                                    'POSTED' &&
                                                selectedPPMPStatus !==
                                                    'APPROVED'
                                            "
                                        >
                                            <i class="bx bx-plus"></i> Create
                                            New
                                        </button>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-lg-12">
                                        <div>
                                            <div class="table-responsive">
                                                <table
                                                    class="
                                                        table
                                                        project-list-table
                                                        table-nowrap
                                                        table-centered
                                                        table-borderless
                                                        align-middle
                                                    "
                                                >
                                                    <thead>
                                                        <tr>
                                                            <th scope="col">
                                                                Item Name
                                                            </th>
                                                            <th scope="col">
                                                                Description
                                                            </th>
                                                            <th
                                                                scope="col"
                                                                width="200px"
                                                            >
                                                                Unit Cost
                                                            </th>
                                                            <th
                                                                scope="col"
                                                                width="200px"
                                                            >
                                                                Total
                                                            </th>
                                                            <th
                                                                scope="col"
                                                                width="150px"
                                                                class="
                                                                    text-center
                                                                "
                                                            >
                                                                Action
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr v-if="itemLoading">
                                                            <td colspan="5">
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
                                                            </td>
                                                        </tr>
                                                        <tr
                                                            v-if="
                                                                filteredResourceItems.length ==
                                                                    0 &&
                                                                !itemLoading
                                                            "
                                                        >
                                                            <td
                                                                colspan="5"
                                                                class="
                                                                    text-muted
                                                                    text-center
                                                                "
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
                                                        <tr
                                                            v-for="x in filteredResourceItems"
                                                            :key="x.id"
                                                        >
                                                            <td
                                                                class="
                                                                    border
                                                                    border-end-0
                                                                "
                                                                :class="{
                                                                    'border-success':
                                                                        x.technicalReviewStatus
                                                                            .toUpperCase()
                                                                            .includes(
                                                                                'APPROVED'
                                                                            ),
                                                                    'border-warning':
                                                                        x.technicalReviewStatus
                                                                            .toUpperCase()
                                                                            .includes(
                                                                                'RETURN'
                                                                            ),
                                                                }"
                                                            >
                                                                <div>
                                                                    {{
                                                                        x.itemName
                                                                    }}
                                                                </div>
                                                                <div>
                                                                    <small
                                                                        ><i>{{
                                                                            x
                                                                                .itemCategory
                                                                                .name
                                                                        }}</i></small
                                                                    >
                                                                </div>
                                                                <!-- <div
                                                                    v-if="
                                                                        x.technicalReviewStatus
                                                                            .toUpperCase()
                                                                            .includes(
                                                                                'APPROVED'
                                                                            )
                                                                    "
                                                                >
                                                                    <span
                                                                        class="
                                                                            badge
                                                                            bg-success
                                                                            bg-soft
                                                                            cursor-pointer
                                                                        "
                                                                        @click="
                                                                            viewItemLogs(
                                                                                x
                                                                            )
                                                                        "
                                                                        ><b
                                                                            class="
                                                                                text-success
                                                                            "
                                                                            >Approved
                                                                            by
                                                                            Technical</b
                                                                        ></span
                                                                    >
                                                                </div>
                                                                <div
                                                                    v-else-if="
                                                                        x.technicalReviewStatus
                                                                            .toUpperCase()
                                                                            .includes(
                                                                                'RETURN'
                                                                            )
                                                                    "
                                                                >
                                                                    <span
                                                                        class="
                                                                            badge
                                                                            bg-warning
                                                                            bg-soft
                                                                            cursor-pointer
                                                                        "
                                                                        @click="
                                                                            viewItemLogs(
                                                                                x
                                                                            )
                                                                        "
                                                                        ><b
                                                                            class="
                                                                                text-warning
                                                                            "
                                                                            >Returned
                                                                            by
                                                                            Technical</b
                                                                        ></span
                                                                    >
                                                                </div> -->
                                                            </td>
                                                            <td
                                                                class="
                                                                    border
                                                                    border-start-0
                                                                    border-end-0
                                                                "
                                                                :class="{
                                                                    'border-success':
                                                                        x.technicalReviewStatus
                                                                            .toUpperCase()
                                                                            .includes(
                                                                                'APPROVED'
                                                                            ),
                                                                    'border-warning':
                                                                        x.technicalReviewStatus
                                                                            .toUpperCase()
                                                                            .includes(
                                                                                'RETURN'
                                                                            ),
                                                                }"
                                                            >
                                                                {{
                                                                    x.description
                                                                }}
                                                            </td>
                                                            <td
                                                                class="
                                                                    border
                                                                    border-start-0
                                                                    border-end-0
                                                                "
                                                                :class="{
                                                                    'border-success':
                                                                        x.technicalReviewStatus
                                                                            .toUpperCase()
                                                                            .includes(
                                                                                'APPROVED'
                                                                            ),
                                                                    'border-warning':
                                                                        x.technicalReviewStatus
                                                                            .toUpperCase()
                                                                            .includes(
                                                                                'RETURN'
                                                                            ),
                                                                }"
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
                                                                        x.unitCost
                                                                    )
                                                                }}
                                                            </td>
                                                            <td
                                                                class="
                                                                    border
                                                                    border-start-0
                                                                    border-end-0
                                                                "
                                                                :class="{
                                                                    'border-success':
                                                                        x.technicalReviewStatus
                                                                            .toUpperCase()
                                                                            .includes(
                                                                                'APPROVED'
                                                                            ),
                                                                    'border-warning':
                                                                        x.technicalReviewStatus
                                                                            .toUpperCase()
                                                                            .includes(
                                                                                'RETURN'
                                                                            ),
                                                                }"
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
                                                                        x.total
                                                                    )
                                                                }}
                                                            </td>
                                                            <td
                                                                :class="{
                                                                    'border-success':
                                                                        x.technicalReviewStatus
                                                                            .toUpperCase()
                                                                            .includes(
                                                                                'APPROVED'
                                                                            ),
                                                                    'border-warning':
                                                                        x.technicalReviewStatus
                                                                            .toUpperCase()
                                                                            .includes(
                                                                                'RETURN'
                                                                            ),
                                                                }"
                                                                class="
                                                                    text-center
                                                                    border
                                                                    border-start-0
                                                                "
                                                            >
                                                                <b-dropdown
                                                                    class="
                                                                        card-drop
                                                                    "
                                                                    menu-class="dropdown-menu-end"
                                                                    variant="white"
                                                                    toggle-class="p-0"
                                                                >
                                                                    <template
                                                                        v-slot:button-content
                                                                    >
                                                                        <i
                                                                            class="
                                                                                mdi
                                                                                mdi-dots-horizontal
                                                                                font-size-18
                                                                            "
                                                                        ></i>
                                                                    </template>
                                                                    <b-dropdown-item
                                                                        @click="
                                                                            resubmitItem(
                                                                                x
                                                                            )
                                                                        "
                                                                        variant="success"
                                                                        v-if="
                                                                            x.technicalReviewStatus
                                                                                .toUpperCase()
                                                                                .includes(
                                                                                    'RETURN'
                                                                                )
                                                                        "
                                                                        ><i
                                                                            class="
                                                                                bx
                                                                                bx-check
                                                                                font-size-18
                                                                                me-1
                                                                            "
                                                                        ></i
                                                                        >Resubmit
                                                                        Item</b-dropdown-item
                                                                    >
                                                                    <b-dropdown-item
                                                                        @click="
                                                                            viewItemLogs(
                                                                                x
                                                                            )
                                                                        "
                                                                        variant="dark"
                                                                        ><i
                                                                            class="
                                                                                bx
                                                                                bx-menu-alt-right
                                                                                font-size-18
                                                                                me-1
                                                                            "
                                                                        ></i
                                                                        >View
                                                                        Logs</b-dropdown-item
                                                                    >
                                                                    <b-dropdown-item
                                                                        @click="
                                                                            updateResourceItem(
                                                                                x
                                                                            )
                                                                        "
                                                                        v-if="
                                                                            (selectedPPMPStatus !==
                                                                                'POSTED' &&
                                                                                selectedPPMPStatus !==
                                                                                    'APPROVED') ||
                                                                            x.technicalReviewStatus
                                                                                .toUpperCase()
                                                                                .includes(
                                                                                    'RETURN'
                                                                                )
                                                                        "
                                                                        variant="dark"
                                                                        ><i
                                                                            class="
                                                                                bx
                                                                                bx-edit
                                                                                font-size-18
                                                                                me-1
                                                                            "
                                                                        ></i
                                                                        >Edit</b-dropdown-item
                                                                    >
                                                                    <b-dropdown-item
                                                                        @click="
                                                                            updateResourceItem(
                                                                                x,
                                                                                'view'
                                                                            )
                                                                        "
                                                                        v-if="
                                                                            (selectedPPMPStatus ===
                                                                                'POSTED' ||
                                                                                selectedPPMPStatus ===
                                                                                    'APPROVED') &&
                                                                            !x.technicalReviewStatus
                                                                                .toUpperCase()
                                                                                .includes(
                                                                                    'RETURN'
                                                                                )
                                                                        "
                                                                        variant="dark"
                                                                        ><i
                                                                            class="
                                                                                bx
                                                                                bx-food-menu
                                                                                font-size-18
                                                                                me-1
                                                                            "
                                                                        ></i
                                                                        >View
                                                                        Details</b-dropdown-item
                                                                    >
                                                                    <b-dropdown-item
                                                                        @click="
                                                                            deleteResourceItem(
                                                                                x
                                                                            )
                                                                        "
                                                                        variant="danger"
                                                                        v-if="
                                                                            (selectedPPMPStatus !==
                                                                                'POSTED' &&
                                                                                selectedPPMPStatus !==
                                                                                    'APPROVED') ||
                                                                            x.technicalReviewStatus
                                                                                .toUpperCase()
                                                                                .includes(
                                                                                    'RETURN'
                                                                                )
                                                                        "
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
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="row mb-3">
                                    <div class="col mb-3">
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
                                                    :total-rows="
                                                        rowsResourceItem
                                                    "
                                                    :per-page="perPageItem"
                                                ></b-pagination>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </b-col>
                        </b-row>
                    </slide>
                </carousel>
            </div>
        </div>
        <api-type @dropData="dropType($event)"></api-type>
        <item-list @dropData="dropItem($event)"></item-list>
        <unit ref="unit" @dropData="dropUnit($event)"></unit>
        <item-category @dropData="dropItemCat($event)"></item-category>
        <api-resource-logs ref="itemlog"></api-resource-logs>
        <back-log-modal
            ref="backlog"
            @dropData="dropWork($event)"
        ></back-log-modal>
        <print-options ref="printOpt"></print-options>
    </Layout>
</template>
