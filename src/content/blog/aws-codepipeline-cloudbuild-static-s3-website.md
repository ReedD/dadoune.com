---
title: "Automated static website deployments via AWS and GitHub"
subtitle: "Use GitHub to trigger AWS CodePipeline and CodeBuild to generate your static website onto S3."
date: 2017-01-02
category: "code"
tags:
  - AWS
  - CodePipeline
  - CodeBuild
  - CloudFormation
  - ACM
  - GitHub
  - Metalsmith
  - Hugo
  - Jekyll
  - Static Website
  - S3
  - Serverless
layout: blog-post.hbs
---

In this post I want to go over how I automated the build and deployment process of this website. This whole process is mapped and controlled by three main files: [cfn-stack.json](https://github.com/ReedD/dadoune.com/blob/e10a972e77e6856787d87fb1cf2ec13d8eef9eb6/cfn-stack.json), [buildspec.yml](https://github.com/ReedD/dadoune.com/blob/e10a972e77e6856787d87fb1cf2ec13d8eef9eb6/buildspec.yml) and [build.js](https://github.com/ReedD/dadoune.com/blob/e10a972e77e6856787d87fb1cf2ec13d8eef9eb6/build.js) (all files in this blog will be linked to the most recent commit at the time of writing ([e10a972](https://github.com/ReedD/dadoune.com/tree/e10a972e77e6856787d87fb1cf2ec13d8eef9eb6)), check master for updates).

### Step 1 AWS CloudFormation

> AWS CloudFormation gives developers and systems administrators an easy way to create and manage a collection of related AWS resources, provisioning and updating them in an orderly and predictable fashion. <div class="blockquote-footer">[AWS CloudFormation Docs](https://aws.amazon.com/cloudformation/)</div>

As a general rule, every project I deploy gets its own CloudFormation template document. It takes a little longer at the beginning of a project to get all setup but you'll thank yourself later when you come back to it six months down the line. It makes resources and configuration so much easier to keep track of. The entire stack for this site is all here in [cfn-stack.json](https://github.com/ReedD/dadoune.com/blob/e10a972e77e6856787d87fb1cf2ec13d8eef9eb6/cfn-stack.json). Feel free to use this template for your own static website. From the AWS CloudFormation dashboard all you have to do is upload the template, appropriately fill in the template parameters and submit. In a short while later you'll have everything from DNS configuration to code deployment all setup and ready for you. I'm not going to breakdown the document in full detail but I'll highlight the main sections and their functions:

- [Route53 DNS Records](https://github.com/ReedD/dadoune.com/blob/e10a972e77e6856787d87fb1cf2ec13d8eef9eb6/cfn-stack.json#L63-L86) - This section creates the DNS records for `www.dadoune.com` and `dadoune.com`.  
- [ACM SSL Certificate](https://github.com/ReedD/dadoune.com/blob/e10a972e77e6856787d87fb1cf2ec13d8eef9eb6/cfn-stack.json#L49-L62) - This section generates an SSL certificate for both `www.dadoune.com` and `dadoune.com`.
- [CodePipeline](https://github.com/ReedD/dadoune.com/blob/e10a972e77e6856787d87fb1cf2ec13d8eef9eb6/cfn-stack.json#L161-L263) - This section creates a CodePipeline project and wires it up to my GitHub repo.
- [S3 CodePipeline Artifact Bucket](https://github.com/ReedD/dadoune.com/blob/e10a972e77e6856787d87fb1cf2ec13d8eef9eb6/cfn-stack.json#L264-L270) - This is the S3 bucket CodePipeline uses to download the project source to which gets passed on to CodeBuild.
- [CodeBuild](https://github.com/ReedD/dadoune.com/blob/e10a972e77e6856787d87fb1cf2ec13d8eef9eb6/cfn-stack.json#L87-L160) - This portion sets up the build environment (more on this and [buildspec.yml](https://github.com/ReedD/dadoune.com/blob/e10a972e77e6856787d87fb1cf2ec13d8eef9eb6/buildspec.yml) later).
- [S3 WWW Redirection Bucket](https://github.com/ReedD/dadoune.com/blob/e10a972e77e6856787d87fb1cf2ec13d8eef9eb6/cfn-stack.json#L271-L283) - This bucket is simply used to redirect non `www` traffic to the `www` domain.
- [CloudFront for Redirection Bucket](https://github.com/ReedD/dadoune.com/blob/e10a972e77e6856787d87fb1cf2ec13d8eef9eb6/cfn-stack.json#L284-L308) - The redirection bucket needs it's own CloudFront distribution so we can handle `https` traffic.
- [S3 Static Site Bucket](https://github.com/ReedD/dadoune.com/blob/e10a972e77e6856787d87fb1cf2ec13d8eef9eb6/cfn-stack.json#L284-L308) - This is the bucket we actually store the sites build in.
- [CloudFront for Static Site Bucket](https://github.com/ReedD/dadoune.com/blob/e10a972e77e6856787d87fb1cf2ec13d8eef9eb6/cfn-stack.json#L309-L352) - This is the CloudFront distribution in front of the static site bucket.

Most of the configuration parameters needed for this template are from GitHub. You need your GitHub username, the name of the repo for your static site and the name of the branch that will trigger CodePipeline to build (probably `master`). You'll also need to create a "Personal Access Token" in your account settings [here](https://github.com/settings/tokens). The only other parameter you need is the domain of your static site (non www) e.g. "dadoune.com".

### Step 2 AWS CodeBuild Build Specification

Every time a build gets triggered, CodePipeline downloads the source and runs through the build as defined by the [buildspec.yml](https://github.com/ReedD/dadoune.com/blob/e10a972e77e6856787d87fb1cf2ec13d8eef9eb6/buildspec.yml) located in the root of the project. Full documentation on the `buildspec.yml` file can be found [here](http://docs.aws.amazon.com/codebuild/latest/userguide/build-spec-ref.html). On line [142 of cfn-stack.json](https://github.com/ReedD/dadoune.com/blob/e10a972e77e6856787d87fb1cf2ec13d8eef9eb6/cfn-stack.json#L142), I set the build container to be `ubuntu-base:14.04`, so anything you can do with Ubuntu you can do with for your build. Here is my whole buildspec:

```yaml
version: 0.1
phases:
  install:
    commands:
      # Install nodejs https://nodejs.org/en/download/package-manager/
      - curl -sL https://deb.nodesource.com/setup_7.x | bash -
      - apt-get install -y nodejs
      # Install yarn natively https://yarnpkg.com/en/docs/install#linux-tab
      - curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
      - echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
      - apt-get update
      - apt-get install -y yarn
  pre_build:
    commands:
      - yarn
  build:
    commands:
      - yarn run build
  post_build:
    commands:
      - aws s3 sync --delete --exclude assets/* build/ "s3://${BUCKET_NAME}"
      - aws s3 sync --delete --cache-control "max-age=31536000" build/assets "s3://${BUCKET_NAME}/assets"

```

Most of that should be pretty straight forward:
1. Install [NodeJS](https://nodejs.org/) and [yarn](https://yarnpkg.com/).
2. Run `yarn` to install all of the needed NPM packages defined in `package.json`.
3. Run `yarn build` defined [here](https://github.com/ReedD/dadoune.com/blob/e10a972e77e6856787d87fb1cf2ec13d8eef9eb6/package.json#L8), which generates the static site with [Metalsmith](http://www.metalsmith.io/).
4. Sync the static site S3 bucket with the newly generated build.

#### Sync Elaboration
You'll notice I `sync` twice during `post_build`, the first one syncs all of the non asset files with no "cache-control" meta because I don't want them cached by CloudFront. The second one syncs all of my asset files and sets their "max-age" to one year, CloudFront will cache them based on this value. All of my asset file names are generated with a fingerprint hash during the [Metalsmith](http://www.metalsmith.io/) build portion so I have no cache bust concerns. The other thing you might notice about this section is the use of the environment variable `BUCKET_NAME`, this value is defined in my CloudFormation template [here](https://github.com/ReedD/dadoune.com/blob/master/cfn-stack.json#L144-L147). Also, the `--delete` flag means that sync will delete any files in the bucket that are not in the `build` folder.  

### Step 3 Static Site Generation
This step actually occurs in the middle of step 2 but I'm calling it step 3 anyways. In my particular case this is where I have [Metalsmith](http://www.metalsmith.io/) generate my site but you could use any static site generation framework for this step really. A few other popular frameworks are [Jekyll](https://jekyllrb.com/) and [Hugo](https://gohugo.io/). The intricacies of my build are a bit out of scope for what I want to cover in this blog but you can check my source out [here]([build.js](https://github.com/ReedD/dadoune.com/blob/e10a972e77e6856787d87fb1cf2ec13d8eef9eb6/build.js).
