const SUPABASE_URL =
    "https://cbxchhonkkrlwisjjonk.supabase.co";

const SUPABASE_KEY =
    "PASTE_YOUR_PUBLISHABLE_KEY_HERE";


const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );



/* LOGIN */

async function login() {

    const email =
        document.getElementById("email").value;

    const password =
        document.getElementById("password").value;

    const message =
        document.getElementById("loginMessage");


    message.textContent = "Signing in...";


    const { data, error } =
        await supabaseClient.auth.signInWithPassword({
            email,
            password
        });


    if (error) {

        message.textContent =
            "Incorrect email or password.";

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



/* LOAD MEMORIES */

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

        if (memory.media_type === "photo") {

            const url =
                await getFileUrl(memory.file_path);


            photos.innerHTML += `
                <img
                    src="${url}"
                    alt="${memory.title}"
                >
            `;
        }


        if (memory.media_type === "video") {

            const url =
                await getFileUrl(memory.file_path);


            videos.innerHTML += `
                <div class="video-card">

                    <h3>${memory.title}</h3>

                    <video
                        controls
                        src="${url}">
                    </video>

                </div>
            `;
        }


        if (memory.media_type === "music") {

            const url =
                await getFileUrl(memory.file_path);


            music.innerHTML += `
                <div class="music-card">

                    <h3>${memory.title}</h3>

                    <audio
                        controls
                        src="${url}">
                    </audio>

                </div>
            `;
        }


        if (memory.media_type === "message") {

            messages.innerHTML += `
                <div class="message-card">

                    <h3>${memory.title}</h3>

                    <p>${memory.description || ""}</p>

                </div>
            `;
        }

    }

}



/* PRIVATE FILE URL */

async function getFileUrl(path) {

    const { data, error } =
        await supabaseClient
            .storage
            .from("memories")
            .createSignedUrl(path, 3600);


    if (error) {

        console.error(error);

        return "";
    }


    return data.signedUrl;
      }
