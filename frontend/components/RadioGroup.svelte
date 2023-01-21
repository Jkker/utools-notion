<script lang="ts">
  interface RadioItem {
    label: string;
    value: any;
    icon?: string;
  }
  export let options: RadioItem[] = [];
  export let value;
  export let onChange: (value: any) => void = () => {};
</script>

<div class="radio-group">
  <slot />
  <div class="radio-btn-container">
    {#each options as item (item.value)}
      <button
        class="round-btn active"
        on:click={() => {
          value = item.value;
          onChange(item.value);
        }}
        class:active={value === item.value}
      >
        {#if item.icon}
          {@html item.icon}
        {/if}
        {item.label}
      </button>
    {/each}
  </div>
</div>

<style>
  .radio-group {
    width: 100%;
    display: flex;
    gap: 1rem;
    align-items: center;
    padding: 0.25rem;
    transition: all 0.15s ease-in-out;
    border-radius: var(--radius);
    justify-content: space-between;
    user-select: none;
  }
  .radio-group .round-btn {
    border-radius: 0;
    margin: 0;
  }
  .radio-group .round-btn:first-child {
    padding-left: 12px;
    border-radius: 32px 0 0 32px;
  }
  .radio-group .round-btn:last-child {
    border-radius: 0 32px 32px 0;
    padding-right: 12px;
  }

  /* button:first-child {
    border-radius: var(--radius) 0 0 var(--radius);
  }
  button:last-child {
    border-radius: 0 var(--radius) var(--radius) 0;
  } */
  button.active {
    /* background-color: var(--bg-active-hover); */
    /* background: var(--bg-active); */
  }
  .radio-btn-container {
    display: flex;
    gap: 0;
  }
</style>
