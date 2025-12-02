var CMHManagerHandler = Class.create();
CMHManagerHandler.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	
	MANAGER_HEIRARCHY : [],

    getHeirachy: function(manager) {
		manager = manager ? manager : this.getParameter('sysparm_user');
		if(!manager){
			return this.MANAGER_HEIRARCHY;
		}
		this._evaluateTree([manager],manager,true);
		return this.MANAGER_HEIRARCHY;
    },

    _evaluateTree: function(managers,user,initial) {
		var userIds = [];
        var userGr = new GlideRecord('sys_user');
        userGr.addQuery('active', '=', true).addOrCondition('u_prehire', '=', true);
		userGr.addQuery('manager','IN',managers);
		userGr.addQuery('employee_number','!=',null);
		if(!initial){
			userGr.addQuery('manager.manager','=',user);
		}
        userGr.query();
        while (userGr.next()) {
            userIds.push(userGr.getValue('sys_id'));
        }
		if(userIds.length !== 0){
			this.MANAGER_HEIRARCHY = this.MANAGER_HEIRARCHY.concat(userIds);
			this._evaluateTree(userIds,user,false);
		}
    },
	
    type: 'CMHManagerHandler'
});