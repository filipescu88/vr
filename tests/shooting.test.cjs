const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const THREE = require('three');
class Element {
  constructor() { this.object3D = new THREE.Group(); this.events = {}; this.attrs = {}; this.classList = {contains: name => this.classes?.includes(name)}; }
  setAttribute(key, value) { this.attrs[key] = value; }
  addEventListener(name, fn) { (this.events[name] ||= []).push(fn); }
  removeEventListener(name, fn) { this.events[name] = (this.events[name] || []).filter(f => f !== fn); }
  emit(name) { (this.events[name] || []).forEach(f => f({})); }
  appendChild(el) { this.object3D.add(el.object3D); }
  remove() { this.object3D.removeFromParent(); }
  getObject3D() { return this.mesh; }
}
function setup() {
  let now = 1000;
  const els = Object.fromEntries(['head', 'right-hand', 'weapon-status', 'shots'].map(id => ['#' + id, new Element()]));
  const scene = new Element();
  scene.hasLoaded = true;
  scene.is = () => false;
  scene.camera = new THREE.PerspectiveCamera(60, 1, 0.01, 100);
  scene.camera.position.y = 1.6;
  scene.object3D.add(scene.camera);
  els['#head'].object3D.position.y = 1.6;
  scene.object3D.add(els['#head'].object3D, els['#right-hand'].object3D);
  scene.canvas = new Element();
  scene.canvas.getBoundingClientRect = () => ({left: 0, top: 0, width: 100, height: 100});
  const targets = [];
  scene.querySelectorAll = () => targets;
  let definition;
  const context = {window: {AFRAME: true}, AFRAME: {THREE, registerComponent: (_, c) => definition = c}, document: {querySelector: id => els[id], createElement: () => new Element()}, performance: {now: () => now}};
  vm.runInNewContext(fs.readFileSync('shooting.js', 'utf8'), context);
  const component = Object.assign({el: scene}, definition);
  component.init();
  function target(classes, z) {
    const el = new Element(); el.classes = classes;
    el.mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, .3), new THREE.MeshBasicMaterial());
    el.mesh.el = el; el.mesh.position.set(0, 1.6, z);
    scene.object3D.add(el.mesh); targets.push(el);
    return el;
  }
  return {component, scene, els, target, advance: () => now += 200};
}
test('a shot hits the nearest crystal once, cooldown prevents duplicate fire, misses count', () => {
  const {component: c, target, advance, els} = setup();
  let hits = 0; target(['shootable'], -5).addEventListener('crystal-hit', () => hits++);
  c.fire(new THREE.Vector2(0, 0));
  assert.equal(hits, 1); assert.equal(c.shots, 1); assert.equal(c.tracer.visible, true);
  c.fire(new THREE.Vector2(0, 0)); assert.equal(hits, 1);
  advance(); c.fire(new THREE.Vector2(.95, .95));
  assert.equal(hits, 1); assert.equal(els['#shots'].textContent, 'Strzały: 2');
  advance(); c.tick(0, 100); assert.equal(c.tracer.visible, false);
});
test('solid geometry blocks a crystal and desktop teleport pads do not fire', () => {
  const {component: c, target, advance} = setup();
  let hits = 0; target(['shootable'], -5).addEventListener('crystal-hit', () => hits++);
  const blocker = target(['shot-blocker'], -2);
  c.fire(new THREE.Vector2()); assert.equal(hits, 0); assert.equal(c.shots, 1);
  blocker.classes = ['interactive']; advance(); c.fire(new THREE.Vector2());
  assert.equal(c.shots, 1);
});
test('VR fires along the muzzle axis; mounting, reset and cleanup work', () => {
  const {component: c, target, els, scene} = setup();
  let hits = 0; const crystal = target(['shootable'], -5);
  crystal.mesh.position.y = .045;
  crystal.addEventListener('crystal-hit', () => hits++);
  c.mount(true); c.fire(); assert.equal(hits, 1);
  assert.equal(c.gun.object3D.parent, els['#right-hand'].object3D);
  scene.emit('garden-reset'); assert.equal(c.shots, 0);
  c.mount(false); assert.equal(c.gun.object3D.parent, els['#head'].object3D);
  c.remove(); assert.equal(c.gun.object3D.parent, null);
  assert.equal(scene.canvas.events.pointerup.length, 0);
});
test('dragging the view does not fire; a short tap fires', () => {
  const {component: c} = setup();
  c.down({button: 0, pointerId: 1, clientX: 50, clientY: 50});
  c.up({pointerId: 1, clientX: 70, clientY: 50}); assert.equal(c.shots, 0);
  c.down({button: 0, pointerId: 1, clientX: 50, clientY: 50});
  c.up({pointerId: 1, clientX: 50, clientY: 50}); assert.equal(c.shots, 1);
});
