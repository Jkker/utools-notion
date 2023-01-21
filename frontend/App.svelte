<script lang="ts">
  import Fuse from "fuse.js";
  import debounce from "lodash.debounce";
  import "modern-css-reset/dist/reset.min.css";
  import { onMount } from "svelte";
  import message from "../backend/shared/message";
  import Item from "./app/Item.svelte";
  import Navbar from "./app/Navbar.svelte";
  import Setting from "./app/Setting.svelte";
  import ContextMenu from "./components/ContextMenu.svelte";
  import Loading from "./components/Loading.svelte";
  import config, { init as initConfig } from "./store/config";

  let query = "";
  let items: ResultItem[] = [];
  let recent: ResultItem[] = [];
  let loading = true,
    isSettingOpen = false;
  let userInfo: UserInfo;

  const openSetting = () => {
    isSettingOpen = true;
  };

  $: closeSetting = async () => {
    isSettingOpen = false;
    query = "";
    await getInitialItems();
  };

  $: getSearchResults = async (query: string) => {
    const recentResult = new Fuse(recent, {
      keys: ["title"],
      includeScore: true,
      threshold: 0.1,
    })
      .search(query)
      ?.map(({ item, score }) => ({ ...item, score }));
    if (recentResult.length > 0) {
      items = recentResult;
    }

    const searchResult = await window.search(query, $config);

    const tmpItems = recentResult.slice(0, 3);

    const ids = tmpItems?.map((i) => i.id);

    searchResult.forEach((item) => {
      if (!ids.includes(item.id)) {
        // @ts-ignore
        tmpItems.push(item);
      }
    });
    items = [...tmpItems];
  };

  $: getInitialItems = async () => {
    loading = true;
    recent = await window.getRecentPageVisits($config);
    userInfo = await window.getUserInfo($config);
    if ($config.initialView === "recent") items = [...recent];
    else if ($config.initialView === "favorites")
      items = [...userInfo.bookmarks];
    else items = [];
    loading = false;
  };

  const setQuery = debounce(async ({ text }: { text: string }) => {
    query = text;
    loading = true;
    if (query.trim()) {
      await getSearchResults(query);
    } else {
      await getInitialItems();
    }
    loading = false;
  }, 100);

  const toggleConfig = (key: keyof typeof $config) =>
    debounce(async () => {
      // @ts-ignore
      $config[key] = !$config[key] as any;

      // Reload if search config changed
      if (query.trim())
        if (["navigableBlockContentOnly"].includes(key))
          await getSearchResults(query);
    });

  const handleKeydown = (event: KeyboardEvent) => {
    if (isSettingOpen) return;
    const { key } = event;
    const current = document.activeElement as HTMLElement;

    if (key === "Enter" || key === "Space") {
      if (current) {
        current.click();
        window.utools.hideMainWindow();
      }
      return;
    }

    // we're only interested in handling up & down arrow keys
    if (!["ArrowDown", "ArrowUp", "Tab"].includes(key)) {
      if (
        key.length === 1 &&
        key.match(/^[a-z0-9]+$/i) &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey
      ) {
        if (current) current.blur();
        window.utools.subInputFocus();
        window.utools.setSubInputValue(key);
      }

      return;
    }

    event.preventDefault();

    // currently focused element (if any)
    // get our collection of list elements and turn it into an actual array
    const items = [...document.getElementsByClassName("item")] as HTMLElement[];
    // attempt to match the currently focused element to an index in our array of list elements
    const currentIndex = items.indexOf(current);
    // index of the list element to be newly focused
    let newIndex = 0;

    // if the currently focused element was NOT a list item, then default to focusing the first item in the list (index 0)
    if (currentIndex === -1) {
      window.utools.subInputBlur();
      // otherwise, the currently focused element is an item in our list
    } else {
      // if the UP key has been pressed, set the new index to the current index minus 1, plus the list size, modulo the list size
      if (key === "ArrowUp" || (key === "Tab" && event.shiftKey)) {
        if (currentIndex === 0) {
          current.blur();
          window.utools.subInputFocus();
          return;
        } else if (key === "Tab" || key === "ArrowUp")
          newIndex = (currentIndex + items.length - 1) % items.length;
        // if the DOWN key has been pressed, set the new index to the current index plus 1, modulo the list size
      } else {
        newIndex = (currentIndex + 1) % items.length;
      }
    }

    // blur (= unfocus) the currently focused element (whether it's a list element or not)
    current.blur();
    // focus the list element at the computed index
    items[newIndex].focus();
    items[newIndex].scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  onMount(async () => {
    if ("utools" in window) {
      window.addEventListener("keydown", handleKeydown);
      window.utools.onPluginEnter(async () => {
        window.utools.setSubInput(setQuery as any, "Search Notion", true);
      });
      window.utools.onPluginOut(() => {
        window.utools.setSubInputValue("");
      });

      if (await initConfig()) await getInitialItems();
      else openSetting();
    }
  });

  $: highlight = (text: string, query: string) =>
    query
      ? text.replace(new RegExp(`(${query})`, "gi"), "<strong>$1</strong>")
      : text;
</script>

<main>
  <Setting bind:isOpen={isSettingOpen} close={closeSetting} />
  <Navbar {query} {getInitialItems} {openSetting} {toggleConfig} />
  <ContextMenu />
  {#if items && items.length === 0}
    {#if query.length}
      <div class="message">
        {#if loading}<Loading />
        {:else}
          {message.noResult}
        {/if}
      </div>
    {/if}
  {:else}
    <ul class={!query.length ? "recent" : "search"}>
      {#each items as item (item.id)}
        <Item {item} {query} {highlight} />
      {/each}
    </ul>
  {/if}
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
  }
  .message {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100vw;
    padding: 1rem;
    flex: 1 1 auto;
  }
  .message {
    margin: 0px;
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
    color: var(--text-desc);
  }
</style>
