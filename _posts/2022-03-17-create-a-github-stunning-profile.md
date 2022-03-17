---
layout: post
published: true
title: Create a Github stunning profile 💫 (by dynamically listing your recent blog posts)
description: I learned that you have to expose your blog posts as much you can, without spamming or being annoying, to have a chance to someone read them.
date: 2022-03-17 06:55:00 -0300
tags: blogging
image: /img/postbanners/2022-03-17-cover-github-stunning-profile.jpeg
youtubeFirstId: byMQDWcsKIY
---
![cover image](/img/postbanners/2022-03-17-cover-github-stunning-profile.jpeg)

I enjoy writing my blog posts, but it is getting better when you know that someone is reading them. The real magic happens when someone leaves a comment and I can start discussing the subject. 

I learned that you have to expose your blog posts as much you can, without spamming or being annoying, to have a chance to someone read them.

## Create a stunning Github profile

Let's create an [attractive Github profile](https://naveenkumarj.hashnode.dev/tricks-and-hacks-how-to-make-your-github-profile-readmemd-looks-stunning-within-3-steps) (by  [naveenkumarj](https://www.linkedin.com/in/naveenkumar-j-610147174/)  )  to catch the reader's attention. A summary to creating a context for this blog post:

1. Create a new repository with the same name as your github username 
2. Create a README.md file at the repository root
3. Access [this awesome open source project](https://rahuldkjain.github.io/gh-profile-readme-generator/) (by [@Rahuldkjain](https://twitter.com/Rahuldkjain)) to help you to generate the README.md file content
4. Copy and paste the generated content into your README.md and commit it

The result will be something like [my Github profile](https://github.com/renanfranca):

{% include youtubePlayer.html id=page.youtubeFirstId %}

## Dynamically listing your recent blog posts

Now we are going to add the latest blog posts to my GitHub profile by using [Github Actions](https://dev.to/entando/get-started-with-github-actions-1gde) (by [@avdev4j](https://twitter.com/avdev4j) ) with the help of [this addon](https://rahuldkjain.github.io/gh-profile-readme-generator/addons) (by [@Rahuldkjain](https://twitter.com/Rahuldkjain))

<script src="https://gist.github.com/renanfranca/66eef25dd7fb00ace885e07d049cfc79.js"></script>

The above code implements a workflow to update a github profile README.md with the 5 latest posts from my blog feed. This workflow was defined to start manually by using [workflow_dispatch](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#workflow_dispatch) option. You can change my feed URL to use your [dev. to](http://dev.to) account, for example, my dev.to feed is [https://dev.to/feed/renanfranca](https://dev.to/feed/renanfranca) .

I am going to show you how to make it works.

[![IMAGE ALT TEXT HERE](http://img.youtube.com/vi/vSzr4HO8x24/0.jpg)](http://www.youtube.com/watch?v=vSzr4HO8x24)

Let's change that workflow to execute automatically every hour. Replace this
```yaml
on: 
    workflow_dispatch:
```
for 

```yaml
on: 
    schedule:
        - cron: '0 * * * *'
```
The final file will be like this

<script src="https://gist.github.com/renanfranca/8fe7bf5c34cbc28e849c0bc14fea2437.js"></script>

A special thanks to [@Rahuldkjain](https://twitter.com/Rahuldkjain)) for building the awesome open source project that I used on this post. Please, visit [the repository](https://github.com/rahuldkjain/github-profile-readme-generator) and give it a star 🤩

