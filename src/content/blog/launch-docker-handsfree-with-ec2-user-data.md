---
title: "Launch Docker handsfree on AWS EC2 with Compose and user data"
subtitle: "A helpful snippet"
date: 2015-06-20
category: "code"
tags:
  - Amazon Web Services
  - EC2
  - Docker
  - Compose
layout: blog-post.hbs
---

Here's a little snippet of code I use all the time to launch Docker applications on AWS EC2 instances. With this snippet you wont need to SSH in, simply fire and forget. If all the docker containers you're launching are public, you can remove lines 7-13. However, if you're using a private repository, you'll need to enter your own credentials on line 11. The snippet below simply launches an nginx instance so edit lines 19-22 to suit your own application needs.

If you don't know how to launch an EC2 instance then you'll need to look up a more detailed tutorial for that. They're all over the place so I won't waste time with it here. But basically the magic happens on step 3 titled <em>Configure Instance</em>. Just expand the <em>Advanced Details</em> accordion and paste the snippet in as text. Launch and you're done!

<gist id="a46c10ccce5af12c8d5f"></gist>
