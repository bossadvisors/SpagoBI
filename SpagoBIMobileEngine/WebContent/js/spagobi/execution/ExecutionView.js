app.views.ExecutionView = Ext.extend(Ext.Panel,

		{
	    fullscreen: true,
	    //type: 'light',
	    tabBar: {
            dock: 'top',
            height: 0,
            layout: {
                pack: 'center'
            }
        },


		initComponent: function ()	{
			this.title = 'Execution view';
			console.log('init Execution view');
	        this.bottomTools = new app.views.BottomToolbar({parameters: this.parameters});
	        this.dockedItems= [this.bottomTools];

			
			app.views.tableExecutionPanel = new app.views.TableExecutionPanel();
			app.views.chartExecutionPanel = new app.views.ChartExecutionPanel({fullscreen: true});
			app.views.composedExecutionPanel = new app.views.ComposedExecutionPanel();
			
		    Ext.apply(this, {
		        items: [
		            app.views.tableExecutionPanel,
		            app.views.chartExecutionPanel,
		            app.views.composedExecutionPanel
		        ]
		    });
			app.views.ExecutionView.superclass.initComponent.apply(this, arguments);

		}
		, setWidget: function(resp, type) {
			if (type == 'table'){
				app.views.tableExecutionPanel.setTableWidget(resp);
				this.widget = app.views.tableExecutionPanel;
			}
			if (type == 'chart'){
				app.views.chartExecutionPanel.setChartWidget(resp);
				this.widget = app.views.chartExecutionPanel;
			}
			if (type == 'composed'){
				app.views.composedExecutionPanel.setComposedWidget(resp);
				this.widget = app.views.composedExecutionPanel;
			}
		}
		
		,
		setExecutionInstance : function (executionInstance) {
			this.widget.setExecutionInstance(executionInstance);
		}
		
		, setWidgetComposed: function(resp, type, panel){
			if(type == 'table'){
				panel.setTableWidget(resp, true);
			}
			if(type == 'chart'){
				panel.setChartWidget(resp, true);
			}
			if(type == 'composed'){
				panel.setComposedWidget(resp, true);
			}
		}
});