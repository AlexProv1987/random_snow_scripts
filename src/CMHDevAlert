var CMHDevAlert = Class.create();
CMHDevAlert.prototype = {

    initialize: function() {},

    createIncident: function(inputs) {
        if (inputs.log_incident === 'false') {
            return;
        }

        var fieldMap;
        try {
            fieldMap = JSON.parse(inputs.incident_data);
        } catch {
            fieldMap = {};
        }

        //Constants take prescedence for default fields over whats passed in - so they are unpacked last.
        const combinedFieldMap = {
            ...fieldMap,
            ...CMHDevAlertConstants.INCIDENT_FIELD_MAP
        };

        var gr = new GlideRecord('incident');
        gr.initialize();
        gr.short_description = inputs.subject;
        gr.description = inputs.message;
        gr.work_notes = inputs.context;
        Object.keys(combinedFieldMap).forEach(key => {
            if (gr.isValidField(key)) {
                const value = fieldMap[key];
                gr.setValue(key, value);
            }
        });
        gr.insert();
    },

    getSendToEmails: function(inputs, outputs) {
        if (CMHDevAlertConstants.EMAIL_MAP.hasOwnProperty(inputs.send_to)) {
            outputs.to_emails = CMHDevAlertConstants.EMAIL_MAP[inputs.send_to];
            return;
        }
        outputs.to_emails = CMHDevAlertConstants.EMAIL_MAP['default_email'];
    },

    type: 'CMHDevAlert'
};