function onClick() {
    var choiceHandler = new GlideAjax("global.CMHWUQuickActions");
    choiceHandler.addParam('sysparm_name', 'getRFVChoices');
    choiceHandler.addParam('sysparm_interaction_loc', g_form.getValue('location'));
    choiceHandler.getXML(choiceCallBack);

    function choiceCallBack(response) {
        var answer = response.responseXML.documentElement.getAttribute("answer");
        var respData = null;
        try {
            respData = JSON.parse(answer);
            if (!respData || respData.status !== 200 || !respData.data) {
                g_form.addErrorMessage('Bad request or empty response data');
                return;
            }

			//add none at start pos of arr to dither ok to submit on no choice
			respData.data.unshift({
				displayValue:'--None--',
				value:null
			})
			
            g_modal.showFields({
                title: 'Walk Up Request',
                fields: [{
                    type: 'choice',
                    name: 'reason',
                    choices: respData.data,
                    label: getMessage('Reason For Visit'),
                    mandatory: true,
                }],
                size: 'lg'
            }).then(function(fieldValues) {
                //we only have one question well ever need here so hard code index - server doesnt handle an arr
                var choice = fieldValues.updatedFields[0].value;

                var handleCreate = new GlideAjax("global.CMHWUQuickActions");
                handleCreate.addParam('sysparm_name', 'reqItemQuickAction');
				handleCreate.addParam('sysparm_action_name', choice);
                handleCreate.addParam('sysparm_interaction_pk', g_form.getUniqueValue());
                handleCreate.getXML(handleCreateCallBack);
            });
        } catch (ex) {
            g_form.addErrorMessage('Failed to parse response data.');
        }
    }

    function handleCreateCallBack(response) {
        var answer = response.responseXML.documentElement.getAttribute("answer");
        var respData = null;
        try {
            respData = JSON.parse(answer);
            if (!respData || respData.status !== 201) {
                g_form.addErrorMessage('An error has occurred.');
                return;
            }
			g_form.addInfoMessage('Request Created!');
        } catch (ex) {
			g_form.addErrorMessage('Failed to parse response');
        }
    }
}