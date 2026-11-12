# Alexander Woods

This repo is the source for [my site](https://alexwoods1.github.io). I built the home view as a leaky integrate-and-fire schematic. Each node is a section: About, Experience, Skills, Projects, Honors, and Contact.

The page loads on the full circuit. Arrow keys, scroll, or swipe move the spike along the wire. Click a node or one of the labels in the bottom bar to open that section; the diagram shrinks to a corner map while you read. Click Circuit on the map, click the open area of the map, or press Esc to return to the full view. On narrow screens the map uses numbered buttons instead of tiny symbols. The scope readout in the corner plots membrane voltage as you move. If your system prefers reduced motion, pans and transitions are shorter. Without JavaScript, every section is still on the page as plain text.

The site is static HTML, CSS, and JavaScript, served from `main` through GitHub Pages. There is no build step.

## Preview locally

```bash
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).
