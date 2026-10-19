// Service Worker Registration for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((registration) => {
        console.log('ServiceWorker registered with scope: ', registration.scope);
      })
      .catch((error) => {
        console.warn('ServiceWorker registration error: ', error);
      });
  });
}

// Track install prompt event for PWA
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log('App install prompt captured');
});

document.addEventListener('DOMContentLoaded', () => {
  // Views
  const homeView = document.getElementById('home-view');
  const ticketView = document.getElementById('ticket-view');
  const accountView = document.getElementById('account-view');

  const openAccountBtn = document.getElementById('open-account-btn');
  const accountBackBtn = document.getElementById('account-back-btn');
  const ticketBackBtn = document.getElementById('ticket-back-btn');

  // Home Main Touch Area
  const homeMainTouchArea = document.getElementById('home-main-touch-area');
  const heroTicketBtn = document.getElementById('hero-ticket-btn');
  const ongoingBadge = document.getElementById('ongoing-badge-trigger');
  const queenPassBtn = document.getElementById('queen-pass-btn');

  // Search Elements
  const splashScreen = document.getElementById('splash-screen');
  const searchInput = document.getElementById('search-input');
  const clearBtn = document.getElementById('clear-search-btn');
  const searchDropdown = document.getElementById('search-dropdown');
  const dropdownItems = document.querySelectorAll('.dropdown-item');
  const searchFeedback = document.getElementById('search-feedback');
  const feedbackKeyword = document.getElementById('search-keyword');
  const resetSearchLink = document.getElementById('reset-search-link');
  const featuredCardWrapper = document.getElementById('featured-event-card');
  const queenEventCard = document.getElementById('queen-event-card');

  // Modals
  const transferModal = document.getElementById('transfer-modal');
  const transferCloseBtn = document.getElementById('transfer-modal-close-btn');
  const confirmTransferBtn = document.getElementById('confirm-transfer-btn');
  const transferMobileInput = document.getElementById('transfer-mobile-input');

  const accountModal = document.getElementById('account-info-modal');
  const accountModalBadge = document.getElementById('account-modal-badge');
  const accountModalTitle = document.getElementById('account-modal-title');
  const accountModalBody = document.getElementById('account-modal-body');
  const accountModalCloseBtn = document.getElementById('account-modal-close-btn');

  const toast = document.getElementById('app-toast');

  // PWA Install Logic (Android & iPhone)
  const pwaModal = document.getElementById('pwa-install-modal');
  const pwaAndroidContent = document.getElementById('pwa-android-content');
  const pwaIosContent = document.getElementById('pwa-ios-content');
  const pwaConfirmBtn = document.getElementById('pwa-confirm-install-btn');
  const pwaDismissBtn = document.getElementById('pwa-dismiss-btn');
  const pwaCloseBtn = document.getElementById('pwa-close-btn');
  const pwaIosDoneBtn = document.getElementById('pwa-ios-done-btn');

  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

  let tenSecondTimer = null;

  function showInstallPrompt() {
    if (isStandalone || !pwaModal) return;
    pwaModal.style.display = 'flex';
    requestAnimationFrame(() => {
      pwaModal.classList.add('open');
      pwaModal.setAttribute('aria-hidden', 'false');
    });

    if (isIos) {
      if (pwaIosContent) pwaIosContent.style.display = 'block';
      if (pwaAndroidContent) pwaAndroidContent.style.display = 'none';
    } else {
      if (pwaAndroidContent) pwaAndroidContent.style.display = 'block';
      if (pwaIosContent) pwaIosContent.style.display = 'none';
    }
  }

  function hideInstallPrompt() {
    if (!pwaModal) return;
    pwaModal.classList.remove('open');
    pwaModal.setAttribute('aria-hidden', 'true');
    setTimeout(() => {
      pwaModal.style.display = 'none';
    }, 280);

    // After dismiss, schedule the 10-second popup if user continues in browser
    scheduleTenSecondPopup();
  }

  function scheduleTenSecondPopup() {
    clearTimeout(tenSecondTimer);
    if (!isStandalone) {
      tenSecondTimer = setTimeout(() => {
        showInstallPrompt();
      }, 10000); // exactly 10 seconds popup!
    }
  }

  if (pwaConfirmBtn) {
    pwaConfirmBtn.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          showToast('✓ Installing YASHVI App...');
        }
        deferredPrompt = null;
        hideInstallPrompt();
      } else {
        showToast('In Chrome menu (⋮), tap "Install app" for clean icon');
      }
    });
  }

  if (pwaDismissBtn) pwaDismissBtn.addEventListener('click', hideInstallPrompt);
  if (pwaCloseBtn) pwaCloseBtn.addEventListener('click', hideInstallPrompt);
  if (pwaIosDoneBtn) pwaIosDoneBtn.addEventListener('click', hideInstallPrompt);
  if (pwaModal) {
    pwaModal.addEventListener('click', (e) => {
      if (e.target === pwaModal) hideInstallPrompt();
    });
  }

  // 1. Immediately when browser link is opened: show install popup first!
  if (!isStandalone) {
    setTimeout(() => {
      showInstallPrompt();
    }, 400); // Prompt appears right as the link opens!
  }

  // 2. Launch Screen: displays for 2.5s (or tap to dismiss) then goes to Home
  function dismissSplashScreen() {
    if (splashScreen && !splashScreen.classList.contains('fade-out')) {
      splashScreen.classList.add('fade-out');
      // After launch screen enters home screen, schedule the 10-second popup!
      scheduleTenSecondPopup();
    }
  }

  if (splashScreen) {
    splashScreen.addEventListener('click', dismissSplashScreen);
  }

  setTimeout(dismissSplashScreen, 2500);

  // Helper: Toast Message
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2600);
  }

  // 2. Navigation Functions
  function navigateToTicket() {
    const transferModal = document.getElementById('transfer-modal');
    const accountModal = document.getElementById('account-info-modal');
    if (transferModal) transferModal.classList.remove('open');
    if (accountModal) accountModal.classList.remove('open');

    if (homeView) homeView.classList.add('slide-left');
    if (accountView) accountView.classList.remove('active');
    if (ticketView) {
      ticketView.classList.add('active');
      const container = ticketView.querySelector('.ticket-screen-container');
      if (container) container.scrollTop = 0;
    }
    window.history.pushState({ screen: 'ticket' }, 'Ticket');
    setTimeout(updateCarouselArrows, 60);
  }

  function navigateToAccount() {
    if (homeView && accountView) {
      homeView.classList.add('slide-left');
      if (ticketView) ticketView.classList.remove('active');
      accountView.classList.add('active');
      window.history.pushState({ screen: 'account' }, 'My Account');
    }
  }

  function navigateToHome() {
    if (ticketView) ticketView.classList.remove('active');
    if (accountView) accountView.classList.remove('active');
    if (homeView) homeView.classList.remove('slide-left');
    window.history.pushState({ screen: 'home' }, 'Home');
  }

  // Touch ANY place on Home screen -> Opens Ticket screen!
  if (homeView) {
    homeView.addEventListener('click', (e) => {
      if (e.target.closest('#search-pill-container') ||
          e.target.closest('#search-dropdown') ||
          e.target.closest('#open-account-btn') ||
          e.target.closest('#reset-search-link')) {
        return;
      }
      navigateToTicket();
    });
  }

  if (homeMainTouchArea) {
    homeMainTouchArea.addEventListener('click', (e) => {
      if (e.target.closest('#reset-search-link')) return;
      navigateToTicket();
    });
  }

  if (heroTicketBtn) heroTicketBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    navigateToTicket();
  });

  if (ongoingBadge) ongoingBadge.addEventListener('click', (e) => {
    e.stopPropagation();
    navigateToTicket();
  });

  if (queenPassBtn) queenPassBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    navigateToTicket();
  });

  if (openAccountBtn) openAccountBtn.addEventListener('click', navigateToAccount);
  if (accountBackBtn) accountBackBtn.addEventListener('click', navigateToHome);
  if (ticketBackBtn) ticketBackBtn.addEventListener('click', navigateToHome);

  // Hardware/Browser Back button
  window.addEventListener('popstate', (e) => {
    navigateToHome();
  });

  // 3. Ticket Screen Hotspots
  let currentTicketIndex = 1;
  const totalTickets = 5;

  const tabGold = document.getElementById('hotspot-tab-gold');
  if (tabGold) {
    tabGold.addEventListener('click', () => {
      showToast('🎟️ Active Tier: GOLD - A (x5 Passes)');
    });
  }

  const tabVvip = document.getElementById('hotspot-tab-vvip');
  if (tabVvip) {
    tabVvip.addEventListener('click', () => {
      showToast('⭐ Switched to VVIP - A (x1 Pass)');
    });
  }

  // =========================================
  // 5-QR CODE HORIZONTAL CAROUSEL CONTROLLER
  // =========================================
  const qrTrack = document.getElementById('qr-carousel-track');
  const qrSlides = document.querySelectorAll('.qr-slide');
  const qrNavPrev = document.getElementById('qr-nav-prev');
  const qrNavNext = document.getElementById('qr-nav-next');
  let currentActiveIndex = 0;

  function updateCarouselArrows() {
    if (!qrTrack || qrSlides.length === 0) return;
    const scrollLeft = qrTrack.scrollLeft;
    const trackWidth = qrTrack.clientWidth;
    const centerPoint = scrollLeft + trackWidth / 2;

    let closestIndex = 0;
    let minDistance = Infinity;

    qrSlides.forEach((slide, index) => {
      const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
      const distance = Math.abs(centerPoint - slideCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    currentActiveIndex = closestIndex;

    qrSlides.forEach((slide, index) => {
      if (index === closestIndex) {
        slide.classList.add('active-slide');
      } else {
        slide.classList.remove('active-slide');
      }
    });

    if (qrNavPrev) {
      qrNavPrev.style.display = closestIndex > 0 ? 'flex' : 'none';
    }
    if (qrNavNext) {
      qrNavNext.style.display = closestIndex < qrSlides.length - 1 ? 'flex' : 'none';
    }
  }

  function scrollToSlide(index) {
    if (!qrTrack || !qrSlides[index]) return;
    const targetSlide = qrSlides[index];
    const trackWidth = qrTrack.clientWidth;
    const slideLeft = targetSlide.offsetLeft;
    const slideWidth = targetSlide.offsetWidth;
    const targetScroll = slideLeft - (trackWidth - slideWidth) / 2;
    qrTrack.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  }

  if (qrNavNext) {
    qrNavNext.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentActiveIndex < qrSlides.length - 1) {
        scrollToSlide(currentActiveIndex + 1);
        showToast(`Showing Ticket [${currentActiveIndex + 2}/5]`);
      }
    });
  }

  if (qrNavPrev) {
    qrNavPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentActiveIndex > 0) {
        scrollToSlide(currentActiveIndex - 1);
        showToast(`Showing Ticket [${currentActiveIndex}/5]`);
      }
    });
  }

  if (qrTrack) {
    let scrollTimeout = null;
    qrTrack.addEventListener('scroll', () => {
      updateCarouselArrows();
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        updateCarouselArrows();
      }, 100);
    }, { passive: true });

    // Enable tap to center on peeking adjacent slides
    qrSlides.forEach((slide, index) => {
      slide.addEventListener('click', () => {
        if (currentActiveIndex !== index) {
          scrollToSlide(index);
          showToast(`Showing Ticket [${index + 1}/5]`);
        }
      });
    });

    // Mouse drag support for smooth horizontal scrolling on desktop
    let isDown = false;
    let startX = 0;
    let scrollLeftStart = 0;

    qrTrack.addEventListener('mousedown', (e) => {
      isDown = true;
      startX = e.pageX - qrTrack.offsetLeft;
      scrollLeftStart = qrTrack.scrollLeft;
    });

    window.addEventListener('mouseup', () => {
      if (isDown) {
        isDown = false;
        setTimeout(updateCarouselArrows, 120);
      }
    });

    qrTrack.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - qrTrack.offsetLeft;
      const walk = (x - startX) * 1.5;
      qrTrack.scrollLeft = scrollLeftStart - walk;
    });
  }

  // Extract pixel-perfect original QR code + orange brackets from user_qr_snippet.png
  function extractAndApplyQrCode() {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = 'user_qr_snippet.png';
    img.onload = () => {
      try {
        const c = document.createElement('canvas');
        c.width = img.naturalWidth || img.width;
        c.height = img.naturalHeight || img.height;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, c.width, c.height);
        const data = imgData.data;

        // Find orange corner bracket bounding box in left 72%
        let minX = c.width, maxX = 0, minY = c.height, maxY = 0;
        const limitX = Math.floor(c.width * 0.72);
        const limitY = Math.floor(c.height * 0.72);

        for (let y = 0; y < limitY; y++) {
          for (let x = 0; x < limitX; x++) {
            const i = (y * c.width + x) * 4;
            const r = data[i], g = data[i+1], b = data[i+2];
            if (r > 200 && g > 90 && g < 185 && b < 65) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }

        let cropX, cropY, cropW, cropH;
        if (minX < maxX && minY < maxY) {
          const pad = 4;
          cropX = Math.max(0, minX - pad);
          cropY = Math.max(0, minY - pad);
          cropW = Math.min(c.width - cropX, (maxX - minX) + pad * 2);
          cropH = Math.min(c.height - cropY, (maxY - minY) + pad * 2);
        } else {
          // Precise fallback based on user_qr_snippet.png
          cropX = 185;
          cropY = 24;
          cropW = 420;
          cropH = 390;
        }

        const outCanvas = document.createElement('canvas');
        outCanvas.width = cropW;
        outCanvas.height = cropH;
        const outCtx = outCanvas.getContext('2d');
        outCtx.drawImage(c, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

        const croppedDataUrl = outCanvas.toDataURL('image/png');
        document.querySelectorAll('.qr-code-img').forEach(el => {
          el.src = croppedDataUrl;
          el.style.opacity = '1';
        });

        // Hide CSS corners since cropped image has pristine original orange corners
        document.querySelectorAll('.qr-corners').forEach(el => {
          el.style.display = 'none';
        });
      } catch (err) {
        console.warn('QR crop error:', err);
      }
    };
  }

  extractAndApplyQrCode();
  setTimeout(updateCarouselArrows, 100);

  const transferBtn = document.getElementById('hotspot-transfer');
  if (transferBtn) {
    transferBtn.addEventListener('click', () => {
      if (transferModal) {
        transferModal.classList.add('open');
        transferModal.setAttribute('aria-hidden', 'false');
      }
    });
  }

  if (transferCloseBtn) {
    transferCloseBtn.addEventListener('click', () => {
      if (transferModal) {
        transferModal.classList.remove('open');
        transferModal.setAttribute('aria-hidden', 'true');
      }
    });
  }

  if (transferModal) {
    transferModal.addEventListener('click', (e) => {
      if (e.target === transferModal) {
        transferModal.classList.remove('open');
        transferModal.setAttribute('aria-hidden', 'true');
      }
    });
  }

  if (confirmTransferBtn) {
    confirmTransferBtn.addEventListener('click', () => {
      const mobile = transferMobileInput ? transferMobileInput.value.trim() : '';
      if (!mobile) {
        alert('Please enter recipient mobile number');
        return;
      }
      if (transferModal) transferModal.classList.remove('open');
      showToast(`✓ Ticket transferred to ${mobile}!`);
      if (transferMobileInput) transferMobileInput.value = '';
    });
  }

  const viewTransferredBtn = document.getElementById('hotspot-view-transferred');
  if (viewTransferredBtn) {
    viewTransferredBtn.addEventListener('click', () => {
      openAccountModal(
        'TRANSFERRED',
        'Transferred Tickets',
        `<div style="background:#f8fafc; border-radius:14px; padding:16px; border:1px solid #e2e8f0;">
          <div style="font-size:13px; font-weight:700; color:#0f172a;">1 Pass sent to Yojit Bhasin</div>
          <div style="font-size:12px; color:#64748b; margin-top:4px;">Ticket: GOLD - A #PvUWv8</div>
          <div style="font-size:12px; color:#0284c7; font-weight:600; margin-top:6px;">Status: Accepted & Claimed</div>
        </div>`
      );
    });
  }

  // 4. Search & Location Filtering Logic
  function performLocationSearch(query) {
    const q = query.trim().toLowerCase();

    if (clearBtn) {
      clearBtn.style.display = q.length > 0 ? 'flex' : 'none';
    }

    if (!q) {
      if (searchFeedback) searchFeedback.style.display = 'none';
      if (featuredCardWrapper) featuredCardWrapper.style.display = 'block';
      if (queenEventCard) queenEventCard.style.display = 'block';
      featuredCardWrapper.classList.remove('highlighted');
      queenEventCard.style.outline = 'none';
      return;
    }

    if (searchFeedback) {
      searchFeedback.style.display = 'flex';
      feedbackKeyword.textContent = query;
    }

    const matchesYashvi = ['vesu', 'surat', 'abhva', 'patel', 'cricket', 'dome', 'yashvi', 'kratos', 'purva', 'purvastic', 'garba'].some(term => term.includes(q) || q.includes(term));
    const matchesQueen = ['queen', 'stage', 'dandiya', 'athwa', 'indoor', 'stadium', 'surat', 'finale'].some(term => term.includes(q) || q.includes(term));

    if (matchesYashvi && !matchesQueen) {
      featuredCardWrapper.style.display = 'block';
      featuredCardWrapper.classList.add('highlighted');
      queenEventCard.style.display = 'none';
      showToast('📍 Found: Yashvi AC Dome (Vesu, Surat)');
    } else if (matchesQueen && !matchesYashvi) {
      featuredCardWrapper.style.display = 'none';
      queenEventCard.style.display = 'block';
      queenEventCard.style.outline = '3px solid var(--accent-orange)';
      showToast('📍 Found: Stage Awaits The Queen');
    } else if (matchesYashvi && matchesQueen) {
      featuredCardWrapper.style.display = 'block';
      featuredCardWrapper.classList.add('highlighted');
      queenEventCard.style.display = 'block';
      showToast('📍 Found 2 Events in Surat');
    } else {
      featuredCardWrapper.style.display = 'block';
      queenEventCard.style.display = 'block';
      featuredCardWrapper.classList.remove('highlighted');
      queenEventCard.style.outline = 'none';
      showToast(`No exact match for "${query}". Showing all venues.`);
    }
  }

  if (searchInput) {
    searchInput.addEventListener('focus', () => {
      if (searchDropdown) searchDropdown.style.display = 'block';
    });

    searchInput.addEventListener('input', (e) => {
      performLocationSearch(e.target.value);
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        searchInput.blur();
        if (searchDropdown) searchDropdown.style.display = 'none';
      }
    });
  }

  dropdownItems.forEach(item => {
    item.addEventListener('click', () => {
      const searchTerm = item.getAttribute('data-search');
      if (searchInput) {
        searchInput.value = searchTerm;
      }
      performLocationSearch(searchTerm);
      if (searchDropdown) searchDropdown.style.display = 'none';
    });
  });

  document.addEventListener('click', (e) => {
    if (searchDropdown && !e.target.closest('#search-pill-container') && !e.target.closest('#search-dropdown')) {
      searchDropdown.style.display = 'none';
    }
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
      }
      performLocationSearch('');
    });
  }

  if (resetSearchLink) {
    resetSearchLink.addEventListener('click', (e) => {
      e.stopPropagation();
      if (searchInput) searchInput.value = '';
      performLocationSearch('');
    });
  }

  // 5. Account Screen Interactive Modals
  function openAccountModal(badge, title, htmlContent) {
    if (!accountModal) return;
    accountModalBadge.textContent = badge;
    accountModalTitle.textContent = title;
    accountModalBody.innerHTML = htmlContent;
    accountModal.classList.add('open');
    accountModal.setAttribute('aria-hidden', 'false');
  }

  function closeAccountModal() {
    if (accountModal) {
      accountModal.classList.remove('open');
      accountModal.setAttribute('aria-hidden', 'true');
    }
  }

  if (accountModalCloseBtn) accountModalCloseBtn.addEventListener('click', closeAccountModal);
  if (accountModal) {
    accountModal.addEventListener('click', (e) => {
      if (e.target === accountModal) closeAccountModal();
    });
  }

  const editProfile = document.getElementById('hotspot-edit-profile');
  if (editProfile) {
    editProfile.addEventListener('click', () => {
      showToast('✏️ Edit Profile: Yashvi Member #2025-9482');
    });
  }

  // Tapping "My Bookings" in My Account opens the Ticket page!
  const btnBookings = document.getElementById('hotspot-bookings');
  if (btnBookings) {
    btnBookings.addEventListener('click', () => {
      navigateToTicket();
    });
  }

  const btnClasses = document.getElementById('hotspot-classes');
  if (btnClasses) {
    btnClasses.addEventListener('click', () => {
      openAccountModal(
        'GARBA WORKSHOP',
        'Group Classes',
        `<p style="margin-bottom:12px;">Learn traditional Dodhiya, Sanedo, and fusion Garba steps before Navratri begins!</p>
        <div style="background:#fff7ed; border-radius:12px; padding:12px; border:1px solid #fed7aa;">
          <strong>Batch A:</strong> 7:00 PM - 8:30 PM (Vesu Studio)<br>
          <strong>Batch B:</strong> 8:30 PM - 10:00 PM (Adajan Studio)
        </div>`
      );
    });
  }

  const btnKhelaiya = document.getElementById('hotspot-khelaiya');
  if (btnKhelaiya) {
    btnKhelaiya.addEventListener('click', () => {
      openAccountModal(
        'KHELAIYA ID',
        'Khelaiya Club',
        `<div style="text-align:center; padding:10px;">
          <div style="font-size:32px;">💃🕺</div>
          <h4 style="margin:8px 0; font-size:16px;">Khelaiya Verified Member</h4>
          <p style="font-size:13px; color:#64748b;">Special entry lane and dressing lounge access at Yashvi AC Dome.</p>
        </div>`
      );
    });
  }

  const btnBookmarked = document.getElementById('hotspot-bookmarked');
  if (btnBookmarked) {
    btnBookmarked.addEventListener('click', () => {
      showToast('🔖 Bookmarked: Purvastic Navratri & Stage Awaits Queen');
    });
  }

  const btnHelp = document.getElementById('hotspot-help');
  if (btnHelp) {
    btnHelp.addEventListener('click', () => {
      openAccountModal(
        'SUPPORT',
        'Help Center',
        `<p style="margin-bottom:10px;">Need help with your pass or venue directions?</p>
        <div style="display:flex; flex-direction:column; gap:8px;">
          <a href="tel:+919876543210" style="padding:10px; background:#f1f5f9; border-radius:10px; color:#0f172a; text-decoration:none; font-weight:700;">📞 Call Support: +91 98765 43210</a>
          <a href="https://wa.me" target="_blank" style="padding:10px; background:#22c55e; color:#fff; border-radius:10px; text-decoration:none; font-weight:700; text-align:center;">💬 Chat on WhatsApp</a>
        </div>`
      );
    });
  }

  const btnFeedback = document.getElementById('hotspot-feedback');
  if (btnFeedback) {
    btnFeedback.addEventListener('click', () => {
      showToast('⭐ Thank you for rating Yashvi App!');
    });
  }

  const btnPrivacy = document.getElementById('hotspot-privacy');
  if (btnPrivacy) {
    btnPrivacy.addEventListener('click', () => {
      openAccountModal(
        'LEGAL',
        'Privacy Policy',
        `<p style="font-size:13px; line-height:1.5;">YASHVI Entertainments respects your privacy. All your ticket data and personal information are stored securely on your device.</p>`
      );
    });
  }

  const btnSignout = document.getElementById('hotspot-signout');
  if (btnSignout) {
    btnSignout.addEventListener('click', () => {
      if (confirm('Are you sure you want to sign out of YASHVI?')) {
        showToast('Signed out successfully.');
        setTimeout(navigateToHome, 600);
      }
    });
  }

  const btnTerms = document.getElementById('hotspot-terms');
  if (btnTerms) {
    btnTerms.addEventListener('click', () => {
      showToast('Yashvi Entertainments • Terms & Privacy 2025');
    });
  }
});
