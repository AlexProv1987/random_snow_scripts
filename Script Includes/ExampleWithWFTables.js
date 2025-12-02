var CMHWFUtils = Class.create();
CMHWFUtils.prototype = {

    ACTIVITY_NAMES: ['Catalog Task', 'Approval - User', 'Approval - Group', 'Set Values'],

    initialize: function() {},

    getCatalogItemhBadWFs: function() {
		var workflows = this.getActiveCatalogItemWFs();
		var activeWorkFlows = this.getActiveWorkFlows(null,workflows);
		var badItems = this.getWorkflowsMissingStageIDs(activeWorkFlows);
		return badItems;
    },

    getActiveCatalogItemWFs: function() {
		var ids = [];
        var workflows = new GlideRecord('sc_cat_item');
        workflows.addQuery('workflow','!=','');
		workflows.addActiveQuery();
		workflows.query();
		while(workflows.next()){
			ids.push(workflows.getValue('workflow'));
		}
		return ids;
    },

    getWorkflowsMissingStageIDs: function(wfVerionIds) {
        var badItems = [];
        var wfActivies = this.getActivites();
        var wfVersions = wfVerionIds ? wfVerionIds : this.getActiveWorkFlows('sc_req_item');
        for (var i = 0; i < wfVersions.length; i++) {
            if (!this.evaluateActivites(wfVersions[i], wfActivies)) {
                badItems.push(wfVersions[i]);
            }
        }
        return badItems;
    },

    getActiveWorkFlows: function(tableName, workflowIds) {
        var gr = GlideRecord('wf_workflow_version');
        if (tableName)
            gr.addQuery('table', tableName);
        if (workflowIds)
            gr.addQuery('workflow', 'IN', workflowIds);
        gr.addActiveQuery();
        var qc = gr.addQuery('published', true);
        qc.addOrCondition('checked_out_by', gs.getUserID());
        gr.query();
        var ids = [];
        while (gr.next()) {
            ids.push(gr.getValue('sys_id'));
        }
        return ids;
    },

    evaluateActivites: function(wfVersion, definitions) {
        var activites = new GlideRecord('wf_activity');
        activites.addQuery('workflow_version', '=', wfVersion);
        activites.addQuery('activity_definition', 'IN', definitions);
        activites.query();
        while (activites.next()) {
            if (!activites.getValue('stage')) {
                return false;
            }

        }
        return true;
    },

    getActivites: function() {
        var ids = [];

        var activites = new GlideRecord('wf_activity_definition');
        activites.addQuery('name', 'IN', this.ACTIVITY_NAMES);
        activites.query();
        while (activites.next()) {
            ids.push(activites.getValue('sys_id'));
        }

        return ids;
    },

    type: 'CMHWFUtils'
};