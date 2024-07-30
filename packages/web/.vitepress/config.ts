import { defineConfig } from 'vitepress';
import { SearchPlugin } from 'vitepress-plugin-search';
// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Aqued',
  description: 'Aquedの公式サイト',
  head: [['link', { rel: 'icon', href: '../logo.png' }]],

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '../logo.png',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' },
    ],
    sidebar: [
      {
        text: 'ChangeLog',
        items: [
          { text: 'v4.0.0', link: '/changelog/v4.0.0.html' },
          { text: 'v3.2.0', link: '/changelog/v3.2.0.html' },
          { text: 'v3.1.2', link: '/changelog/v3.1.2.html' },
          { text: 'v3.1.1', link: '/changelog/v3.1.1.html' },
          { text: 'v3.1.0', link: '/changelog/v3.1.0.html' },
          { text: 'v3.0.1', link: '/changelog/v3.0.1.html' },
          { text: 'v3.0.0', link: '/changelog/v3.0.0.html' },
          { text: 'v2.3.0', link: '/changelog/v2.3.0.html' },
          { text: 'v2.2.0', link: '/changelog/v2.2.0.html' },
          { text: 'v2.1.1', link: '/changelog/v2.1.1.html' },
          { text: 'v2.1.0', link: '/changelog/v2.1.0.html' },
          { text: 'v2.0.0', link: '/changelog/v2.0.0.html' },
          { text: 'v1.0.1', link: '/changelog/v1.0.1.html' },
          { text: 'v1.0.0', link: '/changelog/v1.0.0.html' },
          { text: 'v0.1.0', link: '/changelog/v0.1.0.html' },
        ],
      },
      {
        text: 'Examples',
        items: [{ text: 'Markdown Examples', link: '/markdown-examples' }],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/aqued-dev/aqued' },
      { icon: 'x', link: 'https://x.com/aqued_dev' },
      { icon: 'discord', link: 'https://discord.gg/rE75MJswYw' },
    ],
  },
  vite: {
    plugins: [
      // @ts-ignore
      SearchPlugin({
        encode: false,
        tokenize: 'full',
        previewLength: 62,
        buttonLabel: '検索',
        placeholder: 'このサイトを検索する...',
      }),
    ],
  },
});
