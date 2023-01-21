<!--
Github @dukenmarga, July 2022
Context Menu is small menu that displayed when user right-click the mouse on browser.
Think of it as a way to show Refresh option on Microsoft Windows when right-click on desktop.
Known bug:
    - If the browser loads the content for the first time, showMenu set to false.
    Hence, we cannot get menu.h and menu.y dimension, since context menu has not been available at DOM.
    The first right click will not shown properly when right-click occurs around the edge (bottom part
    and right part) of the browser.

Inspired from: Context Menu https://svelte.dev/repl/3a33725c3adb4f57b46b597f9dade0c1?version=3.25.0
-->
<script lang="ts">
  // pos is cursor position when right click occur
  let pos = { x: 0, y: 0 };
  // menu is dimension (height and width) of context menu
  let menu = { h: 0, w: 0 };
  // browser/window dimension (height and width)
  let browser = { h: 0, w: 0 };
  // showMenu is state of context-menu visibility
  interface MenuItem {
    name: string;
    label: string;
    icon: string;
    onClick: () => void;
    class: string;
  }

  export let showMenu = false;
  // to display some text

  let menuItems: MenuItem[] = [];

  export function openContextMenu(e: MouseEvent, items: MenuItem[]) {
    showMenu = true;
    browser = {
      w: window.innerWidth,
      h: window.innerHeight,
    };
    pos = {
      x: e.clientX,
      y: e.clientY,
    };
    // If bottom part of context menu will be displayed
    // after right-click, then change the position of the
    // context menu. This position is controlled by `top` and `left`
    // at inline style.
    // Instead of context menu is displayed from top left of cursor position
    // when right-click occur, it will be displayed from bottom left.
    if (browser.h - pos.y < menu.h) pos.y = pos.y - menu.h;
    if (browser.w - pos.x < menu.w) pos.x = pos.x - menu.w;
    menuItems = items;
  }

  function closeContextMenu() {
    // To make context menu disappear when
    // mouse is clicked outside context menu
    showMenu = false;
  }
  if (typeof window !== 'undefined') {
    window.openContextMenu = openContextMenu;
    window.closeContextMenu = closeContextMenu;
  }

  function getContextMenuDimension(node) {
    // This function will get context menu dimension
    // when navigation is shown => showMenu = true
    let height = node.offsetHeight;
    let width = node.offsetWidth;
    menu = {
      h: height,
      w: width,
    };
  }
</script>

{#if showMenu}
  <nav
    use:getContextMenuDimension
    style="top:{pos.y}px; left:{pos.x}px"
    id="context-menu"
  >
    {#each menuItems as item}
      {#if item.name == 'hr'}
        <hr />
      {:else}
        <button
          on:click={item.onClick}
          on:contextmenu|preventDefault|stopPropagation
        >
          {#if item.icon}
            <i class="icon">{@html item.icon}</i>
          {/if}
          {item.label}
        </button>
      {/if}
    {/each}
  </nav>
{/if}

<svelte:window on:click={closeContextMenu} />

<style>
  #context-menu {
    display: flex;
    flex-direction: column;
    position: fixed;
    min-width: 168px;
    max-width: 256px;
    background-color: var(--background);
    border-radius: var(--radius);
    overflow: hidden;
    padding: 0.25rem;
    box-shadow: var(--shadow);
    color: var(--text);
  }
  #context-menu button {
    all: unset;
    font-size: 14px;
    padding: 0.25rem 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    user-select: none;
    min-height: 28px;
    transition: all 0.15s ease-in-out;
  }

  #context-menu button:hover {
    background-color: var(--bg-hover);
  }
  #context-menu button:active {
    background-color: var(--bg-active);
  }

  #context-menu hr {
    border: 0;
    height: 1px;
    background-color: var(--border);
  }
</style>
