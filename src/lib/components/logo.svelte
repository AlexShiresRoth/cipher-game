<script lang="ts">
	export let size: 'nav' | 'splash' | 'footer' = 'nav';
</script>

<img
	class="cipher-logo cipher-logo-{size}"
	src="/logo.svg"
	alt="Cipher logo"
	width="40"
	height="44"
/>

<style>
	.cipher-logo {
		display: block;
		flex-shrink: 0;
		height: auto;
	}
	.cipher-logo-nav {
		width: 40px;
	}
	.cipher-logo-splash {
		width: 96px;
		margin-bottom: 24px;
	}
	.cipher-logo-footer {
		width: 24px;
	}
	@media (max-width: 600px) {
		.cipher-logo-nav {
			width: 32px;
		}
	}
</style>
