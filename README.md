# Alexander Woods

Personal site for [alexwoods1.github.io](https://alexwoods1.github.io). Static HTML, CSS, and JavaScript — no build step and no GitHub Actions workflow.

The page is one neuron. The name is the soma. Work, Projects, and Contact are terminals on the axon. Choosing a terminal sends a spike down that trace, and the words sit on the trace. If the browser asks for reduced motion, the spike does not travel and the text appears at once.

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
