import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js'
import { VRMLoaderPlugin } from '@pixiv/three-vrm'
import { retargetAnimation, retargetAnimationFromUrl } from 'vrm-mixamo-retarget'

// Basic example of using vrm-mixamo-retarget
async function main() {
  // Set up Three.js scene
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  const renderer = new THREE.WebGLRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(renderer.domElement)

  // Load VRM model
  const gltfLoader = new GLTFLoader()
  gltfLoader.register((parser) => new VRMLoaderPlugin(parser))
  
  try {
    console.log('Loading VRM model...')
    const gltf = await gltfLoader.loadAsync('path/to/your/avatar.vrm')
    const vrm = gltf.userData.vrm
    
    // Add VRM to scene
    scene.add(vrm.scene)
    
    // Method 1: Using FBX objects directly (recommended)
    console.log('Loading FBX animation...')
    const fbxLoader = new FBXLoader()
    const fbxAsset = await fbxLoader.loadAsync('path/to/mixamo/animation.fbx')
    
    console.log('Retargeting animation...')
    const animationClip = retargetAnimation(fbxAsset, vrm, {
      logWarnings: true // Enable detailed logging
    })
    
    // Method 2: Using URL convenience function (alternative)
    // const animationClip = await retargetAnimationFromUrl(
    //   'path/to/mixamo/animation.fbx',
    //   vrm,
    //   { logWarnings: true }
    // )
    
    if (animationClip) {
      console.log('Animation retargeted successfully!')
      
      // Set up animation mixer
      const mixer = new THREE.AnimationMixer(vrm.scene)
      const action = mixer.clipAction(animationClip)
      action.play()
      
      // Animation loop
      const clock = new THREE.Clock()
      
      function animate() {
        requestAnimationFrame(animate)
        
        const deltaTime = clock.getDelta()
        
        // Update VRM
        vrm.update(deltaTime)
        
        // Update animation mixer
        mixer.update(deltaTime)
        
        // Render scene
        renderer.render(scene, camera)
      }
      
      // Position camera
      camera.position.z = 5
      
      // Start animation loop
      animate()
      
    } else {
      console.error('Failed to retarget animation')
    }
    
  } catch (error) {
    console.error('Error loading VRM or animation:', error)
  }
}

// Example of batch processing multiple animations
async function batchExample() {
  console.log('Batch processing example...')
  
  // Load VRM once
  const gltfLoader = new GLTFLoader()
  gltfLoader.register((parser) => new VRMLoaderPlugin(parser))
  const gltf = await gltfLoader.loadAsync('path/to/your/avatar.vrm')
  const vrm = gltf.userData.vrm
  
  // Load multiple FBX files
  const fbxLoader = new FBXLoader()
  const animationUrls = {
    idle: 'path/to/idle.fbx',
    walk: 'path/to/walk.fbx',
    run: 'path/to/run.fbx'
  }
  
  const retargetedAnimations = {}
  
  for (const [name, url] of Object.entries(animationUrls)) {
    try {
      console.log(`Loading ${name} animation...`)
      const fbxAsset = await fbxLoader.loadAsync(url)
      const clip = retargetAnimation(fbxAsset, vrm)
      
      if (clip) {
        clip.name = name
        retargetedAnimations[name] = clip
        console.log(`✅ ${name} animation retargeted successfully`)
      } else {
        console.log(`❌ Failed to retarget ${name} animation`)
      }
    } catch (error) {
      console.error(`Error processing ${name}:`, error)
    }
  }
  
  console.log('Batch processing complete:', Object.keys(retargetedAnimations))
}

// Run the examples
main()

// Uncomment to run batch example
// batchExample() 