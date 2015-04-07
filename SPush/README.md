
#Developer Tools extension to auto save script/css files to SharePoint on the fly.

![Example](../_promo/SPush/sample.gif?raw=true "Live usage example")

[SPush in Chrome Store](https://chrome.google.com/webstore/detail/spush/bdeilgnnljmooaheogonhpggepnhhlhf)

It is the quickest way to change and test content files of your SharePoint App. 
In addition it might be a good opportunity to fix some js/css bugs without need to deploy scripts using Visual Studio or provide new package of the app.

Key features:

* Cntrl+s forces js or css to be rewritten.
* Allows modifying SharePoint 2013 App content from the host web
* Allows to automatically check-out js/css documents if "Require documents to be checked out before they can be edited" option is True.

Tested under SharePoint 2010+ (JSOM) on-prem.

I hope this simple tool will save your time!

Thanks!

###Change Log
0.63
* Fixed bug with saving in not root site collection.

0.64
* Fixed issue with relative URL while editing scripts of apps from the host web.
