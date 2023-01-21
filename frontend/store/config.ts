import { writable } from "svelte/store";
import { parse } from "cookie";

const DOC_ID = "config";

const initialConfig = (): Config => ({
  cookie: "",
  spaceId: "",
  useDesktopApp: false,
  navigableBlockContentOnly: false,
  userId: "",
  initialView: "recent",
});

const config = writable<Config>(initialConfig());

// onchange
// config.subscribe((value) => {

// debounced update db on change
export const save = (value: Config) => {
  if (!value || !value.cookie) return Promise.reject();
  const userId = (value.cookie && parse(value.cookie)?.notion_user_id) || "";
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
export const init = () =>
  utools.db.promises.get(DOC_ID).then((value: any) => {
    if (!value) return false;
    const userId =
      value.userId ||
      (value.cookie && parse(value.cookie)?.notion_user_id) ||
      "";

    config.set({ ...value, userId } as Config);
    return true;
  });

export default config;
