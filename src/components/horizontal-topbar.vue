<script>
import i18n from "../i18n";
import simplebar from "simplebar-vue";
import { layoutComputed } from "@/state/helpers";
import SetCycle from "./modals/set-cycle.vue";

/**
 * Horizontal-topbar component
 */
export default {
    props: {
        type: {
            type: String,
            required: true,
        },
        width: {
            type: String,
            required: true,
        },
    },
    computed: {
        ...layoutComputed,
        setCycle: {
            get() {
                return this.$store.getters["data/getCycle"];
            },
            set(newValue) {
                return newValue;
            },
        },
    },
    components: {
        simplebar,
        SetCycle,
    },
    data() {
        return {
            username: JSON.parse(localStorage.getItem("user")).userName,
            alert: {
                type: "",
                message: "",
            },
        };
    },
    mounted() {
        this.$store.dispatch(
            "notification/GetNotif",
            this.$store.state.data.office.id
        );
    },
    methods: {
        changeCycle(cycle) {
            this.$emit("changeCycle", cycle);
        },
        toggleRightSidebar() {
            this.$parent.toggleRightSidebar();
        },
        toggleMenu() {
            let element = document.getElementById("topnav-menu-content");
            element.classList.toggle("show");
        },
        initFullScreen() {
            document.body.classList.toggle("fullscreen-enable");
            if (
                !document.fullscreenElement &&
                /* alternative standard method */ !document.mozFullScreenElement &&
                !document.webkitFullscreenElement
            ) {
                // current working methods
                if (document.documentElement.requestFullscreen) {
                    document.documentElement.requestFullscreen();
                } else if (document.documentElement.mozRequestFullScreen) {
                    document.documentElement.mozRequestFullScreen();
                } else if (document.documentElement.webkitRequestFullscreen) {
                    document.documentElement.webkitRequestFullscreen(
                        Element.ALLOW_KEYBOARD_INPUT
                    );
                }
            } else {
                if (document.cancelFullScreen) {
                    document.cancelFullScreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.webkitCancelFullScreen) {
                    document.webkitCancelFullScreen();
                }
            }
        },
        setCycleModal() {
            this.$bvModal.show("set-cycle-modal");
        },
        setLanguage(locale, country, flag) {
            this.current_language = locale;
            this.text = country;
            this.flag = flag;
            i18n.locale = locale;
        },
        clearAllNotification() {
            this.$store.dispatch("notification/DeleteAllNotif");
        },
        seenNotif(row) {
            row.showDeleteOption = false;
            this.$store.dispatch("notification/SeenNotif", row.id);
            row.status = "Seen";
            this.$route.name !== "myBudgetItem" &&
                this.$router.push("/office/budget-item");
        },
        longPress(bool, index) {
            this.$store.commit("notification/setDeleteOption", {
                bool: bool,
                index: index,
            });
        },
        deleteNotif(id) {
            this.$store.dispatch("notification/DeleteNotif", id);
        },
    },
    watch: {
        type: {
            immediate: true,
            handler(newVal, oldVal) {
                if (newVal !== oldVal) {
                    switch (newVal) {
                        case "dark":
                            document.body.setAttribute("data-topbar", "dark");
                            document.body.removeAttribute(
                                "data-layout-scrollable"
                            );
                            break;
                        case "light":
                            document.body.setAttribute("data-topbar", "light");
                            document.body.removeAttribute(
                                "data-layout-size",
                                "boxed"
                            );
                            document.body.removeAttribute(
                                "data-layout-scrollable"
                            );
                            break;
                        case "colored":
                            document.body.setAttribute(
                                "data-topbar",
                                "colored"
                            );
                            document.body.removeAttribute(
                                "data-layout-size",
                                "boxed"
                            );
                            break;
                        default:
                            document.body.setAttribute("data-topbar", "dark");
                            break;
                    }
                }
            },
        },
        width: {
            immediate: true,
            handler(newVal, oldVal) {
                if (newVal !== oldVal) {
                    switch (newVal) {
                        case "boxed":
                            document.body.setAttribute(
                                "data-layout-size",
                                "boxed"
                            );
                            break;
                        case "fluid":
                            document.body.setAttribute(
                                "data-layout-mode",
                                "fluid"
                            );
                            document.body.removeAttribute("data-layout-size");
                            break;
                        case "scrollable":
                            document.body.setAttribute(
                                "data-layout-scrollable",
                                "true"
                            );
                            document.body.removeAttribute("data-layout-mode");
                            document.body.removeAttribute("data-layout-size");
                            break;
                        default:
                            document.body.setAttribute(
                                "data-layout-mode",
                                "fluid"
                            );
                            break;
                    }
                }
            },
        },
    },
};
</script>

<template>
    <header id="page-topbar">
        <div class="navbar-header">
            <div class="d-flex">
                <!-- LOGO -->
                <div class="navbar-brand-box text-left">
                    <router-link to="/" class="logo logo-dark">
                        <span class="logo-sm">
                            <img src="@/assets/images/logo/g-white.png" style="height:45px;"/>
                        </span>
                        <span class="logo-lg">
                            <img src="@/assets/images/logo/g-white.png" style="height:45px;"/>
                        </span>
                    </router-link>

                    <router-link to="/" class="logo-light">
                        <span class="logo-sm">
                            <!-- <img src="@/assets/images/logo/g-white.png" style="height:45px;"/> -->
                        </span>
                        <span
                            class="
                                logo-lg
                                d-flex
                                align-items-end
                            "
                        >
                            <div class="d-flex align-items-end">
                                <h4 class="logo-lg text-white mt-2 mb-0"><img src="@/assets/images/logo/g-white.png" style="height:50px;"/></h4>
                            </div>
                            <div class="d-none d-sm-inline-block ms-2">
                                <h4 class="mb-0 font-size-22" style="line-height:22px;">Hyper Cirrus</h4>
                                <small class="text-white text-truncate">{{$store.state.data.campus.campusName}} | {{$store.state.data.deliveryUnit.name}}</small>
                            </div>
                        </span>
                    </router-link>
                </div>
                <button
                    id="toggle"
                    type="button"
                    class="btn btn-sm me-2 font-size-16 d-lg-none header-item"
                    @click="toggleMenu"
                >
                    <i class="fa fa-fw fa-bars"></i>
                </button>
            </div>
            <div class="d-flex">
                <b-dropdown
                    class="d-inline-block d-lg-none ms-2"
                    variant="black"
                    menu-class="dropdown-menu-lg p-0 dropdown-menu-end"
                    toggle-class="header-item noti-icon"
                    right
                >
                    <template v-slot:button-content>
                        <i class="mdi mdi-magnify"></i>
                    </template>

                    <form class="p-3">
                        <div class="form-group m-0">
                            <div class="input-group">
                                <input
                                    type="text"
                                    class="form-control"
                                    placeholder="Search ..."
                                    aria-label="Recipient's username"
                                />
                                <div class="input-group-append">
                                    <button
                                        class="btn btn-primary"
                                        type="submit"
                                    >
                                        <i class="mdi mdi-magnify"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </b-dropdown>
                <div
                    class="dropdown d-none d-lg-inline-block ms-1"
                    title="Set Cycle"
                >
                    <button
                        type="button"
                        class="btn header-item noti-icon"
                        @click="setCycleModal"
                    >
                        {{ setCycle }}
                    </button>
                </div>

                <div class="dropdown d-none d-lg-inline-block ms-1">
                    <button
                        type="button"
                        class="btn header-item noti-icon"
                        @click="initFullScreen"
                    >
                        <i class="bx bx-fullscreen"></i>
                    </button>
                </div>
                <b-dropdown
                    menu-class="dropdown-menu-lg p-0 dropdown-menu-end"
                    toggle-class="header-item noti-icon"
                    variant="black"
                >
                    <template v-slot:button-content>
                        <i
                            class="bx bx-bell"
                            :class="{
                                'bx-tada':
                                    $store.state.notification.notifCount > 0,
                            }"
                        ></i>
                        <span
                            class="badge bg-danger rounded-pill"
                            v-if="$store.state.notification.notifCount > 0"
                            >{{ $store.state.notification.notifCount }}</span
                        >
                    </template>

                    <div class="p-3">
                        <div class="row align-items-center">
                            <div class="col">
                                <h6
                                    class="m-0"
                                    :class="{
                                        'text-center':
                                            $store.state.notification
                                                .notifications.length == 0,
                                    }"
                                >
                                    {{
                                        $store.state.notification.notifications
                                            .length > 0
                                            ? "Notifications"
                                            : "There's no notifications"
                                    }}
                                </h6>
                            </div>
                            <div
                                class="col-auto"
                                v-if="
                                    $store.state.notification.notifications
                                        .length > 0
                                "
                            >
                                <a
                                    href="javascript:void(0)"
                                    class="small"
                                    @click="clearAllNotification"
                                    >Clear All</a
                                >
                            </div>
                        </div>
                    </div>
                    <simplebar style="max-height: 230px">
                        <a
                            href="javascript: void(0);"
                            class="text-reset notification-item"
                            :class="{
                                'notification-item': x.status !== 'Seen',
                            }"
                            v-for="(x, index) in this.$store.state.notification
                                .notifications"
                            :key="x.id"
                        >
                            <div
                                class="media position-relative"
                                @click="seenNotif(x)"
                            >
                                <div class="avatar-xs me-3">
                                    <span
                                        class="
                                            avatar-title
                                            bg-primary
                                            rounded-circle
                                            font-size-16
                                        "
                                    >
                                        <i class="bx bx-file"></i>
                                    </span>
                                </div>
                                <div class="media-body">
                                    <h6 class="mt-0 mb-1">
                                        {{ x.title }}
                                    </h6>
                                    <div class="font-size-12 text-muted">
                                        <p class="mb-1">
                                            {{ x.description }}
                                        </p>
                                        <p class="mb-1">
                                            <i
                                                class="mdi mdi-clock-outline"
                                            ></i>
                                            {{ diffDate(x.dateTime) }} |
                                            {{ x.status }}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div
                                class="
                                    d-flex
                                    position-absolute
                                    align-items-center
                                    justify-content-center
                                    arrow-notif
                                "
                                :class="{ active: x.showDeleteOption }"
                                @click="longPress(!x.showDeleteOption, index)"
                            >
                                <i
                                    class="
                                        bx bx-chevron-left
                                        font-size-20
                                        rotate
                                    "
                                    :class="{
                                        'rotate-180': x.showDeleteOption,
                                    }"
                                ></i>
                                <div
                                    class="
                                        d-flex
                                        align-items-center
                                        justify-content-center
                                        bg-danger bg-gradient
                                        text-light
                                        delete-notif
                                    "
                                    @click="deleteNotif(x.id)"
                                >
                                    <i
                                        class="bx bx-trash"
                                        v-if="x.showDeleteOption"
                                    ></i>
                                </div>
                            </div>
                        </a>
                    </simplebar>
                </b-dropdown>
                <b-dropdown menu-class="dropdown-menu-end" variant="black" toggle-class="header-item">
                    <template v-slot:button-content>
                        <span
                            class="
                                rounded-circle
                                header-profile-user
                                bg-success bg-gradient
                                text-white
                                px-1
                                border border-3 border-secondary
                            "
                            >{{ username.slice(0, 2).toUpperCase() }}</span
                        >
                        <span class="d-none d-xl-inline-block ms-1">{{
                            username
                        }}</span>
                        <i
                            class="
                                mdi mdi-chevron-down
                                d-none d-xl-inline-block
                            "
                        ></i>
                    </template>
                    <b-dropdown-item
                        class="d-block"
                        href="/account-settings"
                    >
                        <i
                            class="bx bx-wrench font-size-16 align-middle me-1"
                        ></i>
                        Account Settings
                    </b-dropdown-item>
                    <b-dropdown-divider></b-dropdown-divider>
                    <a href="/logout" class="dropdown-item text-danger">
                        <i
                            class="
                                bx bx-power-off
                                font-size-16
                                align-middle
                                me-1
                                text-danger
                            "
                        ></i>
                        {{ $t("navbar.dropdown.henry.list.logout") }}
                    </a>
                </b-dropdown>

                <!-- <div class="dropdown d-inline-block">
          <button
            type="button"
            class="btn header-item noti-icon right-bar-toggle toggle-right"
            @click="toggleRightSidebar"
          >
            <i class="bx bx-cog bx-spin toggle-right"></i>
          </button>
        </div> -->
            </div>
        </div>
        <set-cycle @changeCycle="changeCycle"></set-cycle>
    </header>
</template>
