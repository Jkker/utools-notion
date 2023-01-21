<script lang="ts">
  export let isOpen: boolean;
  export let close;
  export let disableClose: boolean = false;
  import { fade } from "svelte/transition";
  import { closeIcon } from "../app/icons";

  // when isOpen changes
  $: {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.height = "100vh";
    } else {
      document.body.style.overflow = "auto";
      document.body.style.height = "auto";
    }
  }
</script>

{#if isOpen}
  <div
    class="backdrop"
    transition:fade={{
      duration: 125,
      delay: 0,
      easing: (t) => t * t,
    }}
  >
    <div class="dialog">
      <button
        on:click={close}
        class="close-btn"
        title="Close"
        disabled={disableClose}>{@html closeIcon}</button
      >
      <slot />
    </div>
  </div>
{/if}

<style>
  .dialog {
    position: relative;
    background-color: var(--background);
    border-radius: var(--radius);
    overflow: auto;
    box-shadow: var(--shadow);
    color: var(--text);
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    min-width: 480px;
    max-width: 768px;
    max-height: 90vh;
  }
  .backdrop {
    position: absolute;
    z-index: 1000;
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(5px);
    height: 100vh;
    width: 100vw;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .close-btn {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: transparent;
    border: none;
    padding: 0.5rem;
    border-radius: var(--radius);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    font-size: 1.5rem;
  }
  .close-btn:hover {
    background: var(--bg-hover);
  }
  .close-btn:active {
    background: var(--bg-active);
  }
  :global(.dialog h1) {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    user-select: none;
  }
</style>
