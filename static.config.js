import axios from 'axios';
import { createClient } from 'contentful';
import 'dotenv/config';
import { highlightAuto } from 'highlight.js';
import ImageminPlugin from 'imagemin-webpack-plugin';
import marked from 'marked';
import path from 'path';
import React, { Component } from 'react';
// TODO: import slugTag from 'src/lib/slugTag';
import { ServerStyleSheet } from 'styled-components';

const slugTag = text =>
  text
    .toLowerCase()
    .trim()
    .replace(/[\s\-]+/g, '-');

marked.setOptions({
  highlight: function(code) {
    return highlightAuto(code).value;
  },
});

const typescriptWebpackPaths = require('./webpack.config.js');

export default {
  siteRoot: 'https://www.dadoune.com',
  entry: path.join(__dirname, 'src', 'index.tsx'),
  getSiteData: () => ({
    title: 'React Static',
  }),
  getRoutes: async () => {
    const { data: repos } = await axios.get(
      'https://api.github.com/users/reedd/repos?type=owner&sort=pushed',
    );
    const { data: colors } = await axios.get(
      'https://raw.githubusercontent.com/doda/github-language-colors/master/colors.json',
    );

    const client = createClient({
      space: process.env.CONTENTFUL_SPACE_ID,
      accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
    });
    const { items } = await client.getEntries({
      content_type: process.env.CONTENTFUL_BLOG_CONTENT_ID,
    });

    const blogs = items
      .map(i => ({
        ...i.fields,
        body: marked(i.fields.body),
        publishedAt: i.fields.publishedAt || i.sys.createdAt,
        tags: i.fields.tags || [],
      }))
      .sort((a, b) => a.publishedAt < b.publishedAt);

    const tags = new Set();
    blogs.forEach(blog => {
      blog.tags.forEach(tag => tags.add(slugTag(tag)));
    });

    return [
      {
        path: '/',
        component: 'src/containers/Home',
      },
      {
        path: '/projects',
        component: 'src/containers/Projects',
        getData: () => ({
          repos: repos
            .filter(r => !r.fork)
            .map(r => ({ ...r, language_color: colors[r.language] })),
        }),
      },
      {
        path: '/blog',
        component: 'src/containers/Blog',
        getData: () => ({
          blogs,
        }),
        children: Array.from(tags)
          .map(tag => ({
            path: `/tag/${tag}`,
            component: 'src/containers/Blog',
            getData: () => ({
              blogs: blogs.filter(blog => {
                const tags = new Set();
                blog.tags.forEach(tag => tags.add(slugTag(tag)));
                return tags.has(tag);
              }),
            }),
          }))
          .concat(
            blogs.map(blog => ({
              path: `/${blog.slug}`,
              component: 'src/containers/Post',
              getData: () => ({
                blog,
              }),
            })),
          ),
      },
      {
        is404: true,
        component: 'src/containers/404',
      },
    ];
  },
  renderToHtml: (render, Comp, meta) => {
    const sheet = new ServerStyleSheet();
    const html = render(sheet.collectStyles(<Comp />));
    meta.styleTags = sheet.getStyleElement();
    return html;
  },
  Document: class CustomHtml extends Component {
    render() {
      const { Html, Head, Body, children, renderMeta } = this.props;

      return (
        <Html>
          <Head>
            <meta charSet="UTF-8" />
            <title>Home | dadoune.com</title>
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1"
            />
            <meta name="author" content="Reed Dadoune" />
            <meta name="robots" content="index, follow" />
            <link rel="canonical" href="https://dadoune.com/" />
            {renderMeta.styleTags}
          </Head>
          <Body>{children}</Body>
        </Html>
      );
    }
  },
  webpack: (config, { defaultLoaders }) => {
    // Add .ts and .tsx extension to resolver
    config.resolve.extensions.push('.ts', '.tsx');

    defaultLoaders.fileLoader.query.limit = 1;

    // We replace the existing JS rule with one, that allows us to use
    // both TypeScript and JavaScript interchangeably
    config.module.rules = [
      {
        oneOf: [
          {
            test: /\.(js|jsx|ts|tsx)$/,
            exclude: defaultLoaders.jsLoader.exclude, // as std jsLoader exclude
            use: [
              {
                loader: 'babel-loader',
              },
              {
                loader: require.resolve('ts-loader'),
                options: {
                  transpileOnly: true,
                },
              },
            ],
          },
          defaultLoaders.fileLoader,
        ],
      },
    ];
    config.plugins.push(
      new ImageminPlugin({
        disable: process.env.NODE_ENV !== 'production', // Disable during development
        pngquant: {
          quality: '95-100',
        },
      }),
    );
    return config;
  },
};
