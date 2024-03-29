var nameArrayElements = ['led_led', 'led_brightness', 'led_mode', 'water_wateringinfo', 'water_lastwatering', 'water_time', 'water_alarm_1'];

// Stores if the endpoint (the watering system) is online
let systemOnline = true;

const setupUI = (user) => {
    if(!user) return;

    $("#user-details").html(user.email);

    $("#login-form").hide(400, function(){
        $("#username_header").show(400);
        $("#main_page").show(400);
    });

    database.ref('water/now').on('value', (snapshot) => {
        let value = snapshot.val();
        if(value == 'on'){
            changeWaterNowInterface(true);
        }else if(value == 'off'){
            changeWaterNowInterface(false);
        }
    }, (errorObject) => {
        console.log('The read failed: ' + errorObject.name);
    });

    database.ref('led/presence').on('value', (snapshot) => {
        let value = snapshot.val();
        $('input[value=true][name=led_presence]').prop("checked", value);  // This should be the On button.
        $('input[value=false][name=led_presence]').prop("checked", !value);  // This should be the On button.
        $("input[type='radio']").checkboxradio("refresh");
        if(value){
            $('#led_presencetime_div').show(400);
        }else{
            $('#led_presencetime_div').hide(400);
        }
    }, (errorObject) => {
        console.log('The read failed: ' + errorObject.name);
    });

    database.ref('deposit/level').on('value', (snapshot) => {
        let value = +snapshot.val();
        $('#span[name=deposit_level]').html(value.toFixed(2));
        let liters = value*28.5/100;
        $('#span[name=deposit_level_liters]').html(liters.toFixed(2));
        if(value > 10){
            $('#span[name=deposit_level]').css('background', 'none');
        }else{
            $('#span[name=deposit_level]').css('background', 'red');
        }
    }, (errorObject) => {
        console.log('The read failed: ' + errorObject.name);
    });

    database.ref('messages').on('value', (snapshot) => {
        let value = snapshot.val();
        if(value == 'im_online'){
            systemOnline = true;
            database.ref('messages').set("none");
        }
    }, (errorObject) => {
        console.log('The read failed: ' + errorObject.name);
    });

    database.ref('led/presencereading').on('value', (snapshot) => {
        let value = snapshot.val();
        if(value){
            $("#presence_sensor_dot").attr("value", "on");
        }else{
            $("#presence_sensor_dot").attr("value", "off");
        }
    }, (errorObject) => {
        console.log('The read failed: ' + errorObject.name);
    });

    for(let i = 0; i < nameArrayElements.length; i++){
        let name = nameArrayElements[i];
        
        let split = name.indexOf('_');
        let id1 = name.substring(0, split);
        let id2 = name.substring(split+1, name.length);
        let serverPath = id1 + '/' + id2;

        database.ref(serverPath).on('value', (snapshot) => {
            let element = document.getElementsByName(nameArrayElements[i])[0];

            let value = snapshot.val();
            //console.log("Fetching from " + serverPath + " Value=" + value);
            if(element.value == ""){
                element.name = value;
            }else if(element.tagName == "SPAN"){
                $('#span[name='+nameArrayElements[i]+']').html(value);
            }else if(element.tagName == "SELECT"){
                $('select[name^='+nameArrayElements[i]+'] option[value='+value+']').attr('selected', 'selected');
                var el = $('select[name^='+nameArrayElements[i]+']');
                el.selectmenu('refresh', true);
            }else if(element.type == "checkbox"){
                $('#' + nameArrayElements[i]).prop("checked", value).checkboxradio("refresh");
                disableAlarmByName(nameArrayElements[i], value);
            }else{
                if(element.value == "true" || element.value == "false"){
                    $('input[value=true][name=' + nameArrayElements[i] + ']').prop("checked", value);  // This should be the On button.
                    $('input[value=false][name=' + nameArrayElements[i] + ']').prop("checked", !value);  // This should be the On button.
                    $("input[type='radio']").checkboxradio("refresh");
                }else{
                    element.value = value;
                    if(element.type == 'number'){ // This is a slider. 
                        $('#'+nameArrayElements[i]).slider('refresh');
                    }
                }
            }
        }, (errorObject) => {
            console.log('The read failed: ' + errorObject.name);
        });
    }
};

function disableAlarmByName(name, checked){
    if(checked) $('.timepicker[name=water_alarm_1]').parent().show('normal');
    else $('.timepicker[name=water_alarm_1]').parent().hide('normal');
}

function sendToServer(x){
    var split = x.name.indexOf('_');
    var id1 = x.name.substring(0, split);
    var id2 = x.name.substring(split+1, x.name.length);
    var serverDirection = id1+"/"+id2;

    if(x.value == ""){ // For single buttons
        setValueInServer(serverDirection, x.name);
    }else{
        if(x.type == "checkbox"){
            setValueInServer(serverDirection, x.checked);
        }else{
            if(x.value == "true"){
                setValueInServer(serverDirection, true);
            }else if(x.value == "false"){
                setValueInServer(serverDirection, false);
            }else{
                if(x.type == "number") setValueInServer(serverDirection, parseInt(x.value));
                else setValueInServer(serverDirection, x.value);
            }
        }   
    }
}

function setValueInServer(serverDirection, value){
    database.ref("updateVariable").set(serverDirection);
    database.ref(serverDirection).set(value);
}

function pollSystemStatus(){
    systemOnline = false;
    database.ref("updateVariable").set("you_online");
    setTimeout(() => {
        if(systemOnline){
            $("#riego_online_dot").attr("value", "on");
            $("#riego_online").html("ONLINE");
        }else{
            $("#riego_online_dot").attr("value", "off");
            $("#riego_online").html("OFFLINE");
        }
        database.ref("updateVariable").set("none");
    }, 5000);
}
pollSystemStatus();
setInterval(pollSystemStatus, 10000);