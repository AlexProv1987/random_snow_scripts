var request = new sn_ws.RESTMessageV2();
request.setEndpoint('https://dev303287.service-now.com/api/now/import/imp_user/insertMultiple');
request.setHttpMethod('POST');

var payload = {
records: [{
first_name: 'Bob',
last_name: 'Builder',
email: 'test55@gmail.com',
user_id: '55555575'
},
{
first_name: 'Bob2',
last_name: 'Builder2',
email: 'test66@loser.com',
user_id: '555555556'
}

]
}
request.setAuthenticationProfile('basic or oauth2', 'sys_id');
request.setRequestHeader("Accept", "application/json");
request.setRequestHeader('Content-Type', 'application/json');
request.setRequestBody(JSON.stringify(payload));
var response = request.execute();
gs.print(response.getBody());