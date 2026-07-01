//flow inputs
var inputs = {
    'db_view': 'u_itsm_license_usages', // table
    'metric_definition': getRecord('metric_definition', 'f348d5dc978c8fd45bcdb680f053afda'), //record
    'subscription_entitlement': getRecord('subscription_entitlement', 'c3f5144a974003105bcdb680f053af01'), //record
    'excluded_users_property':'exclude_users_prop_name', //make multiple depending on the subsscription
    'exclude_query':'encoded_query',//optional
    'due_from': 60, //integer
};

//flow outputs
var outputs = {
};

//flow handler cls

//test in memory table
var recordTable = {}

function process(inputs, outputs) {
	//printy print
    gs.print(inputs.db_view);
    gs.print(inputs.metric_definition.getUniqueValue());
    gs.print(inputs.subscription_entitlement.getUniqueValue());
    gs.print(inputs.due_from);
    gs.print(inputs.excluded_users_property);
	//end printy print

    var excludedUsers = gs.getProperty(inputs.excluded_users_property, []); //this will be a property, comma sepp list of sys_ids and well have a query condition defined as well.
    var dueDate = calculateDueDate(inputs.due_from);

    var records = new GlideAggregate(inputs.db_view);
    //records.addEncodedQuery('minstance_sys_id=NULL');
	records.addEncodedQuery('minstance_sys_id=NULL^ORminstance_sys_created_onONLast30days@javascript:gs.beginningOfLast30Days()@javascript:gs.endOfLast30Days()');
    //need query condition here to exclude things maybe along with the property.
    //records.addAggregate('COUNT(DISTINCT', 'minstance_sys_id');
    records.groupBy('user_sys_id');
	//records.groupBy('minstance_sys_id');
    records.groupBy('user_first_name');
    records.groupBy('user_last_name');
    //test
    //records.setLimit(500);
    //end test
    records.query();

    while (records.next()) {
        var userSysId = records.getValue('user_sys_id');
		gs.print(userSysId + ' ' + records.getValue('user_first_name') + ' ' + records.getValue('user_last_name'));
        //well allow further exlcusion outside of query if desired.
        if (!excludedUsers.includes(userSysId)) {
            //insert records here
            recordTable[userSysId] = {
                'user': userSysId,
                'assignment_group': null, //sys_user_group ref - read only
                'assigned_to': null, //sys_user ref
                'metric_definition': inputs.metric_definition.getUniqueValue(), //read only
                'subscription': inputs.subscription_entitlement.getUniqueValue(), //read only
                'sys_created_on': 'today dt_tm', //this is a default field
                'revoked': null, //choices Yes, No, include none
				'reason':'text field required when selecting yes or no on revoked',
                'reviewed_by': null, //sys_user ref- read only
                'reviewed_at': null, //dt_tm - read only
                'due_date': dueDate, //dt_tm - read only
                'active': true, // read only
            };
        }
    }
}

function calculateDueDate(fromToday) {
    var dueDate = new GlideDateTime();
	dueDate.addDaysLocalTime(fromToday);
    return dueDate;
};

//test fncs and logging
function getRecord(table, id) {
    var gr = new GlideRecord(table);
    gr.get(id);
    return gr;
}
//weejus
//7Ovqp&^ZNP4F@j@x.R$*A^11Y9)o

process(inputs, outputs);
gs.print(JSON.stringify(recordTable));
gs.print(JSON.stringify(outputs));

//business rules

//before
function updateWhenReviewed (){
	//if revoked changes and revoked is not none
	//set reviewed_by gs.currentuser
	//set reviewed at - today
	//set active - false
}

//notifications -- insert
// send to user with whatever details

//notifications -- update if revoked is yes
// send notification to user youve been bye bye and to log ticket to SNOW if you feel this was in error
//system property will hold the catalog item they can log to object to the revocation

//table flows
//well send reminders to the group with these tickets. say there are X due in X days cause they dont work from queue - get rekt
