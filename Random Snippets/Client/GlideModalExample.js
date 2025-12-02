function commentsDialog() {
    var dialog = new GlideModal("cmh_create_standard_change");
    dialog.setTitle("Create Standard Change");
    dialog.setPreference('record', g_form.getUniqueValue());
    dialog.setPreference("onPromptCancel", function() {
        return;
    });
    dialog.setPreference("onPromptComplete", function(msg, result) {
        if (result === 1) {
            g_form.addInfoMessage(msg);
        } else {
            g_form.addWarningMessage(msg);
        }
    });
    dialog.render();
}