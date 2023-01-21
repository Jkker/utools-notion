<script lang="ts">
  import message from "../../backend/shared/message";

  import config from "../store/config";
  import {
    browserIcon,
    closeIcon,
    defaultPageIcon,
    desktopIcon,
    linkIcon,
    titleIcon,
  } from "./icons";

  export let item: ResultItem;
  export let query: string;
  export let highlight: (text: string, query: string) => string;

  const webUrl = `https://www.notion.so/${item.id}`;
  const appUrl = `notion://www.notion.so/${item.id}`;

  const contextMenu = [
    {
      label: message.openInBrowser,
      onClick: () => window.utools.shellOpenExternal(webUrl),
      icon: browserIcon,
    },
    {
      label: message.useDesktopApp,
      onClick: () => window.utools.shellOpenExternal(appUrl),
      icon: desktopIcon,
    },
    {
      label: message.copyLink,
      onClick: () => {
        window.utools.copyText(webUrl);
        window.utools.showNotification(message.link + message.copySuccess);
      },
      icon: linkIcon,
    },
    {
      label: message.copyTitle,
      onClick: () => {
        window.utools.copyText(item.title);
        window.utools.showNotification(message.title + message.copySuccess);
      },
      icon: titleIcon,
    },
    {
      label: message.close,
      onClick: () => window.closeContextMenu(),
      icon: closeIcon,
    },
  ];
</script>

<button
  on:click={() =>
    window.utools.shellOpenExternal($config.useDesktopApp ? appUrl : webUrl)}
  on:contextmenu|preventDefault={(event) => {
    event.stopPropagation();
    window.openContextMenu(event, contextMenu);
  }}
  class="item"
>
  <div class="item-icon-container">
    {#await window.getIcon(item.icon, $config)}
      <div class="icon" />
    {:then icon}
      {#if icon}
        {#if icon.startsWith("http") || icon.startsWith("data")}
          <!-- URI -->
          <img src={icon} alt={item.icon} class="icon" />
        {:else}
          <!-- Emoji -->
          <div class="icon">{icon}</div>
        {/if}
      {:else}
        {@html defaultPageIcon}
      {/if}
    {:catch}
      {@html defaultPageIcon}
    {/await}
  </div>
  <div class="item-content-container" style="">
    <div class="header-row">
      <h3 class="item-title">{@html highlight(item.title, query)}</h3>
      {#if item.visitedAt}
        <p>{item.visitedAt}</p>
      {/if}
    </div>
    <ul class="breadcrumbs">
      {#if !item.breadcrumbs.length}
        <li>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 64 64"
            fill="currentColor"
            height="1.2em"
            width="1.2em"
            ><path
              fill-rule="evenodd"
              d="M48.01 10.02v0c1.1 0 2 .89 2 2v8.52 0c-.01.41-.34.74-.76.74 -.2-.01-.39-.08-.53-.22l-6.14-6.14v0c-.38-.38-.59-.89-.59-1.42v-1.51 0c0-1.11.89-2 2-2Zm0 44h-9v0c-1.11 0-2-.9-2-2v-12 0c0-1.11-.9-2-2-2h-6v0c-1.11 0-2 .89-2 2v12 0c0 1.1-.9 2-2 2h-9v0c-1.11 0-2-.9-2-2V34h-3.99 -.001c-1.11-.01-2.01-.9-2-2.01 0-.54.21-1.04.58-1.42l21.99-22.01h0c.78-.79 2.04-.79 2.82-.01 0 0 0 0 0 0l21.994 22v0c.78.78.78 2.04-.01 2.82 -.38.37-.89.58-1.42.58h-4v18.01 0c0 1.1-.9 2-2 2Z"
            /></svg
          >
        </li>
      {:else}
        {#each item.breadcrumbs as breadcrumb}
          <li>
            {#if typeof breadcrumb === "string"}
              {@html highlight(breadcrumb, query)}
            {:else if typeof breadcrumb === "object"}
              <!-- {#if breadcrumb.icon}
                <img src={breadcrumb.icon} alt="" />
              {/if} -->
              {@html highlight(breadcrumb.title, query)}
            {/if}
          </li>
        {/each}
      {/if}
    </ul>
  </div>
</button>

<style>
  .item {
    all: unset;
    cursor: pointer;
    display: flex;
    align-items: center;
    line-height: 120%;
    width: 100%;
    user-select: none;
    min-height: 36px;
    font-size: 14px;
    padding-top: 8px;
    padding-bottom: 8px;
    box-shadow: var(--bg-hover) 0px 1px 0px;
    transition: all 0.15s ease-in-out;
  }
  .item:hover {
    background: var(--bg-hover);
  }
  .item:focus {
    outline: none;
    background: var(--bg-active);
  }
  .item:active {
    background: var(--bg-active);
  }

  .item-icon-container {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 10px;
    margin-right: 4px;
    margin-top: 1px;
    align-self: flex-start;
    font-size: 20px;
  }
  .item-content-container {
    margin-left: 10px;
    margin-right: 6px;
    min-width: 0px;
    width: 100%;
  }
  .item-content-container .header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 2px;
    color: var(--text-desc);
    font-size: 1rem;
  }

  .breadcrumbs {
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 1px;
    display: flex;
    font-size: 12px;
    color: var(--text-sub);
    width: 100%;
  }
  .breadcrumbs li {
    height: 1rem;
    line-height: 1rem;
    overflow: hidden;
    text-overflow: ellipsis;
    display: flex;
    white-space: pre;
  }
  .breadcrumbs li:not(:last-child)::after {
    content: "/";
    color: var(--text-sub);
    /* margin: 0 4px; */
    margin-right: 4px;
    margin-left: 2px;
  }
  .item h3 {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 500;
    line-height: 20px;
    color: var(--text-desc);
  }
  .recent .item h3 {
    color: var(--text);
  }
</style>
