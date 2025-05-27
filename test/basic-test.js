// Basic test to verify library exports
// This can be run with Node.js to check if the build is working

// Test CommonJS import
try {
  const lib = require('../dist/index.js')
  console.log('✅ CommonJS import successful')
  console.log('Exports:', Object.keys(lib))
  
  if (lib.retargetAnimation && typeof lib.retargetAnimation === 'function') {
    console.log('✅ retargetAnimation function found')
  } else {
    console.log('❌ retargetAnimation function not found')
  }
  
  if (lib.mixamoVRMRigMap && typeof lib.mixamoVRMRigMap === 'object') {
    console.log('✅ mixamoVRMRigMap object found')
    console.log('Bone mappings count:', Object.keys(lib.mixamoVRMRigMap).length)
  } else {
    console.log('❌ mixamoVRMRigMap object not found')
  }
  
  if (lib.loadAnim && typeof lib.loadAnim === 'function') {
    console.log('✅ loadAnim (legacy) function found')
  } else {
    console.log('❌ loadAnim (legacy) function not found')
  }
  
} catch (error) {
  console.log('❌ CommonJS import failed:', error.message)
}

// Test ES module import (requires Node.js with ES modules support)
async function testESModule() {
  try {
    const lib = await import('../dist/index.esm.js')
    console.log('✅ ES Module import successful')
    console.log('Exports:', Object.keys(lib))
  } catch (error) {
    console.log('❌ ES Module import failed:', error.message)
  }
}

// Run ES module test if supported
if (process.version.split('.')[0].slice(1) >= 14) {
  testESModule()
} else {
  console.log('⚠️  ES Module test skipped (Node.js 14+ required)')
}

console.log('\nTest completed. Make sure to build the library first with: npm run build') 