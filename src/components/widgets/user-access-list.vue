<script>
import { required } from "vuelidate/lib/validators";

export default {
    name: 'UserAccessList',
    props: {
        item: Object,
        indexOfMother: Number,
        mother: Object,
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
    methods: {
        toggle() {
            if (this.isFolder) {
                this.isOpen = !this.isOpen;
            }
        },
        toggleCheck(value){
            if(this.item.childAccessLists.length > 0 || this.item.childAccessLists){
                this.$emit('check-child', {item: this.item, value: value});
            }
            if(value){
                if(this.item.parentId > 0){
                    this.$emit('check-parent', {index: this.indexOfMother, item: this.item});
                }
            }else{
                if(this.item.parentId > 0){
                    this.$emit('uncheck-parent', {index: this.indexOfMother, item: this.item})
                }
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
                :indexOfMother="indexOfMother"
                :mother="item"
                @check-parent="$emit('check-parent', $event)"
                @uncheck-parent="$emit('uncheck-parent', $event)"
                @check-child="$emit('check-child', $event)"
            ></user-access-list>
        </div>
    </div>
</template>
