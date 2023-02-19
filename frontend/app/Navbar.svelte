<script lang="ts">
  import 'modern-css-reset/dist/reset.min.css';
  import message from '../../backend/shared/message';
  import RadioGroup from '../components/RadioGroup.svelte';
  import config from '../store/config';
  import {
    browserIcon,
    desktopIcon,
    favoriteIcon,
    recentIcon,
    settingIcon,
    titleIcon,
  } from './icons';

  export let query = '';
  export let loadInitialItems;
  export let openSetting: () => void;
  export let toggleConfig: Function;
</script>

<nav class="menu">
  <div>
    <button
      on:click={toggleConfig('navigableBlockContentOnly')}
      class="round-btn {$config.navigableBlockContentOnly ? 'active' : ''}"
      >{@html titleIcon}{message.navigableBlockContentOnly}</button
    >
    <RadioGroup
      bind:value={$config.useDesktopApp}
      options={[
        {
          label: message.browser,
          value: false,
          icon: browserIcon,
        },
        { label: message.desktopApp, value: true, icon: desktopIcon },
      ]}
    />
    {#if !query.length}
      <RadioGroup
        onChange={loadInitialItems}
        bind:value={$config.initialView}
        options={[
          { label: message.recent, value: 'recent', icon: recentIcon },
          {
            label: message.favorites,
            value: 'favorites',
            icon: favoriteIcon,
          },
        ]}
      />
    {/if}
  </div>
  <div>
    <button on:click={openSetting} class="round-btn"
      >{@html settingIcon}{message.setting}</button
    >
  </div>
</nav>

<style>
  nav {
    height: 48px;
    display: flex;
    align-items: center;
    padding: 5px;
    z-index: 1;
    overflow: auto hidden;
    margin-right: 0px;
    margin-bottom: 0px;
    justify-content: space-between;
  }
  nav > div {
    display: flex;
    align-items: center;
  }
</style>
