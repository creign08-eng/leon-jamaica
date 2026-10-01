/* =========================================================
   LEON & MAJICA
   PRIVATE MEMORY WEBSITE
   ========================================================= */


/* ================= SUPABASE ================= */

const SUPABASE_URL =
    "https://cbxchhonkkrlwisjjonk.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_U2CbY-32ZYfAtp7YRlokcQ_uK8bKsQ6";

const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* ================= LOGIN ================= */

const WEBSITE_USERNAME =
    "leon&majica";

const SUPABASE_EMAIL =
    "creign_liu17@yahoo.com";


async function login() {

    const username =
        document.getElementById("username").value.trim();

    const password =
        document.getElementById("password").value;

    const message =
        document.getElementById("loginMessage");


    if (username !== WEBSITE_USERNAME) {

        message.textContent =
            "Incorrect username or password.";

        return;
    }


    message.textContent =
        "Signing in...";


    const { error } =
        await supabaseClient.auth.signInWithPassword({

            email: SUPABASE_EMAIL,

            password: password

        });


    if (error) {

        console.error(error);

        message.textContent =
            "Incorrect username or password.";

        return;
    }


    showWebsite();
}


/* ================= LOGOUT ================= */

async function logout() {

    await supabaseClient.auth.signOut();

    location.reload();
}


/* ================= SHOW WEBSITE ================= */

function showWebsite() {

    document
        .getElementById("loginPage")
        .classList.add("hidden");

    document
        .getElementById("mainPage")
        .classList.remove("hidden");


    loadEverything();
}


/* ================= CHECK LOGIN ================= */

async function checkLogin() {

    const { data } =
        await supabaseClient.auth.getSession();


    if (data.session) {

        showWebsite();

    }

}


checkLogin();


/* ================= NAVIGATION ================= */

function showSection(section) {

    document
        .querySelectorAll(".section")
        .forEach(element => {

            element.classList.add("hidden");

        });


    const selected =
        document.getElementById(section);


    if (selected) {

        selected.classList.remove("hidden");

    }


    if (section === "albums") {

        loadAlbums();

    }


    if (section === "playlists") {

        loadPlaylists();

    }


    if (section === "videos") {

        loadVideos();

    }


    if (section === "messages") {

        loadMessages();

    }


    if (section === "home") {

        loadRecentMemories();

    }

}


/* ================= LOAD EVERYTHING ================= */

async function loadEverything() {

    await loadRecentMemories();

    await loadAlbums();

    await loadPlaylists();

    await loadVideos();

    await loadMessages();

}


/* =========================================================
   RECENT MEMORIES
   ========================================================= */

async function loadRecentMemories() {

    const container =
        document.getElementById("recentMemories");


    if (!container) return;


    container.innerHTML = "";


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

        return;
    }


    for (const memory of data) {

        await createMemoryCard(
            memory,
            container
        );

    }

}


/* =========================================================
   LOAD ALBUMS
   ========================================================= */

async function loadAlbums() {

    const container =
        document.getElementById("albumGallery");


    if (!container) return;


    container.innerHTML = "";


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


    if (!data.length) {

        container.innerHTML =
            "<p>No albums yet. Create your first album ❤️</p>";

        return;
    }


    for (const album of data) {

        const card =
            document.createElement("div");

        card.className =
            "card";


        const cover =
            document.createElement("div");

        cover.className =
            "card-cover";


        cover.style.display =
            "flex";

        cover.style.alignItems =
            "center";

        cover.style.justifyContent =
            "center";

        cover.style.fontSize =
            "45px";

        cover.textContent =
            album.media_type === "video"
                ? "🎥"
                : "📸";


        if (album.cover_path) {

            const url =
                await getFileUrl(
                    album.cover_path
                );


            if (url) {

                cover.style.backgroundImage =
                    `url("${url}")`;

                cover.style.backgroundSize =
                    "cover";

                cover.style.backgroundPosition =
                    "center";

                cover.textContent = "";

            }

        }


        const content =
            document.createElement("div");

        content.className =
            "card-content";


        const title =
            document.createElement("h3");

        title.textContent =
            album.name;


        const description =
            document.createElement("p");

        description.textContent =
            album.description ||
            "Memory album";


        content.appendChild(title);

        content.appendChild(description);


        card.appendChild(cover);

        card.appendChild(content);


        card.onclick =
            () => openAlbum(album);


        container.appendChild(card);

    }

}


/* =========================================================
   OPEN ALBUM
   ========================================================= */

async function openAlbum(album) {

    document
        .getElementById("albumViewer")
        .classList.remove("hidden");


    document
        .getElementById("albumViewerTitle")
        .textContent =
        album.name;


    const container =
        document.getElementById(
            "albumMemoryGallery"
        );


    container.innerHTML =
        "<p>Loading memories...</p>";


    const { data, error } =
        await supabaseClient
            .from("memories")
            .select("*")
            .eq("album_id", album.id)
            .order("created_at", {
                ascending: false
            });


    if (error) {

        console.error(error);

        container.innerHTML =
            "<p>Could not load album.</p>";

        return;
    }


    container.innerHTML = "";


    if (!data.length) {

        container.innerHTML =
            "<p>This album is empty.</p>";

        return;
    }


    for (const memory of data) {

        await createMemoryCard(
            memory,
            container
        );

    }

}


function closeAlbum() {

    document
        .getElementById("albumViewer")
        .classList.add("hidden");

}


/* =========================================================
   ALBUM MANAGER
   ========================================================= */

async function openAlbumManager() {

    document
        .getElementById("albumManager")
        .classList.remove("hidden");


    await loadAlbumManager();

}


function closeAlbumManager() {

    document
        .getElementById("albumManager")
        .classList.add("hidden");

}


async function loadAlbumManager() {

    const container =
        document.getElementById(
            "albumManagerList"
        );


    container.innerHTML =
        "Loading albums...";


    const { data, error } =
        await supabaseClient
            .from("albums")
            .select("*")
            .order("created_at", {
                ascending: false
            });


    if (error) {

        console.error(error);

        container.innerHTML =
            "Could not load albums.";

        return;
    }


    container.innerHTML = "";


    for (const album of data) {

        const row =
            document.createElement("div");


        row.style.display =
            "flex";

        row.style.gap =
            "8px";

        row.style.alignItems =
            "center";

        row.style.marginBottom =
            "10px";


        const input =
            document.createElement("input");

        input.value =
            album.name;


        const save =
            document.createElement("button");

        save.textContent =
            "Save";


        save.onclick =
            async () => {

                await renameAlbum(
                    album.id,
                    input.value
                );

            };


        const remove =
            document.createElement("button");

        remove.textContent =
            "Delete";


        remove.onclick =
            async () => {

                await deleteAlbum(
                    album.id
                );

            };


        row.appendChild(input);

        row.appendChild(save);

        row.appendChild(remove);


        container.appendChild(row);

    }

}


/* =========================================================
   CREATE ALBUM
   ========================================================= */

async function createAlbum() {

    const input =
        document.getElementById(
            "newAlbumName"
        );


    const name =
        input.value.trim();


    if (!name) {

        alert("Please enter an album name.");

        return;
    }


    const { error } =
        await supabaseClient
            .from("albums")
            .insert({

                name: name,

                description: "",

                media_type: "photo"

            });


    if (error) {

        console.error(error);

        alert(
            "Could not create album: " +
            error.message
        );

        return;
    }


    input.value = "";


    await loadAlbumManager();

    await loadAlbums();

}


/* =========================================================
   RENAME ALBUM
   ========================================================= */

async function renameAlbum(id, name) {

    name =
        name.trim();


    if (!name) {

        alert("Album name cannot be empty.");

        return;
    }


    const { error } =
        await supabaseClient
            .from("albums")
            .update({
                name: name
            })
            .eq("id", id);


    if (error) {

        console.error(error);

        alert(
            "Could not rename album."
        );

        return;
    }


    await loadAlbumManager();

    await loadAlbums();

}


/* =========================================================
   DELETE ALBUM
   ========================================================= */

async function deleteAlbum(id) {

    if (
        !confirm(
            "Delete this album?"
        )
    ) {

        return;
    }


    const { error } =
        await supabaseClient
            .from("albums")
            .delete()
            .eq("id", id);


    if (error) {

        console.error(error);

        alert(
            "Could not delete album: " +
            error.message
        );

        return;
    }


    await loadAlbumManager();

    await loadAlbums();

}


/* =========================================================
   LOAD PLAYLISTS
   ========================================================= */

async function loadPlaylists() {

    const container =
        document.getElementById(
            "playlistGallery"
        );


    if (!container) return;


    container.innerHTML = "";


    const { data, error } =
        await supabaseClient
            .from("playlists")
            .select("*")
            .order("created_at", {
                ascending: false
            });


    if (error) {

        console.error(error);

        return;
    }


    if (!data.length) {

        container.innerHTML =
            "<p>No playlists yet. Create your first playlist 🎵</p>";

        return;
    }


    for (const playlist of data) {

        const card =
            document.createElement("div");

        card.className =
            "card";


        const cover =
            document.createElement("div");

        cover.className =
            "card-cover";


        cover.style.display =
            "flex";

        cover.style.alignItems =
            "center";

        cover.style.justifyContent =
            "center";

        cover.style.fontSize =
            "45px";

        cover.textContent =
            "🎵";


        if (playlist.cover_path) {

            const url =
                await getFileUrl(
                    playlist.cover_path
                );


            if (url) {

                cover.style.backgroundImage =
                    `url("${url}")`;

                cover.style.backgroundSize =
                    "cover";

                cover.style.backgroundPosition =
                    "center";

                cover.textContent = "";

            }

        }


        const content =
            document.createElement("div");

        content.className =
            "card-content";


        const title =
            document.createElement("h3");

        title.textContent =
            playlist.name;


        const description =
            document.createElement("p");

        description.textContent =
            playlist.description ||
            "Music playlist";


        content.appendChild(title);

        content.appendChild(description);


        card.appendChild(cover);

        card.appendChild(content);


        card.onclick =
            () => openPlaylist(playlist);


        container.appendChild(card);

    }

}


/* =========================================================
   OPEN PLAYLIST
   ========================================================= */

async function openPlaylist(playlist) {

    document
        .getElementById("playlistViewer")
        .classList.remove("hidden");


    document
        .getElementById(
            "playlistViewerTitle"
        )
        .textContent =
        playlist.name;


    const container =
        document.getElementById(
            "playlistSongs"
        );


    container.innerHTML =
        "Loading songs...";


    const { data, error } =
        await supabaseClient
            .from("memories")
            .select("*")
            .eq(
                "playlist_id",
                playlist.id
            )
            .eq(
                "media_type",
                "music"
            )
            .order("created_at", {
                ascending: true
            });


    if (error) {

        console.error(error);

        container.innerHTML =
            "Could not load playlist.";

        return;
    }


    container.innerHTML = "";


    if (!data.length) {

        container.innerHTML =
            "<p>This playlist is empty.</p>";

        return;
    }


    currentPlaylist =
        data;


    for (
        let i = 0;
        i < data.length;
        i++
    ) {

        const song =
            data[i];


        const row =
            document.createElement("div");

        row.className =
            "song-item";


        const info =
            document.createElement("div");

        info.className =
            "song-info";


        const title =
            document.createElement("h3");

        title.textContent =
            song.title;


        const subtitle =
            document.createElement("p");

        subtitle.textContent =
            "Leon & Majica";


        info.appendChild(title);

        info.appendChild(subtitle);


        const play =
            document.createElement("button");

        play.textContent =
            "▶";


        play.onclick =
            () => playSong(
                song,
                i
            );


        row.appendChild(info);

        row.appendChild(play);


        container.appendChild(row);

    }

}


function closePlaylist() {

    document
        .getElementById(
            "playlistViewer"
        )
        .classList.add("hidden");

}


/* =========================================================
   PLAYLIST MANAGER
   ========================================================= */

async function openPlaylistManager() {

    document
        .getElementById(
            "playlistManager"
        )
        .classList.remove("hidden");


    await loadPlaylistManager();

}


function closePlaylistManager() {

    document
        .getElementById(
            "playlistManager"
        )
        .classList.add("hidden");

}


async function loadPlaylistManager() {

    const container =
        document.getElementById(
            "playlistManagerList"
        );


    container.innerHTML =
        "Loading playlists...";


    const { data, error } =
        await supabaseClient
            .from("playlists")
            .select("*")
            .order("created_at", {
                ascending: false
            });


    if (error) {

        console.error(error);

        container.innerHTML =
            "Could not load playlists.";

        return;
    }


    container.innerHTML = "";


    for (const playlist of data) {

        const row =
            document.createElement("div");


        row.style.display =
            "flex";

        row.style.gap =
            "8px";

        row.style.alignItems =
            "center";

        row.style.marginBottom =
            "10px";


        const input =
            document.createElement("input");

        input.value =
            playlist.name;


        const save =
            document.createElement("button");

        save.textContent =
            "Save";


        save.onclick =
            async () => {

                await renamePlaylist(
                    playlist.id,
                    input.value
                );

            };


        const remove =
            document.createElement("button");

        remove.textContent =
            "Delete";


        remove.onclick =
            async () => {

                await deletePlaylist(
                    playlist.id
                );

            };


        row.appendChild(input);

        row.appendChild(save);

        row.appendChild(remove);


        container.appendChild(row);

    }

}


/* =========================================================
   CREATE PLAYLIST
   ========================================================= */

async function createPlaylist() {

    const input =
        document.getElementById(
            "newPlaylistName"
        );


    const name =
        input.value.trim();


    if (!name) {

        alert(
            "Please enter a playlist name."
        );

        return;
    }


    const { error } =
        await supabaseClient
            .from("playlists")
            .insert({

                name: name,

                description: ""

            });


    if (error) {

        console.error(error);

        alert(
            "Could not create playlist: " +
            error.message
        );

        return;
    }


    input.value = "";


    await loadPlaylistManager();

    await loadPlaylists();

}


/* =========================================================
   RENAME PLAYLIST
   ========================================================= */

async function renamePlaylist(id, name) {

    name =
        name.trim();


    if (!name) {

        alert(
            "Playlist name cannot be empty."
        );

        return;
    }


    const { error } =
        await supabaseClient
            .from("playlists")
            .update({
                name: name
            })
            .eq("id", id);


    if (error) {

        console.error(error);

        alert(
            "Could not rename playlist."
        );

        return;
    }


    await loadPlaylistManager();

    await loadPlaylists();

}


/* =========================================================
   DELETE PLAYLIST
   ========================================================= */

async function deletePlaylist(id) {

    if (
        !confirm(
            "Delete this playlist?"
        )
    ) {

        return;
    }


    const { error } =
        await supabaseClient
            .from("playlists")
            .delete()
            .eq("id", id);


    if (error) {

        console.error(error);

        alert(
            "Could not delete playlist: " +
            error.message
        );

        return;
    }


    await loadPlaylistManager();

    await loadPlaylists();

}


/* =========================================================
   VIDEOS
   ========================================================= */

async function loadVideos() {

    const container =
        document.getElementById(
            "videoGallery"
        );


    if (!container) return;


    container.innerHTML = "";


    const { data, error } =
        await supabaseClient
            .from("memories")
            .select("*")
            .eq(
                "media_type",
                "video"
            )
            .order("created_at", {
                ascending: false
            });


    if (error) {

        console.error(error);

        return;
    }


    for (const memory of data) {

        await createMemoryCard(
            memory,
            container
        );

    }

}


/* =========================================================
   MESSAGES
   ========================================================= */

async function loadMessages() {

    const container =
        document.getElementById(
            "messageGallery"
        );


    if (!container) return;


    container.innerHTML = "";


    const { data, error } =
        await supabaseClient
            .from("memories")
            .select("*")
            .eq(
                "media_type",
                "message"
            )
            .order("created_at", {
                ascending: false
            });


    if (error) {

        console.error(error);

        return;
    }


    if (!data.length) {

        container.innerHTML =
            "<p>No messages yet. ❤️</p>";

        return;
    }


    for (const memory of data) {

        const card =
            document.createElement(
                "div"
            );

        card.className =
            "message-card";


        const title =
            document.createElement("h3");

        title.textContent =
            memory.title;


        const message =
            document.createElement("p");

        message.textContent =
            memory.description || "";


        const deleteButton =
            createDeleteButton(
                memory
            );


        card.appendChild(title);

        card.appendChild(message);

        card.appendChild(deleteButton);


        container.appendChild(card);

    }

}


/* =========================================================
   CREATE MEMORY CARD
   ========================================================= */

async function createMemoryCard(
    memory,
    container
) {

    const card =
        document.createElement(
            "div"
        );

    card.className =
        "memory-card";


    const url =
        await getFileUrl(
            memory.file_path
        );


    if (
        memory.media_type ===
        "photo"
    ) {

        const image =
            document.createElement(
                "img"
            );

        image.src =
            url;

        image.alt =
            memory.title;


        card.appendChild(
            image
        );

    }


    if (
        memory.media_type ===
        "video"
    ) {

        const video =
            document.createElement(
                "video"
            );

        video.controls =
            true;

        video.src =
            url;


        card.appendChild(
            video
        );

    }


    if (
        memory.media_type ===
        "music"
    ) {

        const title =
            document.createElement(
                "h3"
            );

        title.textContent =
            memory.title;


        const audio =
            document.createElement(
                "audio"
            );

        audio.controls =
            true;

        audio.src =
            url;

        audio.style.width =
            "100%";


        card.appendChild(
            title
        );

        card.appendChild(
            audio
        );

    }


    const deleteButton =
        createDeleteButton(
            memory
        );


    card.appendChild(
        deleteButton
    );


    container.appendChild(
        card
    );

}


/* =========================================================
   DELETE BUTTON
   ========================================================= */

function createDeleteButton(
    memory
) {

    const button =
        document.createElement(
            "button"
        );

    button.textContent =
        "🗑️ Delete";

    button.className =
        "delete-button";


    button.onclick =
        () => {

            deleteMemory(
                memory.id,
                memory.file_path
            );

        };


    return button;

}


/* =========================================================
   DELETE MEMORY
   ========================================================= */

async function deleteMemory(
    id,
    filePath
) {

    if (
        !confirm(
            "Are you sure you want to delete this memory?"
        )
    ) {

        return;
    }


    if (filePath) {

        const { error } =
            await supabaseClient
                .storage
                .from("memories")
                .remove([
                    filePath
                ]);


        if (error) {

            console.error(error);

            alert(
                "Could not delete the file: " +
                error.message
            );

            return;
        }

    }


    const { error } =
        await supabaseClient
            .from("memories")
            .delete()
            .eq("id", id);


    if (error) {

        console.error(error);

        alert(
            "Could not delete memory: " +
            error.message
        );

        return;
    }


    await loadEverything();

}


/* =========================================================
   UPLOAD
   ========================================================= */

async function uploadMemories() {

    const type =
        document.getElementById(
            "memoryType"
        ).value;


    const files =
        document.getElementById(
            "memoryFiles"
        ).files;


    const status =
        document.getElementById(
            "uploadStatus"
        );


    if (!files.length) {

        status.textContent =
            "Please choose a file first.";

        return;
    }


    status.textContent =
        "Uploading...";


    for (
        const file of files
    ) {

        const uniqueName =
            crypto.randomUUID() +
            "-" +
            file.name;


        const folder =
            type === "music"
                ? "musics"
                : `${type}s`;


        const filePath =
            `${folder}/${uniqueName}`;


        const {
            error: uploadError
        } =
            await supabaseClient
                .storage
                .from("memories")
                .upload(
                    filePath,
                    file,
                    {
                        upsert: false
                    }
                );


        if (uploadError) {

            console.error(
                uploadError
            );

            status.textContent =
                "Upload failed: " +
                uploadError.message;

            continue;
        }


        const {
            error: databaseError
        } =
            await supabaseClient
                .from("memories")
                .insert({

                    title:
                        file.name,

                    description:
                        "",

                    media_type:
                        type,

                    file_path:
                        filePath

                });


        if (databaseError) {

            console.error(
                databaseError
            );


            await supabaseClient
                .storage
                .from("memories")
                .remove([
                    filePath
                ]);


            status.textContent =
                "Could not save memory.";

            continue;
        }


        status.textContent =
            `${file.name} uploaded successfully.`;

    }


    document.getElementById(
        "memoryFiles"
    ).value = "";


    await loadEverything();

}


/* =========================================================
   MUSIC PLAYER
   ========================================================= */

let currentPlaylist = [];

let currentSongIndex = 0;


async function playSong(
    song,
    index
) {

    currentSongIndex =
        index;


    const player =
        document.getElementById(
            "audioPlayer"
        );


    const url =
        await getFileUrl(
            song.file_path
        );


    if (!url) {

        alert(
            "Could not load this song."
        );

        return;
    }


    player.src =
        url;


    player.volume =
        document.getElementById(
            "volumeControl"
        ).value;


    document.getElementById(
        "playerTitle"
    ).textContent =
        song.title;


    document.getElementById(
        "playerArtist"
    ).textContent =
        "Leon & Majica";


    document
        .getElementById(
            "musicPlayer"
        )
        .classList.remove(
            "hidden"
        );


    await player.play();


    document.getElementById(
        "playButton"
    ).textContent =
        "⏸";

}


function toggleMusic() {

    const player =
        document.getElementById(
            "audioPlayer"
        );


    if (
        player.paused
    ) {

        player.play();

        document.getElementById(
            "playButton"
        ).textContent =
            "⏸";

    } else {

        player.pause();

        document.getElementById(
            "playButton"
        ).textContent =
            "▶";

    }

}


function previousSong() {

    if (
        !currentPlaylist.length
    ) return;


    currentSongIndex--;


    if (
        currentSongIndex < 0
    ) {

        currentSongIndex =
            currentPlaylist.length - 1;

    }


    playSong(
        currentPlaylist[
            currentSongIndex
        ],
        currentSongIndex
    );

}


function nextSong() {

    if (
        !currentPlaylist.length
    ) return;


    currentSongIndex++;


    if (
        currentSongIndex >=
        currentPlaylist.length
    ) {

        currentSongIndex = 0;

    }


    playSong(
        currentPlaylist[
            currentSongIndex
        ],
        currentSongIndex
    );

}


function changeVolume() {

    const player =
        document.getElementById(
            "audioPlayer"
        );


    const volume =
        document.getElementById(
            "volumeControl"
        ).value;


    player.volume =
        volume;

}


function toggleMute() {

    const player =
        document.getElementById(
            "audioPlayer"
        );


    player.muted =
        !player.muted;

}


/* Automatically play next song */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const player =
            document.getElementById(
                "audioPlayer"
            );


        if (!player) return;


        player.addEventListener(
            "ended",
            () => {

                nextSong();

            }
        );

    }
);


/* =========================================================
   THEME
   ========================================================= */

function setTheme(theme) {

    document.body.dataset.theme =
        theme;


    localStorage.setItem(
        "leonMajicaTheme",
        theme
    );


    if (
        theme === "romantic"
    ) {

        document.documentElement.style.setProperty(
            "--accent",
            "#ff4d6d"
        );

        document.documentElement.style.setProperty(
            "--accent-soft",
            "#ff8fa3"
        );

    }


    if (
        theme === "dark"
    ) {

        document.documentElement.style.setProperty(
            "--accent",
            "#e50914"
        );

        document.documentElement.style.setProperty(
            "--accent-soft",
            "#ff4d6d"
        );

    }


    if (
        theme === "light"
    ) {

        document.documentElement.style.setProperty(
            "--accent",
            "#c9184a"
        );

        document.documentElement.style.setProperty(
            "--accent-soft",
            "#ff4d6d"
        );

        document.body.style.background =
            "#f5f5f5";

        document.body.style.color =
            "#111";

    } else {

        document.body.style.background = "";

        document.body.style.color = "";

    }

}


/* Restore saved theme */

const savedTheme =
    localStorage.getItem(
        "leonMajicaTheme"
    );


if (savedTheme) {

    setTheme(
        savedTheme
    );

}
