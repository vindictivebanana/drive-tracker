/* eslint-disable indent, max-len, no-unused-vars, no-var, object-curly-spacing, quotes, require-jsdoc, space-before-blocks, space-before-function-paren */
let timeStarted;
let currentTime;
let currentNight;
let currentMS;
class TabManager {
    start() {
        this._switchTabs('start-tab');
        fabIcon.innerText = 'play_arrow';
        document.getElementById('share').hidden = true;
        document.getElementById('closeButton').hidden = false;
        if ((new Date).getHours < 5 || (new Date).getHours > 21) {
            var predictedTime = 'night';
        } else {
            var predictedTime = 'day';
        }
        if (timeChips.selectedChipIds.indexOf(predictedTime) == -1) {
            document.getElementById(predictedTime).click();
        }
        document.getElementById('printButton').hidden = true;
        standardFab.onclick = function () {
            view.timer(timeChips.selectedChipIds.indexOf('night') != -1, false);
        };
    }
    timer(night, continued) {
        this._switchTabs('timer-tab');
        document.getElementById('share').hidden = true;
        document.getElementById('printButton').hidden = true;
        document.getElementById('speedButton').hidden = false;
        document.getElementById('closeButton').hidden = false;
        standardFab.classList.add('mdc-fab--exited');
        document.getElementById('stopFab').classList.remove('mdc-fab--exited');
        timer.start(continued);
        if (night) {
            localStorage.setItem('timerNight', true);
            if (localStorage.getItem('darkMode') != 'true') {
                document.querySelector('html').classList.add('night');
            }
        } else {
            localStorage.setItem('timerNight', false);
        }
    }
    ended() {
        if (localStorage.getItem('darkMode') != 'true') {
            document.querySelector('html').classList.remove('night');
        }
        this._switchTabs('end-tab');
        document.getElementById('printButton').hidden = true;
        document.getElementById('speedButton').hidden = true;
        standardFab.classList.remove('mdc-fab--exited');
        fabIcon.innerHTML = 'save';
        standardFab.onclick = timer.save
        document.getElementById('stopFab').classList.add('mdc-fab--exited');
        comment.value = '';
    }
    home() {
        this._switchTabs('home-tab');
        document.getElementById('printButton').hidden = false;
        document.getElementById('speedButton').hidden = true;
        document.getElementById('share').hidden = false;
        document.getElementById('closeButton').hidden = true;
        fabIcon.innerHTML = 'play_arrow';
        if ((new Date).getHours < 5 || (new Date).getHours > 21) {
            var predictedTime = 'night';
        } else {
            var predictedTime = 'day';
        }
        if (timeChips.selectedChipIds.indexOf(predictedTime) == -1) {
            document.getElementById(predictedTime).click();
        }
        standardFab.onclick = function () {
            view.start();
        };
        fabIcon.innerHTML = 'timer';
        standardFab.classList.remove('mdc-fab--exited');
        stopFab.classList.add('mdc-fab--exited');
        homeData();
    }
    showOnboarding() {
        this._switchTabs('onboard-tab');
        standardFab.classList.add('mdc-fab--exited');
        fabIcon.innerHTML = 'done';
        loadStates();
        standardFab.onclick = function () {
            finishSetup();
        };
    }
    _switchTabs(tabId) {
        setTimeout(() => {
            this.isAnimating = true;
            var oldTab = document.querySelector('.tab:not([hidden])');
            var newTab = document.getElementById(tabId);
            oldTab.classList.add('tab--hiding');
            newTab.hidden = false;
            newTab.classList.add('tab--appearing');
            setTimeout(function () {
                view.isAnimating = false;
                oldTab.hidden = true;
                oldTab.classList.remove('tab--hiding');
                newTab.classList.remove('tab--appearing');
            }, 300);
        }, ((this.isAnimating) ? 300 : 0));
    }
}

const view = new TabManager;

const SKILLS = [
    { id: "construction", icon: "construction", name: "Construction" },
    { id: "reversepark", icon: "local_parking", name: "Reverse Parking" },
    { id: "parallelpark", icon: "local_parking", name: "Parallel Parking" },
    { id: "pullpark", icon: "local_parking", name: "Pull-In Parking" },
    { id: "roundabouts", icon: "cached", name: "Roundabouts" },
    { id: "highways", icon: "speed", name: "Highways & Merging" },
    { id: "city", icon: "traffic", name: "City Driving" },
    { id: "winter", icon: "ac_unit", name: "Slippery Conditions" },
    { id: "bikelanes", icon: "bike_scooter", name: "Bike Lanes" },
    { id: "emergency", icon: "warning", name: "Emergency Vehicles" },
];

const timer = {
    "start": function (continued) {
        var html = document.getElementById("timer");
        html.innerHTML = "00:00:00";
        timer.update(html);
        document.getElementById('tip').innerHTML = DRIVING_TIPS[Math.floor(Math.random() * DRIVING_TIPS.length)];
        if (!continued) {
            currentMS = 0;
            timeStarted = new Date;
            localStorage.setItem('timerStartTime', timeStarted.toString());
            currentTime = [0, 0, 0];
        }
    },
    "update": function (html) {
        setTimeout(function () {
            var difference = timer.format(Date.parse((new Date).toUTCString()) - Date.parse(timeStarted.toUTCString()));
            html.innerHTML = timePrintLayout(difference).join(':');
            timer.update(html);
            currentTime = difference;
            currentMS = (Date.parse((new Date).toUTCString()) - Date.parse(timeStarted.toUTCString()));
        }, 1000);
    },
    "format": function (ms) {
        var s = Math.floor(ms / 1000);
        var m = Math.floor(s / 60);
        var s = s % 60;
        var h = Math.floor(m / 60);
        var m = m % 60;
        return [h, m, s];
    },
    "stop": function (isDiscarded) {
        (isDiscarded) ? console.log("discarded") : view.ended();
        var endTime = currentTime;
        document.getElementById('endTime').innerHTML = timePrintLayout(endTime).join(':');
        localStorage.removeItem("timerStartTime");
        localStorage.removeItem("timerNight");
        if (speedometerInstance) {
            speedometerInstance.stop();
        }
    },
    "save": function () {
        if (localStorage.getItem("drivingLog") != null) {
            var log = JSON.parse(localStorage.getItem("drivingLog"));
        } else {
            var log = [];
        }
        var thisTrip = {};
        thisTrip.time = currentTime;
        thisTrip.skills = hazardChips.selectedChipIds;
        thisTrip.comment = comment.value;
        thisTrip.night = currentNight;
        thisTrip.date = (new Date).toString();
        thisTrip.ms = currentMS;
        log.push(thisTrip);
        localStorage.setItem('drivingLog', JSON.stringify(log));
        snackbar.labelText = "Your drive was saved.";
        snackbar.open();
        view.home();
    },
};

function printLog() {
    if (localStorage.getItem("drivingLog") == null) {
        snackbar.labelText = 'There isn\'t anything on your log. You can\'t print it.';
        snackbar.open();
        return "error";
    }
    var log = JSON.parse(localStorage.getItem("drivingLog"));
    var hours = JSON.parse(localStorage.getItem('hours'));
    var totalHours = getTotalTime()[0];
    var nightHours = getTotalTime()[1];

    var rows = '';
    for (var i = 0; i < log.length; i++) {
        var entry = log[i];
        var skillNames = entry.skills.map(function(id) {
            var match = SKILLS.find(function(s) { return s.id === id; });
            return match ? match.name : id;
        }).join(', ') || '—';
        rows += '<tr>' +
            '<td>' + entry.time.join(':') + '</td>' +
            '<td>' + (new Date(entry.date)).toLocaleDateString() + '</td>' +
            '<td>' + (entry.night ? 'Yes' : 'No') + '</td>' +
            '<td>' + skillNames + '</td>' +
            '<td>' + (entry.comment || '—') + '</td>' +
            '</tr>';
    }
    var html = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Driving Log</title>' +
        '<style>' +
        'body{font-family:sans-serif;padding:20px;max-width:900px;margin:0 auto}' +
        'h1{font-size:1.5em;margin-bottom:4px}' +
        '.summary{margin-bottom:16px;font-size:0.95em;color:#444}' +
        'table{border-collapse:collapse;width:100%;font-size:0.9em}' +
        'th,td{border:1px solid #bbb;padding:7px 10px;text-align:left}' +
        'thead tr{background:#1a1a1a;color:#fff}' +
        'tr:nth-child(even){background:#f4f4f4}' +
        '.totals td{font-weight:bold;background:#e8e8e8}' +
        'button{margin-bottom:16px;padding:8px 16px;font-size:1em;cursor:pointer}' +
        '@media print{button{display:none}}' +
        '</style></head><body>' +
        '<h1>Driving Log</h1>' +
        '<div class="summary">' +
        'Total: <strong>' + timePrintLayout(totalHours).join(':') + '</strong> of <strong>' + hours[0] + 'h</strong> required &nbsp;|&nbsp; ' +
        'Night: <strong>' + timePrintLayout(nightHours).join(':') + '</strong> of <strong>' + hours[1] + 'h</strong> required' +
        '</div>' +
        '<button onclick="window.print()">Print / Save as PDF</button>' +
        '<table><thead><tr>' +
        '<th>Driving Time</th><th>Date</th><th>At Night</th><th>Skills Practiced</th><th>Comment</th>' +
        '</tr></thead><tbody>' +
        rows +
        '<tr class="totals"><td colspan="5">' +
        'Total Driving: ' + timePrintLayout(totalHours).join(':') +
        ' &nbsp;|&nbsp; Total Night Driving: ' + timePrintLayout(nightHours).join(':') +
        '</td></tr>' +
        '</tbody></table></body></html>';

    var blob = new Blob([html], {type: 'text/html'});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'driving-log.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
const DRIVING_TIPS = ["Turn on Do Not Disturb to reduce distractions on the road.", "Try turning off driver assist features to become less dependent on these features.", "Stop driving if you feel tired", "Remember to buckle up!", "Feel free to exit the app. Your timer will stay here.", "Remember, you should look over your shoulder and fully move into a non-protected bike lane before turning right.", "Remember, your car is a wrecking ball on wheels. Control it wisely, safely, and responsibly."];
function getTotalTime() {
    if (localStorage.getItem('drivingLog') != null) {
        var totalHours = 0;
        var nightHours = 0;
        var log = JSON.parse(localStorage.getItem('drivingLog'));
        for (var i = 0; i < log.length; i++) {
            totalHours += log[i].ms;
            if (log[i].night) {
                nightHours += log[i].ms;
            }
        }
        totalHours = timer.format(totalHours);
        nightHours = timer.format(nightHours);
        return [totalHours, nightHours];
    } else {
        return [[0, 0, 0], [0, 0, 0]];
    }
}
function homeData() {
    var allTime = getTotalTime();
    var hours = JSON.parse(localStorage.getItem('hours'));
    if (allTime[0][0] >= hours[0] && allTime[1][0] >= hours[1]) {
        document.getElementById('welcome-text').innerHTML = "You've finished your hours!";
    } else if (allTime[0][0] >= hours[0]) {
        document.getElementById('welcome-text').innerHTML = "You Have " + allTime[1][0] + " Night Hours<br><p style='font-size:14px;' class='text-muted'>Finish up your night hours!</p>";
    } else if (allTime[0][0] != 0) {
        document.getElementById('welcome-text').innerHTML = "You've Driven " + allTime[0][0] + " Hours";
    } else if (allTime[0][1] != 0) {
        document.getElementById('welcome-text').innerHTML = "You've Driven " + allTime[0][1] + " Minutes";
    } else if (allTime[0][2] != 0) {
        document.getElementById('welcome-text').innerHTML = "You've Driven " + allTime[0][2] + " Seconds";
    } else {
        document.getElementById('welcome-text').innerHTML = "No Time Logged";
    }
    document.getElementById('night-card-text').innerHTML = allTime[1][0] + "/" + hours[1] + " Hours Completed";
    document.getElementById('general-card-text').innerHTML = allTime[0][0] + "/" + hours[0] + " Hours Completed";
    document.getElementById('welcome-text').innerHTML += '<p style="font-size:1rem">Press <i class="material-icons align-bottom">timer</i> to start a drive</p>';
    if (localStorage.getItem('drivingLog') != null) {
        var log = JSON.parse(localStorage.getItem('drivingLog'));
        var skillCount = {};
        var allSkills = [];
        for (var drive of log) {
            for (var skill of drive.skills) {
                if (allSkills.indexOf(skill) == -1) {
                    allSkills.push(skill);
                }
                if (!skillCount[skill]) {
                    skillCount[skill] = 0;
                }
                skillCount[skill]++;
            }
        }
        document.getElementById('skill-card-text').innerHTML = Object.keys(allSkills).length + '/' + SKILLS.length + ' Skills Practiced';
        document.getElementById('skillList').innerHTML = '';
        for (var i = 0; i < SKILLS.length; i++) {
            if (skillCount[SKILLS[i].id]) {
                document.getElementById('skillList').innerHTML += '<li class="mdc-list-item" tabindex="0"> <span class="mdc-list-item__ripple"></span> <span class="mdc-list-item__graphic material-icons" aria-hidden="true">' + SKILLS[i].icon + '</span><span class="mdc-list-item__text"><span class="mdc-list-item__primary-text">' + SKILLS[i].name + '</span> <span class="mdc-list-item__secondary-text">Practiced ' + skillCount[SKILLS[i].id] + ' Time' + ((skillCount[SKILLS[i].id] == 1) ? "" : "s") + '</span></span></li>';
            } else {
                document.getElementById('skillList').innerHTML += '<li class="mdc-list-item" tabindex="0"> <span class="mdc-list-item__ripple"></span> <span class="mdc-list-item__graphic material-icons" aria-hidden="true">' + SKILLS[i].icon + '</span><span class="mdc-list-item__text"><span class="mdc-list-item__primary-text">' + SKILLS[i].name + '</span><span class="mdc-list-item__secondary-text">Never Practiced</span></li>';
            }
        }
    } else {
        document.getElementById('skill-card-text').innerHTML = "0/" + SKILLS.length + " Skills Practiced";
        document.getElementById('skillList').innerHTML = '';
        for (var i = 0; i < SKILLS.length; i++) {
            document.getElementById('skillList').innerHTML += '<li class="mdc-list-item" tabindex="0"> <span class="mdc-list-item__ripple"></span> <span class="mdc-list-item__graphic material-icons" aria-hidden="true">' + SKILLS[i].icon + '</span><span class="mdc-list-item__text"><span class="mdc-list-item__primary-text">' + SKILLS[i].name + '</span> <span class="mdc-list-item__secondary-text">Never Practiced</span></span></li>';
        }
    }
}
function timePrintLayout(time) {
    var output = [];
    for (var i = 0; i < time.length; i++) {
        var formattedNumber = ("0" + time[i]).slice(-2);
        output.push(formattedNumber);
    }
    return output;
}
function loadStates() {
    $.getScript("assets/setup.js", function () {
        console.log(states);
        var list = document.getElementById('stateSelectList');
        for (var i = 0; i < states.length; i++) {
            list.innerHTML += '<li class="mdc-list-item" aria-selected="false" data-value="' + i + '" role="option"><span class="mdc-list-item__ripple"></span><span class="mdc-list-item__text">' + states[i].name + '</span></li>';
        }
    });
}
function expandCard(element) {
    $header = $(element);
    $comments = $header.contents('.expandable');
    $comments.slideToggle(200);
}
function discardTimer() {
    if (!(document.getElementById("timer-tab").hidden)) {
        timer.stop(true);
    }
    view.home();
}
function manualSave(element, night) {
    var saveObject = {};
    element.querySelector('small').innerHTML = "";
    saveObject.time = [];
    if (night) {
        var type = "night";
    } else {
        var type = "day";
    }
    for (var i = 0; i < manualFields[type].length; i++) {
        var field = manualFields[type][i];
        if (field.valid) {
            if (field.root.id == 'comment') {
                saveObject.comment = field.value;
            } else {
                if (field.value == "") {
                    field.value = "0";
                }
                saveObject.time.push(parseInt(field.value));
            }
        } else {
            element.querySelector('small').innerHTML += "<br>Something didn't work. Make sure everything is valid.";
            return 'Invalid Values';
        }
    }
    saveObject.ms = (+saveObject.time[0] * (60000 * 60)) + (+saveObject.time[1] * 60000);
    saveObject.time.push(0);
    saveObject.night = night;
    saveObject.skills = [];
    saveObject.date = (new Date).toString();
    if (localStorage.getItem("drivingLog") != null) {
        var log = JSON.parse(localStorage.getItem("drivingLog"));
    } else {
        var log = [];
    }
    log.push(saveObject);
    localStorage.setItem('drivingLog', JSON.stringify(log));
    snackbar.labelText = "Your Drive was Saved";
    snackbar.open();
    homeData();
}
function openShareMenu() {
    menu.open = true;
    if (navigator.share) {
        menu.items[1].hidden = false;
    }
}
function jsShare() {
    navigator.share({
        title: "I've driven " + getTotalTime()[0][0] + " student driving hours!",
        text: "I've driven a total of " + getTotalTime()[0][0] + " hours, including " + getTotalTime()[1][0] + " night hours.",
    });
}
function exportData(el) {
    if (localStorage.getItem('drivingLog') != null) {
        if (['iPad', 'iPhone', 'iPod'].includes(navigator.platform) && navigator.clipboard) {
            navigator.clipboard.writeText(localStorage.getItem("drivingLog")).then(function () {
                snackbar.labelText = 'Your driving log was copied to your clipboard. Save it in the notes app.';
                snackbar.actionEl_.hidden = false;
                snackbar.open();
                setTimeout(function () {
                    snackbar.actionEl_.hidden = true;
                }, (snackbar.timeoutMs + 1000));
                return;
            }).catch(function (err) {
                console.log(err);
            });
        }
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(localStorage.getItem("drivingLog"));
        el.setAttribute("href", dataStr);
        el.setAttribute("download", "drivingLog.json");
    } else {
        snackbar.labelText = "You can't export a log with nothing on it.";
        snackbar.open();
    }
}
function deleteData() {
    var confirmed = window.confirm("Are you sure you want to DELETE your log and all other data? This action can't be undone unless you have a backup.");
    if (confirmed) {
        localStorage.clear();
        location.reload();
    }
}
class InstallPrompt {
    constructor(deferredPrompt) {
        this.deferredPrompt = deferredPrompt;
    }
    show() {
        snackbar.labelText = "";
        if (!InstallPrompt.isIOS()) {
            snackbar.labelText = "Want to install the app? Open Settings";
            document.getElementById('installItem').hidden = false;
        }
        snackbar.open();
        if (InstallPrompt.isIOS()) {
            snackbar.labelEl_.innerHTML = 'Want to install the app? Press <i class="material-icons align-bottom">ios_share</i> then click <i class="material-icons align-bottom">add_box</i> "Add to Home Screen"';
        }
    }
    install() {
        this.deferredPrompt.prompt();
    }
    static isIOS() {
        return !(('standalone' in window.navigator) && (window.navigator.standalone)) && ['iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'].includes(navigator.platform);
    }
}
var installPrompt;
window.addEventListener('beforeinstallprompt', (event) => {
    installPrompt = new InstallPrompt(event);
    installPrompt.show();
});
var goalSetter;
var newInputs;
function setNewGoal() {
    if (document.getElementById('newGoalSetter') == null) {
        var dialog = document.getElementById('newGoalSetterWrapper');
        dialog.innerHTML += '<div class="mdc-dialog" id="newGoalSetter"><div class="mdc-dialog__container"><div class="mdc-dialog__surface" role="alertdialog" aria-modal="true"><div class="mdc-dialog__content" id="my-dialog-content"> Setting a New Hour Goal<br><div class="hourrow"> <label class="mdc-text-field mdc-text-field--filled hour-input"> <span class="mdc-text-field__ripple"></span> <input class="mdc-text-field__input" type="number"> <span class="mdc-floating-label" id="my-label-id">Total Hours</span> <span class="mdc-line-ripple"></span> </label> <label class="mdc-text-field mdc-text-field--filled hour-input"> <span class="mdc-text-field__ripple"></span> <input class="mdc-text-field__input" type="number"> <span class="mdc-floating-label" id="my-label-id">Night Hours</span> <span class="mdc-line-ripple"></span> </label></div></div><div class="mdc-dialog__actions"> <button type="button" class="mdc-button mdc-dialog__button" data-mdc-dialog-action="cancel"><div class="mdc-button__ripple"></div> <span class="mdc-button__label">Cancel</span> </button> <button type="button" class="mdc-button mdc-button--raised mdc-dialog__button" onclick="saveNewHours()" data-mdc-dialog-action="exit"><div class="mdc-button__ripple"></div> <span class="mdc-button__label">Save</span> </button></div></div></div><div class="mdc-dialog__scrim"></div></div>';
        goalSetter = new mdc.dialog.MDCDialog(document.getElementById('newGoalSetter'));
        newInputs = [].map.call(dialog.querySelectorAll('.hour-input'), function (el) {
            return new mdc.textField.MDCTextField(el);
        });
    }
    settings.close();
    goalSetter.open();
}
const READOUT_UNITS = {
    mph: 2.23694,
    kmh: 3.6,
};
class Speedometer {
    static readoutUnits = {
        mph: 2.23694,
        kmh: 3.6,
    };
    static noSleepLoaded = false;
    currentUnit = "kmh";
    constructor(root) {
        this.root = root;
    };
    start(context) {
        if(!context){
            context=this;
        }
        const OPTIONS = {
            enableHighAccuracy: true,
        };
        if (navigator.language.split('-')[1] == "US") {
            context.currentUnit = "mph";
        }
        context.root.innerHTML = '<hr><h4>Speedometer</h4><p class=\'text-muted\'>Speed is approximate</p><h1 id=\'speed\'>...</h1><h5>' + this.currentUnit + '</h5><button class=\'mdc-button\' onclick=\'speedometerInstance.switchUnits(this)\'><span class=\'mdc-button__ripple\'></span><span class=\'mdc-button__text\'>Switch to ' + ((this.currentUnit == "mph") ? "km/h" : "mph") + '</span></button>';
        context.root.hidden = false;
        context.speedWatch = navigator.geolocation.watchPosition(context._update, null, OPTIONS);
        document.getElementById('speedButton').onclick = () => context.stop(context);
        if (!Speedometer.noSleepLoaded) {
            $.getScript("assets/nosleep.js", function () {
                context.noSleep = new NoSleep();
                context.noSleep.enable();
                Speedometer.noSleepLoaded = true;
                var noSleepButton = document.createElement('button');
                noSleepButton.innerHTML = '<span class=\'mdc-button__ripple\'></span><span class=\'mdc-button__text\'>Keep Screen On</span>';
                noSleepButton.classList.value = 'mdc-button mdc-button--raised';
                noSleepButton.onclick = function(){
                    speedometerInstance.noSleep.enable();
                    this.hidden = true;
                }
                speedometerInstance.root.appendChild(noSleepButton);
            });
        } else {
            context.noSleep.enable();
        }
        this.started = true;
    };
    stop(context) {
        if(!context){
            context=this;
        }
        context.root.hidden = true;
        navigator.geolocation.clearWatch(context.speedWatch);
        document.getElementById('speedButton').onclick = () => context.start(context);
        context.started = false;
        if (context.noSleep != null) {
            context.noSleep.disable();
        }
    };
    _update(position) {
        document.getElementById('speed').textContent = Math.round(
            position.coords.speed * READOUT_UNITS[speedometerInstance.currentUnit]);
    };
    started = false;
    switchUnits(text) {
        this.currentUnit = ((this.currentUnit == "mph") ? "kmh" : "mph");
        document.getElementById('speedometer').querySelector('h5').innerHTML = this.currentUnit;
        text.querySelector('.mdc-button__text').innerText = "Switch to " + ((this.currentUnit == "mph") ? "km/h" : "mph");
        document.getElementById('speed').innerHTML = "...";
    }
}

function saveNewHours() {
    var save = [];
    save.push(newInputs[0].value);
    save.push(newInputs[1].value);
    localStorage.setItem('hours', JSON.stringify(save));
    homeData();
}

function toggleAlwaysNight() {
    if (localStorage.getItem("darkMode") == "true") {
        localStorage.setItem("darkMode", "false");
        darkModeSwitch.checked = false;
        document.querySelector('html').classList.remove('night');
    } else {
        localStorage.setItem("darkMode", "true");
        darkModeSwitch.checked = true;
        document.querySelector('html').classList.add('night');
    }
}

function _generateSkillChips() {
    for (var i = 0; i < SKILLS.length; i++) {
        var chipEl = document.createElement('div');
        chipEl.classList.add('mdc-chip');
        chipEl.id = SKILLS[i].id;
        chipEl.innerHTML = '<div class="mdc-chip__ripple"></div> <i class="material-icons mdc-chip__icon mdc-chip__icon--leading">' + SKILLS[i].icon + '</i> <span class="mdc-chip__checkmark" > <svg class="mdc-chip__checkmark-svg" viewBox="-2 -3 30 30"> <path class="mdc-chip__checkmark-path" fill="none" stroke="black" d="M1.73,12.91 8.1,19.28 22.79,4.59"/> </svg> </span> <span role="gridcell"> <span role="checkbox" tabindex="0" aria-checked="false" class="mdc-chip__primary-action"> <span class="mdc-chip__text">' + SKILLS[i].name + '</span> </span> </span>';
        hazardChips.root.appendChild(chipEl);
        hazardChips.addChip(chipEl);
    }
}

var speedometerInstance;

function startSpeedometer() {
    if (!speedometerInstance) {
        speedometerInstance = new Speedometer(document.getElementById("speedometer"));
    }
    speedometerInstance.start();
}

document.addEventListener("keypress", (e) =>{
    if(e.key == "Enter"){
        e.preventDefault();
        document.querySelector(".mdc-fab:not(.mdc-fab--exited)").onclick();
    }
})
