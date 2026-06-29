// ===== Image Data =====
const images = [
    {
        src: "images/ChatGPT Image Jun 29, 2026, 02_08_04 PM.png",
        name: "AI Avatar 01",
        size: "2.3 MB",
        source: "ChatGPT"
    },
    {
        src: "images/ChatGPT Image Jun 29, 2026, 02_08_09 PM.png",
        name: "AI Avatar 02",
        size: "2.3 MB",
        source: "ChatGPT"
    },
    {
        src: "images/ChatGPT Image Jun 29, 2026, 02_08_13 PM.png",
        name: "AI Avatar 03",
        size: "2.4 MB",
        source: "ChatGPT"
    },
    {
        src: "images/ChatGPT Image Jun 29, 2026, 02_08_16 PM.png",
        name: "AI Avatar 04",
        size: "2.3 MB",
        source: "ChatGPT"
    },
    {
        src: "images/ChatGPT Image Jun 29, 2026, 02_08_21 PM.png",
        name: "AI Avatar 05",
        size: "2.3 MB",
        source: "ChatGPT"
    },
    {
        src: "images/Gemini_Generated_Image_1l9iy71l9iy71l9i-clean.png",
        name: "AI Avatar 06",
        size: "8.2 MB",
        source: "Gemini"
    },
    {
        src: "images/Gemini_Generated_Image_45xk9345xk9345xk-clean.png",
        name: "AI Avatar 07",
        size: "8.0 MB",
        source: "Gemini"
    },
    {
        src: "images/Gemini_Generated_Image_6201bl6201bl6201-clean.png",
        name: "AI Avatar 08",
        size: "8.1 MB",
        source: "Gemini"
    },
    {
        src: "images/Gemini_Generated_Image_9p4gll9p4gll9p4g-clean.png",
        name: "AI Avatar 09",
        size: "7.6 MB",
        source: "Gemini"
    },
    {
        src: "images/Gemini_Generated_Image_hzdbwvhzdbwvhzdb-clean.png",
        name: "AI Avatar 10",
        size: "8.1 MB",
        source: "Gemini"
    },
    {
        src: "images/Gemini_Generated_Image_oc9isboc9isboc9i-clean.png",
        name: "AI Avatar 11",
        size: "8.3 MB",
        source: "Gemini"
    }
];

// ===== DOM References =====
const galleryGrid = document.getElementById("galleryGrid");
const lightbox = document.getElementById("lightbox");
const lightboxOverlay = document.getElementById("lightboxOverlay");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxClose = document.getElementById("lightboxClose");
const lightboxPrev = document.getElementById("lightboxPrev");
const lightboxNext = document.getElementById("lightboxNext");
const lightboxCounter = document.getElementById("lightboxCounter");
const lightboxDownload = document.getElementById("lightboxDownload");
const lightboxLoader = document.getElementById("lightboxLoader");
const downloadAllBtn = document.getElementById("downloadAllBtn");

// Upload modal references
const uploadBtn = document.getElementById("uploadBtn");
const uploadModal = document.getElementById("uploadModal");
const uploadModalOverlay = document.getElementById("uploadModalOverlay");
const uploadModalClose = document.getElementById("uploadModalClose");
const uploadDropzone = document.getElementById("uploadDropzone");
const fileInput = document.getElementById("fileInput");
const uploadPreviewArea = document.getElementById("uploadPreviewArea");
const uploadActions = document.getElementById("uploadActions");
const uploadClearBtn = document.getElementById("uploadClearBtn");
const uploadAddBtn = document.getElementById("uploadAddBtn");

let currentIndex = 0;
let pendingFiles = []; // files staged for upload

// ===== IndexedDB Storage for Uploaded Images =====
const DB_NAME = "AvatarGalleryDB";
const DB_VERSION = 1;
const STORE_NAME = "uploadedImages";

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
            }
        };
        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror = (e) => reject(e.target.error);
    });
}

function saveImageToDB(imageData) {
    return openDB().then(db => {
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, "readwrite");
            const store = tx.objectStore(STORE_NAME);
            const request = store.add(imageData);
            request.onsuccess = () => resolve(request.result);
            request.onerror = (e) => reject(e.target.error);
        });
    });
}

function getAllImagesFromDB() {
    return openDB().then(db => {
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, "readonly");
            const store = tx.objectStore(STORE_NAME);
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = (e) => reject(e.target.error);
        });
    });
}

function deleteImageFromDB(id) {
    return openDB().then(db => {
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, "readwrite");
            const store = tx.objectStore(STORE_NAME);
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = (e) => reject(e.target.error);
        });
    });
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
    });
}

async function loadSavedImages() {
    try {
        const savedImages = await getAllImagesFromDB();
        savedImages.forEach(saved => {
            images.push({
                src: saved.dataUrl,
                name: saved.name,
                size: saved.size,
                source: "Uploaded",
                isBlob: false,
                dbId: saved.id
            });
        });
    } catch (err) {
        console.warn("Could not load saved images:", err);
    }
}

// ===== Background Particles =====
function createParticles() {
    const container = document.getElementById("particles");
    const colors = [
        "rgba(167, 139, 250, 0.3)",
        "rgba(6, 182, 212, 0.25)",
        "rgba(244, 114, 182, 0.2)",
        "rgba(52, 211, 153, 0.2)"
    ];

    for (let i = 0; i < 30; i++) {
        const particle = document.createElement("div");
        particle.className = "particle";
        const size = Math.random() * 4 + 2;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const duration = Math.random() * 20 + 15;
        const delay = Math.random() * 20;
        const left = Math.random() * 100;

        particle.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            left: ${left}%;
            animation-duration: ${duration}s;
            animation-delay: ${delay}s;
            box-shadow: 0 0 ${size * 3}px ${color};
        `;
        container.appendChild(particle);
    }
}

// ===== Update Counter =====
function updateImageCount() {
    document.getElementById("imageCount").textContent = images.length;
}

// ===== Render Gallery Cards =====
function renderGallery() {
    galleryGrid.innerHTML = "";

    images.forEach((img, index) => {
        const card = document.createElement("div");
        card.className = "gallery-card";
        card.setAttribute("data-index", index);

        const isHD = img.source === "Gemini";
        const isUploaded = img.source === "Uploaded";
        const canDelete = isUploaded && img.dbId;

        card.innerHTML = `
            <div class="card-image-wrapper">
                <div class="shimmer" data-shimmer></div>
                <img
                    src="${img.src}"
                    alt="${img.name}"
                    class="card-image"
                    loading="lazy"
                    draggable="false"
                />
                <div class="quality-badge">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    ${isHD ? "ULTRA HD" : "HD"}
                </div>
                ${isUploaded ? '<div class="uploaded-badge">Uploaded</div>' : ''}
                ${canDelete ? `<button class="card-delete-btn" data-dbid="${img.dbId}" data-index="${index}" title="Remove from gallery"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button>` : ''}
                <div class="card-view-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                    </svg>
                </div>
                <div class="card-overlay">
                    <div class="card-info">
                        <span class="card-label">${img.name}</span>
                        <span class="card-size">${img.size} • ${img.source}</span>
                    </div>
                    <button class="card-download-btn" data-download="${index}" title="Download ${img.name}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        Download
                    </button>
                </div>
            </div>
        `;

        // Remove shimmer when image loads
        const imgEl = card.querySelector(".card-image");
        const shimmer = card.querySelector("[data-shimmer]");

        imgEl.addEventListener("load", () => {
            shimmer.style.opacity = "0";
            setTimeout(() => shimmer.remove(), 300);
        });

        imgEl.addEventListener("error", () => {
            shimmer.style.opacity = "0";
        });

        // Click card to open lightbox
        card.addEventListener("click", (e) => {
            if (e.target.closest(".card-download-btn")) return;
            if (e.target.closest(".card-delete-btn")) return;
            openLightbox(index);
        });

        // Download button on card
        const downloadBtn = card.querySelector(".card-download-btn");
        downloadBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            downloadImage(index);
        });

        // Delete button on uploaded card
        const deleteBtn = card.querySelector(".card-delete-btn");
        if (deleteBtn) {
            deleteBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                const dbId = Number(deleteBtn.getAttribute("data-dbid"));
                const idx = Number(deleteBtn.getAttribute("data-index"));
                deleteUploadedImage(dbId, idx);
            });
        }

        galleryGrid.appendChild(card);
    });

    updateImageCount();
}

// ===== Lightbox Functions =====
function openLightbox(index) {
    currentIndex = index;
    updateLightboxImage();
    lightbox.classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeLightbox() {
    lightbox.classList.remove("active");
    document.body.style.overflow = "";
}

function updateLightboxImage() {
    const img = images[currentIndex];
    lightboxLoader.classList.remove("hidden");
    lightboxImg.style.opacity = "0";

    const tempImg = new Image();
    tempImg.onload = () => {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.name;
        lightboxImg.style.opacity = "1";
        lightboxLoader.classList.add("hidden");
    };
    tempImg.onerror = () => {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.name;
        lightboxImg.style.opacity = "1";
        lightboxLoader.classList.add("hidden");
    };
    tempImg.src = img.src;

    lightboxCounter.textContent = `${currentIndex + 1} / ${images.length}`;
}

function nextImage() {
    currentIndex = (currentIndex + 1) % images.length;
    updateLightboxImage();
}

function prevImage() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateLightboxImage();
}

// ===== Download Functions =====
function downloadImage(index) {
    const img = images[index];
    const link = document.createElement("a");
    link.href = img.src;
    link.download = `${img.name.replace(/\s+/g, "_")}_${img.source}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Downloading ${img.name}...`);
}

function downloadAllImages() {
    images.forEach((img, index) => {
        setTimeout(() => {
            downloadImage(index);
        }, index * 500);
    });
    showToast("Downloading all avatars...");
}

// ===== Toast Notification =====
function showToast(message) {
    // Remove existing toast
    const existing = document.querySelector(".download-toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.className = "download-toast";
    toast.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        ${message}
    `;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add("show");
    });

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// ===== Upload Modal Functions =====
function openUploadModal() {
    uploadModal.classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeUploadModal() {
    uploadModal.classList.remove("active");
    document.body.style.overflow = "";
}

function formatFileSize(bytes) {
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + " MB";
    if (bytes >= 1024) return (bytes / 1024).toFixed(1) + " KB";
    return bytes + " B";
}

function handleFiles(fileList) {
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"];

    Array.from(fileList).forEach(file => {
        if (!validTypes.includes(file.type)) {
            showToast(`"${file.name}" is not a supported image format`);
            return;
        }
        // Avoid duplicates
        if (pendingFiles.some(f => f.name === file.name && f.size === file.size)) return;
        pendingFiles.push(file);
    });

    renderUploadPreviews();
}

function renderUploadPreviews() {
    uploadPreviewArea.innerHTML = "";

    pendingFiles.forEach((file, index) => {
        const item = document.createElement("div");
        item.className = "upload-preview-item";
        item.style.animationDelay = `${index * 0.05}s`;

        const url = URL.createObjectURL(file);

        item.innerHTML = `
            <img src="${url}" alt="${file.name}" />
            <button class="upload-preview-remove" data-index="${index}" title="Remove">&times;</button>
            <div class="upload-preview-name">${file.name}</div>
        `;

        // Remove button
        item.querySelector(".upload-preview-remove").addEventListener("click", () => {
            URL.revokeObjectURL(url);
            pendingFiles.splice(index, 1);
            renderUploadPreviews();
        });

        uploadPreviewArea.appendChild(item);
    });

    // Show/hide action buttons
    if (pendingFiles.length > 0) {
        uploadActions.classList.add("visible");
    } else {
        uploadActions.classList.remove("visible");
    }
}

function clearPendingFiles() {
    pendingFiles = [];
    renderUploadPreviews();
}

async function addUploadedToGallery() {
    if (pendingFiles.length === 0) return;

    let addedCount = 0;
    showToast("Saving images... please wait");

    for (const file of pendingFiles) {
        try {
            const dataUrl = await fileToBase64(file);
            const name = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
            const size = formatFileSize(file.size);

            // Save to IndexedDB
            const dbId = await saveImageToDB({
                dataUrl: dataUrl,
                name: name,
                size: size,
                fileName: file.name,
                timestamp: Date.now()
            });

            // Add to gallery array
            images.push({
                src: dataUrl,
                name: name,
                size: size,
                source: "Uploaded",
                isBlob: false,
                dbId: dbId
            });

            addedCount++;
        } catch (err) {
            console.error("Failed to save image:", file.name, err);
            showToast(`Failed to save "${file.name}" — file may be too large`);
        }
    }

    pendingFiles = [];
    uploadPreviewArea.innerHTML = "";
    uploadActions.classList.remove("visible");
    closeUploadModal();
    renderGallery();
    showToast(`${addedCount} image${addedCount > 1 ? "s" : ""} saved to gallery permanently!`);
}

async function deleteUploadedImage(dbId, index) {
    try {
        await deleteImageFromDB(dbId);
        images.splice(index, 1);
        renderGallery();
        showToast("Image removed from gallery");
    } catch (err) {
        console.error("Failed to delete image:", err);
        showToast("Failed to remove image");
    }
}

// ===== Event Listeners =====
lightboxClose.addEventListener("click", closeLightbox);
lightboxOverlay.addEventListener("click", closeLightbox);
lightboxPrev.addEventListener("click", prevImage);
lightboxNext.addEventListener("click", nextImage);
lightboxDownload.addEventListener("click", () => downloadImage(currentIndex));
downloadAllBtn.addEventListener("click", downloadAllImages);

// Upload events
uploadBtn.addEventListener("click", openUploadModal);
uploadModalOverlay.addEventListener("click", closeUploadModal);
uploadModalClose.addEventListener("click", closeUploadModal);
uploadClearBtn.addEventListener("click", clearPendingFiles);
uploadAddBtn.addEventListener("click", addUploadedToGallery);

// Dropzone click to browse
uploadDropzone.addEventListener("click", () => fileInput.click());

// File input change
fileInput.addEventListener("change", (e) => {
    handleFiles(e.target.files);
    fileInput.value = ""; // reset so same file can be re-selected
});

// Drag and drop
uploadDropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadDropzone.classList.add("drag-over");
});

uploadDropzone.addEventListener("dragleave", (e) => {
    e.preventDefault();
    uploadDropzone.classList.remove("drag-over");
});

uploadDropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadDropzone.classList.remove("drag-over");
    if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
    }
});

// Keyboard navigation
document.addEventListener("keydown", (e) => {
    // Close upload modal on Escape
    if (e.key === "Escape" && uploadModal.classList.contains("active")) {
        closeUploadModal();
        return;
    }

    if (!lightbox.classList.contains("active")) return;

    switch (e.key) {
        case "Escape":
            closeLightbox();
            break;
        case "ArrowLeft":
            prevImage();
            break;
        case "ArrowRight":
            nextImage();
            break;
    }
});

// Touch swipe support for lightbox
let touchStartX = 0;
let touchEndX = 0;

lightbox.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

lightbox.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 60) {
        if (diff > 0) nextImage();
        else prevImage();
    }
}, { passive: true });

// ===== Initialize =====
document.addEventListener("DOMContentLoaded", async () => {
    createParticles();
    await loadSavedImages();
    renderGallery();
});
