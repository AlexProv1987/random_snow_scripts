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
            fields.forEach((field, idx) => {
                if (records.isValidField(field)) {
                    tmp[field] = records.getValue(field);
                }
            });
            outputs.payload.records.push(tmp);
        }

        if (inputs.transform_map) {
            this.setPayloadToTransformMap(outputs, JSON.parse(inputs.transform_map));
        } else {
            outputs.payload = JSON.stringify(outputs.payload);
        }

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
        outputs.status = response.getStatusCode();
    },

    getBatchVariables: function(inputs, outputs) {
        var glideAggregate = new GlideAggregate(inputs.table);
        glideAggregate.addEncodedQuery(inputs.encoded_query);
        glideAggregate.addAggregate('COUNT');
        glideAggregate.query();
        if (glideAggregate.next()) {
            outputs.total_records = parseInt(glideAggregate.getAggregate('COUNT'));
            outputs.batch_index = 1;
            outputs.batch_size = gs.getProperty('cmh.remote.sync.batch_size', 100);
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

    setPayloadToTransformMap: function(outputs, map) {
        const newPayload = {
            records: [],
        };
		//this should never happen but still edge case
        if (outputs.payload?.records?.length === 0) {
            return;
        }
		//this should be an array of objects with same props - grab first idx keys to avoid looped call
        const keys = Object.keys(outputs.payload.records[0]);
        outputs.payload.records.forEach((item, idx) => {
            keys.forEach((key, index) => {
				const mapObj = map.find(obj => obj.target_field === key);
				if(mapObj){
					if(mapObj.source_field !== key){
						item[mapObj.source_field] = item[key];
						delete item[key];
					}
				}else{
					//optional we either let the api handle this or clean the payload of items not accepted
					//delete item[key];
				}
            });
            newPayload.records.push(item);
        });
        outputs.payload = JSON.stringify(newPayload);
    },

    setFields: function(gr, fields, outputs) {
        fields.forEach((field, idx) => {
            if (gr.isValidField(field)) {
                outputs.payload[field] = gr.getValue(field);
            }
        });
    },

    type: 'CMHRemoteSync'
};