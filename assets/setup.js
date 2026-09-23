var states =[
    {name:"Alabama", total:50, night:0}, {name:"Alaska", total:40, night:10, "message":"Night Driving counts as driving in \"Challenging Circumstances\". Use night mode to track these circumstances."}, {name:"Arizona", total:30, night:10}, {name:"Arkansas", total:0, night:0, "message":"Arkansas has no time requirements. You can set your own goal above or do it later in Settings."}, {name:"California", total:50, night:10}, {name:"Colorado", total:50, night:10},  {name:"Connecticut", total:40, night:0}, {name:"Delaware", total:50, night:10}, {name:"Florida", total:50, night:10}, {name:"Georgia", total:40, night:6}, {name:"Hawaii", total:50, night:10, "message":"Hawaii has different requirements for each island. Look up the drivers manual for your island and add the times above."}, {name:"Idaho", total:50, night:10}, {name:"Illinois", total:50, night:10},{name:"Indiana", total:50, night:10},{name:"Iowa", total:20, night:2},{name:"Kansas", total:50, night:10},{name:"Kentucky", total:60, night:10}, {name:"Louisiana", total:50, night:15, "message":"In Louisiana, to get a permit, you must practice for 8 hours. This app will track the 50 hours required to get a license unless you specify different hours above."}, {name:"Maine", total: 70, night:10}, {name:"Maryland", total: 60, night:10}, {name:"Massachusetts", total: 40, night:0}, {name:"Michigan", total: 50, night:10}, {name:"Minnesota", total: 50, night:15, "message":"If the parent has completed the parent class, the reqirements are 40 hours with 15 night hours."}, {name:"Mississippi", total: 0, night:0, "message":"Mississippi doesn't have any time requirements. You can set your own goal above or do it later in Settings."}, {name:"Missouri", total: 40, night:10}, {name:"Montana", total: 50, night:10}, {name:"Nebraska", total: 50, night:10}, {name:"Nevada", total: 50, night:10, message:"If you were unable to take a driver's education class, either online or in person, the time requirements are 100 hours with 10 night hours"}, {name:"New Hampshire", total: 40, night:10}, {name:"New Jersey", total: 0, night:0, message:"There are no time requirements for New Jersey. You can set your own goal above or do it later in Settings."}, {name:"New Mexico", total: 50, night:10}, {name:"New York", total: 50, night:15, message:"New York recommends driving 10 hours in heavy traffic. Also, it is required to install a passenger brake."}, {name:"North Carolina", total: 60, night:10}, {name:"North Dakota", total: 50, night:0, message:"This 50-hour goal applies to drivers under age 16. There is no set hour requirement for older permit holders, and no night driving requirement. You can set your own goal in Settings."},  {name:"Ohio", total:50, night:10}, {name:"Oklahoma", total:50, night:10, message:"This will measure parent taught driving. You can set a different goal above if needed."}, {name:"Oregon", total:50, night:0, message:"This will set the goal to 50 hours, but if you didn't take a drivers education course, the requirement is 100 hours"}, {name:"Pennsylvania", total:65, night:10}, {name:"Rhode Island", total:50, night:10}, {name:"South Carolina", total:40, night:10}, {name:"South Dakota", total:50, night:10, message:"South Dakota also requires 10 hours of driving in bad weather, on top of the night hours above."}, {name:"Tennessee", total:50, night:10}, {name:"Texas", total:30, night:10}, {name:"Utah", total:40, night:10}, {name:"Vermont", total:40, night:10}, {name:"Virginia", total:45, night:15}, {name:"Washington State", total:50, night:10}, {name:"West Virginia", total:50, night:10}, {name:"Wisconsin", total:30, night:10}, {name:"Wyoming", total:50, night:10}
]

document.addEventListener("MDCSelect:change", function(index){
    if(states[stateSelect.selectedIndex].message){
        document.getElementById('setupMessage').innerHTML= states[stateSelect.selectedIndex].message
    }else{
        document.getElementById('setupMessage').innerHTML= ""
    }
    fabCheck()
})
setupInputs[1].root.addEventListener("input", function(){
    fabCheck()
})
setupInputs[0].root.addEventListener("input", function(){
    fabCheck()
})

function fabCheck(){
    var blank =2;
    $.each(setupInputs, function(index){
        var value=setupInputs[index]
        if(value.value !="" && !isNaN(value.value)){
            blank--
        }
    })
    if(blank==0){
        standardFab.classList.remove('mdc-fab--exited')
    }else if(stateSelect.selectedIndex != -1){
        standardFab.classList.remove('mdc-fab--exited')
    }else{
        standardFab.classList.add('mdc-fab--exited')
    }
}
function finishSetup(){
    var hours = []
    if(setupInputs[0].value != "" && setupInputs[1].value != ""){
        hours = [parseInt(setupInputs[0].value), parseInt(setupInputs[1].value)];
    }else if(stateSelect.selectedIndex != -1){
        hours =  [states[stateSelect.selectedIndex].total, states[stateSelect.selectedIndex].night];
    }
    localStorage.setItem('hours', JSON.stringify(hours))
    localStorage.setItem('setUp', true)
    view.home()
}

var importJSON;
function importData(){
    if(document.getElementById('importJSON') == null){
        var dialog = document.getElementById('importJSONWrapper')
        dialog.innerHTML += '<div class="mdc-dialog" id="importJSON"><div class="mdc-dialog__container"><div class="mdc-dialog__surface" role="alertdialog" aria-modal="true"><div class="mdc-dialog__content" id="my-dialog-content"> Importing Data<br><p>Upload the drivingLog.json that you downloaded when you exported your data.</p><br><input type="file" accept="application/json" id="importInput"><br><br><h6>Importing from an iOS device? <a href="about.html#help">(Help)</a></h6><input id="importText" placeholder="Paste the copied JSON text" style="background-color:var(--dark-theme-text-input); width: 100%;"></div><div class="mdc-dialog__actions"> <button type="button" class="mdc-button mdc-dialog__button" data-mdc-dialog-action="cancel"><div class="mdc-button__ripple"></div> <span class="mdc-button__label">Cancel</span> </button> <button type="button" class="mdc-button mdc-button--raised mdc-dialog__button" onclick="importUploaded()" data-mdc-dialog-action="exit"><div class="mdc-button__ripple"></div> <span class="mdc-button__label">Import</span> </button></div></div></div><div class="mdc-dialog__scrim"></div></div>'
        importJSON = new mdc.dialog.MDCDialog(document.getElementById('importJSON'));
    }
    importJSON.open()
}
function importUploaded(){
    var log;
    if(document.getElementById('importInput').files[0]&&document.getElementById('importInput').files[0].type == 'application/json'){
        const objectURL = window.URL.createObjectURL(document.getElementById('importInput').files[0]);
        $.getJSON( objectURL, function( data ) {
            log = data;
            localStorage.setItem('drivingLog', JSON.stringify(log))
            snackbar.labelText = "Your log has been imported. Put in your hours to finish setup"
            snackbar.open()
        });
    }else{
        var input= document.getElementById("importText")
        try{
            //Test inputted JSON text, if
            log = JSON.parse(input.value)
            log = JSON.stringify(log)
            localStorage.setItem('drivingLog', log)
            snackbar.labelText = "Your log has been imported. Put in your hours to finish setup"
            snackbar.open()
        }catch(err){
            window.alert("The text you inputted is not a valid driving log. Technical details: "+err)
        }
    }
}
