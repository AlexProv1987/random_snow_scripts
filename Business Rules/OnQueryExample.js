(function executeRule(current, previous /*null when async*/ ) {
    var targetName = '';
    var autoCompleter = gs.action.getGlideURI().getMap().get('sysparm_name');
    var relList = gs.action.getGlideURI().getMap().get('sysparm_target');
    if (autoCompleter) {
        targetName = autoCompleter;
    } else if (relList) {
        targetName = relList;
    }
    if (targetName) {
        if (targetName.includes('change_request.assignment_group')) {
            current.addQuery('type', 'IN', 'e37cb5df87c1a510949e65bd0ebb3550,7c8c35df87c1a510949e65bd0ebb350f');
        }
    }
})(current, previous);