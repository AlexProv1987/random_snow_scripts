var totalRecords = 0;
var batchIdx = 1;
var batchSize = 100;
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
gs.print('Last Batch ' + lastBatch);


gs.print('Total Records: ' + totalRecords);
gs.print('Initial OffSet ' + offSet);
gs.print('Original Limit ' + limit);


while (batchIdx <= lastBatch) {
	
    gs.print('enter Loop');
    gs.print('Offset ' + offSet);
    gs.print('Limit ' + limit);
    gs.print('Curr Idx ' + batchIdx);
	
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

    gs.print('Record Batch CNT ' + cnt);

    offSet = limit;
    limit += batchSize;
    batchIdx += 1;
}
