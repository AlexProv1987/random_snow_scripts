var ritms = new GlideRecord('sc_req_item');
ritms.addEncodedQuery('active=false^cat_item!=8a5dadd61b12c810af4262007e4bcbba^cat_item!=e347dd5d1bcd7490af4262007e4bcbde^request.active=true');
ritms.query();
gs.print(ritms.getRowCount()); 
while(ritms.next()){
	if(hasOtherActiveRitms(ritms.getValue('request'))){
		gs.print('REQ had other active RITMS');
	}else{
		gs.print('REQ had no other active RITMS do whatever here');
	}
}


function hasOtherActiveRitms(reqID){
	var gr = new GlideRecord('sc_req_item');
	gr.addActiveQuery();
	gr.addQuery('request','=',reqID);
	gr.query();
	if(gr.hasNext()){
		return true;
	}
	return false;
}