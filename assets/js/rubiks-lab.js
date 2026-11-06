(() => {
  function createPlayer(lab) {

  const canvas = lab.querySelector('[data-cube-canvas]');
  const context = canvas.getContext('2d');
  const input = lab.querySelector('[data-cube-algorithm]');
  const status = lab.querySelector('[data-rubiks-status]');
  const speed = lab.querySelector('[data-cube-speed]');
  const moveList = lab.querySelector('[data-move-list]');
  const counter = lab.querySelector('[data-move-counter]');
  const badge = lab.querySelector('[data-current-move]');

  // Each sticker has a position, an outward normal, and its original colour.
  // The same coordinates drive the cube state and the animated 3D geometry.
  const guidePalette = lab.hasAttribute('data-guide-palette');
  const faces = [
    { normal: [0, 1, 0], color: guidePalette ? '#f6d625' : '#f5f5f2' },
    { normal: [1, 0, 0], color: '#e92745' },
    { normal: [0, 0, 1], color: guidePalette ? '#1769a8' : '#16a45a' },
    { normal: [0, -1, 0], color: guidePalette ? '#f5f5f2' : '#f6d625' },
    { normal: [-1, 0, 0], color: '#ef7b21' },
    { normal: [0, 0, -1], color: guidePalette ? '#16a45a' : '#1769a8' }
  ];
  const moves = {
    R: [0, [1], -1], L: [0, [-1], 1],
    U: [1, [1], -1], D: [1, [-1], 1],
    F: [2, [1], -1], B: [2, [-1], 1],
    M: [0, [0], 1], E: [1, [0], 1], S: [2, [0], -1],
    Rw: [0, [0, 1], -1], Lw: [0, [-1, 0], 1],
    Uw: [1, [0, 1], -1], Dw: [1, [-1, 0], 1],
    Fw: [2, [0, 1], -1], Bw: [2, [-1, 0], 1],
    x: [0, [-1, 0, 1], -1],
    y: [1, [-1, 0, 1], -1],
    z: [2, [-1, 0, 1], -1]
  };
  const key = (position, normal) => `${position.join(',')}/${normal.join(',')}`;
  const radians = (degrees) => degrees * Math.PI / 180;
  const rotate = ([x, y, z], axis, angle) => {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    if (axis === 0) return [x, c * y - s * z, s * y + c * z];
    if (axis === 1) return [c * x + s * z, y, -s * x + c * z];
    return [c * x - s * y, s * x + c * y, z];
  };
  const getMove = (token) => {
    const [, name, suffix] = token.match(/^([URFDLB]w|[URFDLBMESxyzurfdlb])(2'?|')?$/);
    const base = /^[urfdlb]$/.test(name) ? `${name.toUpperCase()}w` : name;
    let [axis, layers, direction] = moves[base];
    if (lab.dataset.guideSlices === 'true' && ['M', 'E'].includes(base)) direction *= -1;
    const amount = suffix?.startsWith('2') ? 2 : suffix === "'" ? -1 : 1;
    return { axis, layers, angle: direction * amount * Math.PI / 2 };
  };
  const parse = (source) => {
    const normalized = source.replace(/[’′]/g, "'");
    const pattern = /(?:[URFDLB]w|[URFDLBMESxyzurfdlb])(?:2'?|')?/g;
    const remaining = normalized.replace(pattern, '').replace(/[\s,]+/g, '');
    if (remaining) throw new Error(`Check the notation near “${remaining.slice(0, 24)}”.`);
    return normalized.match(pattern) || [];
  };

  let stickers = [];
  let tokens = [];
  let loadedSource = null;
  let currentMove = 0;
  let turn = null;
  let playing = false;
  let stepping = false;
  let frame = 0;
  let previousTime = null;
  let yaw = radians(-35);
  let pitch = radians(25);
  let guideView = [];
  let width = 320;
  let height = 330;

  const solved = () => {
    stickers = [];
    faces.forEach(({ normal, color }) => {
      const axis = normal.findIndex((value) => value !== 0);
      for (let a = -1; a <= 1; a += 1) {
        for (let b = -1; b <= 1; b += 1) {
          const position = [...normal];
          position[(axis + 1) % 3] = a;
          position[(axis + 2) % 3] = b;
          stickers.push({ position, normal: [...normal], color });
        }
      }
    });
  };
  const apply = ({ axis, layers, angle }) => {
    stickers.forEach((sticker) => {
      if (!layers.includes(sticker.position[axis])) return;
      sticker.position = rotate(sticker.position, axis, angle).map(Math.round);
      sticker.normal = rotate(sticker.normal, axis, angle).map(Math.round);
    });
  };

  // Small black cubelets make the side of a moving layer visible as it turns.
  const surfaces = [];
  for (let x = -1; x <= 1; x += 1) {
    for (let y = -1; y <= 1; y += 1) {
      for (let z = -1; z <= 1; z += 1) {
        const position = [x, y, z];
        faces.forEach(({ normal }) => {
          const axis = normal.findIndex((value) => value !== 0);
          const corners = (size, depth) => [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => {
            const point = position.map((value, index) => value + normal[index] * depth);
            point[(axis + 1) % 3] += a * size;
            point[(axis + 2) % 3] += b * size;
            return point;
          });
          surfaces.push({ position, normal, outer: corners(0.48, 0.48), inner: corners(0.405, 0.482) });
        });
      }
    }
  }

  const view = (point) => {
    const oriented = guideView.reduce((value, move) => rotate(value, move.axis, move.angle), point);
    return rotate(rotate(oriented, 1, yaw), 0, pitch);
  };
  const shade = (hex, light) => {
    const channels = hex.match(/[a-f\d]{2}/gi).map((channel) => Math.round(parseInt(channel, 16) * light));
    return `rgb(${channels.join(',')})`;
  };
  const polygon = (points, color) => {
    const scale = Math.min(width * 0.205, height * 0.215);
    context.beginPath();
    points.forEach(([x, y, z], index) => {
      const perspective = 9 / (9 - z);
      const px = width / 2 + x * scale * perspective;
      const py = height / 2 - y * scale * perspective;
      if (index === 0) context.moveTo(px, py);
      else context.lineTo(px, py);
    });
    context.closePath();
    context.fillStyle = color;
    context.fill();
  };
  const draw = () => {
    context.clearRect(0, 0, width, height);
    const colors = new Map(stickers.map((sticker) => [key(sticker.position, sticker.normal), sticker.color]));
    const eased = turn ? (1 - Math.cos(Math.PI * turn.progress)) / 2 : 0;
    const visible = [];

    surfaces.forEach((surface) => {
      const moving = turn && turn.layers.includes(surface.position[turn.axis]);
      const transform = (point) => view(moving ? rotate(point, turn.axis, turn.angle * eased) : point);
      const normal = transform(surface.normal);
      const center = transform(surface.position.map((value, index) => value + surface.normal[index] * 0.48));
      // Back-face culling with the perspective camera at (0, 0, 9).
      if (normal[0] * -center[0] + normal[1] * -center[1] + normal[2] * (9 - center[2]) <= 0) return;
      visible.push({
        depth: center[2], outer: surface.outer.map(transform), inner: surface.inner.map(transform),
        color: colors.get(key(surface.position, surface.normal)),
        light: 0.86 + 0.14 * Math.max(0, normal[1] * 0.6 + normal[2] * 0.8)
      });
    });

    visible.sort((a, b) => a.depth - b.depth).forEach((surface) => {
      polygon(surface.outer, '#1b1e24');
      if (surface.color) polygon(surface.inner, shade(surface.color, surface.light));
    });
  };

  const updateSequence = () => {
    counter.value = `${currentMove} / ${tokens.length}`;
    badge.textContent = turn ? tokens[turn.index].replace("'", '′') : '3 × 3';
    [...moveList.children].forEach((chip, index) => {
      chip.classList.toggle('is-done', index < currentMove);
      chip.classList.toggle('is-current', index === (turn ? turn.index : currentMove));
      if (index === (turn ? turn.index : currentMove)) chip.setAttribute('aria-current', 'step');
      else chip.removeAttribute('aria-current');
    });
    canvas.setAttribute('aria-label', `Interactive 3D Rubik's Cube. ${currentMove} of ${tokens.length} turns complete. Drag or use the arrow keys to rotate the view.`);
  };
  const rebuildSequence = () => {
    moveList.replaceChildren();
    tokens.forEach((token, index) => {
      const chip = document.createElement('span');
      chip.textContent = token.replace("'", '′');
      chip.dataset.face = token[0].toUpperCase();
      chip.title = `Turn ${index + 1}: ${token}`;
      moveList.appendChild(chip);
    });
    updateSequence();
  };
  const cancelTurn = () => {
    playing = false;
    stepping = false;
    turn = null;
    previousTime = null;
    requestDraw();
  };
  const load = () => {
    try {
      const nextTokens = parse(input.value.trim());
      cancelTurn();
      tokens = nextTokens;
      loadedSource = input.value.trim();
      currentMove = 0;
      solved();
      rebuildSequence();
      draw();
      return true;
    } catch (error) {
      status.textContent = `${error.message} Try R, U', F2, Rw, M, or x.`;
      return false;
    }
  };
  const ensureLoaded = () => input.value.trim() === loadedSource || load();
  const startTurn = (backwards = false) => {
    const index = backwards ? currentMove - 1 : currentMove;
    if (index < 0 || index >= tokens.length) return false;
    const move = getMove(tokens[index]);
    turn = { ...move, angle: move.angle * (backwards ? -1 : 1), index, backwards, progress: 0 };
    status.textContent = `${backwards ? 'Undoing' : 'Turn'} ${index + 1} of ${tokens.length}: ${tokens[index]}`;
    updateSequence();
    return true;
  };
  const requestDraw = () => {
    if (!frame) frame = window.requestAnimationFrame(tick);
  };
  const tick = (time) => {
    frame = 0;
    if ((playing || stepping) && turn) {
      if (previousTime !== null) {
        // Ignore background-tab gaps so returning to a page does not skip turns.
        turn.progress = Math.min(1, turn.progress + Math.min(time - previousTime, 80) * Number(speed.value) / 650);
      }
      if (turn.progress >= 1) {
        apply(turn);
        currentMove += turn.backwards ? -1 : 1;
        turn = null;
        if (stepping) {
          stepping = false;
          status.textContent = `${currentMove} of ${tokens.length} turns complete.`;
        } else if (playing && currentMove < tokens.length) startTurn();
        else {
          playing = false;
          status.textContent = `Pattern complete — ${tokens.length} turns applied.`;
        }
        updateSequence();
      }
    }
    previousTime = playing || stepping ? time : null;
    draw();
    if (playing || stepping) requestDraw();
  };
  const play = () => {
    if (!ensureLoaded()) return;
    if (!tokens.length) {
      status.textContent = 'Add an algorithm, then press Animate.';
      return;
    }
    if (currentMove === tokens.length && !turn) load();
    playing = true;
    stepping = false;
    if (!turn) startTurn();
    previousTime = null;
    requestDraw();
  };
  const step = (backwards) => {
    if (!ensureLoaded()) return;
    cancelTurn();
    if (startTurn(backwards)) {
      stepping = true;
      requestDraw();
    } else {
      updateSequence();
      draw();
      status.textContent = backwards ? 'At the start of the algorithm.' : 'At the end of the algorithm.';
    }
  };
  const resetView = () => {
    yaw = radians(-35);
    pitch = radians(25);
    guideView = parse(lab.dataset.patternView || '').map(getMove);
    requestDraw();
  };

  const pause = () => {
    playing = false;
    stepping = false;
    previousTime = null;
    status.textContent = `Paused — ${currentMove} of ${tokens.length} turns complete.`;
  };
  lab.querySelector('[data-rubiks-form]')?.addEventListener('submit', (event) => {
    event.preventDefault();
    cancelTurn();
    if (load()) play();
  });
  lab.addEventListener('click', (event) => {
    const moveButton = event.target.closest('[data-cube-move]');
    if (moveButton) {
      input.value = `${input.value.trim()} ${moveButton.dataset.cubeMove}`.trim();
      status.textContent = `${moveButton.dataset.cubeMove} added. Press Animate to run the sequence.`;
      input.focus();
      return;
    }
    const action = event.target.closest('[data-cube-action]')?.dataset.cubeAction;
    if (action === 'view') resetView();
    if (action === 'play') play();
    if (action === 'pause') pause();
    if (action === 'back') step(true);
    if (action === 'next') step(false);
    if (action === 'clear') input.value = '';
    if (['start', 'end', 'clear'].includes(action)) {
      if (!load()) return;
      if (action === 'end') {
        tokens.forEach((token) => apply(getMove(token)));
        currentMove = tokens.length;
        status.textContent = `Showing the finished pattern after ${tokens.length} turns.`;
      } else status.textContent = 'Back at the solved cube.';
      updateSequence();
      requestDraw();
    }
  });
  speed.addEventListener('input', () => {
    lab.querySelector('[data-speed-output]').value = `${Number(speed.value)}×`;
  });

  let drag = null;
  canvas.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY };
    canvas.setPointerCapture(event.pointerId);
    canvas.classList.add('is-dragging');
  });
  canvas.addEventListener('pointermove', (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    yaw += (event.clientX - drag.x) * 0.009;
    pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch + (event.clientY - drag.y) * 0.009));
    drag.x = event.clientX;
    drag.y = event.clientY;
    requestDraw();
  });
  const endDrag = () => {
    drag = null;
    canvas.classList.remove('is-dragging');
  };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);
  canvas.addEventListener('lostpointercapture', endDrag);
  canvas.addEventListener('dblclick', resetView);
  canvas.addEventListener('keydown', (event) => {
    const angles = { ArrowLeft: [-0.15, 0], ArrowRight: [0.15, 0], ArrowUp: [0, -0.15], ArrowDown: [0, 0.15] };
    if (!angles[event.key]) return;
    event.preventDefault();
    yaw += angles[event.key][0];
    pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch + angles[event.key][1]));
    requestDraw();
  });
  const resize = () => {
    const bounds = canvas.getBoundingClientRect();
    width = bounds.width;
    height = bounds.height;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    requestDraw();
  };
  new ResizeObserver(resize).observe(canvas);
  load();
  resize();
  status.textContent = 'Ready. Press Animate to watch the cube turn.';
  return {
    pause,
    setAlgorithm(algorithm) {
      input.value = algorithm;
      resetView();
      if (load()) play();
    }
  };
  }

  const lab = document.querySelector('[data-rubiks-lab]');
  if (!lab) return;
  const mainPlayer = createPlayer(lab);
  const dialog = document.querySelector('[data-pattern-dialog]');
  if (!dialog) return;
  let patternPlayer;
  let selectedCard;

  document.querySelector('.rubiks-pattern-grid').addEventListener('click', (event) => {
    const card = event.target.closest('[data-pattern-alg]');
    if (!card) return;
    selectedCard = card;
    mainPlayer.pause();
    dialog.querySelector('[data-pattern-title]').textContent = card.dataset.patternName;
    dialog.querySelector('[data-pattern-source]').href = `${dialog.querySelector('[data-pattern-source]').href.split('#')[0]}#page=${card.dataset.patternPage}`;
    const note = dialog.querySelector('[data-pattern-note-display]');
    note.textContent = card.dataset.patternNote;
    note.hidden = !card.dataset.patternNote;
    document.body.classList.add('has-pattern-dialog');
    dialog.showModal();
    const playerRoot = dialog.querySelector('[data-pattern-player]');
    playerRoot.dataset.guideSlices = card.dataset.guideSlices;
    playerRoot.dataset.patternView = card.dataset.patternView;
    patternPlayer ||= createPlayer(playerRoot);
    patternPlayer.setAlgorithm(card.dataset.patternAlg);
  });
  dialog.querySelector('[data-close-pattern]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    patternPlayer?.pause();
    document.body.classList.remove('has-pattern-dialog');
    selectedCard?.focus({ preventScroll: true });
  });
})();
