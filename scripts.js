function fetch_data() {
    const request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            const form_data = JSON.parse(this.response);
            add_data(form_data)
        }
    };
    request.open("GET", "/page_data");
    request.send();
}

function add_data(form_data) {
    let appsDiv = document.getElementById("appointments-div");
    let appsButton = document.getElementById("apps-button");
    let about_us = document.getElementById('about-us-p');
    let donations = document.getElementById('donations-p');
    let appointments = document.getElementById('appointments-p');
    let volunteering = document.getElementById('volunteering-p');
    let about_us_raw = document.getElementById('about-us-raw');
    let donations_raw = document.getElementById('donations-raw');
    let appointments_raw = document.getElementById('appointments-raw');
    let volunteering_raw = document.getElementById('volunteering-raw');
    let AppsBool = form_data['showAppsBool'];
    if (about_us !== null) {
        about_us.innerHTML = form_data['about_us_data']
    }
    if (donations !== null) {
        donations.innerHTML = form_data['donations_data']
    }
    if (appointments !== null) {
        appointments.innerHTML = form_data['appointments_data']
    }
    if (volunteering !== null) {
        volunteering.innerHTML = form_data['volunteering_data']
    }
    if (about_us_raw !== null) {
        about_us_raw.innerText = form_data['about_us_data']
    }
    if (donations_raw !== null) {
        donations_raw.innerText = form_data['donations_data']
    }
    if (appointments_raw !== null) {
        appointments_raw.innerText = form_data['appointments_data']
    }
    if (volunteering_raw !== null) {
        volunteering_raw.innerText = form_data['volunteering_data']
    }
    if (appsDiv !== null && appsButton !== null) {
        if (AppsBool === "Yes") {
            appsDiv.style.display = "block";
            appsButton.style.display = "inline-block";
        }
    }
}

function check_accounts() {
    const request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            const form_data = JSON.parse(this.response);
            add_form(form_data)
        }
    };
    request.open("GET", "/check_account");
    request.send();
}

function add_form(form_data) {
    if (form_data['accounts'] === 0) {
        let div = document.getElementById('Register')
        div.innerHTML = "<form method='post' action='/register'>" +
            "<label for='username'>Username</label>" +
            "<input type='text' id='username' name='username'>" +
            "<br/>" + "<label for='password'>Password</label>" +
            "<input type='password' id='password' name='password'>" +
            "<br/>" + "<button type='submit'>Register</button>" +
            "</form>"
    }
}