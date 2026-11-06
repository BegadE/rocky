# Rocky

A custom Jekyll personal website for coursework, writing, projects, and hobbies. The design is original; its broad “one site for everything” structure is inspired by [slama.dev](https://slama.dev/).

## Start here

You do **not** need to understand the whole codebase. Most day-to-day changes happen in Markdown files.

1. Open `_config.yml` and replace the site title, biography, email, and social links.
2. Open `about.md` and write a short introduction in your own words.
3. Edit or remove the sample files in `_posts/`, `_coursework/`, and `_projects/`.
4. Preview the site locally, then publish it with GitHub Pages.

## Preview on your Mac

Jekyll requires a modern Ruby. Do not use the old Ruby bundled with macOS. The [official Jekyll macOS guide](https://jekyllrb.com/docs/installation/macos/) recommends installing a newer Ruby with a version manager.

Ruby and the website dependencies are already installed on this Mac. From this project folder, run:

```sh
./bin/serve
```

Then open <http://localhost:4000/rocky/>. Stop the server with `Control-C`.

The helper selects Homebrew Ruby automatically. If the project is moved to another computer, run `./bin/setup` once before `./bin/serve`. To check that the website builds without starting a server, run `./bin/build`.

## Add content

### New blog post or note

Create `_posts/YYYY-MM-DD-short-title.md`:

```yaml
---
title: "A clear title"
description: "One sentence shown in the archive."
kind: Journal
tags: [topic, another-topic]
read_time: 4
---

Write the post in Markdown here.
```

The date in the filename controls the date and ordering. Suggested `kind` values are `Journal`, `Coursework`, `Project log`, and `Off-screen`, but you can use any label.

### New course

Copy one file in `_coursework/`, rename it, and change its front matter. The `order` value controls its position on the coursework page.

### New project

Copy one file in `_projects/`. Add source and demo links like this:

```yaml
links:
  - label: Source
    url: https://github.com/YOUR-USERNAME/PROJECT
  - label: Live demo
    url: https://example.com
```

### Images and downloads

Create `assets/images/` for images and `assets/files/` for PDFs. Use them in Markdown like this:

```md
![Useful alternative text]({{ '/assets/images/photo.jpg' | relative_url }})
[Download the notes]({{ '/assets/files/notes.pdf' | relative_url }})
```

## Publish with GitHub Pages

The repository is [BegadE/rocky](https://github.com/BegadE/rocky). The site is configured for <https://begade.github.io/rocky/> with `url: "https://begade.github.io"` and `baseurl: "/rocky"` in `_config.yml`.

The Git remote uses this Mac's existing `github-personal` SSH alias, which selects the personal GitHub key. On another computer, use `git@github.com:BegadE/rocky.git` with an SSH key authorized for that account.

In the repository's **Settings → Pages**, select **GitHub Actions** under **Build and deployment → Source**. When “Deploy Jekyll site to Pages” in the **Actions** tab shows a green check, the site is online.

Every later update uses the same three commands:

```sh
git add .
git commit -m "Describe what changed"
git push
```

If you publish at a custom domain later, fill in `url` in `_config.yml`. The site already uses `relative_url`, so it also works from a project repository subpath.

## Where everything lives

| Path | Purpose |
| --- | --- |
| `_config.yml` | Site-wide name, links, URL, and settings |
| `_posts/` | Dated writing |
| `_coursework/` | One Markdown file per course |
| `_projects/` | One Markdown file per project |
| `about.md` | Your biography and hobbies |
| `assets/css/main.css` | Colors, typography, and layout |
| `assets/js/site.js` | Dark mode and mobile navigation |
| `assets/js/rubiks-lab.js` | Interactive cube and pattern players |
| `bin/` | Local setup, build, and preview commands |
| `_layouts/` | Shared HTML page structures |
| `.github/workflows/pages.yml` | Automatic GitHub Pages deployment |

## Customize the look

The visual system uses one blue accent family: `--accent`, `--accent-strong`, and `--accent-soft` at the top of `assets/css/main.css`. Body and display text use Raleway, loaded in `_includes/head.html`. The site supports light mode, dark mode, mobile screens, keyboard navigation, reduced motion, RSS, and basic SEO metadata.

Temporary diagnostics and screenshots belong in `tmp/`. That folder is ignored by Git and excluded from the published site, along with the local `bin/` scripts.

