const SUPABASE_URL =
    "https://cbxchhonkkrlwisjjonk.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_U2CbY-32ZYfAtp7YRlokcQ_uK8bKsQ6";

const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* LOGIN SETTINGS */

const WEBSITE_USERNAME = "leon&majica";

const SUPABASE_EMAIL =
    "creign_liu17@yahoo.com";


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


    const { error } =
        await supabaseClient.auth.signInWithPassword({

            email: SUPABASE_EMAIL,

            password: password

        });


    if (error) {

        message.textContent =
            "Incorrect username or password.";

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


/* UPLOAD MEMORIES */

async function uploadMemories() {

    const type =
        document.getElementById("memoryType").value;

    const files =
        document.getElementById("memoryFiles").files;

    const status =
        document.getElementById("uploadStatus");

    const progress =
        document.getElementById("uploadProgress");


    if (!files.length) {

        status.textContent =
            "Please choose a file first.";

        return;
    }


    status.textContent =
        "Uploading...";

    progress.textContent = "";


    for (const file of files) {

        const uniqueName =
            crypto.randomUUID() + "-" + file.name;

        const filePath =
            `${type}s/${uniqueName}`;


        /* UPLOAD FILE */

        const { error: uploadError } =
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

            console.error(uploadError);

            status.textContent =
                "Upload failed: " +
                uploadError.message;

            continue;
        }


        /* SAVE FILE INFORMATION */

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

            await supabaseClient
                .storage
                .from("memories")
                .remove([filePath]);

            status.textContent =
                "File uploaded but could not be saved.";

            continue;
        }


        status.textContent =
            `${file.name} uploaded successfully.`;
    }


    document.getElementById("memoryFiles").value = "";

    progress.textContent = "";

    await loadMemories();
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


        /* PHOTO */

        if (memory.media_type === "photo") {

            const url =
                await getFileUrl(memory.file_path);


            const card =
                document.createElement("div");

            card.className =
                "memory-card";


            const image =
                document.createElement("img");

            image.src = url;

            image.alt =
                memory.title;


            const deleteButton =
                createDeleteButton(memory);


            card.appendChild(image);

            card.appendChild(deleteButton);

            photos.appendChild(card);
        }


        /* VIDEO */

        if (memory.media_type === "video") {

            const url =
                await getFileUrl(memory.file_path);


            const card =
                document.createElement("div");

            card.className =
                "memory-card";


            const title =
                document.createElement("h3");

            title.textContent =
                memory.title;


            const video =
                document.createElement("video");

            video.controls = true;

            video.src = url;


            const deleteButton =
                createDeleteButton(memory);


            card.appendChild(title);

            card.appendChild(video);

            card.appendChild(deleteButton);

            videos.appendChild(card);
        }


        /* MUSIC */

        if (memory.media_type === "music") {

            const url =
                await getFileUrl(memory.file_path);


            const card =
                document.createElement("div");

            card.className =
                "memory-card";


            const title =
                document.createElement("h3");

            title.textContent =
                memory.title;


            const audio =
                document.createElement("audio");

            audio.controls = true;

            audio.src = url;


            const deleteButton =
                createDeleteButton(memory);


            card.appendChild(title);

            card.appendChild(audio);

            card.appendChild(deleteButton);

            music.appendChild(card);
        }


        /* MESSAGE */

        if (memory.media_type === "message") {

            const card =
                document.createElement("div");

            card.className =
                "message-card";


            const title =
                document.createElement("h3");

            title.textContent =
                memory.title;


            const description =
                document.createElement("p");

            description.textContent =
                memory.description || "";


            const deleteButton =
                createDeleteButton(memory);


            card.appendChild(title);

            card.appendChild(description);

            card.appendChild(deleteButton);

            messages.appendChild(card);
        }

    }

}


/* DELETE BUTTON */

function createDeleteButton(memory) {

    const button =
        document.createElement("button");

    button.textContent =
        "🗑️ Delete";

    button.className =
        "delete-button";


    button.onclick = function () {

        deleteMemory(
            memory.id,
            memory.file_path
        );

    };


    return button;
}


/* DELETE MEMORY */

async function deleteMemory(id, filePath) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this memory?"
        );


    if (!confirmDelete) {

        return;
    }


    /* DELETE FILE */

    const { error: storageError } =
        await supabaseClient
            .storage
            .from("memories")
            .remove([filePath]);


    if (storageError) {

        console.error(storageError);

        alert(
            "Could not delete the file: " +
            storageError.message
        );

        return;
    }


    /* DELETE DATABASE RECORD */

    const { error: databaseError } =
        await supabaseClient
            .from("memories")
            .delete()
            .eq("id", id);


    if (databaseError) {

        console.error(databaseError);

        alert(
            "File deleted, but database record could not be deleted."
        );

        return;
    }


    await loadMemories();

}


/* PRIVATE FILE URL */

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
