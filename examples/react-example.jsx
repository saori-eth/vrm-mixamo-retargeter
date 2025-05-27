import React, { useEffect, useState, useRef } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js'
import { VRMLoaderPlugin } from '@pixiv/three-vrm'
import { useAnimations } from '@react-three/drei'
import { retargetAnimation } from 'vrm-animation-retargeting'

// Component for animated VRM avatar
function AnimatedAvatar({ vrmUrl, animationUrl }) {
  const [animationClip, setAnimationClip] = useState(null)
  const groupRef = useRef()
  
  // Load VRM model
  const vrm = useLoader(GLTFLoader, vrmUrl, (loader) => {
    loader.register((parser) => new VRMLoaderPlugin(parser))
  }).userData.vrm

  // Load FBX animation
  const fbxAsset = useLoader(FBXLoader, animationUrl)

  // Set up animations
  const { mixer, actions } = useAnimations(
    animationClip ? [animationClip] : [], 
    groupRef
  )

  // Retarget animation when FBX or VRM changes
  useEffect(() => {
    if (!vrm || !fbxAsset) return

    console.log('Retargeting animation...')
    const clip = retargetAnimation(fbxAsset, vrm, {
      logWarnings: true
    })
    
    if (clip) {
      clip.name = 'retargeted'
      setAnimationClip(clip)
      console.log('Animation retargeted successfully!')
    } else {
      console.error('Failed to retarget animation')
    }
  }, [vrm, fbxAsset])

  // Play animation when it's loaded
  useEffect(() => {
    if (actions.retargeted) {
      actions.retargeted.play()
    }
  }, [actions])

  // Update VRM and mixer each frame
  useFrame((_, delta) => {
    if (vrm) {
      vrm.update(delta)
    }
    if (mixer) {
      mixer.update(delta)
    }
  })

  return (
    <group ref={groupRef}>
      <primitive object={vrm.scene} />
    </group>
  )
}

// Alternative component using the URL convenience function
function AnimatedAvatarFromUrl({ vrmUrl, animationUrl }) {
  const [animationClip, setAnimationClip] = useState(null)
  const groupRef = useRef()
  
  // Load VRM model
  const vrm = useLoader(GLTFLoader, vrmUrl, (loader) => {
    loader.register((parser) => new VRMLoaderPlugin(parser))
  }).userData.vrm

  // Set up animations
  const { mixer, actions } = useAnimations(
    animationClip ? [animationClip] : [], 
    groupRef
  )

  // Load and retarget animation using URL function
  useEffect(() => {
    if (!vrm || !animationUrl) return

    // Using the convenience function
    import('vrm-animation-retargeting').then(({ retargetAnimationFromUrl }) => {
      retargetAnimationFromUrl(animationUrl, vrm, {
        logWarnings: true
      }).then((clip) => {
        if (clip) {
          clip.name = 'retargeted'
          setAnimationClip(clip)
        }
      })
    })
  }, [vrm, animationUrl])

  // Play animation when it's loaded
  useEffect(() => {
    if (actions.retargeted) {
      actions.retargeted.play()
    }
  }, [actions])

  // Update VRM and mixer each frame
  useFrame((_, delta) => {
    if (vrm) {
      vrm.update(delta)
    }
    if (mixer) {
      mixer.update(delta)
    }
  })

  return (
    <group ref={groupRef}>
      <primitive object={vrm.scene} />
    </group>
  )
}

// Main App component
function App() {
  const [vrmUrl, setVrmUrl] = useState('/avatar.vrm')
  const [animationUrl, setAnimationUrl] = useState('/idle.fbx')
  const [useUrlMethod, setUseUrlMethod] = useState(false)

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {/* Controls */}
      <div style={{ 
        position: 'absolute', 
        top: 10, 
        left: 10, 
        zIndex: 100,
        background: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px'
      }}>
        <h3>VRM Animation Retargeting Demo</h3>
        <div>
          <label>
            VRM URL: 
            <input 
              type="text" 
              value={vrmUrl} 
              onChange={(e) => setVrmUrl(e.target.value)}
              style={{ marginLeft: '10px', width: '200px' }}
            />
          </label>
        </div>
        <div style={{ marginTop: '10px' }}>
          <label>
            Animation URL: 
            <input 
              type="text" 
              value={animationUrl} 
              onChange={(e) => setAnimationUrl(e.target.value)}
              style={{ marginLeft: '10px', width: '200px' }}
            />
          </label>
        </div>
        <div style={{ marginTop: '10px' }}>
          <label>
            <input 
              type="checkbox" 
              checked={useUrlMethod} 
              onChange={(e) => setUseUrlMethod(e.target.checked)}
            />
            Use URL convenience method
          </label>
        </div>
      </div>

      {/* 3D Scene */}
      <Canvas camera={{ position: [0, 1, 3] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        {useUrlMethod ? (
          <AnimatedAvatarFromUrl vrmUrl={vrmUrl} animationUrl={animationUrl} />
        ) : (
          <AnimatedAvatar vrmUrl={vrmUrl} animationUrl={animationUrl} />
        )}
      </Canvas>
    </div>
  )
}

export default App 