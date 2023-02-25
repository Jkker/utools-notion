<script lang="ts">
  import Fuse from 'fuse.js';
  import debounce from 'lodash.debounce';
  import 'modern-css-reset/dist/reset.min.css';
  import { onMount } from 'svelte';
  import message from '../backend/shared/message';
  import Item from './app/Item.svelte';
  import Navbar from './app/Navbar.svelte';
  import Setting from './app/Setting.svelte';
  import ContextMenu from './components/ContextMenu.svelte';
  import Loading from './components/Loading.svelte';
  import config, {
    load as loadConfig,
    isValid as isConfigValid,
  } from './store/config';

  const DEBOUNCE_TIME = 250;

  let query = '';

  let results: ResultItem[] = [];
  let recentItems: ResultItem[] = [];
  let bookmarks: ResultItem[] = [];

  let bookmarkedIds: Set<string> = new Set();

  let isLoading = true,
    isSettingOpen = false;
  let userInfo: UserInfo;

  const openSetting = () => {
    isSettingOpen = true;
  };

  const closeSetting = async () => {
    isSettingOpen = false;
    query = '';
    await loadInitialItems();
  };

  const searchList = (items: ResultItem[], q: string): ResultItem[] => {
    return new Fuse(items, {
      keys: ['title'],
      includeScore: true,
      threshold: 0.1,
    })
      .search(q)
      .slice(0, 3)
      .map(({ item, score }) => ({ ...item, score }));
  };

  const search = debounce(async (query: string) => {
    console.log('search', query);
    const recentResults = searchList(recentItems, query);
    if (recentResults.length > 0) results = recentResults;
    else isLoading = true;
    const recentResultIds = new Set(recentResults.map((item) => item.id));

    const remoteResults = await window.search(query, $config);

    results = [
      ...recentResults,
      ...remoteResults.filter((item) => !recentResultIds.has(item.id)),
    ];
    isLoading = false;
  }, DEBOUNCE_TIME);

  const loadInitialItems = debounce(async () => {
    console.log('loadInitialItems');
    isLoading = true;
    userInfo = await window.getUserInfo($config);
    console.log(
      `🚀 ~ file: App.svelte:72 ~ loadInitialItems ~ userInfo:`,
      userInfo
    );

    if (!userInfo) {
      openSetting();
      return;
    }

    recentItems = (await window.getRecentPageVisits($config)) ?? [];
    bookmarks = userInfo?.bookmarks ?? [];
    bookmarkedIds = new Set(bookmarks.map((item) => item.id));

    isLoading = false;
  }, DEBOUNCE_TIME);

  const setQuery = async ({ text }: { text: string }) => {
    query = text;
    if (query) await search(query);
    else await loadInitialItems();
  };

  const toggleConfig = (key: keyof typeof $config) =>
    debounce(async () => {
      // @ts-ignore
      $config[key] = !$config[key] as any;

      // Reload if search config changed
      if (query.trim())
        if (['navigableBlockContentOnly'].includes(key)) await search(query);
    });

  const handleKeydown = (event: KeyboardEvent) => {
    if (isSettingOpen) return;
    const { key } = event;
    const current = document.activeElement as HTMLElement;

    if (!['ArrowDown', 'ArrowUp', 'Tab'].includes(key)) {
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

    const domItems = [
      ...document.getElementsByClassName('item'),
    ] as HTMLElement[];
    // attempt to match the currently focused element to an index in our array of list elements
    const currentIndex = domItems.indexOf(current);
    // index of the list element to be newly focused
    let newIndex = 0;

    // if the currently focused element was NOT a list item, then default to focusing the first item in the list (index 0)
    if (currentIndex === -1) {
      window.utools.subInputBlur();
      // otherwise, the currently focused element is an item in our list
    } else {
      // if the UP key has been pressed, set the new index to the current index minus 1, plus the list size, modulo the list size
      if (key === 'ArrowUp' || (key === 'Tab' && event.shiftKey)) {
        if (currentIndex === 0) {
          current.blur();
          window.utools.subInputFocus();
          return;
        } else if (key === 'Tab' || key === 'ArrowUp')
          newIndex = (currentIndex + domItems.length - 1) % domItems.length;
        // if the DOWN key has been pressed, set the new index to the current index plus 1, modulo the list size
      } else {
        newIndex = (currentIndex + 1) % domItems.length;
      }
    }

    // blur (= unfocus) the currently focused element (whether it's a list element or not)
    current.blur();
    // focus the list element at the computed index
    domItems[newIndex].focus();
    domItems[newIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  onMount(async () => {
    if (Object.hasOwn(window, 'utools')) {
      window.addEventListener('keydown', handleKeydown);
      window.utools.onPluginEnter(async () => {
        window.utools.setSubInput(setQuery as any, 'Search Notion', true);
      });
      window.utools.onPluginOut(() => {
        window.utools.setSubInputValue('');
      });
      console.log('mounted');

      if (isConfigValid($config)) await loadInitialItems();
      else {
        const conf = await loadConfig();
        if (isConfigValid(conf)) {
          $config = conf;
          await loadInitialItems();
        } else openSetting();
      }
    }
  });

  $: highlight = (text: string, query: string) =>
    query
      ? text.replace(new RegExp(`(${query})`, 'gi'), '<strong>$1</strong>')
      : text;
</script>

<main>
  <Setting bind:isOpen={isSettingOpen} close={closeSetting} />
  <Navbar {query} {loadInitialItems} {openSetting} {toggleConfig} />
  <ContextMenu />

  {#if query}
    <!-- Display search results -->
    {#if results.length}
      <ul class="search">
        {#each results as item (item.id)}
          <Item
            {item}
            {query}
            {highlight}
            bookmarked={bookmarkedIds.has(item.id)}
          />
        {/each}
      </ul>
      <!-- Display isLoading / no result message-->
    {:else}
      <div class="message">
        {#if isLoading}<Loading />
        {:else}
          {message.noResult}
        {/if}
      </div>
    {/if}
  {:else}
    <!-- Display recent / bookmarked items -->
    <ul class="recent">
      {#each $config.initialView === 'recent' ? recentItems : bookmarks as item (item.id)}
        <Item
          {item}
          {query}
          {highlight}
          bookmarked={bookmarkedIds.has(item.id)}
        />
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
