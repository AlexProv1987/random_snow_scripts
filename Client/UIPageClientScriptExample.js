/**UI PAGE
<g:ui_form>
    <g:evaluate var="jvar_record" expression="RP.getWindowProperties().get('record')" />
    <div class='form-group'>
        <label for="template">
            <span class='me-2' id='asterisks' style="color: red;">*</span>Template
        </label>
        <input type="hidden" name="sys_id" id="sys_id" value="${jvar_record}" />
        <g:ui_reference onchange="handleChange(this.value)" mandatory="true" aria-required="true" id='template' label="Standard Change Name" name="std_change_template" query="active=true" table="std_change_record_producer" field="name" />
        <div id='required-field' style='color:red'></div>
    </div>
    <div class="modal-footer text-right">
        <g:dialog_buttons_ok_cancel ok="validateComments('ok');" ok_type="button" cancel="invokePromptCallBack('cancel')" cancel_type="button" />
    </div>
</g:ui_form>
 */

function validateComments(type) {

    var sysID = gel("sys_id").value;
    var templateName = gel("std_change_template").value;

    if (templateName === '') {
        handleValidationErrors(true);
        return false;
    }

    var stdChgGA = new GlideAjax("CMH_createStandardChange");
    stdChgGA.addParam('sysparm_name', 'StandardChangeCreationFunction');
    stdChgGA.addParam('sysparm_template', templateName);
    stdChgGA.addParam('sysparm_sysid', sysID);
    stdChgGA.getXMLAnswer(function(response) {
        var result = JSON.parse(response);
        var msg;

        if (result.var1 == 1) {
            msg = "Standard Change: " + result.var2 + " has been successfully created.";
        } else {
            msg = result.var2;
        }

        invokePromptCallBack(type, msg, result.var1);
		
    });
}

function handleValidationErrors(hasErrors) {
    var fieldMsg = document.getElementById('required-field');
    var requiredAsterisk = document.getElementById('asterisks');
    switch (hasErrors) {
        case true:
            fieldMsg.textContent = 'This field is required';
            requiredAsterisk.style.color = 'red';
            return;
        case false:
            fieldMsg.textContent = '';
            requiredAsterisk.style.color = 'white';
            return;
        default:
            return;
    }
}

function handleChange(value) {
    if (value) {
        handleValidationErrors(false);
    } else {
        handleValidationErrors(true);
    }
}

//handle callbacks
function invokePromptCallBack(type, msg, result) {
    var fnc;
    var gdw = GlideDialogWindow.get();
    if (type == 'ok') {
        fnc = gdw.getPreference('onPromptComplete');
    } else
        fnc = gdw.getPreference('onPromptCancel');
    if (typeof(fnc) == 'function') {
        try {
            fnc(msg, result);
        } catch (e) {}
    }
    gdw.destroy();
    return false;
}