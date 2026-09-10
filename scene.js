/* global AFRAME */
'use strict';
if (window.AFRAME) {
  AFRAME.registerComponent('garden', {
    init() {
      const scene = this.el;
      // Scene components initialize before their children; wait for the full scene.
      this.build = () => this.buildGarden();
      if (scene.hasLoaded) this.build();
      else scene.addEventListener('loaded', this.build, {once: true});
    },
    buildGarden() {
      const scene = this.el;
      const root = document.querySelector('#garden-objects');
      const crystals = [];
      const activated = new Set();
      const make = (tag, attrs, parent = root) => {
        const el = document.createElement(tag);
        Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
        parent.appendChild(el);
        return el;
      };
      const update = () => {
        const n = activated.size;
        document.querySelector('#progress').textContent = `${n} / 3`;
        document.querySelector('#status').textContent = n === 3 ? 'Ogród znów żyje. Dziękujemy, odkrywco.' : 'Kliknij trzy unoszące się kryształy.';
        document.querySelector('#world-progress').setAttribute('text', 'value', n === 3 ? 'GARDEN ONLINE / ALL CRYSTALS ACTIVE' : `ENERGY ${n} / 3`);
        document.querySelector('#core').setAttribute('material', 'emissiveIntensity', n === 3 ? 1.8 : 0.1 + n * 0.25);
      };
      [[-3, 1.5, -3], [3, 1.7, -4], [0.8, 1.3, -7]].forEach(([x, y, z], i) => {
        make('a-cylinder', {position: `${x} 0.18 ${z}`, radius: 0.65, height: 0.36, color: '#384f58'});
        make('a-torus', {position: `${x} 0.37 ${z}`, rotation: '-90 0 0', radius: 0.5, 'radius-tubular': 0.02, material: 'shader: flat; color: #e7c99b'});
        const crystal = make('a-octahedron', {
          class: 'interactive', position: `${x} ${y} ${z}`, radius: 0.5, scale: '0.75 1.4 0.75',
          material: 'color: #e7c99b; emissive: #e7c99b; emissiveIntensity: 0.15; roughness: 0.25; metalness: 0.3',
          animation: `property: position; to: ${x} ${y + 0.25} ${z}; dir: alternate; loop: true; dur: ${1800 + i * 300}; easing: easeInOutSine`,
          animation__spin: 'property: rotation; to: 0 360 0; loop: true; dur: 14000; easing: linear'
        });
        crystal.addEventListener('click', () => {
          if (activated.has(i)) return;
          activated.add(i);
          crystal.setAttribute('material', 'color', '#8bffe0');
          crystal.setAttribute('material', 'emissive', '#8bffe0');
          crystal.setAttribute('material', 'emissiveIntensity', 0.9);
          update();
        });
        crystals.push(crystal);
      });
      // Compensate for the room-scale headset offset at the destination.
      const teleport = (x, z) => {
        const rig = document.querySelector('#rig');
        const head = document.querySelector('#head');
        rig.object3D.position.set(x - head.object3D.position.x, 0, z - head.object3D.position.z);
      };
      [[0, 3], [-4, 0], [4, -1], [0, -6]].forEach(([x, z]) => {
        const pad = make('a-cylinder', {class: 'interactive', position: `${x} 0.025 ${z}`, radius: 0.52, height: 0.04, material: 'shader: flat; color: #579d98; opacity: 0.9'});
        make('a-torus', {position: `${x} 0.055 ${z}`, rotation: '-90 0 0', radius: 0.48, 'radius-tubular': 0.022, material: 'shader: flat; color: #b5ffe6'});
        pad.addEventListener('click', () => teleport(x, z));
      });
      for (let i = 0; i < 28; i++) {
        const angle = i * 2.39996;
        const radius = 5.4 + (i % 4) * 0.4;
        const x = Math.cos(angle) * radius;
        const z = -3 + Math.sin(angle) * radius;
        const height = 0.45 + (i % 5) * 0.22;
        make('a-cone', {position: `${x} ${height / 2} ${z}`, height, 'radius-bottom': 0.35, 'radius-top': 0, 'segments-radial': 5, color: ['#589a91', '#386d70', '#87b9a3'][i % 3]});
        if (i % 3 === 0) make('a-sphere', {position: `${x} ${height + 0.12} ${z}`, radius: 0.07, material: 'shader: flat; color: #ffdcac'});
      }
      const positions = [];
      for (let i = 0; i < 500; i++) {
        const a = i * 2.39996;
        const y = 1 - (i / 500) * 1.7;
        const r = Math.sqrt(1 - y * y);
        positions.push(Math.cos(a) * r * 85, y * 85, Math.sin(a) * r * 85);
      }
      const geometry = new AFRAME.THREE.BufferGeometry();
      geometry.setAttribute('position', new AFRAME.THREE.Float32BufferAttribute(positions, 3));
      const material = new AFRAME.THREE.PointsMaterial({color: '#bdd4e8', size: 0.12, sizeAttenuation: true});
      scene.setObject3D('stars', new AFRAME.THREE.Points(geometry, material));
      this.cleanupStars = () => { scene.removeObject3D('stars'); geometry.dispose(); material.dispose(); };
      this.reset = () => {
        activated.clear();
        crystals.forEach(el => el.setAttribute('material', {color: '#e7c99b', emissive: '#e7c99b', emissiveIntensity: 0.15}));
        teleport(0, 3);
        update();
      };
      document.querySelector('#reset').addEventListener('click', this.reset);
      const resetOrb = make('a-sphere', {class: 'interactive', position: '0 0.65 -4', radius: 0.18, material: 'shader: flat; color: #e7c99b'});
      resetOrb.addEventListener('click', this.reset);
      make('a-text', {position: '0 0.35 -3.8', value: 'RESET', align: 'center', width: 1.8, color: '#e7c99b'});
      this.enterVR = () => document.body.classList.add('in-vr');
      this.exitVR = () => document.body.classList.remove('in-vr');
      scene.addEventListener('enter-vr', this.enterVR);
      scene.addEventListener('exit-vr', this.exitVR);
      document.querySelector('#loading').hidden = true;
    },
    remove() {
      this.el.removeEventListener('loaded', this.build);
      this.el.removeEventListener('enter-vr', this.enterVR);
      this.el.removeEventListener('exit-vr', this.exitVR);
      document.querySelector('#reset')?.removeEventListener('click', this.reset);
      this.cleanupStars?.();
    }
  });
} else {
  window.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#loading').textContent = 'Nie udało się pobrać silnika 3D. Sprawdź połączenie i odśwież stronę.';
  });
}
