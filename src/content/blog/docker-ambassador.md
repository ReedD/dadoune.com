---
title: "Docker Ambassador"
subtitle: "Micro docker for linking to external services"
date: 2014-09-03
category: "code"
tags:
  - Docker
  - Socat
  - Ambassador
  - Busybox
  - Linux
layout: blog-post.hbs
---

I've been doing a lot of research and experimentation with docker and I'm really excited to see how active the docker community is and the direction it's going. It seems like every day there's a new docker related repository trending on GitHub. One problem I've been working on recently has been finding the smoothest way to transition from a local environment on a single machine to a distributed environment on multiple production machines. i.e. How can I dynamically link my application to external services without directly modifying my `Dockerfile`. During my search I came upon a pattern called "ambassador linking", and there is a great article that I recommend you read [here](https://docs.docker.com/articles/ambassador_pattern_linking/). I don't want/won't regurgitate everything it already says, so just go read it. The only reason I'm writing this blog is because the docker ambassador referenced in the article doesn't support DNS resolution and I was unable to find one that does. So, I made my own because linking to a IP address that may change isn't acceptable in a production environment. The ambassador I created is a very lightweight busybox with a distribution of socat installed to relay ambassador connections.

Here is an example of how to use the ambassador:

```bash
docker run -t -i \
	-name redis_ambassador \
	-expose 6379 \
	-e REDIS_PORT_6379_TCP=tcp://<DOMAIN OR IP ADDRESS>:6379 \
	reedd/ambassador
```

You can pull it from the repository on [Docker](https://registry.hub.docker.com/u/reedd/ambassador/) or build it from scratch from the source code on [GitHub](https://github.com/ReedD/docker-ambassador).
