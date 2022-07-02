<script>
import pdfIcon from '@/assets/images/icons/pdf.png'
import xlsIcon from '@/assets/images/icons/xls.png'
import docIcon from '@/assets/images/icons/doc.png'
export default {
    name: "PrLogs",
    data(){
        return {
            apiUrl: '',
            pdfIcon: pdfIcon,
            xlsIcon: xlsIcon,
            docIcon: docIcon,
            routeVariables: []
        }
    },
    methods: {
        putOptions(data){
            this.routeVariables = data.routeVariables;
            this.apiUrl = data.apiUrl;
        },
        async print(type){
            this.pageLoader(true);
            var routeVariables = '';
            var rv = '';
            if(this.routeVariables.length > 0){
                this.routeVariables.forEach(item => {
                    routeVariables += `${item}/`
                })
                rv = `/${routeVariables.slice(0, -1)}`;
            }
            
            const res = await this.$store.dispatch(
                "printable/PrintReport",
                `${this.apiUrl}/${type}${rv}`
            );
            let contentType = res.headers['content-type'];
            if(contentType.includes('json')){
                let dataObject = JSON.parse(await res.data.text());
                this.pageLoader(false);
                return this.showToast(dataObject.errorMessage, 'error');
            }
            let cd = res.headers['content-disposition'];
            let cdArr = cd.split(" ");
            let filename = cdArr[1].slice(9, -1);
            var url = URL.createObjectURL(res.data);
            if(type == 0){
                window.open(url);
            }else{
                var a = document.createElement("a");
                a.setAttribute("download", `${filename}`);
                a.setAttribute("href", url);
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
            this.pageLoader(false); 
        }
    }
}
</script>
<template>
    <b-modal
        id="print-options-modal"
        title="Print Options"
        size="md"
        title-class="font-18"
        hide-footer
        no-close-on-backdrop
    >
        <div class="d-flex justify-content-center">
            <div
                class="cursor-pointer text-center mb-2 print-opt"
                @click="print(0)"
            >
                <img :src="pdfIcon" alt="PDF Icon" class="print-icons" loading="lazy"/>
            </div>
            <div
                class="cursor-pointer text-center mb-2 print-opt"
                @click="print(1)"
            >
                <img :src="xlsIcon" alt="Excel Icon" class="print-icons" loading="lazy"/>
            </div>
            <div
                class="cursor-pointer text-center mb-2 print-opt"
                @click="print(2)"
            >
                <img :src="docIcon" alt="Document Icon" class="print-icons" loading="lazy"/>
            </div>
        </div>
    </b-modal>
</template>