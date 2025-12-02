//region param structure
/**
  params object structure 
  parm1 = action
  send as JSON as parm2 are string values
  {
  	table:"",
    //only required for update action
	sys_id:"",
	caller:"",
  	record_obj:{
  	field:'value',
	...
  	},
  }
 */
//endregion

//region MainLogic
var errorArr = [];
var action = event.getValue('parm1');
var params = JSON.parse(event.getValue('parm2'));

if (action) {
    evaluateActions();
} else {
    errorArr.push("No Action Defined (parm1)");
}

if (errorArr.length !== 0) {
    gs.error('CMHBRUpdateRecord errors - Calling BR: ' + params.caller + ' Calling Record: ' + current.getDisplayValue() + ' ' + errorArr);
}

//endregion

//region functions

//evaluate script action
function evaluateActions() {
    switch (action) {
        case 'insert':
            if (!isValidRequest(['caller', 'table', 'record_obj'])) {
                errorArr.push('Insert - One or More Required Keys Missing.');
            } else {
                if (isValidTable(params.table)) {
                    _insertRecord();
                }
            }
            break;
        case 'update':
            if (!isValidRequest(['table', 'sys_id', 'caller', 'record_obj'])) {
                errorArr.push('Update - One or More Required Keys Missing.');
            } else {
                if (isValidTable(params.table)) {
                    _updateRecord();
                }
            }
            break;
        default:
            errorArr.push(action + ' is not a valid action.');
            break;
    }
}

//insert a new record
function _insertRecord() {
    var gr = new GlideRecord(params.table);
    gr.newRecord();
    updateObj(gr);
    gr.insert();

    var insertError = gr.getLastErrorMessage();
    if (insertError) {
        errorArr.push('Insert Error: ' + insertError);
    }
}

//update existing record
function _updateRecord() {
    var gr = new GlideRecord(params.table);
    if (gr.get(params.sys_id)) {
        updateObj(gr);
        gr.update();
    } else {
        errorArr.push('Failed to find record to update.');
    }
}

//set hash keys vals
function updateObj(obj) {
    var objKeys = Object.keys(params.record_obj);
    for (var i = 0; i < objKeys.length; i++) {
        if (obj.hasOwnProperty(objKeys[i])) {
            obj[objKeys[i]] = params.record_obj[objKeys[i]];
        }
    }
}

//do we have the data to run this
function isValidRequest(keys) {
    for (var i = 0; i < keys.length; i++) {
        if (!params.hasOwnProperty(keys[i])) {
            return false;
        }
    }
    return true;
}

//confirm table name is a real table
function isValidTable(table) {
    if (new TableUtils(table).tableExists()) {
        return true;
    } else {
        errorArr.push("Table: " + table + " does not exist.");
        return false;
    }
}
//endregion