var CMHDevAlert = Class.create();
CMHDevAlert.prototype = {

    initialize: function() {},

    createIncident: function(inputs, outputs) {
        if (inputs.log_incident === 'false') {
            return;
        }

        var fieldMap;
        try {
            fieldMap = JSON.parse(inputs.incident_data);
        } catch {
            fieldMap = {};
        }

        //going to allow fieldmap to override the constants.
        const combinedFieldMap = {
            ...CMHDevAlertConstants.INCIDENT_FIELD_MAP,
            ...fieldMap,
        };

        var gr = new GlideRecord('incident');
        gr.initialize();
        gr.short_description = inputs.subject;
        gr.description = inputs.message;
        gr.work_notes = this.makePrettyContext(inputs.context);
        Object.keys(combinedFieldMap).forEach(key => {
            if (gr.isValidField(key)) {
                const value = fieldMap[key];
                gr.setValue(key, value);
            }
        });
        gr.insert();
        outputs.incident_link = `${gs.getProperty('glide.servlet.uri')}${gr.getLink()}`;
    },

    getSendToEmails: function(inputs, outputs) {
        if (CMHDevAlertConstants.EMAIL_MAP.hasOwnProperty(inputs.send_to)) {
            outputs.to_emails = CMHDevAlertConstants.EMAIL_MAP[inputs.send_to];
            return;
        }
        outputs.to_emails = CMHDevAlertConstants.EMAIL_MAP['default_email'];
    },

    makePrettyContext: function(context) {
        var prettyReturn = '';
        if (!context) {
            return prettyReturn;
        }
        try {
            const contextObj = JSON.parse(context);
            Object.keys(contextObj).forEach(key => {
                const value = contextObj[key];
                prettyReturn += `${key} : ${value} \n`;
            });
        } catch (ex) {
            return prettyReturn;
        }
        return prettyReturn;
    },

    type: 'CMHDevAlert'
};