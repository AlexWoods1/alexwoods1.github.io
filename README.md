# Alexander Woods

Personal portfolio at **[alexwoods1.github.io](https://alexwoods1.github.io)** — built as a leaky integrate-and-fire neuron schematic. Each circuit node is a section: About, Experience, Skills, Projects, Honors, and Contact.

## How it works

The site opens on the full diagram. You are the red spike on the wire.

- **Explore:** arrow keys, scroll, swipe, or **Previous** / **Next**
- **Open a section:** click a node or a label in the bottom rail — the diagram shrinks to a corner map and the section fills the page
- **Back to the circuit:** click **Circuit** on the map, click the open area of the map, or press **Esc**
- **Jump sections:** click another node on the map, use the numbered buttons on small screens, or keep using the keyboard while you read

The oscilloscope at the bottom left tracks membrane voltage as you move; the trace reaches threshold at Projects and fires at Honors. With **prefers-reduced-motion**, pans and transitions shorten. With JavaScript off, every section still appears as normal text on the page.

## Live site

[https://alexwoods1.github.io/](https://alexwoods1.github.io/) — served from this repo via GitHub Pages (`main`, site root). No build step.

## Run locally

From the repository root:

```bash
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

## Stack

Static **HTML**, **CSS**, and **vanilla JavaScript** (Familjen Grotesk & IBM Plex Mono). `.nojekyll` at the repo root keeps GitHub Pages from running Jekyll on `index.html`.

**Topics:** `portfolio` · `github-pages` · `neuroscience` · `machine-learning` · `static-site`
