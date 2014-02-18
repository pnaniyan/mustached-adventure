var Application = {
    isAuthenticate: function() {
        return Store.isSet("user");
    },
    showMessage: function(e, t, n) {
        if (typeof n === "undefined") {
            n = false;
        }
        if (typeof t === "undefined") {
            t = "Error";
        }
        if (!n) {
            if (typeof navigator.notification !== "undefined") {
                navigator.notification.alert(e, function() {
                }, t);
            } else {
                var r;
                if (t === "Error") {
                    r = '<span class="ui-icon ui-icon-alert msg-icon"> </span>';
                    $.mobile.activePage.find(".error-message").addClass("error");
                } else if (t === "Success") {
                    r = '<span class="ui-icon ui-icon-check msg-icon"> </span>';
                    $.mobile.activePage.find(".error-message").addClass("success");
                }
                $.mobile.activePage.find(".error-message").html(r + e).slideDown(500);
            }
        } else {
            var r;
            if (t === "Error") {
                r = '<span class="ui-icon ui-icon-alert msg-icon"> </span>';
                $.mobile.activePage.find(".error-message").addClass("error");
            } else if (t === "Success") {
                r = '<span class="ui-icon ui-icon-check msg-icon"> </span>';
                $.mobile.activePage.find(".error-message").addClass("success");
            }
            $.mobile.activePage.find(".error-message").html(r + e).slideDown(500);
        }
    },
    hideMessage: function() {
        $.mobile.activePage.find(".error-message").removeClass("error").removeClass("success");
        $.mobile.activePage.find(".error-message").slideUp(500);
    },
    cancelRequirement: function() {
        Application.addNew();
    },
    addNew: function() {
        PatientDetail.patient = undefined;
        Requirement.required = {
            medicines: []
        };
        $.mobile.changePage("#searchPatient", {
            transition: "slide",
            reverse: false,
            changeHash: true
        });
    },
    refreshPatients: function(call) {
        Common.callAjax("getAllPatients", function(data) {
            Store.set("Patients", data['patients'], 0);
            call();
        }, "Refresing Patients");
    },
    refreshMedicines: function(call) {
        Common.callAjax("getAllMedicines", function(items) {
            Store.set("Medicines", items['medicines'], 0);
            call();
        }, "Refreshing Medicines");
    },
    refreshData: function(callBack) {
        Common.showLoading("Refreshing Data");
        Application.refreshMedicines(function() {
            Application.refreshPatients(function() {
                PatientDetail.populateDoctors(function() {
                    PatientDetail.populateRooms(callBack);
                });
            });
        });
    },
    clearData: function() {
        Store.clear("Medicines");
        Store.clear("Patients");
    },
    bindCommonEvents: function() {
        $(".navNew").off("tap");
        $(".navCancel").off("tap");
        $(".navLogout").off("tap");
        $(".navRefresh").off("tap");
        $(".navNew").on("tap", Application.addNew);
        $(".navCancel").on("tap", Application.addNew);
        $(".navLogout").on("tap", Application.logout);
        $(".navRefresh").on("tap", Application.refreshAppData);
    },
    refreshAppData: function() {
        Application.refreshData(function() {
            if (typeof Requirement.required.patient !== "undefined" || typeof PatientDetail.patient !== "undefined") {
                var p = Requirement.required.patient ? Requirement.required.patient : PatientDetail.patient;
                PatientDetail.initPatinet(p);
                PatientDetail.populateData();
            }
        });
    },
    logout: function() {
        PatientDetail.patient = undefined;
        Requirement.required = {
            medicines: []
        };
        Store.clear("user");
        Application.clearData();
        $.mobile.changePage("#login", {
            transition: "slide",
            reverse: true,
            changeHash: true
        });
        return false;
    }
};
Application.Config = {
    ajUrl: "http://192.168.0.184/MedicineAPI/",
    stayloggedin: false,
    key: "S0xUQk1C"
};
var Login = {
    initView: function() {
        if (Application.isAuthenticate()) {
            $.mobile.changePage("#searchPatient", {
                transition: "none",
                reverse: false,
                changeHash: true
            });
            return false;
        } else {
            $("#username").val("");
            $("#password").val("");
            Application.hideMessage();
        }
    },
    init: function() {
        if (Application.isAuthenticate()) {
            $.mobile.changePage("#searchPatient", {
                transition: "none",
                reverse: false,
                changeHash: false
            });
            return false;
        } else {
            $("#btnLogin").off("tap");
            $("#btnLogin").on("tap", Login.login);
            $("#username").off("focus", SoftKeyboard.show);
            $("#username").on('focus', SoftKeyboard.show);
        }
    },
    login: function() {
        var e = {
            username: $("#username").val(),
            password: $("#password").val()
        };
        if (e.username === "" || e.password === "") {
            Application.showMessage("Please fill the details completely.", "Error");
            return false;
        }
        Common.callAjax("login", Login.loginComplete, "Login", e);
        return false;
    },
    loginComplete: function(e) {
        Application.Config.LoggedInUser = e.user;
        Store.set("user", Application.Config.LoggedInUser);
        Application.refreshData(function() {
            $.mobile.changePage("#searchPatient", {
                transition: "none",
                reverse: false,
                changeHash: false
            });
        });
    }
};
var Patients = {
    initView: function() {
        var isOk = Application.isAuthenticate();
        if (!isOk) {
            $.mobile.changePage("#login", {
                transition: "none",
                reverse: true,
                changeHash: false
            });
        } else {
            Patients.loadData();
        }
    },
    init: function() {
        if (!Application.isAuthenticate()) {
            $.mobile.changePage("#login", {
                transition: "none",
                reverse: true,
                changeHash: false
            });
        } else {
            $("#patientSearch").off("keyup");
            $("#patientList").off("tap", "a");
            $("#patientSearch").on("keyup", Patients.loadData);
            $("#patientList").on("tap", "a", Patients.getDetail);
            Application.bindCommonEvents();
        }
    },
    loadData: function(e) {
        var t = true;
        if (t) {
            var n = "";
            if ($("#patientSearch").val().trim() !== "") {
                n += $("#patientSearch").val();
            }
            var data = search(Store.get("Patients"), "patientName", n, 20, "hospitalNo");
            Patients.populateData(data);
        }
    },
    populateData: function(e) {
        Common.showLoading("Populating");
        $("#patientList").children(".detail").remove();
        var t;
        var n;
        $.each(e, function(e, r) {
            t = $(".template", $("#patientList")).clone().removeClass("template");
            t.addClass("detail");
            t.find(".title").text(r.patientName + " (" + r.hospitalNo + ")");
            t.find(".roomnumber").text(r.room);
            t.find(".doctor").text(r.doctorName);
            n = r.isCredit ? "Credit" : "Cash";
            t.find(".actype").text(n);
            t.find(".patientId").val(r.patientId);
            t.addClass("patient-" + e);
            $("#patientList").append(t);
        });
        Common.hideLoading();
    },
    getDetail: function() {
        var e = $(this).find(".patientId").val();
        var patList = Store.get("Patients");
        var pat = patList[getObject(patList, "patientId", e)];
        PatientDetail.initPatinet(pat);
        $.mobile.changePage("#patientDetail", {
            transition: "none",
            reverse: false,
            changeHash: true
        });
    }
};
var PatientDetail = {
    initView: function() {
        PatientDetail.checkData(function() {
            PatientDetail.populateData();
            $("#patAcType").slider('disable');
        });
    },
    checkData: function(call) {
        if ($("#patDoctor").children().length < 1) {
            PatientDetail.populateDoctors(function() {
                if ($("#patRoom").children().length < 1) {
                    PatientDetail.populateRooms(call);
                    return;
                } else {
                    call();
                    return;
                }
            });
        }

        if ($("#patRoom").children().length < 1) {
            PatientDetail.populateRooms(call);
            return;
        }

        call();
    },
    init: function() {
        $("#btnPatDetNext").off("tap");
        $("#btnPatDetBack").off("tap");
        $("#patRoom").off("change");
        $("#patRoom").on("change", PatientDetail.roomSelected);
        $("#btnPatDetNext").on("tap", PatientDetail.nextPage);
        $("#btnPatDetBack").on("tap", PatientDetail.prevPage);
    },
    roomSelected: function() {
        $("#patDoctor").focus();
    },
    populateData: function() {
        var e = PatientDetail.patient.isCredit ? "off" : "on";
        $("#patientDetailId").val(PatientDetail.patient.patientId);
        $("#patName").val(PatientDetail.patient.patientName);
        $("#patHospitalNo").val(PatientDetail.patient.hospitalNo);
        $("#patRoom").val(PatientDetail.patient.room);
        $("#patRoom").selectmenu("refresh");
        $("#patAcType").val(e);
        $("#patDoctor").val(PatientDetail.patient.doctorId);
        $("#patDoctor").selectmenu("refresh");
        $("#patAcType").slider("refresh");
    },
    initPatinet: function(e) {
        this.patient = e;
    },
    populateDoctors: function(e) {
        Common.callAjax("getDoctors", function(t) {
            $("#patDoctor").children().remove();
            $.each(t.doctors, function(n, r) {
                var i = $("<option>");
                i.text(r.doctorName);
                i.attr("value", r.doctorId);
                $("#patDoctor").append(i);
                if (n === t.doctors.length - 1) {
                    e();
                }
            });
        }, "Refreshing Doctors");
    },
    populateRooms: function(e) {
        Common.callAjax("getRooms", function(t) {
            $("#patRoom").children().remove();
            $.each(t.rooms, function(n, r) {
                var i = $("<option>");
                i.text(r.roomNo);
                i.attr("value", r.roomId);
                $("#patRoom").append(i);
                if (n === t.rooms.length - 1) {
                    e();
                }
            });
            if (t.rooms.length < 1) {
                e();
            }
        }, "Refreshing Rooms");
    },
    nextPage: function() {
        PatientDetail.patient.doctorId = $("#patDoctor").val();
        PatientDetail.patient.doctorName = $("#patDoctor option:selected").text();
        if ($("#patAcType").val() === "on") {
            PatientDetail.patient.isCredit = false;
        } else {
            PatientDetail.patient.isCredit = true;
        }
        PatientDetail.patient.room = $("#patRoom").val();
        Requirement.required.patient = PatientDetail.patient;
        $.mobile.changePage("#requirements", {
            transition: "none",
            reverse: false,
            changeHash: true
        });
    },
    prevPage: function() {
        $.mobile.back();
    }
};
var Requirement = {
    init: function() {
        $("#btnReqBack").off("tap");
        $("#patDet").off("tap");
        $("#medSearch").off("keyup");
        $("#btnAddItem").off("tap");
        $("#itemList").off("tap", "a");
        $("#medicineList").off("tap", "a.editItem");
        $("#medicineList").off("tap", "a.delItem");
        $("#btnSaveItem").off("tap");
        $("#btnCancelItem").off("tap");
        $("#btnReqSubmit").off("tap");
        $("#btnAddNew").off("tap", Application.addNew);
        $("#btnReqBack").on("tap", Requirement.prevPage);
        $("#patDet").on("tap", Requirement.prevPage);
        $("#medSearch").on("keyup", Requirement.searchMedicine);
        $("#btnAddItem").on("tap", Requirement.addMedicine);
        $("#itemList").on("tap", "a", Requirement.medicineSelected);
        $("#medicineList").on("tap", "a.editItem", Requirement.editMedicine);
        $("#medicineList").on("tap", "a.delItem", Requirement.deleteMedicine);
        $("#btnSaveItem").on("tap", Requirement.saveMedicine);
        $("#btnCancelItem").on("tap", Requirement.cancelEdit);
        $("#btnReqSubmit").on("tap", Requirement.submitRequirement);
        $("#btnAddNew").on("tap", Application.addNew);
    },
    initView: function() {
        $(".rqcode").hide();
        $(".rqcode span").text("");
        $("#btnReqBack").button("enable");
        $("#btnReqSubmit").button("enable");
        $("#submitBlock").removeClass("template");
        $("#newBlock").addClass("template");
        Application.hideMessage();
        Requirement.populatePatient();
        Requirement.populateMedicines();
    },
    searchMedicine: function(e) {
        var t = true;
        if (typeof e !== "undefined") {
            if ($("#medSearch").val().trim().length < 2) {
                t = false;
            }
        }
        if (t) {
            var n = "";
            if ($("#medSearch").val().trim() !== "") {
                n += $("#medSearch").val();
            }
            var data = search(Store.get("Medicines"), "itemName", n, 20, "itemId");
            $("#itemList").removeClass("template");
            Requirement.populateSearchReqult(data);
        }
    },
    populateSearchReqult: function(e) {
        Common.showLoading("Populating");
        $("#itemList").children(".medicine").remove();
        $("#medicineId").val("");
        var t;
        $.each(e, function(e, n) {
            t = $(".template", $("#itemList")).clone().removeClass("template");
            t.addClass("medicine");
            t.addClass("medicine-" + e);
            t.find(".itemName").text(n.itemName);
            t.find(".itemId").val(n.itemId);
            $("#itemList").append(t);
        });
        Common.hideLoading();
    },
    addMedicine: function() {
        var e = "";
        var t = true;
        var n = {
            itemId: $("#medicineId").val(),
            itemName: $("#medSearch").val(),
            quantity: $("#quantity").val()
        };
        if ($.trim(n.itemId) === "") {
            t = false;
            $("#medSearch").focus();
            e += "Please select an Item.<br />";
        }
        if ($.trim(n.quantity) === "") {
            if (t)
                $("#quantity").focus();
            t = false;
            e += "Please enter a valid quantity.<br />";
        }
        if (t) {
            Requirement.inMedicines(n.itemId, function() {
                Application.showMessage("Item already added.", "Error");
            }, function() {
                var e = {
                    itemId: n.itemId,
                    itemName: n.itemName,
                    quantity: n.quantity,
                    index: Requirement.required.medicines.length
                };
                Requirement.required.medicines.push(n);
                Application.hideMessage();
                Requirement.addSingleMedicine(e);
                $("#medicineId").val("");
                $("#medSearch").val("");
                $("#quantity").val("");
                $("#medSearch").focus();
            });
        } else {
            Application.showMessage(e, "Error");
        }
        return false;
    },
    medicineSelected: function(e) {
        $("#medSearch").val($(e.currentTarget).text());
        $("#medicineId").val($(e.currentTarget).parent().find(".itemId").val());
        $("#medSearch").next().addClass("ui-input-clear-hidden");
        $("#itemList").addClass("template");
        $("#quantity").focus();
    },
    addSingleMedicine: function(e) {
        var t = $(".template", $("#medicineList")).clone().removeClass("template");
        t.addClass("detail");
        t.addClass("row-" + e.index);
        t.find(".medName").text(e.itemName);
        t.find(".qty").text(e.quantity);
        t.find(".itemId").val(e.itemId);
        t.find(".index").val(e.index);
        $("#medicineList").append(t);
    },
    editMedicine: function(e) {
        if (!$(e.currentTarget).hasClass("disabled")) {
            if (typeof Requirement.currentIndex !== "undefined") {
                Requirement.cancelEdit();
            }
            Requirement.currentIndex = $(e.currentTarget).parents(".detail").find(".index").val();
            Requirement.currentItem = Requirement.required.medicines[Requirement.currentIndex];
            Requirement.editView();
        }
    },
    editView: function() {
        $("#medicineId").val(Requirement.currentItem.itemId);
        $("#medSearch").val(Requirement.currentItem.itemName);
        $("#quantity").val(Requirement.currentItem.quantity);
        $("#medicineList .row-" + Requirement.currentIndex + " a").addClass("disabled");
        $("#medSearch").attr("disabled", "disabled");
        $("#addBlock").addClass("template");
        $("#editBlock").removeClass("template");
        $("#quantity").focus();
    },
    deleteMedicine: function(e) {
        if (!$(e.currentTarget).hasClass("disabled")) {
            var t = $(e.currentTarget).parent().find(".index").val();
            Requirement.required.medicines.splice(t, 1);
            Requirement.populateMedicines();
            $("#medSearch").focus();
        }
    },
    saveMedicine: function() {
        if ($("#quantity").val().trim() !== "") {
            Requirement.currentItem.quantity = $("#quantity").val();
            Requirement.required.medicines[Requirement.currentIndex] = Requirement.currentItem;
            Requirement.refreshSingle(Requirement.currentIndex);
            Requirement.cancelEdit();
            $("#medSearch").focus();
        } else {
            Application.showMessage("Please enter a valid quantity", "Error");
            $("#quantity").focus();
        }
    },
    cancelEdit: function() {
        $("#medicineList .row-" + Requirement.currentIndex + " a").removeClass("disabled");
        Requirement.currentIndex = undefined;
        Requirement.currentItem = undefined;
        $("#medicineId").val("");
        $("#medSearch").val("");
        $("#quantity").val("");
        $("#medSearch").removeAttr("disabled");
        $("#addBlock").removeClass("template");
        $("#editBlock").addClass("template");
        $("#medSearch").focus();
    },
    submitRequirement: function() {
        $("#btnReqSubmit").button("disable");
        $("#btnReqBack").button("disable");
        var e = "sumitRequirement";
        Requirement.required.patient.userName = Store.get("user").username;
        if (Requirement.required.medicines.length > 0) {
            Common.callAjax(e, function(e) {
                Requirement.requirementSubmited(e);
            }, "Medicines", Requirement.required);
        } else {
            Application.showMessage("Please add atleast one item", "Error");
        }
    },
    requirementSubmited: function(e) {
        Application.showMessage("Medicine requirement submited successfully.", "Success", true);
        $(".rqcode span").text(e.Requirement.ReqCode);
        //$(".rqcode").slideDown(500);
        $("#submitBlock").addClass("template");
        $("#newBlock").removeClass("template");
    },
    refreshSingle: function(e) {
        var t = $(".row-" + e, $("#medicineList"));
        t.find(".qty").text(Requirement.required.medicines[e].quantity);
    },
    populatePatient: function() {
        var e = Requirement.required.patient;
        var t = e.isCredit ? "Credit" : "Cash";
        $("#patDet .name").text(e.patientName + " (" + e.hospitalNo + ")");
        $("#patDet .room").text(e.room);
        $("#patDet .doctor").text(e.doctorName);
        $("#patDet .actype").text(t);
    },
    populateMedicines: function() {
        $("#medicineList .detail").remove();
        $.each(Requirement.required.medicines, function(e, t) {
            var n = $(".template", $("#medicineList")).clone().removeClass("template");
            n.addClass("detail");
            n.find(".medName").text(t.itemName);
            n.find(".qty").text(t.quantity);
            n.find(".itemId").val(t.itemId);
            n.find(".index").val(e);
            $("#medicineList").append(n);
        });
    },
    addMedicines: function() {
        $.mobile.changePage("#addMedicines", {
            transition: "none",
            reverse: false,
            changeHash: true
        });
    },
    nextPage: function() {
        if (Requirement.required.medicines.length === 0) {
            Application.showMessage("Please add medicines.");
            setTimeout("Application.hideMessage()", "3000");
        } else {
            $.mobile.changePage("#summary", {
                transition: "none",
                reverse: false,
                changeHash: true
            });
        }
    },
    prevPage: function() {
        $.mobile.back();
    },
    inMedicines: function(e, t, n) {
        if (Requirement.required.medicines.length === 0) {
            n();
            return;
        }
        $.each(Requirement.required.medicines, function(r, i) {
            if (i.itemId === e) {
                t();
                return;
            }
            if (r === Requirement.required.medicines.length - 1) {
                n();
            }
        });
    }
};
Requirement.required = {
    medicines: []
};
var Common = {
    showLoading: function(e) {
        Common.hideLoading();
        var text = "";
        var isText = false;
        if (typeof e !== "undefined") {
            text = e;
            isText = true;
        }
        $.mobile.loading("show", {
            text: text,
            textVisible: isText,
            theme: "a",
            html: ""
        });
    },
    hideLoading: function() {
        $.mobile.loading("hide");
    },
    callAjax: function(e, t, n, r) {
        //action, callback, msg, data
        this.showLoading(n);
        var i = {
            type: "POST",
            url: Application.Config.ajUrl + "index.php?key=" + Application.Config.key + "&action=" + e,
            dataType: "json",
            success: function(e) {
                Common.hideLoading();
                if (e.status !== "success") {
                    Application.showMessage(e.message, "Error");
                } else {
                    t(e);
                }
            },
            error: function() {
                Common.hideLoading();
                Application.showMessage("Error in network", "Error");
            }
        };
        if (typeof r !== "undefined") {
            i.data = r;
        }
        $.ajax(i);
    }
};
