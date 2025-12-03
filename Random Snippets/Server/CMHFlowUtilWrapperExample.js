//flowApi does not enforce mandatory action inputs if you want validation use helper fncs of CMHFlowUtils SI before executing 
//this will also push an item to the array if the action cant be found.
var inputs = {
	log_incident:'false', //optinal default is false
	incident_data: JSON.stringify({impact:3,urgency:3}), //optional - suggested if log_incident is true
	context:JSON.stringify({table:'sys_user',business_rule:'this thing here'}), //optional this can be any schema
	subject:'Dev Alert For XYZ2',
	level:'low', //optional default is low
	message:'XYZ2 Went Wrong on ABC2',
	send_to:'developers', //optional default is developers
}
var testThing = new CMHFlowUtils('global.cmh_dev_alert',inputs,false);
if(testThing.validateMandatoryActionInputs().length !== 0){
	gs.print(testThing.validateMandatoryActionInputs());
}else{
	gs.print('good to go');
}
