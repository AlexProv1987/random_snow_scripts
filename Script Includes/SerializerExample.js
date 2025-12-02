var CMHSerializer = Class.create();
CMHSerializer.prototype = {
    initialize: function(glide_record, fields, many) {
        this.obj = this.getObj(glide_record, fields, many);
        this.data = JSON.stringify(this.obj);
    },

    getObj: function(glide_record, fields, many) {
        if (many) {
            return this.getArray(glide_record, fields);
        } else {
            return this.getInstance(glide_record, fields);
        }
    },

    getInstance: function(glide_record, fields) {
        var instance = {};
        for (var i = 0; i < fields.length; i++) {
            if (glide_record.hasOwnProperty(fields[i])) {
                if (glide_record[fields[i]].sys_id !== undefined && glide_record[fields[i]].sys_id) {
                    instance[fields[i]] = {
                        display_value: glide_record.getDisplayValue(fields[i]),
                        sys_id: glide_record.getValue(fields[i]),
                    };
                    continue;
                }
                instance[fields[i]] = glide_record.getValue(fields[i]);
            }
        }
        return instance;
    },

    getArray: function(glide_record, fields) {
        var instance_list = [];
        while (glide_record.next()) {
            var instance = {};
            for (var j = 0; j < fields.length; j++) {
                if (glide_record.hasOwnProperty(fields[j])) {
                    if (glide_record[fields[j]].sys_id !== undefined && glide_record[fields[j]].sys_id) {
                        instance[fields[j]] = {
							display_value:glide_record.getDisplayValue(fields[j]),
							sys_id:glide_record.getValue(fields[j]),
						};
						continue;
                    }
                    instance[fields[j]] = glide_record.getValue(fields[j]); 
                }
            }
            instance_list.push(instance);
        }
        return instance_list;
    },

    type: 'CMHSerializer'
};