(function runMailScript(current, template, email, email_action, event) {
    var parsedObj = JSON.parse(event.parm1);
    var subjectPreFix = parsedObj.success ? 'Suceess ' : 'Failure ';
    var subjectContext = parsedObj.success ? event.parm2 : parsedObj.exception.name;
    email.setSubject(subjectPreFix + subjectContext);
    if(event.current){
		template.print('<p>Record: ' + event.current.getDisplayName() + '</p>');
	}
    if (parsedObj.success) {
        template.print('<p>Message: ' + event.parm2 + '</p>');
    } else {
		if(parsedObj.ticket.log && parsedObj.ticket.link + '</p>'){
			template.print('<p>Incident: ' + parsedObj.ticket.link + '</p>');
		}
        template.print("<p>Exception Name: " + parsedObj.exception.name + '</p>');
        template.print("<p>Exception Message: " + parsedObj.exception.message + '</p>');
        if(event.parm2){
			template.print("<p>Context: " + event.parm2 + '</p>');
		}
    }
})(current, template, email, email_action, event);