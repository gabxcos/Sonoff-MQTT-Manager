<main>
    <slot></slot>
</main>

<style>
    main {
        /* COMMON */
		position: relative;
		background-color: white;
		padding: 2em;
		margin: 0 auto;
		box-sizing: border-box;
        /* DASHBOARD ver. */
        width: 100%;
		flex-direction: column;
		-ms-flex-align: start;
		-ms-flex-pack: start;
		-webkit-box-align: start;
		align-items: start;
		-webkit-box-pack: center;
		justify-content: center;
	}
</style>