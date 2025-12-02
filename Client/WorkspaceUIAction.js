function onClick(g_form) {
    //if promise resolves open modal
    g_form.validateFormAsync().then(function() {
        g_modal.showFields({
            title: "First Call Resolution",
            fields: [{
                    type: 'reference',
                    name: 'location',
                    label: getMessage('Location'),
                    mandatory: true,
                    reference: 'cmn_location',
                    referringTable: 'incident',
                    referringRecordId: g_form.getUniqueValue()
                },
                {
                    type: 'string',
                    name: 'u_room_number',
                    label: getMessage('Room Number'),
                    mandatory: true,
                },
                {
                    type: 'reference',
                    name: 'u_cmdb_ci',
                    label: getMessage('Routing Item'),
                    mandatory: true,
                    reference: 'u_config_item',
                    referringTable: 'incident',
                    referringRecordId: g_form.getUniqueValue()
                },
				{
                    type: 'reference',
                    name: 'cmdb_ci',
                    label: getMessage('Config Item'),
                    mandatory: false,
                    reference: 'cmdb_ci',
                    referringTable: 'incident',
                    referringRecordId: g_form.getUniqueValue()
                },
                {
                    type: 'textarea',
                    name: 'description',
                    label: getMessage('Description'),
                    mandatory: true
                },
                {
                    type: 'textarea',
                    name: 'close_notes',
                    label: getMessage('Close Notes'),
                    mandatory: true
                },
                {
                    type: 'textarea',
                    name: 'u_close_notes_customer_visible',
                    label: getMessage('Customer Visible Close Notes'),
                    mandatory: true
                },
            ],
            size: 'lg'
        }).then(function(fieldValues) {
            var incidentHandler = new GlideAjax("global.CMHSoWQuickActions");
            incidentHandler.addParam('sysparm_name', 'incidentQuickAction');
            incidentHandler.addParam('sysparm_interaction_pk', g_form.getUniqueValue());
            incidentHandler.addParam('sysparm_modal_fields', JSON.stringify(fieldValues));
            incidentHandler.addParam('sysparm_action_name', 'First Call Resolution');
            incidentHandler.getXML(responseCallBack);
        });

    });

    function responseCallBack(response) {
        var answer = response.responseXML.documentElement.getAttribute("answer");
        if (!answer || parseInt(answer) != 201) {
            if (parseInt(answer) == 401) {
                g_form.addErrorMessage('Only Members of the Service Desk may perform this operation.');
            } else {
                g_form.addErrorMessage('An Error occurred.');
            }
        } else {
            g_form.addInfoMessage('Succesfully Created and Resolved Incident.');
        }
    }
}