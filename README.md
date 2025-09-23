## deploy firebase

```
firebase -P fb-aio deploy
```

## push lên nhiều repo cùng lúc

```
git remote set-url --add --push all git://another/repo.git
git remote -v
```

hi

---

# Release Notes

## 2025-09-23 — VIP now free

- All VIP features are now unlocked and available for every user by default.
- VIP/Checkout UI elements have been removed from navigation and pages.
- If you still find any leftover “VIP” text or links, please refresh the page or clear cache.

## Deployment

- GitHub Pages: push the static assets in this folder to the `gh-pages` branch of your repo (or set Pages to serve from `/` on the default branch).
- Firebase Hosting: see `firebase.json`. Deploy with:

```
firebase -P fb-aio deploy
```

## Extension integration

- The Chrome extension opens the dashboard (this site). No subscription is required anymore.
- Video downloader, tools, and other features are accessible without gating.
