---
title: "N3rd News"
subtitle: "A little update"
date: 2014-03-23
category: "code"
draft: true
tags:
  - Node.js
  - npm
  - assetmanager
  - MEAN Stack
layout: blog-post.hbs
---

I've got good news! So if you read my last [blog post](http://www.dadoune.com/blog/node-js-assetmanager-npm/), I posted about a little npm package I wrote called [assetmanager](https://www.npmjs.org/package/assetmanager). The reason I wrote it was because I was messing around with [MEAN stack](https://github.com/linnovate/mean) and noticed they only included development build options. Production options such concatination and minifcation of CSS and Javascript files were not included. Probably because those uncompressed files were seperatly hardcoded into the header template. So I created assetmanager hopeing to solve this problem. Assetmanager accomplishes this by giving the ability to dynamically swap production and development assets in and out of the template files on the fly. So the good news is, yesterday my [pull request](http://https://github.com/linnovate/mean/pull/318) that adds all this functionality got merged into MEAN! Being the n3rd I am, this was very exciting news to me considering the size and popularity of MEAN. Hopefully this will give assetmanager a little exposure in the node community and other developers will find it useful and decide to use it in their projects too. And who knows, maybe if I'm lucky, I'll get some stars/contributions to my [assetmanager repo](https://github.com/ReedD/node-assetmanager)! In just 24 hours after being merged assetmanager has been already been downloaded 240 times from npm!
