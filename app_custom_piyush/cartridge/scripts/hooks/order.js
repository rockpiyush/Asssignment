'use strict';

var server = require('server');
var OrderMgr = require('dw/order/OrderMgr');
var Order = require('dw/order/Order');
var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var Logger = require('dw/system/Logger');
var Transaction = require('dw/system/Transaction');

var token;
var OrderNoList ='';
  
function send() {
    
    getAccessToken.call();
    var orderList = OrderMgr.queryOrders("custom.shipped = false or custom.shipped = null ",null,OrderMgr);

    Transaction.wrap(function()
    {
        while(orderList.hasNext())
        {
            var Order = orderList.next();
            OrderNoList+=Order.orderNo+',';
            Order.custom.shipped= true;
        }
    });
    Logger.warn('Order numbers list:  '+OrderNoList);
    postOrder.call();
}



var getAccessToken = LocalServiceRegistry.createService('Token_get', {
    createRequest: function (svc, args) {
        var url =svc.getConfiguration().getCredential().getURL();
        var user = svc.getConfiguration().getCredential().getUser();
        var password =svc.getConfiguration().getCredential().getPassword();
        
        Logger.warn('url:'+url);
        Logger.warn('user:'+user);
        Logger.warn('password:'+password);

        svc.setRequestMethod('POST');
        svc.setURL(url+'?grant_type=password&client_id=3MVG9fe4g9fhX0E7ISO6siVr7IppovDd0AG4VIixuydUN.s_fGSOt7Eibyd7DsizH3.F.rBuOa5ZRFYFqhgwz&client_secret=383CD61B70ADC7C14110B3E60B3BB0791B06091A2C356264507CE72600E19829&username='+user+'&password='+password+'1g3in6bHhKFvlkxqXYPXOIdmg');
    },
    parseResponse:function (svc, output){
        var obj=JSON.parse(output.text);
        token=obj.access_token;
        Logger.warn('token:'+token);
        return output;
    }         
});


var postOrder = LocalServiceRegistry.createService('Create_order_record', {
    createRequest: function (svc,args) {
        var url =svc.getConfiguration().getCredential().getURL();
        Logger.warn('url-:'+url);
        svc.setRequestMethod('POST');
        svc.addHeader('Authorization', 'Bearer '+token);
        svc.addHeader('Content-Type', 'application/json;charset=UTF-8');
        svc.setURL(url);
        svc.setEncoding('Done');
        
        svc.addParam("OrderNo",OrderNoList);
        
    },
    parseResponse:function (svc, output) {
        Logger.warn(output.text);
        return output;
    }
});



module.exports = {
    send: send
};