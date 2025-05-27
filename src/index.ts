import * as THREE from 'three'
// @ts-ignore - FBXLoader types are not available in @types/three
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js'
import type { VRM, VRMHumanBoneName } from '@pixiv/three-vrm'

/**
 * A map from Mixamo rig name to VRM Humanoid bone name
 */
export const mixamoVRMRigMap = {
  mixamorigHips: 'hips',
  mixamorigSpine: 'spine',
  mixamorigSpine1: 'chest',
  mixamorigSpine2: 'upperChest',
  mixamorigNeck: 'neck',
  mixamorigHead: 'head',
  mixamorigLeftShoulder: 'leftShoulder',
  mixamorigLeftArm: 'leftUpperArm',
  mixamorigLeftForeArm: 'leftLowerArm',
  mixamorigLeftHand: 'leftHand',
  mixamorigLeftHandThumb1: 'leftThumbMetacarpal',
  mixamorigLeftHandThumb2: 'leftThumbProximal',
  mixamorigLeftHandThumb3: 'leftThumbDistal',
  mixamorigLeftHandIndex1: 'leftIndexProximal',
  mixamorigLeftHandIndex2: 'leftIndexIntermediate',
  mixamorigLeftHandIndex3: 'leftIndexDistal',
  mixamorigLeftHandMiddle1: 'leftMiddleProximal',
  mixamorigLeftHandMiddle2: 'leftMiddleIntermediate',
  mixamorigLeftHandMiddle3: 'leftMiddleDistal',
  mixamorigLeftHandRing1: 'leftRingProximal',
  mixamorigLeftHandRing2: 'leftRingIntermediate',
  mixamorigLeftHandRing3: 'leftRingDistal',
  mixamorigLeftHandPinky1: 'leftLittleProximal',
  mixamorigLeftHandPinky2: 'leftLittleIntermediate',
  mixamorigLeftHandPinky3: 'leftLittleDistal',
  mixamorigRightShoulder: 'rightShoulder',
  mixamorigRightArm: 'rightUpperArm',
  mixamorigRightForeArm: 'rightLowerArm',
  mixamorigRightHand: 'rightHand',
  mixamorigRightHandPinky1: 'rightLittleProximal',
  mixamorigRightHandPinky2: 'rightLittleIntermediate',
  mixamorigRightHandPinky3: 'rightLittleDistal',
  mixamorigRightHandRing1: 'rightRingProximal',
  mixamorigRightHandRing2: 'rightRingIntermediate',
  mixamorigRightHandRing3: 'rightRingDistal',
  mixamorigRightHandMiddle1: 'rightMiddleProximal',
  mixamorigRightHandMiddle2: 'rightMiddleIntermediate',
  mixamorigRightHandMiddle3: 'rightMiddleDistal',
  mixamorigRightHandIndex1: 'rightIndexProximal',
  mixamorigRightHandIndex2: 'rightIndexIntermediate',
  mixamorigRightHandIndex3: 'rightIndexDistal',
  mixamorigRightHandThumb1: 'rightThumbMetacarpal',
  mixamorigRightHandThumb2: 'rightThumbProximal',
  mixamorigRightHandThumb3: 'rightThumbDistal',
  mixamorigLeftUpLeg: 'leftUpperLeg',
  mixamorigLeftLeg: 'leftLowerLeg',
  mixamorigLeftFoot: 'leftFoot',
  mixamorigLeftToeBase: 'leftToes',
  mixamorigRightUpLeg: 'rightUpperLeg',
  mixamorigRightLeg: 'rightLowerLeg',
  mixamorigRightFoot: 'rightFoot',
  mixamorigRightToeBase: 'rightToes',
} as const

/**
 * Configuration options for animation retargeting
 */
export interface RetargetingOptions {
  /** Custom bone mapping from Mixamo to VRM (overrides default mapping) */
  customBoneMap?: Partial<typeof mixamoVRMRigMap>
  /** Whether to log warnings for missing bones (default: true) */
  logWarnings?: boolean
  /** Custom animation clip name in the FBX file (default: 'mixamo.com') */
  animationClipName?: string
}

/**
 * Retarget Mixamo animation from FBX object for three-vrm use.
 *
 * @param fbxAsset A loaded FBX object containing Mixamo animation data
 * @param vrm A target VRM
 * @param options Optional configuration for retargeting
 * @returns THREE.AnimationClip | null The converted AnimationClip or null if failed
 */
export const retargetAnimation = (
  fbxAsset: THREE.Group,
  vrm: VRM,
  options: RetargetingOptions = {}
): THREE.AnimationClip | null => {
  const {
    customBoneMap = {},
    logWarnings = true,
    animationClipName = 'mixamo.com'
  } = options

  const boneMap = { ...mixamoVRMRigMap, ...customBoneMap }

  try {
    const clip = THREE.AnimationClip.findByName(fbxAsset.animations, animationClipName)
    if (!clip) {
      if (logWarnings) {
        console.warn(`Animation clip "${animationClipName}" not found in FBX asset`)
      }
      return null
    }

    const tracks: THREE.KeyframeTrack[] = []
    const restRotationInverse = new THREE.Quaternion()
    const parentRestWorldRotation = new THREE.Quaternion()
    const _quatA = new THREE.Quaternion()
    const _vec3 = new THREE.Vector3()

    // Adjust with reference to hips height.
    const motionHipsHeight = fbxAsset.getObjectByName('mixamorigHips')?.position.y
    const vrmHipsY = vrm.humanoid
      ?.getNormalizedBoneNode('hips')
      ?.getWorldPosition(_vec3).y
    const vrmRootY = vrm.scene.getWorldPosition(_vec3).y
    
    if (!vrmHipsY || !motionHipsHeight) {
      if (logWarnings) {
        console.warn('Failed to calculate hips height scaling - animation may not be properly scaled')
      }
      return null
    }
    
    const vrmHipsHeight = Math.abs(vrmHipsY - vrmRootY)
    const hipsPositionScale = vrmHipsHeight / motionHipsHeight

    clip.tracks.forEach((track: THREE.KeyframeTrack) => {
      // Convert each tracks for VRM use, and push to `tracks`
      const trackSplitted = track.name.split('.')
      const mixamoRigName = trackSplitted[0]

      const vrmBoneName = boneMap[mixamoRigName as keyof typeof boneMap]
      const vrmNodeName = vrm.humanoid?.getNormalizedBoneNode(
        vrmBoneName as VRMHumanBoneName
      )?.name
      const mixamoRigNode = fbxAsset.getObjectByName(mixamoRigName)

      if (vrmNodeName != null) {
        const propertyName = trackSplitted[1]

        // Store rotations of rest-pose.
        mixamoRigNode?.getWorldQuaternion(restRotationInverse).invert()
        mixamoRigNode?.parent?.getWorldQuaternion(parentRestWorldRotation)

        if (track instanceof THREE.QuaternionKeyframeTrack) {
          // Retarget rotation of mixamoRig to NormalizedBone.
          for (let i = 0; i < track.values.length; i += 4) {
            const flatQuaternion = track.values.slice(i, i + 4)

            _quatA.fromArray(flatQuaternion)

            // 親のレスト時ワールド回転 * トラックの回転 * レスト時ワールド回転の逆
            _quatA
              .premultiply(parentRestWorldRotation)
              .multiply(restRotationInverse)

            _quatA.toArray(flatQuaternion)

            flatQuaternion.forEach((v: number, index: number) => {
              track.values[index + i] = v
            })
          }

          tracks.push(
            new THREE.QuaternionKeyframeTrack(
              `${vrmNodeName}.${propertyName}`,
              track.times,
              track.values.map((v: number, i: number) =>
                vrm.meta?.metaVersion === '0' && i % 2 === 0 ? -v : v
              )
            )
          )
        } else if (track instanceof THREE.VectorKeyframeTrack) {
          const value = track.values.map(
            (v: number, i: number) =>
              (vrm.meta?.metaVersion === '0' && i % 3 !== 1 ? -v : v) *
              hipsPositionScale
          )
          tracks.push(
            new THREE.VectorKeyframeTrack(
              `${vrmNodeName}.${propertyName}`,
              track.times,
              value
            )
          )
        }
      } else if (logWarnings && vrmBoneName) {
        console.warn(`VRM bone "${vrmBoneName}" not found in humanoid for Mixamo bone "${mixamoRigName}"`)
      }
    })

    return new THREE.AnimationClip('vrmAnimation', clip.duration, tracks)
  } catch (error) {
    if (logWarnings) {
      console.error('Failed to retarget animation:', error)
    }
    return null
  }
}

/**
 * Load Mixamo animation from URL, convert for three-vrm use, and return it.
 * This is a convenience function that loads the FBX and then retargets it.
 *
 * @param url A url of mixamo animation data
 * @param vrm A target VRM
 * @param options Optional configuration for retargeting
 * @returns Promise<THREE.AnimationClip | null> The converted AnimationClip or null if failed
 */
export const retargetAnimationFromUrl = async (
  url: string,
  vrm: VRM,
  options: RetargetingOptions = {}
): Promise<THREE.AnimationClip | null> => {
  const { logWarnings = true } = options

  try {
    const loader = new FBXLoader()
    const fbxAsset = await loader.loadAsync(url)
    return retargetAnimation(fbxAsset, vrm, options)
  } catch (error) {
    if (logWarnings) {
      console.error('Failed to load FBX from URL:', error)
    }
    return null
  }
}

/**
 * Legacy function name for backward compatibility
 * @deprecated Use retargetAnimationFromUrl instead
 */
export const loadAnim = retargetAnimationFromUrl

// Export types for external use
export type { VRM, VRMHumanBoneName } from '@pixiv/three-vrm'
export type { AnimationClip, KeyframeTrack } from 'three' 