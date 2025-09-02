import './styles/style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

class MediaHall {
  constructor() {
    this.gridSize = 10;
    this.spacing = 0.75;

    this.initScene();
    this.initCamera();
    this.initRenderer();
    this.initLights();
    this.createGrid();
    this.initControls();
    this.addEventListeners();
    this.animate();
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();
  }

  initCamera() {
    this.sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.sizes.width / this.sizes.height,
      0.1,
      100
    );
    this.camera.position.z = 3;
    this.scene.add(this.camera);
  }

  initRenderer() {
    this.canvas = document.querySelector('canvas.webgl');
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
    });
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  initLights() {
    const ambientLight = new THREE.AmbientLight(0x404040);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    const hemisphereLight = new THREE.HemisphereLight(0x7444ff, 0xff00bb, 0.5);
    const pointLight = new THREE.PointLight(0x7444ff, 1, 100);

    pointLight.position.set(0, 3, 4);

    this.scene.add(ambientLight, directionalLight, hemisphereLight, pointLight);
  }

  createGrid() {
    this.material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    this.group = new THREE.Group();

    for (let x = 0; x < this.gridSize; x++) {
      for (let y = 0; y < this.gridSize; y++) {
        const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const mesh = new THREE.Mesh(geometry, this.material);

        mesh.position.x = (x - (this.gridSize - 1) / 2) * this.spacing;
        mesh.position.y = (y - (this.gridSize - 1) / 2) * this.spacing;
        mesh.position.z = 0;

        this.group.add(mesh);
      }
    }
    this.group.scale.setScalar(0.5);
    this.scene.add(this.group);
  }

  initControls() {
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
  }

  addEventListeners() {
    window.addEventListener('resize', () => this.onResize());
  }

  onResize() {
    this.sizes.width = window.innerWidth;
    this.sizes.height = window.innerHeight;

    this.camera.aspect = this.sizes.width / this.sizes.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  animate() {
    const elapsedTime = this.clock.getElapsedTime();

    // Animate mesh
    this.mesh.rotation.x = elapsedTime * 0.5;
    this.mesh.rotation.y = elapsedTime * 0.5;
    this.mesh.rotation.z = elapsedTime * 0.5;

    // Update controls
    this.controls.update();

    // Render
    this.renderer.render(this.scene, this.camera);

    // Call animate again on the next frame
    window.requestAnimationFrame(() => this.animate());
  }
}

// Initialize the template
new MediaHall();
