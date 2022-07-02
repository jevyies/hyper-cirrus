<script>
import XLSX from "xlsx";
import { cloneDeep } from "lodash";
export default {
    page: {
        title: "Excel Uploading",
    },
    data() {
        return {
            uploadArray: [],
            excelList: [],
            unitList: [],
            categoryList: [],
        };
    },
    created() {},
    methods: {
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
        applyFiltering() {
            var excelList = cloneDeep(this.excelList);
            excelList.forEach((item) => {
                item.programName = item.ProgramName;
                delete item.ProgramName;

                item.shortName = item.ShortName;
                delete item.ShortName;

                item.boardResNo = item.BoardResolutionNo;
                delete item.BoardResolutionNo;

                item.dateApproved = item.DateApproved === '01/01/0001' ? `1920-01-01T16:00:00` : this.getDate(this.ExcelDateToJSDate(item.DateApproved));
                delete item.DateApproved;

                item.yearOffered = item.YearOffered === 'Not applicable' ? 0 : item.YearOffered;
                delete item.YearOffered;

                item.yearFirstGraduate = item.YearFirstGraduate === 'Not applicable' ? 0 : item.YearFirstGraduate;
                delete item.YearFirstGraduate;

                item.isChedIdentified = item.IsChedIdentified;
                delete item.IsChedIdentified;

                item.isRdcPriority = item.IsRDCPriority;
                delete item.IsRDCPriority;

                item.isThesisRequired = item.IsThesisRequired;
                delete item.IsThesisRequired;

                item.isAccreditable = item.IsAccreditable ? item.IsAccreditable : false;
                delete item.IsAccreditable;

                item.isNonBoard = item.IsNonboard;
                delete item.IsNonboard;
                
                item.isOnCampus = true;

                item.isDistanceLearning = item.IsDistanceLearning;
                delete item.IsDistanceLearning;

                item.examinationId = item.Examination;
                delete item.Examination;

                item.programCategoryId = item.ProgramCategory;
                delete item.ProgramCategory;

                item.deliveryUnitId = item.DeliveryUnit;
                delete item.DeliveryUnit;

                item.notes = item.Notes;
                delete item.Notes;

                delete item.Campus;
            });
            this.excelList = excelList;
        },
        async uploadExcel() {
            let itemError = []
            for (const item of this.excelList) {
                await this.$store
                    .dispatch("program/CreateProgram", item)
                    .then((res) => {
                        if (res.data.error) {
                            return (this.alert = {
                                type: "danger",
                                message: "Something went wrong!",
                            });
                        }
                        this.alert = {
                            type: "success",
                            message: "Successfully created!",
                        };
                    })
                    .catch((err) => {
                        itemError.push(item);
                        this.alert = {
                            type: "danger",
                            message: "Something went wrong!",
                        };
                    });
            }
            console.log(itemError)
        },
        ExcelDateToJSDate(serial) {
            var utc_days  = Math.floor(serial - 25569);
            var utc_value = utc_days * 86400;                                        
            var date_info = new Date(utc_value * 1000);

            var fractional_day = serial - Math.floor(serial) + 0.0000001;

            var total_seconds = Math.floor(86400 * fractional_day);

            var seconds = total_seconds % 60;

            total_seconds -= seconds;

            var hours = Math.floor(total_seconds / (60 * 60));
            var minutes = Math.floor(total_seconds / 60) % 60;

            return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds);
        }
    },
};
</script>
<template>
    <div class="d-flex justify-content-center">
        <div class="my-3 px-2 container">
            <h4>Excel Uploading</h4>
            <form class="needs-validation mb-4" ref="usForm">
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
            <div v-if="excelList.length > 0">
                <div class="row">
                    <div class="col-md-6"><h4>Excel Data</h4></div>
                    <div class="col-md-6 text-right">
                        <button
                            class="btn btn-primary btn-sm"
                            type="button"
                            @click="applyFiltering"
                        >
                            Apply More Filtering
                        </button>
                    </div>
                </div>

                <div class="p-3 text-dark">
                    <div>[</div>
                    <template v-for="(x, indexX) in excelList">
                        <div :key="indexX" class="ms-4">
                            <div>{</div>
                            <template v-for="(y, value, indexY) in x">
                                <div :key="indexX + indexY" class="ms-4">
                                    <b>"{{ value }}" :</b>
                                    <span class="ms-2">"{{ y }}"</span>
                                </div>
                            </template>
                            <div>},</div>
                        </div>
                    </template>
                    <div>]</div>
                </div>
            </div>
        </div>
    </div>
</template>