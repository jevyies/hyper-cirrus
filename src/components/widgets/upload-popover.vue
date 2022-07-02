<script>
import pdf from "@/assets/images/icons/pdf.png";
import vue2Dropzone from "vue2-dropzone";
export default {
    name: 'UploadPopover',
    props: ['option', 'sourceId', 'showPV', 'dzId', 'pvId'],
    components: {
        vueDropzone: vue2Dropzone,
    },
    data(){
        return {
            dropzoneOptions: {
                url: this.$store.state.data.uploadURL,
                thumbnailWidth: 200,
                maxFilesize: 10,
                autoProcessQueue: false,
                previewTemplate: this.template(),
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem(
                        "accessToken"
                    )}`,
                },
                acceptedFiles: "image/jpeg,image/png,image/gif,application/pdf",
            },
            selectedId: 0
        }
    },
    methods: {
        template(){
            return `<div class="d-flex">
                        <div class="overflow-hidden" style="width:40%">
                            <div class="dz-preview dz-file-preview">
                                <div class="dz-image">
                                    <img data-dz-thumbnail>
                                </div>
                                <div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress></span></div>
                                <div class="dz-success-mark"><i class="fa fa-check"></i></div>
                                <div class="dz-error-mark"><i class="fa fa-close"></i></div>
                            </div>
                            <div class="dz-details text-center">
                                <div class="text-ellipsis text-dark">
                                    <span data-dz-name></span>
                                </div>
                                <div class="dz-error-message"><span data-dz-errormessage class="text-danger"></span></div>
                            </div>
                        </div>
                        <div style="margin:15px;width:60%">
                            <textarea class="form-control upload-textarea" placeholder="Add Description"></textarea>
                            <div class="d-none input-error">
                                <span class="text-danger">This input is required</span>
                            </div>
                            <button type="button" data-dz-remove class="cursor-pointer btn btn-sm btn-danger mt-2 btn-block"><i class="bx bx-trash me-1"></i>Remove File</button>
                        </div>
                    </div>`
        },
        filesAdded(files) {
            files.forEach((file) => {
                var appType = file.type.split("/")[0];
                if (appType === "application") {
                    var ref = file.previewElement.querySelectorAll(
                        "[data-dz-thumbnail]"
                    );
                    ref[0].src = pdf;
                    ref[0].style = "width: 120px; height: 120px;";
                }
            });
        },
        sendingEvent(file, xhr, formData) {
            this.pageLoader(true);
            let description =
                file.previewElement.querySelectorAll("textarea")[0].value;
            formData.append("File", file);
            formData.append("Description", description);
            formData.append("ReferenceId", this.sourceId);
            formData.append("Type", this.option.type);
            formData.append("Folder", this.option.folder);
        },
        successfulUpload(file, response){
            this.$refs[this.dzId].removeFile(file);
            this.$emit("uploaded", response);
            this.showToast(`Succesfully uploaded - ${response.description}`, 'success');
        },
        uploadDocument() {
            var queued = this.$refs[this.dzId].getQueuedFiles();
            var count = 0;
            queued.forEach(file => {
                let description = file.previewElement.querySelectorAll("textarea")[0].value;
                if(!description){
                    file.previewElement.querySelectorAll("textarea")[0].classList.add("border-danger");
                    file.previewElement.querySelector(".input-error").classList.remove("d-none");
                    count++;
                }else{
                    file.previewElement.querySelectorAll("textarea")[0].classList.remove("border-danger");
                    file.previewElement.querySelector(".input-error").classList.add("d-none");
                }
            })
            if(count > 0){
                return;
            }
            this.$refs[this.dzId].processQueue();
        },
        hidePopOver(){
            this.$emit("closePopover");
        },
        uploadCompleted(){
            setTimeout(() => {
                this.pageLoader(false);
                this.$emit("closePopover");
            }, 1000)
        }
    }
}
</script>
<template>
    <b-popover
        :target="pvId"
        triggers="click"
        :placement="option.placement"
        custom-class="popover-documents"
        :show.sync="
            showPV
        "
    >
        <template
            v-slot:title
        >
            <div
                class="
                    d-flex
                    align-items-center
                    justify-content-between
                "
            >
                <small
                    >Upload Documents</small
                >
                <span
                    class="
                        bx
                        bx-x
                        font-size-14
                        cursor-pointer
                    "
                    @click="
                        hidePopOver
                    "
                ></span>
            </div>
        </template>
        <vue-dropzone
            :ref="dzId"
            id="dropzone"
            :options="
                dropzoneOptions
            "
            :useCustomSlot="
                true
            "
            @vdropzone-files-added="
                filesAdded
            "
            @vdropzone-sending="
                sendingEvent
            "
            @vdropzone-success="successfulUpload"
            @vdropzone-queue-complete="uploadCompleted"
            class="
                dropzone-previews
                dropzone
            "
        >
            <div
                class="
                    dropzone-custom-content
                "
            >
                <h3
                    class="
                        dropzone-custom-title
                    "
                >
                    Drag and
                    drop to
                    upload
                    content!
                </h3>
                <div
                    class="
                        subtitle
                    "
                >
                    ...or click
                    to select a
                    file from
                    your
                    computer
                </div>
            </div>
            <div
                class="
                    dz-preview
                    dz-file-preview
                "
            >
                <i
                    class="
                        bx bx
                        plus
                    "
                ></i>
            </div>
        </vue-dropzone>
        <hr />
        <div
            class="
                text-right
            "
        >
            <button
                type="button"
                class="
                    btn
                    btn-success
                    btn-sm
                    me-1
                "
                @click="
                    uploadDocument()
                "
            >
                <i
                    class="
                        bx
                        bx-upload
                        me-1
                    "
                ></i
                >Upload
            </button>
            <button
                type="button"
                class="
                    btn
                    btn-sm
                "
                @click="
                    hidePopOver
                "
            >
                <i
                    class="
                        bx
                        bx-x
                        me-1
                    "
                ></i
                >Cancel
            </button>
        </div>
    </b-popover>
</template>