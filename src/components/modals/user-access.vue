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
            selectedItems: [],
            applicationUserId: '',
            searchMother: [],
        };
    },
    created(){
        this.pageLoader(true);
        this.$store
            .dispatch("accesslist/GetAllAccessList")
            .then((res) => {
                this.tableData = res.data
                this.pageLoader(false);
            })
            .catch((err) => {
                this.pageLoader(false);
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
            this.pageLoader(true);
            this.applicationUserId = id;
            this.clearSelected();
            this.$store
                .dispatch("useraccesslist/GetUserAccessList", this.applicationUserId)
                .then((res) => {
                    this.userAccess = res.data;
                    this.checkIfExist(this.userAccess);
                    this.pageLoader(false);
                })
                .catch((err) => {
                    this.pageLoader(false);
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
        recurseToCheck(node) {
            for(var i = 0, count = node.childAccessLists.length; i < count; i++) {
                this.motherLevel++;
                let item = node.childAccessLists[i];
                this.recurseToCheck(item);
            }
        },
        recurseCheckChild(node, value) {
            for(var i = 0, count = node.childAccessLists.length; i < count; i++) {
                let item = node.childAccessLists[i];
                item.selected = value;
                this.recurseCheckChild(item, value);
            }
        },
        recurseCheckMother(node, id, value) {
            for(var i = 0, count = node.childAccessLists.length; i < count; i++) {
                let item = node.childAccessLists[i];
                this.recurseCheckMother(item, id, value);
            }
        },
        searchTree(element, matchingId){
            if(element.id == matchingId){
                return element;
            }else if (element.childAccessLists != null && element.childAccessLists.length > 0){
                var i;
                var result = null;
                for(i=0; result == null && i < element.childAccessLists.length; i++){
                    result = this.searchTree(element.childAccessLists[i], matchingId);
                }
                return result;
            }
            return null;
        },
        checkParent(data){
            this.searchMother = this.tableData[data.index];
            let item = this.searchTree(this.searchMother, data.item.parentId);
            while (item !== null) {
                item.selected = true;
                if(item.parentId){
                    item = this.searchTree(this.searchMother, item.parentId);
                }else{
                    item = null;
                }
            }
        },
        uncheckParent(data){
            this.searchMother = this.tableData[data.index];
            let item = this.searchTree(this.searchMother, data.item.parentId);
            while (item !== null) {
                let unchecked = 0;
                item.childAccessLists.forEach(child => {
                    if(!child.selected){
                        unchecked++;
                    }
                })
                if(unchecked == item.childAccessLists.length){
                    item.selected = false;
                }
                if(item.parentId){
                    item = this.searchTree(this.searchMother, item.parentId);
                }else{
                    item = null;
                }
            }
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
                :indexOfMother="xIndex"
                :newForm="false"
                :mother="{motherList: true, id: x.id, childAccessLists: x.childAccessLists, selected: x.selected}"
                @check-parent="checkParent($event)"
                @uncheck-parent="uncheckParent($event)"
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