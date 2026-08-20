/* =====================================================
   SKYLARK STAFF APPLICATION
   FIREBASE + FIRESTORE
===================================================== */

import { initializeApp } from
    "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp
} from
    "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


/* =====================================================
   FIREBASE CONFIG
===================================================== */

const firebaseConfig = {

    apiKey:
        "AIzaSyAnkbOkah3JjBe_9lsYYMinMXzY5VlLfL4",

    authDomain:
        "skylark-staff-application.firebaseapp.com",

    projectId:
        "skylark-staff-application",

    storageBucket:
        "skylark-staff-application.firebasestorage.app",

    messagingSenderId:
        "877610328379",

    appId:
        "1:877610328379:web:8d0a892bad042875de971e"
};


/* =====================================================
   INITIALIZE FIREBASE
===================================================== */

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);


/* =====================================================
   ELEMENTS
===================================================== */

const form =
    document.getElementById("applicationForm");

const submitButton =
    document.getElementById("submitButton");

const formMessage =
    document.getElementById("formMessage");


/* =====================================================
   SUBMIT APPLICATION
===================================================== */

form.addEventListener("submit", async function(event) {

    event.preventDefault();


    /* -------------------------------------------------
       DISABLE BUTTON
    ------------------------------------------------- */

    submitButton.disabled = true;

    submitButton.textContent =
        "Submitting...";

    formMessage.textContent =
        "";

    formMessage.style.color =
        "#9abccc";


    try {

        /* -------------------------------------------------
           GET FORM VALUES
        ------------------------------------------------- */

        const ignDiscord =
            document
                .getElementById("ignDiscord")
                .value
                .trim();

        const ageTimezone =
            document
                .getElementById("ageTimezone")
                .value
                .trim();

        const hours =
            document
                .getElementById("hours")
                .value
                .trim();

        const experience =
            document
                .getElementById("experience")
                .value
                .trim();

        const disagreement =
            document
                .getElementById("disagreement")
                .value
                .trim();

        const whyYou =
            document
                .getElementById("whyYou")
                .value
                .trim();

        const extra =
            document
                .getElementById("extra")
                .value
                .trim();


        /* -------------------------------------------------
           BASIC VALIDATION
        ------------------------------------------------- */

        if (
            !ignDiscord ||
            !ageTimezone ||
            !hours ||
            !experience ||
            !disagreement ||
            !whyYou
        ) {

            throw new Error(
                "Please complete all required questions."
            );

        }


        /* -------------------------------------------------
           SAVE TO FIRESTORE
        ------------------------------------------------- */

        await addDoc(
            collection(db, "applications"),
            {

                ignDiscord:
                    ignDiscord,

                ageTimezone:
                    ageTimezone,

                hours:
                    hours,

                experience:
                    experience,

                disagreement:
                    disagreement,

                whyYou:
                    whyYou,

                extra:
                    extra || "Not provided",

                status:
                    "pending",

                submittedAt:
                    serverTimestamp()

            }
        );


        /* -------------------------------------------------
           SUCCESS
        ------------------------------------------------- */

        formMessage.textContent =
            "✓ Application submitted successfully!";

        formMessage.style.color =
            "#51ffc8";


        form.reset();


        submitButton.textContent =
            "Application Submitted";


    } catch (error) {


        /* -------------------------------------------------
           ERROR
        ------------------------------------------------- */

        console.error(
            "Application error:",
            error
        );


        formMessage.textContent =
            "✕ " + (
                error.message ||
                "Something went wrong. Please try again."
            );

        formMessage.style.color =
            "#ff8b8b";


        submitButton.disabled =
            false;

        submitButton.textContent =
            "Submit Application";

    }

});