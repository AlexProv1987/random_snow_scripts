var CMHRecordCompare = Class.create();
CMHRecordCompare.prototype = {

	//properties
    TRACKED_FIELDS: [],
    PREVIOUS: {},
    FIELD_CHANGES: [],


	//constructor
    initialize: function(fields, current) {
        this._setTrackedFields(fields, current);
        this._setPrevious(current);
    },


	//compare an instance of a GlideRecord v our Previous class Object
    comparePrevCurr: function(current) {
        for (let i = 0; i < this.TRACKED_FIELDS.length; i++) {
            if (this.PREVIOUS[this.TRACKED_FIELDS[i]] !== current.getDisplayValue(this.TRACKED_FIELDS[i])) {
				let fromVal = this.PREVIOUS[this.TRACKED_FIELDS[i]] ? this.PREVIOUS[this.TRACKED_FIELDS[i]] : 'Empty';
				let toVal = current.getDisplayValue(this.TRACKED_FIELDS[i]) ? current.getDisplayValue(this.TRACKED_FIELDS[i]) : 'Empty';
				this.FIELD_CHANGES.push({
					field_label:current.getElement(this.TRACKED_FIELDS[i]).getLabel(),
					from_value: fromVal,
					to_value:toVal,
				});
            }
        }
    },

	//evaluate if changes existed
    hadChanges: function() {
        if (this.FIELD_CHANGES.length !== 0) {
            return true;
        }
        return false;
    },


	//get a work note from the FIELD_CHANGES array
    getWorkNote: function() {
        let note = '';
        for(let i = 0; i < this.FIELD_CHANGES.length; i++){
			note+=this.FIELD_CHANGES[i].field_label + ' Changed From: ' + this.FIELD_CHANGES[i].from_value + ' To: ' + this.FIELD_CHANGES[i].to_value + '\n';
		}
		return note;
    },


	//get all of the given tables active fields
    getTableFields: function(table) {
        let fieldArray = [];
        let tableFields = new GlideRecord('sys_dictionary');
        tableFields.addActiveQuery();
        tableFields.addQuery('name', '=', table);
        tableFields.query();
        while (tableFields.next()) {
            fieldArray.push(tableFields.getValue('element'));
        }
        return fieldArray;
    },


	//set the value of our PREVIOUS object
    _setPrevious: function(current) {
        for (let i = 0; i < this.TRACKED_FIELDS.length; i++) {
            this.PREVIOUS[this.TRACKED_FIELDS[i]] = current.getDisplayValue(this.TRACKED_FIELDS[i]);
        }
    },

	//set the value of our TRACKED_FIELDS array
    _setTrackedFields: function(fields, current) {
        this.TRACKED_FIELDS = (fields && Array.isArray(fields)) ? fields : this.getTableFields(current.getTableName());
    },

	//if youre william comment this out and delete the , on line 75
    type: 'CMHRecordCompare'
};