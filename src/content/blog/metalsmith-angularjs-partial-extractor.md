---
title: "Metalsmith AngularJS Partial Extractor"
subtitle: "Define your HTML in one place and extract the AngularJS partials later"
date: 2017-01-28
category: "code"
tags:
  - AngularJS
  - Templates
  - Static Website
  - Metalsmith
  - Serverless
layout: blog-post.hbs
---

As I discussed in a previous blog [Preload AngularJS Templates](/blog/angular-ui-router-template-preload/), I wanted this site to render entirely within a single request and then fulfill all subsequent page requests with partials. This creates a small problem in that we need to generate two versions of the same content. Simple enough, just create two templates, one for the full page and one for the partial... That works, but it's also annoying. Who wants to write the same HTML twice? Not me. Plus, maintaining the same thing in two different places is always a bad idea. So I came up with an easy solution, I added a small step during my build phase that extracts the partial from the complete HTML and saves it to it's own file. It works roughly like this:

1. Convert Markdown into HTML
2. Inject the HTML from step 1 into a Handlebar template
3. Extract the partial from HTML rendered in step 2
4. Save the result from step 3 into it's own file

The Handlebar template looks like this:

```html
<!DOCTYPE html>
<html lang="{{site.locale}}">
{{>head}}

<body>
	<div class="container-fluid px-0">

		{{>header}}

		<main id="main" class="main" role="main" ui-view="main"></main>

		<script type="text/ng-template" id="partials/{{path}}/">
			<!-- BEGIN PARTIAL partials/{{path}}/index.html -->
			<article class="container">
				<div class="row flex-items-xs-center">
					<div class="col-md-12 col-lg-8">
						<h1 class="h2">{{title}}</h1>
						<h2 class="subtitle">{{subtitle}}</h2>
						<div class="text-sm-right text-muted">
							<time class="time" datetime="{{moment date "YYYY-MM-DD"}}">{{moment date "MMM Do YYYY"}}</time>
						</div>
						<hr>
						<div class="content blog-post">
							<div>
								{{{contents}}}
							</div>
							{{#if site.disqus}}
								<div class="comments">
									<disqus-comments />
								</div>
							{{/if}}
						</div>
					</div>
				</div>
			</article>
			<!-- END PARTIAL -->
		</script>

		{{>footer bodyClasses='blog-post'}}

	</div>
</body>
</html>
```
Source: [blog-post.hbs](https://github.com/ReedD/dadoune.com/blob/1b4a8a741c395a418ca83cb520f8413e62477ab1/src/layouts/blog-post.hbs)

Notice that on [line 13](https://github.com/ReedD/dadoune.com/blob/1b4a8a741c395a418ca83cb520f8413e62477ab1/src/layouts/blog-post.hbs#L13) I mark the beginning of my partial along with the path of where it should be saved, [line 36](https://github.com/ReedD/dadoune.com/blob/1b4a8a741c395a418ca83cb520f8413e62477ab1/src/layouts/blog-post.hbs#L36) closes the block. Then I added this extraction script to my build phase to pull it out:

```javascript
'use strict';

module.exports = () => {
	return (files, metalsmith, done) => {
		setImmediate(done);
		Object.keys(files).forEach(file => {
			if (/\.(html)$/.test(file)) {
				const data         = files[file];
				const contents     = data.contents.toString();
				const partialStart = /<!-- BEGIN PARTIAL (.*?) -->/g;

				// Extract partials
				for (let startMatch; startMatch = partialStart.exec(contents);) {
					const partialEnd   = /<!-- END PARTIAL -->/;
					let partialContent = contents.substring(startMatch.index + startMatch[0].length);
					const endMatch     = partialEnd.exec(partialContent);

					// Determine where the partial ends
					if (!endMatch) throw new Error('Invalid partial structure, missing end tag.');
					partialContent = partialContent.substring(0, endMatch.index);

					// Add partial to files array
					const partialPath  = startMatch[1];
					files[partialPath] = {
						mode: data.mode,
						contents: new Buffer(partialContent)
					};
				}
			}
		});

	};
};
```
Source: [partial-extractor.js](https://github.com/ReedD/dadoune.com/blob/1b4a8a741c395a418ca83cb520f8413e62477ab1/scripts/plugins/partial-extractor.js)

This script gets called on [line 168](https://github.com/ReedD/dadoune.com/blob/1b4a8a741c395a418ca83cb520f8413e62477ab1/build.js#L168) of [build.js](https://github.com/ReedD/dadoune.com/blob/1b4a8a741c395a418ca83cb520f8413e62477ab1/build.js) and the overview is as follows:

1. Find the starting marker along with the desired destination path
2. Find the ending marker
3. Capture everything in between both markers
4. Save the captured content to the desired path

Also notice that the path where the partial is saved is equivalent to the AngularJS template ID. Combine this with steps detailed in my [previous blog](/blog/angular-ui-router-template-preload/) and magic, it all works!
