import './style.css'
import * as THREE from 'three'
import * as dat from 'lil-gui'
import gsap from 'gsap'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

/**
 * Debug
 */
const gui = new dat.GUI({ width: 400 })

const parameters = {
    materialColor: '#ffeded',
    count: 5000,
}

// gui.addColor(parameters, 'materialColor').onChange(() => {
//     material.color.set(parameters.materialColor)
//     particlesMaterial.color.set(parameters.materialColor)
// })

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

const updateAllMaterials = () => {
    scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
            // child.material.envMap = environmentMap
            child.material.envMapIntensity = 2.5
            child.castShadow = true
            child.receiveShadow = true
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

    gui.add(gltf.scene.rotation, 'x').min(-Math.PI).max(Math.PI).step(0.001).name('AstroRotationX')
    gui.add(gltf.scene.rotation, 'y').min(-Math.PI).max(Math.PI).step(0.001).name('AstroRotationY')
    gui.add(gltf.scene.position, 'x').min(-150).max(150).step(0.001).name('posX')
    gui.add(gltf.scene.position, 'y').min(-150).max(150).step(0.001).name('posY')
    gui.add(gltf.scene.position, 'z').min(-150).max(150).step(0.001).name('posZ')
    updateAllMaterials()
})
astroGroup.scale.set(0.3, 0.3, 0.3)
astroGroup.position.set(-3.5, -2, 0)
astroGroup.rotation.set(0.201, -0.536, -25)

gltfLoader.load('/models/astronaughtScene.glb', (gltf) => {
    gltf.scene.scale.set(0.3, 0.3, 0.3)
    gltf.scene.position.set(-3.5, -2, 0)
    gltf.scene.rotation.x = 0.2
    gltf.scene.rotation.y = -0.291
    gltf.scene.castShadow = true
    gltf.scene.receiveShadow = true
    scene.add(gltf.scene)

    gui.add(gltf.scene.rotation, 'x').min(-Math.PI).max(Math.PI).step(0.001).name('AstroRotationX')
    gui.add(gltf.scene.rotation, 'y').min(-Math.PI).max(Math.PI).step(0.001).name('AstroRotationY')
    gui.add(gltf.scene.position, 'x').min(-150).max(150).step(0.001).name('posX')
    gui.add(gltf.scene.position, 'y').min(-150).max(150).step(0.001).name('posY')
    gui.add(gltf.scene.position, 'z').min(-150).max(150).step(0.001).name('posZ')
    updateAllMaterials()
})

/**
 * Particles
 */
//  -------------------------------------------------------------------------
// Geometry
const particlesGeometry = new THREE.BufferGeometry()

const positions = new Float32Array(parameters.count * 3)
const colors = new Float32Array(parameters.count * 3)

for (let i = 0; i < parameters.count; i++) {
    positions[i] = (Math.random() - 0.5) * 50
    positions[i + 1] = 0
    positions[i + 2] = 0
    colors[i] = Math.random()
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

// Material
const particlesMaterial = new THREE.PointsMaterial()
particlesMaterial.size = 0.1
particlesMaterial.sizeAttenuation = true
// particlesMaterial.color = new THREE.Color('#ff88cc');
particlesMaterial.transparent = true
particlesMaterial.alphaMap = particleTexture
particlesMaterial.alphaTest = 0.001
particlesMaterial.depthTest = false
particlesMaterial.depthWrite = false
particlesMaterial.blending = THREE.AdditiveBlending
particlesMaterial.vertexColors = true

// Points
const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)
// gui.add(parameters, 'count').min(10000).max(100000).step(1000)
// .onChange(() => {
//     parameters.count = parameters.count
// })
//  -------------------------------------------------------------------------

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight('#ffffff', 2)
directionalLight.position.set(0.25, 2.601, 5)
directionalLight.castShadow = true
directionalLight.shadow.camera.far = 100
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.normalBias = 0.015
scene.add(directionalLight)

gui.add(directionalLight, 'intensity').min(0).max(10).step(0.001).name('moonLightIntensity')
gui.add(directionalLight.position, 'x').min(-5).max(5).step(0.001).name('moonLightX')
gui.add(directionalLight.position, 'y').min(-5).max(5).step(0.001).name('moonLightY')
gui.add(directionalLight.position, 'z').min(-5).max(5).step(0.001).name('moonLightZ')
gui.add(directionalLight.shadow, 'normalBias').min(0).max(0.1).step(0.0001)

const pointLight = new THREE.PointLight('#E79B58', 10)
pointLight.position.set(-0.605, -0.214, 0.177)
pointLight.castShadow = true
pointLight.shadow.camera.far = 50
pointLight.shadow.mapSize.set(1024, 1024)
pointLight.shadow.normalBias = 0.015
gui.add(pointLight, 'intensity').min(0).max(100).step(0.001).name('lightIntensity')
gui.add(pointLight.position, 'x').min(-15).max(15).step(0.001).name('pointLightX')
gui.add(pointLight.position, 'y').min(-15).max(15).step(0.001).name('pointLightY')
gui.add(pointLight.position, 'z').min(-15).max(15).step(0.001).name('pointLightZ')
scene.add(pointLight)

// const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 0.2)
// scene.add(directionalLightHelper)
// const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.2)
// scene.add(pointLightHelper)

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
})

/**
 * Camera
 */
// Group
const cameraGroup = new THREE.Group()
scene.add(cameraGroup)

// Base camera
const camera = new THREE.PerspectiveCamera(90, sizes.width / sizes.height, 0.1, 100)
camera.position.set(-3.32, 0, 5.154)
camera.rotation.set(0, 0, 0)
cameraGroup.add(camera)

gui.add(camera.position, 'x').min(-50).max(50).step(0.001).name('camera posX')
gui.add(camera.position, 'y').min(-50).max(50).step(0.001).name('camera posY')
gui.add(camera.position, 'z').min(-50).max(50).step(0.001).name('camera posZ')

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.physicallyCorrectLights = true
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 0.3
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFShadowMap

gui.add(renderer, 'toneMappingExposure').min(0).max(10).step(0.001)
gui.add(renderer, 'toneMapping', {
    No: THREE.NoToneMapping,
    Linear: THREE.LinearToneMapping,
    Reinhard: THREE.ReinhardToneMapping,
    Cineon: THREE.CineonToneMapping,
    ACESFilmic: THREE.ACESFilmicToneMapping,
})

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
        // gsap.to(sectionMeshes[currentSection].rotation, {
        //     duration: 1.5,
        //     ease: 'power2.inOut',
        //     x: '+=6',
        //     y: '+=3',
        //     z: '+=1.5',
        // })
        // if (currentSection === 1) {

        //     gsap.to(camera.position, { duration: 0.5, ease: 'power2.inOut', z: 1.894 })
        //     gsap.to(camera.position, { duration: 0.5, ease: 'power2.inOut', z: 1.894 })
        // }
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
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
