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
                const result = sn_fd.FlowAPI.getRunner().action(this.name).inBackground().withInputs(this.inputs).run();
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
            // Start Asynchronously: Uncomment to run in background.
            sn_fd.FlowAPI.getRunner().flow(this.name).inBackground().withInputs(this.inputs).run();
        } catch (ex) {
            const message = ex.getMessage();
            gs.error(message);
        }
    },
    type: 'CMHFlowUtils'
};