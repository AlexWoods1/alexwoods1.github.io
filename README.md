# Alexander Woods

This repo is the source for [my site](https://alexwoods1.github.io). I built the home view as a leaky integrate-and-fire schematic. Each node is a section: About, Experience, Skills, Projects, Honors, and Contact.

The page opens on a leaky integrate-and-fire schematic. You are the spike. Arrows, scroll, or swipe move from node to node; a click opens that section as a page. On a page the schematic shrinks to a corner map that stays put while you read. Click the map to return to the full circuit, or click a node on it to jump to another section. The membrane trace charges as you move and fires at threshold. If the browser asks for reduced motion, the camera jumps and the map snaps into place. Without JavaScript, every section is on the page as ordinary text.

The site is static HTML, CSS, and JavaScript, served from `main` through GitHub Pages. There is no build step.

## Preview locally

```bash
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).
