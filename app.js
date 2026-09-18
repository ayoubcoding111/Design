/**
 * ==========================================================================
 * IZEM ENERGY - INTERACTIVE ECOMMERCE & GSAP ENGINE
 * Tubik-Inspired Interactions, Web Audio, ScrollTrigger & Cart
 * ==========================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  // ------------------------------------------------------------------------
  // 1. SOUND FX SYNTHESIZER (Web Audio API - Procedural Audio)
  // ------------------------------------------------------------------------
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.enabled = false;
      this.init();
    }

    init() {
      const saved = localStorage.getItem("izem_sound_enabled");
      this.enabled = saved === "true";
      this.updateUI();
    }

    ensureContext() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume();
      }
    }

    toggle() {
      this.ensureContext();
      this.enabled = !this.enabled;
      localStorage.setItem("izem_sound_enabled", this.enabled);
      this.updateUI();
      if (this.enabled) {
        this.playPop(520, 0.1);
      }
    }

    updateUI() {
      const btn = document.getElementById("sound-toggle");
      if (btn) {
        if (this.enabled) {
          btn.classList.add("playing");
          btn.setAttribute("aria-label", "Mute Sound");
          btn.setAttribute("title", "Sound ON (Click to mute)");
        } else {
          btn.classList.remove("playing");
          btn.setAttribute("aria-label", "Enable Sound");
          btn.setAttribute("title", "Sound OFF (Click to unmute)");
        }
      }
    }

    // Soda can pop & fizz sound
    playCanOpen() {
      if (!this.enabled) return;
      this.ensureContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      // 1. Metallic click pop
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.08);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);

      // 2. High-frequency gas fizz (White noise buffer)
      const bufferSize = this.ctx.sampleRate * 0.45;
      const noiseBuffer = this.ctx.createBuffer(
        1,
        bufferSize,
        this.ctx.sampleRate,
      );
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      // Filter noise for carbonation hiss
      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(4500, now + 0.04);
      filter.Q.setValueAtTime(3.0, now + 0.04);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0, now);
      noiseGain.gain.setValueAtTime(0.25, now + 0.04);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      whiteNoise.start(now + 0.03);
      whiteNoise.stop(now + 0.48);
    }

    // Micro UI interaction click/pop
    playPop(freq = 440, duration = 0.06) {
      if (!this.enabled) return;
      this.ensureContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + duration);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + duration);
    }

    // Add to cart chime
    playAddToCart() {
      if (!this.enabled) return;
      this.ensureContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      [587.33, 739.99, 880.0].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.15, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.3);
      });
    }
  }

  const sound = new SoundEngine();

  // ------------------------------------------------------------------------
  // 2. FLAVOR DATA & THEME CONTROLLER
  // ------------------------------------------------------------------------
  const FLAVORS = {
    classic: {
      key: "classic",
      name: "Classic Lion Energy",
      headline: "WILD POWER",
      sub: "Original electric boost infused with natural guarana & natural caffeine.",
      tag: "ORIGINAL FORMULA",
      img: "imgs/can-classic-norm.png",
      caffeine: "80 mg",
      calories: "45 kcal",
      volume: "250 ml",
      price: 120,
      color: "#65d01e",
    },
    "pomme-figue": {
      key: "pomme-figue",
      name: "Pomme & Figue",
      headline: "MEDITERRANEAN PULSE",
      sub: "Crisp green apple fused with sun-ripened Algerian fig extract.",
      tag: "FRUITY INFUSION",
      img: "imgs/can-pomme-figue-norm.png",
      caffeine: "80 mg",
      calories: "42 kcal",
      volume: "250 ml",
      price: 120,
      color: "#00c896",
    },
    "pasteque-fraise": {
      key: "pasteque-fraise",
      name: "Pastèque & Fraise",
      headline: "SUMMER BLAST",
      sub: "Vibrant watermelon and sweet wild strawberry for intense refreshment.",
      tag: "TROPICAL SURGE",
      img: "imgs/can-pasteque-fraise-norm.png",
      caffeine: "80 mg",
      calories: "44 kcal",
      volume: "250 ml",
      price: 120,
      color: "#ff2a5f",
    },
    cerise: {
      key: "cerise",
      name: "Cerise Sauvage",
      headline: "WILD CHERRY RUSH",
      sub: "Bold dark cherry with a sharp, electrifying antioxidant kick.",
      tag: "DEEP CRUSH",
      img: "imgs/can-cerise-norm.png",
      caffeine: "80 mg",
      calories: "46 kcal",
      volume: "250 ml",
      price: 120,
      color: "#b325d3",
    },
  };

  let currentFlavorKey = "classic";

  function setFlavor(key) {
    if (!FLAVORS[key]) return;
    currentFlavorKey = key;
    const flavor = FLAVORS[key];

    // Play switch sound
    sound.playCanOpen();

    // 1. Apply data-theme to body for CSS variable updates
    document.body.setAttribute("data-theme", key);

    // 2. Animate Hero Can with GSAP
    const heroCan = document.getElementById("hero-can-img");
    if (heroCan && window.gsap) {
      gsap.to(heroCan, {
        scale: 0.82,
        rotationY: 90,
        opacity: 0.6,
        duration: 0.22,
        ease: "power2.in",
        onComplete: () => {
          heroCan.src = flavor.img;
          gsap.to(heroCan, {
            scale: 1,
            rotationY: 0,
            opacity: 1,
            duration: 0.45,
            ease: "back.out(1.7)",
          });
        },
      });
    } else if (heroCan) {
      heroCan.src = flavor.img;
    }

    // 3. Update Hero Copy & Flavor Card
    const heroHeadline = document.getElementById("hero-flavor-headline");
    const heroSub = document.getElementById("hero-flavor-sub");
    const cardTitle = document.getElementById("card-flavor-name");
    const cardDesc = document.getElementById("card-flavor-desc");

    if (heroHeadline) heroHeadline.textContent = flavor.headline;
    if (heroSub) heroSub.textContent = flavor.sub;
    if (cardTitle) cardTitle.textContent = flavor.name;
    if (cardDesc) cardDesc.textContent = flavor.sub;

    // 4. Update Active Buttons in Flavor Selector
    document.querySelectorAll(".flavor-btn").forEach((btn) => {
      const f = btn.getAttribute("data-flavor");
      if (f === key) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    // 5. Also sync Builder chip
    document.querySelectorAll(".builder-chip").forEach((chip) => {
      if (chip.getAttribute("data-flavor") === key) {
        chip.classList.add("active");
      } else {
        chip.classList.remove("active");
      }
    });
  }

  // ------------------------------------------------------------------------
  // 3. PACK BUILDER CONTROLLER (E-Commerce Purchase Hub)
  // ------------------------------------------------------------------------
  const PACK_SIZES = {
    single: {
      count: 1,
      name: "Single Can",
      price: 120,
      savings: 0,
      perCan: "120 DA / can",
    },
    six: {
      count: 6,
      name: "6-Pack Case",
      price: 690,
      savings: 30,
      perCan: "115 DA / can",
    },
    twelve: {
      count: 12,
      name: "12-Pack Party",
      price: 1350,
      savings: 90,
      perCan: "112.5 DA / can",
    },
    twentyfour: {
      count: 24,
      name: "24-Pack Beast",
      price: 2590,
      savings: 290,
      perCan: "107.9 DA / can",
    },
  };

  let selectedPack = "six";
  let builderQty = 1;
  let builderFlavor = "classic";

  function updatePackVisuals() {
    const trioCenter = document.getElementById("trio-can-center");
    if (trioCenter && FLAVORS[builderFlavor]) {
      trioCenter.src = FLAVORS[builderFlavor].img;
    }
  }

  // ------------------------------------------------------------------------
  // 4. SHOPPING CART ENGINE (DA Currency & Slide-Out Drawer)
  // ------------------------------------------------------------------------
  class CartEngine {
    constructor() {
      this.items = [];
      this.freeShippingGoal = 2000; // 2000 DA threshold
      this.load();
    }

    load() {
      try {
        const data = localStorage.getItem("izem_cart");
        this.items = data ? JSON.parse(data) : [];
      } catch (e) {
        this.items = [];
      }
      this.render();
    }

    save() {
      localStorage.setItem("izem_cart", JSON.stringify(this.items));
      this.render();
    }

    addItem(flavorKey, packKey, quantity = 1) {
      const flavor = FLAVORS[flavorKey] || FLAVORS.classic;
      const pack = PACK_SIZES[packKey] || PACK_SIZES.single;
      const id = `${flavorKey}-${packKey}`;

      const existing = this.items.find((item) => item.id === id);
      if (existing) {
        existing.qty += quantity;
      } else {
        this.items.push({
          id,
          flavorKey,
          flavorName: flavor.name,
          packKey,
          packName: pack.name,
          packCount: pack.count,
          unitPrice: pack.price,
          img: flavor.img,
          qty: quantity,
        });
      }

      this.save();
      sound.playAddToCart();
      this.showToast(`Added ${pack.name} (${flavor.name}) to cart!`);
      this.animateBadge();
    }

    updateQty(id, delta) {
      const item = this.items.find((i) => i.id === id);
      if (!item) return;

      item.qty += delta;
      if (item.qty <= 0) {
        this.items = this.items.filter((i) => i.id !== id);
      }
      sound.playPop(480, 0.05);
      this.save();
    }

    removeItem(id) {
      this.items = this.items.filter((i) => i.id !== id);
      sound.playPop(320, 0.08);
      this.save();
    }

    getTotalCount() {
      return this.items.reduce((sum, item) => sum + item.qty, 0);
    }

    getSubtotal() {
      return this.items.reduce(
        (sum, item) => sum + item.unitPrice * item.qty,
        0,
      );
    }

    render() {
      // 1. Update Header Badges
      const totalCount = this.getTotalCount();
      const badge = document.getElementById("cart-badge-count");
      if (badge) {
        badge.textContent = totalCount;
        badge.style.display = totalCount > 0 ? "inline-block" : "none";
      }

      // 2. Render Drawer List
      const container = document.getElementById("cart-items-container");
      const emptyState = document.getElementById("cart-empty-state");
      const subtotalElem = document.getElementById("cart-subtotal");
      const totalElem = document.getElementById("cart-total");
      const shippingProgress = document.getElementById(
        "shipping-progress-fill",
      );
      const shippingNotice = document.getElementById("shipping-notice-text");

      if (!container) return;

      const subtotal = this.getSubtotal();
      if (subtotalElem)
        subtotalElem.textContent = `${subtotal.toLocaleString()} DA`;
      if (totalElem) totalElem.textContent = `${subtotal.toLocaleString()} DA`;

      // Free shipping progress
      if (shippingProgress && shippingNotice) {
        const remaining = Math.max(0, this.freeShippingGoal - subtotal);
        const progressPct = Math.min(
          100,
          (subtotal / this.freeShippingGoal) * 100,
        );
        shippingProgress.style.width = `${progressPct}%`;

        if (remaining === 0) {
          shippingNotice.innerHTML =
            "🎉 You qualified for <span>FREE DELIVERY</span> in Algeria!";
        } else {
          shippingNotice.innerHTML = `Add <span>${remaining.toLocaleString()} DA</span> more for free delivery across Algeria!`;
        }
      }

      if (this.items.length === 0) {
        if (emptyState) emptyState.style.display = "flex";
        container.innerHTML = "";
        return;
      }

      if (emptyState) emptyState.style.display = "none";

      container.innerHTML = this.items
        .map(
          (item) => `
        <div class="cart-item" data-id="${item.id}">
          <img src="${item.img}" alt="${item.flavorName}" class="cart-item-thumb" />
          <div class="cart-item-details">
            <h4 class="cart-item-name">${item.packName}</h4>
            <p class="cart-item-flavor">${item.flavorName}</p>
            <div class="cart-item-price">${(item.unitPrice * item.qty).toLocaleString()} DA</div>
          </div>
          <div class="cart-item-controls">
            <div class="qty-control" style="transform: scale(0.85); margin-right: 4px;">
              <button class="qty-btn" onclick="window.cart.updateQty('${item.id}', -1)">-</button>
              <span class="qty-val">${item.qty}</span>
              <button class="qty-btn" onclick="window.cart.updateQty('${item.id}', 1)">+</button>
            </div>
            <button class="cart-item-remove" onclick="window.cart.removeItem('${item.id}')" title="Remove">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      `,
        )
        .join("");
    }

    animateBadge() {
      const badge = document.getElementById("cart-badge-count");
      if (badge && window.gsap) {
        gsap.fromTo(
          badge,
          { scale: 0.6 },
          { scale: 1.3, duration: 0.15, yoyo: true, repeat: 1 },
        );
      }
    }

    showToast(message) {
      let toast = document.getElementById("global-toast");
      if (!toast) {
        toast = document.createElement("div");
        toast.id = "global-toast";
        toast.className = "toast-notice";
        document.body.appendChild(toast);
      }
      toast.innerHTML = `<span>⚡</span> <span>${message}</span>`;
      toast.classList.add("show");
      setTimeout(() => {
        toast.classList.remove("show");
      }, 3200);
    }
  }

  window.cart = new CartEngine();

  // ------------------------------------------------------------------------
  // 5. CART DRAWER UI & MODALS
  // ------------------------------------------------------------------------
  const cartDrawer = document.getElementById("cart-drawer");
  const cartBackdrop = document.getElementById("cart-backdrop");
  const cartOpenBtn = document.getElementById("cart-open-btn");
  const cartCloseBtn = document.getElementById("cart-close-btn");

  function openCart() {
    sound.playPop(520, 0.05);
    if (cartDrawer) cartDrawer.classList.add("active");
    if (cartBackdrop) cartBackdrop.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeCart() {
    sound.playPop(380, 0.05);
    if (cartDrawer) cartDrawer.classList.remove("active");
    if (cartBackdrop) cartBackdrop.classList.remove("active");
    document.body.style.overflow = "";
  }

  if (cartOpenBtn) cartOpenBtn.addEventListener("click", openCart);
  if (cartCloseBtn) cartCloseBtn.addEventListener("click", closeCart);
  if (cartBackdrop) cartBackdrop.addEventListener("click", closeCart);

  // Keyboard shortcut Esc to close cart drawer
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeCart();
    }
  });

  // Sound Toggle Button listener
  const soundToggle = document.getElementById("sound-toggle");
  if (soundToggle) {
    soundToggle.addEventListener("click", () => {
      sound.toggle();
    });
  }

  // ------------------------------------------------------------------------
  // 6. EVENT LISTENERS: FLAVORS & PACKS
  // ------------------------------------------------------------------------
  // Hero Flavor Selector Pills
  document.querySelectorAll(".flavor-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const flavor = btn.getAttribute("data-flavor");
      if (flavor) setFlavor(flavor);
    });
  });

  // Pack Selector Radio Cards
  document.querySelectorAll(".pack-radio-card").forEach((card) => {
    card.addEventListener("click", () => {
      document
        .querySelectorAll(".pack-radio-card")
        .forEach((c) => c.classList.remove("selected"));
      card.classList.add("selected");
      selectedPack = card.getAttribute("data-pack");
      sound.playPop(480, 0.05);
    });
  });

  // Builder Flavor Chips
  document.querySelectorAll(".builder-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      builderFlavor = chip.getAttribute("data-flavor");
      setFlavor(builderFlavor);
      updatePackVisuals();
    });
  });

  // Quantity adjustments in Pack Builder
  const qtyMinus = document.getElementById("pack-qty-minus");
  const qtyPlus = document.getElementById("pack-qty-plus");
  const qtyDisplay = document.getElementById("pack-qty-val");

  if (qtyMinus && qtyPlus && qtyDisplay) {
    qtyMinus.addEventListener("click", () => {
      if (builderQty > 1) {
        builderQty--;
        qtyDisplay.textContent = builderQty;
        sound.playPop(380, 0.04);
      }
    });

    qtyPlus.addEventListener("click", () => {
      if (builderQty < 99) {
        builderQty++;
        qtyDisplay.textContent = builderQty;
        sound.playPop(520, 0.04);
      }
    });
  }

  // Add Pack to Cart button
  const addPackBtn = document.getElementById("btn-add-pack");
  if (addPackBtn) {
    addPackBtn.addEventListener("click", () => {
      window.cart.addItem(builderFlavor, selectedPack, builderQty);
    });
  }

  // Quick Add from Hero
  const heroBuyBtn = document.getElementById("hero-quick-buy");
  if (heroBuyBtn) {
    heroBuyBtn.addEventListener("click", () => {
      window.cart.addItem(currentFlavorKey, "six", 1);
      openCart();
    });
  }

  // Quick Add buttons on Flavor Lab cards
  document.querySelectorAll(".btn-flavor-add").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const fKey = btn.getAttribute("data-flavor");
      window.cart.addItem(fKey, "single", 1);
    });
  });

  // Checkout Button simulation
  const checkoutBtn = document.getElementById("btn-checkout");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      if (window.cart.items.length === 0) {
        alert("Your cart is empty! Add some IZEM Energy drinks first.");
        return;
      }
      sound.playAddToCart();
      alert(
        `🎉 Order Confirmed!\nTotal: ${window.cart.getSubtotal().toLocaleString()} DA\nDelivery across Algeria within 24-48 hours. Thank you for choosing IZEM Energy!`,
      );
      window.cart.items = [];
      window.cart.save();
      closeCart();
    });
  }

  // Navbar Scroll Background Transition
  const header = document.querySelector(".site-header");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
      header?.classList.add("scrolled");
    } else {
      header?.classList.remove("scrolled");
    }
  });

  // ------------------------------------------------------------------------
  // 7. GSAP SCROLLTRIGGER & PARALLAX ENGINE
  // ------------------------------------------------------------------------
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    // Mouse movement parallax for Hero Can (Tubik signature 3D depth)
    const canStage = document.getElementById("hero-can-stage");
    const canWrapper = document.getElementById("hero-can-wrapper");

    if (canStage && canWrapper && window.innerWidth > 992) {
      canStage.addEventListener("mousemove", (e) => {
        const rect = canStage.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        gsap.to(canWrapper, {
          rotationY: x * 26,
          rotationX: -y * 22,
          x: x * 30,
          y: y * 25,
          duration: 0.5,
          ease: "power1.out",
          transformPerspective: 900,
          transformOrigin: "center center",
        });
      });

      canStage.addEventListener("mouseleave", () => {
        gsap.to(canWrapper, {
          rotationY: 0,
          rotationX: 0,
          x: 0,
          y: 0,
          duration: 0.8,
          ease: "elastic.out(1, 0.4)",
        });
      });
    }

    // Hero entrance timeline
    const heroTl = gsap.timeline();
    heroTl
      .from(".site-header", {
        y: -80,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      })
      .from(
        ".hero-title span",
        { y: 60, opacity: 0, stagger: 0.12, duration: 0.9, ease: "power3.out" },
        "-=0.4",
      )
      .from(
        "#hero-can-wrapper",
        {
          y: 120,
          opacity: 0,
          scale: 0.8,
          duration: 1.1,
          ease: "back.out(1.6)",
        },
        "-=0.6",
      )
      .from(
        ".floating-badge",
        {
          scale: 0,
          opacity: 0,
          stagger: 0.2,
          duration: 0.7,
          ease: "back.out(2)",
        },
        "-=0.4",
      )
      .from(
        ".flavor-picker-card",
        { x: 50, opacity: 0, duration: 0.8, ease: "power3.out" },
        "-=0.6",
      );

    // Continuous subtle floating levitation for Hero Can
    gsap.to("#hero-can-wrapper", {
      y: "-=18",
      rotation: 1.5,
      duration: 2.8,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    // Story / Ingredients Cards staggered reveal on scroll
    gsap.from(".story-card", {
      scrollTrigger: {
        trigger: "#story-section",
        start: "top 75%",
      },
      y: 50,
      opacity: 0,
      stagger: 0.18,
      duration: 0.9,
      ease: "power3.out",
    });

    // Flavor Lab cards staggered reveal
    gsap.from(".flavor-item-card", {
      scrollTrigger: {
        trigger: "#flavor-lab",
        start: "top 75%",
      },
      y: 60,
      opacity: 0,
      stagger: 0.14,
      duration: 0.85,
      ease: "power3.out",
    });

    // Pack Builder Cans fly into lineup
    gsap.from(".trio-can", {
      scrollTrigger: {
        trigger: "#packs",
        start: "top 75%",
      },
      scale: 0.6,
      opacity: 0,
      y: 80,
      stagger: 0.15,
      duration: 1,
      ease: "back.out(1.5)",
    });

    // Numbers counter animation
    document.querySelectorAll(".stat-num").forEach((counter) => {
      const targetText = counter.textContent;
      const targetVal = parseInt(targetText.replace(/\D/g, ""), 10);
      if (!isNaN(targetVal)) {
        ScrollTrigger.create({
          trigger: counter,
          start: "top 85%",
          once: true,
          onEnter: () => {
            gsap.fromTo(
              counter,
              { innerHTML: 0 },
              {
                innerHTML: targetVal,
                duration: 1.8,
                ease: "power2.out",
                snap: { innerHTML: 1 },
                onUpdate: () => {
                  counter.innerHTML = `${Math.floor(counter.innerHTML)}${targetText.replace(/[0-9]/g, "")}`;
                },
              },
            );
          },
        });
      }
    });
  }

  // Set default initial flavor
  setFlavor("classic");
});
