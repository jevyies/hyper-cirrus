<script>
import appConfig from "@/app.config";

import { notificationMethods } from "@/state/helpers";
import { HubConnectionBuilder } from "@microsoft/signalr";

//alfred was here

export default {
    name: "app",
    page: {
        // All subcomponent titles will be injected into this template.
        titleTemplate(title) {
            title = typeof title === "function" ? title(this.$store) : title;
            return title ? `${title} | ${appConfig.title}` : appConfig.title;
        },
    },
    mounted() {
        let connection = new HubConnectionBuilder()
            .withUrl(
                this.$store.state.notification.hubConnection + "notificationhub"
            )
            .build();
        connection.on("notification", (message) => {
            if (message == this.$store.state.data.office.id) {
                this.$store.commit("notification/addNotif", message);
            }
        });
        connection.on("clearNotifications", (message) => {
            this.$store.dispatch("notification/GetNotif", message);
        });
        connection.on("seenNotification", (message) => {
            this.$store.dispatch("notification/GetNotif", message);
        });
        connection.on("removeNotification", (message) => {
            this.$store.dispatch("notification/GetNotif", message);
        });
        connection.start();
    },
    watch: {
        /**
         * Clear the alert message on route change
         */
        // eslint-disable-next-line no-unused-vars
        $route(to, from) {
            // clear alert on location change
            this.clearNotification();
        },
    },
    methods: {
        clearNotification: notificationMethods.clear,
    },
};
</script>

<template>
    <div id="app">
        <RouterView />
    </div>
</template>
