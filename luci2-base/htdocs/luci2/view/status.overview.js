L.ui.view.extend({
	title: L.tr('Status'),

	renderContents: function() {
		var self = this;
		return $.when(
			L.network.refreshStatus().then(function() {
				var wan  = L.network.findWAN();
				var wan6 = L.network.findWAN6();

				if (!wan && !wan6)
				{
					$('#network_status_table').empty();
					return;
				}

				var networkTable = new L.ui.grid({
					caption: L.tr('Network'),
					columns: [ {
						width:    2,
						width_sm: 12,
						format:   '%s'
					}, {
						width:    2,
						width_sm: 3,
						align:  'right',
						format: function(v) {
							var dev = L.network.resolveAlias(v.getDevice());
							if (dev)
								return $('<span />')
									.addClass('badge')
									.attr('title', dev.description())
									.append($('<img />').attr('src', dev.icon()))
									.append(' %s'.format(dev.name()));

							return '';
						}
					}, {
						width:  6,
						width_sm: 9,
						format: function(v, n) {
							return new L.ui.hlist({ items: [
								L.tr('Type'), v.getProtocol().description,
								L.tr('Connected'), '%t'.format(v.getUptime()),
								L.tr('Address'), (n ? v.getIPv6Addrs() : v.getIPv4Addrs()).join(', '),
								L.tr('Gateway'), v.getIPv4Gateway(),
								L.tr('DNS'), (n ? v.getIPv6DNS() : v.getIPv4DNS()).join(', ')
							] }).render();
						}
					} ]
				});

				if (wan)
					networkTable.row([ L.tr('IPv4 WAN Status'), wan, wan ]);

				if (wan6)
					networkTable.row([ L.tr('IPv6 WAN Status'), wan6, wan6 ]);

				networkTable.insertInto('#network_status_table');
			}),
			L.system.getInfo().then(function(info) {
				var sysinfoTable = new L.ui.grid({
					caption: L.tr('System'),
					columns: [ {
						width:    4
					}, {
						width:    8,
						nowrap:   true
					} ]
				});

				sysinfoTable.rows([
					[ L.tr('Hostname'),         info.hostname                         ],
					[ L.tr('Model'),            info.model                            ],
					[ L.tr('Firmware Version'), info.release.revision              ],
					[ L.tr('Local Time'),       (new Date(info.localtime * 1000)).toLocaleString() ],
					[ L.tr('Uptime'),           '%t'.format(info.uptime)              ]
				]);

				sysinfoTable.insertInto('#system_status_table');
			})
		)
	},

	execute: function()
	{
		var self = this;
        return L.network.load().then(function() {
			self.repeat(self.renderContents, 5000);
        });
	}
});
