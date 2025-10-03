import './styles/style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Configuration constants
const MEDIA_BASE_URL = 'https://mediahalloffame.s3.eu-north-1.amazonaws.com/';

const MEDIA_CONFIGS = [
  {
    video: `${MEDIA_BASE_URL}YouTube_Explosive-Colors.mp4`,
    mask: `${MEDIA_BASE_URL}heart.jpg`,
  },
  {
    video: `${MEDIA_BASE_URL}Major Lazer – Light it Up (feat. Nyla & Fuse ODG) (Remix) [Official 4K Music Video] - Major Lazer Official (1080p, h264, youtube).mp4`,
    mask: `${MEDIA_BASE_URL}smile.jpg`,
  },
  {
    video: `${MEDIA_BASE_URL}Motivational.mp4`,
    mask: `${MEDIA_BASE_URL}codrops.jpg`,
  },
];

// Grid and geometry settings
const GRID_SIZE = 20;
const CUBE_SPACING = 0.55;
const CUBE_SIZE = 0.5;

// Camera settings
const CAMERA_FOV = 75;
const CAMERA_NEAR = 0.1;
const CAMERA_FAR = 100;
const CAMERA_POSITION_Z = 3;

// Lighting colors and intensities
const AMBIENT_LIGHT_COLOR = 0x404040;
const DIRECTIONAL_LIGHT_COLOR = 0xffffff;
const DIRECTIONAL_LIGHT_INTENSITY = 1;
const HEMISPHERE_LIGHT_SKY_COLOR = 0x7444ff;
const HEMISPHERE_LIGHT_GROUND_COLOR = 0xff00bb;
const HEMISPHERE_LIGHT_INTENSITY = 0.5;
const POINT_LIGHT_COLOR = 0x7444ff;
const POINT_LIGHT_INTENSITY = 1;
const POINT_LIGHT_DISTANCE = 100;
const POINT_LIGHT_POSITION = { x: 0, y: 3, z: 4 };

// Image processing
const BRIGHTNESS_THRESHOLD = 128;
const PIXEL_CHANNELS = 4; // RGBA
const RGB_CHANNELS = 3;

// Renderer settings
const MAX_PIXEL_RATIO = 2;

class MediaHall {
  constructor() {
    this.gridSize = GRID_SIZE;
    this.spacing = CUBE_SPACING;
    this.cubeSize = CUBE_SIZE;

    // Video orientation flags
    this.videoFlipY = true; // For video orientation (top-to-bottom vs bottom-to-top)
    this.videoFlipX = true; // For text content (keep false to maintain readable text)

    this.gridsConfig = [
      {
        name: 'heart',
        mask: MEDIA_CONFIGS[0].mask,
        video: MEDIA_CONFIGS[0].video,
      },
      {
        name: 'codrops',
        mask: MEDIA_CONFIGS[1].mask,
        video: MEDIA_CONFIGS[1].video,
      },
      {
        name: 'smile',
        mask: MEDIA_CONFIGS[2].mask,
        video: MEDIA_CONFIGS[2].video,
      },
    ];
    this.gridsConfig.forEach((config) => this.createMask(config));
    this.grids = [];

    this.initScene();
    this.initCamera();
    this.initRenderer();
    this.initLights();
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
      CAMERA_FOV,
      this.sizes.width / this.sizes.height,
      CAMERA_NEAR,
      CAMERA_FAR
    );
    this.camera.position.z = CAMERA_POSITION_Z;
    this.scene.add(this.camera);
  }

  initRenderer() {
    this.canvas = document.querySelector('canvas.webgl');
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
    });
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO)
    );
  }

  initLights() {
    const ambientLight = new THREE.AmbientLight(AMBIENT_LIGHT_COLOR);
    const directionalLight = new THREE.DirectionalLight(
      DIRECTIONAL_LIGHT_COLOR,
      DIRECTIONAL_LIGHT_INTENSITY
    );
    const hemisphereLight = new THREE.HemisphereLight(
      HEMISPHERE_LIGHT_SKY_COLOR,
      HEMISPHERE_LIGHT_GROUND_COLOR,
      HEMISPHERE_LIGHT_INTENSITY
    );
    const pointLight = new THREE.PointLight(
      POINT_LIGHT_COLOR,
      POINT_LIGHT_INTENSITY,
      POINT_LIGHT_DISTANCE
    );

    pointLight.position.set(
      POINT_LIGHT_POSITION.x,
      POINT_LIGHT_POSITION.y,
      POINT_LIGHT_POSITION.z
    );

    this.scene.add(ambientLight, directionalLight, hemisphereLight, pointLight);
  }

  createGrid(config) {
    this.createVideoTexture(config);
    this.group = new THREE.Group();

    for (let x = 0; x < this.gridSize; x++) {
      for (let y = 0; y < this.gridSize; y++) {
        const geometry = new THREE.BoxGeometry(
          this.cubeSize,
          this.cubeSize,
          this.cubeSize
        );

        // Create individual geometry for each box to have unique UV mapping
        // Calculate UV coordinates for this specific box
        // Calculate pixel coordinates with conditional flipping for mask sampling
        const maskY = this.videoFlipY ? this.gridSize - 1 - y : y;
        const maskX = this.videoFlipX ? this.gridWidth - 1 - x : x;
        const pixelIndex = (maskY * this.gridWidth + maskX) * PIXEL_CHANNELS;
        const red = this.data[pixelIndex];
        const green = this.data[pixelIndex + 1];
        const blue = this.data[pixelIndex + 2];

        const brightness = (red + green + blue) / RGB_CHANNELS;

        if (brightness < BRIGHTNESS_THRESHOLD) {
          // Threshold for black vs white
          // Create individual geometry for each box to have unique UV mapping
          // Calculate UV coordinates for this specific box with conditional flipping
          const uvX = this.videoFlipX
            ? (this.gridSize - 1 - x) / this.gridSize // Flip X (mirrors content)
            : x / this.gridSize; // Don't flip X (keeps text readable)

          const uvY = this.videoFlipY
            ? (this.gridSize - 1 - y) / this.gridSize // Flip Y for video orientation
            : y / this.gridSize; // Don't flip Y

          const uvWidth = 1 / this.gridSize;
          const uvHeight = 1 / this.gridSize;

          // Get the UV attribute
          const uvAttribute = geometry.attributes.uv;
          const uvArray = uvAttribute.array;

          // Map each face of the box to show the same portion of video
          // We'll focus on the front face (face 4) for the main projection
          for (let i = 0; i < uvArray.length; i += 2) {
            // Map all faces to the same UV region for consistency
            uvArray[i] = uvX + (1 - uvArray[i]) * uvWidth; // U coordinate
            uvArray[i + 1] = uvY + (1 - uvArray[i + 1]) * uvHeight; // V coordinate
          }

          // Mark the attribute as needing update
          uvAttribute.needsUpdate = true;

          const mesh = new THREE.Mesh(geometry, this.material);

          mesh.position.x = (x - (this.gridSize - 1) / 2) * this.spacing;
          mesh.position.y = (y - (this.gridSize - 1) / 2) * this.spacing;
          mesh.position.z = 0;

          this.group.add(mesh);
        }
      }
    }
    this.group.scale.setScalar(this.cubeSize);
    this.scene.add(this.group);
  }

  createMask(config) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const maskImage = new Image(); // eslint-disable-line no-undef

    maskImage.crossOrigin = 'anonymous';
    maskImage.onload = () => {
      const originalWidth = maskImage.width;
      const originalHeight = maskImage.height;
      const aspectRatio = originalWidth / originalHeight;

      this.gridWidth;
      this.gridHeight;

      if (aspectRatio > 1) {
        // Image is wider than tall
        this.gridWidth = this.gridSize;
        this.gridHeight = Math.round(this.gridSize / aspectRatio);
      } else {
        // Image is taller than wide or square
        this.gridHeight = this.gridSize;
        this.gridWidth = Math.round(this.gridSize * aspectRatio);
      }
      canvas.width = this.gridWidth;
      canvas.height = this.gridHeight;
      ctx.drawImage(maskImage, 0, 0, this.gridWidth, this.gridHeight);

      const imageData = ctx.getImageData(0, 0, this.gridWidth, this.gridHeight);

      this.data = imageData.data;
      this.createGrid(config);
    };
    maskImage.src = config.mask;
  }

  createVideoTexture(config) {
    this.video = document.createElement('video');
    this.video.src = config.video;
    this.video.crossOrigin = 'anonymous';
    this.video.loop = true;
    this.video.muted = true;
    this.video.play();

    // Create canvas for sampling video colors
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = 32;
    this.canvas.height = 32;

    // Create video texture
    this.videoTexture = new THREE.VideoTexture(this.video);
    this.videoTexture.minFilter = THREE.LinearMipmapLinearFilter;
    this.videoTexture.magFilter = THREE.LinearFilter;
    this.videoTexture.anisotropy =
      this.renderer.capabilities.getMaxAnisotropy();
    this.videoTexture.generateMipmaps = true;
    this.videoTexture.flipY = false;
    this.videoTexture.colorSpace = THREE.SRGBColorSpace;
    this.videoTexture.wrapS = THREE.ClampToEdgeWrap;
    this.videoTexture.wrapT = THREE.ClampToEdgeWrap;

    // Create material with video texture
    this.material = new THREE.MeshBasicMaterial({
      map: this.videoTexture,
      side: THREE.FrontSide,
    });

    // Add event listener for background color updates
    this.video.addEventListener('timeupdate', () => this.updateBackground());
  }

  updateBackground() {
    this.ctx.drawImage(this.video, 0, 0, 32, 32);
    const imageData = this.ctx.getImageData(0, 0, 32, 32);

    // Get average color
    let red = 0,
      green = 0,
      blue = 0;

    for (let i = 0; i < imageData.data.length; i += 4) {
      red += imageData.data[i];
      green += imageData.data[i + 1];
      blue += imageData.data[i + 2];
    }

    const pixels = imageData.data.length / 4;

    red = Math.floor(red / pixels);
    green = Math.floor(green / pixels);
    blue = Math.floor(blue / pixels);

    // Update Three.js scene background
    this.scene.background = new THREE.Color(`rgb(${red},${green},${blue})`);
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
    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO)
    );
  }

  animate() {
    // Update controls
    this.controls.update();

    if (this.group) {
      this.group.children.forEach((model, index) => {
        model.position.z = Math.sin(Date.now() * 0.005 + index * 0.5) * 0.6;
      });
    }

    // Render
    this.renderer.render(this.scene, this.camera);

    // Call animate again on the next frame
    window.requestAnimationFrame(() => this.animate());
  }
}

// Initialize the template
new MediaHall();
