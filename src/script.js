import './style.css'
import * as THREE from 'three'
import * as dat from 'lil-gui'
import gsap from 'gsap'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'

import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'

import { getGPUTier } from 'detect-gpu'
;(async () => {
    const gpuTier = await getGPUTier()
    console.log(gpuTier)
})()

import Stats from 'stats.js'

/**
 * Stats
 */
const stats = new Stats()
stats.showPanel(0)
document.body.appendChild(stats.dom)

/**
 * Debug
 */
const gui = new dat.GUI({ width: 400 })
let guiToggle = true
gui.show(gui._hidden)
gui.open(gui._closed)

window.addEventListener('keypress', (e) => {
    if ((e.key === 'h' || e.key === 'H') && guiToggle == false) {
        gui.show(guiToggle)
        guiToggle = true
    } else if ((e.key === 'h' || e.key === 'H') && guiToggle == true) {
        gui.show(guiToggle)
        guiToggle = false
    }
})

const parameters = {
    materialColor: '#ffeded',
    count: 5000,
}

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // Update Composer
    bloomComposer.setSize(sizes.width, sizes.height)
    bloomComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    finalComposer.setSize(sizes.width, sizes.height)
    finalComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Group
const cameraGroup = new THREE.Group()
scene.add(cameraGroup)

// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(-3.32, 0, 5.154)
camera.rotation.set(0, 0, 0)
cameraGroup.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    // alpha: true,
    antialias: true,
    // powerPreference: 'high-performance',
})
renderer.autoClear = false
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.physicallyCorrectLights = true
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 0.45
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFShadowMap

gui.add(renderer, 'toneMappingExposure').min(0).max(2).step(0.001)
gui.add(renderer, 'toneMapping', {
    No: THREE.NoToneMapping,
    Linear: THREE.LinearToneMapping,
    Reinhard: THREE.ReinhardToneMapping,
    Cineon: THREE.CineonToneMapping,
    ACESFilmic: THREE.ACESFilmicToneMapping,
})

const updateAllMaterials = () => {
    scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
            // child.material.envMap = environmentMap
            child.material.envMapIntensity = 2.5
            child.castShadow = true
            child.receiveShadow = true
            // scene.getObjectByName('Sphere002');
        }
    })
}

/**
 * Loaders
 */
const gltfLoader = new GLTFLoader()
const textureLoader = new THREE.TextureLoader()
const particleTexture = textureLoader.load('/textures/particles/2.png')

/**
 * Objects
 */

// Texture
const gradientTexture = textureLoader.load('textures/gradients/3.jpg')
gradientTexture.magFilter = THREE.NearestFilter

const auroraTexture = textureLoader.load('textures/maps/aurora.jpg')
scene.background = auroraTexture

// Material
const material = new THREE.MeshToonMaterial({
    color: parameters.materialColor,
    gradientMap: gradientTexture,
})

// Meshes
const objectDistance = 4
const mesh1 = new THREE.Mesh(new THREE.TorusGeometry(1, 0.4, 16, 60), material)
const mesh2 = new THREE.Mesh(new THREE.ConeGeometry(1, 2, 32), material)
const mesh3 = new THREE.Mesh(new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16), material)

mesh1.position.y = -objectDistance * 0
mesh2.position.y = -objectDistance * 1
mesh3.position.y = -objectDistance * 2

mesh1.position.x = 2
mesh2.position.x = -2
mesh3.position.x = 2

// scene.add(mesh1, mesh2, mesh3)

const sectionMeshes = [mesh1, mesh2, mesh3]

const astroGroup = new THREE.Group()
scene.add(astroGroup)

gltfLoader.load('/models/astronaught.glb', (gltf) => {
    gltf.scene.position.set(-23.65, -4.095, -2.139)
    gltf.scene.rotation.set(0.16, 0.692, 0)
    astroGroup.add(gltf.scene)
    updateAllMaterials()
})
astroGroup.scale.set(0.3, 0.3, 0.3)
astroGroup.position.set(-3.5, -2, 0)
astroGroup.rotation.set(0.201, -0.536, -25)

const lightBulbGroup = new THREE.Group()
scene.add(lightBulbGroup)

gltfLoader.load('/models/lightBulb.glb', (gltf) => {
    lightBulbGroup.scale.set(0.3, 0.3, 0.3)
    lightBulbGroup.position.set(-3.5, -2, 0)
    lightBulbGroup.rotation.x = 0.2
    lightBulbGroup.rotation.y = -0.291
    lightBulbGroup.add(gltf.scene)

    // const filament = scene.getObjectByName('Filament002')
    // console.log(filament)

    const light = scene.getObjectByName('Point002_Orientation')
    light.position.y = 1
    light.intensity = 50
    gui.add(light, 'intensity').min(0).max(50).step(0.001).name('bulb light')

    updateAllMaterials()
})
lightBulbGroup.scale.set(0.3, 0.3, 0.3)
lightBulbGroup.position.set(-3.5, -2, 0)
lightBulbGroup.rotation.set(0.2, -0.291, -25)

const bulbGroup = new THREE.Group()
scene.add(bulbGroup)

gltfLoader.load('/models/astronaughtScene.glb', (gltf) => {
    bulbGroup.scale.set(0.3, 0.3, 0.3)
    // gltf.scene.layers.set(1)
    bulbGroup.position.set(-3.5, -2, 0)
    bulbGroup.rotation.x = 0.2
    bulbGroup.rotation.y = -0.291
    bulbGroup.add(gltf.scene)

    updateAllMaterials()
})

/**
 * Particles
 */
//  -------------------------------------------------------------------------
// galaxy geometry
const starGeometry = new THREE.SphereGeometry(80, 64, 64)

// galaxy material
const starMaterial = new THREE.MeshBasicMaterial({
    map: textureLoader.load('textures/maps/galaxy1.png'),
    side: THREE.BackSide,
    transparent: true,
})

// galaxy mesh
const starMesh = new THREE.Mesh(starGeometry, starMaterial)
// starMesh.layers.set(0)
scene.add(starMesh)

//  -------------------------------------------------------------------------

/**
 * Bloom Pass
 */
// const renderScene = new RenderPass(scene, camera)
// const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight))
// bloomPass.threshold = 0.3
// bloomPass.strength = 0.3
// bloomPass.radius = 0

// const bloomComposer = new EffectComposer(renderer)
// bloomComposer.setSize(window.innerWidth, window.innerHeight)
// bloomComposer.renderToScreen = false
// bloomComposer.addPass(renderScene)
// bloomComposer.addPass(bloomPass)

// const finalPass = new ShaderPass(
//     new THREE.ShaderMaterial({
//         uniforms: {
//             baseTexture: { value: null },
//             bloomTexture: { value: bloomComposer.renderTarget2.texture },
//         },
//         vertexShader: vertexShader,
//         fragmentShader: fragmentShader,
//         defines: {},
//     }),
//     'baseTexture'
// )
// finalPass.needsSwap = true

// const finalComposer = new EffectComposer(renderer)
// finalComposer.addPass(renderScene)
// finalComposer.addPass(finalPass)

// gui.add(bloomPass, 'threshold').min(-0).max(5).step(0.001).name('threshold')
// gui.add(bloomPass, 'strength').min(-0).max(5).step(0.001).name('strength')
// gui.add(bloomPass, 'radius').min(-0).max(5).step(0.001).name('radius')

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 1)
scene.add(ambientLight)

const pointLight = new THREE.PointLight('#E79B58', 10)
pointLight.position.set(-0.409, -0.605, 0.373)
pointLight.castShadow = true
pointLight.shadow.camera.far = 5
pointLight.shadow.mapSize.set(1024, 1024)
pointLight.shadow.normalBias = 0.015
gui.add(pointLight, 'intensity').min(0).max(100).step(0.001).name('crystal light')
scene.add(pointLight)

/**
 * Scroll
 */
let scrollY = window.scrollY
let currentSection = 0

window.addEventListener('scroll', () => {
    scrollY = window.scrollY * 5

    const newSection = Math.round(scrollY / sizes.height)
    console.log(newSection)

    if (newSection != currentSection) {
        currentSection = newSection
        gsap.to(sectionMeshes[currentSection].rotation, {
            duration: 1.5,
            ease: 'power2.inOut',
            x: '+=6',
            y: '+=3',
            z: '+=1.5',
        })
    }
})

/**
 * Cursor
 */
const cursor = {}
cursor.x = 0
cursor.y = 0

window.addEventListener('mousemove', (event) => {
    cursor.x = event.clientX / sizes.width - 0.5
    cursor.y = event.clientY / sizes.height - 0.5
})

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () => {
    stats.begin()
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // Animate camera
    camera.position.y = (-scrollY / sizes.height) * objectDistance

    const parallaxX = cursor.x * 0.5
    const parallaxY = -cursor.y * 0.5
    cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 15 * deltaTime
    cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 15 * deltaTime

    // Animate meshes
    for (const mesh of sectionMeshes) {
        mesh.rotation.x += deltaTime * 0.1
        mesh.rotation.y += deltaTime * 0.12
    }

    astroGroup.position.x = Math.sin(previousTime) * 0.2
    astroGroup.position.y = Math.cos(previousTime) * 0.2

    // Render
    // bloomComposer.render()
    // finalComposer.render()
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
    stats.end()
}

tick()
