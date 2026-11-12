# Alexander Woods

Personal site for [alexwoods1.github.io](https://alexwoods1.github.io). Static HTML, CSS, and JavaScript — no build step and no GitHub Actions workflow.

The page opens on a leaky integrate-and-fire schematic. You are the spike. Arrows, scroll, or swipe move from node to node; a click opens that section as a page. On a page the schematic shrinks to a corner map that stays put while you read. Click the map to return to the full circuit, or click a node on it to jump to another section. The membrane trace charges as you move and fires at threshold. If the browser asks for reduced motion, the camera jumps and the map snaps into place. Without JavaScript, every section is on the page as ordinary text.

## Preview locally

From the repository root:

```bash
python3 -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000).

## GitHub Pages

Pages already publishes this repository. `.nojekyll` keeps Jekyll from theming `index.html`.

After this branch is merged into `main`, wait for the Pages deployment and reload [https://alexwoods1.github.io/](https://alexwoods1.github.io/).

Leave **Settings → Pages → Source** on **Deploy from a branch**, branch **main**, folder **/ (root)**. Do not switch the source to GitHub Actions — there is no workflow.
