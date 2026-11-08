# Alexander Woods

Personal site for [alexwoods1.github.io](https://alexwoods1.github.io). It is static HTML, CSS, and JavaScript — there is no build step and no GitHub Actions workflow.

The page is laid out like the circuit for a leaky integrate-and-fire neuron: a live membrane trace, the parallel RC schematic, and spikes that travel the board’s traces. If the browser asks for reduced motion, the scope draws one reference sweep and the travelling pulses stay off.

## Preview locally

From the repository root:

```bash
python3 -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000).

## GitHub Pages

The live site is already published from this repository. Before this change it was the default Jekyll theme. `.nojekyll` is included so Pages serves `index.html` directly instead of running Jekyll.

After this branch is merged into `main`, wait for the Pages deployment and reload [https://alexwoods1.github.io/](https://alexwoods1.github.io/).

Leave **Settings → Pages → Source** on **Deploy from a branch**, branch **main**, folder **/ (root)**. Do not switch the source to GitHub Actions — there is no Actions workflow.
