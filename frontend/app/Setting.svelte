<script lang="ts">
  export let isOpen: boolean;
  export let close: () => void;

  import message from '../../backend/shared/message';
  import config, { reset, save } from '../store/config';
  import Dialog from '../components/Dialog.svelte';
  import Faq from './FAQ.svelte';
  import {
    browserIcon,
    desktopIcon,
    questionIcon,
    recentIcon,
    favoriteIcon,
    externalIcon,
  } from './icons';
  import RadioGroup from '../components/RadioGroup.svelte';

  let invalidCookie = false,
    invalidSpaceId = false;

  let faq = false;

  $: onClose = () => {
    if (faq) {
      faq = false;
      return;
    }
    if ($config.cookie && $config.spaceId) close();
    else {
      if (!$config.cookie) invalidCookie = true;
      if (!$config.spaceId) invalidSpaceId = true;
    }
  };

  $: disableSubmit = !$config.cookie || !$config.spaceId;

  const openFAQ = () => {
    faq = true;
  };

  const closeFAQ = () => {
    faq = false;
  };

  const openLoginPopup = async () => {
    const browser = utools.ubrowser;

    const cookies = await browser
      .goto('https://www.notion.so/login')
      .wait(() => {
        return document.cookie.includes('notion_user_id');
      })
      .cookies()
      .run({
        width: 1200,
        height: 800,
      });

    console.log('cookies', cookies);

    await browser.hide();
  };
</script>

<Dialog {isOpen} close={onClose} disableClose={disableSubmit}>
  {#if faq}
    <Faq />
    <footer>
      <button on:click={closeFAQ} class="close-btn">{message.close}</button>
    </footer>
  {:else}
    <h1>
      <svg
        viewBox="0 0 14 14"
        class="sidebarSettings"
        style="width: 1em; height: 100%; display: inline; fill: currentColor; flex-shrink: 0; backface-visibility: hidden; margin-right: 0.5rem;"
        ><path
          d="M14,7.77 L14,6.17 L12.06,5.53 L11.61,4.44 L12.49,2.6 L11.36,1.47 L9.55,2.38 L8.46,1.93 L7.77,0.01 L6.17,0.01 L5.54,1.95 L4.43,2.4 L2.59,1.52 L1.46,2.65 L2.37,4.46 L1.92,5.55 L0,6.23 L0,7.82 L1.94,8.46 L2.39,9.55 L1.51,11.39 L2.64,12.52 L4.45,11.61 L5.54,12.06 L6.23,13.98 L7.82,13.98 L8.45,12.04 L9.56,11.59 L11.4,12.47 L12.53,11.34 L11.61,9.53 L12.08,8.44 L14,7.75 L14,7.77 Z M7,10 C5.34,10 4,8.66 4,7 C4,5.34 5.34,4 7,4 C8.66,4 10,5.34 10,7 C10,8.66 8.66,10 7,10 Z"
        /></svg
      >
      {message.setting}
    </h1>

    <h4>
      {message.manualLogin}
      <button class="icon-btn" on:click={openFAQ} title={message.FAQ}>
        {@html questionIcon}
      </button>
    </h4>

    <label class="label input-label" for="cookie">
      <span>{message.cookie} </span>
      <textarea
        id="cookie"
        name="cookie"
        class={invalidCookie ? 'invalid' : ''}
        required
        rows="1"
        bind:value={$config.cookie}
      />
    </label>
    <label class="label input-label" for="spaceId">
      <span>{message.spaceId}</span>
      <input
        type="text"
        id="spaceId"
        name="spaceId"
        class={invalidSpaceId ? 'invalid' : ''}
        required
        bind:value={$config.spaceId}
      />
    </label>

    <!-- <label class="label btn-label">
      <h4>{message.autoLogin}</h4>
      <button class="round-btn active" on:click={openLoginPopup}>
        {@html externalIcon}
        {message.loginInPopup}</button
      >
    </label> -->

    <RadioGroup
      bind:value={$config.useDesktopApp}
      options={[
        {
          label: message.browser,
          value: false,
          icon: browserIcon,
        },
        { label: message.desktopApp, value: true, icon: desktopIcon },
      ]}>{message.defaultOpenMethod}</RadioGroup
    >

    <RadioGroup
      options={[
        { label: message.recent, value: 'recent', icon: recentIcon },
        { label: message.favorites, value: 'favorites', icon: favoriteIcon },
        { label: message.none, value: 'none' },
      ]}
      bind:value={$config.initialView}>{message.initialView}</RadioGroup
    >
    <label class="label interactive-label">
      <span>{message.navigableBlockContentOnly}</span>
      <input
        type="checkbox"
        id="navigableBlockContentOnly"
        name="navigableBlockContentOnly"
        bind:checked={$config.navigableBlockContentOnly}
      />
    </label>
    <button
      class="label interactive-label"
      on:click={() => window.clearIconCache()}
    >
      {message.clearIconCache}
    </button>

    <div class="controls">
      <div class="controls-left">
        <button
          class="primary"
          on:click={() => !disableSubmit && save($config).then(close)}
          disabled={disableSubmit}>{message.save}</button
        >
        <button on:click={close} disabled={disableSubmit}
          >{message.close}</button
        >
        <button on:click={openFAQ}>{message.FAQ}</button>
      </div>
      <button on:click={reset} class="danger">{message.reset}</button>
    </div>
  {/if}
</Dialog>

<style>
  h4 {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem;
  }
  .controls {
    display: flex;
    gap: 0.5rem;
  }
  .controls-left {
    flex: 1;
    display: flex;
    gap: 0.5rem;
  }

  .label {
    width: 100%;
    display: flex;
    gap: 1rem;
    align-items: center;
    padding: 0.25rem;
    transition: all 0.15s ease-in-out;
    border-radius: var(--radius);
  }
  .input-label > span {
    padding-top: 0.25rem;
    white-space: nowrap;
    min-width: 80px;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
  .input-label {
    align-items: flex-start;
  }

  .interactive-label {
    height: unset;
    background-color: var(--transparent);
    justify-content: space-between;
    cursor: pointer;
    transition: all 0.15s ease-in-out;
    padding: 0.25rem;
  }
  .interactive-label:hover {
    background-color: var(--bg-hover);
  }
  .interactive-label:active {
    background-color: var(--bg-active);
  }

  .btn-label {
    justify-content: space-between;
  }

  input[type='checkbox'] {
    cursor: pointer;
    transition: all 0.2s ease-in-out;
  }

  input[type='text'],
  textarea {
    width: 100%;
    border: none;
    border-radius: var(--radius);
    background-color: rgba(var(--foreground-rgb), 0.04);
    color: var(--text);
    outline: 0;
    box-shadow: var(--ring);

    display: flex;
    align-items: center;
    font-size: 14px;
    line-height: 20px;
    padding: 4px 10px;
    cursor: text;
    resize: none;
  }
  textarea::-webkit-scrollbar {
    width: 0;
  }
  input[type='text']:focus,
  textarea:focus {
    /* box-shadow: var(--shadow); */
    background-color: var(--bg-hover);
    box-shadow: rgb(35 131 226 / 57%) 0px 0px 0px 1px inset,
      rgb(35 131 226 / 35%) 0px 0px 0px 2px;
  }
  input[type='text'].invalid,
  textarea.invalid {
    box-shadow: var(--ring-error);
  }

  button.icon-btn {
    background: none;
    border: none;
    cursor: pointer;
    outline: none;
    padding: 0;
    height: 1.5rem;
    width: 1.5rem;
    border-radius: 100%;
  }
  button.icon-btn:hover {
    background: var(--bg-hover);
  }
  button.icon-btn:active {
    background: var(--bg-active);
  }
  footer button {
    width: 100%;
    padding: 0;
  }
</style>
