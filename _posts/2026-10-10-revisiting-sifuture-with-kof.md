---
layout: post
title: Revisiting SiFuture with Kof
description: Revisiting my Java ME space shooter with Kof, preserving its gameplay while exploring new environments.
date: 2026-10-10 00:00:00 -0300
tags:
  - kof
  - gamedev
  - java
dev_to_tags:
  - gamedev
  - showdev
  - java
  - programming
image: img/postbanners/2026-10-10-cover-revisiting-sifuture-with-kof.png
permalink: /:categories/:title:output_ext
---

![SiFuture running in the browser with the spaceship, meteors, and game indicators](/img/postbanners/2026-10-10-cover-revisiting-sifuture-with-kof.png)

In 2006, I started developing [SiFuture](https://github.com/renanfranca/sifuture/blob/6f59817aef0f8aaf56bf7d8854d20c26e84bfc4f/README.md), a space shooter game for mobile phones using [Java ME (J2ME)](https://www.oracle.com/java/technologies/javaformobiledevicesgetstarted.html). At the time, I was studying Computer Science and had just started learning how to program. To build the game, I learned Java directly from Sun&#39;s official documentation. It was my only source for learning the language.

It was in that documentation that I discovered Java&#39;s famous promise: &#34;[Write once, run anywhere.](https://blogs.oracle.com/java/our-world-moved-by-java)&#34;

As a beginner, I took that promise literally. When I finished the game in August 2007, I was disappointed. It worked on mobile phones, but to run it on a computer, I needed an [emulator](https://docs.oracle.com/javame/dev-tools/jme-sdk-3.2/dev-guide/deviceselector.htm). And running it in a browser? Forget it!

Almost 20 years later, I decided to revisit this project using [Kof](https://koflang.github.io/), a programming language I&#39;ve been exploring and studying.

My intention is to preserve the essence of SiFuture, its rules, and its visual identity while exploring the possibility of running it in different environments.

The game features meteors, weapon upgrades, special attacks, a miniboss, and a final boss. One of its mechanics came from something that always bothered me about space shooter games: losing all your accumulated power-ups when you die. In SiFuture, your ship only loses [one weapon upgrade or one special charge, when available](https://github.com/renanfranca/kof-sifuture/blob/main/docs/regras-do-jogo.md#collection-and-upgrades).

The browser version is already available, and you can play using either the [keyboard or the on-screen controls](https://github.com/renanfranca/kof-sifuture/blob/main/docs/jogar.md).

There&#39;s still work to be done. Some features are still pending, such as [support for the original MIDI files, improvements to the mobile experience, and validation in other environments](https://github.com/renanfranca/kof-sifuture#project-status).

For now, I&#39;m enjoying the process of learning Kof, understanding its possibilities, and trying to fulfill that expectation I had when I first started learning Java back in 2006.

For anyone curious, I&#39;ll share the repository and the game in the comments so you can give it a try. 😃

#kofathon

For anyone who wants to explore the project or try the game:

🕹️ Play SiFuture in your browser:<br>
<https://renanfranca.github.io/kof-sifuture/>

💻 SiFuture repository:<br>
<https://github.com/renanfranca/kof-sifuture>

For anyone interested in learning about the Kof programming language:

🌐 Official website:<br>
<https://koflang.github.io/>

💻 Language repository:<br>
<https://github.com/KofLang/Kof4j>
