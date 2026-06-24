// Custom luxury toast notifications utility for Decant Atelier
export const showToast = (message, type = 'success') => {
  // Find or create toast container
  let container = document.getElementById('decant-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'decant-toast-container';
    container.style.position = 'fixed';
    container.style.zIndex = '99999';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '10px';
    container.style.pointerEvents = 'none';
    document.body.appendChild(container);
  }

  // Responsive container positioning
  const updateContainerStyles = () => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      container.style.left = '50%';
      container.style.transform = 'translateX(-50%)';
      container.style.right = 'auto';
      container.style.bottom = '20px';
      container.style.width = '90%';
      container.style.maxWidth = '90vw';
      container.style.alignItems = 'center';
    } else {
      container.style.right = '30px';
      container.style.left = 'auto';
      container.style.transform = 'none';
      container.style.bottom = '30px';
      container.style.width = 'auto';
      container.style.maxWidth = '400px';
      container.style.alignItems = 'flex-end';
    }
  };
  updateContainerStyles();

  // Deduplicate and manage active toasts
  let existingToasts = Array.from(container.children);
  const duplicateToast = existingToasts.find(child => child.getAttribute('data-message') === message);
  if (duplicateToast) {
    if (duplicateToast.parentNode === container) {
      container.removeChild(duplicateToast);
    }
  }

  // Maximum visible error toasts: 1
  if (type === 'error') {
    existingToasts = Array.from(container.children);
    const existingErrorToasts = existingToasts.filter(child => child.getAttribute('data-type') === 'error');
    existingErrorToasts.forEach(t => {
      if (t.parentNode === container) {
        container.removeChild(t);
      }
    });
  }

  // Cap total visible toasts to 3 (leaves at most 2 active before adding the new one)
  existingToasts = Array.from(container.children);
  while (existingToasts.length >= 3) {
    const oldest = existingToasts.shift();
    if (oldest && oldest.parentNode === container) {
      container.removeChild(oldest);
    }
  }

  const messageText = '✦ ' + message;

  // Create toast element
  const toast = document.createElement('div');
  toast.setAttribute('data-message', message);
  toast.setAttribute('data-type', type);
  toast.style.pointerEvents = 'auto';
  toast.style.padding = '14px 24px';
  toast.style.width = '100%';
  toast.style.boxSizing = 'border-box';
  toast.style.fontFamily = "'Inter', sans-serif";
  toast.style.fontSize = '0.75rem';
  toast.style.fontWeight = '500';
  toast.style.textTransform = 'uppercase';
  toast.style.letterSpacing = '1.5px';
  toast.style.boxShadow = '0 10px 30px rgba(0,0,0,0.08)';
  toast.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
  toast.style.opacity = '0';
  toast.style.transform = 'translateY(20px)';
  toast.style.textAlign = 'center';
  
  // Luxury branding color styles
  if (type === 'error') {
    toast.style.background = '#8C2A2A'; // deep burgundy
    toast.style.color = '#FEFCF9';
    toast.style.border = '1px solid rgba(255,255,255,0.1)';
  } else if (type === 'warning') {
    toast.style.background = '#B08A50'; // warm gold
    toast.style.color = '#FEFCF9';
    toast.style.border = '1px solid rgba(255,255,255,0.1)';
  } else {
    toast.style.background = '#1C1B18'; // luxury charcoal
    toast.style.color = '#FEFCF9';
    toast.style.border = '1px solid rgba(255,255,255,0.15)';
  }

  // Inject content with custom premium diamond symbol
  toast.innerText = messageText;
  container.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });

  // Fade and clean up (Faster dismiss on mobile: 2.5s instead of 3.5s)
  const isMobile = window.innerWidth < 768;
  const displayDuration = isMobile ? 2500 : 3500;
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-20px)';
    setTimeout(() => {
      if (toast.parentNode === container) {
        container.removeChild(toast);
      }
      if (container.children.length === 0 && container.parentNode) {
        document.body.removeChild(container);
      }
    }, 400);
  }, displayDuration);
};
