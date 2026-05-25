/* nav active link */
(function () {
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href').split('/').pop();
    if (href === path) a.classList.add('active');
  });
})();

/* scroll reveal */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

/* typing animation */
(function () {
  const words = ['Automation', 'Electrical', 'Design', 'Documentation'];
  const element = document.querySelector('.rotating-text-content');
  if (!element) return;
  
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  const typingSpeed = 70; // ms per character
  const deletingSpeed = 40; // ms per character
  const delayBetweenWords = 1200; // ms pause before deleting
  
  function type() {
    const currentWord = words[wordIndex];
    
    if (!isDeleting) {
      // Typing
      if (charIndex < currentWord.length) {
        element.textContent += currentWord[charIndex];
        charIndex++;
        setTimeout(type, typingSpeed);
      } else {
        // Finished typing, wait then start deleting
        isDeleting = true;
        setTimeout(type, delayBetweenWords);
      }
    } else {
      // Deleting
      if (charIndex > 0) {
        element.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
        setTimeout(type, deletingSpeed);
      } else {
        // Finished deleting, move to next word
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        setTimeout(type, 300);
      }
    }
  }
  
  // Start typing animation
  setTimeout(type, 500);
})();

/* CV Modal */
(function () {
  const cvBtn = document.getElementById('cvBtn');
  const cvModal = document.getElementById('cvModal');
  const cvClose = document.getElementById('cvClose');
  
  if (!cvBtn || !cvModal) return;
  
  // Add ripple effect
  cvBtn.addEventListener('click', function(e) {
    const rect = this.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    this.appendChild(ripple);
    
    // Remove ripple after animation
    setTimeout(() => ripple.remove(), 600);
    
    // Open modal
    cvModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Load PDF on first open
    if (!window.pdfLoaded) {
      loadPDF();
      window.pdfLoaded = true;
    }
  });
  
  cvClose.addEventListener('click', () => {
    cvModal.classList.remove('active');
    document.body.style.overflow = 'auto';
  });
  
  cvModal.addEventListener('click', (e) => {
    if (e.target === cvModal) {
      cvModal.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  });
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && cvModal.classList.contains('active')) {
      cvModal.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  });
})();

/* PDF Viewer */
let pdfDoc = null;
let currentPage = 1;

async function loadPDF() {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    
    pdfDoc = await pdfjsLib.getDocument('images/CV_Ibra%20Satriatama.pdf').promise;
    
    document.getElementById('total-pages').textContent = pdfDoc.numPages;
    renderPage(currentPage);
    
    // Add event listeners for pagination
    document.getElementById('prev-page').addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        renderPage(currentPage);
      }
    });
    
    document.getElementById('next-page').addEventListener('click', () => {
      if (currentPage < pdfDoc.numPages) {
        currentPage++;
        renderPage(currentPage);
      }
    });
  } catch (error) {
    console.error('Error loading PDF:', error);
    document.getElementById('pdf-viewer').innerHTML = '<p style="color: #ff6b6b;">Error loading PDF. Please try downloading it instead.</p>';
  }
}

async function renderPage(pageNum) {
  try {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1 });
    
    // Calculate scale to fit better - smaller for clarity
    const maxWidth = 480;
    const scale = maxWidth / viewport.width;
    const scaledViewport = page.getViewport({ scale: scale });
    
    // Remove old canvas if exists
    const oldCanvas = document.querySelector('.pdf-viewer canvas');
    if (oldCanvas) oldCanvas.remove();
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = scaledViewport.width;
    canvas.height = scaledViewport.height;
    
    const renderContext = {
      canvasContext: context,
      viewport: scaledViewport
    };
    
    await page.render(renderContext).promise;
    
    const pdfViewer = document.getElementById('pdf-viewer');
    pdfViewer.appendChild(canvas);
    pdfViewer.scrollTop = 0; // Scroll to top
    
    document.getElementById('current-page').textContent = pageNum;
    
    // Update button states
    document.getElementById('prev-page').disabled = pageNum === 1;
    document.getElementById('next-page').disabled = pageNum === pdfDoc.numPages;
  } catch (error) {
    console.error('Error rendering page:', error);
  }
}

/* Image Modal Gallery */
(function () {
  const imageModal = document.getElementById('imageModal');
  const imageModalImg = document.getElementById('imageModalImg');
  const imageModalTitle = document.getElementById('imageModalTitle');
  const imageModalClose = document.getElementById('imageModalClose');
  const imagePrevBtn = document.getElementById('imagePrevBtn');
  const imageNextBtn = document.getElementById('imageNextBtn');
  const imageCounter = document.getElementById('imageCounter');
  
  if (!imageModal) return;
  
  let allImages = [];
  let currentImageIndex = 0;
  
  // Collect all images from work-images
  function collectImages() {
    allImages = [];
    document.querySelectorAll('.work-img-frame').forEach((frame, index) => {
      const img = frame.querySelector('img');
      if (img) {
        allImages.push({
          src: img.src,
          alt: img.alt || `Image ${index + 1}`,
          title: img.alt || `Image ${index + 1}`
        });
      }
    });
  }
  
  // Initialize on page load
  collectImages();
  
  // Add click listeners to all work images
  function attachImageListeners() {
    document.querySelectorAll('.work-img-frame').forEach((frame) => {
      const img = frame.querySelector('img');
      if (img) {
        img.style.cursor = 'pointer';
        img.addEventListener('click', () => {
          const index = allImages.findIndex(item => item.src === img.src);
          if (index !== -1) {
            currentImageIndex = index;
            openModal();
          }
        });
      }
    });
  }
  
  function openModal() {
    imageModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    displayImage();
  }
  
  function closeModal() {
    imageModal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
  
  function displayImage() {
    if (allImages.length === 0) return;
    
    const image = allImages[currentImageIndex];
    imageModalImg.src = image.src;
    imageModalImg.alt = image.alt;
    imageModalTitle.textContent = image.title;
    imageCounter.textContent = `${currentImageIndex + 1} / ${allImages.length}`;
    
    // Update button states
    imagePrevBtn.disabled = currentImageIndex === 0;
    imageNextBtn.disabled = currentImageIndex === allImages.length - 1;
  }
  
  function nextImage() {
    if (currentImageIndex < allImages.length - 1) {
      currentImageIndex++;
      displayImage();
    }
  }
  
  function prevImage() {
    if (currentImageIndex > 0) {
      currentImageIndex--;
      displayImage();
    }
  }
  
  // Event listeners
  imageModalClose.addEventListener('click', closeModal);
  imageNextBtn.addEventListener('click', nextImage);
  imagePrevBtn.addEventListener('click', prevImage);
  
  // Close modal when clicking outside the image
  imageModal.addEventListener('click', (e) => {
    if (e.target === imageModal) {
      closeModal();
    }
  });
  
  // Keyboard controls
  document.addEventListener('keydown', (e) => {
    if (!imageModal.classList.contains('active')) return;
    
    if (e.key === 'Escape') {
      closeModal();
    } else if (e.key === 'ArrowRight') {
      nextImage();
    } else if (e.key === 'ArrowLeft') {
      prevImage();
    }
  });
  
  // Attach listeners after page load
  attachImageListeners();
})();

/* Certificate PDF Modal */
(function () {
  const certModal = document.getElementById('certModal');
  const certModalClose = document.getElementById('certModalClose');
  const certPdfCanvasContainer = document.getElementById('certPdfCanvasContainer');
  const certPdfPrevBtn = document.getElementById('certPdfPrevBtn');
  const certPdfNextBtn = document.getElementById('certPdfNextBtn');
  const certPdfCurrentPage = document.getElementById('certPdfCurrentPage');
  const certPdfTotalPages = document.getElementById('certPdfTotalPages');
  
  if (!certModal) return;
  
  let certPdfDoc = null;
  let certCurrentPage = 1;
  
  // Add click listeners to all certificate badges
  function attachCertListeners() {
    const badges = document.querySelectorAll('.cert-badge[data-pdf]');
    console.log('Found', badges.length, 'certificate badges');
    
    badges.forEach((badge) => {
      badge.style.cursor = 'pointer';
      badge.addEventListener('click', () => {
        const pdfSrc = badge.getAttribute('data-pdf');
        console.log('Certificate clicked, PDF source:', pdfSrc);
        if (pdfSrc) {
          loadCertPDF(pdfSrc);
        }
      });
    });
  }
  
  async function loadCertPDF(pdfSrc) {
    try {
      console.log('Loading PDF:', pdfSrc);
      
      // Check if pdfjsLib is available
      if (typeof pdfjsLib === 'undefined') {
        console.error('PDF.js library not loaded');
        certPdfCanvasContainer.innerHTML = '<p style="color: #ff6b6b;">Error: PDF library not loaded</p>';
        return;
      }
      
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      
      certPdfDoc = await pdfjsLib.getDocument(pdfSrc).promise;
      
      console.log('PDF loaded successfully, pages:', certPdfDoc.numPages);
      
      certPdfTotalPages.textContent = certPdfDoc.numPages;
      certCurrentPage = 1;
      certPdfCurrentPage.textContent = certCurrentPage;
      
      openCertModal();
      await renderCertPage(certCurrentPage);
    } catch (error) {
      console.error('Error loading certificate PDF:', error);
      certPdfCanvasContainer.innerHTML = '<p style="color: #ff6b6b;">Error loading PDF: ' + error.message + '</p>';
      openCertModal();
    }
  }
  
  async function renderCertPage(pageNum) {
    try {
      if (!certPdfDoc) {
        console.error('No PDF document loaded');
        return;
      }
      
      const page = await certPdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1 });
      
      // Calculate scale to fit container width - use larger container width for better quality
      const maxWidth = Math.min(certPdfCanvasContainer.clientWidth - 80, 1000);
      const maxHeight = Math.min(certPdfCanvasContainer.clientHeight - 40, 700);
      
      // Calculate scale based on both width and height
      const scaleW = maxWidth / viewport.width;
      const scaleH = maxHeight / viewport.height;
      const scale = Math.min(scaleW, scaleH, 2.5); // Cap at 2.5x for clarity
      
      const scaledViewport = page.getViewport({ scale: scale });
      
      // Remove old canvas if exists
      const oldCanvas = certPdfCanvasContainer.querySelector('canvas');
      if (oldCanvas) oldCanvas.remove();
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;
      
      const renderContext = {
        canvasContext: context,
        viewport: scaledViewport
      };
      
      await page.render(renderContext).promise;
      
      certPdfCanvasContainer.appendChild(canvas);
      certPdfCanvasContainer.scrollTop = 0;
      
      certPdfCurrentPage.textContent = pageNum;
      
      // Update button states
      certPdfPrevBtn.disabled = pageNum === 1;
      certPdfNextBtn.disabled = pageNum === certPdfDoc.numPages;
    } catch (error) {
      console.error('Error rendering certificate page:', error);
    }
  }
  
  function openCertModal() {
    certModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  
  function closeCertModal() {
    certModal.classList.remove('active');
    document.body.style.overflow = 'auto';
    certPdfDoc = null;
  }
  
  // Event listeners
  certModalClose.addEventListener('click', closeCertModal);
  
  certPdfPrevBtn.addEventListener('click', () => {
    if (certCurrentPage > 1) {
      certCurrentPage--;
      renderCertPage(certCurrentPage);
    }
  });
  
  certPdfNextBtn.addEventListener('click', () => {
    if (certCurrentPage < certPdfDoc.numPages) {
      certCurrentPage++;
      renderCertPage(certCurrentPage);
    }
  });
  
  // Close modal when clicking outside
  certModal.addEventListener('click', (e) => {
    if (e.target === certModal) {
      closeCertModal();
    }
  });
  
  // Keyboard controls
  document.addEventListener('keydown', (e) => {
    if (!certModal.classList.contains('active')) return;
    
    if (e.key === 'Escape') {
      closeCertModal();
    } else if (e.key === 'ArrowRight') {
      if (certCurrentPage < certPdfDoc.numPages) {
        certCurrentPage++;
        renderCertPage(certCurrentPage);
      }
    } else if (e.key === 'ArrowLeft') {
      if (certCurrentPage > 1) {
        certCurrentPage--;
        renderCertPage(certCurrentPage);
      }
    }
  });
  
  // Attach listeners after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachCertListeners);
  } else {
    attachCertListeners();
  }
})();
