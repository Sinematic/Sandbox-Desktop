import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import GUI from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */

const textureLoader = new THREE.TextureLoader()
const floorColorTexture = textureLoader.load('/textures/laminate_floor/laminate_floor_02_diff_1k.jpg')
const floorARMTexture = textureLoader.load('/textures/laminate_floor/laminate_floor_02_arm_1k.jpg')
const floorNormalTexture = textureLoader.load('/textures/laminate_floor/laminate_floor_02_nor_gl_1k.jpg')
const floorDisplacementTexture = textureLoader.load('/textures/laminate_floor/laminate_floor_02_disp_1k.jpg')

floorColorTexture.repeat.set(3, 3)
floorColorTexture.wrapS = THREE.RepeatWrapping
floorColorTexture.wrapT = THREE.RepeatWrapping

floorColorTexture.colorSpace = THREE.SRGBColorSpace

/**
 * Models
 */
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')

const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

let mixer = null
let burger, plate, desktop, phone

gltfLoader.load(
    '/models/burger.glb',
    (gltf) =>
    {
        burger = gltf.scene
        burger.position.y = 1.89
        burger.scale.set(0.02, 0.02, 0.02)
        scene.add(burger)
        //gui.add(burger.position, 'y').min(2).max(3).step(0.001).name('Hauteur Burger')

    }
)


gltfLoader.load(
    '/models/desktop.glb',
    (gltf) =>
    {
        desktop = gltf.scene
        desktop.position.y = 1
        scene.add(desktop)
    }
)

gltfLoader.load(
    '/models/plate.glb',
    (gltf) =>
    {
        plate = gltf.scene
        plate.position.y = 1.67
        plate.scale.set(0.4, 0.4, 0.4)
        scene.add(plate)
        gui.add(plate.position, 'y').min(1.2).max(2).step(0.001).name('Hauteur Assiette')
    }
)

gltfLoader.load(
'/models/phone.glb',
(gltf) =>
{
    phone = gltf.scene
    phone.position.set(0.5, 1.84, 1)
    phone.scale.set(0.05, 0.05, 0.05)
    scene.add(phone)
    //gui.add(burger.position, 'y').min(2).max(3).step(0.001).name('Hauteur Burger')

}
)


/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(12, 12),
    new THREE.MeshStandardMaterial({
        transparent: true,
        map: floorColorTexture,
        aoMap: floorARMTexture,
        roughnessMap: floorARMTexture,
        metalnessMap: floorARMTexture,
        normalMap: floorNormalTexture,
        displacementMap: floorDisplacementTexture,
    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
floor.rotation.z = - Math.PI * 0.5
scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
directionalLight.lookAt(0, 0, 0)
directionalLight.castShadow = true;
scene.add(directionalLight)

gui.add(directionalLight, 'intensity').min(0).max(10).step(0.01)


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
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
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(3, 3, 1)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 1, 0)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    if(mixer)
    {
        mixer.update(deltaTime)
    }

    if(burger)
    {
        burger.rotation.y += 0.1 * deltaTime
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()