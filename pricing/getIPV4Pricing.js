import {
  Pricing,
  GetProductsCommand,
  // GetProductsCommandInput,
  // PricingPaginationConfiguration,
  paginateGetProducts,
} from "@aws-sdk/client-pricing";
(async () => {
  const pricingClient = new Pricing({
    region: "us-east-1",
    endpoint: "https://api.pricing.us-east-1.amazonaws.com",
  });
  const pricingPaginatorConfig = {
    client: pricingClient,
    pageSize: 25,
  };
  const input = {
    ServiceCode: "AmazonVPC",
    Filters: [
      {
        Type: "TERM_MATCH",
        Field: "group",
        Value: "VPCPublicIPv4Address",
      },
      {
        Type: "TERM_MATCH",
        Field: "regionCode",
        Value: "ap-south-1",
      },
    ],
    FormatVersion: "aws_v1",
    // NextToken: "?",
    MaxResults: 1,
  };
  const command = new GetProductsCommand(input);

  const paginator = paginateGetProducts(pricingPaginatorConfig, input);

  // Paginate until there are no more results
  const products = [];
  for await (const page of paginator) {
    products.push(...page.PriceList);
  }

  console.log(products);
})();

// consol log of the results
// [
// 	[String (LazyJsonString): '{"product":{"attributes":{"regionCode":"ap-south-1","servicecode":"AmazonVPC","groupDescription":"Hourly charge for Idle Public IPv4 Addresses","usagetype":"APS3-PublicIPv4:IdleAddress","locationType":"AWS Region","location":"Asia Pacific (Mumbai)","servicename":"Amazon Virtual Private Cloud","operation":"","group":"VPCPublicIPv4Address"},"sku":"CSRJTKHMAVNJSJAK"},"serviceCode":"AmazonVPC","terms":{"OnDemand":{"CSRJTKHMAVNJSJAK.JRTCKXETXF":{"priceDimensions":{"CSRJTKHMAVNJSJAK.JRTCKXETXF.6YS6EN2CT7":{"unit":"Hrs","endRange":"Inf","description":"$0.005 per Idle public IPv4 address per hour","appliesTo":[],"rateCode":"CSRJTKHMAVNJSJAK.JRTCKXETXF.6YS6EN2CT7","beginRange":"0","pricePerUnit":{"USD":"0.0050000000"}}},"sku":"CSRJTKHMAVNJSJAK","effectiveDate":"2024-06-01T00:00:00Z","offerTermCode":"JRTCKXETXF","termAttributes":{}}}},"version":"20240709181629","publicationDate":"2024-07-09T18:16:29Z"}'],
// 	[String (LazyJsonString): '{"product":{"attributes":{"regionCode":"ap-south-1","servicecode":"AmazonVPC","groupDescription":"Hourly charge for In-use Public IPv4 Addresses","usagetype":"APS3-PublicIPv4:InUseAddress","locationType":"AWS Region","location":"Asia Pacific (Mumbai)","servicename":"Amazon Virtual Private Cloud","operation":"","group":"VPCPublicIPv4Address"},"sku":"H6SHSM3KDNNZRM9E"},"serviceCode":"AmazonVPC","terms":{"OnDemand":{"H6SHSM3KDNNZRM9E.JRTCKXETXF":{"priceDimensions":{"H6SHSM3KDNNZRM9E.JRTCKXETXF.6YS6EN2CT7":{"unit":"Hrs","endRange":"Inf","description":"$0.005 per In-use public IPv4 address per hour","appliesTo":[],"rateCode":"H6SHSM3KDNNZRM9E.JRTCKXETXF.6YS6EN2CT7","beginRange":"0","pricePerUnit":{"USD":"0.0050000000"}}},"sku":"H6SHSM3KDNNZRM9E","effectiveDate":"2024-06-01T00:00:00Z","offerTermCode":"JRTCKXETXF","termAttributes":{}}}},"version":"20240709181629","publicationDate":"2024-07-09T18:16:29Z"}']
//   ]

