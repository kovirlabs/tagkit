---
title: Field notes on plain HTML
subtitle: What a year of classless pages taught me
author: [Dana Whitfield, Sam Ito]
date: 2026-11-06
lang: en
abstract: A short report on writing documents in Markdown and publishing them as plain HTML.
---

## Why plain HTML

Plain HTML lasts.[^1] It renders anywhere and **reads well** in any browser, with `inline code` and [links](https://example.com).

### A code example

```js
const total = items.reduce((sum, item) => sum + item.price, 0);
console.log(`Total: ${total}`);
```

## A table

| Plan    | Price | Seats |
|:--------|------:|:-----:|
| Starter | $0    | 1     |
| Pro     | $12   | 5     |

## Lists

- [x] Write the draft
- [ ] Publish it

Term
: Definition of the term.

> A quotation, set apart.

1. First
2. Second

## Math

Inline $E = mc^2$ and display:

$$\sum_{i=1}^{n} i = \frac{n(n+1)}{2}$$



[^1]: Pages from 1995 still open today.
