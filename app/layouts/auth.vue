<template>
    <div class="layout">
        <ClientOnly>
            <AuthHeader />
            <slot />
            <DefaultFooter />
        </ClientOnly>
    </div>
</template>