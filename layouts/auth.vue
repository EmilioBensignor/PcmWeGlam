<template>
    <div>
        <ClientOnly>
            <AuthHeader />
            <slot />
        </ClientOnly>
    </div>
</template>
