L.ui.view.extend({
	execute: function() {
		var self = this;
		
		var m = new L.cbi.Map('firewall', {
			caption:     L.tr('Firewall'),
			tabbed:      true
		});

		var pf = m.section(L.cbi.TableSection, 'redirect', {
			caption:		L.tr('Port Forwards'),
			sortable:		true,
			anonymous:  	true,
			addremove:  	true,
			add_caption: 	L.tr('Add'),
			remove_caption: L.tr('Remove')
		});

        pf.on('add', function(e) {
            var self = e.data.self;
            var sid = e.data.sid;

            self.ownerMap.set('firewall', sid, 'proto', 'tcp udp');
            self.ownerMap.set('firewall', sid, 'src', 'wan');
            self.ownerMap.set('firewall', sid, 'src', 'lan');
        });

		pf.option(L.cbi.InputValue, 'name', {
			caption:	L.tr('Name'),
			datatype:	'and(uciname,maxlength(11))'
		});

		pf.option(L.cbi.ListValue, 'proto', {
			caption:     L.tr('Protocol'),
            initial:    'tcp udp'
		}).value('tcp udp', L.tr('TCP+UDP'))
            .value('tcp', L.tr('TCP'))
			.value('udp', L.tr('UDP'))
			.value('icmp', L.tr('ICMP'));
		
		pf.option(L.cbi.InputValue, 'extport', {
			caption:	L.tr('External port'),
			datatype:	'port'
		});

		pf.option(L.cbi.InputValue, 'intaddr', {
			caption:	L.tr('Internal IP address'),
			datatype:	'ip4addr'
		});

		pf.option(L.cbi.InputValue, 'intport', {
			caption:	L.tr('Internal port'),
			datatype:	'port'
		});
			
		return L.firewall.load().then(function() {
			m.insertInto('#map')
		});
	}
});
