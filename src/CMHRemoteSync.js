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
        //todo - since we are wanting a hard copy including sys_id and just to account for source fields not matching target well go ahead and use the actual import set tables sys_transform_entries.
        //outputs.payload = this.setPayloadToTransformMap(outputs.payload,inputs.transform_map);
        outputs.offset = inputs.limit;
        outputs.limit = inputs.limit + inputs.batch_size;
        outputs.batch_index = inputs.batch_index + 1;
    },

    makePostRequest: function(inputs, outputs) {
        var request = new sn_ws.RESTMessageV2();
        request.setEndpoint(`${inputs.base_url}${inputs.api_url}${inputs.query_params}`);
        request.setHttpMethod('POST');
        //sys_auth_profile_basic or oauth
        request.setAuthenticationProfile(inputs.auth_type, inputs.credential);
        request.setRequestHeader("Accept", "application/json");
        request.setRequestHeader('Content-Type', 'application/json');
        request.setRequestBody(inputs.payload);
        var response = request.execute();
        //return response code as output here
    },

    getBatchVariables: function(inputs, outputs) {
        var glideAggregate = new GlideAggregate(inputs.table);
        glideAggregate.addEncodedQuery(inputs.encoded_query);
        glideAggregate.addAggregate('COUNT');
        glideAggregate.query();
        if (glideAggregate.next()) {
            outputs.total_records = parseInt(glideAggregate.getAggregate('COUNT'));
            outputs.batch_index = 1;
            outputs.batch_size = gs.getProperty('scope_here.batch_size', 100);
            outputs.limit = outputs.batch_size;
            outputs.offset = 0;
            outputs.last_batch = Math.ceil(outputs.total_records / outputs.batch_size);
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

    getTransformEntries: function(inputs, outputs) {
        outputs.transform_map = [];
        var gr = new GlideRecord('sys_transform_entry');
        gr.addQuery('source_table', '=', inputs.source_table);
        gr.query();
        while (gr.next()) {
            outputs.transform_map.push({
                source_field: gr.getValue('source_field'),
                target_field: gr.getValue('target_field'),
            });
        }
        outputs.transform_map = JSON.stringify(outputs.transform_map);
    },

    setPayloadToTransformMap: function(map, outputs) {
        //..to do called from createbatchpayload
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