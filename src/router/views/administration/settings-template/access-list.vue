<script>
import { cloneDeep } from "lodash";
import { required } from "vuelidate/lib/validators";
import AccessList from '@/components/widgets/access-list';
import vClickOutside from 'v-click-outside'

export default {
    components: {
        AccessList
    },
    directives: {
      clickOutside: vClickOutside.directive
    },
    data() {
        return {
            submitted: false,
            tableData: {},
            modalTitle: "",
            totalRows: 1,
            currentPage: 1,
            perPage: 10,
            pageOptions: [10, 25, 50, 100],
            filter: null,
            tableBusy: false,
            addNew: false,
            form: {
                id: 0,
                type: "",
                access: "",
                parentId: 0,
                childAccessLists: []
            },
        };
    },
    created() {
        this.tableBusy = true;
        this.$store
            .dispatch("accesslist/GetAllAccessList")
            .then((res) => {
                console.log(res.data)
                this.tableBusy = false;
                this.tableData = res.data
            })
            .catch(() => {
                this.tableBusy = false;
                this.showToast("Something went wrong!","error");
            });
    },
    computed: {
        rows() {
            if(this.filter){
                return this.totalRows;
            }
            return this.tableData.length;
        },
    },
    validations: {
        form: {
            access: { required },
        },
    },
    methods: {
        async submitAccessList(){
            var data = cloneDeep(this.form);
            data.type = this.form.access;
            await this.$store
                .dispatch("accesslist/CreateAccessList", data)
                .then((res) => {
                    if(res.data.error){
                        return this.showToast(
                            res.data.errorMessage,
                            "error"
                        );
                    }
                    data.id = res.data.id;
                    this.tableData.push(data);
                    this.addNew = false;
                })
                .catch((err) => {
                    this.showToast(
                        "Error creating accreditor!",
                        "error"
                    );
                });
        },
        removeParent(index){
            this.tableData.splice(index, 1);
        },
        addAL(){
            this.addNew = true;
            this.form = {
                id: 0,
                type: "",
                access: "",
                parentId: 0,
                childAccessLists: []
            }
            setTimeout(() => {
                this.$refs.inputAL.focus()
            },300)
        },
        onClickOutside(){
            this.addNew = false;
        }
    }
};
</script>

<template>
    <div>
        <div
            class="
                card
                border
            "
        >
            <div class="card-body">
                <div
                    class="
                        d-flex
                        justify-content-between
                        align-items-center
                        mb-3
                    "
                >
                    <h4 class="card-title m-0">Access List</h4>
                </div>
                <div v-click-outside="onClickOutside">
                    <a href="javascript:void(0);" class="font-size-15" v-if="!addNew" @click="addAL">
                        <i class="bx bx-plus me-1"></i>Add New
                    </a>
                    <div class="d-flex align-items-center" v-if="addNew">
                        <form @submit.prevent="submitAccessList" class="needs-validation">
                            <input type="text" class="access-form-input" ref="inputAL" placeholder="Type Access List" v-model="form.access" :class="{'is-invalid': submitted && $v.form.access.$error}">
                        </form>
                    </div>
                </div>
                <div v-for="(x, xIndex) in tableData" :key="x.id">
                    <access-list
                        class="item"
                        :item="x"
                        :indexOfChild="xIndex"
                        :newForm="false"
                        :mother="{motherList: true}"
                        @remove-parent="removeParent(xIndex)"
                    ></access-list>
                </div>
            </div>
        </div>
    </div>
</template>