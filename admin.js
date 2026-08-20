/* =====================================================
   SKYLARK ADMIN PANEL
   FIREBASE GOOGLE LOGIN + FIRESTORE
===================================================== */

import { initializeApp } from
    "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    signOut
} from
    "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    query,
    orderBy,
    onSnapshot,
    doc,
    updateDoc,
    deleteDoc
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

const app =
    initializeApp(firebaseConfig);

const auth =
    getAuth(app);

const db =
    getFirestore(app);

const provider =
    new GoogleAuthProvider();


/* =====================================================
   AUTHORIZED ADMINS
===================================================== */

const ADMIN_EMAILS = [

    "xianytcontent@gmail.com",

    "deinnieldeinn@gmail.com",

    "keithledesma13@gmail.com",

    "mtzy6764@gmail.com"

];


/* =====================================================
   ELEMENTS
===================================================== */

const loginScreen =
    document.getElementById("loginScreen");

const adminDashboard =
    document.getElementById("adminDashboard");

const googleLoginButton =
    document.getElementById("googleLoginButton");

const logoutButton =
    document.getElementById("logoutButton");

const loginMessage =
    document.getElementById("loginMessage");

const adminEmail =
    document.getElementById("adminEmail");

const applicationsList =
    document.getElementById("applicationsList");

const refreshButton =
    document.getElementById("refreshButton");

const totalCount =
    document.getElementById("totalCount");

const pendingCount =
    document.getElementById("pendingCount");

const acceptedCount =
    document.getElementById("acceptedCount");

const rejectedCount =
    document.getElementById("rejectedCount");

const applicationModal =
    document.getElementById("applicationModal");

const closeModal =
    document.getElementById("closeModal");

const modalTitle =
    document.getElementById("modalTitle");

const modalContent =
    document.getElementById("modalContent");

const acceptButton =
    document.getElementById("acceptButton");

const rejectButton =
    document.getElementById("rejectButton");

const deleteButton =
    document.getElementById("deleteButton");


/* =====================================================
   CURRENT APPLICATION
===================================================== */

let currentApplicationId = null;


/* =====================================================
   GOOGLE LOGIN
===================================================== */

googleLoginButton.addEventListener(
    "click",
    async function() {

        loginMessage.textContent =
            "Opening Google sign-in...";

        loginMessage.style.color =
            "#9abccc";

        googleLoginButton.disabled =
            true;

        try {

            await signInWithPopup(
                auth,
                provider
            );

        } catch (error) {

            console.error(
                "Login error:",
                error
            );

            loginMessage.textContent =
                getAuthErrorMessage(error);

            loginMessage.style.color =
                "#ff8b8b";

            googleLoginButton.disabled =
                false;
        }

    }
);


/* =====================================================
   AUTH STATE
===================================================== */

onAuthStateChanged(
    auth,
    async function(user) {

        if (!user) {

            showLogin();

            return;
        }


        const email =
            (user.email || "").toLowerCase();


        const isAdmin =
            ADMIN_EMAILS
                .map(
                    item =>
                        item.toLowerCase()
                )
                .includes(email);


        if (!isAdmin) {

            loginMessage.textContent =
                "This Google account is not authorized.";

            loginMessage.style.color =
                "#ff8585";

            await signOut(auth);

            googleLoginButton.disabled =
                false;

            return;
        }


        adminEmail.textContent =
            user.email;

        showDashboard();

        loadApplications();

    }
);


/* =====================================================
   SHOW LOGIN
===================================================== */

function showLogin() {

    loginScreen.style.display =
        "flex";

    adminDashboard.style.display =
        "none";

    logoutButton.style.display =
        "none";
}


/* =====================================================
   SHOW DASHBOARD
===================================================== */

function showDashboard() {

    loginScreen.style.display =
        "none";

    adminDashboard.style.display =
        "block";

    logoutButton.style.display =
        "block";
}


/* =====================================================
   LOGOUT
===================================================== */

logoutButton.addEventListener(
    "click",
    async function() {

        try {

            await signOut(auth);

        } catch (error) {

            console.error(
                "Logout error:",
                error
            );

        }

    }
);


/* =====================================================
   LOAD APPLICATIONS
===================================================== */

function loadApplications() {

    applicationsList.innerHTML =
        '<div class="loading">Loading applications...</div>';


    const applicationsQuery =
        query(
            collection(
                db,
                "applications"
            ),
            orderBy(
                "submittedAt",
                "desc"
            )
        );


    onSnapshot(
        applicationsQuery,
        function(snapshot) {

            const applications =
                [];


            snapshot.forEach(
                function(documentSnapshot) {

                    applications.push({

                        id:
                            documentSnapshot.id,

                        ...documentSnapshot.data()

                    });

                }
            );


            updateStats(
                applications
            );


            renderApplications(
                applications
            );

        },
        function(error) {

            console.error(
                "Firestore error:",
                error
            );

            applicationsList.innerHTML =
                `
                <div class="empty">
                    Unable to load applications.
                    <br><br>
                    Check your Firestore rules.
                </div>
                `;

        }
    );

}


/* =====================================================
   REFRESH
===================================================== */

refreshButton.addEventListener(
    "click",
    function() {

        loadApplications();

    }
);


/* =====================================================
   UPDATE STATS
===================================================== */

function updateStats(
    applications
) {

    let pending = 0;

    let accepted = 0;

    let rejected = 0;


    applications.forEach(
        function(application) {

            const status =
                application.status ||
                "pending";


            if (status === "accepted") {

                accepted++;

            } else if (
                status === "rejected"
            ) {

                rejected++;

            } else {

                pending++;

            }

        }
    );


    totalCount.textContent =
        applications.length;

    pendingCount.textContent =
        pending;

    acceptedCount.textContent =
        accepted;

    rejectedCount.textContent =
        rejected;

}


/* =====================================================
   RENDER APPLICATIONS
===================================================== */

function renderApplications(
    applications
) {

    if (
        applications.length === 0
    ) {

        applicationsList.innerHTML =
            `
            <div class="empty">
                No applications yet.
            </div>
            `;

        return;
    }


    applicationsList.innerHTML =
        "";


    applications.forEach(
        function(application) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "application-item";


            const main =
                document.createElement(
                    "div"
                );


            main.className =
                "application-main";


            const name =
                document.createElement(
                    "div"
                );


            name.className =
                "application-name";


            name.textContent =
                application.ignDiscord ||
                "Unknown Applicant";


            const date =
                document.createElement(
                    "div"
                );


            date.className =
                "application-date";


            date.textContent =
                formatDate(
                    application.submittedAt
                );


            main.appendChild(
                name
            );

            main.appendChild(
                date
            );


            const status =
                document.createElement(
                    "span"
                );


            const currentStatus =
                application.status ||
                "pending";


            status.className =
                "status " +
                currentStatus;


            status.textContent =
                currentStatus.toUpperCase();


            item.appendChild(
                main
            );

            item.appendChild(
                status
            );


            item.addEventListener(
                "click",
                function() {

                    openApplication(
                        application
                    );

                }
            );


            applicationsList.appendChild(
                item
            );

        }
    );

}


/* =====================================================
   OPEN APPLICATION
===================================================== */

function openApplication(
    application
) {

    currentApplicationId =
        application.id;


    modalTitle.textContent =
        application.ignDiscord ||
        "Staff Application";


    modalContent.innerHTML =
        "";


    addAnswer(
        "Minecraft IGN & Discord",
        application.ignDiscord
    );


    addAnswer(
        "Age & Timezone",
        application.ageTimezone
    );


    addAnswer(
        "Staff Hours Per Week",
        application.hours
    );


    addAnswer(
        "Previous Staff Experience",
        application.experience
    );


    addAnswer(
        "Disagreement Scenario",
        application.disagreement
    );


    addAnswer(
        "What Sets Them Apart?",
        application.whyYou
    );


    addAnswer(
        "Additional Information",
        application.extra
    );


    applicationModal.classList.add(
        "active"
    );

}


/* =====================================================
   ADD ANSWER
===================================================== */

function addAnswer(
    title,
    value
) {

    const box =
        document.createElement(
            "div"
        );


    box.className =
        "answer-box";


    const heading =
        document.createElement(
            "h3"
        );


    heading.textContent =
        title;


    const answer =
        document.createElement(
            "p"
        );


    answer.textContent =
        value ||
        "Not provided";


    box.appendChild(
        heading
    );

    box.appendChild(
        answer
    );


    modalContent.appendChild(
        box
    );

}


/* =====================================================
   CLOSE MODAL
===================================================== */

closeModal.addEventListener(
    "click",
    function() {

        applicationModal.classList.remove(
            "active"
        );

        currentApplicationId =
            null;

    }
);


applicationModal.addEventListener(
    "click",
    function(event) {

        if (
            event.target ===
            applicationModal
        ) {

            applicationModal.classList.remove(
                "active"
            );

            currentApplicationId =
                null;

        }

    }
);


/* =====================================================
   ACCEPT
===================================================== */

acceptButton.addEventListener(
    "click",
    async function() {

        await updateApplicationStatus(
            "accepted"
        );

    }
);


/* =====================================================
   REJECT
===================================================== */

rejectButton.addEventListener(
    "click",
    async function() {

        await updateApplicationStatus(
            "rejected"
        );

    }
);


/* =====================================================
   UPDATE STATUS
===================================================== */

async function updateApplicationStatus(
    status
) {

    if (!currentApplicationId) {

        return;
    }


    try {

        await updateDoc(
            doc(
                db,
                "applications",
                currentApplicationId
            ),
            {
                status:
                    status
            }
        );


        applicationModal.classList.remove(
            "active"
        );


        currentApplicationId =
            null;


    } catch (error) {

        console.error(
            "Status update error:",
            error
        );

        alert(
            "Unable to update application."
        );

    }

}


/* =====================================================
   DELETE APPLICATION
===================================================== */

deleteButton.addEventListener(
    "click",
    async function() {

        if (!currentApplicationId) {

            return;
        }


        const confirmed =
            confirm(
                "Are you sure you want to permanently delete this application?"
            );


        if (!confirmed) {

            return;
        }


        try {

            await deleteDoc(
                doc(
                    db,
                    "applications",
                    currentApplicationId
                )
            );


            applicationModal.classList.remove(
                "active"
            );


            currentApplicationId =
                null;


        } catch (error) {

            console.error(
                "Delete error:",
                error
            );

            alert(
                "Unable to delete application."
            );

        }

    }
);


/* =====================================================
   FORMAT DATE
===================================================== */

function formatDate(
    timestamp
) {

    if (!timestamp) {

        return "Date unavailable";

    }


    try {

        return timestamp
            .toDate()
            .toLocaleString();

    } catch {

        return "Date unavailable";

    }

}


/* =====================================================
   AUTH ERROR
===================================================== */

function getAuthErrorMessage(
    error
) {

    if (
        error.code ===
        "auth/popup-closed-by-user"
    ) {

        return "Google sign-in was cancelled.";

    }


    if (
        error.code ===
        "auth/popup-blocked"
    ) {

        return "Your browser blocked the Google login popup.";

    }


    if (
        error.code ===
        "auth/unauthorized-domain"
    ) {

        return "This website domain is not authorized in Firebase.";

    }


    return (
        error.message ||
        "Google login failed."
    );

}