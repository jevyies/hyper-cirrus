<script>
import UserAccessList from '@/components/widgets/user-access-list';

export default {
    name: "Unit",
    components: {
        UserAccessList,
    },
    data() {
        return {
            submitted: false,
            tableData: [],
            checkAll: false,
            selectedItems: [],
            applicationUserId: '',
        };
    },
    created(){
        this.tableBusy = true;
        this.$store
            .dispatch("accesslist/GetAllAccessList")
            .then((res) => {
                this.tableBusy = false;
                this.tableData = res.data
            })
            .catch((err) => {
                this.tableBusy = false;
                this.showToast("Something went wrong!","error");
            });
    },
    methods: {
        checkIfSelected(node) {
            for(var i = 0, count = node.childAccessLists.length; i < count; i++) {
                let item = node.childAccessLists[i];
                if(item.selected){
                    this.selectedItems.push(item.id);
                }
                this.checkIfSelected(node.childAccessLists[i]);
            }
        } ,
        clearIfSelected(node){
            for(var i = 0, count = node.childAccessLists.length; i < count; i++) {
                let item = node.childAccessLists[i];
                item.selected = false;
                this.clearIfSelected(item);
            }
        },
        clearSelected() {
            this.tableData.forEach(item => {
                item.selected = false;
                this.clearIfSelected(item);
            })
        } ,
        getData(id){
            this.applicationUserId = id;
            this.clearSelected();
            this.$store
                .dispatch("useraccesslist/GetUserAccessList", this.applicationUserId)
                .then((res) => {
                    this.userAccess = res.data;
                    this.checkIfExist(this.userAccess);
                })
                .catch((err) => {
                    console.log(err)
                    this.showToast("Something went wrong!","error");
                });
        },
        recurseCheckIfExist(node, data){
            for(var i = 0, count = node.childAccessLists.length; i < count; i++) {
                let item = node.childAccessLists[i];
                let exist = data.find(x => x.accessListId == item.id);
                if(exist){
                    item.selected = true;
                }
                this.recurseCheckIfExist(node.childAccessLists[i], data);
            }
        },
        checkIfExist(data){
            this.tableData.forEach(item => {
                let exist = data.find(x => x.accessListId == item.id);
                if(exist){
                    item.selected = true;
                }
                this.recurseCheckIfExist(item, data);
            });
        },
        itemSelected(data){
            if(data.action === 'push'){
                this.selectedItems.push(data.item);
            }else{
                this.selectedItems.splice(this.selectedItems.indexOf(data.item), 1);
            }
        },
        saveChanges(){
            this.submitted = true;
            this.selectedItems = [];
            this.tableData.forEach(item => {
                if(item.selected){
                    this.selectedItems.push(item.id);
                }
                this.checkIfSelected(item);
            })
            if(this.selectedItems.length == 0){
                this.showToast("Please select at least one item","warning");
                return;
            }
            this.$store
                .dispatch("useraccesslist/CreateUserAccessList", {
                    applicationUserId: this.applicationUserId,
                    accessListIds: this.selectedItems
                })
                .then((res) => {
                    if(res.data.error){
                        return this.showToast(res.data.errorMessage,"error");
                    }
                    this.$bvModal.hide('user-access-modal')
                    this.showToast("Successfully Saved","success");
                })
                .catch(() => {
                    this.tableBusy = false;
                    this.showToast("Something went wrong!","error");
                });
        },
        recurseToCheck(node, id, value) {
            for(var i = 0, count = node.childAccessLists.length; i < count; i++) {
                let item = node.childAccessLists[i];
                if(item.id == id){
                    item.selected = value;
                }
                if(item.parentId > 0){
                    this.recurseToCheck(item, item.id, value);
                }
            }
        },
        recurseCheckChild(node, value) {
            for(var i = 0, count = node.childAccessLists.length; i < count; i++) {
                let item = node.childAccessLists[i];
                item.selected = value;
                this.recurseCheckChild(item, value);
            }
        },
        checkParent(data){
            this.tableData.forEach(item => {
                if(item.id == data.id){
                    item.selected = true;
                }
                this.recurseToCheck(item, data.id, data.value);
            });
        },
        checkChild(data){
            this.recurseCheckChild(data.item, data.value)
        }
    },
    
};
</script>

<template>
    <b-modal
        id="user-access-modal"
        title="User Access List"
        size="md"
        title-class="font-18"
        hide-footer
        no-close-on-backdrop
    >
        <div v-for="(x, xIndex) in tableData" :key="x.id">
            <user-access-list
                class="item"
                :item="x"
                :indexOfChild="xIndex"
                :newForm="false"
                :mother="{motherList: true, id: x.id, childAccessLists: x.childAccessLists, selected: x.selected}"
                :checkAll="checkAll"
                :isChecked="x.selected"
                @check-parent="checkParent($event)"
                @check-child="checkChild($event)"
            ></user-access-list>
        </div>
        <div class="modal-footer mt-4">
            <button type="button" @click="saveChanges" class="btn btn-primary">
                Save changes
            </button>
            <button
                type="button"
                class="btn btn-link"
                @click="$bvModal.hide('user-access-modal')"
            >
                Close
            </button>
        </div>
    </b-modal>
</template>