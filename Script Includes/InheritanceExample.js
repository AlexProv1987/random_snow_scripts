var CMHWUQuickActions = Class.create();
CMHWUQuickActions.prototype = Object.extendsObject(CMHSoWQuickActions, {

    //override parent
    REQUEST_ITEM: gs.getProperty('cmh_sow_walk_up_ritm'),

    getRFVChoices: function() {

        var location = this.getParameter('sysparm_interaction_loc');
        var reasonsArr = this._getReasonsByLocation(location);
        var choiceObjArr = [];

        if (reasonsArr.length === 0) {
            return JSON.stringify(this._setResponseStatus(404, null));
        }

        for (var i = 0; i < reasonsArr.length; i++) {
            choiceObjArr.push({
                displayValue: reasonsArr[i],
                value: reasonsArr[i],
            });
        }

        return JSON.stringify(this._setResponseStatus(200, choiceObjArr));
    },

    _getLocationQueue: function(locationID) {
        var walkUpQueueLoc = new GlideRecord('wu_location_queue');
        walkUpQueueLoc.addQuery('location', '=', locationID);
        walkUpQueueLoc.addActiveQuery();
        walkUpQueueLoc.setLimit(1);
        walkUpQueueLoc.query();
        if (!walkUpQueueLoc.hasNext()) {
            return null;
        }
        while (walkUpQueueLoc.next()) {
            return walkUpQueueLoc;
        }
    },

    _getReasonsByLocation: function(locationID) {
        var myArr = [];
        var reasonsForVisit = new GlideRecord('wu_m2m_location_queue_reason');
        reasonsForVisit.addQuery('wu_location_queue.location', '=', locationID);
		reasonsForVisit.orderBy('wu_reason');
        reasonsForVisit.query();
        while (reasonsForVisit.next()) {
            myArr.push(reasonsForVisit.getDisplayValue('wu_reason'));
        }
        return myArr;
    },

    //overrideParent - bc william didnt do it right the first time
    _sendCartRequest: function(pk, name) {

        //req item sysid
        var reqItem = this.REQUEST_ITEM;

        if (!reqItem) {
            return JSON.stringify(this._setResponseStatus(404));
        }

        //sending record obj
        var interaction = this._getInteraction(pk);

        if (!interaction) {
            return JSON.stringify(this._setResponseStatus(404));
        }

        //catalog item obj
        var item = this._createItem(reqItem, interaction, name);

        if (!item) {
            return JSON.stringify(this._setResponseStatus(400));
        }

        //new instance of cartJS to send request
        var cart = new sn_sc.CartJS();
        cart.addToCart(item);
        var response = cart.checkoutCart();

        //no sys_id found in response return bad
        var newReq = this._IsCheckoutSuccess(response);
        if (!newReq) {
            return JSON.stringify(this._setResponseStatus(400));
        }


        //returns the ritm object after updating if its null return since we shouldnt continue
        var ritmRecord = this._updateRITMRecord(newReq, interaction);

        if (!ritmRecord) {
            return JSON.stringify(this._setResponseStatus(500));
        }

        //relate new ritm to interaction
        this._relateRecord(interaction, ritmRecord);

        //update the interaction
        this._closeInteraction(interaction, this._getObjURL(ritmRecord) + " created and associated to interaction.");

        return JSON.stringify(this._setResponseStatus(201));

    },

    //overrideParent
    _setResponseStatus: function(value, respData) {
        this.RESPONSE_STATUS = value;
        return {
            status: this.RESPONSE_STATUS,
            data: respData ? respData : null
        };
    },



    type: 'CMHWUQuickActions'
});