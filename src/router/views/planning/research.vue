<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import Swal from "sweetalert2";
import { cloneDeep } from "lodash";
import { required } from "vuelidate/lib/validators";
import DatePicker from "vue2-datepicker";
import ResearchCategory from "@/components/modals/research-category";
import PublisherModal from "@/components/modals/publisher";
import BeneficiaryModal from "@/components/modals/beneficiary.vue";
import ProductCategory from "@/components/modals/product-category.vue";
import PrintOptions from "@/components/modals/print-options.vue";

export default {
    page: {
        title: "Research",
    },
    components: {
        Layout,
        PageHeader,
        ResearchCategory,
        PublisherModal,
        DatePicker,
        BeneficiaryModal,
        ProductCategory,
        PrintOptions
    },
    data() {
        return {
            title: "Research List",
            submitted: false,
            items: [
                {
                    text: "Dashboards",
                    href: "/",
                },
                {
                    text: "Research",
                    active: true,
                },
            ],
            tableData: [],
            modalTitle: "",
            totalRows: 1,
            currentPage: 1,
            filter: "",
            filterOn: [],
            sortBy: "title",
            sortDesc: false,
            fields: [
                {
                    key: "title",
                    sortable: true,
                    label: "Research Title",
                    thStyle: { width: "31%" },
                },
                {
                    key: "abstract",
                    sortable: true,
                    thStyle: { width: "31%" },
                },
                {
                    key: "description",
                    sortable: true,
                    thStyle: { width: "31%" },
                },
                {
                    key: "actions",
                    thStyle: { width: "7%" },
                },
            ],
            pubFields: [
                {
                    key: "articleTitle",
                    sortable: true,
                },
                {
                    key: "actions",
                    thStyle: { width: "7%" },
                },
            ],
            form: {
                id: 0,
                title: "",
                description: "",
                author1: "",
                author2: "",
                author3: "",
                author4: "",
                author5: "",
                abstract: "",
                dateStarted: "",
                isCompleted: false,
                dateCompleted: "",
                isPresented: false,
                datePresented: "",
                presentationVenue: "",
                researchCategoryId: "",
            },
            publication: {
                articleTitle: "",
                researchId: 0,
                publicationDate: "",
                publisherId: "",
                volumeIssueNo: "",
                isbn: "",
                indexNo: "",
            },
            indexSelected: -1,
            tableBusy: false,
            researchCategory: "",
            researchCategoryId: "",
            publisher: "",
            publisherId: "",
            researchId: 0,
            pubTableBusy: false,
            pubIndex: -1,
            view: 1,
            categories: [],
            showDetail: false,
            selectedResearch: 0,
            filterByCategory: 0,
            loadCategory: false,
            productCategory: "",
            beneficiary: "",
            productTableBusy: false,
            product: {
                id: 0,
                name: "",
                description: "",
                beneficiaryId: "",
                productCategoryId: "",
                researchId: 0,
                dateStartUtilize: "",
            },
            prodIndex: -1,
            publications: [],
            products: [],
            reports: '',
            groupCampus: '',
            groupDU: '',
            allCampus: [],
            allDU: []
        };
    },
    validations: {
        form: {
            title: { required },
            description: { required },
            abstract: { required },
            dateStarted: { required },
            researchCategoryId: { required },
        },
        publication: {
            articleTitle: { required },
            publicationDate: { required },
            publisherId: { required },
            volumeIssueNo: { required },
            isbn: { required },
            indexNo: { required },
        },
        product: {
            name: { required },
            description: { required },
            beneficiaryId: { required },
            productCategoryId: { required },
            dateStartUtilize: { required },
        },
        dateCompleted: {required}
    },
    computed: {
        filteredResearch() {
            let data = this.tableData;
            var total = this.currentPage * 4;
            if (this.filter.trim() != "" && this.filter) {
                data = data.filter((item) => {
                    return item.title
                        .toUpperCase()
                        .includes(this.filter.toUpperCase());
                });
            }
            if (this.filterByCategory > 0) {
                data = data.filter((item) => {
                    return item.researchCategoryId == this.filterByCategory;
                });
            }
            var currentData = data.slice(total - 4, total);
            if (this.currentPage > 1 && currentData.length == 0) {
                total = (this.currentPage - 1) * 4;
                currentData = data.slice(total - 4, total);
            }
            return currentData;
        },
        rows() {
            if (
                (this.filter.trim() != "" && this.filter) ||
                this.filterByCategory > 0
            ) {
                return this.filteredResearch.length;
            } else {
                return this.tableData.length;
            }
        },
    },
    created() {
        this.totalRows = this.items.length;
        this.loadCategory = true;
        this.getByCat(0);
        this.$store
            .dispatch("researchcategory/GetResearchCategory")
            .then((res) => {
                this.categories = res.data;
                this.loadCategory = false;
            })
            .catch(() => {
                this.showToast("Something went wrong!","error");
                this.loadCategory = false;
            });
        this.$store
            .dispatch("campus/GetCampus")
            .then((res) => {
                this.allCampus = res.data;
            });
        this.$store
            .dispatch("deliveryunit/GetDeliveryUnit")
            .then((res) => {
                this.allDU = res.data;
            });
    },
    methods: {
        addRs() {
            this.onReset();
            this.modalTitle = "Create New Research";
            this.$bvModal.show("modal-standard");
        },
        onCreate() {
            this.submitted = true;
            this.$v.form.$touch();
            if (this.$v.form.$invalid) {
                return;
            }
            if(this.form.isCompleted){
                if (this.$v.dateCompleted.$invalid) {
                    return;
                }
            }
            var data = cloneDeep(this.form);
            data.dateCompleted = this.form.isCompleted
                ? this.getDate(this.form.dateCompleted)
                : this.getDate(new Date());
            data.datePresented = this.form.isPresented
                ? this.getDate(this.form.datePresented)
                : this.getDate(new Date());
            if (this.form.id > 0) {
                this.$store
                    .dispatch("research/UpdateResearch", data)
                    .then((res) => {
                        this.tableData.splice(
                            this.indexSelected,
                            1,
                            res.data
                        );
                        this.$bvModal.hide("modal-standard");
                        this.showToast("Successfully updated!","success");
                    })
                    .catch((err) => {
                        this.showToast("Something went wrong!","error");
                    });
            } else {
                this.$store
                    .dispatch("research/CreateResearch", data)
                    .then((res) => {
                        res.data.publications = [];
                        res.data.products = [];
                        this.tableData.push(res.data);
                        this.$bvModal.hide("modal-standard");
                        this.showToast("Successfully created!","success");
                    })
                    .catch((err) => {
                        this.showToast("Something went wrong!","error");
                    });
            }
            this.submitted = false;
        },
        onReset() {
            this.showDetail = false;
            this.form = {
                id: 0,
                title: "",
                description: "",
                author1: "",
                author2: "",
                author3: "",
                author4: "",
                author5: "",
                abstract: "",
                dateStarted: "",
                isCompleted: false,
                dateCompleted: "",
                isPresented: false,
                datePresented: "",
                presentationVenue: "",
                researchCategoryId: "",
                publications: [],
                products: [],
            };
            this.researchCategory = "";
        },
        onPubReset() {
            this.publication = {
                articleTitle: "",
                researchId: 0,
                publicationDate: "",
                publisherId: "",
                volumeIssueNo: "",
                isbn: "",
                indexNo: "",
            };
            this.publisher = "";
            this.publisherId = "";
            this.researchId = "";
        },
        updateItem(row) {
            this.form = cloneDeep(row);
            this.indexSelected = this.tableData.indexOf(row);
            this.selectedResearch = row.id;
            this.form.dateStarted = new Date(row.dateStarted);
            this.form.dateCompleted = new Date(row.dateCompleted);
            this.form.datePresented = new Date(row.datePresented);
            this.modalTitle = "Update Research";
            this.$bvModal.show("modal-standard");
        },
        hideModal() {
            this.$bvModal.hide("modal-standard");
        },
        deleteItem(props) {
            var index = this.tableData.indexOf(props);
            this.selectedResearch = props.id;
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
                        .dispatch("research/DeleteResearch", props.id)
                        .then((res) => {
                            if (res.status == 204) {
                                this.tableData.splice(index, 1);
                                this.showToast("Successfully deleted!","success");
                            }
                        })
                        .catch((err) => {
                            this.showToast("Cannot be deleted!","error");
                        });
                }
            });
        },
        getRc() {
            this.$bvModal.show("research-category-modal");
        },
        dropData(data) {
            this.researchCategory = data.category;
            this.researchCategoryId = data.id;
            this.form.researchCategoryId = data.id;
        },
        dropDataPub(data) {
            this.publisher = data.name;
            this.publisherId = data.id;
            this.publication.publisherId = data.id;
        },
        async viewDetails(row) {
            this.publications = [];
            this.products = [];
            this.form = cloneDeep(row);
            this.showDetail = true;
            this.selectedResearch = row.id;
            this.indexSelected = this.tableData.indexOf(row);
            this.pubTableBusy = true;
            this.$store
                .dispatch("publication/GetPublicationByResearch", row.id)
                .then((res) => {
                    this.publications = res.data;
                    this.pubTableBusy = false;
                });
            this.productTableBusy = true;
            this.$store.dispatch("product/GetProduct", row.id).then((res) => {
                this.products = res.data;
                this.productTableBusy = false;
            });
        },
        hideDetails() {
            this.showDetail = false;
            this.selectedResearch = 0;
        },
        addPub() {
            this.onPubReset();
            this.researchId = this.form.id;
            this.modalTitle = "Create New Publication";
            this.$bvModal.show("publication-modal");
        },
        addProduct() {
            this.onResetProduct();
            this.modalTitle = "Create New Product";
            this.$bvModal.show("product-modal");
        },
        getPub() {
            this.$bvModal.show("publisher-modal");
        },
        onCreatePublication() {
            this.submitted = true;
            this.$v.publication.$touch();
            if (this.$v.publication.$invalid) {
                return;
            } else {
                var data = cloneDeep(this.publication);
                data.publicationDate = this.getDate(
                    this.publication.publicationDate
                );
                if (this.publication.id > 0) {
                    this.$store
                        .dispatch("publication/UpdatePublication", data)
                        .then((res) => {
                            if (res.data.error) {
                                return this.showToast(res.data.errorMessage,"error");
                            }
                            this.publications.splice(
                                this.pubIndex,
                                1,
                                res.data
                            );
                            this.$bvModal.hide("publication-modal");
                            this.showToast("Successfully updated!","success");
                        })
                        .catch((err) => {
                            this.showToast("Something went wrong!","error");
                        });
                } else {
                    data.researchId = this.researchId;
                    this.$store
                        .dispatch("publication/CreatePublication", data)
                        .then((res) => {
                            if (res.data.error) {
                                return this.showToast(res.data.errorMessage,"error");
                            }
                            this.publications.push(res.data);
                            this.$bvModal.hide("publication-modal");
                            this.showToast("Successfully created!","success");
                        })
                        .catch((err) => {
                            this.showToast("Something went wrong!","error");
                        });
                }
                this.submitted = false;
            }
        },
        updatePublication(props, index) {
            this.publication = cloneDeep(props);
            this.publication.publicationDate = new Date(props.publicationDate);
            this.pubIndex = index;
            this.modalTitle = "Update Publication";
            this.$bvModal.show("publication-modal");
        },
        deletePublication(props, index) {
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
                        .dispatch("publication/DeletePublication", props.id)
                        .then((res) => {
                            if (res.status == 204) {
                                this.publications.splice(index, 1);
                                this.showToast("Successfully deleted!","success");
                            }
                        })
                        .catch((err) => {
                            this.showToast("Cannot be deleted!","error");
                        });
                }
            });
        },
        hidePubModal() {
            this.$bvModal.hide("publication-modal");
        },
        getByCat(id) {
            this.tableBusy = true;
            this.filterByCategory = id;
            if (id == 0) {
                this.$store
                    .dispatch(
                        "research/GetResearchByUnit",
                        this.$store.state.data.deliveryUnit.id
                    )
                    .then((res) => {
                        this.tableBusy = false;
                        this.tableData = res.data;
                    })
                    .catch(() => {
                        this.tableBusy = false;
                        this.showToast("Something went wrong!","error");
                    });
            } else {
                this.tableBusy = false;
            }
        },
        getBeneficiary() {
            this.$bvModal.show("beneficiary-modal");
        },
        getPc() {
            this.$bvModal.show("product-category-modal");
        },
        dropPC(data) {
            this.productCategory = data.categoryName;
            this.product.productCategoryId = data.id;
        },
        dropBM(data) {
            this.beneficiary = data.beneficiaryName;
            this.product.beneficiaryId = data.id;
        },
        onResetProduct() {
            this.product = {
                id: 0,
                name: "",
                description: "",
                beneficiaryId: "",
                productCategoryId: "",
                researchId: this.form.id,
                dateStartUtilize: new Date(),
            };
            this.productCategory = "";
            this.beneficiary = "";
        },
        async onCreateProduct() {
            this.submitted = true;
            this.$v.product.$touch();
            if (this.$v.product.$invalid) {
                return;
            } else {
                if (this.product.id > 0) {
                    await this.$store
                        .dispatch("product/UpdateProduct", this.product)
                        .then((res) => {
                            this.products.splice(this.prodIndex, 1, res.data);
                            this.$bvModal.hide("product-modal");
                            this.showToast("Successfully updated!","success");
                        })
                        .catch((err) => {
                            this.showToast("Something went wrong!","error");
                        });
                } else {
                    await this.$store
                        .dispatch("product/CreateProduct", this.product)
                        .then((res) => {
                            this.products.push(res.data);
                            this.$bvModal.hide("product-modal");
                            this.showToast("Successfully created!","success");
                        })
                        .catch((err) => {
                            this.showToast("Something went wrong!","error");
                        });
                }
                this.submitted = false;
            }
        },
        updateProduct(props, index) {
            this.product = cloneDeep(props);
            this.product.dateStartUtilize = new Date(props.dateStartUtilize);
            this.beneficiary = props.beneficiary.beneficiaryName;
            this.productCategory = props.productCategory.categoryName;
            this.prodIndex = index;
            this.modalTitle = "Update Product";
            this.$bvModal.show("product-modal");
        },
        deleteProduct(props, index) {
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
                        .dispatch("product/DeleteProduct", props.id)
                        .then((res) => {
                            if (res.status == 204) {
                                this.products.splice(index, 1);
                                this.showToast("Successfully deleted!","success");
                            }
                        })
                        .catch((err) => {
                            this.showToast("Cannot be deleted!","error");
                        });
                }
            });
        },
        async printBar1Research(type, id) {
            var apiUrl = '';
            let routeVariables = [id];
            if(type === 'campus'){
                apiUrl = `api/Program/Print/Bar1/Accreditation/UnderGrad/Campus`
            }else{
                apiUrl = `api/Program/Print/Bar1/Accreditation/UnderGrad/DeliveryUnit`
            }
            this.$refs.printOpt.putOptions({apiUrl: apiUrl, routeVariables: routeVariables})
            this.$bvModal.show('print-options-modal')
        },
        async printBar1PRO(type, id){
            var apiUrl = '';
            let routeVariables = [this.$store.state.data.cycle, id];
            if(type === 'campus'){
                apiUrl = `api/Outcome/Print/Bar1/PhysicalReport/Operation/Campus`
            }else{
                apiUrl = `api/Outcome/Print/Bar1/PhysicalReport/Operation/DeliveryUnit`
            }
            this.$refs.printOpt.putOptions({apiUrl: apiUrl, routeVariables: routeVariables})
            this.$bvModal.show('print-options-modal')
        }
    },
};
</script>

<template>
    <Layout>
        <PageHeader :title="title" :items="items" />
        <b-modal
            id="modal-standard"
            :title="modalTitle"
            size="xl"
            title-class="font-18"
            hide-footer
            no-close-on-backdrop
        >
            <form
                @submit.prevent="onCreate"
                class="needs-validation"
                ref="fcForm"
            >
                <div class="row mb-3">
                    <div class="col">
                        <label for="title">Title </label>
                        <textarea
                            id="title"
                            rows="3"
                            v-model="form.title"
                            placeholder="Enter Title..."
                            class="form-control"
                            :class="{
                                'is-invalid': submitted && $v.form.title.$error,
                            }"
                        ></textarea>
                        <div
                            v-if="submitted && $v.form.title.$error"
                            class="invalid-feedback"
                        >
                            <span v-if="!$v.form.title.required"
                                >This value is required.</span
                            >
                        </div>
                    </div>
                    <div class="col">
                        <label for="abstract">Abstract </label>
                        <textarea
                            id="abstract"
                            rows="3"
                            v-model="form.abstract"
                            placeholder="Enter Abstract..."
                            class="form-control"
                            :class="{
                                'is-invalid':
                                    submitted && $v.form.abstract.$error,
                            }"
                            :maxlength="500"
                        ></textarea>
                        <div class="text-center">
                            <p
                                v-if="form.abstract"
                                class="badge position-absolute"
                                :class="{
                                    'bg-success': form.abstract.length !== 500,
                                    'bg-danger': form.abstract.length === 500,
                                }"
                            >
                                {{ form.abstract.length }} / 500
                            </p>
                        </div>
                        <div
                            v-if="submitted && $v.form.abstract.$error"
                            class="invalid-feedback"
                        >
                            <span v-if="!$v.form.abstract.required"
                                >This value is required.</span
                            >
                        </div>
                    </div>
                </div>
                <div class="mb-3">
                    <label for="description">Description </label>
                    <input
                        autocomplete="off"
                        id="description"
                        type="text"
                        v-model="form.description"
                        placeholder="Enter Description..."
                        class="form-control"
                        :class="{
                            'is-invalid':
                                submitted && $v.form.description.$error,
                        }"
                    />
                    <div
                        v-if="submitted && $v.form.description.$error"
                        class="invalid-feedback"
                    >
                        <span v-if="!$v.form.description.required"
                            >This value is required.</span
                        >
                    </div>
                </div>
                <div class="row mb-3">
                    <div class="col">
                        <label for="author1">Author 1 </label>
                        <input
                            autocomplete="off"
                            id="author1"
                            type="text"
                            v-model="form.author1"
                            placeholder="Enter Author 1..."
                            class="form-control"
                        />
                        <!-- <div v-if="submitted && $v.form.author1.$error" class="invalid-feedback" >
                        <span v-if="!$v.form.author1.required">This value is required.</span>
                    </div> -->
                    </div>
                    <div class="col">
                        <label for="author2">Author 2 </label>
                        <input
                            autocomplete="off"
                            id="author2"
                            type="text"
                            v-model="form.author2"
                            placeholder="Enter Author 2..."
                            class="form-control"
                        />
                        <!-- <div v-if="submitted && $v.form.author3.$error" class="invalid-feedback" >
                        <span v-if="!$v.form.author3.required">This value is required.</span>
                    </div> -->
                    </div>
                    <div class="col">
                        <label for="author3">Author 3 </label>
                        <input
                            autocomplete="off"
                            id="author3"
                            type="text"
                            v-model="form.author3"
                            placeholder="Enter Author 3..."
                            class="form-control"
                        />
                        <!-- <div v-if="submitted && $v.form.author3.$error" class="invalid-feedback" >
                        <span v-if="!$v.form.author3.required">This value is required.</span>
                    </div> -->
                    </div>
                    <div class="col">
                        <label for="author4">Author 4 </label>
                        <input
                            autocomplete="off"
                            id="author4"
                            type="text"
                            v-model="form.author4"
                            placeholder="Enter Author 1..."
                            class="form-control"
                        />
                        <!-- <div v-if="submitted && $v.form.author4.$error" class="invalid-feedback" >
                        <span v-if="!$v.form.author4.required">This value is required.</span>
                    </div> -->
                    </div>
                    <div class="col">
                        <label for="author5">Author 5 </label>
                        <input
                            autocomplete="off"
                            id="author5"
                            type="text"
                            v-model="form.author5"
                            placeholder="Enter Author 5..."
                            class="form-control"
                        />
                        <!-- <div v-if="submitted && $v.form.author5.$error" class="invalid-feedback" >
                        <span v-if="!$v.form.author5.required">This value is required.</span>
                    </div> -->
                    </div>
                </div>
                <div class="row mb-3">
                    <b-col sm="8">
                        <label for="researchCategory">Research Category </label>
                        <b-input-group>
                            <template #append>
                                <b-button @click="getRc" variant="outline-info"
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
                                placeholder="Search Research Category..."
                                class="form-control"
                                :class="{
                                    'is-invalid':
                                        submitted &&
                                        $v.form.researchCategoryId.$error,
                                }"
                                v-model="researchCategory"
                            />
                        </b-input-group>
                        <div
                            v-if="
                                submitted && $v.form.researchCategoryId.$error
                            "
                            class="invalid-feedback"
                        >
                            <span v-if="!$v.form.researchCategoryId.required"
                                >This value is required.</span
                            >
                        </div>
                    </b-col>
                    <b-col class="col">
                        <label for="boardResNo">Date Started </label>
                        <date-picker
                            v-model="form.dateStarted"
                            :first-day-of-week="1"
                            lang="en"
                            placeholder="Enter Date Started..."
                            :class="{
                                'is-invalid':
                                    submitted && $v.form.dateStarted.$error,
                            }"
                        ></date-picker>
                        <div
                            v-if="submitted && $v.form.dateStarted.$error"
                            class="invalid-feedback"
                        >
                            <span v-if="!$v.form.dateStarted.required"
                                >This value is required.</span
                            >
                        </div>
                    </b-col>
                </div>
                <div class="row mb-3">
                    <b-col sm="3">
                        <input
                            class="form-check-input mb-1"
                            type="checkbox"
                            id="isCompleted"
                            v-model="form.isCompleted"
                        />&nbsp;&nbsp;
                        <label class="form-check-label mb-1" for="isCompleted"
                            >Is Completed?</label
                        >
                        <date-picker
                            v-if="form.isCompleted"
                            v-model="form.dateCompleted"
                            :first-day-of-week="1"
                            lang="en"
                            placeholder="Enter Date Completed..."
                        ></date-picker>
                        <div v-if="submitted && $v.dateCompleted.$error" class="invalid-feedback" >
                            <span v-if="!$v.dateCompleted.required">This value is required.</span>
                        </div>
                    </b-col>
                    <b-col sm="3">
                        <input
                            class="form-check-input mb-1"
                            type="checkbox"
                            id="isPresented"
                            v-model="form.isPresented"
                        />&nbsp;&nbsp;
                        <label class="form-check-label mb-1" for="isPresented"
                            >Is Presented?</label
                        >
                        <date-picker
                            v-if="form.isPresented"
                            v-model="form.datePresented"
                            :first-day-of-week="1"
                            lang="en"
                            placeholder="Enter Date Completed..."
                        ></date-picker>
                        <!-- <div v-if="submitted && $v.form.datePresented.$error" class="invalid-feedback" >
                        <span v-if="!$v.form.datePresented.required">This value is required.</span>
                    </div> -->
                    </b-col>
                    <b-col v-if="form.isPresented">
                        <label for="presentationVenue" class="mb-1"
                            >Presentation Venue
                        </label>
                        <input
                            autocomplete="off"
                            id="presentationVenue"
                            type="text"
                            v-model="form.presentationVenue"
                            placeholder="Enter Presentation Venue..."
                            class="form-control"
                        />
                        <!-- <div v-if="submitted && $v.form.presentationVenue.$error" class="invalid-feedback" >
                        <span v-if="!$v.form.presentationVenue.required">This value is required.</span>
                    </div> -->
                    </b-col>
                </div>
                <div class="modal-footer">
                    <button type="submit" class="btn btn-primary">
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
        <b-modal
            id="publication-modal"
            :title="modalTitle"
            size="md"
            title-class="font-18"
            hide-footer
            no-close-on-backdrop
        >
            <form
                @submit.prevent="onCreatePublication"
                class="needs-validation"
                ref="publicationForm"
            >
                <div class="mb-3">
                    <label for="articleTitle">Article Title </label>
                    <input
                        autocomplete="off"
                        id="articleTitle"
                        type="text"
                        v-model="publication.articleTitle"
                        placeholder="Enter Article Name..."
                        class="form-control"
                        :class="{
                            'is-invalid':
                                submitted && $v.publication.articleTitle.$error,
                        }"
                    />
                    <div
                        v-if="submitted && $v.publication.articleTitle.$error"
                        class="invalid-feedback"
                    >
                        <span v-if="!$v.publication.articleTitle.required"
                            >This value is required.</span
                        >
                    </div>
                </div>
                <div class="mb-3">
                    <label for="boardResNo">Date Published </label>
                    <date-picker
                        v-model="publication.publicationDate"
                        :first-day-of-week="1"
                        lang="en"
                        placeholder="Enter Date Published..."
                        :class="{
                            'is-invalid':
                                submitted &&
                                $v.publication.publicationDate.$error,
                        }"
                    ></date-picker>
                    <div
                        v-if="
                            submitted && $v.publication.publicationDate.$error
                        "
                        class="invalid-feedback"
                    >
                        <span v-if="!$v.publication.publicationDate.required"
                            >This value is required.</span
                        >
                    </div>
                </div>
                <div class="mb-3">
                    <label for="researchCategory">Publisher </label>
                    <b-input-group>
                        <template #append>
                            <b-button @click="getPub" variant="outline-info"
                                ><i
                                    class="
                                        mdi mdi-clipboard-text-search-outline
                                    "
                                ></i
                            ></b-button>
                        </template>
                        <input
                            autocomplete="off"
                            type="text"
                            disabled
                            placeholder="Search Publisher..."
                            class="form-control"
                            :class="{
                                'is-invalid':
                                    submitted &&
                                    $v.publication.publisherId.$error,
                            }"
                            v-model="publisher"
                        />
                    </b-input-group>
                    <div
                        v-if="submitted && $v.publication.publisherId.$error"
                        class="invalid-feedback"
                    >
                        <span v-if="!$v.publication.publisherId.required"
                            >This value is required.</span
                        >
                    </div>
                </div>
                <div class="mb-3">
                    <label for="volumeIssueNo">Volume Issue No </label>
                    <input
                        autocomplete="off"
                        id="volumeIssueNo"
                        type="text"
                        v-model="publication.volumeIssueNo"
                        placeholder="Enter Volume Issue No..."
                        class="form-control"
                        :class="{
                            'is-invalid':
                                submitted &&
                                $v.publication.volumeIssueNo.$error,
                        }"
                    />
                    <div
                        v-if="submitted && $v.publication.volumeIssueNo.$error"
                        class="invalid-feedback"
                    >
                        <span v-if="!$v.publication.volumeIssueNo.required"
                            >This value is required.</span
                        >
                    </div>
                </div>
                <div class="mb-3">
                    <label for="isbn">ISBN </label>
                    <input
                        autocomplete="off"
                        id="isbn"
                        type="text"
                        v-model="publication.isbn"
                        placeholder="Enter ISBN..."
                        class="form-control"
                        :class="{
                            'is-invalid':
                                submitted && $v.publication.isbn.$error,
                        }"
                    />
                    <div
                        v-if="submitted && $v.publication.articleTitle.$error"
                        class="invalid-feedback"
                    >
                        <span v-if="!$v.publication.articleTitle.required"
                            >This value is required.</span
                        >
                    </div>
                </div>
                <div class="mb-3">
                    <label for="indexNo">Index No </label>
                    <input
                        autocomplete="off"
                        id="indexNo"
                        type="text"
                        v-model="publication.indexNo"
                        placeholder="Enter Index No..."
                        class="form-control"
                        :class="{
                            'is-invalid':
                                submitted && $v.publication.indexNo.$error,
                        }"
                    />
                    <div
                        v-if="submitted && $v.publication.indexNo.$error"
                        class="invalid-feedback"
                    >
                        <span v-if="!$v.publication.indexNo.required"
                            >This value is required.</span
                        >
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="submit" class="btn btn-primary">
                        Save changes
                    </button>
                    <button
                        type="button"
                        class="btn btn-link"
                        @click="hidePubModal"
                    >
                        Close
                    </button>
                </div>
            </form>
        </b-modal>
        <b-modal
            id="product-modal"
            :title="modalTitle"
            size="md"
            title-class="font-18"
            hide-footer
            no-close-on-backdrop
        >
            <form
                @submit.prevent="onCreateProduct"
                class="needs-validation"
                ref="prodForm"
            >
                <div class="mb-3">
                    <label for="name">Name </label>
                    <input
                        autocomplete="off"
                        id="name"
                        type="text"
                        v-model="product.name"
                        placeholder="Enter Name..."
                        class="form-control"
                        :class="{
                            'is-invalid': submitted && $v.product.name.$error,
                        }"
                    />
                    <div
                        v-if="submitted && $v.product.name.$error"
                        class="invalid-feedback"
                    >
                        <span v-if="!$v.product.name.required"
                            >This value is required.</span
                        >
                    </div>
                </div>
                <div class="mb-3">
                    <label for="description">Description </label>
                    <input
                        autocomplete="off"
                        id="description"
                        type="text"
                        v-model="product.description"
                        placeholder="Enter Description..."
                        class="form-control"
                        :class="{
                            'is-invalid':
                                submitted && $v.product.description.$error,
                        }"
                    />
                    <div
                        v-if="submitted && $v.product.description.$error"
                        class="invalid-feedback"
                    >
                        <span v-if="!$v.product.description.required"
                            >This value is required.</span
                        >
                    </div>
                </div>
                <div class="mb-3">
                    <label for="beneficiaryId">Beneficiary </label>
                    <b-input-group>
                        <template #append>
                            <b-button
                                @click="getBeneficiary"
                                variant="outline-info"
                                ><i
                                    class="
                                        mdi mdi-clipboard-text-search-outline
                                    "
                                ></i
                            ></b-button>
                        </template>
                        <input
                            autocomplete="off"
                            type="text"
                            disabled
                            placeholder="Search Beneficiary..."
                            class="form-control"
                            :class="{
                                'is-invalid':
                                    submitted &&
                                    $v.product.beneficiaryId.$error,
                            }"
                            v-model="beneficiary"
                        />
                    </b-input-group>
                    <div
                        v-if="submitted && $v.product.beneficiaryId.$error"
                        class="invalid-feedback"
                    >
                        <span v-if="!$v.product.beneficiaryId.required"
                            >This value is required.</span
                        >
                    </div>
                </div>
                <div class="mb-3">
                    <label for="beneficiaryId">Category </label>
                    <b-input-group>
                        <template #append>
                            <b-button @click="getPc" variant="outline-info"
                                ><i
                                    class="
                                        mdi mdi-clipboard-text-search-outline
                                    "
                                ></i
                            ></b-button>
                        </template>
                        <input
                            autocomplete="off"
                            type="text"
                            disabled
                            placeholder="Search Product Category..."
                            class="form-control"
                            :class="{
                                'is-invalid':
                                    submitted &&
                                    $v.product.productCategoryId.$error,
                            }"
                            v-model="productCategory"
                        />
                    </b-input-group>
                    <div
                        v-if="submitted && $v.product.productCategoryId.$error"
                        class="invalid-feedback"
                    >
                        <span v-if="!$v.product.productCategoryId.required"
                            >This value is required.</span
                        >
                    </div>
                </div>
                <div class="mb-3">
                    <label for="boardResNo">Date Utilize </label>
                    <date-picker
                        v-model="product.dateStartUtilize"
                        :first-day-of-week="1"
                        lang="en"
                        placeholder="Enter Date Utilize..."
                        :class="{
                            'is-invalid':
                                submitted && $v.product.dateStartUtilize.$error,
                        }"
                    ></date-picker>
                    <div
                        v-if="submitted && $v.product.dateStartUtilize.$error"
                        class="invalid-feedback"
                    >
                        <span v-if="!$v.product.dateStartUtilize.required"
                            >This value is required.</span
                        >
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="submit" class="btn btn-primary">
                        Save changes
                    </button>
                    <button
                        type="button"
                        class="btn btn-link"
                        @click="$bvModal.hide('product-modal')"
                    >
                        Close
                    </button>
                </div>
            </form>
        </b-modal>
        <div class="row">
            <div :class="{ 'col-4': showDetail, 'col-12': !showDetail }">
                <div class="row">
                    <div
                        :class="{ 'col-12': showDetail, 'col-3': !showDetail }"
                    >
                        <div class="card">
                            <div class="card-body p-4">
                                <div class="search-box">
                                    <p class="text-muted">Search</p>
                                    <div class="position-relative">
                                        <input
                                            autocomplete="off"
                                            type="text"
                                            class="
                                                form-control
                                                rounded
                                                border-light
                                            "
                                            placeholder="Search Research..."
                                            v-model="filter"
                                        />
                                        <i
                                            class="mdi mdi-magnify search-icon"
                                        ></i>
                                    </div>
                                </div>

                                <hr class="my-3" />
                                <button
                                    type="button"
                                    @click="addRs()"
                                    class="
                                        btn btn-md btn-block btn-primary
                                        d-flex
                                        align-items-center
                                        justify-content-center
                                    "
                                >
                                    <i class="bx bx-plus fs-6"></i>Create New
                                    Research
                                </button>
                                <hr class="my-3" v-if="!showDetail" />

                                <div v-if="!showDetail">
                                    <p class="text-muted mb-0">Categories</p>
                                    <b-skeleton-wrapper :loading="loadCategory">
                                        <template #loading>
                                            <ul class="list-unstyled fw-medium">
                                                <li class="mb-3">
                                                    <b-skeleton
                                                        width="90%"
                                                    ></b-skeleton>
                                                </li>
                                                <li class="mb-3">
                                                    <b-skeleton
                                                        width="70%"
                                                    ></b-skeleton>
                                                </li>
                                                <li>
                                                    <b-skeleton
                                                        width="90%"
                                                    ></b-skeleton>
                                                </li>
                                            </ul>
                                        </template>
                                    </b-skeleton-wrapper>
                                    <ul
                                        class="list-unstyled fw-medium"
                                        v-if="!loadCategory"
                                    >
                                        <li>
                                            <a
                                                href="javascript:void(0);"
                                                class="py-2 d-block"
                                                :class="{
                                                    'text-primary':
                                                        filterByCategory == 0,
                                                    'text-muted':
                                                        filterByCategory > 0,
                                                }"
                                                @click="getByCat(0)"
                                                ><i
                                                    class="
                                                        mdi mdi-chevron-right
                                                        me-1
                                                    "
                                                ></i>
                                                All</a
                                            >
                                        </li>
                                        <li v-for="x in categories" :key="x.id">
                                            <a
                                                href="javascript:void(0);"
                                                class="py-2 d-block"
                                                :class="{
                                                    'text-primary':
                                                        filterByCategory ==
                                                        x.id,
                                                    'text-muted':
                                                        filterByCategory !=
                                                        x.id,
                                                }"
                                                @click="getByCat(x.id)"
                                                ><i
                                                    class="
                                                        mdi mdi-chevron-right
                                                        me-1
                                                    "
                                                ></i>
                                                {{ x.category }}</a
                                            >
                                        </li>
                                    </ul>
                                </div>

                                <div>
                                    <p class="text-muted mb-0">Reports</p>
                                    <select class="form-select mt-2" v-model="reports">
                                        <option value="">Report By</option>
                                        <option value="1">Campus</option>
                                        <option value="2">Delivery Unit</option>
                                    </select>
                                    <div v-if="reports == 1">
                                        <select class="form-select mt-2 mb-2" v-model="groupCampus">
                                            <option value="">Select Campus</option>
                                            <option v-for="x in allCampus" :key="x.id" :value="x.id">{{x.campusName}}</option>
                                        </select>
                                        <b-dropdown
                                            id="dropdown-dropleft"
                                            right
                                            variant="outline-purple"
                                            toggle-class="text-decoration-none"
                                            menu-class="dropdown-menu-end"
                                            no-caret
                                            class="w-100"
                                            v-if="groupCampus > 0"
                                        >
                                            <template #button-content>
                                                <i class="bx bx-printer me-1"></i> Reports for Bar 1 Campus
                                            </template>
                                            <!-- <b-dropdown-item @click="printBar1Research('campus', groupCampus)">Research</b-dropdown-item> -->
                                            <b-dropdown-item @click="printBar1PRO('campus', groupCampus)">Physical Report Operations</b-dropdown-item>
                                        </b-dropdown>
                                    </div>
                                    <div v-if="reports == 2">
                                        <select class="form-select mt-2 mb-2" v-model="groupDU">
                                            <option value="">Select Delivery Unit</option>
                                            <option v-for="x in allDU" :key="x.id" :value="x.id">{{x.name}}</option>
                                        </select>
                                        <b-dropdown
                                            id="dropdown-dropleft"
                                            right
                                            variant="outline-purple"
                                            toggle-class="text-decoration-none"
                                            menu-class="dropdown-menu-end"
                                            no-caret
                                            class="w-100"
                                            v-if="groupDU > 0"
                                        >
                                            <template #button-content>
                                                <i class="bx bx-printer me-1"></i> Reports for Bar 1 Delivery Unit
                                            </template>
                                            <b-dropdown-item @click="printBar1PRO('du', groupDU)">Physical Report Operations</b-dropdown-item>
                                        </b-dropdown>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <!-- end card -->
                    </div>
                    <div
                        :class="{ 'col-12': showDetail, 'col-9': !showDetail }"
                    >
                        <div class="row">
                            <div
                                :class="{
                                    'col-12': showDetail,
                                    'col-6': !showDetail,
                                }"
                            >
                                <b-skeleton-wrapper :loading="tableBusy">
                                    <template #loading>
                                        <b-card>
                                            <div class="mb-4 mt-2">
                                                <b-skeleton
                                                    width="100%"
                                                    height="24px"
                                                ></b-skeleton>
                                                <b-skeleton
                                                    width="50%"
                                                    height="24px"
                                                ></b-skeleton>
                                            </div>
                                            <b-skeleton
                                                width="95%"
                                                height="12px"
                                                style="float: right"
                                            ></b-skeleton>
                                            <b-skeleton
                                                width="100%"
                                                height="12px"
                                            ></b-skeleton>
                                            <b-skeleton
                                                width="100%"
                                                height="12px"
                                                class="mb-2"
                                            ></b-skeleton>
                                            <div class="d-flex mb-4">
                                                <b-skeleton
                                                    width="20%"
                                                    height="12px"
                                                    class="me-2"
                                                ></b-skeleton>
                                                <b-skeleton
                                                    width="20%"
                                                    height="12px"
                                                    class="me-2"
                                                ></b-skeleton>
                                                <b-skeleton
                                                    width="20%"
                                                    height="12px"
                                                    class="me-2"
                                                ></b-skeleton>
                                            </div>
                                            <b-skeleton
                                                width="100%"
                                                height="14px"
                                                class="mb-2"
                                            ></b-skeleton>
                                        </b-card>
                                    </template>
                                </b-skeleton-wrapper>
                            </div>
                            <div
                                :class="{
                                    'col-12': showDetail,
                                    'col-6': !showDetail,
                                }"
                            >
                                <b-skeleton-wrapper :loading="tableBusy">
                                    <template #loading>
                                        <b-card>
                                            <div class="mb-4 mt-2">
                                                <b-skeleton
                                                    width="100%"
                                                    height="24px"
                                                ></b-skeleton>
                                                <b-skeleton
                                                    width="50%"
                                                    height="24px"
                                                ></b-skeleton>
                                            </div>
                                            <b-skeleton
                                                width="95%"
                                                height="12px"
                                                style="float: right"
                                            ></b-skeleton>
                                            <b-skeleton
                                                width="100%"
                                                height="12px"
                                            ></b-skeleton>
                                            <b-skeleton
                                                width="100%"
                                                height="12px"
                                                class="mb-2"
                                            ></b-skeleton>
                                            <div class="d-flex mb-4">
                                                <b-skeleton
                                                    width="20%"
                                                    height="12px"
                                                    class="me-2"
                                                ></b-skeleton>
                                                <b-skeleton
                                                    width="20%"
                                                    height="12px"
                                                    class="me-2"
                                                ></b-skeleton>
                                                <b-skeleton
                                                    width="20%"
                                                    height="12px"
                                                    class="me-2"
                                                ></b-skeleton>
                                            </div>
                                            <b-skeleton
                                                width="100%"
                                                height="14px"
                                                class="mb-2"
                                            ></b-skeleton>
                                        </b-card>
                                    </template>
                                </b-skeleton-wrapper>
                            </div>
                        </div>
                        <div
                            class="row"
                            v-if="!tableBusy && filteredResearch.length > 0"
                        >
                            <div
                                :class="{
                                    'col-12': showDetail,
                                    'col-6': !showDetail,
                                }"
                                v-for="x in filteredResearch"
                                :key="x.id"
                            >
                                <div
                                    class="
                                        card
                                        p-1
                                        border
                                        shadow-none
                                        position-relative
                                    "
                                    :class="{
                                        'border-primary':
                                            x.id === selectedResearch,
                                    }"
                                >
                                    <div class="hide-detail-btn-sm">
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
                                                    class="fas fa-ellipsis-v"
                                                ></i>
                                            </template>
                                            <b-dropdown-item
                                                @click="updateItem(x)"
                                                variant="secondary"
                                                ><i
                                                    class="
                                                        bx bx-edit
                                                        font-size-18
                                                        me-1
                                                    "
                                                ></i
                                                >Edit</b-dropdown-item
                                            >
                                            <b-dropdown-item
                                                @click="deleteItem(x)"
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
                                    </div>
                                    <div class="px-3 pt-4 pb-2">
                                        <h5 class="me-2">{{ x.title }}</h5>
                                        <ul class="list-group list-inline">
                                            <li class="list-inline-item me-3">
                                                <a
                                                    href="javascript:void(0);"
                                                    class="text-muted"
                                                >
                                                    <i
                                                        class="
                                                            fas
                                                            fa-users
                                                            align-middle
                                                            text-muted
                                                            me-1
                                                        "
                                                    ></i>
                                                    {{ x.author1
                                                    }}{{
                                                        x.author2 ? ", " : ""
                                                    }}
                                                    {{ x.author2
                                                    }}{{
                                                        x.author3 ? ", " : ""
                                                    }}
                                                    {{ x.author3
                                                    }}{{
                                                        x.author4 ? ", " : ""
                                                    }}
                                                    {{ x.author4
                                                    }}{{
                                                        x.author5 ? ", " : ""
                                                    }}
                                                    {{ x.author5 }}
                                                </a>
                                            </li>
                                            <li class="list-inline-item me-3">
                                                <a
                                                    href="javascript:void(0);"
                                                    class="text-muted"
                                                >
                                                    <i
                                                        class="
                                                            fas
                                                            fa-clock
                                                            align-middle
                                                            text-muted
                                                            me-1
                                                        "
                                                    ></i>
                                                    {{
                                                        formatDate(
                                                            new Date(
                                                                x.dateStarted
                                                            )
                                                        )
                                                    }}
                                                </a>
                                            </li>
                                        </ul>
                                    </div>

                                    <div class="ps-3 pe-3">
                                        <i v-if="x.abstract.length > 200"
                                            >"{{
                                                x.abstract.substring(0, 200)
                                            }}..."</i
                                        >
                                        <i v-else>"{{ x.abstract }}"</i>
                                    </div>

                                    <div class="p-3">
                                        <div>
                                            <p
                                                v-if="
                                                    x.description.length > 100
                                                "
                                            >
                                                {{
                                                    x.description.substring(
                                                        0,
                                                        100
                                                    )
                                                }}...
                                            </p>
                                            <p v-else>
                                                {{ x.description }}
                                            </p>
                                        </div>
                                        <div>
                                            <a
                                                href="javascript:void(0);"
                                                class="text-primary"
                                                @click="viewDetails(x)"
                                                >Read more
                                                <i
                                                    class="mdi mdi-arrow-right"
                                                ></i
                                            ></a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div
                            class="row"
                            v-if="!tableBusy && filteredResearch.length == 0"
                        >
                            <h5>No data found.</h5>
                        </div>
                        <hr class="my-4" />
                        <div class="text-center">
                            <ul
                                class="
                                    pagination
                                    justify-content-center
                                    pagination-rounded
                                "
                            >
                                <b-pagination
                                    v-model="currentPage"
                                    :total-rows="rows"
                                    per-page="4"
                                ></b-pagination>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-8" v-if="showDetail">
                <div class="card border shadow">
                    <div class="card-body position-relative">
                        <div class="d-flex hide-detail-btn">
                            <a
                                href="javascript:void(0)"
                                @click="hideDetails(row)"
                                title="Hide Details"
                            >
                                <i class="bx bx-x fs-2"></i>
                            </a>
                        </div>
                        <div class="mt-5 mb-4 text-center">
                            <h4>{{ form.title }}</h4>
                            <small>
                                <i>
                                    {{ form.author1
                                    }}{{ form.author2 ? ", " : "" }}
                                    {{ form.author2
                                    }}{{ form.author3 ? ", " : "" }}
                                    {{ form.author3
                                    }}{{ form.author4 ? ", " : "" }}
                                    {{ form.author4
                                    }}{{ form.author5 ? ", " : "" }}
                                    {{ form.author5 }}
                                </i>
                            </small>
                        </div>
                        <div class="mx-5 mb-2">
                            <p><b>Abstract: </b>{{ form.abstract }}</p>
                        </div>
                        <div class="mx-5 mb-4">
                            <b>Details: </b>
                            <div class="ms-5 mt-2">
                                - {{ form.description }}
                            </div>
                            <div class="ms-5 mt-2">
                                - Started on
                                {{ formatDate(new Date(form.dateStarted)) }}
                            </div>
                            <div class="ms-5 mt-2" v-if="form.isCompleted">
                                - Completed on
                                {{ formatDate(new Date(form.dateCompleted)) }}
                            </div>
                            <div class="ms-5 mt-2" v-if="form.isPresented">
                                - Completed on
                                {{ formatDate(new Date(form.datePresented)) }} @
                                {{ form.presentationVenue }}
                            </div>
                        </div>
                        <div class="mx-5 mb-2">
                            <div class="mb-2">
                                <b>Publications: </b
                                ><span v-if="publications.length == 0"
                                    >No data found</span
                                >
                            </div>
                            <div class="row">
                                <div class="col-4">
                                    <div
                                        class="
                                            card
                                            border
                                            shadow
                                            border-primary
                                            cursor-pointer
                                        "
                                        @click="addPub()"
                                    >
                                        <div class="card-body">
                                            <div
                                                class="
                                                    row
                                                    flex-column
                                                    text-center
                                                "
                                            >
                                                <i
                                                    class="
                                                        my-3
                                                        bx bx-plus
                                                        fs-2
                                                        text-primary
                                                    "
                                                ></i>
                                                <p>Add New Publication</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div
                                    class="col-4"
                                    v-for="(y, index) in publications"
                                    :key="y.id"
                                >
                                    <div
                                        class="
                                            card
                                            border
                                            shadow
                                            border-secondary
                                        "
                                    >
                                        <div
                                            class="card-body position-relative"
                                        >
                                            <div
                                                class="
                                                    hide-detail-btn-top-right
                                                "
                                            >
                                                <a
                                                    class="
                                                        badge
                                                        rounded-pill
                                                        bg-secondary bg-gradient
                                                        px-3em
                                                        me-1
                                                    "
                                                    href="javascript:void(0)"
                                                    @click="
                                                        updatePublication(
                                                            y,
                                                            index
                                                        )
                                                    "
                                                    ><i
                                                        class="bx bx-edit fs-5"
                                                    ></i
                                                ></a>
                                                <a
                                                    class="
                                                        badge
                                                        rounded-pill
                                                        bg-danger bg-gradient
                                                        px-3em
                                                    "
                                                    href="javascript:void(0)"
                                                    @click="
                                                        deletePublication(
                                                            y,
                                                            index
                                                        )
                                                    "
                                                    ><i class="bx bx-x fs-5"></i
                                                ></a>
                                            </div>
                                            <div class="text-center mb-2">
                                                <b>{{ y.articleTitle }}</b>
                                            </div>
                                            <div>
                                                <b
                                                    ><i
                                                        class="bx bx-barcode"
                                                    ></i
                                                    >&nbsp;ISBN&nbsp;</b
                                                ><small class="text-dark">{{
                                                    y.isbn
                                                }}</small>
                                            </div>
                                            <div>
                                                <b
                                                    ><i
                                                        class="bx bx-food-menu"
                                                    ></i
                                                    >&nbsp;Index No.&nbsp;</b
                                                ><small class="text-dark">{{
                                                    y.indexNo
                                                }}</small>
                                            </div>
                                            <div>
                                                <b
                                                    ><i
                                                        class="
                                                            bx bx-book-bookmark
                                                        "
                                                    ></i
                                                    >&nbsp;Volume Issue
                                                    No.&nbsp;</b
                                                ><small class="text-dark">{{
                                                    y.volumeIssueNo
                                                }}</small>
                                            </div>
                                            <div>
                                                <b
                                                    ><i
                                                        class="
                                                            bx bx-calendar-event
                                                        "
                                                    ></i
                                                    >&nbsp;Published on
                                                    &nbsp;</b
                                                ><small class="text-dark">{{
                                                    formatDate(
                                                        new Date(
                                                            y.publicationDate
                                                        )
                                                    )
                                                }}</small>
                                            </div>
                                            <div>
                                                <!-- <b>Publisher&nbsp;</b><span class="badge rounded-pill bg-danger">{{y.publisher.name}}</span> -->
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="mx-5 mb-5">
                            <div class="mb-2">
                                <b>Products: </b
                                ><span v-if="products.length == 0"
                                    >No data found</span
                                >
                            </div>
                            <div class="mb-4 text-right">
                                <a
                                    href="javascript:void(0);"
                                    class="
                                        border border-primary
                                        text-primary
                                        p-2
                                    "
                                    @click="addProduct"
                                    ><i class="bx bx-plus"></i> Add More
                                    Products</a
                                >
                            </div>
                            <div v-for="(y, index) in products" :key="y.id">
                                <b-card no-body>
                                    <b-card-header>
                                        <div
                                            class="
                                                d-flex
                                                align-items-center
                                                justify-content-between
                                            "
                                        >
                                            <div>
                                                <h5 class="mb-0">
                                                    {{ y.name }}
                                                </h5>
                                                <p class="mb-0">
                                                    {{ y.description }}
                                                </p>
                                            </div>
                                            <div
                                                class="
                                                    d-flex
                                                    align-items-center
                                                "
                                            >
                                                <a
                                                    href="javascript:void(0);"
                                                    class="
                                                        action-icon
                                                        text-dark
                                                        me-1
                                                    "
                                                    @click="
                                                        updateProduct(y, index)
                                                    "
                                                    ><i
                                                        class="
                                                            mdi
                                                            mdi-square-edit-outline
                                                            font-size-18
                                                        "
                                                    ></i
                                                ></a>
                                                <a
                                                    href="javascript:void(0);"
                                                    class="
                                                        action-icon
                                                        text-danger
                                                    "
                                                    @click="
                                                        deleteProduct(y, index)
                                                    "
                                                    ><i
                                                        class="
                                                            mdi mdi-trash-can
                                                            font-size-18
                                                        "
                                                    ></i
                                                ></a>
                                            </div>
                                        </div>
                                    </b-card-header>
                                    <b-card-body>
                                        <div>
                                            <b
                                                ><i class="bx bx-user-pin"></i
                                                >&nbsp;Beneficiary:&nbsp;</b
                                            ><small class="text-dark">{{
                                                y.beneficiary.beneficiaryName
                                            }}</small>
                                        </div>
                                        <div>
                                            <b
                                                ><i class="bx bx-notepad"></i
                                                >&nbsp;Category:&nbsp;</b
                                            ><small class="text-dark">{{
                                                y.productCategory.categoryName
                                            }}</small>
                                        </div>
                                        <div>
                                            <b
                                                ><i class="bx bx-mail-send"></i
                                                >&nbsp;Utilize @&nbsp;</b
                                            ><small class="text-dark">{{
                                                formatDate(
                                                    new Date(y.dateStartUtilize)
                                                )
                                            }}</small>
                                        </div>
                                    </b-card-body>
                                </b-card>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <research-category @dropData="dropData($event)"></research-category>
        <publisher-modal @dropData="dropDataPub($event)"></publisher-modal>
        <beneficiary-modal @dropData="dropBM($event)"></beneficiary-modal>
        <product-category @dropData="dropPC($event)"></product-category>
        <print-options ref="printOpt"></print-options>
    </Layout>
</template>