# VRM Animation Retargeting Library Overview

## What This Library Does

This library solves a specific problem in the 3D animation world: **retargeting Mixamo FBX animations to work with VRM avatars**.

### The Problem
- **VRM models** use a standardized humanoid bone structure
- **Mixamo animations** use their own bone naming convention
- **Direct application** of Mixamo animations to VRM models doesn't work due to:
  - Different bone names
  - Different coordinate systems
  - Different proportions/scaling

### The Solution
This library provides a mathematical transformation that:
1. **Maps bones** from Mixamo naming to VRM humanoid bones
2. **Converts coordinate systems** between the two formats
3. **Scales animations** based on avatar proportions
4. **Outputs** a Three.js AnimationClip ready for use

## Library Architecture

### Core Function: `retargetAnimation()`
```javascript
const animationClip = await retargetAnimation(fbxUrl, vrmModel, options)
```

**Input:**
- FBX file URL (Mixamo animation)
- VRM model instance
- Optional configuration

**Output:**
- Three.js AnimationClip (or null if failed)

### Key Features

1. **Automatic Bone Mapping**
   - Built-in mapping for all standard Mixamo → VRM bones
   - Support for custom bone mappings
   - Handles body, arms, hands, fingers, legs

2. **Proportional Scaling**
   - Calculates height difference between Mixamo rig and VRM
   - Scales position animations accordingly
   - Preserves rotation animations

3. **Coordinate System Conversion**
   - Handles VRM v0 and v1 coordinate differences
   - Applies proper quaternion transformations
   - Maintains animation timing and curves

4. **Error Handling**
   - Graceful failure with null return
   - Optional warning/error logging
   - Validation of required bones

## Technical Implementation

### Bone Mapping
```javascript
const mixamoVRMRigMap = {
  'mixamorigHips': 'hips',
  'mixamorigSpine': 'spine',
  'mixamorigLeftArm': 'leftUpperArm',
  // ... 50+ bone mappings
}
```

### Transformation Process
1. **Load FBX** using Three.js FBXLoader
2. **Extract animation clip** (usually named 'mixamo.com')
3. **Calculate scaling** based on hip heights
4. **Process each track:**
   - Map bone names
   - Transform rotations (quaternions)
   - Scale positions (vectors)
   - Handle coordinate system differences
5. **Create new AnimationClip** with transformed tracks

### Build System
- **TypeScript** source code
- **Rollup** for bundling
- **Dual output:** CommonJS + ES Modules
- **Type definitions** included
- **Peer dependencies:** Three.js + @pixiv/three-vrm

## Usage Scenarios

### 1. Game Development
```javascript
// Load character and animations
const vrm = await loadVRM('character.vrm')
const walkClip = await retargetAnimation('walk.fbx', vrm)
const runClip = await retargetAnimation('run.fbx', vrm)

// Use in game loop
const mixer = new THREE.AnimationMixer(vrm.scene)
mixer.clipAction(walkClip).play()
```

### 2. Web Applications
```javascript
// React Three Fiber component
function AnimatedAvatar({ animationUrl }) {
  const vrm = useVRMLoader('/avatar.vrm')
  const clip = useRetargetedAnimation(animationUrl, vrm)
  
  return <primitive object={vrm.scene} />
}
```

### 3. Batch Processing
```javascript
// Process multiple animations
const animations = ['idle', 'walk', 'run', 'jump']
const clips = await Promise.all(
  animations.map(name => 
    retargetAnimation(`${name}.fbx`, vrm)
  )
)
```

## Advantages

### For Developers
- **Simple API:** One function call to retarget animations
- **Framework agnostic:** Works with vanilla JS, React, Vue, etc.
- **Type safe:** Full TypeScript support
- **Well documented:** Examples and API reference

### For Projects
- **Huge animation library:** Access to thousands of Mixamo animations
- **Consistent avatars:** Use any VRM model with any Mixamo animation
- **Performance:** Retargeting happens once, animations play smoothly
- **Flexibility:** Custom bone mappings for special cases

## Limitations

### Current Constraints
- **Mixamo specific:** Designed for Mixamo → VRM workflow
- **Humanoid only:** Requires humanoid bone structure
- **FBX format:** Input must be FBX files
- **Browser/Node.js:** Requires JavaScript environment

### Future Enhancements
- Support for other animation formats (BVH, etc.)
- Non-humanoid character support
- Animation blending utilities
- Performance optimizations

## File Structure

```
lib/vrm-animation-retargeting/
├── src/index.ts              # Main library code
├── dist/                     # Built library files
├── examples/                 # Usage examples
├── test/                     # Basic tests
├── package.json              # NPM configuration
├── tsconfig.json             # TypeScript config
├── rollup.config.js          # Build configuration
├── README.md                 # User documentation
├── SETUP.md                  # Setup instructions
└── LIBRARY_OVERVIEW.md       # This file
```

## Getting Started

1. **Build the library:**
   ```bash
   cd lib/vrm-animation-retargeting
   npm install && npm run build
   ```

2. **Use in your project:**
   ```javascript
   import { retargetAnimation } from 'vrm-animation-retargeting'
   const clip = await retargetAnimation('animation.fbx', vrmModel)
   ```

3. **See examples** in the `examples/` directory

This library makes it trivial to bring the vast world of Mixamo animations to VRM avatars, opening up endless possibilities for character animation in web applications, games, and interactive experiences. 