$(document).on("pagebeforeshow", "#login", Login.initView);
$(document).on("pagebeforeshow", "#searchPatient", Patients.initView);
$(document).on("pagebeforeshow", "#patientDetail", PatientDetail.initView);
$(document).on("pagebeforeshow", "#requirements", Requirement.initView);
$(document).delegate("#searchPatient", "pageinit", Patients.init).delegate("#login", "pageinit", Login.init).delegate("#patientDetail", "pageinit", PatientDetail.init).delegate("#requirements", "pageinit", Requirement.init);
$(document).on("pageshow", "#login", function() {
    console.log("pageshow login");
    $("#username").focus();
    return false;
});
$(document).on("pageshow", "#searchPatient", function() {
    console.log("pageshow patientsearch");
    $("#patientSearch").select();
    $("#patientSearch").focus();
    return false;
});
$(document).on("pageshow", "#patientDetail", function() {
    console.log("pageshow patientdetails");
    $("#patRoom").focus();
    return false;
});
$(document).on("pageshow", "#requirements", function() {
    $("#medSearch").select();
    $("#medSearch").focus();
    return false;
});