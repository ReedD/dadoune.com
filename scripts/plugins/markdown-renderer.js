'use strict';

const marked = require('marked');

const renderer = new marked.Renderer();

renderer.blockquote = function (text) {
  return `<blockquote class="blockquote">${text}</blockquote>`;
};

module.exports = renderer;
