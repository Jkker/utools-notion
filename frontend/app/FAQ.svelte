<script lang="ts">
  import message from "../../backend/shared/message";
</script>

<h1>使用指南</h1>
<article>
  <h2>{message.howToGetCookie}</h2>
  <ol>
    <li>打开 Chrome / Edge / FireFox 浏览器</li>
    <li>打开 notion.so 并登陆</li>
    <li>按 F12 或 Ctrl(Cmd) + Shift + I 打开开发者工具</li>
    <li>切换到 Network(网络) 选项卡</li>
    <li>在 Notion 中进行搜索</li>
    <img src="docs/notion-search.png" alt="Perform search" />
    <li>在 Network 选项卡中找到一个名为 "search" 的请求</li>
    <li>在 Headers(标头) 选项卡中找到 Cookie，右键点击并复制</li>
  </ol>
  <img src="docs/get-cookie.png" alt="Get cookie from network request" />
  <h2>{message.howToGetSpaceId}</h2>
  <p>在 Payload(负载) 选项卡中找到 Cookie，右键点击并复制</p>
  <img src="docs/get-space-id.png" alt="Get space id" />
</article>

<style>
  h2 {
    margin-bottom: 0.5rem;
  }
  ol {
    margin: 0;
    padding-inline-start: 1.5rem;
  }
  li {
    margin-bottom: 0.5rem;
  }
  img {
    max-width: 100%;
    width: 40rem;
    /* margin: 1rem 0; */
  }
  article > * {
    margin-bottom: 1rem;
  }
</style>
