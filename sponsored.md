---
title: Sponsored Post
layout: page
---
{% assign sponsored-content = site.pages | where: 'name','sponsored-content.md' %}
{{sponsored-content}}


{%- include sponsored-content.md -%}