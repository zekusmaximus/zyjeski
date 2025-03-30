// Save this as themes/AUTHOR/static/js/vr-buddha-transition.js

document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('3d-transition-container');
    if (!container) return;
    
    // Set up Three.js scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    
    // Add responsive handling
    window.addEventListener('resize', function() {
      renderer.setSize(container.clientWidth, container.clientHeight);
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
    });
    
    // Create lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0x00ffff, 0.8);
    directionalLight.position.set(0, 10, 10);
    scene.add(directionalLight);
    
    // Create VR Headset geometry (simplified for demo)
    const vrHeadset = new THREE.Group();
    
    // Main body
    const headsetGeometry = new THREE.BoxGeometry(1.5, 0.8, 0.8);
    const headsetMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x111111,
      shininess: 50,
      specular: 0x666666
    });
    const headsetMesh = new THREE.Mesh(headsetGeometry, headsetMaterial);
    vrHeadset.add(headsetMesh);
    
    // Lenses
    const lensGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 32);
    const lensMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x0088ff,
      shininess: 100,
      specular: 0xffffff
    });
    
    const leftLens = new THREE.Mesh(lensGeometry, lensMaterial);
    leftLens.rotation.x = Math.PI / 2;
    leftLens.position.set(-0.3, 0, 0.4);
    vrHeadset.add(leftLens);
    
    const rightLens = new THREE.Mesh(lensGeometry, lensMaterial);
    rightLens.rotation.x = Math.PI / 2;
    rightLens.position.set(0.3, 0, 0.4);
    vrHeadset.add(rightLens);
    
    // Straps
    const strapGeometry = new THREE.BoxGeometry(2, 0.1, 0.05);
    const strapMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    const strapMesh = new THREE.Mesh(strapGeometry, strapMaterial);
    strapMesh.position.set(0, 0, -0.3);
    vrHeadset.add(strapMesh);
    
    // Add glowing edges
    const edgeGeometry = new THREE.EdgesGeometry(headsetGeometry);
    const edgeMaterial = new THREE.LineBasicMaterial({ 
      color: 0x00ffff,
      linewidth: 2
    });
    const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
    headsetMesh.add(edges);
    
    scene.add(vrHeadset);
    vrHeadset.position.set(0, 0, 0);
    
    // Create Buddha geometry (simplified for demo)
    const buddha = new THREE.Group();
    
    // Buddha body
    const buddhaBodyGeometry = new THREE.SphereGeometry(0.8, 32, 32);
    const buddhaBodyMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xd4af37, // Gold color
      shininess: 100,
      specular: 0xffffff
    });
    const buddhaBodyMesh = new THREE.Mesh(buddhaBodyGeometry, buddhaBodyMaterial);
    buddha.add(buddhaBodyMesh);
    
    // Buddha head
    const buddhaHeadGeometry = new THREE.SphereGeometry(0.4, 32, 32);
    const buddhaHeadMesh = new THREE.Mesh(buddhaHeadGeometry, buddhaBodyMaterial);
    buddhaHeadMesh.position.set(0, 1, 0);
    buddha.add(buddhaHeadMesh);
    
    // Buddha lotus base
    const lotusGeometry = new THREE.CylinderGeometry(1, 0.8, 0.2, 16);
    const lotusMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xd4af37,
      shininess: 50
    });
    const lotusMesh = new THREE.Mesh(lotusGeometry, lotusMaterial);
    lotusMesh.position.set(0, -0.9, 0);
    buddha.add(lotusMesh);
    
    // Add glow effect to Buddha
    const glowGeometry = new THREE.SphereGeometry(1.2, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xffcc00,
      transparent: true,
      opacity: 0.2
    });
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    buddha.add(glowMesh);
    
    // Hide Buddha initially
    buddha.visible = false;
    buddha.position.set(0, 0, 0);
    scene.add(buddha);
    
    // Add particles for transition effect
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1000;
    const posArray = new Float32Array(particlesCount * 3);
    
    for(let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 5;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      color: 0x00ffff,
      transparent: true,
      opacity: 0.8
    });
    
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    
    // Set up camera position
    camera.position.z = 3;
    
    // Animation parameters
    let phase = 0; // 0 = VR, 1 = transition, 2 = Buddha
    let transitionProgress = 0;
    let isAnimating = false;
    
    // Start transition on scroll or after delay
    let hasTriggered = false;
    
    window.addEventListener('scroll', function() {
      const containerRect = container.getBoundingClientRect();
      const isVisible = (
        containerRect.top >= 0 &&
        containerRect.bottom <= window.innerHeight
      );
      
      if (isVisible && !hasTriggered) {
        startTransition();
        hasTriggered = true;
      }
    });
    
    // Also trigger after 3 seconds regardless of scroll
    setTimeout(function() {
      if (!hasTriggered) {
        startTransition();
        hasTriggered = true;
      }
    }, 3000);
    
    function startTransition() {
      if (isAnimating) return;
      
      isAnimating = true;
      phase = 1;
      transitionProgress = 0;
    }
    
    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      
      // Rotate VR headset
      vrHeadset.rotation.y += 0.005;
      
      // Rotate Buddha
      if (buddha.visible) {
        buddha.rotation.y += 0.003;
      }
      
      // Animate particles
      particlesMesh.rotation.x += 0.001;
      particlesMesh.rotation.y += 0.002;
      
      // Handle transition phases
      if (phase === 1) {
        // Transition from VR to Buddha
        transitionProgress += 0.01;
        
        if (transitionProgress < 0.5) {
          // Phase 1: VR headset fades out and shrinks
          vrHeadset.scale.set(
            1 - transitionProgress * 2,
            1 - transitionProgress * 2,
            1 - transitionProgress * 2
          );
          vrHeadset.position.y = -transitionProgress * 2;
          
          // Particles intensify
          particlesMaterial.opacity = Math.min(1, transitionProgress * 3);
          particlesMaterial.size = 0.02 + transitionProgress * 0.1;
        } else if (transitionProgress < 1) {
          // Phase 2: Buddha fades in and grows
          if (!buddha.visible) {
            buddha.visible = true;
            vrHeadset.visible = false;
          }
          
          const buddhaProgress = (transitionProgress - 0.5) * 2;
          buddha.scale.set(
            buddhaProgress,
            buddhaProgress,
            buddhaProgress
          );
          buddha.position.y = (1 - buddhaProgress) * 2;
          
          // Particles reduce
          particlesMaterial.opacity = Math.max(0, 1 - buddhaProgress);
        } else {
          // Transition complete
          phase = 2;
          particlesMaterial.opacity = 0;
        }
      }
      
      renderer.render(scene, camera);
    }
    
    animate();
  });