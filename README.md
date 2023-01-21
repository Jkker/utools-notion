<div align="center">
  <a href="https://github.com/Jkker/utools-notion">
    <img src="https://github.com/Jkker/utools-notion/raw/main/public/logo.png" alt="Logo" width="80" height="80">
  </a>
  <h3 align="center">uTools Notion Plugin</h3>
  <p align="center">
    功能完备的 Notion 收藏/最近/检索/预览插件
    <br />
    <br />
    <a href="https://github.com/Jkker/utools-notion/issues">Report Bug</a>
    ·
    <a href="https://github.com/Jkker/utools-notion/issues">Request Feature</a>
  </p>
</div>

## 功能预览
![Preview](https://raw.githubusercontent.com/Jkker/utools-notion/main/docs/preview.png)

- 启动时显示最近访问的页面 / 收藏的页面
- 接近官网的搜索体验
- 使用桌面客户端或浏览器打开页面
- 支持预览页面内容


## 选项设置

![Setting](https://raw.githubusercontent.com/Jkker/utools-notion/main/docs/setting.png)


## 使用方法

### 获取 Cookie

1.  打开 Chrome / Edge / FireFox 浏览器
2.  打开 notion.so 并登陆
3.  按 F12 或 Ctrl(Cmd) + Shift + I 打开开发者工具
4.  切换到 Network(网络) 选项卡
5.  在 Notion 中进行搜索
    ![Perform search](https://raw.githubusercontent.com/Jkker/utools-notion/main/docs/notion-search.png)
7.  在 Network 选项卡中找到一个名为 "search" 的请求
8.  在 Headers(标头) 选项卡中找到 Cookie，右键点击并复制

![Get cookie from network request](https://raw.githubusercontent.com/Jkker/utools-notion/main/docs/get-cookie.png)

### 获取 Space ID

在 Payload(负载) 选项卡中找到 Cookie，右键点击并复制

![Get space id](https://raw.githubusercontent.com/Jkker/utools-notion/main/docs/get-space-id.png)