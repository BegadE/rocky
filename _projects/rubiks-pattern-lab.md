---
title: Rubik's Pattern Lab
year: 2026
status: Building
tools: [JavaScript, CSS]
symbol: "▦"
description: Type a Rubik's Cube algorithm and watch every turn build the pattern in real time.
mascot_image: /assets/images/rocky/rocky-rubiks.png
mascot_alt: Rocky, a watercolor rockhopper penguin holding a Rubik's Cube
mascot_caption: Rocky is puzzling it out.
order: 2
back_url: /projects/
back_label: projects
rubiks_player: true
links:
  - label: Pattern guide
    url: /assets/projects/rubiks/pattern-guide.pdf
---

<section class="rubiks-lab" data-rubiks-lab>
  <div class="rubiks-stripes" aria-hidden="true"></div>
  <header class="rubiks-lab-heading">
    <p class="rubiks-kicker">Interactive pattern builder</p>
    <h2>Turn an algorithm into motion</h2>
    <p>Enter standard cube notation, then animate the turns from a solved cube. The starting example is the <strong>Vertical Stripes</strong> sequence from the pattern guide.</p>
  </header>

  <div class="rubiks-workbench">
    <div class="rubiks-stage" data-cube-stage>
      <div class="cube-viewport">
        <canvas data-cube-canvas tabindex="0" role="img" aria-label="Interactive 3D Rubik's Cube. Drag or use the arrow keys to rotate the view." aria-describedby="cube-view-help">Your browser needs canvas support to display the 3D cube.</canvas>
        <span class="cube-move-badge" data-current-move aria-hidden="true">3 × 3</span>
      </div>
      <p id="cube-view-help">Drag to look around · Arrow keys also rotate the view</p>
      <button class="cube-reset-view" type="button" data-cube-action="view">Reset view</button>
    </div>

    <form class="rubiks-controls" data-rubiks-form>
      <label for="cube-algorithm">Algorithm</label>
      <textarea id="cube-algorithm" data-cube-algorithm name="algorithm" rows="4" spellcheck="false" autocapitalize="off">F U F R L2 B D' R D2 L D' B R2 L F U F</textarea>
      <div class="rubiks-form-actions">
        <button class="rubiks-primary" type="submit">Animate</button>
        <button type="button" data-cube-action="clear">Clear</button>
      </div>

      {% include rubiks-transport.html label="Animation controls" %}

      <label class="rubiks-speed" for="cube-speed">
        <span>Animation speed</span>
        <output for="cube-speed" data-speed-output>1×</output>
      </label>
      <input id="cube-speed" data-cube-speed type="range" min="0.5" max="3" step="0.25" value="1">

      <p class="rubiks-status" data-rubiks-status aria-live="polite">Preparing the cube…</p>
    </form>
  </div>

  <div class="rubiks-sequence">
    <div class="rubiks-sequence-heading"><span>Turn sequence</span><output data-move-counter>0 / 17</output></div>
    <div class="rubiks-move-list" data-move-list aria-label="Algorithm turn sequence"></div>
  </div>

  <div class="rubiks-turns">
    <div>
      <h3>Quick turns</h3>
      <p>Tap a tile to append a move. Add <code>'</code> for anticlockwise or <code>2</code> for a half turn.</p>
    </div>
    <div class="rubiks-turn-grid" aria-label="Quick cube turns">
      <button class="turn-u" type="button" data-cube-move="U">U</button>
      <button class="turn-u" type="button" data-cube-move="U'">U′</button>
      <button class="turn-r" type="button" data-cube-move="R">R</button>
      <button class="turn-r" type="button" data-cube-move="R'">R′</button>
      <button class="turn-f" type="button" data-cube-move="F">F</button>
      <button class="turn-f" type="button" data-cube-move="F'">F′</button>
      <button class="turn-d" type="button" data-cube-move="D">D</button>
      <button class="turn-d" type="button" data-cube-move="D'">D′</button>
      <button class="turn-l" type="button" data-cube-move="L">L</button>
      <button class="turn-l" type="button" data-cube-move="L'">L′</button>
      <button class="turn-b" type="button" data-cube-move="B">B</button>
      <button class="turn-b" type="button" data-cube-move="B'">B′</button>
      <button class="turn-slice" type="button" data-cube-move="M">M</button>
      <button class="turn-slice" type="button" data-cube-move="E">E</button>
      <button class="turn-slice" type="button" data-cube-move="S">S</button>
    </div>
  </div>
</section>

{% include rubiks-patterns.html %}

## How it works

The 3D viewer starts with a solved 3×3 cube and turns each layer as the algorithm plays. Drag the cube to see any side, or use the arrows to go through the sequence one turn at a time. The highlighted move and counter show your place.

Use face turns such as `R`, `U'`, and `F2`, slice moves (`M`, `E`, `S`), wide moves (`Rw` or `r`), and whole-cube rotations (`x`, `y`, `z`).

