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
        }
    },

    getFieldType: function(gr, field) {
        const element = gr.getElement(field);
        const metaData = element.getED();
        const fieldType = metaData.getInternalType();
        return fieldType;
    },

    getRecord: function(inputs, outputs) {
        var gr = new GlideRecord(inputs.table);
        if (gr.get(inputs.record_id)) {
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