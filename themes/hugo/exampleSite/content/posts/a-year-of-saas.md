---
title: What I learned running a tiny SaaS for a year
date: 2026-11-02
author: Dana Whitfield
toc: true
---

A year ago I launched a small tool that turns CSV exports into readable reports. Today it has 340 paying customers.[^1]

## Charge from day one

> Free users give you compliments. Paying users give you feedback.

## Boring technology wins

```bash
git pull
npm ci --omit=dev
systemctl restart reports
```

### The deploy script

Plain shell, no pipeline.

## The numbers

| Quarter | Customers | Churn |
|:--------|----------:|------:|
| Q1      | 42        | 9%    |
| Q2      | 118       | 6%    |
| Q4      | 340       | 4%    |

- [x] Launch
- [ ] Hire help

[^1]: As of November 2026.
