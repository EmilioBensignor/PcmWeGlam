<template>
	<div class="layout">
		<ClientOnly>
			<DefaultHeader />
			<slot />
			<DefaultFooter />
		</ClientOnly>
	</div>
</template>
