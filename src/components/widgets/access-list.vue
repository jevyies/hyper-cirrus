<script>
import { required } from "vuelidate/lib/validators";
import { cloneDeep } from "lodash";
import vClickOutside from 'v-click-outside'

export default {
    name: 'AccessList',
    directives: {
      clickOutside: vClickOutside.directive
    },
    props: {
        item: Object,
        indexOfChild: Number,
        mother: Object,
    },
    data: function () {
        return {
            submitted: false,
            isOpen: false,
            isAdd: false,
            isUpdate: false,
            form: {
                id: 0,
                type: "",
                access: "",
                parentId: 0,
                childAccessLists: []
            },
        };
    },
    validations: {
        form: {
            access: {required}
        }
    },
    computed: {
        isFolder() {
            return this.item.childAccessLists && this.item.childAccessLists.length;
        },
    },
    methods: {
        toggle() {
            if (this.isFolder && !this.isUpdate) {
                this.isOpen = !this.isOpen;
            }
        },
        async addNew(item){
            this.form = {
                id: 0,
                type: item.type,
                access: "",
                parentId: item.id,
                childAccessLists: [],
            }
            this.isOpen = true;
            this.isAdd = true;
            setTimeout(() => {
                this.$refs.inputHere.focus();
            }, 500)
        },
        async onCreate(){
            this.submitted = true;
            this.$v.form.$touch();
            if (this.$v.form.$invalid) {
                return;
            }
            if (this.form.id > 0) {
                await this.$store
                    .dispatch("accesslist/UpdateAccessList", this.form)
                    .then((res) => {
                        if(res.data.error){
                            return this.showToast(
                                res.data.errorMessage,
                                "error"
                            );
                        }
                        this.mother.childAccessLists.splice(this.indexOfChild, 1, this.form);
                    })
                    .catch((err) => {
                        this.showToast(
                            "Error updating accreditor!",
                            "error"
                        );
                    });
                this.isUpdate = false;
            } else {
                await this.$store
                    .dispatch("accesslist/CreateAccessList", this.form)
                    .then((res) => {
                        if(res.data.error){
                            return this.showToast(
                                res.data.errorMessage,
                                "error"
                            );
                        }
                        this.form.id = res.data.id;
                        this.item.childAccessLists.push(this.form);
                        this.isOpen = true;
                    })
                    .catch((err) => {
                        this.showToast(
                            "Error creating accreditor!",
                            "error"
                        );
                    });
                this.isAdd = false;
            }
            this.submitted = false;
        },
        updateItem(item){
            this.form = cloneDeep(item);
            this.isUpdate = true;
            this.isOpen = true;
            setTimeout(() => {
                this.$refs.updateHere.focus();
            }, 500)
        },
        async deleteItem(item){
            await this.$store
                .dispatch("accesslist/DeleteAccessList", item.id)
                .then((res) => {
                    if(res.data.error){
                        return this.showToast(
                            res.data.errorMessage,
                            "error"
                        );
                    }
                    if(this.mother.motherList){
                        this.$emit("remove-parent");
                    }else{
                        this.mother.childAccessLists.splice(this.indexOfChild, 1)
                    }
                })
                .catch((err) => {
                    this.showToast(
                        "Error deleting access list! Must delete the children first",
                        "error"
                    );
                });
        },
        onClickOutside(){
            this.isUpdate = false;
        }
    },
};
</script>
<template>
    <div>
        <div class="d-flex cursor-pointer align-items-center font-size-15">
            <div class="d-flex align-items-center" @click="toggle" v-click-outside="onClickOutside">
                <i class="bx bx-chevron-right me-1 rotate font-size-10" :class="{'rotate-90': isOpen}" v-if="isFolder"></i>
                <span @dblclick="updateItem(item)" :class="{'ms-2': !isFolder}" class="me-1">
                    <span v-if="!isUpdate">{{item.access}}</span>
                    <form @submit.prevent="onCreate" class="needs-validation" v-if="isUpdate">
                        <input type="text" ref="updateHere" class="access-form-input" placeholder="Enter Access List" v-model="form.access" :class="{'is-invalid': submitted && $v.form.access.$error}">
                    </form>
                </span>
            </div>
            <a href="javascript:void(0)" class="font-size-10 me-1" @click="addNew(item)">[<i class="bx bx-plus"></i>]</a>
            <a href="javascript:void(0)" class="font-size-10 text-danger" @click="deleteItem(item)"><b>[<i class="bx bx-trash"></i>]</b></a>
        </div>
        <form @submit.prevent="onCreate" class="needs-validation ms-3" v-if="isAdd">
            <input type="text" ref="inputHere" class="access-form-input" placeholder="Enter Access List" v-model="form.access" :class="{'is-invalid': submitted && $v.form.access.$error}">
        </form>
        <div v-show="isOpen" v-if="isFolder" class="ms-3">
            <access-list
                class="item"
                v-for="(child, index) in item.childAccessLists"
                :key="index"
                :item="child"
                :indexOfChild="index"
                :mother="item"
                @remove-parent="$emit('remove-parent', $event)"
            ></access-list>
        </div>
    </div>
</template>
