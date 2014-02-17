$(document).on("pagebeforeshow", "#login", Login.initView);
$(document).on("pagebeforeshow", "#searchPatient", Patients.initView);
$(document).on("pagebeforeshow", "#patientDetail", PatientDetail.initView);
$(document).on("pagebeforeshow", "#requirements", Requirement.initView);
$(document).delegate("#searchPatient", "pageinit", Patients.init).delegate("#login", "pageinit", Login.init).delegate("#patientDetail", "pageinit", PatientDetail.init).delegate("#requirements", "pageinit", Requirement.init);
$(document).on("pageshow", "#login", function() {
    $("#username").focus();
    plugins.SoftKeyBoard.show(function () {
        alert("success");
    },function () {
       alert("Fail");
    });
});
$(document).on("pageshow", "#searchPatient", function() {
    $("#patientSearch").select();
    $("#patientSearch").focus();
});
$(document).on("pageshow", "#patientDetail", function() {
    $("#patRoom").focus();
});
$(document).on("pageshow", "#requirements", function() {
    $("#medSearch").select();
    $("#medSearch").focus();
});