L.ui.view.extend({
	execute: function() {
		var self = this;
		
		var m = new L.cbi.Map('system', {
			caption:     L.tr('System'),
			description: L.tr('Here you can configure the basic aspects of your device like its hostname or the timezone.'),
			collabsible: true
		});

		var s = m.section(L.cbi.TypedSection, 'system', {
			caption:     L.tr('System Properties'),
			teasers:     [ 'hostname', 'zonename', 'languages', 'themes' ],
			readonly:    !this.options.acls.system
		});

		s.tab({
			id:          'general',
			caption:     L.tr('General Settings')
		});

		var t = s.taboption('general', L.cbi.DummyValue, '__time', {
			caption:     L.tr('Local Time')
		});

		t.load = function(sid)
		{
			var id = this.id(sid);
			var uci = this.ucipath(sid);
			self.timezone = m.get(uci.config, uci.section, 'timezone');

			if (self.interval)
				return;

			L.system.getLocaltime().then(function(info) {
				var date = new Date();
				date.setFullYear(info.year);
				date.setMonth(info.mon);
				date.setDate(info.day);
				date.setHours(info.hour);
				date.setMinutes(info.min);
				date.setSeconds(info.sec);

				self.time = Math.floor(date.getTime() / 1000);

				self.interval = window.setInterval(function() {
					date.setTime(++(self.time) * 1000);
					$('#' + id).text('%04d/%02d/%02d %02d:%02d:%02d %s'.format(
						date.getFullYear(),
						date.getMonth() + 1,
						date.getDate(),
						date.getHours(),
						date.getMinutes(),
						date.getSeconds(),
						self.timezone
					));
				}, 1000);
			});
		};

		s.taboption('general', L.cbi.InputValue, 'hostname', {
			caption:     L.tr('Hostname'),
			datatype:    'hostname'
		});


		var z = s.taboption('general', L.cbi.ListValue, 'zonename', {
			caption:	L.tr('Timezone'),
			initial:	'UTC'
		});

		z.load = function(sid) {
			z.value('UTC');
			
			return $.getJSON(L.globals.resource + '/zoneinfo.json').then(function(zones) {
				var znames = [ ];

				for (var i = 0; i < zones.length; i++)
					for (var j = 5; j < zones[i].length; j++)
						znames.push(zones[i][j]);

				znames.sort();

				for (var i = 0; i < znames.length; i++)
					z.value(znames[i]);

				z.zones = zones;
			});
		};

		z.save = function(sid)
		{
			var uci = this.ucipath(sid);
			var val = this.formvalue(sid);

			if (!this.callSuper('save', sid))
				return false;

			for (var i = 0; i < z.zones.length; i++)
				for (var j = 5; j < z.zones[i].length; j++)
					if (z.zones[i][j] == val)
					{
						m.set(uci.config, uci.section, 'timezone', z.zones[i][0]);
						return true;
					}

			m.set(uci.config, uci.section, 'timezone', 'UTC');
			return true;
		};

		s.tab({
			id:          'language',
			caption:     L.tr('Language and Style')
		});


		var l = s.taboption('language', L.cbi.ListValue, 'languages', {
			caption:     L.tr('Language'),
			uci_package: 'luci2',
			uci_section: 'main',
			uci_option:  'lang',
			initial:    'auto'
		});

		l.load = function(sid)
		{
			this.choices = [];
			this.value('auto', L.tr('Automatic'));
			
			var langs = m.get('luci2', 'languages');
			for (var key in langs)
				if (key.charAt(0) != '.')
					this.value(key, langs[key]);
		};


		var t = s.taboption('language', L.cbi.ListValue, 'themes', {
			caption:     L.tr('Design'),
			uci_package: 'luci2',
			uci_section: 'main',
			uci_option:  'theme'
		});

		t.load = function(sid)
		{
			this.choices = [];
			
			var themes = m.get('luci2', 'themes');
			for (var key in themes)
				if (key.charAt(0) != '.')
					t.value(key, L.tr(themes[key]));
		};

		var s2 = m.section(L.cbi.NamedSection, 'ntp', {
			caption:      L.tr('Time Synchronization'),
			readonly:    !this.options.acls.system
		});

		
		s2.option(L.cbi.DynamicList, 'server', {
			caption:      L.tr('NTP server candidates'),
			datatype:     'host'
		});

		m.on('save', function() {
			L.uci.changes().then(function(changes) {
				if (changes.luci2)
					self.relogin = true;
			});
		});
		
		m.on('apply', function() {
			if (self.relogin) {
				location.href = '/';
				return;
			}
			
			L.system.getLocaltime().then(function(info) {
				var date = new Date();
				date.setFullYear(info.year);
				date.setMonth(info.mon);
				date.setDate(info.day);
				date.setHours(info.hour);
				date.setMinutes(info.min);
				date.setSeconds(info.sec);

				self.time = Math.floor(date.getTime() / 1000);
			})
		});

		return m.insertInto('#map');
	}
});
