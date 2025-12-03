var CMHFlowUtils = Class.create();
CMHFlowUtils.prototype = {

    initialize: function(name, inputs, runAsync = true) {
        this.name = name;
        this.inputs = inputs;
        this.runAsync = runAsync;
    },

    executeAction: function() {
        try {
            if (!this.runAsync) {
                //Execute Synchronously: Run in foreground. Has access to outputs.
                const result = sn_fd.FlowAPI.getRunner().action(this.name).inForeground().withInputs(this.inputs).run();
                return result.getOutputs();
            }
            // Start Asynchronously: will not have access to outputs.
            sn_fd.FlowAPI.getRunner().action(this.name).inBackground().withInputs(this.inputs).run();
        } catch (ex) {
            const message = ex.getMessage();
            gs.error(message);
        }
    },

    executeFlow: function() {
        try {
            if (!this.runAsync) {
                sn_fd.FlowAPI.getRunner().flow(this.name).inForeground().withInputs(this.inputs).run();
                //not sure what this would return yet tbd.
                return;
            }
            // Start Asynchronously
            sn_fd.FlowAPI.getRunner().flow(this.name).inBackground().withInputs(this.inputs).run();
        } catch (ex) {
            const message = ex.getMessage();
            gs.error(message);
        }
    },

	validateMandatoryActionInputs:function(){
		var errors = [];
		const action = this.getActionDefinition();
		if(!action){
			errors.push('action not found');
			return errors;
		}
		var actionInputs = new GlideRecord('sys_hub_action_input');
		actionInputs.addActiveQuery();
		actionInputs.addQuery('model','=',action.getValue('sys_id'));
		actionInputs.addQuery('mandatory','=',true);
		actionInputs.query();
		while(actionInputs.next()){
			const element = actionInputs.getValue('element');
			if(!this.inputs.hasOwnProperty(element) || !this.inputs[element]){
				errors.push(element);
			}
		}
		return errors;
	},

	getActionDefinition:function(){
		const [scope,internalName] = this.name.split('.');
		var actionDefinition = new GlideRecord('sys_hub_action_type_definition');
		if(actionDefinition.get('internal_name',internalName)){
			return actionDefinition;
		}
		return null;
	},

    type: 'CMHFlowUtils'
};