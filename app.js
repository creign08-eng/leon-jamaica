const SUPABASE_URL =
    "https://cbxchhonkkrlwisjjonk.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_U2CbY-32ZYfAtp7YRlokcQ_uK8bKsQ6";

const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* WEBSITE LOGIN */

const WEBSITE_USERNAME = "leon&majica";

const SUPABASE_EMAIL = "creign_liu17@yahoo.com";


/* LOGIN */

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


    message.textContent = "Signing in...";


    const { data, error } =
        await supabaseClient.auth.signInWithPassword({

            email: SUPABASE_EMAIL,

            password: password

        });


    if (error) {

        message.textContent =
            "Incorrect username or password.";

        console.error(error);

        return;
    }


    showWebsite();
}


/* LOGOUT */

async function logout() {

    await supabaseClient.auth.signOut();

    location.reload();
}


/* SHOW WEBSITE */

function showWebsite() {

    document
        .getElementById("loginPage")
        .classList.add("hidden");

    document
        .getElementById("mainPage")
        .classList.remove("hidden");

    loadMemories();
}


/* CHECK LOGIN */

async function checkLogin() {

    const { data } =
        await supabaseClient.auth.getSession();


    if (data.session) {

        showWebsite();

    }

}


checkLogin();


/* NAVIGATION */

function showSection(section) {

    document
        .querySelectorAll(".section")
        .forEach(element => {

            element.classList.add("hidden");

        });


    document
        .getElementById(section)
        .classList.remove("hidden");
}


/* =========================
   UPLOAD MEMORIES
========================= */

async function uploadMemories() {

    const fileInput =
        document.getElementById("memoryFiles");

    const type =
        document.getElementById("memoryType").value;

    const status =
        document.getElementById("uploadStatus");

    const button =
        document.getElementById("uploadButton");


    const files = fileInput.files;


    if (!files || files.length === 0) {

        status.textContent =
            "Please choose a file first.";

        return;
    }


    button.disabled = true;

    status.textContent =
        "Uploading your memories...";


    let successful = 0;


    try {

        for (const file of files) {

            status.textContent =
                `Uploading ${file.name}...`;


            /*
            Create a unique filename so files
            with the same name don't overwrite
            each other.
            */

            const extension =
                file.name.includes(".")
                    ? file.name.split(".").pop()
                    : "";

            const uniqueName =
                `${crypto.randomUUID()}${extension ? "." + extension : ""}`;


            const filePath =
                `${type}s/${uniqueName}`;


            /*
            Upload file to Supabase Storage
            */

            const { error: uploadError } =
                await supabaseClient
                    .storage
                    .from("memories")
                    .upload(
                        filePath,
                        file,
                        {
                            cacheControl: "3600",
                            upsert: false
                        }
                    );


            if (uploadError) {

                console.error(uploadError);

                status.textContent =
                    `Could not upload ${file.name}`;

                continue;
            }


            /*
            Save information about the file
            in the memories database table.
            */

            const { error: databaseError } =
                await supabaseClient
                    .from("memories")
                    .insert({

                        title: file.name,

                        description: "",

                        media_type: type,

                        file_path: filePath

                    });


            if (databaseError) {

                console.error(databaseError);

                status.textContent =
                    `File uploaded, but information could not be saved: ${file.name}`;

                continue;
            }


            successful++;

        }


        status.textContent =
            `❤️ ${successful} memory${successful === 1 ? "" : "ies"} uploaded successfully!`;


        fileInput.value = "";


        /*
        Refresh all galleries
        */

        await loadMemories();


    } catch (error) {

        console.error(error);

        status.textContent =
            "Something went wrong while uploading.";

    }


    button.disabled = false;
}


/* =========================
   LOAD MEMORIES
========================= */

async function loadMemories() {

    const { data, error } =
        await supabaseClient
            .from("memories")
            .select("*")
            .order("created_at", {
                ascending: false
            });


    if (error) {

        console.error(error);

        return;
    }


    const photos =
        document.getElementById("photoGallery");

    const videos =
        document.getElementById("videoGallery");

    const music =
        document.getElementById("musicGallery");

    const messages =
        document.getElementById("messageGallery");


    photos.innerHTML = "";

    videos.innerHTML = "";

    music.innerHTML = "";

    messages.innerHTML = "";


    for (const memory of data) {


        /* PHOTO */

        if (memory.media_type === "photo") {

            const url =
                await getFileUrl(memory.file_path);


            photos.innerHTML += `

                <div class="memory-card">

                    <img
                        src="${url}"
                        alt="${escapeHTML(memory.title || "Memory")}"
                        loading="lazy"
                    >

                    <p>
                        ${escapeHTML(memory.title || "")}
                    </p>

                </div>

            `;
        }


        /* VIDEO */

        if (memory.media_type === "video") {

            const url =
                await getFileUrl(memory.file_path);


            videos.innerHTML += `

                <div class="video-card">

                    <h3>
                        ${escapeHTML(memory.title || "Video")}
                    </h3>

                    <video
                        controls
                        playsinline
                        src="${url}">
                    </video>

                </div>

            `;
        }


        /* MUSIC */

        if (memory.media_type === "music") {

            const url =
                await getFileUrl(memory.file_path);


            music.innerHTML += `

                <div class="music-card">

                    <h3>
                        🎵 ${escapeHTML(memory.title || "Music")}
                    </h3>

                    <audio
                        controls
                        src="${url}">
                    </audio>

                </div>

            `;
        }


        /* MESSAGE */

        if (memory.media_type === "message") {

            messages.innerHTML += `

                <div class="message-card">

                    <h3>
                        ${escapeHTML(memory.title || "Message")}
                    </h3>

                    <p>
                        ${escapeHTML(memory.description || "")}
                    </p>

                </div>

            `;
        }

    }

}


/* =========================
   GET PRIVATE FILE URL
========================= */

async function getFileUrl(path) {

    const { data, error } =
        await supabaseClient
            .storage
            .from("memories")
            .createSignedUrl(
                path,
                3600
            );


    if (error) {

        console.error(error);

        return "";

    }


    return data.signedUrl;

}


/* =========================
   PROTECT DISPLAYED TEXT
========================= */

function escapeHTML(value) {

    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}
