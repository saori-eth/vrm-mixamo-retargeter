# Setup Guide for VRM Animation Retargeting Library

This guide will help you set up and use the VRM Animation Retargeting library.

## Quick Start

### 1. Build the Library

```bash
cd lib/vrm-animation-retargeting
npm install
npm run build
```

Or use the build script:
```bash
./build.sh
```

### 2. Use in Your Project

#### Option A: Copy the built files
Copy the `dist/` folder contents to your project and import:

```javascript
// For ES modules
import { retargetAnimation } from './path/to/dist/index.esm.js'

// For CommonJS
const { retargetAnimation } = require('./path/to/dist/index.js')
```

#### Option B: Install as local package
From your project root:
```bash
npm install ./lib/vrm-animation-retargeting
```

Then import normally:
```javascript
import { retargetAnimation } from 'vrm-animation-retargeting'
```

#### Option C: Publish to npm (for distribution)
```bash
cd lib/vrm-animation-retargeting
npm publish
```

## Usage Examples

### Basic Usage (Recommended)

```javascript
import { retargetAnimation } from 'vrm-animation-retargeting'
import { VRMLoaderPlugin } from '@pixiv/three-vrm'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js'

// Load VRM
const gltfLoader = new GLTFLoader()
gltfLoader.register((parser) => new VRMLoaderPlugin(parser))
const gltf = await gltfLoader.loadAsync('avatar.vrm')
const vrm = gltf.userData.vrm

// Load FBX
const fbxLoader = new FBXLoader()
const fbxAsset = await fbxLoader.loadAsync('animation.fbx')

// Retarget animation
const clip = retargetAnimation(fbxAsset, vrm)
if (clip) {
  // Use with Three.js AnimationMixer
  const mixer = new THREE.AnimationMixer(vrm.scene)
  const action = mixer.clipAction(clip)
  action.play()
}
```

### Using URL Convenience Function

```javascript
import { retargetAnimationFromUrl } from 'vrm-animation-retargeting'

// This loads the FBX for you
const clip = await retargetAnimationFromUrl('animation.fbx', vrm)
```

### With Custom Options

```javascript
const clip = retargetAnimation(fbxAsset, vrm, {
  customBoneMap: {
    'mixamorigCustomBone': 'customVRMBone'
  },
  logWarnings: false,
  animationClipName: 'Take 001'
})
```

### React Three Fiber

```jsx
import { retargetAnimation } from 'vrm-animation-retargeting'
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js'
import { VRMLoaderPlugin } from '@pixiv/three-vrm'

function AnimatedAvatar() {
  const vrm = useLoader(GLTFLoader, '/avatar.vrm', (loader) => {
    loader.register((parser) => new VRMLoaderPlugin(parser))
  }).userData.vrm

  const fbxAsset = useLoader(FBXLoader, '/idle.fbx')

  useEffect(() => {
    if (fbxAsset && vrm) {
      const clip = retargetAnimation(fbxAsset, vrm)
      if (clip) {
        // Use clip with useAnimations hook
      }
    }
  }, [fbxAsset, vrm])

  return <primitive object={vrm.scene} />
}
```

## API Reference

### `retargetAnimation(fbxAsset, vrm, options?)`

**Parameters:**
- `fbxAsset` (THREE.Group): Loaded FBX object containing Mixamo animation
- `vrm` (VRM): VRM model instance
- `options` (optional): Configuration object

**Options:**
- `customBoneMap`: Override default bone mapping
- `logWarnings`: Enable/disable console warnings (default: true)
- `animationClipName`: FBX animation clip name (default: 'mixamo.com')

**Returns:** `AnimationClip | null`

### `retargetAnimationFromUrl(url, vrm, options?)`

Convenience function that loads FBX from URL and retargets it.

**Parameters:**
- `url` (string): Path to Mixamo FBX file
- `vrm` (VRM): VRM model instance
- `options` (optional): Configuration object

**Returns:** `Promise<AnimationClip | null>`

### `mixamoVRMRigMap`

Default bone mapping from Mixamo to VRM bones. Can be imported and extended:

```javascript
import { mixamoVRMRigMap } from 'vrm-animation-retargeting'
```

## Why Use FBX Objects?

The main `retargetAnimation` function accepts FBX objects directly because:

- **Performance**: Reuse loaded FBX objects for multiple VRM models
- **Flexibility**: You control loading strategy and error handling
- **Framework agnostic**: Works with any loading approach
- **Caching**: Implement your own caching strategy
- **Separation of concerns**: Loading vs. retargeting are separate operations

## Troubleshooting

### Common Issues

1. **"Cannot find module" errors**: Make sure peer dependencies are installed:
   ```bash
   npm install three @pixiv/three-vrm
   ```

2. **Animation not playing**: Check that the VRM has the required bones and the FBX contains 'mixamo.com' animation clip.

3. **Build errors**: Ensure you have Node.js 16+ and TypeScript installed.

### Debug Mode

Enable detailed logging:
```javascript
const clip = retargetAnimation(fbxAsset, vrm, { logWarnings: true })
```

## File Structure

```
lib/vrm-animation-retargeting/
├── src/
│   └── index.ts          # Main library code
├── dist/                 # Built files (after npm run build)
│   ├── index.js          # CommonJS build
│   ├── index.esm.js      # ES Module build
│   └── index.d.ts        # TypeScript definitions
├── examples/             # Usage examples
├── package.json          # Package configuration
├── tsconfig.json         # TypeScript config
├── rollup.config.js      # Build configuration
└── README.md             # Documentation
```

## Contributing

1. Make changes to `src/index.ts`
2. Run `npm run build` to rebuild
3. Test with the examples
4. Update documentation as needed

## License

MIT License - see LICENSE file for details. 