---
name: Git auth in this repl
description: How to interact with the GitHub remote from this workspace
---
Direct `git clone/fetch/push` over HTTPS fails in the shell ("Invalid username or token"). Use the git-remote skill callbacks (`gitPush`/`gitPull`) instead — they use Replit's GitHub credentials.
**Why:** Shell git has no valid credential; the connector's `listConnections('github')` also returned empty (credentials withheld in this context).
**How to apply:** For any remote git operation, go through the git-remote skill callbacks. Local refs like `origin/main` can be read offline via `git archive`. Note: the project's `origin` is Jonatan49/MamaMiaCatering itself.
