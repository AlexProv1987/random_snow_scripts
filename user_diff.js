var missingRoles = [];
var missingGroups = [];

var modelUser = new GlideRecord('sys_user');
modelUser.get('3f9d2835db05dc50045ef1fcbf96195d');

var badUser = new GlideRecord('sys_user');
badUser.get('6a2dd1eedb430c1009b39017db9619ab');

var modelRoles = new GlideRecord('sys_user_has_role');
modelRoles.addQuery('state', '=', 'active');
modelRoles.addQuery('user', '=', modelUser.getValue('sys_id'));
modelRoles.query();
while (modelRoles.next()) {
    var badUserRoles = new GlideRecord('sys_user_has_role');
    badUserRoles.addQuery('user', '=', badUser.getValue('sys_id'));
    badUserRoles.addQuery('role', '=', modelRoles.getValue('role'));
    badUserRoles.query();
    if (!badUserRoles.hasNext()) {
        missingRoles.push(modelRoles.getDisplayValue('role'));
    }

}


var modelGroups = new GlideRecord('sys_user_grmember');
modelGroups.addQuery('user', '=', modelUser.getValue('sys_id'));
modelGroups.query();
while (modelGroups.next()) {
    var badUsergroups = new GlideRecord('sys_user_grmember');
    badUsergroups.addQuery('user', '=', badUser.getValue('sys_id'));
    badUsergroups.addQuery('group', '=', modelGroups.getValue('group'));
	badUsergroups.query();
	if(!badUsergroups.hasNext()){
		missingGroups.push(modelGroups.getDisplayValue('group'));
	}
}


gs.print(missingGroups);
gs.print(missingRoles);