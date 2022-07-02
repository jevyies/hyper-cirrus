<script>
import i18n from "../i18n";
import simplebar from "simplebar-vue";

/**
 * Nav-bar Component
 */
export default {
    data() {
        return {
            username: JSON.parse(localStorage.getItem("user")).userName,
            alert: {
                type: "",
                message: "",
            },
        };
    },
    components: { simplebar },
    computed: {
        setCycle: {
            get() {
                return this.$store.getters["data/getCycle"];
            },
            set(newValue) {
                return newValue;
            },
        },
    },
    mounted() {
        this.$store.dispatch(
            "notification/GetNotif",
            this.$store.state.data.office.id
        );
    },
    methods: {
        toggleMenu() {
            this.$parent.toggleMenu();
        },
        toggleRightSidebar() {
            this.$parent.toggleRightSidebar();
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
};
</script>

<template>
    <header id="page-topbar">
        <div class="navbar-header">
            <div class="d-flex">
                <!-- LOGO -->
                <div class="navbar-brand-box">
                    <router-link tag="a" to="/" class="logo logo-dark">
                        <span class="logo-sm">
                            <img
                                src="@/assets/images/logo.svg"
                                alt
                                height="22"
                            />
                        </span>
                        <span class="logo-lg">
                            <img
                                src="@/assets/images/logo-dark.png"
                                alt
                                height="17"
                            />
                        </span>
                    </router-link>

                    <router-link tag="a" to="/" class="logo logo-light">
                        <span class="logo-sm text-white font-size-22">
                            <!-- <img
                                src="@/assets/images/logo-light.svg"
                                alt
                                height="22"
                            /> -->
                            G
                        </span>
                        <span class="logo-lg text-white font-size-22">
                            <!-- <img
                                src="@/assets/images/logo-light.png"
                                alt
                                height="19"
                            /> -->
                            GovRMS
                        </span>
                    </router-link>
                </div>

                <button
                    id="vertical-menu-btn"
                    type="button"
                    class="btn btn-sm px-3 font-size-16 header-item"
                    @click="toggleMenu"
                >
                    <i class="fa fa-fw fa-bars"></i>
                </button>

                <!-- App Search-->
                <form class="app-search d-none d-lg-block">
                    <div class="position-relative">
                        <input
                            type="text"
                            class="form-control"
                            :placeholder="$t('navbar.search.text')"
                        />
                        <span class="bx bx-search-alt"></span>
                    </div>
                </form>
            </div>
            <div class="d-flex flex-column">
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
                <b-dropdown variant="black" toggle-class="header-item">
                    <template v-slot:button-content>
                        <!-- <img
                            class="rounded-circle header-profile-user"
                            src="@/assets/images/users/avatar-1.jpg"
                            alt="Header Avatar"
                        /> -->
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
                    <!-- item-->
                    <b-dropdown-item>
                        <router-link tag="span" to="/contacts/profile">
                            <i
                                class="
                                    bx bx-user
                                    font-size-16
                                    align-middle
                                    me-1
                                "
                            ></i>
                            Profile
                        </router-link>
                    </b-dropdown-item>
                    <b-dropdown-item
                        class="d-block"
                        href="javascript: void(0);"
                    >
                        <i
                            class="bx bx-wrench font-size-16 align-middle me-1"
                        ></i>
                        Settings
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
                        Logout
                    </a>
                </b-dropdown>
            </div>
            <small>{{$store.state.data.cycle}}</small>
            </div>
        </div>
    </header>
</template>
