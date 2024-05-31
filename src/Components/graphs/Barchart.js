import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/examples/jsm/renderers/CSS2DRenderer.js";
import GUI from "lil-gui";
import { useEffect, useRef } from "react";
import "./Barchart.css";

const BarChart = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const gui = new GUI();

    const dummyData = [
      [60, 120, 60, 40, 20],
      [60, 100, 60, 40, 20],
      [93, 33, 43, 53, 64],
      [76, 16, 38, 98, 88],
      [60, 100, 60, 40, 20],
      [60, 100, 60, 40, 20],
      [60, 100, 60, 40, 20],
    ];

    // Canvas
    const canvas = document.querySelector("canvas.webgl");

    // Scene
    const scene = new THREE.Scene();

    // const ambientLight = new THREE.AmbientLight("white", 0.5);
    // scene.add(ambientLight);

    const directionaLight = new THREE.DirectionalLight("white", 5, 4, 2);
    directionaLight.position.set(-20, 50, 10);
    scene.add(directionaLight);

    gui.add(directionaLight, "intensity").min(0).max(30).step(0.001);

    // GUI Controls for Light Position
    gui
      .add(directionaLight.position, "x")
      .min(-100)
      .max(100)
      .step(1)
      .name("Light X");
    gui
      .add(directionaLight.position, "y")
      .min(-100)
      .max(100)
      .step(1)
      .name("Light Y");
    gui
      .add(directionaLight.position, "z")
      .min(-100)
      .max(100)
      .step(1)
      .name("Light Z");

    const directionalLightHelper = new THREE.PointLightHelper(
      directionaLight,
      10
    );
    scene.add(directionalLightHelper);

    const planeMaterial = new THREE.MeshStandardMaterial({
      color: "white",
      side: THREE.DoubleSide,
    });

    let colorArr = [
      "#96C3C4",
      "#e8dad2",
      "#cfddfb",
      "#0047ab",
      "#065535",
      "#007a7a",
    ];

    dummyData.forEach((bar, index) => {
      const barMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(colorArr[index]), // Create a new material with the desired color
        wireframe: false,
        transparent: true,
        opacity: index === 0 ? 1 : 0.4,
      });

      barMaterial.roughness = 0.4;

      const geometries = bar.map((height) => {
        return new THREE.BoxGeometry(10, height, 10);
      });

      const tempGroup = createObjectGroup(barMaterial, geometries, [
        ...bar.map(
          (barEl, barElIndex) =>
            new THREE.Vector3(
              0,
              barEl / 2 - 20,
              (barElIndex - Math.floor(bar.length / 2)) * 20
            )
        ),
      ]);

      tempGroup.position.set(10 * index * 2, 0, 0);

      scene.add(tempGroup);
    });

    // Plane Geometry
    const planeGeometry = new THREE.PlaneGeometry(15, 100);

    // Plane Mesh
    const meshP1 = new THREE.Mesh(planeGeometry, planeMaterial);

    meshP1.position.set(0, -21, 0);
    meshP1.rotateX(-1.56);

    // Helper function to create a group of objects
    function createObjectGroup(material, geometries, positions) {
      const group = new THREE.Group();

      geometries.forEach((geometry, index) => {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(positions[index]);
        group.add(mesh);
      });

      return group;
    }

    scene.add(meshP1);

    // Sizes
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    window.addEventListener("resize", () => {
      // Update sizes
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;

      // Update camera
      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();

      // Update renderer
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    const maxYValue = Math.max(...dummyData.map((row) => Math.max(...row)));
    const totalBars = dummyData.length;
    const barWidth = 10;
    const barSpacing = 20;
    const graphWidth = totalBars * barWidth * 2; // Adjust this scale factor as needed
    const graphHeight = maxYValue;
    const graphDepth = dummyData[0].length * barSpacing;

    const returnedArr = generateYAxisTicks(0, maxYValue);
    let yaxisArr = returnedArr[0];

    // Camera
    const camera = new THREE.PerspectiveCamera(
      40,
      sizes.width / sizes.height,
      0.1,
      graphHeight + 1000
    );

    camera.position.x = -graphWidth - 90;
    camera.position.y = graphHeight + 50;
    camera.position.z = graphDepth + 100;
    scene.add(camera);

    // Controls
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.enableZoom = true; // Disable zooming

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
    });
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor("#242424");

    const css2dRenderer = new CSS2DRenderer();
    css2dRenderer.setSize(sizes.width, sizes.height);
    css2dRenderer.domElement.style.position = "absolute";
    css2dRenderer.domElement.style.top = "0";
    css2dRenderer.domElement.style.pointerEvents = "none";
    document.body.appendChild(css2dRenderer.domElement);

    yaxisArr.forEach((value, index) => {
      createLabel(value, 0, value - 20, -60);
    });

    let xAxisValues = [
      "Credit",
      "Listed Equity",
      "Private Equity",
      "Fixed Income",
      "Real Estate",
    ];

    let zAxisValues = [
      "You",
      "Black Rock",
      "Vanguard",
      "Capital Group",
      "Black Stone",
      "Jp Morgan",
      "Stanley",
    ];

    xAxisValues.forEach((value, index) => {
      createLabel(value, -20, -20, -40 + index * 20);
    });

    zAxisValues.forEach((value, index) => {
      createLabel(value, index * 20, -20, (xAxisValues.length - 2) * 20);
    });

    function createLabel(text, x, y, z) {
      const yAxisValueDiv = document.createElement("div");
      yAxisValueDiv.className = "label-barchart-3d";
      yAxisValueDiv.textContent = text;

      const yAxisValueObj = new CSS2DObject(yAxisValueDiv);
      yAxisValueObj.position.set(x, y, z);

      scene.add(yAxisValueObj);

      return yAxisValueObj;
    }

    // Animate
    const clock = new THREE.Clock();

    const tick = () => {
      const elapsedTime = clock.getElapsedTime();

      // Update controls
      controls.update();

      // Render
      renderer.render(scene, camera);

      css2dRenderer.render(scene, camera);

      // Call tick again on the next frame
      window.requestAnimationFrame(tick);
    };

    tick();

    function generateYAxisTicks(minValue, maxValue) {
      // Determine the range and the number of ticks desired (let's use 10 ticks)
      const range = maxValue - minValue;
      const tickCount = 10;

      // Calculate the step size to achieve approximately tickCount intervals
      const rawStep = range / tickCount;

      // Determine a "nice" step size (1, 2, 5, or 10 times a power of 10)
      const magnitude = Math.floor(Math.log10(rawStep));
      const magnitudePow = Math.pow(10, magnitude);
      const normalizedStep = rawStep / magnitudePow;

      let step;
      if (normalizedStep <= 1) {
        step = 1 * magnitudePow;
      } else if (normalizedStep <= 2) {
        step = 2 * magnitudePow;
      } else if (normalizedStep <= 5) {
        step = 5 * magnitudePow;
      } else {
        step = 10 * magnitudePow;
      }

      // Generate the y-axis ticks based on the determined step size
      const yAxisTicks = [];
      for (let i = 0; i <= maxValue; i += step) {
        yAxisTicks.push(i);
      }

      return [yAxisTicks, step];
    }
  }, []);

  return <div ref={mountRef} style={{ height: "100%", width: "100%" }} />;
};

export default BarChart;
