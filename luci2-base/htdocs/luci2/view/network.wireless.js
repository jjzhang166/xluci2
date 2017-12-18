L.ui.view.extend({
	execute: function() {
		var self = this;

		return L.wireless.load().then(function() {
			var m = new L.cbi.Map('wireless', {
				caption:	L.tr('Wireless configuration')
			});

			var s = m.section(L.cbi.TypedSection, 'wifi-device', {
				caption:	L.tr('WiFi devices'),
				collabsible:	true
			});

			s.tab({                                             
				id:			'general',                    
				caption:	L.tr('General Settings')      
			});

			(s.taboption('general', L.cbi.DummyValue, '__name', {
				caption:	L.tr('Device')
			})).ucivalue = function(sid)
			{
				return sid;
			};

			var s_1 = s.subsection(L.cbi.TypedSection, 'wifi-iface', {
				caption:        L.tr('Device interfaces'),
				add_caption:	L.tr('Add interface …')
			});
			
			s_1.filter = function(section, parent_sid) {
				return section.device == parent_sid;
			};
			
			s_1.tab({                                             
				id:			'general',                    
				caption:	L.tr('General Settings')      
			});
			
			s_1.taboption('general', L.cbi.CheckboxValue, 'disabled', {
				caption:	L.tr('Disabled')
			});

			s_1.taboption('general', L.cbi.InputValue, 'ssid', {
				caption:	'SSID',
				datatype: 	'maxlength(32)'
			});
			
			s_1.taboption('general', L.cbi.ListValue, 'mode', {
				caption:	L.tr('Mode')
			})
			.value('ap', L.tr('Access Point'))
			.value('sta', L.tr('Client'))
			.value('adhoc', L.tr('Ad-Hoc'));

			s_1.taboption("general", L.cbi.InputValue, "bssid", {
				caption:	L.tr('BSSID')
			})
			.depends('mode', 'adhoc')
			.depends('mode', 'sta');

			s_1.taboption('general', L.cbi.NetworkList, 'network', {
				caption:	L.tr('Network'),
				description: L.tr('Choose the network(s) you want to attach to this wireless interface.')
			});

			s_1.taboption("general", L.cbi.CheckboxValue, "hidden", {
				caption: L.tr('Hide ESSID')
			}).depends('mode', 'ap');

			s_1.taboption("general", L.cbi.CheckboxValue, "wmm", {
				caption: L.tr("WMM Mode"),
				initial: true
			}).depends('mode', 'ap');

			s_1.tab({
				id:		'security',
				caption:	L.tr('Security')
			});

			s_1.taboption('security', L.cbi.ListValue, 'encryption', {
				caption:	L.tr('Encryption'),
				initial:	'none'
			})
			.value('none', L.tr('No encryption'))
			.value('psk', L.tr('WPA Personal (PSK)'))
			.value('psk2', L.tr('WPA2 Personal (PSK)'))
			.value('psk-mixed', L.tr('WPA/WPA2 Personal (PSK) mixed'));

			s_1.taboption('security', L.cbi.PasswordValue, 'key', {
				caption:	L.tr('Passphrase'),
				datatype:	'wpakey'
			}).depends('encryption', function(v) {
				return (v != 'none');
			});

			s_1.tab({
				id:		'macfilter',
				caption:	L.tr('MAC-Filter')
			});

			var mp = s_1.taboption('macfilter', L.cbi.ListValue, 'macfilter', {
				caption:	L.tr('MAC-Address Filter'),
				optional:	true
			}).depends('mode', 'ap');

			mp.load = function(sid) {
				this.choices = [ ] ;
				this.value('', L.tr('disable'));
				this.value('allow', L.tr('Allow listed only'));
				this.value('deny', L.tr('Allow all except listed'));
			};

			var ml = s_1.taboption('macfilter', L.cbi.DynamicList, 'maclist', {
				caption:	L.tr('MAC-List'),
				datatype:	'macaddr'
			}).depends('macfilter', 'allow').depends('macfilter', 'deny');
				
			return m.insertInto('#map');
		});
	}
});
