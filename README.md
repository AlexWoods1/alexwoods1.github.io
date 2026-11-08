# Alexander Woods

Personal site for [alexwoods1.github.io](https://alexwoods1.github.io). Static HTML, CSS, and JavaScript — no build step and no GitHub Actions workflow.

The page is one viewport: a leaky integrate-and-fire schematic. You are the spike. Arrows, scroll, swipe, or a click carry you from node to node, and each node holds a section. The membrane trace charges as you move and fires at threshold. If the browser asks for reduced motion, the camera jumps and the text appears at once. Without JavaScript, every section is on the page as ordinary text.

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
