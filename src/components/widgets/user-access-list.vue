<script>
import { required } from "vuelidate/lib/validators";
import { cloneDeep } from "lodash";

export default {
    name: 'UserAccessList',
    props: {
        item: Object,
        indexOfChild: Number,
        mother: Object,
        isChecked: Boolean,
    },
    data: function () {
        return {
            submitted: false,
            isOpen: false,
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
    watch: {
        isChecked(value){
            if(value){
                if(this.mother.parentId > 0){
                    this.$emit('check-parent', {id: this.mother.parentId, value: true});
                }
            }
        },
    },
    methods: {
        toggle() {
            if (this.isFolder) {
                this.isOpen = !this.isOpen;
            }
        },
        toggleCheck(value){
            if(this.item.childAccessLists.length == 0 || !this.item.childAccessLists){
                if(value){
                    let checked = 0;
                    this.mother.childAccessLists.forEach(item => {
                        if(item.selected){
                            checked++;
                        }
                    })
                    if(checked > 0){
                        this.mother.selected = true;
                    }
                }else{
                    let unchecked = 0;
                    this.mother.childAccessLists.forEach(item => {
                        if(!item.selected){
                            unchecked++;
                        }
                    })
                    if(unchecked == this.mother.childAccessLists.length){
                        this.mother.selected = false;
                    }
                }
            }else{
                this.$emit('check-child', {item: this.item, value: value});
            }
        },
    },
};
</script>
<template>
    <div>
        <div class="d-flex cursor-pointer align-items-center font-size-15">
            <div class="d-flex align-items-center" @click="toggle">
                <i class="bx bx-chevron-right me-1 rotate font-size-10" :class="{'rotate-90': isOpen}" v-if="isFolder"></i>
                <div
                    class="
                        form-check
                        form-checkbox-outline
                        form-check-success
                        mb-0
                    "
                    :class="{'ms-3': !isFolder}"
                >
                    <input
                        type="checkbox"
                        :id="`customCheckcolor${item.id}`"
                        v-model="item.selected"
                        @change="toggleCheck(item.selected)"
                        class="form-check-input"
                    />
                    <label
                        :for="`customCheckcolor${item.id}`"
                        class="form-check-label"
                    >
                        <span>{{item.access}}</span>
                    </label>
                </div>
            </div>
        </div>
        <div v-show="isOpen" v-if="isFolder" class="ms-3">
            <user-access-list
                class="item"
                v-for="(child, index) in item.childAccessLists"
                :key="index"
                :item="child"
                :indexOfChild="index"
                :mother="item"
                :isChecked="item.selected"
                @check-parent="$emit('check-parent', $event)"
                @check-child="$emit('check-child', $event)"
            ></user-access-list>
        </div>
    </div>
</template>
