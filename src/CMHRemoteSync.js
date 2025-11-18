var CMHRemoteSync = Class.create();
CMHRemoteSync.prototype = {

    AUTO_FIELDS: 'sys_id,sys_created_by,sys_created_on,sys_id,sys_updated_by,sys_updated_on',

    createPayload: function(inputs, outputs) {
        outputs.payload = {};
        const record = this.getRecord(inputs);
        const fields = [...inputs.fields.split(','), ...this.AUTO_FIELDS.split(',')];
        this.setFields(record, fields, outputs);
        outputs.payload = JSON.stringify(outputs.payload);
    },

    createPayloadArr: function(inputs, outputs) {
        outputs.payload = {
			records: [],
		};
        const records = this.getRecordWindowed(inputs);
        const fields = [...inputs.fields.split(','), ...this.AUTO_FIELDS.split(',')];
        while (records.next()) {
            const tmp = {};
            for (let field of fields) {
                if (records.isValidField(field)) {
                    tmp[field] = records.getValue(field);
                }
            }
            outputs.payload.records.push(tmp);
        }
		outputs.payload = JSON.stringify(outputs.payload);
        outputs.offset = inputs.limit + 1;
        outputs.limit = inputs.limit + inputs.batch_size;
        outputs.batch_index = inputs.batch_index + 1;
    },

    makePostRequest: function(inputs, outputs) {
        var request = new sn_ws.RESTMessageV2();
        request.setEndpoint(`${inputs.base_url}api/now/table/${inputs.table}?sysparm_exclude_reference_link=true&sysparm_suppress_auto_sys_field=true`);
        request.setHttpMethod('POST');
        request.setAuthenticationProfile(inputs.auth_type, inputs.credential);
        request.setRequestHeader("Accept", "application/json");
        request.setRequestHeader('Content-Type', 'application/json');
        request.setRequestBody(inputs.payload);
        request.execute();
    },

    getBatchVariables: function(inputs, outputs) {
        var glideAggregate = new GlideAggregate(inputs.table);
        glideAggregate.addEncodedQuery(inputs.encoded_query);
        glideAggregate.addAggregate('COUNT');
        glideAggregate.query();
        if (glideAggregate.next()) {
            outputs.total_records = parseInt(glideAggregate.getAggregate('COUNT'));
            outputs.batch_index = 1;
            outputs.batch_size = gs.getProperty('scope_here.batch_size', 10);
            outputs.limit = outputs.batch_size;
            outputs.offset = 0;
            outputs.last_batch = Math.ceil(outputs.total_records / outputs.batch_size);
        }
    },

    //placeholder logic works but just ph for now
    makeBatchPostReq: function(inputs, outputs) {
        var totalRecords = 0;
        var batchIdx = 1;
        var batchSize = gs.getProperty('scope_placeholder.import_batch_size', 100);
        var limit = batchSize;
        var offSet = 0;
        var lastBatch = null;

        var usersAgg = new GlideAggregate('sys_user');
        usersAgg.addActiveQuery();
        usersAgg.addAggregate('COUNT');
        usersAgg.query();
        if (usersAgg.next()) {
            totalRecords = parseInt(usersAgg.getAggregate('COUNT'));
        }

        lastBatch = Math.ceil(totalRecords / batchSize);
        while (batchIdx <= lastBatch) {
            var userRecords = new GlideRecord('sys_user');
            userRecords.addActiveQuery();
            userRecords.chooseWindow(offSet, limit);
            userRecords.orderBy('user_name');
            userRecords.query();
            gs.print(userRecords.getRowCount());
            var cnt = 0;
            while (userRecords.next()) {
                cnt += 1;
            }
            offSet = limit;
            limit += batchSize;
            batchIdx += 1;
        }
    },

    getFieldType: function(gr, field) {
        const element = gr.getElement(field);
        const metaData = element.getED();
        const fieldType = metaData.getInternalType();
        return fieldType;
    },

    getRecord: function(inputs) {
        var gr = new GlideRecord(inputs.table);
        if (gr.get(inputs.record_id)) {
            return gr;
        }
    },

    getRecordWindowed: function(inputs) {
        var gr = new GlideRecord(inputs.table);
        gr.addEncodedQuery(inputs.encoded_query);
        gr.chooseWindow(inputs.offset, inputs.limit);
        gr.orderBy(inputs.order_by);
        gr.query();
        if (gr.hasNext()) {
            return gr;
        }
    },


    setFields: function(gr, fields, outputs) {
        for (let field of fields) {
            if (gr.isValidField(field)) {
                outputs.payload[field] = gr.getValue(field);
            }
        }
    },

    type: 'CMHRemoteSync'
};