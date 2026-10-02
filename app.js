/* =========================================
   LEON & MAJICA — PRIVATE MEMORIES
   APP.JS — PART 1
   ========================================= */


/* =========================================
   SUPABASE CONFIGURATION
   ========================================= */

const SUPABASE_URL =
    "https://cbxchhonkkrlwisjjonk.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_U2CbY-32ZYfAtp7YRlokcQ_uK8bKsQ6";


/*
   The Supabase browser client is loaded dynamically.
   This means you do not need to add another script
   to index.html.
*/

let supabaseClient = null;


/* =========================================
   LOGIN DETAILS
   ========================================= */

const LOGIN_USERNAME = "leon&majica";
const LOGIN_PASSWORD = "12082000";


/* =========================================
   GLOBAL VARIABLES
   ========================================= */

let currentPlaylist = [];
let currentSongIndex = -1;

let currentUploadType = null;

let notificationTimer = null;


/* =========================================
   DOM HELPERS
   ========================================= */

function $(id) {
    return document.getElementById(id);
}


function showElement(element) {
    if (!element) return;

    element.classList.remove("hidden");
}


function hideElement(element) {
    if (!element) return;

    element.classList.add("hidden");
}


/* =========================================
   LOAD SUPABASE
   ========================================= */

function loadSupabase() {

    return new Promise((resolve, reject) => {

        if (
            window.supabase &&
            typeof window.supabase.createClient === "function"
        ) {
            resolve();
            return;
        }


        const script =
            document.createElement("script");

        script.src =
            "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

        script.onload = () => {
            resolve();
        };

        script.onerror = () => {
            reject(
                new Error(
                    "Unable to load Supabase."
                )
            );
        };

        document.head.appendChild(script);

    });

}


/* =========================================
   INITIALIZE SUPABASE
   ========================================= */

async function initializeSupabase() {

    try {

        await loadSupabase();

        supabaseClient =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_KEY
            );

        return true;

    } catch (error) {

        console.error(
            "Supabase initialization error:",
            error
        );

        showNotification(
            "Unable to connect to Supabase.",
            "⚠️"
        );

        return false;
    }

}


/* =========================================
   LOGIN
   ========================================= */

function initializeLogin() {

    const loginForm =
        $("loginForm");

    if (!loginForm) {
        return;
    }


    loginForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const username =
                $("username")?.value.trim();

            const password =
                $("password")?.value;


            const error =
                $("loginError");


            if (
                username === LOGIN_USERNAME &&
                password === LOGIN_PASSWORD
            ) {

                sessionStorage.setItem(
                    "leonMajicaLoggedIn",
                    "true"
                );

                if (error) {
                    error.textContent = "";
                }

                openApp();

            } else {

                if (error) {
                    error.textContent =
                        "Incorrect username or password.";
                }

            }

        }
    );

}


/* =========================================
   CHECK LOGIN
   ========================================= */

function checkLogin() {

    const loggedIn =
        sessionStorage.getItem(
            "leonMajicaLoggedIn"
        );


    if (loggedIn === "true") {

        openApp();

    } else {

        showLogin();

    }

}


/* =========================================
   SHOW LOGIN
   ========================================= */

function showLogin() {

    const loginScreen =
        $("loginScreen");

    const app =
        $("app");


    showElement(loginScreen);
    hideElement(app);

}


/* =========================================
   OPEN APP
   ========================================= */

async function openApp() {

    const loginScreen =
        $("loginScreen");

    const app =
        $("app");


    hideElement(loginScreen);
    showElement(app);


    /*
       Supabase is initialized when the app
       opens.
    */

    if (!supabaseClient) {
        await initializeSupabase();
    }


    /*
       These functions will be created in
       the next app.js sections.
    */

    if (typeof loadAllMemories === "function") {

        await loadAllMemories();

    }

}


/* =========================================
   LOGOUT
   ========================================= */

function initializeLogout() {

    const logoutButton =
        $("logoutButton");


    if (!logoutButton) {
        return;
    }


    logoutButton.addEventListener(
        "click",
        function () {

            sessionStorage.removeItem(
                "leonMajicaLoggedIn"
            );


            const player =
                $("audioPlayer");


            if (player) {

                player.pause();

                player.removeAttribute("src");

                player.load();

            }


            currentPlaylist = [];

            currentSongIndex = -1;


            showLogin();


            showNotification(
                "You have been logged out.",
                "👋"
            );

        }
    );

}


/* =========================================
   NAVIGATION
   ========================================= */

function initializeNavigation() {

    const buttons =
        document.querySelectorAll(
            ".nav-button"
        );


    const sections =
        document.querySelectorAll(
            ".page-section"
        );


    buttons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const targetId =
                        button.dataset.section;


                    buttons.forEach(
                        function (item) {
                            item.classList.remove(
                                "active"
                            );
                        }
                    );


                    sections.forEach(
                        function (section) {
                            section.classList.remove(
                                "active-section"
                            );
                        }
                    );


                    button.classList.add(
                        "active"
                    );


                    const target =
                        $(targetId);


                    if (target) {

                        target.classList.add(
                            "active-section"
                        );

                    }

                }
            );

        }
    );

}


/* =========================================
   MODAL SYSTEM
   ========================================= */

function openModal(modalId) {

    const modal =
        $(modalId);

    if (!modal) {
        return;
    }

    showElement(modal);

    document.body.style.overflow =
        "hidden";

}


function closeModal(modalId) {

    const modal =
        $(modalId);

    if (!modal) {
        return;
    }

    hideElement(modal);

    /*
       Only restore scrolling if there
       isn't another open modal.
    */

    const openModalExists =
        document.querySelector(
            ".modal:not(.hidden)"
        );

    if (!openModalExists) {

        document.body.style.overflow =
            "";

    }

}


/* =========================================
   INITIALIZE MODALS
   ========================================= */

function initializeModals() {

    const closeButtons =
        document.querySelectorAll(
            "[data-close-modal]"
        );


    closeButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    closeModal(
                        button.dataset.closeModal
                    );

                }
            );

        }
    );


    /*
       Close modal when clicking outside
       the modal box.
    */

    document
        .querySelectorAll(".modal")
        .forEach(
            function (modal) {

                modal.addEventListener(
                    "click",
                    function (event) {

                        if (
                            event.target === modal
                        ) {

                            closeModal(
                                modal.id
                            );

                        }

                    }
                );

            }
        );


    /*
       ESC closes open modals.
    */

    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key !== "Escape") {
                return;
            }


            document
                .querySelectorAll(
                    ".modal:not(.hidden)"
                )
                .forEach(
                    function (modal) {

                        closeModal(
                            modal.id
                        );

                    }
                );


            const viewer =
                $("imageViewer");


            if (
                viewer &&
                !viewer.classList.contains(
                    "hidden"
                )
            ) {

                closeImageViewer();

            }

        }
    );

}


/* =========================================
   NOTIFICATIONS
   ========================================= */

function showNotification(
    message,
    icon = "❤️"
) {

    const notification =
        $("notification");

    const notificationText =
        $("notificationText");

    const notificationIcon =
        $("notificationIcon");


    if (
        !notification ||
        !notificationText
    ) {
        return;
    }


    notificationText.textContent =
        message;


    if (notificationIcon) {

        notificationIcon.textContent =
            icon;

    }


    showElement(notification);


    if (notificationTimer) {

        clearTimeout(
            notificationTimer
        );

    }


    notificationTimer =
        setTimeout(
            function () {

                hideElement(
                    notification
                );

            },
            3000
        );

}


/* =========================================
   IMAGE VIEWER
   ========================================= */

function initializeImageViewer() {

    const closeButton =
        $("closeImageViewer");


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeImageViewer
        );

    }


    const viewer =
        $("imageViewer");


    if (viewer) {

        viewer.addEventListener(
            "click",
            function (event) {

                if (
                    event.target === viewer
                ) {

                    closeImageViewer();

                }

            }
        );

    }

}


function openImageViewer(
    imageUrl,
    caption = ""
) {

    const viewer =
        $("imageViewer");

    const image =
        $("viewerImage");

    const captionElement =
        $("viewerCaption");


    if (!viewer || !image) {
        return;
    }


    image.src =
        imageUrl;


    image.alt =
        caption || "Memory";


    if (captionElement) {

        captionElement.textContent =
            caption;

    }


    showElement(viewer);

    document.body.style.overflow =
        "hidden";

}


function closeImageViewer() {

    const viewer =
        $("imageViewer");

    const image =
        $("viewerImage");


    hideElement(viewer);


    if (image) {
        image.src = "";
    }


    document.body.style.overflow =
        "";

}


/* =========================================
   UPLOAD BUTTON INITIALIZATION
   ========================================= */

function initializeUploadButtons() {

    const photoButton =
        $("uploadPhotoButton");

    const videoButton =
        $("uploadVideoButton");

    const musicButton =
        $("uploadMusicButton");


    if (photoButton) {

        photoButton.addEventListener(
            "click",
            function () {

                openUploadModal("photo");

            }
        );

    }


    if (videoButton) {

        videoButton.addEventListener(
            "click",
            function () {

                openUploadModal("video");

            }
        );

    }


    if (musicButton) {

        musicButton.addEventListener(
            "click",
            function () {

                openUploadModal("music");

            }
        );

    }

}


/* =========================================
   OPEN UPLOAD MODAL
   ========================================= */

function openUploadModal(type) {

    currentUploadType =
        type;


    const title =
        $("uploadModalTitle");

    const fileInput =
        $("mediaFile");


    if (title) {

        if (type === "photo") {

            title.textContent =
                "Add Photo";

        } else if (type === "video") {

            title.textContent =
                "Add Video";

        } else if (type === "music") {

            title.textContent =
                "Add Song";

        } else {

            title.textContent =
                "Add Memory";

        }

    }


    if (fileInput) {

        fileInput.value = "";


        if (type === "photo") {

            fileInput.accept =
                "image/*";

        } else if (type === "video") {

            fileInput.accept =
                "video/*";

        } else if (type === "music") {

            fileInput.accept =
                "audio/*";

        } else {

            fileInput.accept =
                "image/*,video/*,audio/*";

        }

    }


    openModal(
        "uploadModal"
    );

}


/* =========================================
   FILE VALIDATION
   ========================================= */

function isValidFileForType(
    file,
    type
) {

    if (!file) {
        return false;
    }


    if (type === "photo") {

        return file.type.startsWith(
            "image/"
        );

    }


    if (type === "video") {

        return file.type.startsWith(
            "video/"
        );

    }


    if (type === "music") {

        return file.type.startsWith(
            "audio/"
        );

    }


    return true;

}


/* =========================================
   FORMAT FILE SIZE
   ========================================= */

function formatFileSize(bytes) {

    if (!bytes) {
        return "0 B";
    }


    const units = [
        "B",
        "KB",
        "MB",
        "GB"
    ];


    const index =
        Math.floor(
            Math.log(bytes) /
            Math.log(1024)
        );


    const safeIndex =
        Math.min(
            index,
            units.length - 1
        );


    return (
        bytes /
        Math.pow(
            1024,
            safeIndex
        )
    ).toFixed(1)
    + " "
    + units[safeIndex];

}


/* =========================================
   FORMAT DATE
   ========================================= */

function formatDate(
    dateValue
) {

    if (!dateValue) {
        return "";
    }


    const date =
        new Date(dateValue);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "";
    }


    return date.toLocaleDateString(
        undefined,
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    );

}


/* =========================================
   SAFE HTML
   ========================================= */

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================
   FILE NAME CLEANING
   ========================================= */

function cleanFileName(
    fileName
) {

    return fileName
        .replace(
            /[^a-zA-Z0-9._-]/g,
            "_"
        );

}


/* =========================================
   CREATE STORAGE PATH
   ========================================= */

function createStoragePath(
    type,
    file
) {

    const timestamp =
        Date.now();


    const random =
        Math.random()
            .toString(36)
            .substring(2, 9);


    const cleanName =
        cleanFileName(
            file.name
        );


    return (
        type +
        "/" +
        timestamp +
        "_" +
        random +
        "_" +
        cleanName
    );

}


/* =========================================
   INITIAL APP SETUP
   ========================================= */

async function initializeApp() {

    initializeLogin();

    initializeLogout();

    initializeNavigation();

    initializeModals();

    initializeImageViewer();

    initializeUploadButtons();


    const messageButton =
        $("addMessageButton");


    if (messageButton) {

        messageButton.addEventListener(
            "click",
            function () {

                openModal(
                    "messageModal"
                );

            }
        );

    }


    checkLogin();

}


/* =========================================
   START APPLICATION
   ========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeApp();

    }
);
/* =========================================
   LEON & MAJICA — APP.JS
   PART 2
   SUPABASE + MEDIA
   ========================================= */


/* =========================================
   DATABASE SETTINGS
   ========================================= */

const MEDIA_TABLE = "media";

const STORAGE_BUCKET = "memories";


/* =========================================
   CHECK SUPABASE
   ========================================= */

function requireSupabase() {

    if (!supabaseClient) {

        throw new Error(
            "Supabase is not initialized."
        );

    }

}


/* =========================================
   GET MEDIA RECORDS
   ========================================= */

async function getMediaRecords() {

    requireSupabase();


    const {
        data,
        error
    } = await supabaseClient
        .from(MEDIA_TABLE)
        .select("*")
        .order(
            "created_at",
            {
                ascending: false
            }
        );


    if (error) {

        console.error(
            "Error loading media:",
            error
        );

        throw error;

    }


    return data || [];

}


/* =========================================
   GET SIGNED URL
   ========================================= */

async function getSignedUrl(
    filePath,
    expiresIn = 3600
) {

    requireSupabase();


    if (!filePath) {
        return null;
    }


    const {
        data,
        error
    } = await supabaseClient
        .storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(
            filePath,
            expiresIn
        );


    if (error) {

        console.error(
            "Signed URL error:",
            error
        );

        return null;

    }


    return data?.signedUrl || null;

}


/* =========================================
   UPLOAD FILE
   ========================================= */

async function uploadMediaFile(
    file,
    type
) {

    requireSupabase();


    if (!file) {

        throw new Error(
            "Please select a file."
        );

    }


    if (
        !isValidFileForType(
            file,
            type
        )
    ) {

        throw new Error(
            "The selected file is not valid for this upload."
        );

    }


    const filePath =
        createStoragePath(
            type,
            file
        );


    /*
       Upload to Supabase Storage
    */

    const {
        error: uploadError
    } = await supabaseClient
        .storage
        .from(STORAGE_BUCKET)
        .upload(
            filePath,
            file,
            {
                cacheControl: "3600",
                upsert: false,
                contentType: file.type
            }
        );


    if (uploadError) {

        console.error(
            "Storage upload error:",
            uploadError
        );

        throw uploadError;

    }


    /*
       Save information in database
    */

    const {
        data,
        error: databaseError
    } = await supabaseClient
        .from(MEDIA_TABLE)
        .insert({
            file_name: file.name,
            file_path: filePath,
            file_type: type,
            mime_type: file.type,
            file_size: file.size
        })
        .select()
        .single();


    if (databaseError) {

        /*
           If database insertion fails,
           attempt to remove the uploaded file.
        */

        await supabaseClient
            .storage
            .from(STORAGE_BUCKET)
            .remove([
                filePath
            ]);


        console.error(
            "Database insert error:",
            databaseError
        );

        throw databaseError;

    }


    return data;

}


/* =========================================
   UPLOAD BUTTON HANDLER
   ========================================= */

async function handleUpload() {

    const fileInput =
        $("mediaFile");


    if (!fileInput) {
        return;
    }


    const file =
        fileInput.files?.[0];


    if (!file) {

        showNotification(
            "Please choose a file first.",
            "⚠️"
        );

        return;

    }


    if (!currentUploadType) {

        showNotification(
            "Please select an upload type.",
            "⚠️"
        );

        return;

    }


    if (
        !isValidFileForType(
            file,
            currentUploadType
        )
    ) {

        showNotification(
            "That file type is not valid here.",
            "⚠️"
        );

        return;

    }


    const uploadButton =
        $("confirmUploadButton");

    const progress =
        $("uploadProgress");

    const progressFill =
        $("progressFill");

    const progressText =
        $("progressText");


    try {

        if (uploadButton) {

            uploadButton.disabled =
                true;

            uploadButton.textContent =
                "Uploading...";

        }


        showElement(progress);


        if (progressFill) {

            progressFill.style.width =
                "20%";

        }


        if (progressText) {

            progressText.textContent =
                "Uploading your memory...";

        }


        await uploadMediaFile(
            file,
            currentUploadType
        );


        if (progressFill) {

            progressFill.style.width =
                "100%";

        }


        if (progressText) {

            progressText.textContent =
                "Upload complete ❤️";

        }


        showNotification(
            "Memory uploaded successfully!",
            "❤️"
        );


        setTimeout(
            async function () {

                closeModal(
                    "uploadModal"
                );


                if (progressFill) {

                    progressFill.style.width =
                        "0%";

                }


                hideElement(
                    progress
                );


                if (uploadButton) {

                    uploadButton.disabled =
                        false;

                    uploadButton.textContent =
                        "Upload ❤️";

                }


                await loadAllMemories();

            },
            500
        );


    } catch (error) {

        console.error(
            "Upload failed:",
            error
        );


        let message =
            "Upload failed.";


        if (
            error?.message
        ) {

            message =
                error.message;

        }


        showNotification(
            message,
            "⚠️"
        );


        if (progressText) {

            progressText.textContent =
                "Upload failed.";

        }


        if (uploadButton) {

            uploadButton.disabled =
                false;

            uploadButton.textContent =
                "Upload ❤️";

        }

    }

}


/* =========================================
   INITIALIZE UPLOAD CONFIRM BUTTON
   ========================================= */

function initializeUploadHandler() {

    const button =
        $("confirmUploadButton");


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        handleUpload
    );

}
/* =========================================
   CREATE IMAGE CARD
   ========================================= */

function createPhotoCard(item) {
    const url = item.signed_url || "";

    return `
        <div class="media-card">
            <div class="media-image-wrap">
                <img
                    src="${url}"
                    alt="${escapeHtml(item.file_name)}"
                    class="media-image"
                    onclick="openImageViewer('${url}', '${escapeHtml(item.file_name)}')"
                >
            </div>

            <div class="media-info">
                <div class="media-title">
                    ${escapeHtml(item.file_name)}
                </div>

                <div class="memory-date">
                    📅 ${formatMemoryDate(item.created_at)}
                </div>

                <div class="media-actions">
                    <button
                        class="favorite-button ${item.is_favorite ? "active" : ""}"
                        onclick="toggleMediaFavorite('${item.id}', ${item.is_favorite})"
                    >
                        ${item.is_favorite ? "❤️" : "♡"}
                    </button>

                    <button
                        class="delete-button"
                        onclick='confirmDeleteMedia(${JSON.stringify(item).replace(/'/g, "&#39;")})'
                    >
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    `;
}


/* =========================================
   CREATE VIDEO CARD
   ========================================= */

function createVideoCard(item) {
    const url = item.signed_url || "";

    return `
        <div class="media-card">
            <div class="media-video-wrap">
                <video
                    class="media-video"
                    controls
                    preload="metadata"
                >
                    <source
                        src="${url}"
                        type="${item.mime_type || "video/mp4"}"
                    >
                </video>
            </div>

            <div class="media-info">
                <div class="media-title">
                    ${escapeHtml(item.file_name)}
                </div>

                <div class="memory-date">
                    📅 ${formatMemoryDate(item.created_at)}
                </div>

                <div class="media-actions">
                    <button
                        class="favorite-button ${item.is_favorite ? "active" : ""}"
                        onclick="toggleMediaFavorite('${item.id}', ${item.is_favorite})"
                    >
                        ${item.is_favorite ? "❤️" : "♡"}
                    </button>

                    <button
                        class="delete-button"
                        onclick='confirmDeleteMedia(${JSON.stringify(item).replace(/'/g, "&#39;")})'
                    >
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    `;
}


/* =========================================
   CREATE MUSIC ITEM
   ========================================= */

function createMusicItem(item, index) {
    return `
        <div class="music-item">
            <button
                class="music-play-button"
                onclick="playSong(${index})"
                aria-label="Play song"
            >
                ▶
            </button>

            <div class="music-info">
                <div class="music-title">
                    ${escapeHtml(item.file_name)}
                </div>

                <div class="memory-date">
                    📅 ${formatMemoryDate(item.created_at)}
                </div>
            </div>

            <div class="music-actions">
                <button
                    class="favorite-button ${item.is_favorite ? "active" : ""}"
                    onclick="toggleMediaFavorite('${item.id}', ${item.is_favorite})"
                >
                    ${item.is_favorite ? "❤️" : "♡"}
                </button>

                <button
                    class="delete-button"
                    onclick='confirmDeleteMedia(${JSON.stringify(item).replace(/'/g, "&#39;")})'
                >
                    🗑️
                </button>
            </div>
        </div>
    `;
}


/* =========================================
   LOAD PHOTOS
   ========================================= */

async function loadPhotos(
    records
) {

    const grid =
        $("photoGrid");


    if (!grid) {
        return;
    }


    grid.innerHTML = "";


    const photos =
        records.filter(
            function (item) {

                return item.file_type === "photo";

            }
        );


    if (photos.length === 0) {

        grid.innerHTML = `
            <div class="empty-state">
                <div>📸</div>
                <p>No photos yet.</p>
            </div>
        `;

        return;

    }


    for (
        const item of photos
    ) {

        try {

            const card =
                await createPhotoCard(
                    item
                );


            if (card) {

                grid.insertAdjacentHTML(
    "beforeend",
    card
);

            }

        } catch (error) {

            console.error(
                "Photo error:",
                error
            );

        }

    }

}


/* =========================================
   LOAD VIDEOS
   ========================================= */

async function loadVideos(
    records
) {

    const grid =
        $("videoGrid");


    if (!grid) {
        return;
    }


    grid.innerHTML = "";


    const videos =
        records.filter(
            function (item) {

                return item.file_type === "video";

            }
        );


    if (videos.length === 0) {

        grid.innerHTML = `
            <div class="empty-state">
                <div>🎥</div>
                <p>No videos yet.</p>
            </div>
        `;

        return;

    }


    for (
        const item of videos
    ) {

        try {

            const card =
                await createVideoCard(
                    item
                );


            if (card) {

                grid.insertAdjacentHTML(
    "beforeend",
    card
);

            }

        } catch (error) {

            console.error(
                "Video error:",
                error
            );

        }

    }

}


/* =========================================
   LOAD MUSIC
   ========================================= */

function loadMusic(records) {

    const list = $("musicList");

    if (!list) {
        return;
    }

    list.innerHTML = "";

    currentPlaylist = records.filter(
        function (item) {
            return item.file_type === "music";
        }
    );

    if (currentPlaylist.length === 0) {

        list.innerHTML = `
            <div class="empty-state">
                <div>🎵</div>
                <p>No songs yet.</p>
            </div>
        `;

        return;
    }

    currentPlaylist.forEach(
        function (item, index) {

            const row =
                createMusicItem(
                    item,
                    index
                );

            list.insertAdjacentHTML(
                "beforeend",
                row
            );

        }
    );

}

/* =========================================
   UPDATE COUNTS
   ========================================= */

function updateMemoryCounts(
    records
) {

    const photos =
        records.filter(
            item =>
                item.file_type === "photo"
        ).length;


    const videos =
        records.filter(
            item =>
                item.file_type === "video"
        ).length;


    const music =
        records.filter(
            item =>
                item.file_type === "music"
        ).length;


    const photoCount =
        $("photoCount");

    const videoCount =
        $("videoCount");

    const musicCount =
        $("musicCount");


    if (photoCount) {

        photoCount.textContent =
            photos;

    }


    if (videoCount) {

        videoCount.textContent =
            videos;

    }


    if (musicCount) {

        musicCount.textContent =
            music;

    }

}


/* =========================================
   LOAD RECENT MEMORIES
   ========================================= */

function loadRecentMemories(
    records
) {

    const container =
        $("recentMemories");


    if (!container) {
        return;
    }


    container.innerHTML = "";


    const recent =
        records.slice(
            0,
            8
        );


    if (recent.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                <div>❤️</div>
                <p>Your memories will appear here.</p>
            </div>
        `;

        return;

    }


    /*
       We create lightweight preview cards.
       Full signed URLs are loaded for images.
    */

    recent.forEach(
        async function (item) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "media-card";


            if (
                item.file_type === "photo"
            ) {

                const url =
                    await getSignedUrl(
                        item.file_path
                    );


                if (url) {

                    card.innerHTML = `
                        <img
                            src="${url}"
                            alt="Memory"
                            loading="lazy">
                    `;


                    card.addEventListener(
                        "click",
                        function () {

                            openImageViewer(
                                url,
                                item.file_name || ""
                            );

                        }
                    );

                }

            } else {

                let icon = "❤️";


                if (
                    item.file_type === "video"
                ) {
                    icon = "🎥";
                }


                if (
                    item.file_type === "music"
                ) {
                    icon = "🎵";
                }


                card.innerHTML = `
                    <div class="empty-state">
                        <div>${icon}</div>
                        <p>
                            ${escapeHtml(
                                item.file_name || "Memory"
                            )}
                        </p>
                    </div>
                `;

            }


            container.appendChild(
                card
            );

        }
    );

}


/* =========================================
   LOAD ALL MEMORIES
   ========================================= */

async function loadAllMemories() {

    if (!supabaseClient) {

        const initialized =
            await initializeSupabase();


        if (!initialized) {
            return;
        }

    }


    try {

        const records =
            await getMediaRecords();


        updateMemoryCounts(
            records
        );


        loadRecentMemories(
            records
        );


        await loadPhotos(
            records
        );


        await loadVideos(
            records
        );


        loadMusic(
            records
        );


        /*
           Messages are loaded by the next
           section of app.js.
        */

        if (
            typeof loadMessages ===
            "function"
        ) {

            await loadMessages();

        }


    } catch (error) {

        console.error(
            "Could not load memories:",
            error
        );


        showNotification(
            "Could not load your memories.",
            "⚠️"
        );

    }

}


/* =========================================
   INITIALIZE PART 2
   ========================================= */

initializeUploadHandler();
/* =========================================
   LEON & MAJICA — APP.JS
   PART 3
   MUSIC PLAYER + MESSAGES
   ========================================= */


/* =========================================
   MUSIC PLAYER
   ========================================= */

async function playSong(index) {

    if (!currentPlaylist[index]) {
        return;
    }


    currentSongIndex =
        index;


    const song =
        currentPlaylist[index];


    try {

        const url =
            await getSignedUrl(
                song.file_path
            );


        const player =
            $("audioPlayer");


        if (!player || !url) {

            showNotification(
                "Unable to play this song.",
                "⚠️"
            );

            return;

        }


        player.src =
            url;


        const title =
            $("currentSongTitle");


        const artist =
            $("currentSongArtist");


        if (title) {

            title.textContent =
                song.file_name ||
                "Untitled Song";

        }


        if (artist) {

            artist.textContent =
                "Leon & Majica";

        }


        await player.play();


        updateSongButtons();


    } catch (error) {

        console.error(
            "Music playback error:",
            error
        );


        showNotification(
            "Unable to play this song.",
            "⚠️"
        );

    }

}


/* =========================================
   UPDATE MUSIC BUTTONS
   ========================================= */

function updateSongButtons() {

    const buttons =
        document.querySelectorAll(
            ".song-play-button"
        );


    buttons.forEach(
        function (button, index) {

            if (
                index === currentSongIndex
            ) {

                button.textContent =
                    "❚❚";

            } else {

                button.textContent =
                    "▶";

            }

        }
    );

}


/* =========================================
   INITIALIZE AUDIO PLAYER
   ========================================= */

function initializeAudioPlayer() {

    const player =
        $("audioPlayer");


    if (!player) {
        return;
    }


    player.addEventListener(
        "play",
        function () {

            updateSongButtons();

        }
    );


    player.addEventListener(
        "pause",
        function () {

            updateSongButtons();

        }
    );


    player.addEventListener(
        "ended",
        async function () {

            /*
               Automatically play the next song.
            */

            const nextIndex =
                currentSongIndex + 1;


            if (
                currentPlaylist[nextIndex]
            ) {

                await playSong(
                    nextIndex
                );

            } else {

                currentSongIndex =
                    -1;

                updateSongButtons();

            }

        }
    );

}


/* =========================================
   MESSAGE DATABASE TABLE
   ========================================= */

const MESSAGE_TABLE =
    "messages";


/* =========================================
   LOAD MESSAGES
   ========================================= */

async function loadMessages() {

    requireSupabase();


    const list =
        $("messageList");


    if (!list) {
        return;
    }


    try {

        const {
            data,
            error
        } = await supabaseClient
            .from(MESSAGE_TABLE)
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


        if (error) {

            /*
               If the messages table hasn't been
               created yet, don't break the rest
               of the website.
            */

            console.error(
                "Message loading error:",
                error
            );

            return;

        }


        list.innerHTML = "";


        const messages =
            data || [];


        const messageCount =
            $("messageCount");


        if (messageCount) {

            messageCount.textContent =
                messages.length;

        }


        if (
            messages.length === 0
        ) {

            list.innerHTML = `
                <div class="empty-state">
                    <div>💌</div>
                    <p>No messages yet.</p>
                </div>
            `;

            return;

        }


        messages.forEach(
            function (message) {

                const card =
                    createMessageCard(
                        message
                    );


                list.appendChild(
                    card
                );

            }
        );


    } catch (error) {

        console.error(
            "Could not load messages:",
            error
        );

    }

}


/* =========================================
   CREATE MESSAGE CARD
   ========================================= */

function createMessageCard(
    message
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "message-card";


    const title =
        escapeHtml(
            message.title ||
            "A Message"
        );


    const text =
        escapeHtml(
            message.message ||
            message.content ||
            ""
        );


    const date =
        formatDate(
            message.created_at
        );


    card.innerHTML = `
        <h3>${title}</h3>

        <p>${text}</p>

        <span class="message-date">
            ${escapeHtml(date)}
        </span>
    `;


    return card;

}


/* =========================================
   SAVE MESSAGE
   ========================================= */

async function saveMessage(
    title,
    message
) {

    requireSupabase();


    const cleanTitle =
        String(title || "")
            .trim();


    const cleanMessage =
        String(message || "")
            .trim();


    if (!cleanTitle) {

        throw new Error(
            "Please enter a title."
        );

    }


    if (!cleanMessage) {

        throw new Error(
            "Please write a message."
        );

    }


    const {
        data,
        error
    } = await supabaseClient
        .from(MESSAGE_TABLE)
        .insert({
            title: cleanTitle,
            message: cleanMessage
        })
        .select()
        .single();


    if (error) {

        console.error(
            "Save message error:",
            error
        );

        throw error;

    }


    return data;

}


/* =========================================
   INITIALIZE MESSAGE FORM
   ========================================= */

function initializeMessageForm() {

    const form =
        $("messageForm");


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const titleInput =
                $("messageTitle");


            const messageInput =
                $("messageText");


            const submitButton =
                form.querySelector(
                    'button[type="submit"]'
                );


            const title =
                titleInput?.value.trim();


            const message =
                messageInput?.value.trim();


            if (!title || !message) {

                showNotification(
                    "Please fill in the message.",
                    "⚠️"
                );

                return;

            }


            try {

                if (submitButton) {

                    submitButton.disabled =
                        true;

                    submitButton.textContent =
                        "Saving...";

                }


                await saveMessage(
                    title,
                    message
                );


                if (titleInput) {

                    titleInput.value =
                        "";

                }


                if (messageInput) {

                    messageInput.value =
                        "";

                }


                closeModal(
                    "messageModal"
                );


                showNotification(
                    "Message saved ❤️",
                    "💌"
                );


                await loadMessages();


                /*
                   Update home page count as well.
                */

                const records =
                    await getMediaRecords();


                updateMemoryCounts(
                    records
                );


            } catch (error) {

                console.error(
                    "Message save failed:",
                    error
                );


                showNotification(
                    error?.message ||
                    "Unable to save message.",
                    "⚠️"
                );


            } finally {

                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        "Save Message ❤️";

                }

            }

        }
    );

}


/* =========================================
   DELETE MEDIA
   ========================================= */

async function deleteMedia(
    item
) {

    requireSupabase();


    if (!item?.id) {
        return false;
    }


    try {

        /*
           Delete file from storage first.
        */

        if (item.file_path) {

            const {
                error: storageError
            } = await supabaseClient
                .storage
                .from(STORAGE_BUCKET)
                .remove([
                    item.file_path
                ]);


            if (storageError) {

                console.warn(
                    "Storage delete warning:",
                    storageError
                );

            }

        }


        /*
           Delete database record.
        */

        const {
            error: databaseError
        } = await supabaseClient
            .from(MEDIA_TABLE)
            .delete()
            .eq(
                "id",
                item.id
            );


        if (databaseError) {

            throw databaseError;

        }


        return true;


    } catch (error) {

        console.error(
            "Delete media error:",
            error
        );

        showNotification(
            "Unable to delete this memory.",
            "⚠️"
        );

        return false;

    }

}


/* =========================================
   DELETE MESSAGE
   ========================================= */

async function deleteMessage(
    messageId
) {

    requireSupabase();


    if (!messageId) {
        return false;
    }


    try {

        const {
            error
        } = await supabaseClient
            .from(MESSAGE_TABLE)
            .delete()
            .eq(
                "id",
                messageId
            );


        if (error) {

            throw error;

        }


        await loadMessages();


        showNotification(
            "Message deleted.",
            "🗑️"
        );


        return true;


    } catch (error) {

        console.error(
            "Delete message error:",
            error
        );


        showNotification(
            "Unable to delete message.",
            "⚠️"
        );


        return false;

    }

}


/* =========================================
   REFRESH SIGNED URL
   ========================================= */

async function refreshMediaUrl(
    filePath
) {

    if (!filePath) {
        return null;
    }


    /*
       Signed URLs expire, so this function
       can always request a fresh one.
    */

    return await getSignedUrl(
        filePath,
        3600
    );

}


/* =========================================
   INITIALIZE PART 3
   ========================================= */

initializeAudioPlayer();

initializeMessageForm();
/* =========================================
   FAVORITE + DATE HELPERS
   ========================================= */

function formatMemoryDate(dateValue) {
    if (!dateValue) {
        return "";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleDateString(
        undefined,
        {
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );
}


async function toggleMediaFavorite(id, currentValue) {
    try {
        requireSupabase();

        const { error } = await supabaseClient
            .from(MEDIA_TABLE)
            .update({
                is_favorite: !currentValue
            })
            .eq("id", id);

        if (error) {
            throw error;
        }

        showNotification(
            !currentValue
                ? "Added to favorites ❤️"
                : "Removed from favorites",
            "❤️"
        );

        await loadAllMemories();

    } catch (error) {
        console.error(
            "Favorite update error:",
            error
        );

        showNotification(
            "Could not update favorite.",
            "⚠️"
        );
    }
}


async function confirmDeleteMedia(item) {

    if (!item || !item.id) {
        return;
    }

    const confirmed = confirm(
        `Delete "${item.file_name}"?\n\nThis cannot be undone.`
    );

    if (!confirmed) {
        return;
    }

    const deleted =
        await deleteMedia(item);

    if (deleted) {
        showNotification(
            "Memory deleted.",
            "🗑️"
        );

        await loadAllMemories();
    }
}
