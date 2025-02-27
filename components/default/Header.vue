<template>
    <header class="allCenter relative">
        <button class="hamburger allCenter absolute" @click="toggleDrawer" aria-label="Open or close menu">
            <Icon size="1.5rem" name="tabler:menu-2" />
        </button>
        <NuxtLink :to="routes.HOME">
            <NuxtImg class="logo" src="/images/Logo-We-Glam.svg" alt="Logo We Glam" />
        </NuxtLink>
        <Drawer :visible="drawerMenu" :modal="true" :dismissable="true" :closeOnEscape="true" @hide="closeDrawer">
            <template #header>
                <p>We Glam</p>
                <button @click="closeDrawer" class="closeButton allCenter">
                    <Icon name="tabler:plus" weight="100" class="text-black" />
                </button>
            </template>
            <nav class="column">
                <NuxtLink :to="link.route" v-for="(link, index) in menu" :key="index" class="navLink">
                    <Icon :name="`tabler:cards`" />
                    {{ link.label }}
                </NuxtLink>
            </nav>
            <button @click="signOut()" class="logOut text-black">
                <Icon :name="`tabler:logout`" class="text-black" />
                Cerrar sesión
            </button>
        </Drawer>
    </header>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRoute } from 'vue-router';
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES';

const route = useRoute();
const router = useRouter();
const drawerMenu = ref(false);
const routes = ROUTE_NAMES;
const loggingOut = ref(false);

const menu = [
    {
        label: "Productos",
        route: ROUTE_NAMES.HOME,
    },
    {
        label: "Variables generales",
        route: ROUTE_NAMES.VARIABLES,
    },
];

const toggleDrawer = () => {
    drawerMenu.value = !drawerMenu.value;
};

const closeDrawer = () => {
    drawerMenu.value = false;
};

const handleKeyDown = (event) => {
    if (event.key === "Escape" && drawerMenu.value) {
        closeDrawer();
    }
};

const handleOutsideClick = (event) => {
    const drawer = document.querySelector(".p-drawer");
    const hamburger = document.querySelector(".hamburger");
    if (
        drawerMenu.value &&
        drawer &&
        !drawer.contains(event.target) &&
        event.target !== hamburger &&
        !hamburger.contains(event.target)
    ) {
        closeDrawer();
    }
};

onMounted(() => {
    document.addEventListener("click", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
});

onBeforeUnmount(() => {
    document.removeEventListener("click", handleOutsideClick);
    document.removeEventListener("keydown", handleKeyDown);
});

watch(() => route.path, () => {
    closeDrawer();
});

async function signOut() {
    if (loggingOut.value) return;

    loggingOut.value = true;

    try {
        const supabase = useSupabaseClient();
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        localStorage.removeItem('lastLoginEmail');

        router.push(ROUTE_NAMES.LOGIN);
    } catch (error) {
        console.error('Error al cerrar sesión:', error.message);
    } finally {
        loggingOut.value = false;
    }
}
</script>

<style>
.p-drawer {
    width: 65% !important;
    max-width: 20rem;
    gap: 1.5rem;
    background: var(--primary-color) !important;
    box-shadow: 8px 0px 12px 0px #00000040 !important;
    transition: all 0.3s !important;
    padding: 1.5rem 0.75rem !important;
}

.p-drawer-header {
    padding: 0 0.75rem !important;
}

.p-drawer-header p {
    font-weight: 500;
}

.p-drawer-header .p-button-text.p-button-secondary,
.p-drawer-header .p-icon {
    display: none;
}

.p-drawer-content {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.closeButton {
    background: none;
    border: none;
    font-weight: 100;
    cursor: pointer;
}

.closeButton span {
    transform: rotate(45deg);
    font-size: 1.5rem !important;
}

.logOut {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: none;
    border: none;
    font-size: 0.875rem;
    font-weight: 300;
    transition: all 0.3s;
    cursor: pointer;
    padding: 0.75rem;
}

@media (width >=992px) {
    .logOut {
        font-size: 1rem;
    }

    .logOut span {
        font-size: 1.25rem !important;
    }
}
</style>

<style scoped>
.hamburger {
    left: 1.25rem;
    background: none;
    border: none;
    color: var(--color-mid-dark-blue);
    cursor: pointer;
}

.navLink {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: var(--black-color);
    font-size: 0.875rem;
    text-decoration: none;
    padding: 0.875rem 0.75rem;
}

@media (width >=992px) {
    .hamburger {
        left: 5.625rem;
    }

    .hamburger span {
        font-size: 2rem !important;
    }

    .navLink {
        font-size: 1rem;
    }

    .navLink span {
        font-size: 1.25rem !important;
    }
}
</style>