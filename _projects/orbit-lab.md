---
title: Orbit Lab
year: 2026
status: Live
tools: [JavaScript, Classical Mechanics]
symbol: "◎"
description: An interactive exploration of two-body orbits, binary star systems, and the energy constraints behind planetary motion.
order: 3
back_url: /projects/
back_label: projects
links:
  - label: Launch simulator
    url: https://begade.github.io/orbit-lab/
  - label: Source code
    url: https://github.com/BegadE/orbit-lab
---

## From one star to two

Orbital motion becomes more interesting when a second star enters the picture. This project begins with familiar two-body orbits before exploring planetary motion around binary stars. Through an interactive simulator, I investigate how initial conditions shape trajectories, how energy constrains the motion, and why the same orbit can look very different in another reference frame.

The project grew out of my graduate classical mechanics course. I wanted to connect the equations we derive to motion we can actually watch: changing an initial position or velocity, following the resulting trajectory, and understanding why it behaves that way.

[![Orbit Lab showing a circumbinary trajectory beside Hill’s regions, with an equilibrium-energy diagram below]({{ "/assets/images/projects/orbit-lab.webp" | relative_url }})](https://begade.github.io/orbit-lab/)

*The binary-star view connects the planet’s trajectory to Hill’s regions and its conserved Jacobi energy. The simulator has both light and dark themes.*

## What you can explore

The **two-body system** starts with circular, elliptical, parabolic and hyperbolic examples. A moving marker links the bodies’ separation to the gravitational and effective potentials, while an energy plot shows kinetic and potential energy exchanging throughout the motion.

The **binary-star system** introduces a massless planet moving under the gravity of two circularly orbiting stars. You can explore P-type orbits around both stars and S-type orbits around one star, adjust the stellar mass ratio and launch conditions, and compare inertial and rotating views. Hill’s regions and the Jacobi-energy diagram show which parts of the plane the planet is allowed to reach.

## Try an experiment

- Begin with the two-body elliptical example and follow the energy exchange as the bodies move closer and farther apart.
- Switch to the binary-star tab and compare the Kepler-16-like and γ Cephei-like examples.
- Change the initial radius or speed and watch how the trajectory and allowed regions change.
- Pause at an interesting moment to save a PNG, or export the numerical run as a CSV.

[**Open Orbit Lab →**](https://begade.github.io/orbit-lab/) · [Browse the source code](https://github.com/BegadE/orbit-lab)

## The model behind the pictures

The trajectories are integrated numerically in the browser using adaptive Dormand–Prince Runge–Kutta integration. The two-body model uses the exact relative-motion reduction. The binary-star model uses the planar circular restricted three-body approximation, with its assumptions and equations explained inside the app.

The named planetary examples are circularized educational analogues. A trajectory that remains bounded during a run does not establish permanent stability, and the close-approach cutoff is a numerical diagnostic rather than a physical stellar collision.

The simulator is maintained in its own repository, while this page records the motivation and ideas behind the project.
