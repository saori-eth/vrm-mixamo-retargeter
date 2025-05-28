# VRM Animation Retargeting

A lightweight library for retargeting Mixamo FBX animations to VRM avatars using Three.js. This library provides a simple way to convert Mixamo animations to work with VRM models by handling the bone mapping and coordinate system differences.

## Features

- 🎯 **Simple API**: Pass an FBX object and VRM model to get a retargeted animation
- 🦴 **Automatic Bone Mapping**: Built-in mapping from Mixamo skeleton to VRM humanoid bones
- 📏 **Height Scaling**: Automatically scales animations based on avatar proportions
- ⚙️ **Configurable**: Support for custom bone mappings and options
- 🪶 **Lightweight**: Minimal dependencies - only requires Three.js and @pixiv/three-vrm
- 📦 **Universal**: Works in any JavaScript environment (browser, Node.js, React, Vue, etc.)
- 🔄 **Flexible**: Accept FBX objects directly or load from URLs

## Installation

```bash
npm install vrm-mixamo-retarget
```

### Peer Dependencies

Make sure you have the required peer dependencies installed:

```bash
npm install three @pixiv/three-vrm
```

## Basic Usage

### Using FBX Objects (Recommended)

```javascript
import { retargetAnimation } from 'vrm-mixamo-retarget'
import { VRMLoaderPlugin } from '@pixiv/three-vrm'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js'

// Load your VRM model
const gltfLoader = new GLTFLoader()
gltfLoader.register((parser) => new VRMLoaderPlugin(parser))
const gltf = await gltfLoader.loadAsync('path/to/your/avatar.vrm')
const vrm = gltf.userData.vrm

// Load FBX animation
const fbxLoader = new FBXLoader()
const fbxAsset = await fbxLoader.loadAsync('path/to/mixamo/animation.fbx')

// Retarget animation
const animationClip = retargetAnimation(fbxAsset, vrm)

if (animationClip) {
  // Use the animation clip with Three.js AnimationMixer
  const mixer = new THREE.AnimationMixer(vrm.scene)
  const action = mixer.clipAction(animationClip)
  action.play()
}
```

### Using URLs (Convenience Function)

```javascript
import { retargetAnimationFromUrl } from 'vrm-mixamo-retarget'

// This is equivalent to the above but loads the FBX for you
const animationClip = await retargetAnimationFromUrl(
  'path/to/mixamo/animation.fbx',
  vrm
)
```

## Advanced Usage

### Custom Configuration

```javascript
import { retargetAnimation } from 'vrm-mixamo-retarget'

const animationClip = retargetAnimation(
  fbxAsset,
  vrm,
  {
    // Custom bone mapping (extends default mapping)
    customBoneMap: {
      'mixamorigCustomBone': 'customVRMBone'
    },
    
    // Disable warning logs
    logWarnings: false,
    
    // Custom animation clip name in FBX
    animationClipName: 'Take 001'
  }
)
```

### React Three Fiber Example

```jsx
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js'
import { VRMLoaderPlugin } from '@pixiv/three-vrm'
import { retargetAnimation } from 'vrm-mixamo-retarget'
import { useEffect, useState } from 'react'

function AnimatedAvatar() {
  const [animationClip, setAnimationClip] = useState(null)
  
  // Load VRM
  const vrm = useLoader(GLTFLoader, '/avatar.vrm', (loader) => {
    loader.register((parser) => new VRMLoaderPlugin(parser))
  }).userData.vrm

  // Load FBX
  const fbxAsset = useLoader(FBXLoader, '/idle.fbx')

  // Retarget animation
  useEffect(() => {
    if (fbxAsset && vrm) {
      const clip = retargetAnimation(fbxAsset, vrm)
      setAnimationClip(clip)
    }
  }, [fbxAsset, vrm])

  return (
    <group>
      <primitive object={vrm.scene} />
      {/* Use animationClip with useAnimations hook */}
    </group>
  )
}
```

### Batch Processing Multiple Animations

```javascript
import { retargetAnimation } from 'vrm-mixamo-retarget'
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js'

const animationUrls = {
  idle: '/animations/idle.fbx',
  walk: '/animations/walk.fbx',
  run: '/animations/run.fbx',
  jump: '/animations/jump.fbx'
}

const loader = new FBXLoader()
const retargetedAnimations = {}

for (const [name, url] of Object.entries(animationUrls)) {
  const fbxAsset = await loader.loadAsync(url)
  const clip = retargetAnimation(fbxAsset, vrm)
  if (clip) {
    clip.name = name
    retargetedAnimations[name] = clip
  }
}
```

## API Reference

### `retargetAnimation(fbxAsset, vrm, options?)`

Retargets a loaded FBX animation for use with a VRM avatar.

**Parameters:**
- `fbxAsset` (THREE.Group): Loaded FBX object containing Mixamo animation
- `vrm` (VRM): The target VRM model from @pixiv/three-vrm
- `options` (RetargetingOptions, optional): Configuration options

**Returns:** `THREE.AnimationClip | null`

### `retargetAnimationFromUrl(url, vrm, options?)`

Convenience function that loads an FBX from URL and retargets it.

**Parameters:**
- `url` (string): URL or path to the Mixamo FBX animation file
- `vrm` (VRM): The target VRM model from @pixiv/three-vrm
- `options` (RetargetingOptions, optional): Configuration options

**Returns:** `Promise<THREE.AnimationClip | null>`

### `RetargetingOptions`

```typescript
interface RetargetingOptions {
  /** Custom bone mapping from Mixamo to VRM (extends default mapping) */
  customBoneMap?: Partial<typeof mixamoVRMRigMap>
  
  /** Whether to log warnings for missing bones (default: true) */
  logWarnings?: boolean
  
  /** Custom animation clip name in the FBX file (default: 'mixamo.com') */
  animationClipName?: string
}
```

### `mixamoVRMRigMap`

The default bone mapping from Mixamo skeleton names to VRM humanoid bone names. You can import this to see all supported bones or extend it with custom mappings.

```javascript
import { mixamoVRMRigMap } from 'vrm-mixamo-retarget'
console.log(mixamoVRMRigMap)
```

## Supported Bones

The library supports all standard Mixamo bones including:
- Body: hips, spine, chest, neck, head
- Arms: shoulders, upper arms, lower arms, hands
- Fingers: all finger bones for both hands
- Legs: upper legs, lower legs, feet, toes

## Why Use FBX Objects Instead of URLs?

The main `retargetAnimation` function accepts FBX objects directly because:

- **Flexibility**: You control how and when to load the FBX
- **Performance**: Reuse loaded FBX objects for multiple VRM models
- **Framework agnostic**: Works with any loading strategy
- **Error handling**: Handle loading errors separately from retargeting errors
- **Caching**: Implement your own caching strategy

The `retargetAnimationFromUrl` function is provided as a convenience for simple use cases.

## Browser Compatibility

This library works in all modern browsers that support:
- ES2020 features
- WebGL (for Three.js)
- Fetch API (for loading files)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details.

## Credits

Based on the VRM animation retargeting algorithm from the Three.js VRM community. 