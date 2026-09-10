/* global AFRAME */
'use strict';
if (window.AFRAME) {
  AFRAME.registerComponent('crystal-shooter', {
    init() {
      this.start = () => this.setup();
      if (this.el.hasLoaded) this.start();
      else this.el.addEventListener('loaded', this.start, {once: true});
    },
    setup() {
      const T = AFRAME.THREE;
      this.head = document.querySelector('#head');
      this.hand = document.querySelector('#right-hand');
      this.lastShot = -Infinity;
      this.ray = new T.Raycaster();
      this.origin = new T.Vector3();
      this.direction = new T.Vector3();
      this.pointer = new T.Vector2();
      this.gun = document.createElement('a-entity');
      this.gun.id = 'rifle';
      this.gun.setAttribute('gltf-model', 'url(assets/mohac.glb)');
      this.gun.addEventListener('model-error', () => {
        document.querySelector('#weapon-status').textContent = 'Błąd ładowania modelu — odśwież stronę.';
      });
      this.gun.addEventListener('model-loaded', () => {
        document.querySelector('#weapon-status').textContent = 'MOHAC / GOTOWY';
      });
      this.flash = new T.Mesh(new T.IcosahedronGeometry(0.035, 0), new T.MeshBasicMaterial({color: '#ffe9a5', transparent: true, opacity: 0.9}));
      this.flash.position.set(0, 0.07, -0.72);
      this.flash.visible = false;
      this.gun.object3D.add(this.flash);
      this.tracer = new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(), new T.Vector3()]), new T.LineBasicMaterial({color: '#ffde8a', transparent: true, opacity: 0.9}));
      this.tracer.frustumCulled = false;
      this.tracer.visible = false;
      this.el.object3D.add(this.tracer);
      // A sight follows the actual barrel axis in VR.
      this.sight = new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(0, .07, -.72), new T.Vector3(0, .07, -20)]), new T.LineBasicMaterial({color: '#ffcf8a', transparent: true, opacity: 0.25}));
      this.gun.object3D.add(this.sight);
      this.enter = () => this.mount(true);
      this.exit = () => this.mount(false);
      this.el.addEventListener('enter-vr', this.enter);
      this.el.addEventListener('exit-vr', this.exit);
      this.mount(this.el.is('vr-mode'));
      this.trigger = () => { if (this.el.is('vr-mode')) this.fire(); };
      this.hand.addEventListener('triggerdown', this.trigger);
      this.down = event => { if (event.button === 0) this.press = {x: event.clientX, y: event.clientY, id: event.pointerId}; };
      this.up = event => {
        const press = this.press;
        this.press = null;
        if (!press || event.pointerId !== press.id || this.el.is('vr-mode')) return;
        if (Math.hypot(event.clientX - press.x, event.clientY - press.y) > 8) return;
        const rect = this.el.canvas.getBoundingClientRect();
        this.pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
        this.fire(this.pointer);
      };
      this.cancel = () => { this.press = null; };
      this.el.canvas.addEventListener('pointerdown', this.down);
      this.el.canvas.addEventListener('pointerup', this.up);
      this.el.canvas.addEventListener('pointercancel', this.cancel);
      this.resetStats = () => { this.shots = 0; document.querySelector('#shots').textContent = 'Strzały: 0'; };
      this.el.addEventListener('garden-reset', this.resetStats);
      this.resetStats();
    },
    mount(vr) {
      (vr ? this.hand : this.head).appendChild(this.gun);
      this.base = vr ? new AFRAME.THREE.Vector3(0, -0.025, -0.04) : new AFRAME.THREE.Vector3(0.23, -0.26, -0.42);
      this.gun.object3D.position.copy(this.base);
      this.gun.object3D.rotation.set(0, 0, 0);
      this.sight.visible = vr;
      this.flash.visible = false;
      this.tracer.visible = false;
    },
    fire(pointer) {
      const now = performance.now();
      if (now - this.lastShot < 180) return;
      this.el.object3D.updateMatrixWorld(true);
      if (pointer) {
        this.ray.setFromCamera(pointer, this.el.camera);
      } else {
        this.gun.object3D.localToWorld(this.origin.set(0, .07, -.72));
        this.direction.set(0, 0, -1).transformDirection(this.gun.object3D.matrixWorld);
        this.ray.set(this.origin, this.direction);
      }
      this.ray.far = 40;
      const targets = Array.from(this.el.querySelectorAll('.shootable, .shot-blocker, .interactive'));
      const meshes = targets.map(el => el.getObject3D('mesh')).filter(Boolean);
      const hit = this.ray.intersectObjects(meshes, true)[0];
      let target = hit?.object;
      while (target && !target.el) target = target.parent;
      const entity = target?.el;
      // Desktop mouse cursor still handles pads and reset; these aren't shots.
      if (pointer && entity?.classList.contains('interactive')) return;
      this.lastShot = now;
      this.shots++;
      document.querySelector('#shots').textContent = `Strzały: ${this.shots}`;
      if (entity?.classList.contains('shootable')) entity.emit('crystal-hit');
      const end = hit ? hit.point : this.ray.ray.at(35, new AFRAME.THREE.Vector3());
      const muzzle = this.gun.object3D.localToWorld(new AFRAME.THREE.Vector3(0, .07, -.72));
      const positions = this.tracer.geometry.attributes.position;
      positions.setXYZ(0, muzzle.x, muzzle.y, muzzle.z);
      positions.setXYZ(1, end.x, end.y, end.z);
      positions.needsUpdate = true;
      this.flash.visible = true;
      this.tracer.visible = true;
      this.effectUntil = now + 85;
      this.gun.object3D.position.z = this.base.z + 0.035;
    },
    tick(time, delta) {
      if (!this.gun) return;
      if (performance.now() > this.effectUntil) {
        this.flash.visible = false;
        this.tracer.visible = false;
      }
      const p = this.gun.object3D.position;
      p.z += (this.base.z - p.z) * Math.min(1, (delta || 16) / 65);
    },
    remove() {
      this.el.removeEventListener('loaded', this.start);
      this.el.removeEventListener('enter-vr', this.enter);
      this.el.removeEventListener('exit-vr', this.exit);
      this.el.removeEventListener('garden-reset', this.resetStats);
      this.hand?.removeEventListener('triggerdown', this.trigger);
      this.el.canvas?.removeEventListener('pointerdown', this.down);
      this.el.canvas?.removeEventListener('pointerup', this.up);
      this.el.canvas?.removeEventListener('pointercancel', this.cancel);
      for (const effect of [this.flash, this.tracer, this.sight]) {
        effect?.removeFromParent(); effect?.geometry.dispose(); effect?.material.dispose();
      }
      this.gun?.remove();
    }
  });
}
