---
title: Overview
---

# Overview

This documentation covers 2 Fielded Text TypeScript libraries:

- **[@pbkware/fielded-text-web](/fielded-text-ts/Web/)**\
Only includes "Browser" run time. Use in "Browser" applications.
- **[@pbkware/fielded-text-node](/fielded-text-ts/Node/)**\
Includes "Node" run time. Use in "Node" applications.

Note that if an application imports `@pbkware/fielded-text-node`, then it should NOT also import `@pbkware/fielded-text-web`! This is not necessary as `@pbkware/fielded-text-node` re-exports all types from `@pbkware/fielded-text-web`.
