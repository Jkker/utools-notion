import { writable } from 'svelte/store';
import { parse } from 'cookie';

const DOC_ID = 'config';

const initialConfig = (): Config => ({
  cookie: '',
  spaceId: '',
  useDesktopApp: false,
  navigableBlockContentOnly: false,
  userId: '',
  initialView: 'recent',
});

const config = writable<Config>(initialConfig());

// debounced update db on change
export const save = (value: Config) => {
  if (!value || !value.cookie) return Promise.reject();
  const userId = (value.cookie && parse(value.cookie)?.notion_user_id) || '';
  config.set({ ...value, userId });
  return window.utools.db.promises.put({
    _id: DOC_ID,
    ...value,
    userId,
  });
};

export const reset = () => {
  config.set(initialConfig());
  utools.db.remove(DOC_ID);
};

// get initial value from db
export const load = () => {
  return utools.db.promises.get(DOC_ID).then((value: any) => {
    if (!value) return;
    const userId =
      value.userId ||
      (value.cookie && parse(value.cookie)?.notion_user_id) ||
      '';

    return { ...value, userId } as Config;
  });
};

export const isValid = (value?: Config): value is Config => {
  return Boolean(value && value.cookie && value.spaceId && value.userId);
};

export default config;
