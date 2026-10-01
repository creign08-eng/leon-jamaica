// ==========================================
// LEON & MAJICA ❤️
// PRIVATE MEMORIES WEBSITE
// ==========================================


// ==========================================
// SUPABASE
// ==========================================

const SUPABASE_URL =
    "https://cbxchhonkkrlwisjjonk.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_U2CbY-32ZYfAtp7YRlokcQ_uK8bKsQ6";

const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// ==========================================
// LOGIN SETTINGS
// ==========================================

const LOGIN_USERNAME = "leon&majica";

const LOGIN_EMAIL =
    "creign_liu17@yahoo.com";


// ==========================================
// LOGIN
// ==========================================

async function login() {

    const username =
        document
            .getElementById("loginUsername")
            .value
            .trim();

    const password =
        document
            .getElementById("loginPassword")
            .value;

    const errorBox =
        document.getElementById("loginError");

    if (errorBox) {
        errorBox.textContent = "";
    }

    if (username !== LOGIN_USERNAME) {

        if (errorBox) {
            errorBox.textContent =
                "Incorrect username or password.";
        }

        return;
    }

    if (!password) {

        if (errorBox) {
            errorBox.textContent =
                "Please enter your password.";
        }

        return;
    }

    const { error } =
        await supabaseClient.auth.signInWithPassword({
            email: LOGIN_EMAIL,
            password: password
        });

    if (error) {

        console.error(error);

        if (errorBox) {
            errorBox.textContent =
                "Incorrect username or password.";
        }

        return;
    }

    showWebsite();

    await loadEverything();
}


// ==========================================
// LOGOUT
// ==========================================

async function logout() {

    await supabaseClient.auth.signOut();

    showLogin();
}


// ==========================================
// SHOW LOGIN
// ==========================================

function showLogin() {

    const loginPage =
        document.getElementById("loginPage");

    const website =
        document.getElementById("website");

    if (loginPage) {
        loginPage.classList.remove("hidden");
    }

    if (website) {
        website.classList.add("hidden");
    }
}


// ==========================================
// SHOW WEBSITE
// ==========================================

function showWebsite() {

    const loginPage =
        document.getElementById("loginPage");

    const website =
        document.getElementById("website");

    if (loginPage) {
        loginPage.classList.add("hidden");
    }

    if (website) {
        website.classList.remove("hidden");
    }

    restoreTheme();
    loadBackground();
}


// ==========================================
// SESSION CHECK
// ==========================================

async function checkSession() {

    const { data } =
        await supabaseClient.auth.getSession();

    if (data && data.session) {

        showWebsite();

        await loadEverything();

    } else {

        showLogin();
    }
}


// ==========================================
// SECTION NAVIGATION
// ==========================================

function showSection(sectionId) {

    document
        .querySelectorAll(".section")
        .forEach(section => {
            section.classList.add("hidden");
        });

    const section =
        document.getElementById(sectionId);

    if (section) {
        section.classList.remove("hidden");
    }

    if (sectionId === "homeSection") {
        loadRecentMemories();
        loadLoveHero();
    }

    if (sectionId === "albumsSection") {
        loadAlbums();
    }

    if (sectionId === "videosSection") {
        loadVideos();
    }

    if (sectionId === "playlistsSection") {
        loadPlaylists();
    }

    if (sectionId === "favoritesSection") {
        loadFavorites();
    }

    if (sectionId === "messagesSection") {
        loadMessages();
    }

    if (sectionId === "uploadSection") {
        loadAlbumOptions();
        loadPlaylistOptions();
    }

    if (sectionId === "settingsSection") {
        loadBackgroundPhotos();
    }
}


// ==========================================
// LOAD EVERYTHING
// ==========================================

async function loadEverything() {

    await loadRecentMemories();

    await loadAlbums();

    await loadVideos();

    await loadPlaylists();

    await loadMessages();

    await loadAlbumOptions();

    await loadPlaylistOptions();

    await loadBackgroundPhotos();

    await loadFavorites();

    await loadLoveHero();
}


// ==========================================
// SIGNED STORAGE URL
// ==========================================

async function getSignedUrl(path) {

    if (!path) {
        return "";
    }

    const { data, error } =
        await supabaseClient
            .storage
            .from("memories")
            .createSignedUrl(path, 3600);

    if (error) {

        console.error(
            "Signed URL error:",
            error
        );

        return "";
    }

    return data?.signedUrl || "";
}


// ==========================================
// RECENT MEMORIES
// ==========================================

async function loadRecentMemories() {

    const gallery =
        document.getElementById("recentMemories");

    if (!gallery) {
        return;
    }

    gallery.innerHTML =
        "Loading memories...";

    const { data, error } =
        await supabaseClient
            .from("memories")
            .select("*")
            .order("created_at", {
                ascending: false
            })
            .limit(12);

    if (error) {

        console.error(error);

        gallery.innerHTML =
            "Unable to load memories.";

        return;
    }

    gallery.innerHTML = "";

    if (!data || data.length === 0) {

        gallery.innerHTML =
            "<p>No memories yet ❤️</p>";

        return;
    }

    for (const memory of data) {

        gallery.appendChild(
            await createMemoryCard(memory)
        );
    }
}


// ==========================================
// CREATE MEMORY CARD
// ==========================================

async function createMemoryCard(memory) {

    const card =
        document.createElement("div");

    card.className = "card";

    const url =
        await getSignedUrl(memory.file_path);

    let media = "";

    const safeTitle =
        escapeHtml(
            memory.title ||
            "Memory"
        );

    const safeDescription =
        escapeHtml(
            memory.description ||
            ""
        );

    const safeUrl =
        url.replace(/'/g, "\\'");

    if (memory.media_type === "photo") {

        media =
            `<img
                src="${url}"
                alt="${safeTitle}"
                onclick="openMediaViewer(
                    '${safeUrl}',
                    'photo',
                    '${safeTitle}'
                )"
                style="
                    cursor:pointer;
                    width:100%;
                    display:block;
                "
            >`;

    } else if (
        memory.media_type === "video"
    ) {

        media =
            `<video
                controls
                preload="metadata"
                onclick="openMediaViewer(
                    '${safeUrl}',
                    'video',
                    '${safeTitle}'
                )"
                style="
                    cursor:pointer;
                    width:100%;
                    display:block;
                "
            >
                <source src="${url}">
            </video>`;

    } else if (
        memory.media_type === "music"
    ) {

        media =
            `<div
                style="
                    padding:40px;
                    text-align:center;
                    font-size:45px;
                "
            >
                🎵
            </div>`;
    }

    const favoriteButton =
        `<button
            class="favorite-overlay"
            onclick="toggleFavorite(
                '${memory.id}',
                ${memory.is_favorite === true}
            )"
            title="${
                memory.is_favorite === true
                    ? "Remove from Favorites"
                    : "Add to Favorites"
            }"
        >
            ${
                memory.is_favorite === true
                    ? "❤️"
                    : "♡"
            }
        </button>`;

    card.innerHTML = `
        ${media}

        ${favoriteButton}

        <div class="card-info">

            <h3>
                ${safeTitle}
            </h3>

            <p>
                ${safeDescription}
            </p>

            ${
                memory.media_type === "music"
                    ? `
                        <audio
                            controls
                            style="width:100%"
                        >
                            <source src="${url}">
                        </audio>
                    `
                    : ""
            }

            <button
                onclick="renameMemory('${memory.id}')"
            >
                ✏️ Rename
            </button>

            <button
                onclick="toggleFavorite(
                    '${memory.id}',
                    ${memory.is_favorite === true}
                )"
            >
                ${
                    memory.is_favorite === true
                        ? "💔 Remove Favorite"
                        : "❤️ Favorite"
                }
            </button>

            <button
                class="delete-button"
                onclick="deleteMemory(
                    '${memory.id}',
                    '${escapeHtml(memory.file_path || "")}'
                )"
            >
                Delete
            </button>

        </div>
    `;

    return card;
}


// ==========================================
// RENAME MEMORY
// ==========================================

async function renameMemory(memoryId) {

    const { data: memory, error: fetchError } =
        await supabaseClient
            .from("memories")
            .select("id,title")
            .eq("id", memoryId)
            .single();

    if (fetchError || !memory) {

        alert(
            "Unable to find this file."
        );

        return;
    }

    const newName =
        prompt(
            "Enter a new name:",
            memory.title || "Untitled"
        );

    if (newName === null) {
        return;
    }

    const trimmedName =
        newName.trim();

    if (!trimmedName) {

        alert(
            "Please enter a name."
        );

        return;
    }

    const { error } =
        await supabaseClient
            .from("memories")
            .update({
                title: trimmedName
            })
            .eq("id", memoryId);

    if (error) {

        alert(error.message);

        return;
    }

    await loadEverything();

    alert(
        "File renamed successfully ❤️"
    );
}


// ==========================================
// DELETE MEMORY
// ==========================================

async function deleteMemory(
    memoryId,
    filePath
) {

    if (!confirm(
        "Delete this memory?"
    )) {
        return;
    }

    const { error: storageError } =
        await supabaseClient
            .storage
            .from("memories")
            .remove([filePath]);

    if (storageError) {

        console.error(
            "Storage delete error:",
            storageError
        );
    }

    const { error } =
        await supabaseClient
            .from("memories")
            .delete()
            .eq("id", memoryId);

    if (error) {

        alert(error.message);

        return;
    }

    await loadEverything();

    alert(
        "Memory deleted."
    );
}


// ==========================================
// ALBUMS
// ==========================================

async function loadAlbums() {

    const gallery =
        document.getElementById("albumGallery");

    if (!gallery) {
        return;
    }

    gallery.innerHTML =
        "Loading albums...";

    const { data, error } =
        await supabaseClient
            .from("albums")
            .select("*")
            .eq("media_type", "photo")
            .order("created_at", {
                ascending: false
            });

    if (error) {

        console.error(error);

        gallery.innerHTML =
            "Unable to load albums.";

        return;
    }

    gallery.innerHTML = "";

    if (!data || data.length === 0) {

        gallery.innerHTML =
            "<p>No photo albums yet.</p>";

        return;
    }

    for (const album of data) {

        const folder =
            document.createElement("div");

        folder.className =
            "folder";

        let coverUrl = "";

        if (album.cover_path) {

            coverUrl =
                await getSignedUrl(
                    album.cover_path
                );
        }

        if (!coverUrl) {

            const { data: cover } =
                await supabaseClient
                    .from("memories")
                    .select("file_path")
                    .eq("album_id", album.id)
                    .eq("media_type", "photo")
                    .order("created_at", {
                        ascending: false
                    })
                    .limit(1);

            if (
                cover &&
                cover.length > 0
            ) {

                coverUrl =
                    await getSignedUrl(
                        cover[0].file_path
                    );
            }
        }

        if (coverUrl) {

            folder.innerHTML = `
                <div
                    style="
                        width:100%;
                        height:180px;
                        border-radius:14px;
                        overflow:hidden;
                        margin-bottom:12px;
                    "
                >
                    <img
                        src="${coverUrl}"
                        alt="${escapeHtml(album.name)}"
                        style="
                            width:100%;
                            height:100%;
                            object-fit:cover;
                            display:block;
                        "
                    >
                </div>
            `;

        } else {

            folder.innerHTML = `
                <div
                    style="
                        width:100%;
                        height:180px;
                        border-radius:14px;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        background:
                            linear-gradient(
                                135deg,
                                #333,
                                #111
                            );
                        font-size:55px;
                        margin-bottom:12px;
                    "
                >
                    📸
                </div>
            `;
        }

        folder.innerHTML += `
            <h3>
                ${escapeHtml(album.name)}
            </h3>

            <p>
                ${escapeHtml(
                    album.description || ""
                )}
            </p>

            <button
                onclick="openAlbum('${album.id}')"
            >
                Open Album
            </button>

            <button
                onclick="changeAlbumCover('${album.id}')"
            >
                🖼️ Cover
            </button>

            <button
                onclick="renameAlbum('${album.id}')"
            >
                ✏️ Rename
            </button>

            <button
                onclick="editAlbumDescription('${album.id}')"
            >
                📝 Description
            </button>

            <button
                class="delete-button"
                onclick="deleteAlbum('${album.id}')"
            >
                🗑️ Delete
            </button>
        `;

        gallery.appendChild(folder);
    }

    const viewer =
        document.getElementById("albumViewer");

    if (viewer) {
        viewer.classList.add("hidden");
    }
}


// ==========================================
// OPEN ALBUM
// ==========================================

async function openAlbum(id) {

    const { data: album } =
        await supabaseClient
            .from("albums")
            .select("*")
            .eq("id", id)
            .single();

    if (!album) {
        return;
    }

    const { data: memories } =
        await supabaseClient
            .from("memories")
            .select("*")
            .eq("album_id", id)
            .eq("media_type", "photo")
            .order("created_at", {
                ascending: false
            });

    const gallery =
        document.getElementById(
            "albumMemoryGallery"
        );

    const viewer =
        document.getElementById(
            "albumViewer"
        );

    const title =
        document.getElementById(
            "albumViewerTitle"
        );

    const albumGallery =
        document.getElementById(
            "albumGallery"
        );

    if (!gallery || !viewer) {
        return;
    }

    if (title) {
        title.textContent =
            album.name;
    }

    if (albumGallery) {
        albumGallery.classList.add(
            "hidden"
        );
    }

    viewer.classList.remove(
        "hidden"
    );

    gallery.innerHTML = "";

    if (
        !memories ||
        memories.length === 0
    ) {

        gallery.innerHTML =
            "<p>This album is empty.</p>";

        return;
    }

    for (const memory of memories) {

        gallery.appendChild(
            await createMemoryCard(memory)
        );
    }
}


// ==========================================
// CLOSE ALBUM
// ==========================================

function closeAlbum() {

    const viewer =
        document.getElementById(
            "albumViewer"
        );

    const gallery =
        document.getElementById(
            "albumGallery"
        );

    if (viewer) {
        viewer.classList.add(
            "hidden"
        );
    }

    if (gallery) {
        gallery.classList.remove(
            "hidden"
        );
    }

    loadAlbums();
}


// ==========================================
// ALBUM MANAGER
// ==========================================

function openAlbumManager(type = null) {

    const modal =
        document.getElementById(
            "albumModal"
        );

    if (!modal) {
        return;
    }

    modal.classList.remove(
        "hidden"
    );

    const typeSelect =
        document.getElementById(
            "newAlbumType"
        );

    if (typeSelect && type) {
        typeSelect.value = type;
    }

    loadAlbumManager();
}


function closeAlbumManager() {

    document
        .getElementById("albumModal")
        ?.classList.add("hidden");
}


async function createAlbum() {

    const name =
        document
            .getElementById("newAlbumName")
            .value
            .trim();

    const mediaType =
        document
            .getElementById("newAlbumType")
            .value;

    if (!name) {

        alert(
            "Enter a folder name."
        );

        return;
    }

    const { error } =
        await supabaseClient
            .from("albums")
            .insert({
                name,
                media_type: mediaType
            });

    if (error) {

        alert(error.message);

        return;
    }

    document
        .getElementById("newAlbumName")
        .value = "";

    await loadAlbumManager();

    await loadAlbums();

    await loadVideos();

    await loadAlbumOptions();
}


async function loadAlbumManager() {

    const list =
        document.getElementById(
            "albumManagerList"
        );

    if (!list) {
        return;
    }

    const { data, error } =
        await supabaseClient
            .from("albums")
            .select("*")
            .order("created_at", {
                ascending: false
            });

    if (error) {

        console.error(error);

        return;
    }

    list.innerHTML = "";

    if (!data) {
        return;
    }

    data.forEach(album => {

        const row =
            document.createElement("div");

        row.style.padding =
            "10px 0";

        row.innerHTML = `
            <strong>
                ${escapeHtml(album.name)}
            </strong>

            <button
                onclick="renameAlbum('${album.id}')"
            >
                Rename
            </button>

            <button
                onclick="editAlbumDescription('${album.id}')"
            >
                Description
            </button>

            <button
                onclick="changeAlbumCover('${album.id}')"
            >
                🖼️ Cover
            </button>

            <button
                onclick="deleteAlbum('${album.id}')"
            >
                Delete
            </button>
        `;

        list.appendChild(row);
    });
}


// ==========================================
// RENAME ALBUM
// ==========================================

async function renameAlbum(id) {

    const name =
        prompt(
            "Enter the new folder name:"
        );

    if (name === null) {
        return;
    }

    const trimmedName =
        name.trim();

    if (!trimmedName) {

        alert(
            "Folder name cannot be empty."
        );

        return;
    }

    const { error } =
        await supabaseClient
            .from("albums")
            .update({
                name: trimmedName
            })
            .eq("id", id);

    if (error) {

        alert(error.message);

        return;
    }

    await loadAlbumManager();

    await loadAlbums();

    await loadVideos();

    await loadAlbumOptions();
}


// ==========================================
// ALBUM DESCRIPTION
// ==========================================

async function editAlbumDescription(id) {

    const { data: album, error: loadError } =
        await supabaseClient
            .from("albums")
            .select("*")
            .eq("id", id)
            .single();

    if (loadError || !album) {

        alert(
            "Unable to open folder."
        );

        return;
    }

    const description =
        prompt(
            "Enter a description for this folder:",
            album.description || ""
        );

    if (description === null) {
        return;
    }

    const { error } =
        await supabaseClient
            .from("albums")
            .update({
                description:
                    description.trim()
            })
            .eq("id", id);

    if (error) {

        alert(error.message);

        return;
    }

    await loadAlbumManager();

    await loadAlbums();

    await loadVideos();

    alert(
        "Folder description updated ❤️"
    );
}


// ==========================================
// ALBUM COVER
// ==========================================

async function changeAlbumCover(
    albumId
) {

    const { data: album, error: albumError } =
        await supabaseClient
            .from("albums")
            .select("*")
            .eq("id", albumId)
            .single();

    if (albumError || !album) {

        alert(
            "Unable to open this folder."
        );

        return;
    }

    const list =
        document.getElementById(
            "coverSelectionList"
        );

    const modal =
        document.getElementById(
            "coverModal"
        );

    if (!list || !modal) {

        alert(
            "Cover selector is unavailable."
        );

        return;
    }

    list.innerHTML =
        "Loading memories...";

    modal.classList.remove(
        "hidden"
    );

    const { data: memories, error } =
        await supabaseClient
            .from("memories")
            .select(
                "id,title,file_path,media_type"
            )
            .eq("album_id", albumId)
            .in(
                "media_type",
                ["photo", "video"]
            )
            .order("created_at", {
                ascending: false
            });

    if (error) {

        list.innerHTML =
            `<p>${escapeHtml(
                error.message
            )}</p>`;

        return;
    }

    if (
        !memories ||
        memories.length === 0
    ) {

        list.innerHTML = `
            <p>
                This folder has no
                photos or videos yet.
            </p>
        `;

        return;
    }

    list.innerHTML = "";

    const removeButton =
        document.createElement("button");

    removeButton.textContent =
        "❌ Remove Current Cover";

    removeButton.style.marginBottom =
        "15px";

    removeButton.onclick =
        () => removeAlbumCover(albumId);

    list.appendChild(
        removeButton
    );

    for (const memory of memories) {

        const item =
            document.createElement("div");

        item.style.marginBottom =
            "15px";

        item.style.padding =
            "10px";

        item.style.borderRadius =
            "12px";

        item.style.background =
            "rgba(255,255,255,0.06)";

        const url =
            await getSignedUrl(
                memory.file_path
            );

        let preview = "";

        if (
            memory.media_type ===
            "photo"
        ) {

            preview = `
                <img
                    src="${url}"
                    alt="${escapeHtml(
                        memory.title ||
                        "Photo"
                    )}"
                    style="
                        width:100%;
                        max-height:180px;
                        object-fit:cover;
                        border-radius:10px;
                        display:block;
                        margin-bottom:8px;
                    "
                >
            `;

        } else {

            preview = `
                <video
                    src="${url}"
                    muted
                    controls
                    preload="metadata"
                    style="
                        width:100%;
                        max-height:180px;
                        object-fit:cover;
                        border-radius:10px;
                        display:block;
                        margin-bottom:8px;
                    "
                ></video>
            `;
        }

        item.innerHTML = `
            ${preview}

            <strong>
                ${
                    memory.media_type ===
                    "photo"
                        ? "📸"
                        : "🎬"
                }

                ${escapeHtml(
                    memory.title ||
                    "Untitled"
                )}
            </strong>

            <br>

            <button
                style="margin-top:8px"
                onclick="setAlbumCover(
                    '${albumId}',
                    '${memory.id}'
                )"
            >
                ❤️ Use This as Cover
            </button>
        `;

        list.appendChild(item);
    }
}


async function setAlbumCover(
    albumId,
    memoryId
) {

    const { data: memory, error: memoryError } =
        await supabaseClient
            .from("memories")
            .select("file_path")
            .eq("id", memoryId)
            .single();

    if (memoryError || !memory) {

        alert(
            "Unable to find that memory."
        );

        return;
    }

    const { error } =
        await supabaseClient
            .from("albums")
            .update({
                cover_path:
                    memory.file_path
            })
            .eq("id", albumId);

    if (error) {

        alert(error.message);

        return;
    }

    closeCoverManager();

    await loadAlbums();

    await loadVideos();

    alert(
        "Folder cover updated ❤️"
    );
}


async function removeAlbumCover(
    albumId
) {

    const { error } =
        await supabaseClient
            .from("albums")
            .update({
                cover_path: null
            })
            .eq("id", albumId);

    if (error) {

        alert(error.message);

        return;
    }

    closeCoverManager();

    await loadAlbums();

    await loadVideos();

    alert(
        "Folder cover removed. The latest memory will be used instead."
    );
}


function closeCoverManager() {

    const modal =
        document.getElementById(
            "coverModal"
        );

    if (modal) {
        modal.classList.add(
            "hidden"
        );
    }
}


// ==========================================
// DELETE ALBUM
// ==========================================

async function deleteAlbum(id) {

    if (!confirm(
        "Delete this folder?\n\n" +
        "The folder will be deleted, " +
        "but the photos/videos inside " +
        "it will NOT be deleted."
    )) {
        return;
    }

    const { error } =
        await supabaseClient
            .from("albums")
            .delete()
            .eq("id", id);

    if (error) {

        alert(error.message);

        return;
    }

    await loadAlbumManager();

    await loadAlbums();

    await loadVideos();

    await loadAlbumOptions();

    await loadRecentMemories();

    alert(
        "Folder deleted successfully."
    );
}


// ==========================================
// VIDEO FOLDERS
// ==========================================

async function loadVideos() {

    const gallery =
        document.getElementById(
            "videoGallery"
        );

    if (!gallery) {
        return;
    }

    gallery.innerHTML =
        "Loading video folders...";

    const { data, error } =
        await supabaseClient
            .from("albums")
            .select("*")
            .eq("media_type", "video")
            .order("created_at", {
                ascending: false
            });

    if (error) {

        gallery.innerHTML =
            "Unable to load video folders.";

        return;
    }

    gallery.innerHTML = "";

    if (
        !data ||
        data.length === 0
    ) {

        gallery.innerHTML =
            "<p>No video folders yet.</p>";

        return;
    }

    for (const album of data) {

        const folder =
            document.createElement("div");

        folder.className =
            "folder";

        let videoUrl = "";

        let coverType = "";

        if (album.cover_path) {

            videoUrl =
                await getSignedUrl(
                    album.cover_path
                );

            const { data: selectedCover } =
                await supabaseClient
                    .from("memories")
                    .select("media_type")
                    .eq(
                        "file_path",
                        album.cover_path
                    )
                    .maybeSingle();

            if (selectedCover) {
                coverType =
                    selectedCover.media_type;
            }
        }

        if (!videoUrl) {

            const { data: coverVideos } =
                await supabaseClient
                    .from("memories")
                    .select(
                        "file_path,title,media_type"
                    )
                    .eq(
                        "album_id",
                        album.id
                    )
                    .eq(
                        "media_type",
                        "video"
                    )
                    .order(
                        "created_at",
                        {
                            ascending: false
                        }
                    )
                    .limit(1);

            if (
                coverVideos &&
                coverVideos.length > 0
            ) {

                videoUrl =
                    await getSignedUrl(
                        coverVideos[0]
                            .file_path
                    );

                coverType =
                    coverVideos[0]
                        .media_type;
            }
        }

        if (
            videoUrl &&
            coverType === "photo"
        ) {

            folder.innerHTML = `
                <div
                    style="
                        width:100%;
                        height:180px;
                        border-radius:14px;
                        overflow:hidden;
                        margin-bottom:12px;
                        background:#222;
                    "
                >
                    <img
                        src="${videoUrl}"
                        alt="${escapeHtml(
                            album.name
                        )}"
                        style="
                            width:100%;
                            height:100%;
                            object-fit:cover;
                            display:block;
                        "
                    >
                </div>
            `;

        } else if (videoUrl) {

            folder.innerHTML = `
                <div
                    style="
                        width:100%;
                        height:180px;
                        border-radius:14px;
                        overflow:hidden;
                        margin-bottom:12px;
                        background:#111;
                    "
                >
                    <video
                        src="${videoUrl}"
                        muted
                        preload="metadata"
                        style="
                            width:100%;
                            height:100%;
                            object-fit:cover;
                            display:block;
                        "
                    ></video>
                </div>
            `;

        } else {

            folder.innerHTML = `
                <div
                    style="
                        width:100%;
                        height:180px;
                        border-radius:14px;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        background:
                            linear-gradient(
                                135deg,
                                #222,
                                #111
                            );
                        font-size:55px;
                        margin-bottom:12px;
                    "
                >
                    🎬
                </div>
            `;
        }

        folder.innerHTML += `
            <h3>
                ${escapeHtml(album.name)}
            </h3>

            <p>
                ${escapeHtml(
                    album.description || ""
                )}
            </p>

            <div
                style="
                    display:flex;
                    gap:8px;
                    flex-wrap:wrap;
                    margin-top:10px;
                "
            >

                <button
                    onclick="openVideoFolder(
                        '${album.id}'
                    )"
                >
                    Open Videos
                </button>

                <button
                    onclick="changeAlbumCover(
                        '${album.id}'
                    )"
                >
                    🖼️ Cover
                </button>

                <button
                    onclick="renameAlbum(
                        '${album.id}'
                    )"
                >
                    ✏️ Rename
                </button>

                <button
                    onclick="editAlbumDescription(
                        '${album.id}'
                    )"
                >
                    📝 Description
                </button>

                <button
                    class="delete-button"
                    onclick="deleteAlbum(
                        '${album.id}'
                    )"
                >
                    🗑️ Delete
                </button>

            </div>
        `;

        gallery.appendChild(folder);
    }
}


async function openVideoFolder(id) {

    const { data: album } =
        await supabaseClient
            .from("albums")
            .select("*")
            .eq("id", id)
            .single();

    if (!album) {
        return;
    }

    const { data: memories } =
        await supabaseClient
            .from("memories")
            .select("*")
            .eq("album_id", id)
            .eq("media_type", "video")
            .order("created_at", {
                ascending: false
            });

    const gallery =
        document.getElementById(
            "videoGallery"
        );

    gallery.innerHTML = `
        <div
            style="grid-column:1/-1"
        >

            <button
                onclick="loadVideos()"
            >
                ← Back
            </button>

            <h2>
                ${escapeHtml(album.name)}
            </h2>

            ${
                album.description
                    ? `
                        <p>
                            ${escapeHtml(
                                album.description
                            )}
                        </p>
                    `
                    : ""
            }

        </div>
    `;

    if (
        !memories ||
        memories.length === 0
    ) {

        gallery.innerHTML +=
            "<p>This video folder is empty.</p>";

        return;
    }

    for (const memory of memories) {

        gallery.appendChild(
            await createMemoryCard(memory)
        );
    }
}


function openVideoFolderManager() {

    document
        .getElementById(
            "videoFolderModal"
        )
        ?.classList.remove("hidden");
}


function closeVideoFolderManager() {

    document
        .getElementById(
            "videoFolderModal"
        )
        ?.classList.add("hidden");
}


async function createVideoFolder() {

    const name =
        document
            .getElementById(
                "newVideoFolderName"
            )
            .value
            .trim();

    if (!name) {

        alert(
            "Enter a folder name."
        );

        return;
    }

    const { error } =
        await supabaseClient
            .from("albums")
            .insert({
                name,
                media_type: "video"
            });

    if (error) {

        alert(error.message);

        return;
    }

    document
        .getElementById(
            "newVideoFolderName"
        )
        .value = "";

    closeVideoFolderManager();

    await loadVideos();

    await loadAlbums();

    await loadAlbumOptions();
}


// ==========================================
// PLAYLISTS
// ==========================================

let currentPlaylist = [];

let currentSongIndex = 0;


async function loadPlaylists() {

    const gallery =
        document.getElementById(
            "playlistGallery"
        );

    if (!gallery) {
        return;
    }

    gallery.innerHTML =
        "Loading playlists...";

    const { data, error } =
        await supabaseClient
            .from("playlists")
            .select("*")
            .order("created_at", {
                ascending: false
            });

    if (error) {

        gallery.innerHTML =
            "Unable to load playlists.";

        return;
    }

    gallery.innerHTML = "";

    if (
        !data ||
        data.length === 0
    ) {

        gallery.innerHTML =
            "<p>No playlists yet.</p>";

        return;
    }

    data.forEach(playlist => {

        const folder =
            document.createElement("div");

        folder.className =
            "folder";

        folder.innerHTML = `
            <div
                style="
                    width:100%;
                    height:180px;
                    border-radius:14px;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    background:
                        linear-gradient(
                            135deg,
                            #222,
                            #111
                        );
                    font-size:55px;
                    margin-bottom:12px;
                "
            >
                🎵
            </div>

            <h3>
                ${escapeHtml(
                    playlist.name
                )}
            </h3>

            <p>
                ${escapeHtml(
                    playlist.description || ""
                )}
            </p>

            <button
                onclick="openPlaylist(
                    '${playlist.id}'
                )"
            >
                Open Playlist
            </button>
        `;

        gallery.appendChild(folder);
    });
}


async function openPlaylist(id) {

    const { data: playlist } =
        await supabaseClient
            .from("playlists")
            .select("*")
            .eq("id", id)
            .single();

    if (!playlist) {
        return;
    }

    const { data: songs } =
        await supabaseClient
            .from("memories")
            .select("*")
            .eq("playlist_id", id)
            .eq("media_type", "music")
            .order("created_at", {
                ascending: true
            });

    currentPlaylist =
        songs || [];

    currentSongIndex = 0;

    document
        .getElementById(
            "playlistGallery"
        )
        .classList.add("hidden");

    const viewer =
        document.getElementById(
            "playlistViewer"
        );

    viewer.classList.remove(
        "hidden"
    );

    document
        .getElementById(
            "playlistViewerTitle"
        )
        .textContent =
        playlist.name;

    const songList =
        document.getElementById(
            "playlistSongs"
        );

    songList.innerHTML = "";

    if (
        !songs ||
        songs.length === 0
    ) {

        songList.innerHTML =
            "<p>This playlist is empty.</p>";

        return;
    }

    for (
        let i = 0;
        i < songs.length;
        i++
    ) {

        const song =
            songs[i];

        const row =
            document.createElement("div");

        row.className =
            "card";

        row.style.padding =
            "15px";

        row.style.marginBottom =
            "10px";

        row.innerHTML = `
            <strong>
                ${escapeHtml(
                    song.title ||
                    "Song"
                )}
            </strong>

            <button
                onclick="playSong(${i})"
            >
                ▶ Play
            </button>
        `;

        songList.appendChild(row);
    }
}


function closePlaylist() {

    document
        .getElementById(
            "playlistViewer"
        )
        .classList.add("hidden");

    document
        .getElementById(
            "playlistGallery"
        )
        .classList.remove(
            "hidden"
        );
}


function openPlaylistManager() {

    document
        .getElementById(
            "playlistModal"
        )
        ?.classList.remove("hidden");

    loadPlaylistManager();
}


function closePlaylistManager() {

    document
        .getElementById(
            "playlistModal"
        )
        ?.classList.add("hidden");
}


async function createPlaylist() {

    const name =
        document
            .getElementById(
                "newPlaylistName"
            )
            .value
            .trim();

    if (!name) {

        alert(
            "Enter a playlist name."
        );

        return;
    }

    const { error } =
        await supabaseClient
            .from("playlists")
            .insert({
                name
            });

    if (error) {

        alert(error.message);

        return;
    }

    document
        .getElementById(
            "newPlaylistName"
        )
        .value = "";

    await loadPlaylistManager();

    await loadPlaylists();

    await loadPlaylistOptions();
}


async function loadPlaylistManager() {

    const list =
        document.getElementById(
            "playlistManagerList"
        );

    if (!list) {
        return;
    }

    const { data } =
        await supabaseClient
            .from("playlists")
            .select("*")
            .order("created_at", {
                ascending: false
            });

    list.innerHTML = "";

    if (!data) {
        return;
    }

    data.forEach(playlist => {

        const row =
            document.createElement("div");

        row.style.padding =
            "10px 0";

        row.innerHTML = `
            <strong>
                ${escapeHtml(
                    playlist.name
                )}
            </strong>

            <button
                onclick="renamePlaylist(
                    '${playlist.id}'
                )"
            >
                Rename
            </button>

            <button
                onclick="deletePlaylist(
                    '${playlist.id}'
                )"
            >
                Delete
            </button>
        `;

        list.appendChild(row);
    });
}


async function renamePlaylist(id) {

    const name =
        prompt(
            "New playlist name:"
        );

    if (!name) {
        return;
    }

    const { error } =
        await supabaseClient
            .from("playlists")
            .update({
                name: name.trim()
            })
            .eq("id", id);

    if (error) {

        alert(error.message);

        return;
    }

    await loadPlaylistManager();

    await loadPlaylists();
}


async function deletePlaylist(id) {

    if (!confirm(
        "Delete this playlist? Songs will NOT be deleted."
    )) {
        return;
    }

    const { error } =
        await supabaseClient
            .from("playlists")
            .delete()
            .eq("id", id);

    if (error) {

        alert(error.message);

        return;
    }

    await loadPlaylistManager();

    await loadPlaylists();

    await loadPlaylistOptions();
}


// ==========================================
// MUSIC PLAYER
// ==========================================

async function playSong(index) {

    if (!currentPlaylist[index]) {
        return;
    }

    currentSongIndex =
        index;

    const song =
        currentPlaylist[index];

    const url =
        await getSignedUrl(
            song.file_path
        );

    const player =
        document.getElementById(
            "audioPlayer"
        );

    if (!player || !url) {
        return;
    }

    player.src = url;

    document
        .getElementById(
            "playerSongTitle"
        )
        .textContent =
        song.title ||
        "Song";

    document
        .getElementById(
            "musicPlayer"
        )
        .classList.remove(
            "hidden"
        );

    try {
        await player.play();
    } catch (error) {
        console.error(error);
    }

    document
        .getElementById(
            "playPauseButton"
        )
        .textContent =
        "⏸";
}


function toggleMusic() {

    const player =
        document.getElementById(
            "audioPlayer"
        );

    if (!player) {
        return;
    }

    if (player.paused) {

        player.play();

        document
            .getElementById(
                "playPauseButton"
            )
            .textContent =
            "⏸";

    } else {

        player.pause();

        document
            .getElementById(
                "playPauseButton"
            )
            .textContent =
            "▶";
    }
}


function previousSong() {

    if (
        !currentPlaylist.length
    ) {
        return;
    }

    currentSongIndex--;

    if (currentSongIndex < 0) {

        currentSongIndex =
            currentPlaylist.length - 1;
    }

    playSong(
        currentSongIndex
    );
}


function nextSong() {

    if (
        !currentPlaylist.length
    ) {
        return;
    }

    currentSongIndex++;

    if (
        currentSongIndex >=
        currentPlaylist.length
    ) {

        currentSongIndex = 0;
    }

    playSong(
        currentSongIndex
    );
}


function changeVolume(value) {

    const player =
        document.getElementById(
            "audioPlayer"
        );

    if (player) {
        player.volume =
            Number(value);
    }
}


document
    .getElementById("audioPlayer")
    ?.addEventListener(
        "ended",
        nextSong
    );


// ==========================================
// UPLOAD
// ==========================================

async function uploadMemories() {

    const files =
        document
            .getElementById(
                "memoryFiles"
            )
            .files;

    const type =
        document
            .getElementById(
                "memoryType"
            )
            .value;

    const title =
        document
            .getElementById(
                "memoryTitle"
            )
            .value
            .trim();

    const description =
        document
            .getElementById(
                "memoryDescription"
            )
            .value
            .trim();

    const albumId =
        document
            .getElementById(
                "memoryAlbum"
            )
            .value;

    const playlistId =
        document
            .getElementById(
                "memoryPlaylist"
            )
            .value;

    const status =
        document.getElementById(
            "uploadStatus"
        );

    if (!files.length) {

        status.textContent =
            "Please choose a file.";

        return;
    }

    status.textContent =
        "Uploading...";

    for (const file of files) {

        const safeName =
            file.name.replace(
                /[^a-zA-Z0-9._-]/g,
                "_"
            );

        const path =
            `${crypto.randomUUID()}-${safeName}`;

        const {
            error: uploadError
        } =
            await supabaseClient
                .storage
                .from("memories")
                .upload(
                    path,
                    file
                );

        if (uploadError) {

            console.error(
                uploadError
            );

            status.textContent =
                uploadError.message;

            return;
        }

        const {
            error: insertError
        } =
            await supabaseClient
                .from("memories")
                .insert({
                    title:
                        title ||
                        file.name,

                    description,

                    media_type:
                        type,

                    file_path:
                        path,

                    album_id:
                        albumId ||
                        null,

                    playlist_id:
                        type === "music"
                            ? (
                                playlistId ||
                                null
                            )
                            : null
                });

        if (insertError) {

            console.error(
                insertError
            );

            status.textContent =
                insertError.message;

            return;
        }
    }

    status.textContent =
        "Upload complete ❤️";

    document
        .getElementById(
            "memoryFiles"
        )
        .value = "";

    await loadEverything();
}


// ==========================================
// ALBUM OPTIONS
// ==========================================

async function loadAlbumOptions() {

    const select =
        document.getElementById(
            "memoryAlbum"
        );

    if (!select) {
        return;
    }

    const { data } =
        await supabaseClient
            .from("albums")
            .select("*")
            .order("name");

    select.innerHTML =
        `<option value="">
            No folder
        </option>`;

    if (!data) {
        return;
    }

    data.forEach(album => {

        const option =
            document.createElement(
                "option"
            );

        option.value =
            album.id;

        option.textContent =
            `${
                album.media_type ===
                "video"
                    ? "🎬"
                    : "📸"
            } ${album.name}`;

        select.appendChild(
            option
        );
    });
}


// ==========================================
// PLAYLIST OPTIONS
// ==========================================

async function loadPlaylistOptions() {

    const select =
        document.getElementById(
            "memoryPlaylist"
        );

    if (!select) {
        return;
    }

    const { data } =
        await supabaseClient
            .from("playlists")
            .select("*")
            .order("name");

    select.innerHTML =
        `<option value="">
            No playlist
        </option>`;

    if (!data) {
        return;
    }

    data.forEach(playlist => {

        const option =
            document.createElement(
                "option"
            );

        option.value =
            playlist.id;

        option.textContent =
            `🎵 ${playlist.name}`;

        select.appendChild(
            option
        );
    });
}


// ==========================================
// MESSAGES
// ==========================================

async function loadMessages() {

    const gallery =
        document.getElementById(
            "messageGallery"
        );

    if (!gallery) {
        return;
    }

    gallery.innerHTML =
        "Loading messages...";

    const { data, error } =
        await supabaseClient
            .from("messages")
            .select("*")
            .order("created_at", {
                ascending: false
            });

    if (error) {

        console.error(error);

        gallery.innerHTML =
            "Unable to load messages.";

        return;
    }

    gallery.innerHTML = "";

    if (
        !data ||
        data.length === 0
    ) {

        gallery.innerHTML =
            "<p>No messages yet. Add your first message ❤️</p>";

        return;
    }

    data.forEach(message => {

        const card =
            document.createElement(
                "div"
            );

        card.className =
            "message-card";

        card.innerHTML = `
            <h3>
                ${escapeHtml(
                    message.title
                )}
            </h3>

            <p>
                ${escapeHtml(
                    message.content
                )}
            </p>

            <button
                onclick="editMessage(
                    '${message.id}'
                )"
            >
                Edit
            </button>

            <button
                class="delete-button"
                onclick="deleteMessage(
                    '${message.id}'
                )"
            >
                Delete
            </button>
        `;

        gallery.appendChild(card);
    });
}


function openMessageManager() {

    document
        .getElementById(
            "messageModal"
        )
        .classList.remove(
            "hidden"
        );

    document
        .getElementById(
            "messageModalTitle"
        )
        .textContent =
        "Add Message 💌";

    document
        .getElementById(
            "messageId"
        )
        .value = "";

    document
        .getElementById(
            "messageTitle"
        )
        .value = "";

    document
        .getElementById(
            "messageContent"
        )
        .value = "";
}


function closeMessageManager() {

    document
        .getElementById(
            "messageModal"
        )
        .classList.add(
            "hidden"
        );
}


async function saveMessage() {

    const id =
        document
            .getElementById(
                "messageId"
            )
            .value;

    const title =
        document
            .getElementById(
                "messageTitle"
            )
            .value
            .trim();

    const content =
        document
            .getElementById(
                "messageContent"
            )
            .value
            .trim();

    if (!title || !content) {

        alert(
            "Please enter a title and message."
        );

        return;
    }

    let error;

    if (id) {

        const result =
            await supabaseClient
                .from("messages")
                .update({
                    title,
                    content
                })
                .eq("id", id);

        error =
            result.error;

    } else {

        const result =
            await supabaseClient
                .from("messages")
                .insert({
                    title,
                    content
                });

        error =
            result.error;
    }

    if (error) {

        alert(error.message);

        return;
    }

    closeMessageManager();

    await loadMessages();
}


async function editMessage(id) {

    const { data, error } =
        await supabaseClient
            .from("messages")
            .select("*")
            .eq("id", id)
            .single();

    if (error || !data) {

        alert(
            "Unable to open message."
        );

        return;
    }

    document
        .getElementById(
            "messageModal"
        )
        .classList.remove(
            "hidden"
        );

    document
        .getElementById(
            "messageModalTitle"
        )
        .textContent =
        "Edit Message 💌";

    document
        .getElementById(
            "messageId"
        )
        .value =
        data.id;

    document
        .getElementById(
            "messageTitle"
        )
        .value =
        data.title;

    document
        .getElementById(
            "messageContent"
        )
        .value =
        data.content;
}


async function deleteMessage(id) {

    if (!confirm(
        "Delete this message?"
    )) {
        return;
    }

    const { error } =
        await supabaseClient
            .from("messages")
            .delete()
            .eq("id", id);

    if (error) {

        alert(error.message);

        return;
    }

    await loadMessages();
}


// ==========================================
// BACKGROUND PHOTOS
// ==========================================

async function loadBackgroundPhotos() {

    const select =
        document.getElementById(
            "backgroundPhoto"
        );

    if (!select) {
        return;
    }

    const { data } =
        await supabaseClient
            .from("memories")
            .select("*")
            .eq("media_type", "photo")
            .order("created_at", {
                ascending: false
            });

    select.innerHTML =
        `<option value="">
            Default background
        </option>`;

    if (!data) {
        return;
    }

    for (const photo of data) {

        const option =
            document.createElement(
                "option"
            );

        option.value =
            photo.file_path;

        option.textContent =
            photo.title ||
            "Photo";

        select.appendChild(
            option
        );
    }
}


async function setBackgroundPhoto() {

    const path =
        document
            .getElementById(
                "backgroundPhoto"
            )
            .value;

    if (!path) {

        removeBackgroundPhoto();

        return;
    }

    const url =
        await getSignedUrl(path);

    if (!url) {
        return;
    }

    document.body.style.backgroundImage =
        `linear-gradient(
            rgba(0,0,0,.55),
            rgba(0,0,0,.55)
        ),
        url("${url}")`;

    document.body.style.backgroundSize =
        "cover";

    document.body.style.backgroundPosition =
        "center";

    document.body.style.backgroundAttachment =
        "fixed";

    localStorage.setItem(
        "leonMajicaBackground",
        path
    );
}


async function loadBackground() {

    const path =
        localStorage.getItem(
            "leonMajicaBackground"
        );

    if (!path) {
        return;
    }

    const url =
        await getSignedUrl(path);

    if (!url) {
        return;
    }

    document.body.style.backgroundImage =
        `linear-gradient(
            rgba(0,0,0,.55),
            rgba(0,0,0,.55)
        ),
        url("${url}")`;

    document.body.style.backgroundSize =
        "cover";

    document.body.style.backgroundPosition =
        "center";

    document.body.style.backgroundAttachment =
        "fixed";
}


function removeBackgroundPhoto() {

    document.body.style.backgroundImage =
        "";

    localStorage.removeItem(
        "leonMajicaBackground"
    );
}


// ==========================================
// THEMES
// ==========================================

function setTheme(theme) {

    document.body.classList.remove(
        "romantic",
        "light"
    );

    if (theme === "romantic") {

        document.body.classList.add(
            "romantic"
        );
    }

    if (theme === "light") {

        document.body.classList.add(
            "light"
        );
    }

    localStorage.setItem(
        "leonMajicaTheme",
        theme
    );
}


function restoreTheme() {

    const theme =
        localStorage.getItem(
            "leonMajicaTheme"
        );

    if (theme) {
        setTheme(theme);
    }
}


// ==========================================
// FULLSCREEN MEDIA VIEWER
// ==========================================

function openMediaViewer(
    url,
    type,
    title = ""
) {

    const viewer =
        document.getElementById(
            "mediaViewer"
        );

    const content =
        document.getElementById(
            "mediaViewerContent"
        );

    if (!viewer || !content) {
        return;
    }

    content.innerHTML = "";

    if (type === "video") {

        const video =
            document.createElement(
                "video"
            );

        video.src =
            url;

        video.controls =
            true;

        video.autoplay =
            true;

        video.playsInline =
            true;

        content.appendChild(
            video
        );

    } else {

        const image =
            document.createElement(
                "img"
            );

        image.src =
            url;

        image.alt =
            title ||
            "Memory";

        content.appendChild(
            image
        );
    }

    viewer.classList.remove(
        "hidden"
    );
}


function closeMediaViewer() {

    const viewer =
        document.getElementById(
            "mediaViewer"
        );

    const content =
        document.getElementById(
            "mediaViewerContent"
        );

    if (content) {
        content.innerHTML = "";
    }

    if (viewer) {
        viewer.classList.add(
            "hidden"
        );
    }
}


document
    .getElementById(
        "mediaViewer"
    )
    ?.addEventListener(
        "click",
        function(event) {

            if (
                event.target ===
                this
            ) {
                closeMediaViewer();
            }

        }
    );


// ==========================================
// FAVORITES
// ==========================================

async function loadFavorites() {

    const container =
        document.getElementById(
            "favoritesGallery"
        );

    if (!container) {
        return;
    }

    container.innerHTML =
        "Loading favorites...";

    const { data, error } =
        await supabaseClient
            .from("memories")
            .select("*")
            .eq(
                "is_favorite",
                true
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );

    if (error) {

        console.error(error);

        container.innerHTML =
            "Unable to load favorites.";

        return;
    }

    container.innerHTML = "";

    if (
        !data ||
        data.length === 0
    ) {

        container.innerHTML =
            "<p>No favorite memories yet ❤️</p>";

        return;
    }

    for (const memory of data) {

        container.appendChild(
            await createMemoryCard(
                memory
            )
        );
    }
}


async function toggleFavorite(
    memoryId,
    currentFavorite
) {

    const { error } =
        await supabaseClient
            .from("memories")
            .update({
                is_favorite:
                    !currentFavorite
            })
            .eq(
                "id",
                memoryId
            );

    if (error) {

        alert(error.message);

        return;
    }

    await loadEverything();

    alert(
        currentFavorite
            ? "Removed from Favorites"
            : "Added to Favorites ❤️"
    );
}


// ==========================================
// HOME HERO
// ==========================================

async function loadLoveHero() {

    const hero =
        document.getElementById("loveHero");

    if (!hero) {
        return;
    }

    try {

        /*
         * Check whether a manual hero
         * background has been selected.
         */

        const {
            data: settings,
            error: settingsError
        } = await supabaseClient
            .from("site_settings")
            .select("hero_path")
            .eq("id", 1)
            .single();

        if (settingsError) {

            console.error(
                "Hero settings error:",
                settingsError
            );

        }

        let heroPath =
            settings?.hero_path || null;


        /*
         * If no manual background exists,
         * use the latest uploaded photo.
         */

        if (!heroPath) {

            const {
                data: latestPhoto,
                error: photoError
            } = await supabaseClient
                .from("memories")
                .select(
                    "file_path,title,created_at"
                )
                .eq(
                    "media_type",
                    "photo"
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                )
                .limit(1);

            if (photoError) {

                console.error(
                    "Latest photo error:",
                    photoError
                );

                return;
            }

            if (
                !latestPhoto ||
                latestPhoto.length === 0
            ) {

                console.log(
                    "No photos available for hero."
                );

                return;
            }

            heroPath =
                latestPhoto[0].file_path;
        }


        /*
         * Create a temporary secure URL
         * for the private Supabase photo.
         */

        const {
            data: signedData,
            error: signedError
        } = await supabaseClient
            .storage
            .from("memories")
            .createSignedUrl(
                heroPath,
                3600
            );

        if (signedError) {

            console.error(
                "Hero signed URL error:",
                signedError
            );

            return;
        }

        if (
            !signedData ||
            !signedData.signedUrl
        ) {

            console.error(
                "Hero signed URL missing."
            );

            return;
        }


        /*
         * Display the selected photo.
         */

        hero.style.backgroundImage =
            `linear-gradient(
                to right,
                rgba(0, 0, 0, 0.88),
                rgba(0, 0, 0, 0.45),
                rgba(0, 0, 0, 0.18)
            ),
            url("${signedData.signedUrl}")`;

        hero.style.backgroundSize =
            "cover";

        hero.style.backgroundPosition =
            "center";

        hero.style.backgroundRepeat =
            "no-repeat";


        console.log(
            "Hero background loaded."
        );

    } catch (error) {

        console.error(
            "Unexpected hero error:",
            error
        );
    }
}

// ==========================================
// SECURITY / HTML ESCAPE
// ==========================================

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


// ==========================================
// START APPLICATION
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        checkSession();

    }
);
/* =========================================
   MANUAL HERO BACKGROUND
   ========================================= */

async function openHeroBackgroundManager() {

    const { data, error } =
        await supabaseClient
            .from("memories")
            .select("id,title,file_path,created_at")
            .eq("media_type", "photo")
            .order("created_at", {
                ascending: false
            });

    if (error) {

        alert(
            "Unable to load photos: " +
            error.message
        );

        return;
    }

    if (!data || data.length === 0) {

        alert(
            "You don't have any photos yet."
        );

        return;
    }

    let message =
        "Choose a photo for the Home background:\n\n";

    data.forEach((photo, index) => {

        message +=
            `${index + 1}. ${photo.title || "Untitled"}\n`;

    });

    const choice =
        prompt(message);

    if (choice === null) {
        return;
    }

    const number =
        parseInt(choice, 10);

    if (
        isNaN(number) ||
        number < 1 ||
        number > data.length
    ) {

        alert("Please enter a valid number.");

        return;
    }

    const selectedPhoto =
        data[number - 1];

    const { error: updateError } =
        await supabaseClient
            .from("site_settings")
            .update({
                hero_path: selectedPhoto.file_path,
                updated_at: new Date().toISOString()
            })
            .eq("id", 1);

    if (updateError) {

        alert(
            "Unable to save hero background: " +
            updateError.message
        );

        return;
    }

    await loadLoveHero();

    alert(
        "Home background changed successfully ❤️"
    );
}


async function resetHeroBackground() {

    const { error } =
        await supabaseClient
            .from("site_settings")
            .update({
                hero_path: null,
                updated_at: new Date().toISOString()
            })
            .eq("id", 1);

    if (error) {

        alert(
            "Unable to reset background: " +
            error.message
        );

        return;
    }

    await loadLoveHero();

    alert(
        "Home background is now using your latest photo ❤️"
    );
}
