<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import Swal from "sweetalert2";
import { cloneDeep } from "lodash";
import { required, numeric } from "vuelidate/lib/validators";
import DatePicker from "vue2-datepicker";
import GraduateYear from "@/components/modals/graduate-year.vue";
import ExaminationModal from "@/components/modals/examination.vue";
import ProgramCategory from "@/components/modals/program-category.vue";
import EmploymentRecord from "@/components/modals/employment-record.vue";
import SurveyLevel from "@/components/modals/survey-level.vue";
import AccreditorModal from "@/components/modals/accreditor.vue";
import XLSX from "xlsx";
import createNumberMask from "text-mask-addons/dist/createNumberMask";
import MaskedInput from "vue-text-mask";
import { saveAs } from "file-saver";
import UploadPopover from "@/components/widgets/upload-popover.vue";
import PrintOptions from "@/components/modals/print-options.vue";

export default {
    page: {
        title: "Programs",
    },
    components: {
        Layout,
        PageHeader,
        DatePicker,
        GraduateYear,
        ProgramCategory,
        ExaminationModal,
        EmploymentRecord,
        SurveyLevel,
        AccreditorModal,
        MaskedInput,
        UploadPopover,
        PrintOptions
    },
    data() {
        return {
            title: "Program List",
            submitted: false,
            items: [
                {
                    text: "Dashboards",
                    href: "/",
                },
                {
                    text: "Program",
                    active: true,
                },
            ],
            tableData: [],
            modalTitle: "",
            totalRows: 1,
            currentPage: 1,
            currentPageStudent: 1,
            perPage: 12,
            pageOptions: [10, 25, 50, 100],
            filter: "",
            filterStudent: "",
            currencyMask: createNumberMask({
                prefix: "",
                includeThousandsSeparator: false,
            }),
            graduateFields: [
                {
                    key: "firstName",
                    sortable: true,
                },
                {
                    key: "middleName",
                    sortable: true,
                },
                {
                    key: "lastName",
                    sortable: true,
                },
                {
                    key: "actions",
                },
            ],
            form: {
                id: 0,
                programName: "",
                shortName: "",
                boardResNo: "",
                dateApproved: "",
                yearOffered: "",
                yearFirstGraduate: "",
                isChedIdentified: false,
                isRdcPriority: false,
                isThesisRequired: false,
                isAccreditable: false,
                isNonBoard: false,
                isOnCampus: false,
                isDistanceLearning: false,
                examinationId: "",
                programCategoryId: "",
                deliveryUnitId: "",
                deliveryUnit: "",
                notes: "",
            },
            indexSelected: -1,
            graduateIndex: -1,
            tableBusy: false,
            agencies: [],
            campuses: [],
            offices: [],
            dus: [],
            graduateId: 0,
            programCategory: "",
            programCategoryId: 0,
            examination: "",
            showDetail: false,
            loadCategory: false,
            categories: [],
            selectedProgram: 0,
            filterByCategory: 0,
            toggleExamSched: false,
            toggleGradStud: false,
            toggleAccred: false,
            toggleExt: false,
            toggleEnrolee: false,
            toggleDocument: false,
            // Exam Sched Data
            examSchedLoading: false,
            examSchedData: [],
            currentPageEs: 1,
            perPageEs: 3,
            filterEs: "",
            examSched: {
                id: 0,
                programId: "",
                examinationId: "",
                venue: "",
                dateFrom: "",
                dateTo: "",
                host: "",
                remarks: "",
            },
            indexSelectedEs: -1,
            // Exam Takers
            taker: {
                id: 0,
                examScheduleId: 0,
                numberOfTakers: "",
                numberOfPassers: "",
            },
            indexTakerSelected: -1,

            // Grad Students
            gradYearBusy: false,
            gradYears: [],
            filterGs: "",
            filterByYear: 0,
            yearSelected: "",
            studentsBusy: false,
            students: [],
            studentIndex: -1,
            student: {
                firstName: "",
                middleName: "",
                lastName: "",
            },
            currentPageStud: 1,
            perPageStud: 12,
            excelList: [],
            errorMessage: false,

            // Extensions
            accredLoading: false,
            accredData: [],
            filterAccred: "",
            perPageAccred: 3,
            currentPageAccred: 1,
            accred: {
                id: 0,
                accreditorId: 0,
                surveyLevelId: 0,
                status: "",
                dateFrom: "",
                dateSurveyed: "",
                score: "",
                dateGranted: "",
                expiry: "",
                remarks: "",
                isCurrent: false,
            },
            accredIndex: -1,
            surveyLevel: "",
            accreditor: "",

            // Extensions
            extensionLoading: false,
            extensionData: [],
            filterExt: "",
            perPageExt: 3,
            currentPageExt: 1,
            ext: {
                id: 0,
                extensionName: "",
                dateFrom: "",
                dateTo: "",
            },
            extensionIndex: -1,

            detailLoading: false,

            // Enrolment
            enrollmentLoading: false,
            enrollmentData: [],
            filterEnrolee: "",
            perPageEnrolee: 3,
            currentPageEnrolee: 1,
            enrollment: {
                programId: 0,
                schoolYear: "",
                semester: "",
                numberOfEnrollees: "",
            },
            enrollmentIndex: -1,
            uploadType: "",

            // Document
            documentLoading: false,
            currentPageDocument: 1,
            perPageDocument: 3,
            filterDocument: "",
            documentData: [],
            addDocument: false,
            selectedExtId: 0,
            uploadExtOptions: {
                type: "Extention Program",
                placement: "lefttop",
                folder: "Planning",
            },
            uploadProgramOptions: {
                type: "Extention Program",
                placement: "lefttop",
                folder: "Planning",
            },
            currentPageCat: 1,
            perPageCat: 3,
            filterCat: '',
            groupings: '',
            allCampus: [],
            allDU: [],
            groupCampus: '',
            groupDU: ''
        };
    },
    validations: {
        form: {
            programName: { required },
            shortName: { required },
            boardResNo: { required },
            dateApproved: { required },
            yearOffered: { required, numeric },
            yearFirstGraduate: { required },
            examinationId: { required },
            programCategoryId: { required },
            deliveryUnitId: { required },
            notes: { required },
            agency: { required },
            campus: { required },
            office: { required },
        },
        examSched: {
            examinationId: { required },
            venue: { required },
            dateFrom: { required },
            dateTo: { required },
            host: { required },
            remarks: { required },
        },
        student: {
            firstName: { required },
            middleName: { required },
            lastName: { required },
        },
        taker: {
            numberOfTakers: { required, numeric },
            numberOfPassers: { required, numeric },
        },
        ext: {
            extensionName: { required },
            dateFrom: { required },
            dateTo: { required },
        },
        accred: {
            accreditorId: { required },
            surveyLevelId: { required },
            // status: { required },
            // dateFrom: { required },
            // dateSurveyed: { required },
            // score: { required, numeric },
            // dateGranted: { required },
            // expiry: { required },
            remarks: { required },
        },
        enrollment: {
            schoolYear: { required },
            semester: { required },
            numberOfEnrollees: { required },
        },
    },
    computed: {
        filteredProgram() {
            let data = this.tableData;
            var total = this.currentPage * this.perPage;
            if (this.filter.trim() != "" && this.filter) {
                data = data.filter((item) => {
                    return item.searchItem
                        .toUpperCase()
                        .includes(this.filter.toUpperCase());
                });
            }
            if (this.groupDU) {
                data = data.filter((item) => {
                    return item.deliveryUnitId == this.groupDU
                });
            }
            if (this.groupCampus) {
                data = data.filter((item) => {
                    return item.deliveryUnit.office.campusId == this.groupCampus
                });
            }
            var currentData = data.slice(total - this.perPage, total);
            if (this.currentPage > 1 && currentData.length == 0) {
                total = (this.currentPage - 1) * this.perPage;
                currentData = data.slice(total - this.perPage, total);
            }
            data = currentData;
            return data;
        },
        filteredExamSched() {
            let data = this.examSchedData;
            var total = this.currentPageEs * this.perPageEs;
            if (this.filterEs.trim() != "" && this.filterEs) {
                data = data.filter((item) => {
                    return item.searchItem
                        .toUpperCase()
                        .includes(this.filterEs.toUpperCase());
                });
            }
            var currentData = data.slice(total - this.perPageEs, total);
            if (this.currentPageEs > 1 && currentData.length == 0) {
                total = (this.currentPageEs - 1) * this.perPageEs;
                currentData = data.slice(total - this.perPageEs, total);
            }
            data = currentData;
            return data;
        },
        filteredStudent() {
            let data = this.students;
            var total = this.currentPageStud * this.perPageStud;
            if (this.filterGs.trim() != "" && this.filterGs) {
                data = data.filter((item) => {
                    return item.searchItem
                        .toUpperCase()
                        .includes(this.filterGs.toUpperCase());
                });
            }
            var currentData = data.slice(total - this.perPageStud, total);
            if (this.currentPageStud > 1 && currentData.length == 0) {
                total = (this.currentPageStud - 1) * this.perPageStud;
                currentData = data.slice(total - this.perPageStud, total);
            }
            data = currentData;
            return data;
        },
        filteredExtensions() {
            let data = this.extensionData;
            var total = this.currentPageExt * this.perPageExt;
            if (this.filterExt.trim() != "" && this.filterExt) {
                data = data.filter((item) => {
                    return item.extensionName
                        .toUpperCase()
                        .includes(this.filterExt.toUpperCase());
                });
            }
            var currentData = data.slice(total - this.perPageExt, total);
            if (this.currentPageExt > 1 && currentData.length == 0) {
                total = (this.currentPageExt - 1) * this.perPageExt;
                currentData = data.slice(total - this.perPageExt, total);
            }
            data = currentData;
            return data;
        },
        filteredAccreds() {
            let data = this.accredData;
            var total = this.currentPageAccred * this.perPageAccred;
            if (this.filterAccred.trim() != "" && this.filterAccred) {
                data = data.filter((item) => {
                    return item.searchItem
                        .toUpperCase()
                        .includes(this.filterAccred.toUpperCase());
                });
            }
            var currentData = data.slice(total - this.perPageAccred, total);
            if (this.currentPageAccred > 1 && currentData.length == 0) {
                total = (this.currentPageAccred - 1) * this.perPageExt;
                currentData = data.slice(total - this.perPageExt, total);
            }
            data = currentData;
            return data;
        },
        filteredEnrollments() {
            let data = this.enrollmentData;
            var total = this.currentPageEnrolee * this.perPageEnrolee;
            if (this.filterEnrolee.trim() != "" && this.filterEnrolee) {
                data = data.filter((item) => {
                    return item.searchItem
                        .toUpperCase()
                        .includes(this.filterEnrolee.toUpperCase());
                });
            }
            var currentData = data.slice(total - this.perPageEnrolee, total);
            if (this.currentPageEnrolee > 1 && currentData.length == 0) {
                total = (this.currentPageEnrolee - 1) * this.perPageEnrolee;
                currentData = data.slice(total - this.perPageEnrolee, total);
            }
            data = currentData;
            return data;
        },
        filteredDocuments() {
            let data = this.documentData;
            var total = this.currentPageDocument * this.perPageDocument;
            if (this.filterDocument.trim() != "" && this.filterDocument) {
                data = data.filter((item) => {
                    return item.searchItem
                        .toUpperCase()
                        .includes(this.filterDocument.toUpperCase());
                });
            }
            var currentData = data.slice(total - this.perPageDocument, total);
            if (this.currentPageDocument > 1 && currentData.length == 0) {
                total = (this.currentPageDocument - 1) * this.perPageDocument;
                currentData = data.slice(total - this.perPageDocument, total);
            }
            data = currentData;
            return data;
        },
        filteredCategories(){
            let data = this.categories;
            var total = this.currentPageCat * this.perPageCat;
            if (this.filterCat.trim() != "" && this.filterCat) {
                data = data.filter((item) => {
                    return item.category
                        .toUpperCase()
                        .includes(this.filterCat.toUpperCase());
                });
            }
            var currentData = data.slice(total - this.perPageCat, total);
            if (this.currentPageCat > 1 && currentData.length == 0) {
                total = (this.currentPageCat - 1) * this.perPageCat;
                currentData = data.slice(total - this.perPageCat, total);
            }
            data = currentData;
            return data;
        },
        rows() {
            if (this.filter.trim() != "" && this.filter || this.groupCampus || this.groupDU) {
                return this.filteredProgram.length;
            }
            return this.tableData.length;
        },
        rowsEs() {
            if (this.filterEs.trim() != "" && this.filterEs) {
                return this.filteredExamSched.length;
            } else {
                return this.examSchedData.length;
            }
        },
        rowsStud() {
            if (this.filterGs.trim() != "" && this.filterGs) {
                return this.filteredStudent.length;
            } else {
                return this.students.length;
            }
        },
        rowsExt() {
            if (this.filterExt.trim() != "" && this.filterExt) {
                return this.filteredExtensions.length;
            } else {
                return this.extensionData.length;
            }
        },
        rowsAccred() {
            if (this.filterAccred.trim() != "" && this.filterAccred) {
                return this.filteredAccreds.length;
            } else {
                return this.accredData.length;
            }
        },
        rowsEnrollment() {
            if (this.filterEnrolee.trim() != "" && this.filterEnrolee) {
                return this.filteredEnrollments.length;
            } else {
                return this.enrollmentData.length;
            }
        },
        rowsDocument() {
            if (this.filterDocument.trim() != "" && this.filterDocument) {
                return this.filteredDocuments.length;
            } else {
                return this.documentData.length;
            }
        },
        rowsCat(){
            if (this.filterCat.trim() != "" && this.filterCat) {
                return this.filteredCategories.length;
            } else {
                return this.categories.length;
            }
        }
    },
    created() {
        this.totalRows = this.items.length;
        this.$store.dispatch("agency/GetAgency").then((res) => {
            var agencies = [{ value: 0, text: "" }];
            res.data.forEach(function (item) {
                agencies.push({ value: item.id, text: item.agencyShortName });
            });
            this.agencies = agencies;
        });
        this.getByCat(0);
        this.loadCategory = true;
        this.$store
            .dispatch("programcategory/GetProgramCategory")
            .then((res) => {
                this.categories = res.data;
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
        changeAgency() {
            this.$store
                .dispatch("campus/GetCampusByAgency", this.form.agency)
                .then((res) => {
                    var campuses = [{ value: 0, text: "" }];
                    res.data.forEach(function (item) {
                        campuses.push({ value: item.id, text: item.shortName });
                    });
                    this.campuses = campuses;
                })
                .catch(() => {
                    this.showToast("Something went wrong!","error");
                });
        },
        changeCampus() {
            this.$store
                .dispatch("office/GetOfficeByCampus", this.form.campus)
                .then((res) => {
                    var offices = [{ value: 0, text: "" }];
                    res.data.forEach(function (item) {
                        offices.push({ value: item.id, text: item.shortName });
                    });
                    this.offices = offices;
                })
                .catch(() => {
                    this.showToast("Something went wrong!","error");
                });
        },
        changeOffice() {
            this.$store
                .dispatch(
                    "deliveryunit/GetDeliveryUnitByOffice",
                    this.form.office
                )
                .then((res) => {
                    if (res.data) {
                        var dus = [{ value: 0, text: "" }];
                        res.data.forEach(function (item) {
                            dus.push({ value: item.id, text: item.name });
                        });
                        this.dus = dus;
                    } else {
                        this.dus = [];
                    }
                })
                .catch(() => {
                    this.showToast("Something went wrong!","error");
                });
        },
        getPc() {
            this.$bvModal.show("program-category-modal");
        },
        dropPc(data) {
            this.programCategoryId = data.id;
            this.programCategory = data.category;
            this.form.programCategoryId = data.id;
            this.form.programCategory = data.category;
            this.tableBusy = true;
            this.$store
                .dispatch("program/GetProgramByCategory", data.id)
                .then((res) => {
                    res.data.forEach((item) => {
                        item.graduateYear = "";
                        item.graduateYearId = "";
                        item.students = [];
                    });
                    this.tableData = res.data;
                    this.tableBusy = false;
                });
        },
        getEm() {
            this.$bvModal.show("examination-modal");
        },
        dropEm(data) {
            this.form.examinationId = data.id;
            this.examSched.examinationId = data.id;
            this.examination = data.examName;
        },
        hideModal() {
            this.$bvModal.hide("modal-standard");
        },
        addProgram() {
            this.hideDetails();
            this.onReset();
            this.modalTitle = "Create New Program";
            this.$bvModal.show("modal-standard");
        },
        onReset() {
            this.form = {
                id: 0,
                programName: "",
                shortName: "",
                boardResNo: "",
                dateApproved: "",
                yearOffered: "",
                yearFirstGraduate: "",
                isChedIdentified: false,
                isRdcPriority: false,
                isThesisRequired: false,
                isAccreditable: false,
                isNonBoard: false,
                isOnCampus: false,
                isDistanceLearning: false,
                examinationId: "",
                programCategoryId: "",
                deliveryUnitId: "",
                deliveryUnit: "",
                programCategory: {},
                notes: "",
            };
            this.examination = "";
        },
        onCreate() {
            this.submitted = true;
            this.$v.form.$touch();
            if (this.$v.form.$invalid) {
                return;
            } else {
                var data = cloneDeep(this.form);
                data.dateApproved = this.getDate(this.form.dateApproved);
                if (this.form.id > 0) {
                    this.$store
                        .dispatch("program/UpdateProgram", data)
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
                        .dispatch("program/CreateProgram", data)
                        .then((res) => {
                            var deliveryUnit = {
                                office: {
                                    campusId: this.form.campus,
                                    campus: {
                                        agencyId: this.form.agency,
                                    },
                                },
                                officeId: this.form.office,
                            };
                            res.data.deliveryUnit = deliveryUnit;
                            this.tableData.push(res.data);
                            this.$bvModal.hide("modal-standard");
                            this.showToast("Successfully created!","success");
                        })
                        .catch((err) => {
                            this.showToast("Something went wrong!","error");
                        });
                }
                this.submitted = false;
            }
        },
        getByCat(id) {
            this.tableBusy = true;
            this.filterByCategory = id;
            this.hideDetails();
            if (id == 0) {
                this.$store.dispatch("program/GetProgram").then((res) => {
                    res.data.forEach((item) => {
                        item.toggleTitle = false;
                        item.searchItem = `${item.programName} ${item.shortName}`;
                    });
                    this.tableData = res.data;
                    this.tableBusy = false;
                });
            } else {
                this.$store
                    .dispatch("program/GetProgramByCategory", id)
                    .then((res) => {
                        res.data.forEach((item) => {
                            item.toggleTitle = false;
                            item.searchItem = `${item.programName} ${item.shortName}`;
                        });
                        this.tableData = res.data;
                        this.tableBusy = false;
                    });
            }
        },
        updateItem(props) {
            this.form = cloneDeep(props);
            this.form.dateApproved = new Date(props.dateApproved);
            this.form.agency = props.deliveryUnit.office.campus.agencyId;
            this.form.yearOffered = props.yearOffered.toString();
            this.form.yearFirstGraduate = props.yearFirstGraduate.toString();
            this.changeAgency();
            this.form.campus = props.deliveryUnit.office.campusId;
            this.changeCampus();
            this.form.office = props.deliveryUnit.officeId;
            this.changeOffice();
            this.indexSelected = this.tableData.indexOf(props);
            this.examination = props.examination.examName;
            this.programCategory = props.programCategory.category;
            this.modalTitle = "Update Program";
            this.$bvModal.show("modal-standard");
        },
        deleteItem(props) {
            var index = this.tableData.indexOf(props);
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
                        .dispatch("program/DeleteProgram", props.id)
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
        viewDetails(row) {
            this.showDetail = true;
            this.detailLoading = true;
            this.form = cloneDeep(row);
            this.selectedProgram = row.id;
            this.indexSelected = this.tableData.indexOf(row);
            this.examSchedData = [];
            this.toggleExamSched = false;
            this.students = [];
            this.toggleGradStud = false;
            this.extensionData = [];
            this.toggleExt = false;
            this.toggleAccred = false;
            this.accredData = [];
            this.toggleEnrolee = false;
            this.enrollmentData = [];
            this.getAttachments(row.id);
            this.toggleDocument = false;
            setTimeout(() => {
                this.detailLoading = false;
            }, 200);
        },
        getAttachments(id){
            this.attachmentLoading = true;
            this.documentData = [];
            this.$store
                .dispatch("filemanager/GetFiles", {id: id, type: this.uploadProgramOptions.type})
                .then((res) => {
                    this.attachmentLoading = false;
                    this.documentData = res.data;
                })
                .catch(() => {
                    this.attachmentLoading = false;
                    this.showToast('Something went wrong! - getting program documents', "error");
                });
        },
        toggleAccordion(acc, x) {
            if (acc == 1) {
                this.toggleExamSched = !this.toggleExamSched;
                if (this.toggleExamSched) {
                    this.getExamSched();
                }
            }
            if (acc == 2) {
                this.toggleGradStud = !this.toggleGradStud;
                if (this.toggleGradStud) {
                    this.students = [];
                    this.yearSelected = 0;
                    this.getGradYear(this.form.id);
                }
            }
            if (acc == 3) {
                this.toggleAccred = !this.toggleAccred;
                if (this.toggleAccred) {
                    this.getAccreditations(this.form.id);
                }
            }
            if (acc == 4) {
                this.toggleExt = !this.toggleExt;
                if (this.toggleExt) {
                    this.getExtensions(this.form.id);
                }
            }
            if (acc == 5) {
                x.toggleTaker = !x.toggleTaker;
                if (x.toggleTaker) {
                    this.getExamTaker(x);
                }
            }
            if (acc == 6) {
                this.toggleEnrolee = !this.toggleEnrolee;
                if (this.toggleEnrolee) {
                    this.getEnrolee(this.form.id);
                }
            }
            if (acc == 7) {
                this.toggleDocument = !this.toggleDocument;
            }
        },
        getExamSched() {
            this.examSchedLoading = true;
            this.examSchedData = [];
            setTimeout(() => {
                this.$store
                    .dispatch(
                        "examschedule/GetExamScheduleByProgram",
                        this.form.id
                    )
                    .then((res) => {
                        res.data.forEach((item) => {
                            item.searchItem = `${item.examination.examName}`;
                            item.toggleTaker = false;
                            item.loadingTakers = false;
                            item.takers = [];
                            item.loadedItems = false;
                        });
                        this.examSchedData = res.data;
                        this.examSchedLoading = false;
                    })
                    .catch(() => {
                        this.examSchedLoading = false;
                        this.showToast("Something went wrong!","error");
                    });
            }, 1000);
        },
        getExamTaker(x) {
            if (!x.loadedItems) {
                x.takers = [];
                x.loadingTakers = true;
                setTimeout(() => {
                    this.$store
                        .dispatch("examtaker/GetExamTakerBySchedule", x.id)
                        .then((res) => {
                            x.takers = res.data;
                            x.loadingTakers = false;
                            x.loadedItems = true;
                        })
                        .catch((err) => {
                            this.showToast("Something went wrong!","error");
                        });
                }, 1000);
            }
        },
        getExtensions(id) {
            this.extensionLoading = true;
            this.extensionData = [];
            setTimeout(() => {
                this.$store
                    .dispatch(
                        "extensionprogram/GetExtensionProgramByProgram",
                        id
                    )
                    .then((res) => {
                        res.data.forEach(item => {
                            item.addDocu = false;
                            item.openAttachment = false;
                            item.attachmentLoading = false;
                            item.documentData = [];
                        })
                        this.extensionData = res.data;
                        this.extensionLoading = false;
                    })
                    .catch(() => {
                        this.extensionLoading = false;
                        this.showToast("Something went wrong!","error");
                    });
            }, 1000);
        },
        getAccreditations(id) {
            this.accredLoading = true;
            this.accredData = [];
            this.$store
                .dispatch(
                    "programaccreditation/GetProgramAccreditationByProgram",
                    id
                )
                .then((res) => {
                    res.data.forEach((item) => {
                        item.searchItem = item.accreditor.accreditorName;
                    });
                    this.accredLoading = false;
                    this.accredData = res.data;
                })
                .catch((err) => {
                    this.accredLoading = false;
                    this.showToast("Something went wrong!","error");
                });
        },
        getEnrolee(id) {
            this.enrollmentLoading = true;
            this.enrollmentData = [];
            this.$store
                .dispatch("enrollment/GetEnrollmentByProgram", id)
                .then((res) => {
                    res.data.forEach((item) => {
                        item.searchItem = item.schoolYear + " " + item.semester;
                    });
                    this.enrollmentLoading = false;
                    this.enrollmentData = res.data;
                })
                .catch((err) => {
                    this.enrollmentLoading = false;
                    this.showToast("Something went wrong!","error");
                });
        },
        hideDetails() {
            this.showDetail = false;
            this.selectedProgram = 0;
        },

        // Exam Schedule Methods
        addEs() {
            this.onResetEs();
            this.modalTitle = "Create New Exam Schedule";
            this.$bvModal.show("exam-schedule-modal");
        },
        onResetEs() {
            this.examSched = {
                id: 0,
                programId: this.form.id,
                examinationId: this.form.examinationId,
                venue: "",
                dateFrom: "",
                dateTo: "",
                host: "",
                remarks: "",
            };
            this.examination = this.form.examination.examName;
        },
        onCreateEs() {
            this.submitted = true;
            this.$v.examSched.$touch();
            if (this.$v.examSched.$invalid) {
                return;
            } else {
                var data = cloneDeep(this.examSched);
                data.dateFrom = this.getDate(this.examSched.dateFrom);
                data.dateTo = this.getDate(this.examSched.dateTo);
                if (this.examSched.id > 0) {
                    this.$store
                        .dispatch("examschedule/UpdateExamSchedule", data)
                        .then((res) => {
                            res.data.fromDisplay = this.formatDate(
                                new Date(res.data.dateFrom)
                            );
                            res.data.toDisplay = this.formatDate(
                                new Date(res.data.dateTo)
                            );
                            this.examSchedData.splice(
                                this.indexSelectedEs,
                                1,
                                res.data
                            );
                            this.$bvModal.hide("exam-schedule-modal");
                            this.showToast("Successfully updated!","success");
                        })
                        .catch((err) => {
                            this.showToast("Something went wrong!","error");
                        });
                } else {
                    this.$store
                        .dispatch("examschedule/CreateExamSchedule", data)
                        .then((res) => {
                            res.data.fromDisplay = this.formatDate(
                                new Date(res.data.dateFrom)
                            );
                            res.data.toDisplay = this.formatDate(
                                new Date(res.data.dateTo)
                            );
                            res.data.takers = [];
                            this.examSchedData.push(res.data);
                            this.$bvModal.hide("exam-schedule-modal");
                            this.showToast("Successfully created!","success");
                        })
                        .catch((err) => {
                            this.showToast("Something went wrong!","error");
                        });
                }
                this.submitted = false;
            }
        },
        hideModalEs() {
            this.$bvModal.hide("exam-schedule-modal");
        },
        updateItemEs(props) {
            this.examSched = cloneDeep(props);
            this.examSched.dateFrom = new Date(props.dateFrom);
            this.examSched.dateTo = new Date(props.dateTo);
            this.examination = props.examination.examName;
            this.indexSelectedEs = this.examSchedData.indexOf(props);
            this.modalTitle = "Update Exam Schedule";
            this.$bvModal.show("exam-schedule-modal");
        },
        deleteItemEs(props) {
            var index = this.examSchedData.indexOf(props);
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
                        .dispatch("examschedule/DeleteExamSchedule", props.id)
                        .then((res) => {
                            if (res.status == 204) {
                                this.examSchedData.splice(index, 1);
                                this.showToast("Successfully deleted!","success");
                            }
                        })
                        .catch((err) => {
                            this.showToast("Cannot be deleted!","error");
                        });
                }
            });
        },

        // Exam Takers Method
        onResetTaker() {
            this.taker = {
                id: 0,
                examScheduleId: 0,
                numberOfTakers: "",
                numberOfPassers: "",
            };
        },
        addTaker(parent) {
            this.onResetTaker();
            this.indexSelectedEs = this.examSchedData.indexOf(parent);
            this.taker.examScheduleId = parent.id;
            this.modalTitle = "Create New Exam Taker";
            this.$bvModal.show("taker-modal");
        },
        updateTaker(parent, row) {
            this.taker = cloneDeep(row);
            this.modalTitle = "Update Exam Taker";
            this.indexSelectedEs = this.examSchedData.indexOf(parent);
            this.indexTakerSelected = parent.takers.indexOf(row);
            this.$bvModal.show("taker-modal");
        },
        deleteTaker(parent, row) {
            var parentIndex = this.examSchedData.indexOf(parent);
            var index = this.examSchedData[parentIndex].takers.indexOf(row);
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
                        .dispatch("examtaker/DeleteExamTaker", row.id)
                        .then((res) => {
                            if (res.status == 204) {
                                this.examSchedData[parentIndex].takers.splice(
                                    index,
                                    1
                                );
                                this.showToast("Successfully deleted!","success");
                            }
                        })
                        .catch((err) => {
                            this.showToast("Cannot be deleted!","error");
                        });
                }
            });
        },
        onCreateTaker() {
            this.submitted = true;
            this.$v.taker.$touch();
            if (this.$v.taker.$invalid) {
                return;
            } else {
                var data = cloneDeep(this.taker);
                if (this.taker.id > 0) {
                    this.$store
                        .dispatch("examtaker/UpdateExamTaker", data)
                        .then((res) => {
                            this.examSchedData[
                                this.indexSelectedEs
                            ].takers.splice(
                                this.indexTakerSelected,
                                1,
                                res.data
                            );
                            this.$bvModal.hide("taker-modal");
                            this.showToast("Successfully updated!","success");
                        })
                        .catch((err) => {
                            this.showToast("Something went wrong!","error");
                        });
                } else {
                    this.$store
                        .dispatch("examtaker/CreateExamTaker", data)
                        .then((res) => {
                            this.examSchedData[
                                this.indexSelectedEs
                            ].takers.push(res.data);
                            this.$bvModal.hide("taker-modal");
                            this.showToast("Successfully created!","success");
                        })
                        .catch((err) => {
                            this.showToast("Something went wrong!","error");
                        });
                }
                this.submitted = false;
            }
        },
        hideModalTaker() {
            this.$bvModal.hide("taker-modal");
        },
        // Graduate Students
        getByStudYear(x) {
            this.studentsBusy = true;
            this.filterByYear = x.id;
            this.yearSelected = x.yearGraduated;
            this.errorMessage = false;
            this.$store
                .dispatch("graduatestudent/GetGraduateStudent", x.id)
                .then((res) => {
                    this.studentsBusy = false;
                    res.data.forEach((item) => {
                        item.searchItem = `${item.lastName}, ${item.firstName} ${item.middleName}`;
                        item.showFull = false;
                    });
                    this.students = res.data;
                })
                .catch(() => {
                    this.showToast("Something went wrong!","error");
                });
        },
        getGradYear(id) {
            this.gradYearBusy = true;
            setTimeout(() => {
                this.$store
                    .dispatch("graduate/GetGraduateByProgram", id)
                    .then((res) => {
                        this.gradYearBusy = false;
                        this.gradYears = res.data;
                    })
                    .catch(() => {
                        this.tableBusy = false;
                        this.showToast("Something went wrong!","error");
                    });
            }, 1000);
        },
        onStudentReset() {
            this.student = {
                firstName: "",
                middleName: "",
                lastName: "",
            };
        },
        renderExcel(event) {
            this.file = event.target.files ? event.target.files[0] : null;
            if (this.file) {
                const reader = new FileReader();

                reader.onload = (e) => {
                    /* Parse data */
                    const bstr = e.target.result;
                    const wb = XLSX.read(bstr, { type: "binary" });
                    const wsname = wb.SheetNames[0];
                    const ws = wb.Sheets[wsname];
                    const data = XLSX.utils.sheet_to_json(ws);
                    const excellist = [];
                    for (var i = 0; i < data.length; i++) {
                        excellist.push(data[i]);
                    }
                    this.excelList = excellist;
                };
                reader.readAsBinaryString(this.file);
            }
        },
        uploadExcel() {
            var uploadArray = [];
            if(this.excelList.length == 0){
                this.showToast("No data to upload!","warning");
                return;
            }
            if (this.uploadType === "graduate") {
                this.excelList.forEach((item) => {
                    uploadArray.push({
                        firstName: item.Firstname ? item.Firstname : "",
                        middleName: item.Middlename ? item.Middlename : "",
                        lastName: item.Lastname ? item.Lastname : "",
                        graduateId: this.filterByYear,
                    });
                });
                this.$store
                    .dispatch(
                        "graduatestudent/CreateGraduateStudent",
                        uploadArray
                    )
                    .then((res) => {
                        res.data.forEach((item) => {
                            item.searchItem = `${item.lastName}, ${item.firstName} ${item.middleName}`;
                            this.students.push(item);
                        });
                        this.$bvModal.hide("excel-modal");
                        this.showToast("Successfully uploaded!","success");
                    })
                    .catch((err) => {
                        this.showToast("Something went wrong!","error");
                    });
            } else {
                this.excelList.forEach((item) => {
                    uploadArray.push({
                        schoolYear: item.SchoolYear ? item.SchoolYear : "",
                        semester: item.Semester ? item.Semester : "",
                        numberOfEnrollees: item.NumberOfEnrollees
                            ? item.NumberOfEnrollees
                            : "",
                        programId: this.form.id,
                    });
                });
                this.$store
                    .dispatch("enrollment/CreateEnrollment", uploadArray)
                    .then((res) => {
                        res.data.forEach((item) => {
                            item.searchItem = `${item.schoolYear}, ${item.semester} ${item.numberOfEnrollees}`;
                            this.enrollmentData.push(item);
                        });
                        this.$bvModal.hide("excel-modal");
                        this.showToast("Successfully uploaded!","success");
                    })
                    .catch((err) => {
                        this.showToast("Something went wrong!","error");
                    });
            }
        },
        hideGraduateModal() {
            this.$bvModal.hide("graduate-modal");
        },
        updateStudent(props) {
            this.student = cloneDeep(props);
            this.studentIndex = this.students.indexOf(props);
            this.modalTitle = "Update Graduate Student";
            this.$bvModal.show("student-modal");
        },
        deleteStudent(props) {
            var index = this.students.indexOf(props);
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
                        .dispatch(
                            "graduatestudent/DeleteGraduateStudent",
                            props.id
                        )
                        .then((res) => {
                            if (res.status == 204) {
                                this.students.splice(index, 1);
                                this.showToast("Successfully deleted!","success");
                            }
                        })
                        .catch((err) => {
                            this.showToast("Cannot be deleted!","error");
                        });
                }
            });
        },
        onCreateStudent() {
            this.submitted = true;
            this.$v.student.$touch();
            if (this.$v.student.$invalid) {
                return;
            } else {
                if (this.student.id > 0) {
                    this.$store
                        .dispatch(
                            "graduatestudent/UpdateGraduateStudent",
                            this.student
                        )
                        .then((res) => {
                            if (res.data.error) {
                                return this.showToast(res.data.errorMessage,"error");
                            }
                            res.data.searchItem = `${this.student.lastName}, ${this.student.firstName} ${this.student.middleName}`;
                            this.students.splice(
                                this.studentIndex,
                                1,
                                res.data
                            );
                            this.$bvModal.hide("student-modal");
                            this.showToast("Successfully updated!","success");
                        })
                        .catch((err) => {
                            this.showToast("Something went wrong!","error");
                        });
                } else {
                    this.student.graduateId = this.filterByYear;
                    this.$store
                        .dispatch("graduatestudent/CreateGraduateStudent", [
                            this.student,
                        ])
                        .then((res) => {
                            if (res.data.error) {
                                return this.showToast(res.data.errorMessage,"error");
                            }
                            this.student.id = res.data[0].id;
                            this.student.searchItem = `${this.student.lastName}, ${this.student.firstName} ${this.student.middleName}`;
                            this.students.push(this.student);
                            this.$bvModal.hide("student-modal");
                            this.showToast("Successfully created!","success");
                        })
                        .catch((err) => {
                            this.showToast("Something went wrong!","error");
                        });
                }
                this.submitted = false;
            }
        },
        hideStudentModal() {
            this.$bvModal.hide("student-modal");
        },
        addGraduateStud() {
            this.errorMessage = false;
            if (this.filterByYear == 0) {
                return (this.errorMessage = true);
            }
            this.onStudentReset();
            this.modalTitle = "Create New Graduate Student";
            this.$bvModal.show("student-modal");
        },
        uploadGraduateStud() {
            this.uploadType = "graduate";
            this.errorMessage = false;
            if (this.filterByYear == 0) {
                return (this.errorMessage = true);
            }
            this.$bvModal.show("excel-modal");
        },
        addGradYear() {
            this.$refs.gy.getData(this.form.id);
            this.$bvModal.show("graduate-year-modal");
        },
        reloadYear() {
            this.getGradYear(this.form.id);
        },
        viewER(x) {
            this.$refs.er.erTitle = `${x.searchItem}'s Employment Record`;
            this.$refs.er.getRecord(x.id);
            this.$bvModal.show("employment-record-modal");
        },
        // Accreditation Methods
        addAccred() {
            this.onResetAccred();
            this.modalTitle = "Create New Program Accreditation";
            this.$bvModal.show("accreditation-modal");
        },
        onCreateAccred() {
            this.submitted = true;
            this.$v.accred.$touch();
            if (this.$v.accred.$invalid) {
                return;
            } else {
                var data = cloneDeep(this.accred);
                data.dateFrom = this.getDate(this.accred.dateFrom);
                data.dateSurveyed = this.getDate(this.accred.dateSurveyed);
                data.dateGranted = this.getDate(this.accred.dateGranted);
                data.expiry = this.getDate(this.accred.expiry);
                data.programId = this.form.id;
                if (this.accred.id > 0) {
                    this.$store
                        .dispatch(
                            "programaccreditation/UpdateProgramAccreditation",
                            data
                        )
                        .then((res) => {
                            this.accredData.splice(
                                this.accredIndex,
                                1,
                                res.data
                            );
                            this.$bvModal.hide("accreditation-modal");
                            this.showToast("Successfully updated!","success");
                        })
                        .catch((err) => {
                            this.showToast("Something went wrong!","error");
                        });
                } else {
                    this.$store
                        .dispatch(
                            "programaccreditation/CreateProgramAccreditation",
                            data
                        )
                        .then((res) => {
                            this.accredData.push(res.data);
                            this.$bvModal.hide("accreditation-modal");
                            this.showToast("Successfully created!","success");
                        })
                        .catch((err) => {
                            this.showToast("Something went wrong!","error");
                        });
                }
                this.submitted = false;
            }
        },
        onResetAccred() {
            this.accred = {
                id: 0,
                accreditorId: "",
                surveyLevelId: "",
                status: "",
                dateFrom: new Date(),
                dateSurveyed: new Date(),
                score: "0",
                dateGranted: new Date(),
                expiry: new Date(),
                remarks: "",
                isCurrent: false,
            };
            this.surveyLevel = "";
            this.accreditor = "";
        },
        updateItemAccred(props) {
            this.accred = cloneDeep(props);
            this.accred.dateFrom = new Date(props.dateFrom);
            this.accred.dateSurveyed = new Date(props.dateSurveyed);
            this.accred.dateGranted = new Date(props.dateGranted);
            this.accred.expiry = new Date(props.expiry);
            this.accredIndex = this.accredData.indexOf(props);
            this.accreditor = props.accreditor.shortName;
            this.surveyLevel = props.surveyLevel.level;
            this.modalTitle = "Update Program Accreditation";
            this.$bvModal.show("accreditation-modal");
        },
        hideModalAccred() {
            this.$bvModal.hide("accreditation-modal");
        },
        deleteItemAccred(props) {
            var index = this.accredData.indexOf(props);
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
                        .dispatch(
                            "programaccreditation/DeleteProgramAccreditation",
                            props.id
                        )
                        .then((res) => {
                            if (res.status == 204) {
                                this.accredData.splice(index, 1);
                                this.showToast("Successfully deleted!","success");
                            }
                        })
                        .catch((err) => {
                            this.showToast("Cannot be deleted!","error");
                        });
                }
            });
        },
        getSurveyLevel() {
            this.$refs.sl.getData();
            this.$bvModal.show("survey-level-modal");
        },
        dropSl(data) {
            this.accred.surveyLevelId = data.id;
            this.surveyLevel = data.level;
        },
        getAccreditor() {
            this.$refs.acc.getData();
            this.$bvModal.show("accreditor-modal");
        },
        dropAccreditor(data) {
            this.accred.accreditorId = data.id;
            this.accreditor = data.shortName;
        },

        // Extensions Methods
        onResetExt() {
            this.ext = {
                id: 0,
                extensionName: "",
                dateFrom: "",
                dateTo: "",
            };
        },
        addEP() {
            this.onResetExt();
            this.modalTitle = "Create New Extension Program";
            this.$bvModal.show("extension-modal");
        },
        onCreateExt() {
            this.submitted = true;
            this.$v.ext.$touch();
            var data = cloneDeep(this.ext);
            data.dateFrom = this.getDate(this.ext.dateFrom);
            data.dateTo = this.getDate(this.ext.dateTo);
            data.programId = this.form.id;
            if (this.$v.ext.$invalid) {
                return;
            } else {
                if (this.ext.id > 0) {
                    this.$store
                        .dispatch(
                            "extensionprogram/UpdateExtensionProgram",
                            data
                        )
                        .then((res) => {
                            res.data.fromDisplay = this.formatDate(
                                this.ext.dateFrom
                            );
                            res.data.toDisplay = this.formatDate(
                                this.ext.dateTo
                            );
                            this.extensionData.splice(
                                this.extensionIndex,
                                1,
                                res.data
                            );
                            this.$bvModal.hide("extension-modal");
                            this.showToast("Successfully updated!","success");
                        })
                        .catch((err) => {
                            this.showToast("Something went wrong!","error");
                        });
                } else {
                    this.$store
                        .dispatch(
                            "extensionprogram/CreateExtensionProgram",
                            data
                        )
                        .then((res) => {
                            res.data.fromDisplay = this.formatDate(
                                this.ext.dateFrom
                            );
                            res.data.toDisplay = this.formatDate(
                                this.ext.dateTo
                            );
                            this.extensionData.push(res.data);
                            this.$bvModal.hide("extension-modal");
                            this.showToast("Successfully created!","success");
                        })
                        .catch((err) => {
                            this.showToast("Something went wrong!","error");
                        });
                }
                this.submitted = false;
            }
        },
        updateItemExt(props) {
            this.ext = cloneDeep(props);
            this.ext.dateFrom = new Date(props.dateFrom);
            this.ext.dateTo = new Date(props.dateTo);
            this.extensionIndex = this.extensionData.indexOf(props);
            this.modalTitle = "Update Extension Program";
            this.$bvModal.show("extension-modal");
        },
        hideModalExtension() {
            this.$bvModal.hide("extension-modal");
        },
        deleteItemExt(props) {
            var index = this.extensionData.indexOf(props);
            Swal.fire({
                title: "Are you sure?",
                text: "You won't be able to revert this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#dc3545",
                cancelButtonColor: "#5c636a",
                confirmButtonText: "Yes, delete it!",
            }).then(async (result) => {
                if (result.value) {
                    await this.$store
                        .dispatch(
                            "extensionprogram/DeleteExtensionProgram",
                            props.id
                        )
                        .then((res) => {
                            if (res.status == 204) {
                                this.extensionData.splice(index, 1);
                                this.showToast("Successfully deleted!","success");
                            }
                        })
                        .catch((err) => {
                            this.showToast("Something went wrong!","error");
                        });
                }
            });
        },
        viewExtAct(x) {
            window.open(
                this.$router.resolve(`/planning/extension-activity/${x.id}`)
                    .href
            );
        },
        downloadExcelTemplate(type) {
            const s2ab = (s) => {
                var buf = new ArrayBuffer(s.length);
                var view = new Uint8Array(buf);
                for (var i = 0; i < s.length; i++) {
                    view[i] = s.charCodeAt(i) & 0xff;
                }
                return buf;
            };
            Swal.fire({
                title: "Are you sure?",
                text: "You want to download the template?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#34c38f",
                cancelButtonColor: "#f46a6a",
                confirmButtonText: "Yes, download it!",
            }).then((result) => {
                if (result.value) {
                    if (type === "graduate") {
                        let wb = XLSX.utils.book_new();
                        wb.Props = {
                            Title: "Graduates Student Template",
                            Subject: "For Uploading",
                            Author: "GIAMS Website",
                            CreatedDate: new Date(),
                        };
                        wb.SheetNames.push("Sheet 1");
                        let ws_data = [["Firstname", "Middlename", "Lastname"]];
                        let ws = XLSX.utils.aoa_to_sheet(ws_data);
                        wb.Sheets["Sheet 1"] = ws;

                        let wbout = XLSX.write(wb, {
                            bookType: "xlsx",
                            type: "binary",
                        });
                        saveAs(
                            new Blob([s2ab(wbout)], {
                                type: "application/octet-stream",
                            }),
                            "Graduates_Student_Template.xlsx"
                        );
                    } else if (type === "enrollment") {
                        let wb = XLSX.utils.book_new();
                        wb.Props = {
                            Title: "Enrollment Template",
                            Subject: "For Uploading",
                            Author: "GIAMS Website",
                            CreatedDate: new Date(),
                        };
                        wb.SheetNames.push("Sheet 1");
                        let ws_data = [
                            ["SchoolYear", "Semester", "NumberOfEnrollees"],
                        ];
                        let ws = XLSX.utils.aoa_to_sheet(ws_data);
                        wb.Sheets["Sheet 1"] = ws;

                        let wbout = XLSX.write(wb, {
                            bookType: "xlsx",
                            type: "binary",
                        });
                        saveAs(
                            new Blob([s2ab(wbout)], {
                                type: "application/octet-stream",
                            }),
                            "Enrollment_Student_Template.xlsx"
                        );
                    }
                }
            });
        },

        // Enrollment Methods
        onResetEnrollment() {
            this.enrollment = {
                programId: 0,
                schoolYear: "",
                semester: "",
                numberOfEnrollees: "",
            };
        },
        addEnrollment() {
            this.onResetEnrollment();
            this.modalTitle = "Create New Enrollment";
            this.$bvModal.show("enrollment-modal");
        },
        onCreateEnrollment() {
            this.submitted = true;
            this.$v.enrollment.$touch();
            var data = cloneDeep(this.enrollment);
            data.programId = this.form.id;
            if (this.$v.enrollment.$invalid) {
                return;
            } else {
                if (this.enrollment.id > 0) {
                    this.$store
                        .dispatch("enrollment/UpdateEnrollment", data)
                        .then((res) => {
                            this.enrollmentData.splice(
                                this.enrollmentIndex,
                                1,
                                res.data
                            );
                            this.$bvModal.hide("enrollment-modal");
                            this.showToast("Successfully updated!","success");
                        })
                        .catch((err) => {
                            this.showToast("Something went wrong!","error");
                        });
                } else {
                    this.$store
                        .dispatch("enrollment/CreateEnrollment", [data])
                        .then((res) => {
                            this.enrollmentData.push(res.data[0]);
                            this.$bvModal.hide("enrollment-modal");
                            this.showToast("Successfully created!","success");
                        })
                        .catch((err) => {
                            this.showToast("Something went wrong!","error");
                        });
                }
                this.submitted = false;
            }
        },
        updateEnrollment(props) {
            this.enrollment = cloneDeep(props);
            this.enrollment.numberOfEnrollees =
                props.numberOfEnrollees.toString();
            this.enrollmentIndex = this.enrollmentData.indexOf(props);
            this.modalTitle = "Update Enrollment";
            this.$bvModal.show("enrollment-modal");
        },
        deleteEnrollment(props) {
            var index = this.enrollmentData.indexOf(props);
            Swal.fire({
                title: "Are you sure?",
                text: "You won't be able to revert this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#dc3545",
                cancelButtonColor: "#5c636a",
                confirmButtonText: "Yes, delete it!",
            }).then(async (result) => {
                if (result.value) {
                    await this.$store
                        .dispatch("enrollment/DeleteEnrollment", props.id)
                        .then((res) => {
                            if (res.status == 204) {
                                this.enrollmentData.splice(index, 1);
                                this.showToast("Successfully deleted!","success");
                            }
                        })
                        .catch((err) => {
                            this.showToast("Cannot be deleted!","error");
                        });
                }
            });
        },
        uploadEnrollment() {
            this.uploadType = "enrollment";
            this.$bvModal.show("excel-modal");
        },
        getSchoolYear() {
            var schoolYears = [];
            let year = new Date().getFullYear();
            for (let i = 0; i < 5; i++) {
                schoolYears.push(`${year - i} - ${year - i + 1}`);
            }
            return schoolYears;
        },
        uploadedProgram(response){
            this.documentData.push(response);
        },
        uploadedExtention(response, id){
            var index = this.extensionData.findIndex(x => x.id == id);
            this.extensionData[index].documentData.push(response);
        },
        removeProgramFile(id){
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
                            if(res.data.error){
                                return this.showToast(res.data.errorMessage, "error");
                            }
                            let index = this.documentData.findIndex(item => item.id == id);
                            this.documentData.splice(index, 1);
                            this.showToast('Successfully removed!', "success");
                        })
                        .catch(() => {
                            this.showToast('Cannot be remove!', "error");
                        });
                }
            });
        },
        removeExtFile(id, parentId){
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
                            if(res.data.error){
                                return this.showToast(res.data.errorMessage, "error");
                            }
                            let index = this.extensionData.findIndex(item => item.id == parentId);
                            let yIndex = this.extensionData[index].documentData.findIndex(item => item.id == id);
                            this.extensionData[index].documentData.splice(yIndex, 1);
                            this.showToast('Successfully removed!', "success");
                        })
                        .catch(() => {
                            this.showToast('Cannot be removed!', "error");
                        });
                }
            });
        },
        getExtentionDocuments(row){
            row.openAttachment = !row.openAttachment
            if(row.openAttachment){
                row.attachmentLoading = true;
                row.documentData = [];
                this.$store
                    .dispatch("filemanager/GetFiles", {id: row.id, type: this.uploadExtOptions.type})
                    .then((res) => {
                        row.attachmentLoading = false;
                        row.documentData = res.data;
                    })
                    .catch(() => {
                        row.attachmentLoading = false;
                        this.showToast('Something went wrong! - getting extention program documents', "error");
                    });
            }
        },
        openDocument(x){
            window.open(`${this.$store.state.data.rootFileDirectory}${x.folder}/${x.fileName}`);
        },
        async printBar1Graduate(type, id) {
            var apiUrl = '';
            let routeVariables = [id];
            if(type === 'campus'){
                apiUrl = `api/Program/Print/Bar1/Accreditation/Graduate/Campus`
            }else if(type === 'system'){
                apiUrl = `api/Program/Print/Bar1/Accreditation/Graduate/System`
                routeVariables = [];
            }else{
                apiUrl = `api/Program/Print/Bar1/Accreditation/Graduate/DeliveryUnit`
            }
            this.$refs.printOpt.putOptions({apiUrl: apiUrl, routeVariables: routeVariables})
            this.$bvModal.show('print-options-modal')
        },
        async printBar1UnderGrad(type, id) {
            var apiUrl = '';
            let routeVariables = [id];
            if(type === 'campus'){
                apiUrl = `api/Program/Print/Bar1/Accreditation/UnderGrad/Campus`
            }else if(type === 'system'){
                apiUrl = `api/Program/Print/Bar1/Accreditation/UnderGrad/System`
                routeVariables = [];
            }else{
                apiUrl = `api/Program/Print/Bar1/Accreditation/UnderGrad/DeliveryUnit`
            }
            this.$refs.printOpt.putOptions({apiUrl: apiUrl, routeVariables: routeVariables})
            this.$bvModal.show('print-options-modal')
        },
        async printBar1Employment(type, id){
            var apiUrl = '';
            let routeVariables = [this.$store.state.data.cycle, id];
            if(type === 'campus'){
                apiUrl = `api/EmploymentRecord/Print/Bar1/Employment/Campus`
            }else if(type === 'system'){
                apiUrl = `api/EmploymentRecord/Print/Bar1/Employment/System`
                routeVariables = [this.$store.state.data.cycle];
            }else{
                apiUrl = `api/EmploymentRecord/Print/Bar1/Employment/DeliveryUnit`
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
            size="lg"
            title-class="font-18"
            hide-footer
            no-close-on-backdrop
        >
            <form
                @submit.prevent="onCreate"
                class="needs-validation"
                ref="fcForm"
            >
                <b-row>
                    <b-col>
                        <div class="mb-2">
                            <label for="programName">Program Name </label>
                            <input
                                autocomplete="off"
                                type="text"
                                id="programName"
                                rows="4"
                                v-model="form.programName"
                                placeholder="Enter Program Name..."
                                class="form-control"
                                :class="{
                                    'is-invalid':
                                        submitted && $v.form.programName.$error,
                                }"
                            />
                            <div
                                v-if="submitted && $v.form.programName.$error"
                                class="invalid-feedback"
                            >
                                <span v-if="!$v.form.programName.required"
                                    >This value is required.</span
                                >
                            </div>
                        </div>
                        <div class="mb-2">
                            <label for="programName">Program Category </label>
                            <b-input-group>
                                <template #append>
                                    <b-button
                                        @click="getPc()"
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
                                    placeholder="Search Program Category..."
                                    class="form-control"
                                    v-model="programCategory"
                                    :class="{
                                        'is-invalid':
                                            submitted &&
                                            $v.form.programCategoryId.$error,
                                    }"
                                />
                            </b-input-group>
                            <div
                                v-if="
                                    submitted &&
                                    $v.form.programCategoryId.$error
                                "
                                class="invalid-feedback"
                            >
                                <span v-if="!$v.form.programCategoryId.required"
                                    >This value is required.</span
                                >
                            </div>
                        </div>
                        <div class="mb-2">
                            <label for="shortName">Short Name </label>
                            <input
                                autocomplete="off"
                                id="shortName"
                                type="text"
                                v-model="form.shortName"
                                placeholder="Enter Short Name..."
                                class="form-control"
                                :class="{
                                    'is-invalid':
                                        submitted && $v.form.shortName.$error,
                                }"
                            />
                            <div
                                v-if="submitted && $v.form.shortName.$error"
                                class="invalid-feedback"
                            >
                                <span v-if="!$v.form.shortName.required"
                                    >This value is required.</span
                                >
                            </div>
                        </div>
                        <div class="mb-2">
                            <label for="boardResNo">Board Resolution No.</label>
                            <input
                                autocomplete="off"
                                id="boardResNo"
                                type="text"
                                v-model="form.boardResNo"
                                placeholder="Enter Board Resolution No..."
                                class="form-control"
                                :class="{
                                    'is-invalid':
                                        submitted && $v.form.boardResNo.$error,
                                }"
                            />
                            <div
                                v-if="submitted && $v.form.boardResNo.$error"
                                class="invalid-feedback"
                            >
                                <span v-if="!$v.form.boardResNo.required"
                                    >This value is required.</span
                                >
                            </div>
                        </div>
                        <div class="mb-2">
                            <label for="boardResNo">Date Approved </label>
                            <date-picker
                                v-model="form.dateApproved"
                                :first-day-of-week="1"
                                lang="en"
                                placeholder="Enter Date Approved..."
                                :class="{
                                    'is-invalid':
                                        submitted &&
                                        $v.form.dateApproved.$error,
                                }"
                            ></date-picker>
                            <div
                                v-if="submitted && $v.form.dateApproved.$error"
                                class="invalid-feedback"
                            >
                                <span v-if="!$v.form.dateApproved.required"
                                    >This value is required.</span
                                >
                            </div>
                        </div>
                        <div class="mb-2">
                            <label for="yearOffered">Year Offered </label>
                            <masked-input
                                autocomplete="off"
                                id="yearOffered"
                                type="text"
                                v-model="form.yearOffered"
                                placeholder="Enter Year Offered..."
                                class="form-control"
                                :class="{
                                    'is-invalid':
                                        submitted && $v.form.yearOffered.$error,
                                }"
                                :mask="currencyMask"
                            ></masked-input>
                            <div
                                v-if="submitted && $v.form.yearOffered.$error"
                                class="invalid-feedback"
                            >
                                <span v-if="!$v.form.yearOffered.required"
                                    >This value is required.</span
                                >
                                <span v-if="!$v.form.yearOffered.numeric"
                                    >This value should be a valid number.</span
                                >
                            </div>
                        </div>
                        <div class="mb-2">
                            <label for="yearFirstGraduate"
                                >Year First Graduate
                            </label>
                            <masked-input
                                autocomplete="off"
                                id="yearFirstGraduate"
                                type="text"
                                v-model="form.yearFirstGraduate"
                                placeholder="Enter First Graduate..."
                                class="form-control"
                                :class="{
                                    'is-invalid':
                                        submitted &&
                                        $v.form.yearFirstGraduate.$error,
                                }"
                                :mask="currencyMask"
                            ></masked-input>
                            <div
                                v-if="
                                    submitted &&
                                    $v.form.yearFirstGraduate.$error
                                "
                                class="invalid-feedback"
                            >
                                <span v-if="!$v.form.yearFirstGraduate.required"
                                    >This value is required.</span
                                >
                            </div>
                        </div>
                    </b-col>
                    <b-col>
                        <div class="mb-2">
                            <label for="programName">Examination </label>
                            <b-input-group>
                                <template #append>
                                    <b-button
                                        @click="getEm"
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
                                    placeholder="Search Examination..."
                                    class="form-control"
                                    v-model="examination"
                                    :class="{
                                        'is-invalid':
                                            submitted &&
                                            $v.form.examinationId.$error,
                                    }"
                                />
                            </b-input-group>
                            <div
                                v-if="submitted && $v.form.examinationId.$error"
                                class="invalid-feedback"
                            >
                                <span v-if="!$v.form.examinationId.required"
                                    >This value is required.</span
                                >
                            </div>
                        </div>
                        <div class="mb-2">
                            <label for="prexcClass">Agency </label>
                            <b-form-select
                                class="form-select"
                                v-model="form.agency"
                                size="sm"
                                :options="agencies"
                                :class="{
                                    'is-invalid':
                                        submitted && $v.form.agency.$error,
                                }"
                                @change="changeAgency"
                            ></b-form-select>
                            <div
                                v-if="submitted && $v.form.agency.$error"
                                class="invalid-feedback"
                            >
                                <span v-if="!$v.form.agency.required"
                                    >This value is required.</span
                                >
                            </div>
                        </div>
                        <div class="mb-2">
                            <label for="prexcClass">Campus </label>
                            <b-form-select
                                class="form-select"
                                v-model="form.campus"
                                size="sm"
                                :options="campuses"
                                :class="{
                                    'is-invalid':
                                        submitted && $v.form.campus.$error,
                                }"
                                @change="changeCampus"
                            ></b-form-select>
                            <div
                                v-if="submitted && $v.form.campus.$error"
                                class="invalid-feedback"
                            >
                                <span v-if="!$v.form.campus.required"
                                    >This value is required.</span
                                >
                            </div>
                        </div>
                        <div class="mb-2">
                            <label for="prexcClass">Office </label>
                            <b-form-select
                                class="form-select"
                                v-model="form.office"
                                size="sm"
                                :options="offices"
                                :class="{
                                    'is-invalid':
                                        submitted && $v.form.office.$error,
                                }"
                                @change="changeOffice"
                            ></b-form-select>
                            <div
                                v-if="submitted && $v.form.office.$error"
                                class="invalid-feedback"
                            >
                                <span v-if="!$v.form.office.required"
                                    >This value is required.</span
                                >
                            </div>
                        </div>
                        <!-- <div class="mb-4">
                            <label for="deliveryUnit">Delivery Unit </label>
                            <input
                                autocomplete="off"
                                id="deliveryUnit"
                                type="text"
                                v-model="form.deliveryUnit"
                                placeholder="Enter Delivery Unit..."
                                class="form-control"
                                :class="{
                                    'is-invalid':
                                        submitted &&
                                        $v.form.deliveryUnit.$error,
                                }"
                                disabled
                            />
                            <div
                                v-if="submitted && $v.form.deliveryUnit.$error"
                                class="invalid-feedback"
                            >
                                <span v-if="!$v.form.deliveryUnit.required"
                                    >This value is required.</span
                                >
                            </div>
                        </div> -->
                        <div class="mb-4">
                            <label for="prexcClass">Delivery Unit </label>
                            <b-form-select
                                class="form-select"
                                v-model="form.deliveryUnitId"
                                size="sm"
                                :options="dus"
                                :class="{
                                    'is-invalid':
                                        submitted &&
                                        $v.form.deliveryUnitId.$error,
                                }"
                            ></b-form-select>
                            <div
                                v-if="
                                    submitted && $v.form.deliveryUnitId.$error
                                "
                                class="invalid-feedback"
                            >
                                <span v-if="!$v.form.deliveryUnitId.required"
                                    >This value is required.</span
                                >
                            </div>
                        </div>
                        <div class="mb-2 row">
                            <div class="col">
                                <input
                                    autocomplete="off"
                                    class="form-check-input"
                                    type="checkbox"
                                    id="isChedIdentified"
                                    v-model="form.isChedIdentified"
                                />&nbsp;&nbsp;
                                <label
                                    class="form-check-label"
                                    for="isChedIdentified"
                                    >Is Ched Identified?</label
                                >
                            </div>
                            <div class="col">
                                <input
                                    autocomplete="off"
                                    class="form-check-input"
                                    type="checkbox"
                                    id="isRdcPriority"
                                    v-model="form.isRdcPriority"
                                />&nbsp;&nbsp;
                                <label
                                    class="form-check-label"
                                    for="isRdcPriority"
                                    >Is RDC Priority?</label
                                >
                            </div>
                        </div>
                        <div class="mb-2 row">
                            <div class="col">
                                <input
                                    autocomplete="off"
                                    class="form-check-input"
                                    type="checkbox"
                                    id="isThesisRequired"
                                    v-model="form.isThesisRequired"
                                />&nbsp;&nbsp;
                                <label
                                    class="form-check-label"
                                    for="isThesisRequired"
                                    >Is Thesis Required?</label
                                >
                            </div>
                            <div class="col">
                                <input
                                    autocomplete="off"
                                    class="form-check-input"
                                    type="checkbox"
                                    id="isAccreditable"
                                    v-model="form.isAccreditable"
                                />&nbsp;&nbsp;
                                <label
                                    class="form-check-label"
                                    for="isAccreditable"
                                    >Is Accreditable?</label
                                >
                            </div>
                        </div>
                        <div class="mb-2 row">
                            <div class="col">
                                <input
                                    autocomplete="off"
                                    class="form-check-input"
                                    type="checkbox"
                                    id="isNonBoard"
                                    v-model="form.isNonBoard"
                                />&nbsp;&nbsp;
                                <label class="form-check-label" for="isNonBoard"
                                    >Is Nonboard?</label
                                >
                            </div>
                            <div class="col">
                                <input
                                    autocomplete="off"
                                    class="form-check-input"
                                    type="checkbox"
                                    id="isOnCampus"
                                    v-model="form.isOnCampus"
                                />&nbsp;&nbsp;
                                <label class="form-check-label" for="isOnCampus"
                                    >Is on Campus?</label
                                >
                            </div>
                        </div>
                        <div class="mb-2">
                            <input
                                autocomplete="off"
                                class="form-check-input"
                                type="checkbox"
                                id="isDistanceLearning"
                                v-model="form.isDistanceLearning"
                            />&nbsp;&nbsp;
                            <label
                                class="form-check-label"
                                for="isDistanceLearning"
                                >Is Distance Learning?</label
                            >
                        </div>
                    </b-col>
                </b-row>
                <b-row>
                    <b-col>
                        <div class="mb-3">
                            <label for="notes" class="mb-0">Notes </label>
                            <input
                                autocomplete="off"
                                id="notes"
                                type="text"
                                v-model="form.notes"
                                placeholder="Enter Notes..."
                                class="form-control"
                                :class="{
                                    'is-invalid':
                                        submitted && $v.form.notes.$error,
                                }"
                            />
                            <div
                                v-if="submitted && $v.form.notes.$error"
                                class="invalid-feedback"
                            >
                                <span v-if="!$v.form.notes.required"
                                    >This value is required.</span
                                >
                            </div>
                        </div>
                    </b-col>
                </b-row>
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
            id="exam-schedule-modal"
            :title="modalTitle"
            size="md"
            title-class="font-18"
            hide-footer
            no-close-on-backdrop
        >
            <form
                @submit.prevent="onCreateEs"
                class="needs-validation"
                ref="fcForm"
            >
                <div class="mb-3">
                    <label for="programName">Examination </label>
                    <b-input-group>
                        <template #append>
                            <b-button @click="getEm" variant="outline-info"
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
                            placeholder="Search Examination..."
                            class="form-control"
                            v-model="examination"
                        />
                    </b-input-group>
                </div>
                <div class="mb-3">
                    <label for="venue">Venue </label>
                    <input
                        autocomplete="off"
                        id="venue"
                        type="text"
                        v-model="examSched.venue"
                        placeholder="Enter Venue..."
                        class="form-control"
                        :class="{
                            'is-invalid':
                                submitted && $v.examSched.venue.$error,
                        }"
                    />
                    <div
                        v-if="submitted && $v.examSched.venue.$error"
                        class="invalid-feedback"
                    >
                        <span v-if="!$v.examSched.venue.required"
                            >This value is required.</span
                        >
                    </div>
                </div>
                <div class="mb-3">
                    <label for="host">Host </label>
                    <input
                        autocomplete="off"
                        id="host"
                        type="text"
                        v-model="examSched.host"
                        placeholder="Enter Host..."
                        class="form-control"
                        :class="{
                            'is-invalid': submitted && $v.examSched.host.$error,
                        }"
                    />
                    <div
                        v-if="submitted && $v.examSched.host.$error"
                        class="invalid-feedback"
                    >
                        <span v-if="!$v.examSched.host.required"
                            >This value is required.</span
                        >
                    </div>
                </div>
                <div class="row mb-3">
                    <b-col>
                        <div>
                            <label for="boardResNo">From </label>
                            <date-picker
                                v-model="examSched.dateFrom"
                                :first-day-of-week="1"
                                lang="en"
                                placeholder="Enter Date From..."
                                :class="{
                                    'is-invalid':
                                        submitted &&
                                        $v.examSched.dateFrom.$error,
                                }"
                            ></date-picker>
                            <div
                                v-if="submitted && $v.examSched.dateFrom.$error"
                                class="invalid-feedback"
                            >
                                <span v-if="!$v.examSched.dateFrom.required"
                                    >This value is required.</span
                                >
                            </div>
                        </div>
                    </b-col>
                    <b-col>
                        <div>
                            <label for="boardResNo">To </label>
                            <date-picker
                                v-model="examSched.dateTo"
                                :first-day-of-week="1"
                                lang="en"
                                placeholder="Enter Date To..."
                                :class="{
                                    'is-invalid':
                                        submitted && $v.examSched.dateTo.$error,
                                }"
                            ></date-picker>
                            <div
                                v-if="submitted && $v.examSched.dateTo.$error"
                                class="invalid-feedback"
                            >
                                <span v-if="!$v.examSched.dateTo.required"
                                    >This value is required.</span
                                >
                            </div>
                        </div>
                    </b-col>
                </div>
                <div class="mb-3">
                    <label for="remarks">Remarks </label>
                    <input
                        autocomplete="off"
                        id="remarks"
                        type="text"
                        v-model="examSched.remarks"
                        placeholder="Enter Remarks..."
                        class="form-control"
                        :class="{
                            'is-invalid':
                                submitted && $v.examSched.remarks.$error,
                        }"
                    />
                    <div
                        v-if="submitted && $v.examSched.remarks.$error"
                        class="invalid-feedback"
                    >
                        <span v-if="!$v.examSched.remarks.required"
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
                        @click="hideModalEs"
                    >
                        Close
                    </button>
                </div>
            </form>
        </b-modal>
        <b-modal
            id="taker-modal"
            :title="modalTitle"
            size="md"
            title-class="font-18"
            hide-footer
            no-close-on-backdrop
        >
            <form
                @submit.prevent="onCreateTaker()"
                class="needs-validation"
                ref="fcForm"
            >
                <div class="mb-3">
                    <label for="numberOfTakers">Number of Takers </label>
                    <input
                        autocomplete="off"
                        id="numberOfTakers"
                        type="text"
                        v-model="taker.numberOfTakers"
                        placeholder="Enter Number of Takers..."
                        class="form-control"
                        :class="{
                            'is-invalid':
                                submitted && $v.taker.numberOfTakers.$error,
                        }"
                    />
                    <div
                        v-if="submitted && $v.taker.numberOfTakers.$error"
                        class="invalid-feedback"
                    >
                        <span v-if="!$v.taker.numberOfTakers.required"
                            >This value is required.</span
                        >
                        <span v-if="!$v.taker.numberOfTakers.numeric"
                            >This value should be a valid number.</span
                        >
                    </div>
                </div>
                <div class="mb-3">
                    <label for="numberOfPassers">Number of Passers </label>
                    <input
                        autocomplete="off"
                        id="numberOfPassers"
                        type="text"
                        v-model="taker.numberOfPassers"
                        placeholder="Enter Number of Passers..."
                        class="form-control"
                        :class="{
                            'is-invalid':
                                submitted && $v.taker.numberOfPassers.$error,
                        }"
                    />
                    <div
                        v-if="submitted && $v.taker.numberOfPassers.$error"
                        class="invalid-feedback"
                    >
                        <span v-if="!$v.taker.numberOfPassers.required"
                            >This value is required.</span
                        >
                        <span v-if="!$v.taker.numberOfPassers.numeric"
                            >This value should be a valid number.</span
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
                        @click="hideModalTaker"
                    >
                        Close
                    </button>
                </div>
            </form>
        </b-modal>
        <b-modal
            id="student-modal"
            :title="modalTitle"
            size="md"
            title-class="font-18"
            hide-footer
            no-close-on-backdrop
        >
            <form
                @submit.prevent="onCreateStudent"
                class="needs-validation"
                ref="studentForm"
            >
                <div class="mb-3">
                    <label for="firstName">First Name</label>
                    <input
                        autocomplete="off"
                        id="firstName"
                        type="text"
                        v-model="student.firstName"
                        placeholder="Enter First Name..."
                        class="form-control"
                        :class="{
                            'is-invalid':
                                submitted && $v.student.firstName.$error,
                        }"
                    />
                    <div
                        v-if="submitted && $v.student.firstName.$error"
                        class="invalid-feedback"
                    >
                        <span v-if="!$v.student.firstName.required"
                            >This value is required.</span
                        >
                    </div>
                </div>
                <div class="mb-3">
                    <label for="middleName">Middle Name</label>
                    <input
                        autocomplete="off"
                        id="middleName"
                        type="text"
                        v-model="student.middleName"
                        placeholder="Enter Middle Name..."
                        class="form-control"
                        :class="{
                            'is-invalid':
                                submitted && $v.student.middleName.$error,
                        }"
                    />
                    <div
                        v-if="submitted && $v.student.middleName.$error"
                        class="invalid-feedback"
                    >
                        <span v-if="!$v.student.middleName.required"
                            >This value is required.</span
                        >
                    </div>
                </div>
                <div class="mb-3">
                    <label for="lastName">Last Name</label>
                    <input
                        autocomplete="off"
                        id="lastName"
                        type="text"
                        v-model="student.lastName"
                        placeholder="Enter Last Name..."
                        class="form-control"
                        :class="{
                            'is-invalid':
                                submitted && $v.student.lastName.$error,
                        }"
                    />
                    <div
                        v-if="submitted && $v.student.lastName.$error"
                        class="invalid-feedback"
                    >
                        <span v-if="!$v.student.lastName.required"
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
                        @click="hideStudentModal"
                    >
                        Close
                    </button>
                </div>
            </form>
        </b-modal>
        <b-modal
            id="excel-modal"
            title="Upload Excel"
            size="md"
            title-class="font-18"
            hide-footer
            no-close-on-backdrop
        >
            <form class="needs-validation mb-3" ref="usForm">
                <div class="input-group">
                    <input
                        type="file"
                        class="form-control"
                        id="inputGroupFile04"
                        aria-describedby="inputGroupFileAddon04"
                        aria-label="Upload"
                        @change="renderExcel"
                    />
                    <button
                        class="btn btn-primary"
                        type="button"
                        id="inputGroupFileAddon04"
                        @click="uploadExcel"
                    >
                        Upload
                    </button>
                </div>
            </form>
        </b-modal>
        <b-modal
            id="extension-modal"
            :title="modalTitle"
            size="md"
            title-class="font-18"
            hide-footer
            no-close-on-backdrop
        >
            <form
                @submit.prevent="onCreateExt"
                class="needs-validation"
                ref="extForm"
            >
                <div class="mb-3">
                    <label for="extensionName">Extension Name </label>
                    <input
                        autocomplete="off"
                        id="extensionName"
                        type="text"
                        v-model="ext.extensionName"
                        placeholder="Enter Extension Name..."
                        class="form-control"
                        :class="{
                            'is-invalid':
                                submitted && $v.ext.extensionName.$error,
                        }"
                    />
                    <div
                        v-if="submitted && $v.ext.extensionName.$error"
                        class="invalid-feedback"
                    >
                        <span v-if="!$v.ext.extensionName.required"
                            >This value is required.</span
                        >
                    </div>
                </div>
                <div class="mb-3">
                    <label for="boardResNo">Date From </label>
                    <date-picker
                        v-model="ext.dateFrom"
                        :first-day-of-week="1"
                        lang="en"
                        placeholder="Enter Date From..."
                        :class="{
                            'is-invalid': submitted && $v.ext.dateFrom.$error,
                        }"
                    ></date-picker>
                    <div
                        v-if="submitted && $v.ext.dateFrom.$error"
                        class="invalid-feedback"
                    >
                        <span v-if="!$v.ext.dateFrom.required"
                            >This value is required.</span
                        >
                    </div>
                </div>
                <div class="mb-3">
                    <label for="boardResNo">Date To </label>
                    <date-picker
                        v-model="ext.dateTo"
                        :first-day-of-week="1"
                        lang="en"
                        placeholder="Enter Date To..."
                        :class="{
                            'is-invalid': submitted && $v.ext.dateTo.$error,
                        }"
                    ></date-picker>
                    <div
                        v-if="submitted && $v.ext.dateTo.$error"
                        class="invalid-feedback"
                    >
                        <span v-if="!$v.ext.dateTo.required"
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
                        @click="hideModalExtension"
                    >
                        Close
                    </button>
                </div>
            </form>
        </b-modal>
        <b-modal
            id="accreditation-modal"
            :title="modalTitle"
            size="md"
            title-class="font-18"
            hide-footer
            no-close-on-backdrop
        >
            <form
                @submit.prevent="onCreateAccred"
                class="needs-validation"
                ref="accredForm"
            >
                <div class="mb-3">
                    <label for="accreditor">Accreditor </label>
                    <b-input-group>
                        <template #append>
                            <b-button
                                @click="getAccreditor"
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
                            placeholder="Search Accreditor..."
                            class="form-control"
                            :class="{
                                'is-invalid':
                                    submitted && $v.accred.accreditorId.$error,
                            }"
                            v-model="accreditor"
                        />
                    </b-input-group>
                    <div
                        v-if="submitted && $v.accred.accreditorId.$error"
                        class="invalid-feedback"
                    >
                        <span v-if="!$v.accred.accreditorId.required"
                            >This value is required.</span
                        >
                    </div>
                </div>
                <div class="mb-3">
                    <label for="accreditor">Survey Level </label>
                    <b-input-group>
                        <template #append>
                            <b-button
                                @click="getSurveyLevel"
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
                            placeholder="Search Survey Level..."
                            class="form-control"
                            :class="{
                                'is-invalid':
                                    submitted && $v.accred.surveyLevelId.$error,
                            }"
                            v-model="surveyLevel"
                        />
                    </b-input-group>
                    <div
                        v-if="submitted && $v.accred.surveyLevelId.$error"
                        class="invalid-feedback"
                    >
                        <span v-if="!$v.accred.surveyLevelId.required"
                            >This value is required.</span
                        >
                    </div>
                </div>
                <div class="mb-3">
                    <label for="score">Score </label>
                    <input
                        autocomplete="off"
                        id="score"
                        type="text"
                        v-model="accred.score"
                        placeholder="Enter Score..."
                        class="form-control"
                    />
                    <!-- :class="{
                            'is-invalid': submitted && $v.accred.score.$error,
                        }"
                    <div
                        v-if="submitted && $v.accred.score.$error"
                        class="invalid-feedback"
                    >
                        <span v-if="!$v.accred.score.required"
                            >This value is required.</span
                        >
                    </div> -->
                </div>
                <div class="mb-3">
                    <label for="pStatus">Status </label>
                    <input
                        autocomplete="off"
                        id="pStatus"
                        type="text"
                        v-model="accred.status"
                        placeholder="Enter Status..."
                        class="form-control"
                    />
                    <!-- :class="{
                            'is-invalid': submitted && $v.accred.status.$error,
                        }"
                    <div
                        v-if="submitted && $v.accred.status.$error"
                        class="invalid-feedback"
                    >
                        <span v-if="!$v.accred.status.required"
                            >This value is required.</span
                        >
                    </div> -->
                </div>
                <div class="row mb-3">
                    <b-col>
                        <div>
                            <label for="boardResNo">From </label>
                            <date-picker
                                v-model="accred.dateFrom"
                                :first-day-of-week="1"
                                lang="en"
                                placeholder="Enter Date From..."
                            ></date-picker>
                            <!-- :class="{
                                    'is-invalid':
                                        submitted && $v.accred.dateFrom.$error,
                                }"
                            <div
                                v-if="submitted && $v.accred.dateFrom.$error"
                                class="invalid-feedback"
                            >
                                <span v-if="!$v.accred.dateFrom.required"
                                    >This value is required.</span
                                >
                            </div> -->
                        </div>
                    </b-col>
                    <b-col>
                        <div>
                            <label for="boardResNo">Surveyed </label>
                            <date-picker
                                v-model="accred.dateSurveyed"
                                :first-day-of-week="1"
                                lang="en"
                                placeholder="Enter Date Surveyed..."
                            ></date-picker>
                            <!-- :class="{
                                    'is-invalid':
                                        submitted &&
                                        $v.accred.dateSurveyed.$error,
                                }"
                            <div
                                v-if="
                                    submitted && $v.accred.dateSurveyed.$error
                                "
                                class="invalid-feedback"
                            >
                                <span v-if="!$v.accred.dateSurveyed.required"
                                    >This value is required.</span
                                >
                            </div> -->
                        </div>
                    </b-col>
                </div>
                <div class="row mb-3">
                    <b-col>
                        <div>
                            <label for="boardResNo">Granted </label>
                            <date-picker
                                v-model="accred.dateGranted"
                                :first-day-of-week="1"
                                lang="en"
                                placeholder="Enter Date Granted..."
                            ></date-picker>
                            <!-- :class="{
                                    'is-invalid':
                                        submitted &&
                                        $v.accred.dateGranted.$error,
                                }"
                            <div
                                v-if="submitted && $v.accred.dateGranted.$error"
                                class="invalid-feedback"
                            >
                                <span v-if="!$v.accred.dateGranted.required"
                                    >This value is required.</span
                                >
                            </div> -->
                        </div>
                    </b-col>
                    <b-col>
                        <div>
                            <label for="boardResNo">Expiry </label>
                            <date-picker
                                v-model="accred.expiry"
                                :first-day-of-week="1"
                                lang="en"
                                placeholder="Enter Expiry..."
                            ></date-picker>
                            <!-- :class="{
                                    'is-invalid':
                                        submitted && $v.accred.expiry.$error,
                                }"
                            <div
                                v-if="submitted && $v.accred.expiry.$error"
                                class="invalid-feedback"
                            >
                                <span v-if="!$v.accred.expiry.required"
                                    >This value is required.</span
                                >
                            </div> -->
                        </div>
                    </b-col>
                </div>
                <div class="mb-3">
                    <label for="remarks">Remarks </label>
                    <input
                        autocomplete="off"
                        id="remarks"
                        type="text"
                        v-model="accred.remarks"
                        placeholder="Enter Remarks..."
                        class="form-control"
                        :class="{
                            'is-invalid': submitted && $v.accred.remarks.$error,
                        }"
                    />

                    <div
                        v-if="submitted && $v.accred.remarks.$error"
                        class="invalid-feedback"
                    >
                        <span v-if="!$v.accred.remarks.required"
                            >This value is required.</span
                        >
                    </div>
                </div>
                <div class="mb-3">
                    <input
                        autocomplete="off"
                        class="form-check-input"
                        type="checkbox"
                        id="isCurrent"
                        v-model="accred.isCurrent"
                    />&nbsp;&nbsp;
                    <label class="form-check-label" for="isCurrent"
                        >Is Current?</label
                    >
                </div>
                <div class="modal-footer">
                    <button type="submit" class="btn btn-primary">
                        Save changes
                    </button>
                    <button
                        type="button"
                        class="btn btn-link"
                        @click="hideModalAccred"
                    >
                        Close
                    </button>
                </div>
            </form>
        </b-modal>
        <b-modal
            id="enrollment-modal"
            :title="modalTitle"
            size="md"
            title-class="font-18"
            hide-footer
            no-close-on-backdrop
        >
            <form
                @submit.prevent="onCreateEnrollment"
                class="needs-validation"
                ref="enrollmentForm"
            >
                <div class="mb-3">
                    <label for="schoolYear">School Year</label>
                    <!-- <div class="d-flex align-items-center">
                        <div class="me-4 w-100">
                            <masked-input
                                autocomplete="off"
                                id="fromSY"
                                type="text"
                                v-model="enrollment.fromSY"
                                placeholder="Enter From SY..."
                                class="form-control"
                                :class="{
                                    'is-invalid':
                                        submitted && $v.enrollment.fromSY.$error,
                                }"
                                :mask="currencyMask"
                            ></masked-input>
                            <div
                                v-if="submitted && $v.enrollment.fromSY.$error"
                                class="invalid-feedback"
                            >
                                <span v-if="!$v.enrollment.fromSY.required"
                                    >This value is required.</span
                                >
                            </div>
                        </div>
                        <p class="mb-0">to</p>
                        <div class="ms-4 w-100">
                            <masked-input
                                autocomplete="off"
                                id="toSY"
                                type="text"
                                v-model="enrollment.toSY"
                                placeholder="Enter To SY..."
                                class="form-control"
                                :class="{
                                    'is-invalid':
                                        submitted && $v.enrollment.toSY.$error,
                                }"
                                :mask="currencyMask"
                            ></masked-input>
                            <div
                                v-if="submitted && $v.enrollment.toSY.$error"
                                class="invalid-feedback"
                            >
                                <span v-if="!$v.enrollment.toSY.required"
                                    >This value is required.</span
                                >
                            </div>
                        </div>
                    </div> -->
                    <select
                        class="form-select"
                        id="schoolYear"
                        v-model="enrollment.schoolYear"
                        placeholder="Select School Year..."
                        :class="{
                            'is-invalid':
                                submitted && $v.enrollment.schoolYear.$error,
                        }"
                    >
                        <option value=""></option>
                        <option
                            v-for="(x, index) in getSchoolYear()"
                            :key="index"
                        >
                            {{ x }}
                        </option>
                    </select>
                </div>
                <div class="mb-3">
                    <label for="semester">Semester</label>
                    <select
                        class="form-select"
                        id="semester"
                        v-model="enrollment.semester"
                        placeholder="Select Semester..."
                        :class="{
                            'is-invalid':
                                submitted && $v.enrollment.semester.$error,
                        }"
                    >
                        <option></option>
                        <option>1st Semester</option>
                        <option>2nd Semester</option>
                    </select>
                    <!-- <input
                        autocomplete="off"
                        id="semester"
                        type="text"
                        v-model="enrollment.semester"
                        placeholder="Enter Semester..."
                        class="form-control"
                        :class="{
                            'is-invalid':
                                submitted && $v.enrollment.semester.$error,
                        }"
                    /> -->
                    <div
                        v-if="submitted && $v.enrollment.semester.$error"
                        class="invalid-feedback"
                    >
                        <span v-if="!$v.enrollment.semester.required"
                            >This value is required.</span
                        >
                    </div>
                </div>
                <div class="mb-3">
                    <label for="numberOfEnrollees">No. of Enrollees</label>
                    <masked-input
                        autocomplete="off"
                        id="numberOfEnrollees"
                        type="text"
                        v-model="enrollment.numberOfEnrollees"
                        placeholder="Enter No. of Enrollees..."
                        class="form-control"
                        :class="{
                            'is-invalid':
                                submitted &&
                                $v.enrollment.numberOfEnrollees.$error,
                        }"
                        :mask="currencyMask"
                    ></masked-input>
                    <div
                        v-if="
                            submitted && $v.enrollment.numberOfEnrollees.$error
                        "
                        class="invalid-feedback"
                    >
                        <span v-if="!$v.enrollment.numberOfEnrollees.required"
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
                        @click="$bvModal.hide('enrollment-modal')"
                    >
                        Close
                    </button>
                </div>
            </form>
        </b-modal>
        <div class="row">
            <div class="col-md-3">
                <div class="card">
                    <div class="card-body p-4">
                        <div class="search-box">
                            <p class="text-muted">Search</p>
                            <div class="position-relative">
                                <input
                                    autocomplete="off"
                                    type="text"
                                    class="form-control rounded border-light"
                                    placeholder="Search Program..."
                                    v-model="filter"
                                    @input="hideDetails"
                                />
                                <i class="mdi mdi-magnify search-icon"></i>
                            </div>
                        </div>

                        <hr class="my-3" />
                        <button
                            type="button"
                            @click="addProgram"
                            class="
                                btn btn-md btn-block btn-primary
                                d-flex
                                align-items-center
                                justify-content-center
                                mb-2
                            "
                        >
                            <i class="bx bx-plus fs-6"></i>Create New Program
                        </button>
                        <b-dropdown
                            id="dropdown-dropleft"
                            right
                            variant="purple"
                            toggle-class="text-decoration-none"
                            menu-class="dropdown-menu-end"
                            no-caret
                            class="w-100"
                        >
                            <template #button-content>
                                <i class="bx bx-printer me-1"></i> Reports
                            </template>
                            <b-dropdown-item @click="printBar1Graduate('system', 0)">Graduate Bar 1 System</b-dropdown-item>
                            <b-dropdown-item @click="printBar1UnderGrad('system', 0)">Undergraduate Bar 1 System</b-dropdown-item>
                            <b-dropdown-item @click="printBar1Employment('system', 0)">Employment</b-dropdown-item>
                        </b-dropdown>
                        <hr class="my-3" />

                        <div>
                            <div class="d-flex justify-content-between align-items-center mb-1">
                                <p class="text-muted mb-0">Categories</p>
                                <input type="search" class="form-control form-control-sm w-50" v-model="filterCat" placeholder="Search Category"/>
                            </div>
                            <!-- <span v-if="!loadCategory && categories.length == 0"
                                >No data found</span
                            > -->
                            <b-skeleton-wrapper :loading="loadCategory">
                                <template #loading>
                                    <ul class="list-unstyled fw-medium">
                                        <li
                                            class="mb-3"
                                            v-for="n in 3"
                                            :key="n"
                                        >
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
                                            'text-muted': filterByCategory > 0,
                                        }"
                                        @click="getByCat(0)"
                                        ><i
                                            class="mdi mdi-chevron-right me-1"
                                        ></i>
                                        All</a
                                    >
                                </li>
                                <li v-for="x in filteredCategories" :key="x.id">
                                    <a
                                        href="javascript:void(0);"
                                        class="py-2 d-block"
                                        :class="{
                                            'text-primary':
                                                filterByCategory == x.id,
                                            'text-muted':
                                                filterByCategory != x.id,
                                        }"
                                        @click="getByCat(x.id)"
                                        ><i
                                            class="mdi mdi-chevron-right me-1"
                                        ></i>
                                        {{ x.category }}</a
                                    >
                                </li>
                            </ul>
                            <ul
                                class="
                                    pagination
                                    justify-content-end
                                "
                            >
                                <b-pagination
                                    size="sm"
                                    v-model="
                                        currentPageCat
                                    "
                                    :total-rows="
                                        rowsCat
                                    "
                                    :per-page="
                                        perPageCat
                                    "
                                ></b-pagination>
                            </ul>
                        </div>
                        <div>
                            <p class="text-muted mb-0">Groupings</p>
                            <select class="form-select mt-2" v-model="groupings">
                                <option value="">Group By</option>
                                <option value="1">Campus</option>
                                <option value="2">Delivery Unit</option>
                            </select>
                            <div v-if="groupings == 1">
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
                                    <b-dropdown-item @click="printBar1Graduate('campus', groupCampus)">Graduate</b-dropdown-item>
                                    <b-dropdown-item @click="printBar1UnderGrad('campus', groupCampus)">Undergraduate</b-dropdown-item>
                                    <b-dropdown-item @click="printBar1Employment('campus', groupCampus)">Employment</b-dropdown-item>
                                </b-dropdown>
                            </div>
                            <div v-if="groupings == 2">
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
                                    <b-dropdown-item @click="printBar1Graduate('du', groupDU)">Graduate</b-dropdown-item>
                                    <b-dropdown-item @click="printBar1UnderGrad('du', groupDU)">Undergraduate</b-dropdown-item>
                                    <b-dropdown-item @click="printBar1Employment('du', groupDU)">Employment</b-dropdown-item>
                                </b-dropdown>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- end card -->
            </div>
            <div class="col-md-9">
                <b-row v-if="showDetail">
                    <b-col>
                        <div class="card position-relative border shadow">
                            <div class="d-flex hide-detail-btn-rt12">
                                <a
                                    href="javascript:void(0)"
                                    @click="hideDetails"
                                    title="Hide Details"
                                >
                                    <i class="bx bx-x fs-2"></i>
                                </a>
                            </div>
                            <div class="card-header px-3 pt-3">
                                <h4
                                    class="
                                        card-title
                                        mb-0
                                        d-flex
                                        align-items-center
                                    "
                                    :id="'program-' + form.id"
                                >
                                    {{ form.programName }} [{{
                                        form.shortName
                                    }}]
                                    <span class="badge bg-success ms-1">{{
                                        form.boardResNo
                                    }}</span>
                                </h4>
                                <small
                                    >[{{
                                        form.programCategory.category
                                    }}]</small
                                >
                            </div>
                            <div
                                class="
                                    d-flex
                                    justify-content-center
                                    align-items-center
                                    mb-3
                                "
                                v-if="detailLoading"
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
                                <strong>Loading Items...</strong>
                            </div>
                            <div class="card-body" v-if="!detailLoading">
                                <h5>Details:</h5>
                                <div class="mx-5">
                                    <b-row>
                                        <b-col sm="4">
                                            <ul class="list-group list-inline">
                                                <li
                                                    class="
                                                        list-inline-item
                                                        me-3
                                                    "
                                                >
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
                                                        Approved on
                                                        {{
                                                            formatDate(
                                                                new Date(
                                                                    form.dateApproved
                                                                )
                                                            )
                                                        }}
                                                    </a>
                                                </li>
                                                <li
                                                    class="
                                                        list-inline-item
                                                        me-3
                                                    "
                                                >
                                                    <a
                                                        href="javascript:void(0);"
                                                        class="text-muted"
                                                    >
                                                        <i
                                                            class="
                                                                mdi
                                                                mdi-book-clock
                                                                align-middle
                                                                text-muted
                                                                me-1
                                                            "
                                                        ></i>
                                                        Offered in
                                                        {{ form.yearOffered }}
                                                    </a>
                                                </li>
                                                <li
                                                    class="
                                                        list-inline-item
                                                        me-3
                                                    "
                                                >
                                                    <a
                                                        href="javascript:void(0);"
                                                        class="text-muted"
                                                    >
                                                        <i
                                                            class="
                                                                mdi
                                                                mdi-briefcase-clock
                                                                align-middle
                                                                text-muted
                                                                me-1
                                                            "
                                                        ></i>
                                                        First Graduated in
                                                        {{
                                                            form.yearFirstGraduate
                                                        }}
                                                    </a>
                                                </li>
                                            </ul>
                                        </b-col>
                                        <b-col sm="6">
                                            <ul class="list-inline mb-0">
                                                <li
                                                    class="
                                                        list-inline-item
                                                        me-3
                                                    "
                                                    v-if="form.isChedIdentified"
                                                >
                                                    <a
                                                        href="javascript:void(0);"
                                                        class="text-muted"
                                                    >
                                                        <i
                                                            class="
                                                                fas
                                                                fa-check
                                                                align-middle
                                                                text-muted
                                                                me-1
                                                            "
                                                        ></i>
                                                        Ched Identified
                                                    </a>
                                                </li>
                                                <li
                                                    class="
                                                        list-inline-item
                                                        me-3
                                                    "
                                                    v-if="form.isRdcPriority"
                                                >
                                                    <a
                                                        href="javascript:void(0);"
                                                        class="text-muted"
                                                    >
                                                        <i
                                                            class="
                                                                fas
                                                                fa-check
                                                                align-middle
                                                                text-muted
                                                                me-1
                                                            "
                                                        ></i>
                                                        RDC Priority
                                                    </a>
                                                </li>
                                                <li
                                                    class="
                                                        list-inline-item
                                                        me-3
                                                    "
                                                    v-if="form.isThesisRequired"
                                                >
                                                    <a
                                                        href="javascript:void(0);"
                                                        class="text-muted"
                                                    >
                                                        <i
                                                            class="
                                                                fas
                                                                fa-check
                                                                align-middle
                                                                text-muted
                                                                me-1
                                                            "
                                                        ></i>
                                                        Thesis Required
                                                    </a>
                                                </li>
                                                <li
                                                    class="
                                                        list-inline-item
                                                        me-3
                                                    "
                                                    v-if="form.isAccreditable"
                                                >
                                                    <a
                                                        href="javascript:void(0);"
                                                        class="text-muted"
                                                    >
                                                        <i
                                                            class="
                                                                fas
                                                                fa-check
                                                                align-middle
                                                                text-muted
                                                                me-1
                                                            "
                                                        ></i>
                                                        Accreditable
                                                    </a>
                                                </li>
                                                <li
                                                    class="
                                                        list-inline-item
                                                        me-3
                                                    "
                                                    v-if="form.isNonBoard"
                                                >
                                                    <a
                                                        href="javascript:void(0);"
                                                        class="text-muted"
                                                    >
                                                        <i
                                                            class="
                                                                fas
                                                                fa-check
                                                                align-middle
                                                                text-muted
                                                                me-1
                                                            "
                                                        ></i>
                                                        Non Board
                                                    </a>
                                                </li>
                                                <li
                                                    class="
                                                        list-inline-item
                                                        me-3
                                                    "
                                                    v-if="form.isOnCampus"
                                                >
                                                    <a
                                                        href="javascript:void(0);"
                                                        class="text-muted"
                                                    >
                                                        <i
                                                            class="
                                                                fas
                                                                fa-check
                                                                align-middle
                                                                text-muted
                                                                me-1
                                                            "
                                                        ></i>
                                                        On Campus
                                                    </a>
                                                </li>
                                                <li
                                                    class="
                                                        list-inline-item
                                                        me-3
                                                    "
                                                    v-if="
                                                        form.isDistanceLearning
                                                    "
                                                >
                                                    <a
                                                        href="javascript:void(0);"
                                                        class="text-muted"
                                                    >
                                                        <i
                                                            class="
                                                                fas
                                                                fa-check
                                                                align-middle
                                                                text-muted
                                                                me-1
                                                            "
                                                        ></i>
                                                        Distance Learning
                                                    </a>
                                                </li>
                                            </ul>
                                        </b-col>
                                        <b-col sm="12">
                                            <ul class="list-inline mb-0">
                                                <li
                                                    class="
                                                        list-inline-item
                                                        me-3
                                                    "
                                                >
                                                    <a
                                                        href="javascript:void(0);"
                                                        class="text-muted"
                                                    >
                                                        <i
                                                            class="
                                                                mdi
                                                                mdi-microsoft-onenote
                                                                align-middle
                                                                text-muted
                                                                me-1
                                                            "
                                                        ></i>
                                                        Note:
                                                        {{ form.notes }}
                                                    </a>
                                                </li>
                                            </ul>
                                        </b-col>
                                        <b-col sm="12">
                                            <ul class="list-inline">
                                                <li
                                                    class="
                                                        list-inline-item
                                                        me-3
                                                    "
                                                >
                                                    <a
                                                        href="javascript:void(0);"
                                                        class="text-muted"
                                                    >
                                                        <i
                                                            class="
                                                                mdi
                                                                mdi-office-building-marker
                                                                align-middle
                                                                text-muted
                                                                me-1
                                                            "
                                                        ></i>
                                                        Campus:
                                                        {{
                                                            form.deliveryUnit
                                                                .office.campus
                                                                .campusName
                                                        }}
                                                    </a>
                                                </li>
                                            </ul>
                                        </b-col>
                                    </b-row>
                                </div>
                                <div role="tablist">
                                    <b-card no-body class="mb-1">
                                        <b-card-header
                                            header-tag="header"
                                            role="tab"
                                            class="
                                                d-flex
                                                align-items-center
                                                justify-content-between
                                                bg-primary bg-soft
                                            "
                                        >
                                            <div
                                                class="
                                                    d-flex
                                                    align-items-center
                                                "
                                            >
                                                <h6 class="m-0 me-2">
                                                    Exam Schedules
                                                </h6>
                                                <a
                                                    @click="toggleAccordion(1)"
                                                    class="text-primary"
                                                    href="javascript: void(0);"
                                                    >[{{
                                                        !toggleExamSched
                                                            ? "Show"
                                                            : "Hide"
                                                    }}]</a
                                                >
                                            </div>
                                            <div
                                                class="d-flex search-box"
                                                v-if="toggleExamSched"
                                            >
                                                <div
                                                    class="
                                                        position-relative
                                                        me-2
                                                    "
                                                >
                                                    <input
                                                        autocomplete="off"
                                                        type="text"
                                                        class="
                                                            form-control
                                                            rounded
                                                            border-light
                                                            form-control-sm
                                                        "
                                                        placeholder="Search Exam Scheds..."
                                                        v-model="filterEs"
                                                    />
                                                    <i
                                                        class="
                                                            mdi mdi-magnify
                                                            search-icon-sm
                                                            fs-6
                                                        "
                                                    ></i>
                                                </div>
                                                <button
                                                    type="button"
                                                    class="
                                                        btn btn-sm btn-primary
                                                    "
                                                    @click="addEs"
                                                >
                                                    <i class="bx bx-plus"></i>
                                                </button>
                                            </div>
                                        </b-card-header>
                                        <b-collapse
                                            accordion="exam-sched-accordion"
                                            role="tabpanel"
                                            :visible="toggleExamSched"
                                        >
                                            <b-card-body class="py-2 px-0">
                                                <b-row v-if="examSchedLoading">
                                                    <div
                                                        class="col-md-4"
                                                        v-for="n in 3"
                                                        :key="n"
                                                    >
                                                        <b-skeleton-wrapper
                                                            loading
                                                        >
                                                            <template #loading>
                                                                <b-card
                                                                    class="
                                                                        bg-primary
                                                                        bg-soft
                                                                    "
                                                                >
                                                                    <div
                                                                        class="
                                                                            mb-2
                                                                            mt-2
                                                                        "
                                                                    >
                                                                        <b-skeleton
                                                                            width="100%"
                                                                            height="18px"
                                                                        ></b-skeleton>
                                                                    </div>
                                                                    <b-skeleton
                                                                        width="60%"
                                                                        height="12px"
                                                                    ></b-skeleton>
                                                                    <b-skeleton
                                                                        width="50%"
                                                                        height="12px"
                                                                    ></b-skeleton>
                                                                    <b-skeleton
                                                                        width="80%"
                                                                        height="12px"
                                                                    ></b-skeleton>
                                                                    <b-skeleton
                                                                        width="60%"
                                                                        height="12px"
                                                                    ></b-skeleton>
                                                                    <b-skeleton
                                                                        width="100%"
                                                                        height="18px"
                                                                        class="
                                                                            bg-primary
                                                                            bg-gradient
                                                                        "
                                                                    ></b-skeleton>
                                                                </b-card>
                                                            </template>
                                                        </b-skeleton-wrapper>
                                                    </div>
                                                </b-row>
                                                <b-row
                                                    v-if="
                                                        filteredExamSched.length >
                                                        0
                                                    "
                                                >
                                                    <b-col
                                                        sm="4"
                                                        v-for="(
                                                            x, index
                                                        ) in filteredExamSched"
                                                        :key="x.id"
                                                    >
                                                        <div
                                                            class="
                                                                card
                                                                text-primary
                                                                bg-primary
                                                                bg-soft
                                                                position-relative
                                                            "
                                                        >
                                                            <div
                                                                class="
                                                                    hide-detail-btn-xs
                                                                "
                                                            >
                                                                <b-dropdown
                                                                    id="dropdown-dropleft"
                                                                    right
                                                                    variant="link"
                                                                    toggle-class="text-decoration-none px-1 py-0"
                                                                    menu-class="dropdown-menu-end"
                                                                    no-caret
                                                                >
                                                                    <template
                                                                        #button-content
                                                                    >
                                                                        <i
                                                                            class="
                                                                                fas
                                                                                fa-ellipsis-h
                                                                                p-0
                                                                            "
                                                                        ></i>
                                                                    </template>
                                                                    <b-dropdown-item
                                                                        @click="
                                                                            updateItemEs(
                                                                                x
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
                                                                            deleteItemEs(
                                                                                x
                                                                            )
                                                                        "
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
                                                            <div
                                                                class="
                                                                    card-body
                                                                "
                                                            >
                                                                <h4
                                                                    class="
                                                                        card-title
                                                                    "
                                                                >
                                                                    {{
                                                                        x
                                                                            .examination
                                                                            .examName
                                                                    }}
                                                                </h4>
                                                                <ul
                                                                    class="
                                                                        list-group
                                                                        list-inline
                                                                    "
                                                                >
                                                                    <li
                                                                        class="
                                                                            list-inline-item
                                                                            me-3
                                                                        "
                                                                    >
                                                                        <a
                                                                            href="javascript:void(0);"
                                                                            class="
                                                                                text-primary
                                                                            "
                                                                        >
                                                                            <i
                                                                                class="
                                                                                    bx
                                                                                    bx-home-alt
                                                                                    align-middle
                                                                                    text-primary
                                                                                    me-1
                                                                                "
                                                                            ></i>
                                                                            {{
                                                                                x.venue
                                                                            }}
                                                                        </a>
                                                                    </li>
                                                                    <li
                                                                        class="
                                                                            list-inline-item
                                                                            me-3
                                                                        "
                                                                    >
                                                                        <a
                                                                            href="javascript:void(0);"
                                                                            class="
                                                                                text-primary
                                                                            "
                                                                        >
                                                                            <i
                                                                                class="
                                                                                    bx
                                                                                    bx-user-voice
                                                                                    align-middle
                                                                                    text-primary
                                                                                    me-1
                                                                                "
                                                                            ></i>
                                                                            {{
                                                                                x.host
                                                                            }}
                                                                        </a>
                                                                    </li>
                                                                    <li
                                                                        class="
                                                                            list-inline-item
                                                                            me-3
                                                                        "
                                                                    >
                                                                        <a
                                                                            href="javascript:void(0);"
                                                                            class="
                                                                                text-primary
                                                                            "
                                                                        >
                                                                            <i
                                                                                class="
                                                                                    bx
                                                                                    bx-time
                                                                                    align-middle
                                                                                    text-primary
                                                                                    me-1
                                                                                "
                                                                            ></i>
                                                                            {{
                                                                                formatDate(
                                                                                    new Date(
                                                                                        x.dateFrom
                                                                                    )
                                                                                )
                                                                            }}
                                                                            ~
                                                                            {{
                                                                                formatDate(
                                                                                    new Date(
                                                                                        x.dateTo
                                                                                    )
                                                                                )
                                                                            }}
                                                                        </a>
                                                                    </li>
                                                                    <li
                                                                        class="
                                                                            list-inline-item
                                                                            me-3
                                                                        "
                                                                    >
                                                                        <a
                                                                            href="javascript:void(0);"
                                                                            class="
                                                                                text-primary
                                                                            "
                                                                        >
                                                                            <i
                                                                                class="
                                                                                    bx
                                                                                    bx-notepad
                                                                                    align-middle
                                                                                    text-primary
                                                                                    me-1
                                                                                "
                                                                            ></i>
                                                                            {{
                                                                                x.remarks
                                                                            }}
                                                                        </a>
                                                                    </li>
                                                                </ul>
                                                                <div
                                                                    role="tablist"
                                                                >
                                                                    <b-card
                                                                        no-body
                                                                        class="
                                                                            mb-1
                                                                        "
                                                                    >
                                                                        <b-card-header
                                                                            header-tag="header"
                                                                            role="tab"
                                                                            class="
                                                                                d-flex
                                                                                align-items-center
                                                                                justify-content-between
                                                                                px-2
                                                                                py-1
                                                                                bg-primary
                                                                                bg-gradient
                                                                            "
                                                                        >
                                                                            <div
                                                                                class="
                                                                                    d-flex
                                                                                    align-items-center
                                                                                "
                                                                            >
                                                                                <small
                                                                                    class="
                                                                                        m-0
                                                                                        me-2
                                                                                        text-white
                                                                                    "
                                                                                    ><i
                                                                                        class="
                                                                                            mdi
                                                                                            mdi-badge-account-horizontal
                                                                                        "
                                                                                    ></i>
                                                                                    Exam
                                                                                    Takers</small
                                                                                >
                                                                                <small
                                                                                    ><a
                                                                                        @click="
                                                                                            toggleAccordion(
                                                                                                5,
                                                                                                x
                                                                                            )
                                                                                        "
                                                                                        class="
                                                                                            text-white
                                                                                        "
                                                                                        href="javascript: void(0);"
                                                                                        >[{{
                                                                                            !x.toggleTaker
                                                                                                ? "Show"
                                                                                                : "Hide"
                                                                                        }}]</a
                                                                                    ></small
                                                                                >
                                                                            </div>
                                                                        </b-card-header>
                                                                        <b-collapse
                                                                            :accordion="
                                                                                'exam-taker-accordion' +
                                                                                index
                                                                            "
                                                                            role="tabpanel"
                                                                            :visible="
                                                                                x.toggleTaker
                                                                            "
                                                                        >
                                                                            <b-card-body
                                                                                class="
                                                                                    p-1
                                                                                "
                                                                            >
                                                                                <b-skeleton-wrapper
                                                                                    :loading="
                                                                                        x.loadingTakers
                                                                                    "
                                                                                >
                                                                                    <template
                                                                                        #loading
                                                                                    >
                                                                                        <div
                                                                                            class="
                                                                                                d-flex
                                                                                            "
                                                                                        >
                                                                                            <b-skeleton
                                                                                                width="20%"
                                                                                                height="12px"
                                                                                                class="
                                                                                                    me-2
                                                                                                    bg-primary
                                                                                                    bg-soft
                                                                                                    m-0
                                                                                                "
                                                                                            ></b-skeleton>
                                                                                            <b-skeleton
                                                                                                width="20%"
                                                                                                height="12px"
                                                                                                class="
                                                                                                    bg-primary
                                                                                                    bg-soft
                                                                                                    m-0
                                                                                                "
                                                                                            ></b-skeleton>
                                                                                        </div>
                                                                                    </template>
                                                                                </b-skeleton-wrapper>
                                                                                <b-row
                                                                                    v-for="y in x.takers"
                                                                                    :key="
                                                                                        y.id
                                                                                    "
                                                                                >
                                                                                    <b-col
                                                                                        sm="8"
                                                                                    >
                                                                                        <ul
                                                                                            class="
                                                                                                list-inline
                                                                                                mb-0
                                                                                            "
                                                                                        >
                                                                                            <li
                                                                                                class="
                                                                                                    list-inline-item
                                                                                                    me-2
                                                                                                "
                                                                                            >
                                                                                                <a
                                                                                                    href="javascript:void(0);"
                                                                                                    class="
                                                                                                        text-dark
                                                                                                    "
                                                                                                    title="Takers"
                                                                                                >
                                                                                                    <i
                                                                                                        class="
                                                                                                            bx
                                                                                                            bx-notepad
                                                                                                            align-middle
                                                                                                            text-dark
                                                                                                        "
                                                                                                    ></i>
                                                                                                    {{
                                                                                                        y.numberOfTakers
                                                                                                    }}
                                                                                                </a>
                                                                                            </li>
                                                                                            <li
                                                                                                class="
                                                                                                    list-inline-item
                                                                                                "
                                                                                            >
                                                                                                <a
                                                                                                    href="javascript:void(0);"
                                                                                                    class="
                                                                                                        text-dark
                                                                                                    "
                                                                                                    title="Passers"
                                                                                                >
                                                                                                    <i
                                                                                                        class="
                                                                                                            bx
                                                                                                            bx-notepad
                                                                                                            align-middle
                                                                                                            text-dark
                                                                                                        "
                                                                                                    ></i>
                                                                                                    {{
                                                                                                        y.numberOfPassers
                                                                                                    }}
                                                                                                </a>
                                                                                            </li>
                                                                                        </ul>
                                                                                    </b-col>
                                                                                    <b-col
                                                                                        class="
                                                                                            text-right
                                                                                        "
                                                                                    >
                                                                                        <ul
                                                                                            class="
                                                                                                list-inline
                                                                                                mb-0
                                                                                            "
                                                                                        >
                                                                                            <li
                                                                                                class="
                                                                                                    list-inline-item
                                                                                                "
                                                                                            >
                                                                                                <a
                                                                                                    href="javascript:void(0);"
                                                                                                    class="
                                                                                                        text-muted
                                                                                                    "
                                                                                                    title="Edit"
                                                                                                    @click="
                                                                                                        updateTaker(
                                                                                                            x,
                                                                                                            y
                                                                                                        )
                                                                                                    "
                                                                                                >
                                                                                                    <i
                                                                                                        class="
                                                                                                            bx
                                                                                                            bx-edit
                                                                                                            align-middle
                                                                                                            text-dark
                                                                                                        "
                                                                                                    ></i>
                                                                                                </a>
                                                                                            </li>
                                                                                            <li
                                                                                                class="
                                                                                                    list-inline-item
                                                                                                    text-muted
                                                                                                "
                                                                                            >
                                                                                                |
                                                                                            </li>
                                                                                            <li
                                                                                                class="
                                                                                                    list-inline-item
                                                                                                    me-1
                                                                                                "
                                                                                            >
                                                                                                <a
                                                                                                    href="javascript:void(0);"
                                                                                                    class="
                                                                                                        text-danger
                                                                                                    "
                                                                                                    title="Delete"
                                                                                                    @click="
                                                                                                        deleteTaker(
                                                                                                            x,
                                                                                                            y
                                                                                                        )
                                                                                                    "
                                                                                                >
                                                                                                    <i
                                                                                                        class="
                                                                                                            bx
                                                                                                            bx-trash
                                                                                                            align-middle
                                                                                                            text-danger
                                                                                                        "
                                                                                                    ></i>
                                                                                                </a>
                                                                                            </li>
                                                                                        </ul>
                                                                                    </b-col>
                                                                                </b-row>
                                                                                <div
                                                                                    class="
                                                                                        d-flex
                                                                                        justify-content-between
                                                                                    "
                                                                                    v-if="
                                                                                        !x.loadingTakers &&
                                                                                        x
                                                                                            .takers
                                                                                            .length ==
                                                                                            0
                                                                                    "
                                                                                >
                                                                                    <span
                                                                                        class="
                                                                                            px-2
                                                                                            text-muted
                                                                                            me-3
                                                                                        "
                                                                                        >No
                                                                                        Data
                                                                                        Found</span
                                                                                    >
                                                                                    <a
                                                                                        href="javascript:void(0)"
                                                                                        @click="
                                                                                            addTaker(
                                                                                                x
                                                                                            )
                                                                                        "
                                                                                        >[Add
                                                                                        New]</a
                                                                                    >
                                                                                </div>
                                                                            </b-card-body>
                                                                        </b-collapse>
                                                                    </b-card>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </b-col>
                                                </b-row>
                                                <b-row>
                                                    <b-col
                                                        sm="12"
                                                        v-if="
                                                            !examSchedLoading &&
                                                            filteredExamSched.length ==
                                                                0
                                                        "
                                                        class="text-center"
                                                    >
                                                        No data found
                                                    </b-col>
                                                    <b-col
                                                        sm="12"
                                                        v-if="
                                                            !examSchedLoading &&
                                                            filteredExamSched.length >
                                                                0
                                                        "
                                                    >
                                                        <ul
                                                            class="
                                                                pagination
                                                                justify-content-end
                                                            "
                                                        >
                                                            <b-pagination
                                                                size="sm"
                                                                v-model="
                                                                    currentPageEs
                                                                "
                                                                :total-rows="
                                                                    rowsEs
                                                                "
                                                                :per-page="
                                                                    perPageEs
                                                                "
                                                            ></b-pagination>
                                                        </ul>
                                                    </b-col>
                                                </b-row>
                                            </b-card-body>
                                        </b-collapse>
                                    </b-card>
                                    <b-card
                                        no-body
                                        class="mb-1"
                                        style="z-index: 10"
                                    >
                                        <b-card-header
                                            header-tag="header"
                                            role="tab"
                                            class="
                                                d-flex
                                                align-items-center
                                                justify-content-between
                                                bg-success bg-soft
                                            "
                                        >
                                            <div
                                                class="
                                                    d-flex
                                                    align-items-center
                                                "
                                            >
                                                <h6 class="m-0 me-2">
                                                    Graduate Students
                                                </h6>
                                                <a
                                                    @click="toggleAccordion(2)"
                                                    class="text-success"
                                                    href="javascript: void(0);"
                                                    >[{{
                                                        !toggleGradStud
                                                            ? "Show"
                                                            : "Hide"
                                                    }}]</a
                                                >
                                            </div>
                                        </b-card-header>
                                        <b-collapse
                                            accordion="grad-student-accordion"
                                            role="tabpanel"
                                            :visible="toggleGradStud"
                                        >
                                            <b-card-body class="py-2 px-0">
                                                <b-row>
                                                    <b-col sm="2">
                                                        <b-card
                                                            no-body
                                                            class="mb-1 border"
                                                        >
                                                            <b-card-header
                                                                header-tag="header"
                                                                role="tab"
                                                                class="
                                                                    d-flex
                                                                    align-items-center
                                                                    justify-content-between
                                                                    bg-success
                                                                    bg-soft
                                                                    p-2
                                                                "
                                                            >
                                                                <h6
                                                                    class="
                                                                        m-0
                                                                        me-2
                                                                    "
                                                                >
                                                                    Years
                                                                </h6>
                                                                <i
                                                                    class="
                                                                        cursor-pointer
                                                                        fs-5
                                                                        bx
                                                                        bx-plus
                                                                    "
                                                                    @click="
                                                                        addGradYear
                                                                    "
                                                                ></i>
                                                            </b-card-header>
                                                            <b-card-body
                                                                class="
                                                                    px-2
                                                                    py-1
                                                                "
                                                            >
                                                                <span
                                                                    v-if="
                                                                        !gradYearBusy &&
                                                                        gradYears.length ==
                                                                            0
                                                                    "
                                                                    >No data
                                                                    found</span
                                                                >
                                                                <b-skeleton-wrapper
                                                                    :loading="
                                                                        gradYearBusy
                                                                    "
                                                                >
                                                                    <template
                                                                        #loading
                                                                    >
                                                                        <ul
                                                                            class="
                                                                                list-unstyled
                                                                                fw-medium
                                                                            "
                                                                        >
                                                                            <li
                                                                                class="
                                                                                    mb-1
                                                                                    mt-1
                                                                                    ms-1
                                                                                "
                                                                                v-for="n in 3"
                                                                                :key="
                                                                                    n
                                                                                "
                                                                            >
                                                                                <b-skeleton
                                                                                    width="50%"
                                                                                ></b-skeleton>
                                                                            </li>
                                                                        </ul>
                                                                    </template>
                                                                </b-skeleton-wrapper>
                                                                <ul
                                                                    class="
                                                                        list-unstyled
                                                                        fw-medium
                                                                        mb-0
                                                                    "
                                                                    v-if="
                                                                        !gradYearBusy
                                                                    "
                                                                >
                                                                    <li
                                                                        v-for="x in gradYears"
                                                                        :key="
                                                                            x.id
                                                                        "
                                                                    >
                                                                        <a
                                                                            href="javascript:void(0);"
                                                                            class="
                                                                                py-1
                                                                                d-block
                                                                            "
                                                                            :class="{
                                                                                'text-primary':
                                                                                    filterByYear ==
                                                                                    x.id,
                                                                                'text-muted':
                                                                                    filterByYear !=
                                                                                    x.id,
                                                                            }"
                                                                            @click="
                                                                                getByStudYear(
                                                                                    x
                                                                                )
                                                                            "
                                                                            ><i
                                                                                class="
                                                                                    mdi
                                                                                    mdi-chevron-right
                                                                                    me-1
                                                                                "
                                                                            ></i>
                                                                            {{
                                                                                x.yearGraduated
                                                                            }}</a
                                                                        >
                                                                    </li>
                                                                </ul>
                                                            </b-card-body>
                                                        </b-card>
                                                    </b-col>
                                                    <b-col>
                                                        <b-card
                                                            no-body
                                                            class="mb-1 border"
                                                        >
                                                            <b-card-header
                                                                header-tag="header"
                                                                role="tab"
                                                                class="
                                                                    d-flex
                                                                    align-items-center
                                                                    justify-content-between
                                                                    bg-success
                                                                    bg-soft
                                                                    p-2
                                                                "
                                                            >
                                                                <div
                                                                    class="
                                                                        d-flex
                                                                        align-items-center
                                                                    "
                                                                >
                                                                    <h6
                                                                        class="
                                                                            m-0
                                                                            me-2
                                                                        "
                                                                    >
                                                                        List of
                                                                        Graduate
                                                                        Students
                                                                        <span
                                                                            :class="{
                                                                                'text-danger':
                                                                                    this
                                                                                        .errorMessage,
                                                                            }"
                                                                            >{{
                                                                                this
                                                                                    .filterByYear
                                                                                    ? `[${this.yearSelected}]`
                                                                                    : "[Please Select Year]"
                                                                            }}</span
                                                                        >
                                                                    </h6>
                                                                </div>
                                                            </b-card-header>
                                                            <b-card-body
                                                                class="
                                                                    px-2
                                                                    py-2
                                                                "
                                                            >
                                                                <b-row>
                                                                    <b-col
                                                                        sm="12"
                                                                    >
                                                                        <div
                                                                            class="
                                                                                d-flex
                                                                                align-items-center
                                                                                justify-content-between
                                                                            "
                                                                        >
                                                                            <div
                                                                                class="
                                                                                    search-box
                                                                                "
                                                                            >
                                                                                <div
                                                                                    class="
                                                                                        position-relative
                                                                                        me-2
                                                                                    "
                                                                                >
                                                                                    <input
                                                                                        autocomplete="off"
                                                                                        type="text"
                                                                                        class="
                                                                                            form-control
                                                                                            rounded
                                                                                            border-light
                                                                                        "
                                                                                        placeholder="Search Grad Student..."
                                                                                        v-model="
                                                                                            filterGs
                                                                                        "
                                                                                    />
                                                                                    <i
                                                                                        class="
                                                                                            mdi
                                                                                            mdi-magnify
                                                                                            search-icon
                                                                                        "
                                                                                    ></i>
                                                                                </div>
                                                                            </div>
                                                                            <div>
                                                                                <button
                                                                                    type="button"
                                                                                    class="
                                                                                        btn
                                                                                        btn-sm
                                                                                        btn-primary
                                                                                        me-1
                                                                                    "
                                                                                    @click="
                                                                                        addGraduateStud
                                                                                    "
                                                                                    title="Add Grad Student"
                                                                                >
                                                                                    <i
                                                                                        class="
                                                                                            bx
                                                                                            bx-plus
                                                                                        "
                                                                                    ></i>
                                                                                </button>
                                                                                <button
                                                                                    type="button"
                                                                                    class="
                                                                                        btn
                                                                                        btn-sm
                                                                                        btn-success
                                                                                        me-1
                                                                                    "
                                                                                    title="Upload Grad Students"
                                                                                    @click="
                                                                                        uploadGraduateStud
                                                                                    "
                                                                                >
                                                                                    <i
                                                                                        class="
                                                                                            bx
                                                                                            bx-upload
                                                                                        "
                                                                                    ></i>
                                                                                </button>
                                                                                <button
                                                                                    type="button"
                                                                                    class="
                                                                                        btn
                                                                                        btn-sm
                                                                                        btn-info
                                                                                    "
                                                                                    title="Download Excel Graduate Student Template"
                                                                                    @click="
                                                                                        downloadExcelTemplate(
                                                                                            'graduate'
                                                                                        )
                                                                                    "
                                                                                >
                                                                                    <i
                                                                                        class="
                                                                                            bx
                                                                                            bx-download
                                                                                        "
                                                                                    ></i>
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </b-col>
                                                                    <b-col
                                                                        sm="12"
                                                                        class="
                                                                            px-3
                                                                            pt-2
                                                                        "
                                                                        v-if="
                                                                            !studentsBusy &&
                                                                            filteredStudent.length ==
                                                                                0
                                                                        "
                                                                    >
                                                                        <span
                                                                            class="
                                                                                text-muted
                                                                            "
                                                                            >No
                                                                            data
                                                                            found</span
                                                                        >
                                                                    </b-col>
                                                                </b-row>
                                                                <b-row
                                                                    class="mt-3"
                                                                    v-if="
                                                                        studentsBusy
                                                                    "
                                                                >
                                                                    <b-col
                                                                        sm="3"
                                                                        v-for="n in 4"
                                                                        :key="n"
                                                                    >
                                                                        <b-skeleton-wrapper
                                                                            :loading="
                                                                                studentsBusy
                                                                            "
                                                                        >
                                                                            <template
                                                                                #loading
                                                                            >
                                                                                <b-card
                                                                                    no-body
                                                                                    class="
                                                                                        bg-success
                                                                                        bg-soft
                                                                                    "
                                                                                >
                                                                                    <b-card-body
                                                                                        class="
                                                                                            p-2
                                                                                        "
                                                                                    >
                                                                                        <b-skeleton
                                                                                            width="90%"
                                                                                        ></b-skeleton>
                                                                                    </b-card-body>
                                                                                </b-card>
                                                                            </template>
                                                                        </b-skeleton-wrapper>
                                                                    </b-col>
                                                                </b-row>
                                                                <b-row
                                                                    class="mt-3"
                                                                    ><b-col
                                                                        sm="3"
                                                                        v-for="(
                                                                            x,
                                                                            index
                                                                        ) in filteredStudent"
                                                                        :key="
                                                                            x.id
                                                                        "
                                                                        :style="{
                                                                            'z-index':
                                                                                filteredStudent.length -
                                                                                index,
                                                                        }"
                                                                    >
                                                                        <b-card
                                                                            no-body
                                                                            class="
                                                                                bg-success
                                                                                bg-soft
                                                                                mb-2
                                                                            "
                                                                        >
                                                                            <b-card-body
                                                                                class="
                                                                                    p-2
                                                                                "
                                                                            >
                                                                                <div
                                                                                    class="
                                                                                        d-flex
                                                                                        justify-content-between
                                                                                    "
                                                                                >
                                                                                    <span
                                                                                        class="
                                                                                            text-muted
                                                                                            cursor-pointer
                                                                                        "
                                                                                        :class="{
                                                                                            'text-ellipsis':
                                                                                                !x.showFull,
                                                                                        }"
                                                                                        @click="
                                                                                            x.showFull =
                                                                                                !x.showFull
                                                                                        "
                                                                                    >
                                                                                        {{
                                                                                            x.searchItem
                                                                                        }}
                                                                                    </span>
                                                                                    <b-dropdown
                                                                                        id="dropdown-dropleft"
                                                                                        right
                                                                                        variant="link"
                                                                                        toggle-class="text-decoration-none p-0"
                                                                                        menu-class="dropdown-menu-end"
                                                                                        no-caret
                                                                                        style="
                                                                                            width: 10px;
                                                                                        "
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
                                                                                                viewER(
                                                                                                    x
                                                                                                )
                                                                                            "
                                                                                            variant="dark"
                                                                                            ><i
                                                                                                class="
                                                                                                    mdi
                                                                                                    mdi-view-list
                                                                                                    font-size-18
                                                                                                    me-1
                                                                                                "
                                                                                            ></i
                                                                                            >View
                                                                                            Employment
                                                                                            Records</b-dropdown-item
                                                                                        >
                                                                                        <b-dropdown-item
                                                                                            @click="
                                                                                                updateStudent(
                                                                                                    x
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
                                                                                                deleteStudent(
                                                                                                    x
                                                                                                )
                                                                                            "
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
                                                                            </b-card-body>
                                                                        </b-card>
                                                                    </b-col></b-row
                                                                >
                                                            </b-card-body>
                                                        </b-card>
                                                    </b-col>
                                                </b-row>
                                            </b-card-body>
                                        </b-collapse>
                                    </b-card>
                                    <b-card no-body class="mb-1">
                                        <b-card-header
                                            header-tag="header"
                                            role="tab"
                                            class="
                                                d-flex
                                                align-items-center
                                                justify-content-between
                                                bg-warning bg-soft
                                            "
                                        >
                                            <div
                                                class="
                                                    d-flex
                                                    align-items-center
                                                "
                                            >
                                                <h6 class="m-0 me-2">
                                                    Accreditations
                                                </h6>
                                                <a
                                                    @click="toggleAccordion(3)"
                                                    class="text-warning"
                                                    href="javascript: void(0);"
                                                    >[{{
                                                        !toggleAccred
                                                            ? "Show"
                                                            : "Hide"
                                                    }}]</a
                                                >
                                            </div>
                                            <div
                                                class="d-flex search-box"
                                                v-if="toggleAccred"
                                            >
                                                <div
                                                    class="
                                                        position-relative
                                                        me-2
                                                    "
                                                >
                                                    <input
                                                        autocomplete="off"
                                                        type="text"
                                                        class="
                                                            form-control
                                                            rounded
                                                            border border-light
                                                            form-control-sm
                                                        "
                                                        placeholder="Search Accreditations..."
                                                        v-model="filterAccred"
                                                    />
                                                    <i
                                                        class="
                                                            mdi mdi-magnify
                                                            search-icon-sm
                                                            fs-6
                                                        "
                                                    ></i>
                                                </div>
                                                <button
                                                    type="button"
                                                    class="
                                                        btn btn-sm btn-warning
                                                    "
                                                    @click="addAccred"
                                                >
                                                    <i class="bx bx-plus"></i>
                                                </button>
                                            </div>
                                        </b-card-header>
                                        <b-collapse
                                            accordion="accreditation-accordion"
                                            role="tabpanel"
                                            :visible="toggleAccred"
                                        >
                                            <b-card-body class="py-2 px-0">
                                                <b-row v-if="accredLoading">
                                                    <div
                                                        class="col-md-4"
                                                        v-for="n in 3"
                                                        :key="n"
                                                    >
                                                        <b-skeleton-wrapper
                                                            loading
                                                        >
                                                            <template #loading>
                                                                <b-card
                                                                    class="
                                                                        bg-warning
                                                                        bg-soft
                                                                    "
                                                                >
                                                                    <div
                                                                        class="
                                                                            mb-2
                                                                            mt-2
                                                                        "
                                                                    >
                                                                        <b-skeleton
                                                                            width="100%"
                                                                            height="18px"
                                                                        ></b-skeleton>
                                                                    </div>
                                                                    <b-skeleton
                                                                        width="50%"
                                                                        height="12px"
                                                                    ></b-skeleton>
                                                                    <b-skeleton
                                                                        width="50%"
                                                                        height="12px"
                                                                    ></b-skeleton>
                                                                    <b-skeleton
                                                                        width="50%"
                                                                        height="12px"
                                                                    ></b-skeleton>
                                                                    <b-skeleton
                                                                        width="50%"
                                                                        height="12px"
                                                                    ></b-skeleton>
                                                                </b-card>
                                                            </template>
                                                        </b-skeleton-wrapper>
                                                    </div>
                                                </b-row>
                                                <b-row
                                                    v-if="
                                                        filteredAccreds.length >
                                                        0
                                                    "
                                                >
                                                    <b-col
                                                        sm="4"
                                                        v-for="x in filteredAccreds"
                                                        :key="x.id"
                                                    >
                                                        <div
                                                            class="
                                                                card
                                                                text-warning
                                                                bg-warning
                                                                bg-soft
                                                                position-relative
                                                            "
                                                        >
                                                            <div
                                                                class="
                                                                    hide-detail-btn-xs
                                                                "
                                                            >
                                                                <b-dropdown
                                                                    id="dropdown-dropleft"
                                                                    right
                                                                    variant="link"
                                                                    toggle-class="text-decoration-none px-1 py-0 text-warning"
                                                                    menu-class="dropdown-menu-end"
                                                                    no-caret
                                                                >
                                                                    <template
                                                                        #button-content
                                                                    >
                                                                        <i
                                                                            class="
                                                                                fas
                                                                                fa-ellipsis-h
                                                                                p-0
                                                                            "
                                                                        ></i>
                                                                    </template>
                                                                    <b-dropdown-item
                                                                        @click="
                                                                            updateItemAccred(
                                                                                x
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
                                                                            deleteItemAccred(
                                                                                x
                                                                            )
                                                                        "
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
                                                            <div
                                                                class="
                                                                    card-body
                                                                "
                                                            >
                                                                <h4
                                                                    class="
                                                                        card-title
                                                                        mb-0
                                                                    "
                                                                >
                                                                    {{
                                                                        x
                                                                            .accreditor
                                                                            .accreditorName
                                                                    }}
                                                                </h4>
                                                                <span
                                                                    class="
                                                                        badge
                                                                        bg-primary
                                                                    "
                                                                    title="Level"
                                                                    >{{
                                                                        x
                                                                            .surveyLevel
                                                                            .level
                                                                    }}</span
                                                                >
                                                                <span
                                                                    class="
                                                                        badge
                                                                        bg-danger
                                                                        ms-1
                                                                    "
                                                                    v-if="
                                                                        x.isCurrent
                                                                    "
                                                                    >Current</span
                                                                >
                                                                <span
                                                                    class="
                                                                        badge
                                                                        bg-success
                                                                        ms-1
                                                                    "
                                                                    title="Status"
                                                                    >{{
                                                                        x.status
                                                                    }}</span
                                                                >
                                                                <ul
                                                                    class="
                                                                        list-group
                                                                        list-inline
                                                                        mt-1
                                                                    "
                                                                >
                                                                    <li
                                                                        class="
                                                                            list-inline-item
                                                                            me-3
                                                                        "
                                                                        v-if="
                                                                            x
                                                                                .surveyLevel
                                                                                .level !==
                                                                            'NA'
                                                                        "
                                                                    >
                                                                        <a
                                                                            href="javascript:void(0);"
                                                                            class="
                                                                                text-warning
                                                                            "
                                                                        >
                                                                            <i
                                                                                class="
                                                                                    bx
                                                                                    bx-time
                                                                                    align-middle
                                                                                    text-warning
                                                                                    me-1
                                                                                "
                                                                            ></i>
                                                                            Started
                                                                            on
                                                                            <b
                                                                                >{{
                                                                                    formatDate(
                                                                                        new Date(
                                                                                            x.dateFrom
                                                                                        )
                                                                                    )
                                                                                }}</b
                                                                            >
                                                                        </a>
                                                                    </li>
                                                                    <li
                                                                        class="
                                                                            list-inline-item
                                                                            me-3
                                                                        "
                                                                        v-if="
                                                                            x
                                                                                .surveyLevel
                                                                                .level !==
                                                                            'NA'
                                                                        "
                                                                    >
                                                                        <a
                                                                            href="javascript:void(0);"
                                                                            class="
                                                                                text-warning
                                                                            "
                                                                        >
                                                                            <i
                                                                                class="
                                                                                    mdi
                                                                                    mdi-book-clock-outline
                                                                                    align-middle
                                                                                    text-warning
                                                                                    me-1
                                                                                "
                                                                            ></i>
                                                                            Surveyed
                                                                            on
                                                                            <b
                                                                                >{{
                                                                                    formatDate(
                                                                                        new Date(
                                                                                            x.dateSurveyed
                                                                                        )
                                                                                    )
                                                                                }}</b
                                                                            >
                                                                        </a>
                                                                    </li>
                                                                    <li
                                                                        class="
                                                                            list-inline-item
                                                                            me-3
                                                                        "
                                                                        v-if="
                                                                            x
                                                                                .surveyLevel
                                                                                .level !==
                                                                            'NA'
                                                                        "
                                                                    >
                                                                        <a
                                                                            href="javascript:void(0);"
                                                                            class="
                                                                                text-warning
                                                                            "
                                                                        >
                                                                            <i
                                                                                class="
                                                                                    mdi
                                                                                    mdi-briefcase-clock-outline
                                                                                    align-middle
                                                                                    text-warning
                                                                                    me-1
                                                                                "
                                                                            ></i>
                                                                            Granted
                                                                            on
                                                                            <b
                                                                                >{{
                                                                                    formatDate(
                                                                                        new Date(
                                                                                            x.dateGranted
                                                                                        )
                                                                                    )
                                                                                }}</b
                                                                            >
                                                                        </a>
                                                                    </li>
                                                                    <li
                                                                        class="
                                                                            list-inline-item
                                                                            me-3
                                                                        "
                                                                        v-if="
                                                                            x
                                                                                .surveyLevel
                                                                                .level !==
                                                                            'NA'
                                                                        "
                                                                    >
                                                                        <a
                                                                            href="javascript:void(0);"
                                                                            class="
                                                                                text-warning
                                                                            "
                                                                        >
                                                                            <i
                                                                                class="
                                                                                    mdi
                                                                                    mdi-calendar-clock
                                                                                    align-middle
                                                                                    text-warning
                                                                                    me-1
                                                                                "
                                                                            ></i>
                                                                            Expired
                                                                            on
                                                                            <b
                                                                                >{{
                                                                                    formatDate(
                                                                                        new Date(
                                                                                            x.expiry
                                                                                        )
                                                                                    )
                                                                                }}</b
                                                                            >
                                                                        </a>
                                                                    </li>
                                                                    <li
                                                                        class="
                                                                            list-inline-item
                                                                            me-3
                                                                        "
                                                                    >
                                                                        <a
                                                                            href="javascript:void(0);"
                                                                            class="
                                                                                text-warning
                                                                            "
                                                                        >
                                                                            <i
                                                                                class="
                                                                                    mdi
                                                                                    mdi-briefcase-edit-outline
                                                                                    align-middle
                                                                                    text-warning
                                                                                    me-1
                                                                                "
                                                                            ></i>
                                                                            Score:
                                                                            <b
                                                                                >{{
                                                                                    x.score
                                                                                }}</b
                                                                            >
                                                                        </a>
                                                                    </li>
                                                                    <li
                                                                        class="
                                                                            list-inline-item
                                                                            me-3
                                                                        "
                                                                    >
                                                                        <a
                                                                            href="javascript:void(0);"
                                                                            class="
                                                                                text-warning
                                                                            "
                                                                        >
                                                                            <i
                                                                                class="
                                                                                    mdi
                                                                                    mdi-note-multiple-outline
                                                                                    align-middle
                                                                                    text-warning
                                                                                    me-1
                                                                                "
                                                                            ></i>
                                                                            {{
                                                                                x.remarks
                                                                            }}
                                                                        </a>
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </b-col>
                                                </b-row>
                                                <b-row>
                                                    <b-col
                                                        sm="12"
                                                        v-if="
                                                            !accredLoading &&
                                                            filteredAccreds.length ==
                                                                0
                                                        "
                                                        class="text-center"
                                                    >
                                                        No data found
                                                    </b-col>
                                                    <b-col
                                                        sm="12"
                                                        v-if="
                                                            !accredLoading &&
                                                            filteredAccreds.length >
                                                                0
                                                        "
                                                    >
                                                        <ul
                                                            class="
                                                                pagination
                                                                justify-content-end
                                                            "
                                                        >
                                                            <b-pagination
                                                                size="sm"
                                                                v-model="
                                                                    currentPageAccred
                                                                "
                                                                :total-rows="
                                                                    rowsAccred
                                                                "
                                                                :per-page="
                                                                    perPageAccred
                                                                "
                                                            ></b-pagination>
                                                        </ul>
                                                    </b-col>
                                                </b-row>
                                            </b-card-body>
                                        </b-collapse>
                                    </b-card>
                                    <b-card no-body class="mb-1">
                                        <b-card-header
                                            header-tag="header"
                                            role="tab"
                                            class="
                                                d-flex
                                                align-items-center
                                                justify-content-between
                                                bg-info bg-soft
                                            "
                                        >
                                            <div
                                                class="
                                                    d-flex
                                                    align-items-center
                                                "
                                            >
                                                <h6 class="m-0 me-2">
                                                    Extensions
                                                </h6>
                                                <a
                                                    @click="toggleAccordion(4)"
                                                    class="text-info"
                                                    href="javascript: void(0);"
                                                    >[{{
                                                        !toggleExt
                                                            ? "Show"
                                                            : "Hide"
                                                    }}]</a
                                                >
                                            </div>
                                            <div
                                                class="d-flex search-box"
                                                v-if="toggleExt"
                                            >
                                                <div
                                                    class="
                                                        position-relative
                                                        me-2
                                                    "
                                                >
                                                    <input
                                                        autocomplete="off"
                                                        type="text"
                                                        class="
                                                            form-control
                                                            rounded
                                                            border border-light
                                                            form-control-sm
                                                        "
                                                        placeholder="Search Extensions..."
                                                        v-model="filterExt"
                                                    />
                                                    <i
                                                        class="
                                                            mdi mdi-magnify
                                                            search-icon-sm
                                                            fs-6
                                                        "
                                                    ></i>
                                                </div>
                                                <button
                                                    type="button"
                                                    class="btn btn-sm btn-info"
                                                    @click="addEP"
                                                >
                                                    <i class="bx bx-plus"></i>
                                                </button>
                                            </div>
                                        </b-card-header>
                                        <b-collapse
                                            accordion="extension-accordion"
                                            role="tabpanel"
                                            :visible="toggleExt"
                                        >
                                            <b-card-body class="py-2 px-0">
                                                <b-row v-if="extensionLoading">
                                                    <div
                                                        class="col-4"
                                                        v-for="n in 3"
                                                        :key="n"
                                                    >
                                                        <b-skeleton-wrapper
                                                            loading
                                                        >
                                                            <template #loading>
                                                                <b-card
                                                                    class="
                                                                        bg-info
                                                                        bg-soft
                                                                    "
                                                                >
                                                                    <div
                                                                        class="
                                                                            mb-2
                                                                            mt-2
                                                                        "
                                                                    >
                                                                        <b-skeleton
                                                                            width="100%"
                                                                            height="18px"
                                                                        ></b-skeleton>
                                                                    </div>
                                                                    <b-skeleton
                                                                        width="50%"
                                                                        height="12px"
                                                                    ></b-skeleton>
                                                                </b-card>
                                                            </template>
                                                        </b-skeleton-wrapper>
                                                    </div>
                                                </b-row>
                                                <b-row
                                                    v-if="
                                                        filteredExtensions.length >
                                                        0
                                                    "
                                                >
                                                    <b-col
                                                        sm="4"
                                                        v-for="x in filteredExtensions"
                                                        :key="x.id"
                                                    >
                                                        <div
                                                            class="
                                                                card
                                                                bg-info bg-soft
                                                                position-relative
                                                            "
                                                            style="z-index: 10"
                                                        >
                                                            <div
                                                                class="
                                                                    hide-detail-btn-xs
                                                                "
                                                            >
                                                                <b-dropdown
                                                                    id="dropdown-dropleft"
                                                                    right
                                                                    variant="link"
                                                                    toggle-class="text-decoration-none px-1 py-0 text-info"
                                                                    menu-class="dropdown-menu-end"
                                                                    no-caret
                                                                >
                                                                    <template
                                                                        #button-content
                                                                    >
                                                                        <i
                                                                            class="
                                                                                fas
                                                                                fa-ellipsis-h
                                                                                p-0
                                                                            "
                                                                        ></i>
                                                                    </template>
                                                                    <b-dropdown-item
                                                                        @click="
                                                                            viewExtAct(
                                                                                x
                                                                            )
                                                                        "
                                                                        variant="dark"
                                                                        ><i
                                                                            class="
                                                                                bx
                                                                                bx-link-external
                                                                                font-size-18
                                                                                me-1
                                                                            "
                                                                        ></i
                                                                        >View
                                                                        Extension
                                                                        Activities</b-dropdown-item
                                                                    >
                                                                    <b-dropdown-item
                                                                        @click="
                                                                            updateItemExt(
                                                                                x
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
                                                                            deleteItemExt(
                                                                                x
                                                                            )
                                                                        "
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
                                                            <div
                                                                class="
                                                                    card-body
                                                                "
                                                            >
                                                                <h4
                                                                    class="
                                                                        card-title
                                                                    "
                                                                >
                                                                    {{
                                                                        x.extensionName
                                                                    }}
                                                                </h4>
                                                                <ul
                                                                    class="
                                                                        list-group
                                                                        list-inline
                                                                    "
                                                                >
                                                                    <li
                                                                        class="
                                                                            list-inline-item
                                                                            me-3
                                                                        "
                                                                    >
                                                                        <a
                                                                            href="javascript:void(0);"
                                                                            class="
                                                                                text-info
                                                                            "
                                                                        >
                                                                            <i
                                                                                class="
                                                                                    bx
                                                                                    bx-time
                                                                                    align-middle
                                                                                    text-info
                                                                                    me-1
                                                                                "
                                                                            ></i>
                                                                            {{
                                                                                formatDate(
                                                                                    new Date(
                                                                                        x.dateFrom
                                                                                    )
                                                                                )
                                                                            }}
                                                                            ~
                                                                            {{
                                                                                formatDate(
                                                                                    new Date(
                                                                                        x.dateTo
                                                                                    )
                                                                                )
                                                                            }}
                                                                        </a>
                                                                    </li>
                                                                </ul>
                                                                <div class="mt-2">
                                                                    <div class="d-flex align-items-center justify-content-between">
                                                                        <a href="javascript:void(0);" class="d-flex align-items-center text-dark" @click="getExtentionDocuments(x)">
                                                                            <i class="bx bx bx-paperclip rotate me-1" :class="{'rotate-90': !x.openAttachment}"></i>
                                                                            <span class="hover-underline">Attachments</span>
                                                                            <i class="bx bx-play me-1 font-size-15 rotate" :class="{'rotate-90': x.openAttachment}"></i>
                                                                        </a>
                                                                        <div class="d-flex align-items-center cursor-pointer" :id="`upload-ext-document${x.id}`" @click="x.addDocu = !x.addDocu">
                                                                            <i class="bx bx-upload me-1"></i>
                                                                            <span>Upload</span>
                                                                        </div>
                                                                        <upload-popover
                                                                            :option="
                                                                                uploadExtOptions
                                                                            "
                                                                            :sourceId="
                                                                                x.id
                                                                            "
                                                                            @uploaded="
                                                                                uploadedExtention(
                                                                                    $event,
                                                                                    x.id
                                                                                )
                                                                            "
                                                                            :showPV="
                                                                                x.addDocu
                                                                            "
                                                                            @closePopover="
                                                                                x.addDocu = false
                                                                            "
                                                                            :dzId="`dropzone-ext-document${x.id}`"
                                                                            :pvId="`upload-ext-document${x.id}`"
                                                                        ></upload-popover>
                                                                    </div>
                                                                    <b-collapse
                                                                        :accordion="`extension-attachment-accordion${x.id}`"
                                                                        role="tabpanel"
                                                                        :visible="x.openAttachment"
                                                                    >
                                                                        <hr class="my-1">
                                                                        <div class="text-center" v-if="x.documentData.length == 0">No data found</div>
                                                                        <template v-for="y in x.documentData">
                                                                            <div :key="`${x.id}${y.id}`" class="w-100 d-flex align-items-center">
                                                                                <a href="javascript:void(0);" class="w-100 d-flex align-items-center text-white" @click="openDocument(y)">
                                                                                    <i
                                                                                            v-if="y.fileType.includes('image')"
                                                                                            class="
                                                                                                mdi mdi-image font-size-15 me-1
                                                                                                text-purple
                                                                                            "
                                                                                        ></i>
                                                                                        <i
                                                                                            v-if="y.fileType.includes('application')"
                                                                                            class="
                                                                                                mdi mdi-file-pdf-outline font-size-15 me-1
                                                                                                text-danger
                                                                                            "
                                                                                        ></i>
                                                                                    {{y.description}}
                                                                                </a>
                                                                                <div style="width:20px" @click="removeExtFile(y.id, x.id)" class="cursor-pointer"><i class="bx bx-trash text-danger font-bolder"></i></div>
                                                                            </div>
                                                                            <hr class="my-1" :key="`hr${x.id}${y.id}`">
                                                                        </template>
                                                                    </b-collapse>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </b-col>
                                                </b-row>
                                                <b-row>
                                                    <b-col
                                                        sm="12"
                                                        v-if="
                                                            !extensionLoading &&
                                                            filteredExtensions.length ==
                                                                0
                                                        "
                                                        class="text-center"
                                                    >
                                                        No data found
                                                    </b-col>
                                                    <b-col
                                                        sm="12"
                                                        v-if="
                                                            !extensionLoading &&
                                                            filteredExtensions.length >
                                                                0
                                                        "
                                                    >
                                                        <ul
                                                            class="
                                                                pagination
                                                                justify-content-end
                                                                px-2
                                                            "
                                                            style="z-index: -1"
                                                        >
                                                            <b-pagination
                                                                size="sm"
                                                                v-model="
                                                                    currentPageExt
                                                                "
                                                                :total-rows="
                                                                    rowsExt
                                                                "
                                                                :per-page="
                                                                    perPageExt
                                                                "
                                                            ></b-pagination>
                                                        </ul>
                                                    </b-col>
                                                </b-row>
                                            </b-card-body>
                                        </b-collapse>
                                    </b-card>
                                    <b-card no-body class="mb-1">
                                        <b-card-header
                                            header-tag="header"
                                            role="tab"
                                            class="
                                                d-flex
                                                align-items-center
                                                justify-content-between
                                                bg-purple bg-soft
                                            "
                                        >
                                            <div
                                                class="
                                                    d-flex
                                                    align-items-center
                                                "
                                            >
                                                <h6 class="m-0 me-2">
                                                    Enrollment
                                                </h6>
                                                <a
                                                    @click="toggleAccordion(6)"
                                                    class="text-white"
                                                    href="javascript: void(0);"
                                                    >[{{
                                                        !toggleEnrolee
                                                            ? "Show"
                                                            : "Hide"
                                                    }}]</a
                                                >
                                            </div>
                                            <div
                                                class="d-flex search-box"
                                                v-if="toggleEnrolee"
                                            >
                                                <div
                                                    class="
                                                        position-relative
                                                        me-2
                                                    "
                                                >
                                                    <input
                                                        autocomplete="off"
                                                        type="text"
                                                        class="
                                                            form-control
                                                            rounded
                                                            border border-light
                                                            form-control-sm
                                                        "
                                                        placeholder="Search Enrollment..."
                                                        v-model="filterEnrolee"
                                                    />
                                                    <i
                                                        class="
                                                            mdi mdi-magnify
                                                            search-icon-sm
                                                            fs-6
                                                        "
                                                    ></i>
                                                </div>
                                                <button
                                                    type="button"
                                                    class="
                                                        btn btn-sm btn-primary
                                                        me-1
                                                    "
                                                    title="Add Enrollment"
                                                    @click="addEnrollment"
                                                >
                                                    <i class="bx bx-plus"></i>
                                                </button>
                                                <button
                                                    type="button"
                                                    class="
                                                        btn btn-sm btn-success
                                                        me-1
                                                    "
                                                    title="Upload Enrollment"
                                                    @click="uploadEnrollment"
                                                >
                                                    <i class="bx bx-upload"></i>
                                                </button>
                                                <button
                                                    type="button"
                                                    class="btn btn-sm btn-info"
                                                    title="Download Excel Enrollment Template"
                                                    @click="
                                                        downloadExcelTemplate(
                                                            'enrollment'
                                                        )
                                                    "
                                                >
                                                    <i
                                                        class="bx bx-download"
                                                    ></i>
                                                </button>
                                            </div>
                                        </b-card-header>
                                        <b-collapse
                                            accordion="enrolee-accordion"
                                            role="tabpanel"
                                            :visible="toggleEnrolee"
                                        >
                                            <b-card-body class="py-2 px-0">
                                                <b-row v-if="enrollmentLoading">
                                                    <div
                                                        class="col-4"
                                                        v-for="n in 3"
                                                        :key="n"
                                                    >
                                                        <b-skeleton-wrapper
                                                            loading
                                                        >
                                                            <template #loading>
                                                                <b-card
                                                                    class="
                                                                        bg-info
                                                                        bg-soft
                                                                    "
                                                                >
                                                                    <div
                                                                        class="
                                                                            mb-2
                                                                            mt-2
                                                                        "
                                                                    >
                                                                        <b-skeleton
                                                                            width="100%"
                                                                            height="18px"
                                                                        ></b-skeleton>
                                                                    </div>
                                                                    <b-skeleton
                                                                        width="50%"
                                                                        height="12px"
                                                                    ></b-skeleton>
                                                                </b-card>
                                                            </template>
                                                        </b-skeleton-wrapper>
                                                    </div>
                                                </b-row>
                                                <b-row
                                                    v-if="
                                                        filteredEnrollments.length >
                                                        0
                                                    "
                                                >
                                                    <b-col
                                                        sm="4"
                                                        v-for="x in filteredEnrollments"
                                                        :key="x.id"
                                                    >
                                                        <div
                                                            class="
                                                                card
                                                                text-info
                                                                bg-purple
                                                                bg-soft
                                                                position-relative
                                                            "
                                                            style="z-index: 10"
                                                        >
                                                            <div
                                                                class="
                                                                    hide-detail-btn-xs
                                                                "
                                                            >
                                                                <b-dropdown
                                                                    id="dropdown-dropleft"
                                                                    right
                                                                    variant="link"
                                                                    toggle-class="text-decoration-none px-1 py-0 text-info"
                                                                    menu-class="dropdown-menu-end"
                                                                    no-caret
                                                                >
                                                                    <template
                                                                        #button-content
                                                                    >
                                                                        <i
                                                                            class="
                                                                                fas
                                                                                fa-ellipsis-h
                                                                                p-0
                                                                            "
                                                                        ></i>
                                                                    </template>
                                                                    <b-dropdown-item
                                                                        @click="
                                                                            updateEnrollment(
                                                                                x
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
                                                                            deleteEnrollment(
                                                                                x
                                                                            )
                                                                        "
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
                                                            <div
                                                                class="
                                                                    card-body
                                                                "
                                                            >
                                                                <h4
                                                                    class="
                                                                        card-title
                                                                        mb-0
                                                                    "
                                                                >
                                                                    SY:
                                                                    {{
                                                                        x.schoolYear
                                                                    }}
                                                                </h4>
                                                                <ul
                                                                    class="
                                                                        list-group
                                                                        list-inline
                                                                    "
                                                                >
                                                                    <li
                                                                        class="
                                                                            list-inline-item
                                                                            me-3
                                                                        "
                                                                    >
                                                                        <a
                                                                            href="javascript:void(0);"
                                                                            class="
                                                                                text-info
                                                                            "
                                                                        >
                                                                            {{
                                                                                x.semester
                                                                            }}
                                                                        </a>
                                                                    </li>
                                                                    <li
                                                                        class="
                                                                            list-inline-item
                                                                            me-3
                                                                        "
                                                                    >
                                                                        <a
                                                                            href="javascript:void(0);"
                                                                            class="
                                                                                text-info
                                                                            "
                                                                            ><i
                                                                                class="
                                                                                    bx
                                                                                    bxs-user-badge
                                                                                    align-middle
                                                                                    text-info
                                                                                    me-1
                                                                                "
                                                                            ></i>
                                                                            {{
                                                                                x.numberOfEnrollees
                                                                            }}
                                                                        </a>
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </b-col>
                                                </b-row>
                                                <b-row>
                                                    <b-col
                                                        sm="12"
                                                        v-if="
                                                            !enrollmentLoading &&
                                                            filteredEnrollments.length ==
                                                                0
                                                        "
                                                        class="text-center"
                                                    >
                                                        No data found
                                                    </b-col>
                                                    <b-col
                                                        sm="12"
                                                        v-if="
                                                            !enrollmentLoading &&
                                                            filteredEnrollments.length >
                                                                0
                                                        "
                                                    >
                                                        <ul
                                                            class="
                                                                pagination
                                                                justify-content-end
                                                                px-2
                                                            "
                                                            style="z-index: -1"
                                                        >
                                                            <b-pagination
                                                                size="sm"
                                                                v-model="
                                                                    currentPageEnrolee
                                                                "
                                                                :total-rows="
                                                                    rowsEnrollment
                                                                "
                                                                :per-page="
                                                                    perPageEnrolee
                                                                "
                                                            ></b-pagination>
                                                        </ul>
                                                    </b-col>
                                                </b-row>
                                            </b-card-body>
                                        </b-collapse>
                                    </b-card>
                                    <b-card no-body class="mb-1">
                                        <b-card-header
                                            header-tag="header"
                                            role="tab"
                                            class="
                                                d-flex
                                                align-items-center
                                                justify-content-between
                                                bg-secondary bg-soft
                                            "
                                        >
                                            <div
                                                class="
                                                    d-flex
                                                    align-items-center
                                                "
                                            >
                                                <h6 class="m-0 me-2">
                                                    Documents
                                                </h6>
                                                <a
                                                    @click="toggleAccordion(7)"
                                                    class="text-white"
                                                    href="javascript: void(0);"
                                                    >[{{
                                                        !toggleDocument
                                                            ? "Show"
                                                            : "Hide"
                                                    }}]</a
                                                >
                                            </div>
                                            <div
                                                class="d-flex search-box"
                                                v-if="toggleDocument"
                                            >
                                                <div
                                                    class="
                                                        position-relative
                                                        me-2
                                                    "
                                                >
                                                    <input
                                                        autocomplete="off"
                                                        type="text"
                                                        class="
                                                            form-control
                                                            rounded
                                                            border border-light
                                                            form-control-sm
                                                        "
                                                        placeholder="Search Document..."
                                                        v-model="filterDocument"
                                                    />
                                                    <i
                                                        class="
                                                            mdi mdi-magnify
                                                            search-icon-sm
                                                            fs-6
                                                        "
                                                    ></i>
                                                </div>
                                                <button
                                                    type="button"
                                                    class="
                                                        btn btn-sm btn-success
                                                        me-1
                                                    "
                                                    :id="`upload-program-document${form.id}`"
                                                    title="Upload Document"
                                                    @click="addDocument = !addDocument"
                                                >
                                                    <i class="bx bx-upload"></i>
                                                </button>
                                                <upload-popover
                                                    :option="
                                                        uploadProgramOptions
                                                    "
                                                    :sourceId="
                                                        form.id
                                                    "
                                                    @uploaded="
                                                        uploadedProgram(
                                                            $event
                                                        )
                                                    "
                                                    :showPV="
                                                        addDocument
                                                    "
                                                    @closePopover="
                                                        addDocument = false
                                                    "
                                                    :dzId="`dropzone-program-document${form.id}`"
                                                    :pvId="`upload-program-document${form.id}`"
                                                ></upload-popover>
                                            </div>
                                        </b-card-header>
                                        <b-collapse
                                            accordion="document-accordion"
                                            role="tabpanel"
                                            :visible="toggleDocument"
                                        >
                                            <b-card-body class="py-2 px-3">
                                                <b-row v-if="documentLoading">
                                                    <div
                                                        class="col-4"
                                                        v-for="n in 3"
                                                        :key="n"
                                                    >
                                                        <b-skeleton-wrapper
                                                            loading
                                                        >
                                                            <template #loading>
                                                                <b-card
                                                                    class="
                                                                        bg-info
                                                                        bg-soft
                                                                    "
                                                                >
                                                                    <div
                                                                        class="
                                                                            mb-2
                                                                            mt-2
                                                                        "
                                                                    >
                                                                        <b-skeleton
                                                                            width="100%"
                                                                            height="18px"
                                                                        ></b-skeleton>
                                                                    </div>
                                                                    <b-skeleton
                                                                        width="50%"
                                                                        height="12px"
                                                                    ></b-skeleton>
                                                                </b-card>
                                                            </template>
                                                        </b-skeleton-wrapper>
                                                    </div>
                                                </b-row>
                                                <b-row>
                                                    <b-col>
                                                        
                                                    </b-col>
                                                </b-row>
                                                <b-row class="mt-3 mb-3"
                                                    v-if="
                                                        filteredDocuments.length >
                                                        0
                                                    "
                                                >
                                                    <b-col
                                                        sm="4"
                                                        v-for="x in filteredDocuments"
                                                        :key="x.id"
                                                    >
                                                        <div
                                                            class="
                                                                position-relative
                                                                cursor-pointer
                                                            "
                                                            style="z-index: 10"
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
                                                                                @click="openDocument(x)"
                                                                                ><i class="bx bx-link-external me-1"></i>Open</b-dropdown-item
                                                                            >
                                                                            <b-dropdown-item variant="danger" @click="removeProgramFile(x.id)"
                                                                                ><i class="bx bx-trash me-1"></i>Remove</b-dropdown-item
                                                                            >
                                                                        </b-dropdown>
                                                                    </div>
                                                                    <div
                                                                        class="
                                                                            avatar-xs
                                                                            me-3
                                                                            mb-2
                                                                        "
                                                                        @click="openDocument(x)"
                                                                    >
                                                                        <div
                                                                            class="
                                                                                avatar-title
                                                                                bg-transparent
                                                                                rounded
                                                                            "
                                                                        >
                                                                            <i
                                                                                v-if="x.fileType.includes('image')"
                                                                                class="
                                                                                    mdi mdi-image
                                                                                    font-size-24
                                                                                    text-purple
                                                                                "
                                                                            ></i>
                                                                            <i
                                                                                v-if="x.fileType.includes('application')"
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
                                                                        @click="openDocument(x)"
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
                                                                                {{x.description}}
                                                                            </h5>
                                                                            <p
                                                                                class="
                                                                                    text-muted
                                                                                    mb-0
                                                                                "
                                                                            >
                                                                                {{formatDateWithTime(new Date(x.dateTimeUploaded))}}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </b-col>
                                                </b-row>
                                                <b-row>
                                                    <b-col
                                                        sm="12"
                                                        v-if="
                                                            !documentLoading &&
                                                            filteredDocuments.length ==
                                                                0
                                                        "
                                                        class="text-center"
                                                    >
                                                        No data found
                                                    </b-col>
                                                    <b-col
                                                        sm="12"
                                                        v-if="
                                                            !documentLoading &&
                                                            filteredDocuments.length >
                                                                0
                                                        "
                                                    >
                                                        <ul
                                                            class="
                                                                pagination
                                                                justify-content-end
                                                                px-2
                                                            "
                                                            style="z-index: -1"
                                                        >
                                                            <b-pagination
                                                                size="sm"
                                                                v-model="
                                                                    currentPageDocument
                                                                "
                                                                :total-rows="
                                                                    rowsDocument
                                                                "
                                                                :per-page="
                                                                    perPageDocument
                                                                "
                                                            ></b-pagination>
                                                        </ul>
                                                    </b-col>
                                                </b-row>
                                            </b-card-body>
                                        </b-collapse>
                                    </b-card>
                                </div>
                            </div>
                        </div>
                    </b-col>
                </b-row>
                <div class="row">
                    <div class="col-md-4" v-for="n in 6" :key="n">
                        <b-skeleton-wrapper :loading="tableBusy">
                            <template #loading>
                                <b-card>
                                    <div class="mb-2 mt-2">
                                        <b-skeleton
                                            width="100%"
                                            height="24px"
                                        ></b-skeleton>
                                    </div>
                                    <b-skeleton
                                        width="60%"
                                        height="12px"
                                    ></b-skeleton>
                                    <b-skeleton
                                        width="50%"
                                        height="12px"
                                    ></b-skeleton>
                                    <div class="mt-3">
                                        <b-skeleton
                                            width="35%"
                                            height="20px"
                                            style="float: right"
                                        ></b-skeleton>
                                    </div>
                                </b-card>
                            </template>
                        </b-skeleton-wrapper>
                    </div>
                </div>
                <div
                    class="row"
                    v-if="!tableBusy && filteredProgram.length > 0"
                >
                    <div
                        class="col-md-4"
                        v-for="x in filteredProgram"
                        :key="x.id"
                    >
                        <div
                            class="
                                card
                                border
                                shadow-none
                                position-relative
                                mb-2
                            "
                            :class="{
                                'border-primary': x.id === selectedProgram,
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
                                        <i class="fas fa-ellipsis-v"></i>
                                    </template>
                                    <b-dropdown-item
                                        @click="updateItem(x)"
                                        variant="dark"
                                        ><i
                                            class="bx bx-edit font-size-18 me-1"
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
                                <h5
                                    class="me-2 w-90 cursor-pointer"
                                    :class="{ 'text-ellipsis': !x.toggleTitle }"
                                    @click="x.toggleTitle = !x.toggleTitle"
                                >
                                    {{ x.programName }} [{{ x.shortName }}]
                                </h5>
                                <ul class="list-group list-inline">
                                    <li class="list-inline-item me-3">
                                        <span
                                            class="align-middle text-muted me-1"
                                            >Board Reso -</span
                                        >
                                        <span class="badge bg-success ms-1">{{
                                            x.boardResNo
                                        }}</span>
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
                                                    new Date(x.dateApproved)
                                                )
                                            }}
                                        </a>
                                    </li>
                                    <li class="list-inline-item me-3">
                                        <a
                                            href="javascript:void(0);"
                                            class="text-muted"
                                        >
                                            <i
                                                class="
                                                    mdi
                                                    mdi-office-building-marker
                                                    align-middle
                                                    text-muted
                                                    me-1
                                                "
                                            ></i>
                                            {{
                                                x.deliveryUnit.office.campus
                                                    .campusName
                                            }}
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <div class="px-3 mb-2 text-right">
                                <a
                                    href="javascript:void(0);"
                                    class="text-primary"
                                    @click="viewDetails(x)"
                                    >View Details</a
                                >
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    class="row"
                    v-if="!tableBusy && filteredProgram.length == 0"
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
                            :per-page="perPage"
                        ></b-pagination>
                    </ul>
                </div>
            </div>
        </div>
        <graduate-year ref="gy" @dropData="reloadYear($event)"></graduate-year>
        <program-category @dropData="dropPc($event)"></program-category>
        <examination-modal @dropData="dropEm($event)"></examination-modal>
        <employment-record ref="er"></employment-record>
        <survey-level ref="sl" @dropData="dropSl($event)"></survey-level>
        <accreditor-modal
            ref="acc"
            @dropData="dropAccreditor($event)"
        ></accreditor-modal>
        <print-options ref="printOpt"></print-options>
    </Layout>
</template>