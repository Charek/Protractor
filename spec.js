// spec.js
fs = require('fs');

const { Client } = require('@elastic/elasticsearch');
const client = new Client({
node: 'http://saxon1.fyre.ibm.com:9200'});

function writeScreenShot(data, filename) {
  var stream = fs.createWriteStream(filename);
  stream.write(new Buffer(data, 'base64'));
  stream.end();
}

describe('Aurora End to End Test', function() {
  var tests = ["Homepage", "Browse", "AddtoCart","ViewCart","CheckOut", "CreateShippingBillingAddress","InputPayment","SubmitOrder"];
  var test_id=0;

   beforeEach(function (done) {
      console.log('BeforeEach:',tests[test_id]);
      browser.params.proxy.startHAR(browser.params.proxyData.port, tests[test_id], done);
    });

    afterEach(async function (done) {
     console.log("Aftereach Start",tests[test_id],new Date(Date.now()).toLocaleString());
     await browser.sleep(3000);
     
     await browser.params.proxy.getHAR(browser.params.proxyData.port, async function (err, harData) {
       // fs.writeFileSync(tests[test_id]+'.har', harData, 'utf8');
        har = JSON.parse(harData);
        
       var items=[];
        har.log.entries.forEach(element => {
            items.push({ index:  { _index: 'har', _type: '_doc'}},element);
        });
        
        var har_object={};
            har_object["har"]=JSON.stringify(har);
              har_object["startTime"]=har.log.pages[0].startedDateTime;
              har_object["name"]=har.log.pages[0].id;
            //  console.log(har_object);
         fs.writeFileSync(tests[test_id]+'.txt', JSON.stringify(har_object), 'utf8');
        
         const { body: bulkResponse }= await client.bulk({body: items});
          if (bulkResponse.errors) {
            const erroredDocuments = []
            // The items array has the same order of the dataset we just indexed.
            // The presence of the `error` key indicates that the operation
            // that we did for the document has failed.
            bulkResponse.items.forEach((action, i) => {
              const operation = Object.keys(action)[0]
              if (action[operation].error) {
                erroredDocuments.push({
                  // If the status is 429 it means that you can retry the document,
                  // otherwise it's very likely a mapping error, and you should
                  // fix the document before to try it again.
                  status: action[operation].status,
                  error: action[operation].error,
                  operation: body[i * 2],
                  document: body[i * 2 + 1]
                })
              }
            })
            console.log(erroredDocuments)
          }
        
          const { body: count } = await client.count({ index: 'har' })
          console.log(count)


        test_id++;
        done();
        console.log("Aftereach End",tests[test_id],new Date(Date.now()).toLocaleString());
       });
    });

 
  it('Homepage', async function() {

      await browser.get('https://www.lemockimplementation.com/shop/en/leesite');
        expect(await browser.getTitle()).toEqual('Welcome to LEEsite'); 
      });

  it('Browse', async function() {
      var site_map_link=await element(by.id('footerSiteMapLink'));
      await browser.wait(protractor.ExpectedConditions.elementToBeClickable(site_map_link), 5000);
      await site_map_link.click();

      var categories=await element.all(by.css("[id^=SiteMap_]"));
      var category_link =categories[Math.floor(Math.random()*categories.length)];
      await browser.wait(protractor.ExpectedConditions.elementToBeClickable(category_link), 5000);
      await  category_link.click();

      var facets=await element.all(by.css("[id^=facetLabel_]"));
      var facet_link=facets[Math.floor(Math.random()*facets.length)];
      await browser.wait(protractor.ExpectedConditions.elementToBeClickable(facet_link), 5000);
      await facet_link.click();

      var products=await element.all(by.css("[id^=WC_CatalogEntry]"));
      var product_link = products[Math.floor(Math.random()*products.length)];
      await browser.wait(protractor.ExpectedConditions.elementToBeClickable(product_link), 5000);
      await product_link.click();
  });




  it('AddtoCart', async function() {
    await element.all(by.className('quantity_input')).first().clear().sendKeys('2');
    await element(by.id("add2CartBtn")).click();
   });


   it('ViewCart',  async function() {

    var button=await element(by.css("[id^=GotoCartButton"));
    await browser.wait(protractor.ExpectedConditions.elementToBeClickable(button), 5000);
    await button.click();
    });

  it('CheckOut', async function() {
 
    var button = await element(by.id("guestShopperContinue"));
    await browser.wait(protractor.ExpectedConditions.elementToBeClickable(button), 5000);
    await button.click();

  });


  it('GuestShippingBilling', async function() {
      var text = await element.all(by.name("nickName")).first();
      // var EC = protractor.ExpectedConditions;
  
      await browser.wait(protractor.ExpectedConditions.elementToBeClickable(text), 5000);
      await text.clear().sendKeys('customerNick');
      await element.all(by.name("lastName")).first().clear().sendKeys('customerLast');
      await element.all(by.name("address1")).first().clear().sendKeys('8200 Warden Avenue');
      await element.all(by.name("city")).first().clear().sendKeys('Markham');

      //country
      await element.all(by.name("country")).first().element(by.cssContainingText('option', 'Canada')).click()


      await element.all(by.name("email1")).first().clear().sendKeys('customer@test.ibm.com');
      await element.all(by.name("zipCode")).first().clear().sendKeys('L6G 1C7');
      await element(by.name("SameShippingAndBillingAddress")).click();
      
      await element(by.id("WC_UnregisteredCheckout_links_4")).click();
      

    });

    it('Payment', async function() {
      var payMethod = await element.all(by.name("payMethodId")).first();
      await browser.wait(protractor.ExpectedConditions.elementToBeClickable(payMethod), 5000);
      await payMethod.click()

      await element.all(by.cssContainingText('option', 'Cash on delivery ')).first().click();
      await element(by.id("shippingBillingPageNext")).click();
      

    });

    it('SubmitOrder', async function() {
      var button = await element(by.id("singleOrderSummary"))
      await browser.wait(protractor.ExpectedConditions.elementToBeClickable(button), 5000);
      await button.click();
    });



});