/** SpagoBI, the Open Source Business Intelligence suite

 * Copyright (C) 2012 Engineering Ingegneria Informatica S.p.A. - SpagoBI Competency Center
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0, without the "Incompatible With Secondary Licenses" notice. 
 * If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. **/

Ext.ns("Sbi.cockpit.editor");

Sbi.cockpit.editor.WidgetEditorDatasetsBrowser = function(config) { 

	var defaultSettings = {		
		autoScroll: true
	};
		
	if(Sbi.settings && Sbi.cockpit && Sbi.cockpit.editor && Sbi.cockpit.editor.widgetEditorDatasetsBrowser) {
		defaultSettings = Ext.apply(defaultSettings, Sbi.cockpit.editor.widgetEditorDatasetsBrowser);
	}

	
	var c = Ext.apply(defaultSettings, config || {});
	
	Ext.apply(this, c);
	
	this.initServices();
	this.initToolbar();
	this.initViewPanel();
	
	this.items = [this.bannerPanel,this.viewPanel];
		
	Sbi.cockpit.editor.WidgetEditorDatasetsBrowser.superclass.constructor.call(this, c);
	
};

Ext.extend(Sbi.cockpit.editor.WidgetEditorDatasetsBrowser, Ext.Panel, {
	
	services: null
  , store: null
  , widgetManager: null
  , id:'this' 
  , activeFilter: null
	
  , initServices : function() {
		this.services = [];

		this.showDataset('UsedDataSet'); //for default are shown dataset already used in the cockpit 
		
	}
    
	, initToolbar: function() {

			var bannerHTML = this.createBannerHtml({});
			this.bannerPanel = new Ext.Panel({
				height: 70, //105,
				border:0,
			   	autoScroll: false,
			   	html: bannerHTML
			});			
		
	}
	
	, initViewPanel: function() {
		var config = {};
		config.services = this.services;
		config.store = this.store;
		config.widgetManager = this.widgetManager;
		config.actions = this.actions;
		config.user = this.user;
		config.fromMyDataCtx = this.displayToolbar;
		config.activeFilter = this.activeFilter;
		this.viewPanel = new Sbi.cockpit.editor.WidgetEditorDatasetsView(config);
		this.viewPanel.addListener('click', this.onClick, this);

	}
	
	, activateFilter: function(datasetType){
		
		if (datasetType == 'MyDataSet'){			
			baseParams ={};
			baseParams.isTech = false;
			baseParams.showOnlyOwner = true;
			baseParams.typeDoc = this.typeDoc;

			this.services["list"] = Sbi.config.serviceRegistry.getRestServiceUrl({
				serviceName : 'selfservicedataset',
				baseParams : baseParams,
				baseUrl:{contextPath: 'SpagoBI', controllerPath: 'servlet/AdapterHTTP'}
			});		
			
			
		} else if (datasetType == 'EnterpriseDataSet'){			
			baseParams ={};
			baseParams.isTech = true;
			baseParams.showOnlyOwner = false;
			baseParams.typeDoc = this.typeDoc;

			this.services["list"] = Sbi.config.serviceRegistry.getRestServiceUrl({
				serviceName : 'certificateddatasets',
				baseParams : baseParams,
				baseUrl:{contextPath: 'SpagoBI', controllerPath: 'servlet/AdapterHTTP'}
			});
	
			
		} else if (datasetType == 'SharedDataSet'){
			baseParams ={};
			baseParams.isTech = false;
			baseParams.showOnlyOwner = false;
			baseParams.typeDoc = this.typeDoc;

			this.services["list"] = Sbi.config.serviceRegistry.getRestServiceUrl({
				serviceName : 'certificateddatasets',
				baseParams : baseParams,
				baseUrl:{contextPath: 'SpagoBI', controllerPath: 'servlet/AdapterHTTP'}
			});
		
			
		} else if (datasetType == 'AllDataSet' || datasetType == 'UsedDataSet'){

			baseParams ={};
			baseParams.isTech = false;
			baseParams.showOnlyOwner = false;
			baseParams.typeDoc = this.typeDoc;
			baseParams.allMyDataDs = true;

			this.services["list"] = Sbi.config.serviceRegistry.getRestServiceUrl({
				serviceName : 'certificateddatasets',
				baseParams : baseParams, 
				baseUrl:{contextPath: 'SpagoBI', controllerPath: 'servlet/AdapterHTTP'}
			});
		
		}
	}
	
	//Show only the dataset of the passed type
	, showDataset: function(datasetType) { 
		this.activeFilter = datasetType;
		
		var scope = this;
		var sm = this.widgetManager.getStoreManager();

		if (Ext.get('list-tab') != null){
			var tabEls = Ext.get('list-tab').dom.childNodes;
			
			//Change active dataset type on toolbar
			for(var i=0; i< tabEls.length; i++){
				//nodeType == 1 is  Node.ELEMENT_NODE
				if (tabEls[i].nodeType == 1){
					if (tabEls[i].id == datasetType){					
						tabEls[i].className += ' active '; //append class name to existing others
					} else {
						tabEls[i].className = tabEls[i].className.replace( /(?:^|\s)active(?!\S)/g , '' ); //remove active class
					}
				}
			}
		}
		//Change content of DatasetView
		this.activateFilter(datasetType);
		if (datasetType == 'UsedDataSet'){
			this.createButtonVisibility(true);
		} else if (datasetType == 'MyDataSet'){
			this.createButtonVisibility(true);
		} else if (datasetType == 'EnterpriseDataSet'){
			this.createButtonVisibility(false);
		} else if (datasetType == 'SharedDataSet'){
			this.createButtonVisibility(false);
		} else if (datasetType == 'AllDataSet'){
			this.createButtonVisibility(true);
		}	
		
		
		this.store = new Ext.data.JsonStore({
			 url: this.services['list']
			 , root: 'root'
			 , fields: ["id",
			    	 	"label",
			    	 	"name",
			    	 	"description",
			    	 	"typeCode",
			    	 	"typeId",
			    	 	"encrypt",
			    	 	"visible",
			    	 	"engine",
			    	 	"engineId",
			    	 	"dataset",
			    	 	"stateCode",
			    	 	"stateId",
			    	 	"functionalities",
			    	 	"creationDate",
			    	 	"creationUser",
			    	 	"refreshSeconds",
			    	 	"isPublic",
			    	 	"actions",
			    	 	"exporters",
			    	 	"decorators",
			    	 	"previewFile",
			    	 	"isUsed" /*local property*/]
		});	
	
		
		//load store and refresh datasets view
		this.store.load(function(records, operation, success) {});	

		if (this.viewPanel){
			this.viewPanel.activeFilter = this.activeFilter;
			this.viewPanel.bindStore(this.store);
			this.viewPanel.refresh();
		}
	}
	
	, createButtonVisibility: function(visible){
		var dh = Ext.DomHelper;	
		if (visible == true){
			//check if button already present
			var button = Ext.get('newDataset');
			if (!button){
				//add button
		        if (this.user !== '' && this.user !== this.PUBLIC_USER){
		        	var createButton = ' <a id="newDataset" href="#" onclick="javascript:Ext.getCmp(\'this\').addNewDataset(\'\')" class="btn-add"><span class="highlighted">'+LN('sbi.generic.create')+'</span> '+LN('sbi.browser.document.dataset')+'<span class="plus">+</span></a> ';
		        	var actionsDiv = Ext.get('list-actions').dom;
		        	dh.insertHtml('afterBegin',actionsDiv,createButton);
		        }
			}
		} else {
			//remove button if exist
			if (Ext.get('newDataset') != null && Ext.get('newDataset') != undefined){
				var button = Ext.get('newDataset').dom;
				if (button){
					button.parentNode.removeChild(button);
				}				
			}
		}
	}

	, createBannerHtml: function(communities){	
		var createButton = '';

        var activeClass = '';
        var bannerHTML = ''+
     		'<div class="main-datasets-list"> '+
    		'    <div class="list-actions-container"> '+ //setted into the container panel
    		'		<ul class="list-tab" id="list-tab"> ';
        
        if (Sbi.settings.mydata.showUsedDataSetFilter){	
	    	if (Sbi.settings.mydata.defaultFilter == 'UsedDataSet'){
	    		activeClass = 'active';
	    	} else {
	    		activeClass = '';
	    	}
	    	bannerHTML = bannerHTML+	
	    	'	    	<li class="first '+activeClass+'" id="UsedDataSet"><a href="#" onclick="javascript:Ext.getCmp(\'this\').showDataset( \'UsedDataSet\')">'+LN('sbi.mydata.useddataset')+'</a></li> '; 
        }
        if (Sbi.settings.mydata.showMyDataSetFilter){	
        	if (Sbi.settings.mydata.defaultFilter == 'MyDataSet'){
        		activeClass = 'active';
        	} else {
        		activeClass = '';
        	}
        	bannerHTML = bannerHTML+	
        	'	    	<li class="first '+activeClass+'" id="MyDataSet"><a href="#" onclick="javascript:Ext.getCmp(\'this\').showDataset( \'MyDataSet\')">'+LN('sbi.mydata.mydataset')+'</a></li> '; 
        }	
        if (Sbi.settings.mydata.showEnterpriseDataSetFilter){
        	if (Sbi.settings.mydata.defaultFilter == 'EnterpriseDataSet'){
        		activeClass = 'active';
        	} else {
        		activeClass = '';
        	}
        	bannerHTML = bannerHTML+	
    		'	    	<li class="'+activeClass+'" id="EnterpriseDataSet"><a href="#" onclick="javascript:Ext.getCmp(\'this\').showDataset( \'EnterpriseDataSet\')">'+LN('sbi.mydata.enterprisedataset')+'</a></li> ';    
        }
         if (Sbi.settings.mydata.showSharedDataSetFilter){
         	if (Sbi.settings.mydata.defaultFilter == 'SharedDataSet'){
        		activeClass = 'active';
        	} else {
        		activeClass = '';
        	}
         	bannerHTML = bannerHTML+	
     		'	    	<li class="'+activeClass+'" id="SharedDataSet"><a href="#" onclick="javascript:Ext.getCmp(\'this\').showDataset( \'SharedDataSet\')">'+LN('sbi.mydata.shareddataset')+'</a></li> ';    	
         }
         if (Sbi.settings.mydata.showAllDataSetFilter){
          	if (Sbi.settings.mydata.defaultFilter == 'AllDataSet'){
        		activeClass = 'active';
        	} else {
        		activeClass = '';
        	}
          	bannerHTML = bannerHTML+	
    		'	    	<li id="AllDataSet" class="last '+activeClass+'"><a href="#" onclick="javascript:Ext.getCmp(\'this\').showDataset( \'AllDataSet\')">'+LN('sbi.mydata.alldataset')+'</a></li> ';    		    		    		    		        	 
         }
        
         bannerHTML = bannerHTML+
            '		</ul> '+
    		'	    <div id="list-actions" class="list-actions"> '+
    					createButton +
//    		'	        <form action="#" method="get" class="search-form"> '+
//    		'	            <fieldset> '+
//    		'	                <div class="field"> '+
//    		'	                    <label for="search">'+LN('sbi.browser.document.searchDatasets')+'</label> '+
//    		'	                    <input type="text" name="search" id="search" onclick="this.value=\'\'" onkeyup="javascript:Ext.getCmp(\'this\').filterStore(this.value)" value="'+LN('sbi.browser.document.searchKeyword')+'" /> '+
//    		'	                </div> '+
//    		'	                <div class="submit"> '+
//    		'	                    <input type="text" value="Cerca" /> '+
//    		'	                </div> '+
//    		'	            </fieldset> '+
//    		'	        </form> '+
//    		'	         <ul class="order" id="sortList">'+
//    		'	            <li id="dateIn" class="active"><a href="#" onclick="javascript:Ext.getCmp(\'this\').sortStore(\'dateIn\')">'+LN('sbi.ds.moreRecent')+'</a> </li> '+
//    		'	            <li id="name"><a href="#" onclick="javascript:Ext.getCmp(\'this\').sortStore(\'name\')">'+LN('sbi.ds.name')+'</a></li> '+
//    		'	            <li id="owner"><a href="#" onclick="javascript:Ext.getCmp(\'this\').sortStore(\'owner\')">'+LN('sbi.ds.owner')+'</a></li> '+
//    		'	        </ul> '+
    		'	    </div> '+
    		'	</div> '+
    		'</div>' ;

        return bannerHTML;
    }
	
	, onClick : function(obj, i, node, e) {
		var actionSelect = e.getTarget('div[class=select]',10,true);
		
		var s = obj.getStore();
		var r = s.getAt(s.findExact('label',node.id));
		if (r){
			r = r.data;
		}
		
		if (actionSelect != null){
			 Sbi.debug('WidgetEditorWizardPanel clicked on dataset...[' + r.name + ']');
		     	    
		     if (this.widgetManager.existsStore(r.label) ){ 		
		    	 var deleteStore = false;
		    	 if (this.widgetManager.getWidgetUsedByStore(r.label).getCount()>1){
		    		 //asks confirm is the store is used by more widgets
//			    	 Ext.MessageBox.confirm(
//			 				LN('sbi.generic.pleaseConfirm')
//	//		 				, LN('sbi.generic.confirmDelete')
//			 				, 'Il dataset pu� essere in uso da altri widget, vuoi procedere con la deselezione?'
//			 	            , function(btn, text) {
//			 					 if ( btn == 'yes' ) {
//			 						deleteStore = true;
//			 					 }
//			 				}
//			 				, this
//			 			);
		    		 alert('Operazione non consentita. Il dataset e\' utilizzato da altri widgets!');
		    	 }else{
		    		 deleteStore = true;
		    	 }
		    	 if (deleteStore){
		    		this.widgetManager.removeStore(r.label);
					this.viewPanel.refresh();
		    	 }
		     }else{
		    	 var storeConfig = {};
			     storeConfig.dsLabel = r.label;	
			     this.widgetManager.addStore(storeConfig);
			     this.widget.dataset =  r.label; 	
			     this.viewPanel.refresh();
		     }
		}
    	return true;
	}

});
