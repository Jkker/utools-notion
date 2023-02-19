/// <reference types="svelte" />
/// <reference types="vite/client" />

declare interface ResultItem {
  title: string;
  icon: string;
  breadcrumbs: { title: string; icon: string }[] | string[];
  url: string;
  webUrl: string;
  appUrl: string;
  id: string;
  score?: number;
  visitedAt?: number;
  bookmarked?: boolean;
}

declare interface Config {
  cookie: string;
  spaceId: string;
  userId: string;
  useDesktopApp: boolean;
  navigableBlockContentOnly: boolean;
  initialView: 'recent' | 'favorites' | 'none';
}

declare interface UserInfo {
  name: string;
  email: string;
  profile_photo: string;
  id: string;
  bookmarks: ResultItem[];
}

declare interface Window {
  getRecentPageVisits: (config: Config) => Promise<ResultItem[]>;
  search: (query: string, config: Config) => Promise<ResultItem[]>;
  getIcon: (icon: any, config: Config) => Promise<any>;
  openContextMenu: (event: MouseEvent, items: any[]) => void;
  closeContextMenu: () => void;
  getUserInfo: (config: Config) => Promise<UserInfo>;
  clearIconCache: () => void;
}
