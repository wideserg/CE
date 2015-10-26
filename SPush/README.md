
#Developer Tools extension to auto save script/css files to SharePoint on the fly

![Example](../_promo/SPush/sample.gif?raw=true "Live usage example")

It is the quickest way to change and test content files of your SharePoint App. 
In addition it might be a good opportunity to fix some js/css bugs without need to deploy scripts using Visual Studio or provide new package of the app.

###Key features:

* __Cntrl+s__ forces js/css to be rewritten;
* Allows modifying SharePoint 2013 App content from the host web;
* Allows to automatically check-out js/css documents if "Require documents to be checked out before they can be edited" SPList option is True;
* Allows quick creation of sample js and css files by executing `SPush(typeOrUrl)` in console (see sample video in Links below):
	* `SPush('css')` - creates empty *style.css* and automatically load to current page;
	* `SPush('https://spswide.sharepoint.com/sites/dev/SiteAssets/folder1/mystyle.js')` - creates empty *mystyle.css* by provided url and automatically load to current page;
	* `SPush('js')` - creates empty *script.js* and automatically load to current page;
	* `SPush('https://spswide.sharepoint.com/sites/dev/SiteAssets/folder1/myscript.js')` - creates empty *myscript.js* by provided url and automatically load to current page;
	* Default library for sample css/js files is 'SiteAssets'. You can change it from SPush sidebar inside DevTools sources tab. (__relative web library Url should be used__)


Tested under SharePoint 2010+ (JSOM) on-prem.

I hope this simple tool will save your time!

Thanks!

###Links
[SPush in Chrome Store](https://chrome.google.com/webstore/detail/spush/bdeilgnnljmooaheogonhpggepnhhlhf)

[Video: SPush+SPTabs](https://www.youtube.com/watch?v=zwxY_AC1M1c)

###Change Log
0.63
* Fixed bug with saving in not root site collection.

0.64
* Fixed issue with relative URL while editing scripts of apps from the host web.

0.65
* DevTools error logging added.

0.66
* JSLink save issue is fixed.

0.67
* solved issue with saving files with comments and other spec chracters;
* 'style%20library' decoding issue is fixed.

1.0
* SPush(typeOrUrl) help file creation method is implemented;
* 'Library url' configureation is added.
 
###Known issues
* When you change your css from `Elements` panel using `Styles` SidebarPane, chrome automatically fires __Cntrl+s__, so your css is automaticall saved.
* `SPush(typeOrUrl)` might not load js/css to DevTools source tab when use not in list forms.
