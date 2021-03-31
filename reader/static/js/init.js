let mediaMatcher = window.matchMedia("(max-width: 700px)");
let IS_MOBILE = mediaMatcher.matches;
let HAS_LOCALSTORAGE = localStorage !== undefined;

window.addEventListener('resize', () =>{
	IS_MOBILE = mediaMatcher.matches;
});

//  {
// 	(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))return true; else return false})(navigator.userAgent||navigator.vendor||window.opera);
// }

let PROGRAMMATIC_SCROLL = false;
let SCROLL_TIMER = null;
let DBG_VAL = NaN;

function shadowScroll() {
	PROGRAMMATIC_SCROLL = true;
	if(SCROLL_TIMER) clearTimeout(SCROLL_TIMER);
	SCROLL_TIMER = setTimeout(() => {
  		PROGRAMMATIC_SCROLL = false;
	}, 50)
} 

function scroll(element, x, y, noshadow) {
	//if(x == DBG_VAL || y == DBG_VAL || element == DBG_VAL || (isNaN(DBG_VAL) && (isNaN(x) || isNaN(y)))) debugger;
	if(!noshadow) shadowScroll();
	//console.log(element, 'scrolled to', x, y)
	if(element.scroll)
		element.scroll(x, y)
	else
		element.scrollTop = y;
		element.scrollLeft = x;

}

function LoadHandler(o) {
	o=be(o);
	Linkable.call(this);

	this.parseSCP = function() {
	let url = document.location.pathname.split('/');
	let group = (document.location.hash.match(/#(\d+)/) || [null, null])[1];
		return {
			series: url[url.length - 4],
			chapter: url[url.length - 3].replace('-','.'),
			page: parseInt(url[url.length - 2] - 1),
			group: group
		}
	}

	this.onload = () => {
	var SCP = this.parseSCP();
		API.requestSeries(SCP.series)
			.then(data => {
				Reader.setSCP(SCP);
				Reader.displaySCP(SCP);
			})
	}

	document.addEventListener("DOMContentLoaded", e => this.onload());

}

function ReaderAPI(o) {
	o=be(o);
	Linkable.call(this);
	
	this.url = o.url || '/api/';
	
	this.firstParty = IS_FIRST_PARTY;

	this.seriesUrl = BASE_API_PATH;

	this.mediaURL = o.mediaURL || '/media/manga/';

	this.data = {};
	this.indexData = {};

	this.infuseSeriesData = function(data) {
		for(var num in data.chapters) {
		let chapter = data.chapters[num];
			chapter.images = {};
			chapter.descriptions = {};
			chapter.loaded = {};
			chapter.blurs = {};
			chapter.previews = {};
			chapter.hasWide = {};
			chapter.wides = {};

			chapter.id = num;
			for(let group in chapter.groups) {
				chapter.images[group] = [];
				chapter.descriptions[group] = [];
				chapter.blurs[group] = [];
				chapter.previews[group] = [];
				chapter.wides[group] = [];
				if (this.firstParty) {
					firstPartySeriesHandler(this.mediaURL, chapter, group, data.slug);
				} else {
					thirdPartySeriesHandler(this.seriesUrl, chapter, group);
				}
			}
		}
		
		if(data.next_release_page) {
			data.countdown = true;
			var lastChapter = Object.keys(data.chapters).sort((a,b) => b - a)[0];

			data.chapters[+lastChapter+1] = Object.assign({}, data.chapters[lastChapter]);
			data.chapters[+lastChapter+1].notice = true;
			data.chapters[+lastChapter+1].title = '[Not yet released]';
		}
		return data;
	}

	this.requestSeries = function(slug) {
		this.seriesRequest = fetch(this.seriesUrl + slug + '/')
			.then(response => response.json())
			.then(seriesData => {
				seriesData = this.infuseSeriesData(seriesData);
				seriesData.chaptersIndex =
					Object.keys(
						seriesData.chapters
					).sort((a,b) => parseFloat(a) - parseFloat(b));
				seriesData.volMap = {};
				for (var i = 0; i < seriesData.chaptersIndex.length; i++) {
					if(!seriesData.volMap[seriesData.chapters[seriesData.chaptersIndex[i]].volume])
						seriesData.volMap[seriesData.chapters[seriesData.chaptersIndex[i]].volume] = seriesData.chaptersIndex[i];
				}
				this.data[slug] = seriesData;
				this.S.out('seriesUpdated', this.data[slug]);
				this.S.out('isFirstParty', this.firstParty);
			})
		return this.seriesRequest;
	}

	this.requestIndex = function(o){
		var formData = new FormData();
		formData.append("searchQuery", o.query)
		//formData.append("csrfmiddlewaretoken", CSRF_TOKEN)
		return fetch('/api/search_index/'+ o.slug + '/', {
				method: 'POST',
				body: formData
			})
			.then(response => response.json())
			.then(searchData => {
				this.S.out('indexUpdated', searchData);
				return {result:searchData, query: o.query};
			})
	}

	this.S.mapIn({
		'loadSeries': this.requestSeries,
		'loadIndex': this.requestIndex
	})
}


function themeHandler() {
	Linkable.call(this);
	this.themeUpdated = () => {
		let reset = Settings.get('thm.reset');
		let theme = Settings.get('thm.theme');
		if(theme === 'Custom')	this.setTheme(Settings.get('thm.primaryCol'), Settings.get('thm.readerBg'), Settings.get('thm.accentCol'), Settings.get('thm.textCol'));
		else if (theme === 'Metako')	this.setTheme('#484542', '#A49B97', '#CD93F6','#EEEEEE');
		else if (theme === 'Dark')	this.setTheme('#3a3f44', '#272b30', '#b2dffb','#eeeeee');
		else if (theme === 'Reaper') this.setTheme('#272836', '#121223', '#487DE4', '#EEEEEE');
		else if (theme === 'Zaibatsu') this.setTheme('#1D1D1D', '#000000', '#BA1F1F', '#EEEEEE');
		else if (theme === 'Light') this.setTheme('#F1F4FF', '#FFFFFF', '#5889F0','#2B2B2B');
		if(reset === true) this.resetCustom();
	}
	this.setTheme = (sidebar, reader, accent, text) => {
		document.documentElement.style.setProperty("--readerBg", reader);
		document.documentElement.style.setProperty("--sidebarCol", sidebar);
		document.documentElement.style.setProperty("--accentCol", accent);
		document.documentElement.style.setProperty("--textCol", text);
		document.documentElement.style.setProperty("--icoCol", text);
		document.documentElement.style.setProperty("--sidebarColDark", colManipulate(sidebar, -15));
		document.documentElement.style.setProperty("--sidebarColDarkA", colManipulate(sidebar, -15) + '00');
		document.documentElement.style.setProperty("--prevCol", colManipulate(sidebar, -7));

		let [r, g, b] = hexToRgb(accent);
		var	luma = ((r*299)+(g*587)+(b*114))/1000;

		document.documentElement.style.setProperty("--accentSelected", (luma > 160?'#111111':'#ffffff'));
		
		[r, g, b] = hexToRgb(sidebar);
		luma = ((r*299)+(g*587)+(b*114))/1000;

		document.documentElement.style.setProperty("--accentSelectedInvert", (luma < 160?'#444444':'#cccccc')); // Play with 160 there if you want.
		if(luma > 100) { //Tweaks if theme is light
			document.documentElement.style.setProperty("--borderColor", "rgba(0,0,0,0.2)");
			document.documentElement.style.setProperty("--blackLight", "rgba(0,0,0,0.05)");
			document.documentElement.style.setProperty("--sidebarColFocus", colManipulate(sidebar, -24));
		} else {
			document.documentElement.style.setProperty("--borderColor", "rgba(0,0,0,0.7)");
			document.documentElement.style.setProperty("--blackLight", "rgba(0,0,0,0.2)");
			document.documentElement.style.setProperty("--sidebarColFocus", colManipulate(sidebar, -27));
		}
		[r, g, b] = hexToRgb(sidebar)
		let [rt, gt, bt] = hexToRgb(text)
		if(Math.abs(r-rt) < 50
		&& Math.abs(g-gt) < 50
		&& Math.abs(b-bt) < 50) {
			if(luma > 200) {
				document.documentElement.style.setProperty("--rescueShade", '0px 1px 1px rgba(0,0,0,0.6),0px -1px 1px rgba(0,0,0,0.6),-1px 0px 1px rgba(0,0,0,0.6),1px 0px 1px rgba(0,0,0,0.6)');
			}else{
				document.documentElement.style.setProperty("--rescueShade", '0px 1px 1px rgba(255,255,255,0.6),0px -1px 1px rgba(255,255,255,0.6),-1px 0px 1px rgba(255,255,255,0.6),1px 0px 1px rgba(255,255,255,0.6)');
			}
			Tooltippy.set('Contrast ratio too low, safety outline enabled.')
		}else{
			document.documentElement.style.setProperty("--rescueShade", 'unset');
			Tooltippy.reset();
		}

		[r, g, b] = hexToRgb(reader);
		luma = ((r*299)+(g*587)+(b*114))/1000;
		
		if(luma > 100) {
			document.documentElement.style.setProperty("--rdrBorderL", "3px");
			document.documentElement.style.setProperty("--rdr-wb", "1px");
			document.documentElement.style.setProperty("--blackFlag", "rgba(0,0,0,0.3)");
			document.documentElement.style.setProperty("--rdrAncBottomWhite", "rgba(255,255,255,0.6)");
		} else {
			document.documentElement.style.setProperty("--rdrBorderL", "1px");
			document.documentElement.style.setProperty("--rdr-wb", "2px");
			document.documentElement.style.setProperty("--blackFlag", "rgba(0,0,0,0.7)");
			document.documentElement.style.setProperty("--rdrAncBottomWhite", "rgba(255,255,255,0.35)");
		}
	}

	this.resetCustom = () => {
		Settings.set('thm.reset', false);
		if(Settings.get('thm.theme') === 'Custom') {
			Settings.set('thm.primaryCol', '#3A3F44');
			Settings.set('thm.readerBg', '#272B30');
			Settings.set('thm.accentCol', '#B2DFFB');
			Settings.set('thm.textCol', '#EEEEEE');
		}
	}
	
	this.S.mapIn({
		settingsPacket: this.themeUpdated,
	})
}

const SETTING_HIDDEN = -1;
const SETTING_CUSTOM = 1;
const SETTING_BOOLEAN = 10;
const SETTING_MULTI = 20;
const SETTING_COLOR = 11;
const SETTING_BUTTON = 12;
const SETTING_MULTI_DROPDOWN = 21;
const SETTING_VALUE = 30;
const SETTING_VALUE_STEPPED = 31;
	
function Setting(o) {
	Linkable.call(this);
	this.name = o.name;
	this.addr = o.addr;
	this.prettyName = o.prettyName;
	this.setting = this.default = o.default;
	this.type = o.type || SETTING_HIDDEN;
	if(o.options !== undefined) {
		if(o.options instanceof Function)
			this.options = o.options;
		else{
			if(o.options instanceof Array){
				this.optionsPrimitive = o.options.slice(0);
				this.options = function() {return this.optionsPrimitive};
			}else
				this.optionsPrimitive = o.options;
		}
	}else if(this.type == SETTING_BOOLEAN){
		this.options = function() {return [true, false]};
	}
	this.strings = o.strings;
	this.postUpdate = o.postUpdate;
	this.html = o.html;
	this.global = (o.global===undefined)?true:o.global;
	this.manual = o.manual; //if true, the setting needs an external .setClass call to update the class. This can be used where class update needs to be in the middle of something.
	this.hidden = o.hidden;
	this.condition = o.condition;
	this.nomobile = o.nomobile;
	this.compact = o.compact;
	this.help = o.help;
	this.disabled = o.disabled || false;

	this.checkOptionValidity = function(value) {
		if(this.options == undefined)
			return true;
		
		if(this.options() instanceof Array)
			return this.options().includes(value);
		
		return this.options() == value;
	}

	this.refresh = function() {
		if(!this.checkOptionValidity(this.get()))
			this.set(this.default);
	}

	this.update = function() {
		this.set(this.get());
	}
	this.get = function() {
		return this.setting;
	}
	this.set = function(value, silent, notip) {
		if(!this.checkOptionValidity(value)) return null;
		this.setting = value;
		if(this.global && !this.manual)
			this.setClass();
		this.S.out('settingEvent', {
			type: 'change',
			setting: this
		})
		return this.setting;
	}
	this.cycle = function(options, silent, notip) {
		switch(this.type){
			case SETTING_BOOLEAN:
			case SETTING_MULTI:
			case SETTING_MULTI_DROPDOWN:
			case SETTING_VALUE:
			case SETTING_VALUE_STEPPED:
				if(options === undefined)
					options = this.options();
			var index = options.indexOf(this.get());
				return this.set(
					(index+1 > options.length - 1)?options[0]:options[index+1],
					silent
				);
				break;
		}
		return null;
	}
	this.next = function(silent, notip) {
		if(!this.options() instanceof Array) return;
		if(this.options().includes(this.setting)) {
		var targetIndex = this.options().indexOf(this.setting) + 1;
			if(targetIndex > this.options().length - 1) return;
			return this.set(this.options()[targetIndex], silent, notip)
		}
		return null;
	}
	this.prev = function(silent, notip) {
		if(!this.options() instanceof Array) return;
		if(this.options().includes(this.setting)) {
		var targetIndex = this.options().indexOf(this.setting) - 1;
			if(targetIndex < 0) return;
			return this.set(this.options()[targetIndex], silent, notip)
		}
		return null;
	}
	this.getFormatted = function(option) {
		option = option===undefined?this.get():option;
		if(this.strings) {
			if(this.strings instanceof Function) {
				return this.strings(option);
			}
			return this.strings[option];
		}else{
			return option;
		}
	}
	this.getHelp = function(option) {
		option = option===undefined?this.get():option;
		if(this.help) {
			if(typeof this.help == 'string') {
				return this.help;
			}
			return this.help[option];
		}else{
			return '';
		}
	}
	this.classString = function(option) {
		if(option !== undefined) {
			return this.name + '-' + option;
		}else{
			return this.name + '-' + this.get();
		}
	}
	this.setClass = function() {
	var classList = document.body.classList;
		switch(this.type){
			case SETTING_BOOLEAN:
				classList.remove(this.classString(!this.get()));
				classList.add(this.classString());
				break;
			case SETTING_MULTI:
			case SETTING_MULTI_DROPDOWN:
			case SETTING_VALUE:
			case SETTING_COLOR:
			case SETTING_BUTTON:
			case SETTING_VALUE_STEPPED:
				classList.remove.apply(classList, [].filter.call(classList, cl => cl.indexOf(this.name) == 0));
				classList.add(this.classString());
				break;
		}
	}
	this.disable = () => {
		this.disabled = true;

	}
	this.enable = () => {
		this.disabled = false;
	}
}

function SettingsCategory(name, hidden, icon) {
	nonEnum(this, "name", name);
	nonEnum(this, "hidden", hidden);
	nonEnum(this, "icon", hidden);
}


function SettingsHandler(){
	Linkable.call(this);

	this.settings = {
		lyt: new SettingsCategory('Reader', false),
		bhv: new SettingsCategory('Behavior', false),
		apr: new SettingsCategory('Layout', false),
		thm: new SettingsCategory('Themes', false),
		adv: new SettingsCategory('Advanced', false),
		misc: new SettingsCategory('Miscellaneous', true),
	};
	this.all = {};

	this.newSetting = function(o) {
	let obj = Object.byString(this.settings, o.addr.split('.').slice(0, -1).join('.'));
		o.name = o.addr.split('.').pop();
		this.all[o.addr] = obj[o.name] = new Setting(o);
		this.all[o.addr].S.link(this);
		return this;
	}

	this.deserialize = function() {
		if(!localStorage) return;
	var settings = localStorage.getItem('settings');
		try{
			if(!settings) throw 'No settings';
			settings = JSON.parse(settings);
			if(settings.VER && settings.VER != this.ver) {
				throw 'Settings ver changed';
			}
			for(var setting in settings) {
				if(setting == 'VER') continue;
				this.set(setting, settings[setting], true);
			}
		}catch (e){
			localStorage.setItem('settings','');
			console.warn('Settings were found to be corrupted and so were reset.');
			for (var setting in this.all) {
				this.all[setting].set(this.all[setting].get());
			}
		}
	}

	this.sendInit = function() {
		for(var setting in this.all) {
			this.S.out('settingsPacket', new SettingsPacket('change', setting, this.get(setting)))
		}
	}

	this.serialize = function() {
	var settings = {};
		for(var setting in this.all) {
			settings[setting] = this.all[setting].get();
		}
		// delete groupPreference from localstorage so it does not load preferred group even on better quality release
		delete settings['misc.groupPreference'];
		settings.VER = this.ver;
		return JSON.stringify(settings);
	}

	this.query = function(qu, or) {
		if(or) {
			for(var key in qu) {
			var setting = this.getByAddr(key);
				if(qu[key][0] == '!') {
					if(qu[key].substr(1) != setting.get()) return true;
				}else{
					if(qu[key] == setting.get()) return true;
				}
			}
			return false;
		}else{
			for(var key in qu) {
			var setting = this.getByAddr(key);
				if(qu[key] instanceof Array) {
					if(qu[key][0][0] == '!') {
						if(qu[key][0].substr(1) == setting.get()){
							try { if(qu[key][1] === 'or') continue } catch(err) {};
							return false;
						}
						else {
							try { if(qu[key][1] === 'or') return true } catch(err) {};
							continue;
						}
					}
					if(qu[key].includes(setting.get())) continue;
				}
				if(qu[key][0] == '!') {
					if(qu[key].substr(1) == setting.get()) return false;
				}else{
					if(qu[key] != setting.get()) return false;
				}
			}
		}
		try { if(qu[key][1] === 'or') return false } catch(err) {};
		return true;
	}

	this.getByAddr = function(addr) {
		return this.all[addr];
	}
	this.get = function(setting){
		return this.getByAddr(setting).get();
	}
	this.set = function(setting, value, packet){
		if(is(this.getByAddr(setting).set(value))){
			this.update(setting, packet);
		}
	}
	this.cycle = function(setting, options, packet){
		if(is(this.getByAddr(setting).cycle(options))){
			this.update(setting, packet);
		}
	}
	this.setClass = function(setting){
		this.getByAddr(setting).setClass();
	}
	this.next = function(setting, silent){
		if(is(this.getByAddr(setting).next(silent))) {
			this.update(setting);
		}
	}
	this.prev = function(setting, silent){
		if(is(this.getByAddr(setting).prev(silent))) {
			this.update(setting);
		}
	}
	this.disable = (setting) => {
		setting.disable();
		this.update(setting.addr, new SettingsPacket(
			'disable',
			setting.addr
		));
	}
	this.enable = (setting) => {
		setting.enable();
		this.update(setting.addr, new SettingsPacket(
			'enable',
			setting.addr
		));
	}
	this.update = function(setting, packet){
		if(!packet) {
			packet = new SettingsPacket(
				'change',
				setting,
				this.getByAddr(setting).get()
			);
		}
		if(packet.type == 'set') packet.type = 'change';
		packet.handled = true;
		this.S.out('settingsPacket', packet);
	}

	this.refreshAll = function() {
    	var settings = Object.keys(this.all).map(setting => this.all[setting]);
        settings.forEach(setting => setting.refresh());
        settings.forEach(setting => {
            if(setting.condition) {
            var result = this.query(setting.condition);
                if(result) {
                    if(!setting.disabled) return;
                    this.enable(setting);
                }else{
                    if(setting.disabled) return;
                    this.disable(setting);
                }
            }
        });
    }

	this.settingUpdated = function(e) {
		if(e.type == 'change') {
			if(e.setting.postUpdate) e.setting.postUpdate(e.setting.get());
			this.refreshAll(); //opt - update only linked setting
			if(localStorage)
				localStorage.setItem('settings', this.serialize())
				this.S.out('message', e.setting.getHelp());
		}
		// if(e.silent != true) {
		// 	if(!e.notip)
		// 		if(e.type == 'change')
		// }
	}

	this.packetHandler = (packet) => {
		switch(packet.type) {
			case 'set':
				this.set(packet.setting, packet.value, packet);
				break;
			case 'cycle':
				this.cycle(packet.setting, packet.value, packet);
				break;
		}
	}


	this.S.mapIn({
		settingsPacket: this.packetHandler,
		init: this.sendInit,
		settingEvent: this.settingUpdated
	})

	this.ver = '0.79';

	this.newSetting({
		addr: 'lyt.fit',
		prettyName: 'Page fit',
		options: [
			'none',
			'all_limit',
			'width_limit',
			'height_limit',
			'all',
			'width',
			'height'
		],
		default: (IS_MOBILE)?'all_limit':'width_limit',
		strings: {
			'none': 'Images are displayed in natural resolution.',
			'all_limit': 'Natural image size that does not exceed max width or height.',
			'width_limit': 'Natural image size that does not exceed max width.',
			'height_limit': 'Natural image size that does not exceed max height.',
			'all': 'Images expand to width or height.',
			'width': 'Images expand to max width.',
			'height': 'Images expand to max height.',
		},
		help: {
			'none': 'Images are displayed in natural resolution.',
			'all_limit': 'Natural image size that does not exceed max width or height.',
			'width_limit': 'Natural image size that does not exceed max width.',
			'height_limit': 'Natural image size that does not exceed max height.',
			'all': 'Images expand to width or height.',
			'width': 'Images expand to max width.',
			'height': 'Images expand to max height.',
		},
		type: SETTING_MULTI,
		html: `<div><div class="t-row">
				<div class="t-1">
					<div class="ToggleButton" data-bind="none"><div data-bind="icon" class="ico-btn"></div><span>Original size</span></div>
				</div>
			</div><div class="t-row">
				<div class="t-tooltip">
					Limit
				</div>
				<div class="t-1">
					<div class="ToggleButton" data-bind="all_limit"><div data-bind="icon" class="ico-btn"></div><span>All</span></div>
					<div class="ToggleButton" data-bind="width_limit"><div data-bind="icon" class="ico-btn"></div><span>Width</span></div>
					<div class="ToggleButton" data-bind="height_limit"><div data-bind="icon" class="ico-btn"></div><span>Height</span></div>
				</div>
			</div><div class="t-row">
				<div class="t-tooltip">
					Stretch
				</div>
				<div class="t-1">
					<div class="ToggleButton" data-bind="all"><div data-bind="icon" class="ico-btn"></div><span>All</span></div>
					<div class="ToggleButton" data-bind="width"><div data-bind="icon" class="ico-btn"></div><span>Width</span></div>
					<div class="ToggleButton" data-bind="height"><div data-bind="icon" class="ico-btn"></div><span>Height</span></div>
				</div>
			</div></div>`
	})
	.newSetting({
		addr: 'lyt.zoom',
		prettyName: 'Maximum page width',
		options: ['10', '20', '30', '40', '50', '60', '70', '80', '90', '100'],
		default: '100',
		strings: (i) => `${i}%`,
		help: 'Maximum width the page expands to. Works only in width modes of page fit.',
		type: SETTING_VALUE_STEPPED,
		condition: {'lyt.fit': ['width_limit', 'width']},
		nomobile: true
	})
	.newSetting({
		addr: 'lyt.direction',
		prettyName: 'Reader layout',
		options: ['ltr', 'ttb', 'rtl'],
		default: 'ltr',
		strings: {
			ltr: 'Left-to-right',
			ttb: 'Top-to-bottom',
			rtl: 'Right-to-left'
		},
		help: {
			ltr: 'Left-to-right reading mode.',
			ttb: 'Vertical view.',
			rtl: 'Right-to-left reading mode.'
		},
		type: SETTING_MULTI
	})
	.newSetting({
		addr: 'lyt.gap',
		prettyName: 'Remove gaps in vertical view',
		default: false,
		strings: {
			true: 'Gaps removed',
			false: 'Gaps applied'
		},
		compact: true,
		condition: {'lyt.direction': ['ttb']},
		type: SETTING_BOOLEAN,
		global: true
	})
	.newSetting({
		addr: 'thm.theme',
		prettyName: 'Reader Theme',
		options: ['Metako', 'Dark', 'Reaper', 'Zaibatsu', 'Light', 'Custom'],
		default: 'Metako',
		strings: {
			Metako: 'Metako',
			Dark: 'Dark',
			Reaper: 'Reaper',
			Light: 'Light',
			Zaibatsu: 'Zaibatsu',
			Custom: 'Custom...'
		},
		type: SETTING_MULTI_DROPDOWN
	})
	.newSetting({
		addr: 'thm.primaryCol',
		prettyName: 'Interface Color',
		default: '#3A3F44',
		condition: {'thm.theme': ['Custom']},
		compact: true,
		global: false,
		type: SETTING_COLOR
	})
	.newSetting({
		addr: 'thm.textCol',
		prettyName: 'Text Color',
		default: '#EEEEEE',
		condition: {'thm.theme': ['Custom']},
		compact: true,
		global: false,
		type: SETTING_COLOR
	})
	.newSetting({
		addr: 'thm.accentCol',
		prettyName: 'Accent Color',
		default: '#B2DFFB',
		condition: {'thm.theme': ['Custom']},
		compact: true,
		global: false,
		type: SETTING_COLOR
	})
	.newSetting({
		addr: 'thm.readerBg',
		prettyName: 'Reader Background',
		default: '#272B30',
		condition: {'thm.theme': ['Custom']},
		compact: true,
		global: false,
		type: SETTING_COLOR
	})
	.newSetting({
		addr: 'thm.reset',
		prettyName: '',
		options: [true,false],
		default: false,
		compact: true,
		condition: {'thm.theme': ['Custom'], 'thm.primaryCol': ['!#3A3F44', 'or'], 'thm.readerBg': ['!#272B30', 'or'], 'thm.accentCol': ['!#B2DFFB', 'or'], 'thm.textCol': ['!#EEEEEE', 'or']},
		type: SETTING_BUTTON
	})
	.newSetting({
		addr: 'lyt.spread',
		prettyName: '2-page spread',
		options: ['1', '2', '2-odd'],
		default: '1',
		strings: {
			'1': '1-page layout',
			'2': '2-page layout',
			'2-odd': '2-page layout, odd'
		},
		help: {
			'1': 'Single page displayed.',
			'2': 'Two pages at once.',
			'2-odd': 'Two pages at once, odd numbering.'
		},
		type: SETTING_MULTI,
		postUpdate: value => {
			({
				'1': v => {
					this.set('adv.spreadCount', 1)
					this.set('adv.spreadOffset', 0)
				},
				'2': v => {
					this.set('adv.spreadCount', 2)
					this.set('adv.spreadOffset', 0)
				},
				'2-odd': v => {
					this.set('adv.spreadCount', 2)
					this.set('adv.spreadOffset', 1)
				}
			})[value]()
		}
	})
	.newSetting({
		addr: 'adv.spreadCount',
		prettyName: 'Spread mode custom page count',
		options: [1,2,3,4,5,6,7,8,9,10],
		default: 1,
		strings: i => {
			return '%ip'.replace('%i', i)
		},
		postUpdate: () => this.update('adv.spreadOffset'),
		type: SETTING_VALUE,
		// hidden: true
	})
	.newSetting({
		addr: 'adv.spreadOffset',
		prettyName: 'Spread mode custom page offset',
		options: () => {
			return [...Array(this.get('adv.spreadCount')).keys()]
		},
		default: 0,
		strings: i => {
			return '%ip'.replace('%i', i)
		},
		condition: {'adv.spreadCount': ['!1']},
		type: SETTING_VALUE,
		// hidden: true
	})
	.newSetting({
		addr: 'apr.selectorAnchor',
		prettyName: 'Page selector position',
		options: ['left', 'bottom'],
		default: 'left',
		strings: {
			'left': 'Left',
			'bottom': 'Bottom'
		},
		help: {
			'left': 'Page selector is shown near the sidebar.',
			'bottom': 'Page selector is at the bottom of the page.'	
		},
		type: SETTING_MULTI,
		nomobile: true
	})
	.newSetting({
		addr: 'apr.selPinned',
		prettyName: 'Pin page selector',
		default: false,
		strings: {
			true: 'Pinned',
			false: `Shown on ${IS_MOBILE?'tap':'hover'}`
		},
		compact: true,
		type: SETTING_BOOLEAN,
	})
	.newSetting({
		addr: 'apr.selNum',
		prettyName: 'Page selector: show page number',
		default: true,
		strings: {
			true: 'Show page number',
			false: 'Hide page number'
		},
		compact: true,
		type: SETTING_BOOLEAN,
	})
	.newSetting({
		addr: 'apr.hoverinos',
		prettyName: 'Mouseover reader hints (next, prev)',
		default: true,
		strings: {
			true: 'Visible',
			false: 'Hidden'
		},
		compact: true,
		type: SETTING_BOOLEAN,
		nomobile: true
	})
	.newSetting({
		addr: 'apr.sidebar',
		prettyName: 'Show sidebar',
		default: true,
		strings: {
			true: 'Show sidebar',
			false: 'Hide sidebar',
		},
		compact: true,
		type: SETTING_BOOLEAN,
		nomobile: true
	})
	.newSetting({
		addr: 'apr.previews',
		prettyName: 'Show previews',
		default: false,
		strings: {
			true: 'Show previews',
			false: 'Hide previews',
		},
		compact: true,
		type: SETTING_BOOLEAN,
		nomobile: true
	})
	.newSetting({
		addr: 'bhv.preload',
		prettyName: 'Page preload',
		options: [1,2,3,4,5,6,7,8,9,100],
		default: (IS_MOBILE)?2:3,
		strings: i => `${i}`.replace('100', '∞'),
		type: SETTING_VALUE_STEPPED,
		global: false
	})
	.newSetting({
		addr: 'bhv.scrollYDelta',
		prettyName: 'Vertical scroll speed using keyboard arrows',
		options: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50],
		default: 25,
		strings: i => `${i}px`,
		type: SETTING_VALUE,
		global: false,
		nomobile: true
	})
	.newSetting({
		addr: 'bhv.resetScroll',
		prettyName: 'Reset page scroll after page flip',
		default: false,
		strings: {
			true: 'Reset',
			false: 'Leave it be',
		},
		help: {
			true: 'On page switch, resets vertical scroll of the previous page.',
			false: 'Vertical scroll on pages is saved.',
		},
		compact: true,
		type: SETTING_BOOLEAN,
		global: false
	})
	.newSetting({
		addr: 'bhv.clickTurnPage',
		prettyName: `Turn pages by ${IS_MOBILE ? 'tapping' : 'clicking'}`,
		strings: {
			true: 'Turn page',
			false: 'Disabled',
		},
		help: {
			true: `When ${IS_MOBILE ? 'tapping' : 'clicking'}, the page turns depending on the direction.`,
			false: `${IS_MOBILE ? 'Tapping' : 'Clicking'} on the page does not turn it.`,
		},
		default: true,
		compact: true,
		type: SETTING_BOOLEAN,
	})
	.newSetting({
		addr: 'bhv.swipeGestures',
		prettyName: `Enable swipe gestures`,
		strings: {
			true: 'Swipe enabled',
			false: 'Swipe disabled',
		},
		help: {
			true: `Allow using finger drag to turn the pages smoothly.`,
			false: `Finger drag will do nothing. Tap on the pages or use your keyboard to advance pages.`,
		},
		default: true,
		compact: true,
		postUpdate: (state) => {
			if(typeof Reader !== "undefined") {
				Reader.imageView.setTouchHandlers(state);
			}
		},
		type: SETTING_BOOLEAN,
	})
	.newSetting({
		addr: 'bhv.historyUpdate',
		prettyName: 'Browser history/back button behavior',
		options: ['none','replace','chap','jump', 'all'],
		default: 'replace',
		strings: {
			'none': "Don't touch browser history",
			'replace': "Just change the page title",
			'chap': "Add every chapter to history",
			'jump': "Add every chapter and page&nbsp;skips",
			'all': "Add every move to history"
		},
		help: {
			'none': "Page URL and title won't update at all.",
			'replace': "When you go to next chapter, page title and URL changes.",
			'chap': "Remembers chapters in browser history so you can go back with browser buttons.",
			'jump': "Also adds out-of-order page skips to history in addition to chapters.",
			'all': "Add every page flip to browser history."
		},
		type: SETTING_MULTI,
		global: false
	})
	.newSetting({
		addr: 'misc.groupPreference',
		prettyName: 'Group preference',
		type: SETTING_VALUE,
		hidden: true,
		global: false
	})
	.newSetting({
		addr: "adv.parallelDownloads",
		prettyName: "Number of parallel image downloads",
		options: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50],
		default: 5,
		type: SETTING_VALUE,
		hidden: false,
	});
	this.deserialize();
	this.sendInit();
}

function SettingsPacket(type, settingAddr, value, source) {
	this.type = type;
	this.setting = settingAddr;
	this.value = value;
	this.source = source;
	return this;
}

function UI_Tooltippy(o) {
	o=be(o);
	UI.call(this, {
		node: o.node,
		kind: ['Tooltippy'].concat(o.kind || []),
		html: o.html || '<div></div>',
	});
	
	this.attached = false;

	this.handler = e => {
	var tip = e.target.getAttribute('data-tip');
		if(tip) {
			this.attached = true;
		var rect = e.target.getBoundingClientRect()
		var bodyRect = document.body.getBoundingClientRect();
		var align = e.target.getAttribute('data-tip-align')
		var offset = e.target._ttOffset || 2;
			this.set(tip);
			this.$.style.display = 'block';
			if(IS_MOBILE) return;
			if(align == 'right')
				this.$.style.bottom = document.body.offsetHeight - (rect.top - bodyRect.top) - rect.height + this.$.offsetHeight + 2 + 'px';
			else
				this.$.style.bottom = document.body.offsetHeight - (rect.top - bodyRect.top) + offset + 'px';
			if(e.pageX > window.innerWidth / 2) {
				this.$.style.left = 'unset';
				this.$.style.right = window.innerWidth - rect.left - rect.width + 'px';
			}else{
				this.$.style.right = 'unset';
				if(align == 'right')
					this.$.style.left = rect.left + rect.width + 4 + 'px';
				else
					this.$.style.left = rect.left + 'px';
			}
		}
	}

	this.set = function(text) {
		if(text.length < 1) return;
		text = text.replace(/\[(.|Ctrl|Shift|Meta|Alt)\]/g, '<span class="Tooltippy-key">$1</span>');
		this.$.innerHTML = text;
		if(!this.attached || IS_MOBILE) {
			this.$.style.display = 'block';
			if(IS_MOBILE) {
				this.$.style.bottom = window.innerHeight * 0.20 + 'px';
			}else{
				this.$.style.bottom = window.innerHeight * 0.90 + 'px';
			}
			this.$.style.left = 'unset';
			this.$.style.right = Reader.imageView.$.offsetWidth / 2 - this.$.offsetWidth / 2 + 'px'; // TODO: REMOVE HARDCODE
		}
		this.$.classList.remove('fadeOut');
		clearTimeout(this.fader);
		this.fader = setTimeout(() => this.$.classList.add('fadeOut'), 3000);

	}

	this.reset = function (e) { 
		this.attached = false;
		this.$.style.display = 'none';
	}

	this.attach = function(element, text, align, offset) {
		element.onmouseover = e => this.handler(e);
		element.onmouseleave = e => this.reset(e)
		element.setAttribute('data-tip', text);
		if(align) element.setAttribute('data-tip-align', align);
		element._ttOffset = offset;
		return this;
	}

}

function UI_Reader(o) {
	o=be(o);
	UI.call(this, {
		node: o.node,
		kind: ['Reader'].concat(o.kind || []),
		html: o.html || '<div></div>',
	});
	Linkable.call(this);

	this.SCP = {
		chapter: 1,
		page: 0,
	};

	this.loadingChapter = false;

	new KeyListener(document.body)
		.attach('prevCh', ['BracketLeft'], e => this.prevChapter())
		.attach('nextCh', ['BracketRight'], e => this.nextChapter())
		.attach('prevVo', ['Comma'], e => this.prevVolume())
		.attach('nextVo', ['Period'], e => this.nextVolume())
		.attach('fit', ['KeyF'], e => Settings.cycle('lyt.fit'))
		.attach('layout', ['KeyD'], e => Settings.cycle('lyt.direction'))
		.attach('hide', ['KeyH'], e => this.$.classList.toggle('o'))
		.attach('sidebar', ['KeyS'], s => Settings.cycle('apr.sidebar'))
		.attach('pageSelector', ['KeyN'], s => Settings.cycle('apr.selPinned'))
		.attach('preload', ['KeyL'], s => Settings.cycle('bhv.preload'))
		.attach('spread', ['KeyQ'], s => Settings.cycle('lyt.spread'))
		.attach('spreadCount', ['KeyU'], s => Settings.cycle('adv.spreadCount'))
		.attach('spreadOffset', ['KeyI'], s => Settings.cycle('adv.spreadOffset'))
		.attach('share', ['KeyR'], s => this.copyShortLink(s))
		.attach('enter', ['Enter'], s => {
			if(this.SCP.page == this.SCP.lastPage)
				this.nextChapter();
		})
		.attach('options', ['KeyO'], e => Loda.display('settings'))
		.attach('jump', ['KeyJ'], e => Loda.display('jump'))

		
	new KeyListener(document.body)
		.condition(() => ['width','width_limit'].includes(Settings.get('lyt.fit')))
		.attach('minus', ['Minus'], s => Settings.prev('lyt.zoom', undefined, true))
		.attach('plus', ['Equal'], s => Settings.next('lyt.zoom', undefined, true))
		
	new KeyListener(document.body)
		.condition(() => Settings.get('lyt.direction') == 'ltr')
		.attach('prev', ['ArrowLeft'], e => this.prevPage())
		.attach('next', ['ArrowRight'], e => this.nextPage());
		
	new KeyListener(document.body)
		.condition(() => Settings.get('lyt.direction') == 'rtl')
		.attach('prev', ['ArrowRight'], e => this.prevPage())
		.attach('next', ['ArrowLeft'], e => this.nextPage());


	this.selector_chap = new UI_FauxDrop({
		node: this._.selector_chap
	})
	this.selector_chap.S.linkAnonymous('value', value => {
		this.initChapter(value, 0);
	});

	this.selector_vol = new UI_FauxDrop({
		node: this._.selector_vol
	})
	this.selector_vol.S.linkAnonymous('value', value => this.selectVolume(value));

	this.imageView = new UI_ReaderImageView({
		node: this._.image_viewer
	}).S.link(this);

	this.groupList = new UI_Tabs({
		node: this._.groups
	}).S.linkAnonymous('id', id => this.drawGroup(id));

	this.selector_page = new UI_PageSelector({
		node: this._.page_selector
	})
	this.selector_page.S.linkAnonymous('page', id => this.displayPage(id));

	this.messageBox = new UI_MessageBox({
		node: this._.message
	})
	this.previews = new UI_Tabs({
		node: this._.previews
	}).S.linkAnonymous('number', id => this.displayPage(id));

	this.asideViews = new UI_WindowedContainerList({
		node: this._.aside_views,
		dynamicHide: true
	})
	//views: fit
	// this.fitView = new UI_ButtonGroup({
	// 	node: this._.aside_views_fit,
	// 	linkedSetting: 'lyt.fit'
	// }).S.biLink(Settings);

	this.updateData = function(data) {
		this.current = data;
	}

	this.controlFeatures = function(isFirstParty) {
		if (isFirstParty) {
			new KeyListener(document.body)
				.attach('search', ['Ctrl+KeyF'], s => {
					Loda.display('search')
				})
				.attach('previews', ['KeyP'], s => Settings.cycle('apr.previews'))
		} else {
			document.querySelector("[data-bind='search']").style.display = 'none';
			document.querySelector(".rdr-previews").style.display = 'none';
			this.plusOne = () => {};
		}
	}

	this.setSCP = function(SCP) {
		if(SCP.series) this.SCP.series = SCP.series;
		if(SCP.chapter) this.SCP.chapter = SCP.chapter;
		if(SCP.page) this.SCP.page = SCP.page;
	}
	this.displaySCP = function(SCP) {
		this.drawReader(SCP.series);
		this.initChapter(SCP.chapter, SCP.page, SCP.group);
		this.S.out('init');
	}

	this.drawReader = function(slug) {
		if(slug) this.SCP.series = slug;
		this.SCP.lastChapter = this.current.chaptersIndex[this.current.chaptersIndex.length - 1];
		this.SCP.firstChapter = this.current.chaptersIndex[0];
		let path = window.location.pathname.split("/").map(e => decodeURIComponent(e));
		this._.title.innerHTML = `<a href="${path.splice(0, path.indexOf(decodeURIComponent(this.current.slug))).join("/")}/${this.current.slug}/">${this.current.title}</a>`;
		this.$.querySelector('aside').classList.remove('unload');
	var chapterElements = [];
	var volElements = {};
		for (var i = this.current.chaptersIndex.length - 1; i >= 0; i--) {
		var chapterNumber = this.current.chaptersIndex[i];
		var chapter = this.current.chapters[chapterNumber];
			chapterElements.push({
				text: chapterNumber + ' - ' + chapter.title,
				value: chapterNumber
			});

		}
		volElements = Object.keys(this.current.volMap).sort((a,b) => parseFloat(b) - parseFloat(a)).map(item => {
			return {
				value: item,
			}
		});

		this.selector_chap.clear().add(chapterElements);
		this.selector_vol.clear().add(volElements);

		setTimeout(() => {
			this._.page_selector.classList.remove('vis')
			this._.zoom_level.classList.remove('vis')
		}, 3000);
		// this._.close.href = `/read/${window.location.pathname.split('/')[2]}/${this.SCP.series}`;
	}

	this.drawGroup = function(group) {
		Settings.set('misc.groupPreference', group);	
		this.initChapter();
	}

	this.fetchChapter = function(chapter, group) {
		return new Promise((resolve, reject) => {
			if (!chapter) {
				reject("Chapter is a required parameter.");
				return;
			}
			this.loadingChapter = true;
			let targetChapter = this.current.chapters[chapter];
			// In case group is 0.
			if (group === undefined || group === null) {
				group = this.getGroup(chapter);
			}
			// TODO there's a possible race condition here
			if (!targetChapter.loaded[group]
				&& targetChapter.pageRequest[group]) {
				targetChapter.pageRequest[group]().then(() => {
					delete targetChapter.pageRequest[group];
					targetChapter.loaded[group] = true;
					this.loadingChapter = false;
					resolve();
				});
			} else {
				this.loadingChapter = false;
				resolve();
			}
		});
	}

	this.initChapter = function(chapter, page, group) {
		if (chapter) this.SCP.chapter = chapter;
		this.loadingChapter = true;
		this.SCP.chapterObject = this.current.chapters[this.SCP.chapter];
		this.SCP.volume = this.SCP.chapterObject.volume;
		this.SCP.chapterName = this.SCP.chapterObject.title;
		if(group !== undefined && group !== null && this.SCP.chapterObject.groups[group])
			this.SCP.group = group;
		else
			this.SCP.group = this.getGroup(chapter);

		if (!this.SCP.chapterObject.loaded[this.SCP.group] && this.SCP.chapterObject.images[this.SCP.group].length === 0) {
			// TODO This code is now redundant, it should be part of a bigger refactor
			this.SCP.chapterObject.pageRequest[this.SCP.group]().then((count) => {
				delete this.SCP.chapterObject.pageRequest[this.SCP.group]; // Save some memory, :kaguyaSmug:
				this.SCP.chapterObject.loaded[this.SCP.group] = true;
				this.SCP.pageCount = count;
				this.SCP.lastPage = count - 1;
				this.loadingChapter = false;
				this.bootstrapChapter(page);
			});
		} else if (this.SCP.chapterObject.loaded[this.SCP.group]) {
			if(this.SCP.chapterObject.notice) {
				this.SCP.pageCount = 1;
				this.SCP.lastPage = 0;				
			}else{
				this.SCP.pageCount = this.SCP.chapterObject.images[this.SCP.group].length;
				this.SCP.lastPage = this.SCP.pageCount - 1;
			}
			this.loadingChapter = false;
			this.bootstrapChapter(page);
		}
	}

	this.getGroup = function(chapter, getDefault) {
		let chapterObj = this.current.chapters[chapter || this.SCP.chapter];

		if(!getDefault) {
			if(Settings.get('misc.groupPreference') !== undefined
			&& chapterObj.groups[Settings.get('misc.groupPreference')] !== undefined)
				return Settings.get('misc.groupPreference');
		}

		if(chapterObj.preferred_sort){
		  for(var i=0;i<chapterObj.preferred_sort.length;i++){
			if(chapterObj.groups[chapterObj.preferred_sort[i]])
			  return chapterObj.preferred_sort[i]
		  }
		}

		if(this.current.preferred_sort){
		  for(var i=0;i<this.current.preferred_sort.length;i++){
			if(chapterObj.groups[this.current.preferred_sort[i]])
			  return this.current.preferred_sort[i];
		  }
		}

		return Object.keys(chapterObj.groups)[0];
	}

	this.boostrapChapterInterface = function(page) {
		if(this.SCP.chapter == this.SCP.lastChapter) {
			this._.chap_next.classList.add('disabled');
			this.$.classList.add('last-chapter');
		}else{
			this._.chap_next.classList.remove('disabled');
			this.$.classList.remove('last-chapter');
		}
		if(this.SCP.chapter == this.SCP.firstChapter) {
			this._.chap_prev.classList.add('disabled');
		}else{
			this._.chap_prev.classList.remove('disabled');
		}
		if(this.SCP.volume >= Math.max.apply(null, Object.keys(this.current.volMap))) {
			this._.vol_next.classList.add('disabled');
		}else{
			this._.vol_next.classList.remove('disabled');
		}
		if(this.SCP.volume <= Math.min.apply(null, Object.keys(this.current.volMap))) {
			this._.vol_prev.classList.add('disabled');
		}else{
			this._.vol_prev.classList.remove('disabled');
		}

		this._.page_selector.classList.add('vis')
		setTimeout(() => this._.page_selector.classList.remove('vis'), 3000);
	}

	this.bootstrapChapter = function(page) {
		this.shuffleRandomChapter();
		if(this.SCP.chapterObject.notice) {
			this.imageView.displayNotice();
			this.selector_chap.set(this.SCP.chapter, true);
			this.selector_vol.set(this.SCP.volume, true);
			this.boostrapChapterInterface();
			this.selector_page.clearPreload();
			this.displayPage(0);
			this.drawGroups(true);
			this.drawPreviews(false);
			return this;
		}
		this.drawGroups();
		this.drawPreviews();

		this.imageView.drawImages(this.SCP.chapterObject.images[this.SCP.group], this.SCP.chapterObject.wides[this.SCP.group]);

		this.selector_chap.set(this.SCP.chapter, true);
		this.selector_vol.set(this.SCP.volume, true);

		this.boostrapChapterInterface();

		this.selector_page.clearPreload();
		this.imageView.updateScrollPosition();
		this.displayPage(page);
		// this._.comment_button.href = '/reader/series/' + this.SCP.series + '/' + this.SCP.chapter + '/comments'
		this.plusOne();
		return this;
	}

	this.drawGroups = (clear) => {
		this.groupList.clear();
		if(clear) return; 
	let groupElements = {};
		for(let grp in this.SCP.chapterObject.groups) {
			groupElements[grp] = new UI_SimpleListItem({
				html: '<div' + ((grp==this.SCP.group)?' class="is-active"':'') + '></div>',
				text: this.current.groups[grp]
			})
		}
		this.groupList.addMapped(groupElements);
	}

	this.displayPage = (page, dry) => {
		if(page == 'last')
			this.SCP.page = this.SCP.lastPage;
		else
			if(page !== undefined) this.SCP.page = page;
		try {
			this.SCP.page = this.imageView.imageWrappersMask[this.imageView.imageWrappersMap[this.SCP.page]][0]
		} catch (e) {
			this.SCP.page = this.SCP.page;
		}

		this.imageView.selectPage(this.SCP.page, dry);
		this.SCP.visiblePages = this.imageView.visiblePages;

		//if last page
		if(HAS_LOCALSTORAGE
		&& this.imageView.visiblePages
		&& this.imageView.visiblePages.includes(this.SCP.lastPage)
		&& !this.SCP.chapterObject.notice){
			let source = window.location.pathname.split("/");
			source = source[source.indexOf(this.SCP.series) - 1];
			globalHistoryHandler.addChapter(decodeURIComponent(this.SCP.series), source, this.SCP.chapter.toString());
		}
		this.S.out('SCP', this.SCP);
	}

	this.drawPreviews = (state) => {
		state = state==undefined?Settings.get('apr.previews'):state;
		this.previews.clear();
		if(state == true) {
			this.current.chapters[this.SCP.chapter].previews[this.SCP.group].forEach(
				preview => {
					this.previews.add(new UI_Dummy({
						html: "<img src='"+preview+"' />"
					}))
				}
			)
			this.previews.select(this.SCP.page, undefined, undefined, true);
		}
	}

	this.selectVolume = function(vol) {
		if(this.current.volMap[vol])
			this.initChapter(this.current.volMap[vol]);
	}

	this.plusOne = function() {
		clearTimeout(this.plusOneTimer);
		this.plusOneTimer = setTimeout(i => {
		var formData = new FormData();
			formData.append("series", this.SCP.series)
			formData.append("group", this.SCP.group)
			formData.append("chapter", this.SCP.chapter)
			fetch('/read/update_view_count/', {
				method: 'POST',
				body: formData
			})
		}, 20*1000)
	}


	this.nextChapter = function(){
		if (this.loadingChapter) return;
		if(this.SCP.chapter != this.SCP.lastChapter) {
		var index = this.current.chaptersIndex.indexOf(''+this.SCP.chapter);
			if(index < 0) throw new Error('Chapter advance failed: invalid base index.')
			this.initChapter(
				this.current.chaptersIndex[index + 1],
				0
			)
		}
	}
	this.prevChapter = function(page) {
		if (this.loadingChapter) return;
		if(this.SCP.chapter != this.SCP.firstChapter) {
		var index = this.current.chaptersIndex.indexOf(''+this.SCP.chapter);
			if(index < 0) throw new Error('Chapter stepback failed: invalid base index.')
			this.initChapter(
				this.current.chaptersIndex[index - 1],
				page || 0
			)
		}
	}

	this.nextPage = function() {
		if (this.loadingChapter) return;
	let nextWrapperIndex = this.imageView.imageWrappersMap[this.SCP.page] + 1;
		
		if(nextWrapperIndex >= this.imageView.imageWrappersMask.length) {
			this.nextChapter();
		} else {
			this.displayPage(this.imageView.imageWrappersMask[nextWrapperIndex][0])
		}
	}

	this.prevPage = function(){
		if (this.loadingChapter) return;
		if(this.SCP.page > 0) 
			this.displayPage(this.SCP.page - 1)
		else {
			this.prevChapter('last');
		}
	}
	this.nextVolume = function(){
		if (this.loadingChapter) return;
		this.selectVolume(+this.SCP.volume+1);
	}
	this.prevVolume = function(){
		if (this.loadingChapter) return;
		this.selectVolume(+this.SCP.volume-1)
	}

	this.copyShortLink = function() { 
		// TODO: hard-coded values is meh
		let url = document.location.href + document.location.hash;
	var chapter = '' + (this.SCP.chapterObject.notice? +this.SCP.chapter-1 : this.SCP.chapter);
		if (document.location.pathname.includes("Kaguya-Wants-To-Be-Confessed-To/")) {
			url = document.location.origin + '/' + chapter.replace('.', '-') + '/'+ (this.SCP.page+1) + document.location.hash;
		}
		navigator.clipboard.writeText(url)
		.then(function() {
		  Tooltippy.set('Link copied to clipboard!');
		}, function(err) {
		  Tooltippy.set('Link copy failed ('+url+')');
		});
	}

	this.openComments = function() {
		if(this.SCP.series && this.SCP.chapter !== undefined)
			window.location.href = '/read/manga/' + this.SCP.series + '/' + this.SCP.chapter + '/comments';
	}

	this.setLayout = (layout, silent) => {
		requestAnimationFrame(() => {
			this.recalculateBuffer();
			this.stickHeader();
		})

		if(!silent) {
			this.imageView.drawImages(this.current.chapters[this.SCP.chapter].images[this.SCP.group], this.current.chapters[this.SCP.chapter].wides[this.SCP.group]);
			this.imageView.selectPage(this.SCP.page);
			if(Settings.get('bhv.swipeGestures') && Settings.get('lyt.direction') != 'ttb'){
				this.imageView.setTouchHandlers(true);
			}else{
				this.imageView.setTouchHandlers(false);
			}

		}
	}	

	this.recalculateBuffer = () => {
		if (IS_MOBILE) {
			if (Settings.get('lyt.direction') === 'ttb' && Settings.get('apr.selPinned')) {
			var tOH = this._.title.offsetHeight;
			var sOH = this._.rdr_selector.offsetHeight;
				// Order of these statements seem to matter for Chrome's scroll shifting behaviour; if height is
				// set before top, the scroll bug occurs. Thus, it might break in future updates.
				this._.rdr_selector.style.top = tOH + 'px';
				this._.rdr_aside_buffer.style.height = tOH + sOH + 'px';
				// console.log(window.scrollY); // This statement also reintroduces the scroll bug regardless of order
			} else {
				this._.rdr_aside_buffer.style.height = '0px';
			}
		}
	}
	this.stickHeader = () => {
		if(IS_MOBILE) {
			if(Settings.get('lyt.direction') == 'ttb' && Settings.get('apr.selPinned')) {
				this.$.classList.add('stick');
			}else{
				this.$.classList.remove('stick');
			}
		}
	}

	this.setZoom = function(zoom) {
		this.imageView.updateScrollPosition();
		Settings.setClass('lyt.zoom'); //broke
		setTimeout(this.imageView.updateWides, 1);
	}

	this.toggleSidebar = function(state) {
		this.imageView.updateScrollPosition();
		Settings.setClass('apr.sidebar');
		this.imageView.updateWides();
	}

	this.enqueuePreload = images => {
		images.filter(item => item !== undefined)
			.slice(0,4)
			.forEach((img, i) => this._.preload_entity.children[i].src = img.url);
	}

	this.eventRouter = function(event){
		({
			'nextPage': () => this.nextPage(),
			'prevPage': () => this.prevPage(),
			'newPageIndex': (page) => {
				this._.image_description.textContent = this.current.chapters[this.SCP.chapter].descriptions[this.SCP.group][page];
			}
		})[event.type](event.data)
	}

	this.settingsRouter = function(o) {
		if(o.type != 'change') return;
	var settings = {
			'lyt.fit': o => {
				this.imageView.updateWides();
			},
			'lyt.direction': o => this.setLayout(o),
			'lyt.zoom': o => this.setZoom(o),
			'adv.spreadCount': o => this.bootstrapChapter(),
			'adv.spreadOffset': o => this.bootstrapChapter(),
			'bhv.preload': number => {
				this.$.setAttribute('data-preload', number);
			},
			'apr.sidebar': o => this.toggleSidebar(o),
			'apr.selPinned': o => this.setLayout(o, true),
			'apr.previews': o => this.drawPreviews(o),
			'thm.reset' : o => {
				ThemeManager.themeUpdated()
			},
			'thm.theme' : o => ThemeManager.themeUpdated(),
			'thm.primaryCol' : o => ThemeManager.themeUpdated(),
			'thm.readerBg' : o => ThemeManager.themeUpdated(),
			'thm.accentCol' : o => ThemeManager.themeUpdated(),
			'thm.textCol' : o => ThemeManager.themeUpdated(),
			'misc.groupPreference': o => {},
		};
		if(settings[o.setting]) settings[o.setting](o.value);
	}

	this.shuffleRandomChapter = function() {
		if(this.SCP.chapter == '46.5' && this.SCP.series == 'Kaguya-Wants-To-Be-Confessed-To') {
			this._.random_chapter.classList.remove('is-hidden');
		} else {
			this._.random_chapter.classList.add('is-hidden');
			return;
		}

		if(!this.current.chapters[this.SCP.chapter].previewsBackup)
			this.current.chapters[this.SCP.chapter].previewsBackup = this.current.chapters[this.SCP.chapter].previews[this.SCP.group].slice();
		var previews = this.current.chapters[this.SCP.chapter].previewsBackup;
		var pages = this.current.chapters[this.SCP.chapter].images[this.SCP.group];
		function shuffle(array) {
			var currentIndex = array.length, temporaryValue, randomIndex;
			while (0 !== currentIndex) {
				randomIndex = Math.floor(Math.random() * currentIndex);
				currentIndex -= 1;
				temporaryValue = array[currentIndex];
				array[currentIndex] = array[randomIndex];
				array[randomIndex] = temporaryValue;
			}
			return array;
		}
	var subarr = previews.slice(4,16);
		subarr.unshift(subarr.pop());
	var uarr = [];
		for(var i=0; i<subarr.length; i=i+2) {
			uarr.push([subarr[i], subarr[i+1]])
			shuffle(uarr[uarr.length-1]);
		}
		uarr = shuffle(uarr);
		uarr = uarr.reduce((acc, val) => acc.concat(val), []);

		this.current.chapters[this.SCP.chapter].previews[this.SCP.group] = previews.slice(0, 4).concat(uarr,previews.slice(-1));
		this.current.chapters[this.SCP.chapter].images[this.SCP.group] = this.current.chapters[this.SCP.chapter].previews[this.SCP.group].map(p => p.replace('_shrunk',''))
	}

	this._.chap_prev.onmousedown = e => this.prevChapter();
	this._.chap_next.onmousedown = e => this.nextChapter();
	this._.vol_prev.onmousedown = e => this.prevVolume();
	this._.vol_next.onmousedown = e => this.nextVolume();
	this._.settings_button.onmousedown = e => Loda.display('settings');
	new UI_MultiStateButton({node: this._.preload_button, setting: 'bhv.preload'}).S.biLink(Settings);
	new UI_MultiStateButton({node: this._.layout_button, setting: 'lyt.direction'}).S.biLink(Settings);
	new UI_MultiStateButton({node: this._.fit_button, setting: 'lyt.fit'}).S.biLink(Settings);
	new UI_MultiStateButton({node: this._.sel_pin_button, setting: 'apr.selPinned'}).S.biLink(Settings);
	new UI_MultiStateButton({node: this._.sidebar_button, setting: 'apr.sidebar'}).S.biLink(Settings);
	new UI_MultiStateButton({node: this._.previews_button, setting: 'apr.previews'}).S.biLink(Settings);
	new UI_MultiStateButton({node: this._.spread_button, setting: 'lyt.spread'}).S.biLink(Settings);
	// this._.fit_button.onmousedown = e => {
	// 	this.asideViews.S.call('number', 0);
	// }
	this._.zoom_level_plus.onmousedown = e => Settings.next('lyt.zoom', undefined, true);
	this._.zoom_level_minus.onmousedown = e => Settings.prev('lyt.zoom', undefined, true);
	this._.share_button.onmousedown = e => this.copyShortLink(e);
	this._.search.onclick = e => Loda.display('search');
	this._.jump.onclick = e => Loda.display('jump');
	this._.download_chapter.onclick = () => DownloadManagerObj.downloadChapter();
	this._.download_cancel.onclick = () => DownloadManagerObj.cancelDownload();
	this._.random_chapter_button.addEventListener('mousedown', e => {
		e.preventDefault();
		e.stopPropagation();
		this.initChapter(this.SCP.chapter, 2);
		return false;
	}, false)

	Tooltippy
		.attach(this._.chap_prev, 'Previous chapter [[]')
		.attach(this._.chap_next, 'Next chapter []]')
		.attach(this._.vol_prev, 'Previous volume [,]')
		.attach(this._.vol_next, 'Next volume [.]')
		.attach(this._.preload_button, 'Change preload [L]')
		.attach(this._.layout_button, 'Change layout direction [D]')
		.attach(this._.fit_button, 'Change fit mode [F]')
		.attach(this._.sel_pin_button, 'Pin page selector [N]')
		.attach(this._.sidebar_button, 'Show/hide sidebar [S]', 'right')
		.attach(this._.previews_button.querySelector('.expander'), 'Show previews [P]')
		.attach(this._.share_button, 'Copy short link [R]')
		.attach(this._.search, 'Search the manga... [Ctrl]+[F]')
		.attach(this._.jump, 'Jump to chapter... [J]')
		.attach(this._.spread_button, 'Change two-page mode [Q]')
		.attach(this._.settings_button, 'Advanced settings... [O]')
		.attach(this._.download_chapter, 'Download chapter in the background')
		//.attach(this._.comment_button, 'Go to comments [C]')
		// .attach(this._.fit_none, 'Images are displayed in natural resolution.')
		// .attach(this._.fit_all, 'Images expand to width or height.')
		// .attach(this._.fit_width, 'Images expand to max width.')
		// .attach(this._.fit_height, 'Images expand to max height.')
		// .attach(this._.fit_all_limit, 'Natural image size that does not exceed max width or height.')
		// .attach(this._.fit_width_limit, 'Natural image size that does not exceed max width.')
		// .attach(this._.fit_height_limit, 'Natural image size that does not exceed max height.')
		// .attach(this._.zoom_level_plus, 'Increase zoom level')
		// .attach(this._.zoom_level_minus, 'Decrease zoom level')

	this.S.mapIn({
		seriesUpdated: this.updateData,
		isFirstParty: this.controlFeatures,
		event: this.eventRouter,
		settingsPacket: this.settingsRouter,
		message: message => {
			Tooltippy.set(message);
		},
	})

	this.S.link(this.selector_page);
	this.S.linkAnonymous('SCP', SCP => this.previews.select(SCP.page, undefined, undefined, true));
}

function UI_ReaderImageView(o) {
	o=be(o);
	UI.call(this, {
		node: o.node,
		kind: ['ReaderImageView'].concat(o.kind || []),
	});
	Linkable.call(this);
	this.firstDraw = true;
	this.imageContainer = new UI_Tabs({
		node: this._.image_container,
		held: true
	})
	this.wrappers = {};
	
	this.getScrollElement = function() {
		if(Loda.open) return {
			focus: () => {},
			scroll: () => {}
		};
		if(Settings.get('lyt.direction') == 'ttb') {
			if(IS_MOBILE) {
				return document.documentElement;
			}else{
				return this._.image_container;
			}
		}else{
			return this.wrappers.current.$;
		}
	}

	new KeyListener(document.body, 'hold')
		.attach('slideDown', ['ArrowDown'], (e, frame) => {
		var scr = this.getScrollElement();
			scroll(scr, scr.scrollLeft,scr.scrollTop + Settings.get('bhv.scrollYDelta')*Math.min((frame+1)*2/20,1), true)
		})
		.attach('slideUp', ['ArrowUp'], (e, frame) => {
		var scr = this.getScrollElement();
			scroll(scr, scr.scrollLeft,scr.scrollTop - Settings.get('bhv.scrollYDelta')*Math.min((frame+1)*2/20,1), true)
		});

	this.scroll = {
		prevY: 0,
		direction: null,
		anchorObject: null,
		anchorOffset: 0,
		anchorRAF: 0,
		anchorTimeout: 0
	}

	document.onscroll = this._.image_container.onscroll = e => {
		if(PROGRAMMATIC_SCROLL) return true;
		if(!this.imageList) return true;
		if(Settings.get('lyt.direction') != 'ttb') return true;

		Reader.stickHeader();
	var scrollTop = (e.target.scrollingElement)?
				e.target.scrollingElement.scrollTop:
				undefined
			|| e.target.scrollTop;
		// console.log('wideUpdate fire')
		if(!this.scroll.anchorRAF) {
			this.updateScrollPosition();
		}
	this.scroll.direction = scrollTop > this.scroll.prevY?1:-1;
	var st = scrollTop + document.documentElement.clientHeight * (this.scroll.direction > 0?0.70:0.30);
	if(window.test_element) window.test_element.style.top = st + 'px'; 
	this.scroll.prevY = scrollTop;
	var offsets = this.imageList.map(item => item.$.offsetTop + item.$.parentNode.offsetTop);
		offsets.push(st);
		offsets = offsets.sort((a, b) => a - b);
	var index = offsets.indexOf(st) - 1;
		if(index + 1 == offsets.length) return true;
		if(Reader.SCP.page == index) return true;
		for(var i=0; i<index; i++) {
			this.imageList[i].load();
		}
		Reader.displayPage(index, true);
		return true;
	}

	this.$.onscroll = () => {
		scroll(this.$, 0, 0, true);
	}

	this.scrollAnchor = () => {
		this.scroll.anchorRAF = requestAnimationFrame(this.scrollAnchor);
		scroll(this.imageContainer.$, 0, this.scroll.anchorObject.offsetTop + (this.scroll.anchorOffset>0?this.scroll.anchorOffset*-1:this.scroll.anchorObject.offsetHeight * this.scroll.anchorPoint))
	}

	this.updateScrollPosition = () => {
		if(!this.wrappers.current) return;
		this.scroll.anchorObject = this.wrappers.current.$;
		this.scroll.anchorOffset = this.wrappers.current.$.getBoundingClientRect().top;
		this.scroll.anchorPoint = (this.imageContainer.$.scrollTop - this.wrappers.current.$.offsetTop) / this.wrappers.current.$.offsetHeight;
	}

	this.updateWides = () => {
		if(Settings.get('lyt.direction') == 'ttb' && this.wrappers.current ) {
			// console.log('wideUpdate fire')
			if(!this.scroll.anchorRAF && this.scroll.anchorObject) {
				this.scrollAnchor();
			}

			if(this.scroll.anchorTimeout) clearTimeout(this.scroll.anchorTimeout);
			this.scroll.anchorTimeout = setTimeout(() => {
				cancelAnimationFrame(this.scroll.anchorRAF);
				this.scroll.anchorRAF = 0;
				this.updateScrollPosition();
			}, 60)
		}
		if(!this.imageWrappers) return;
		for(var i=0; i < this.imageWrappers.length; i++) {
			if(this.imageWrappers[i].$.scrollWidth > this.imageWrappers[i].$.clientWidth) {
				this.imageWrappers[i].$.classList.add('too-wide');
			}else{
				this.imageWrappers[i].$.classList.remove('too-wide');
			}
		}
	}

	this.drawImages = function(images, wides) {
		this.imageContainer.clear();
		this.imageWrappers = [];
		this.imageWrappersMask = [];
		this.imageWrappersMap = {};
	var spreadCount = Settings.get('adv.spreadCount');
	var	spreadOffset = Settings.get('adv.spreadOffset');
	var imageIndices = [];
		for(var i=0; i < images.length; i++) {
			imageIndices.push(i);
			this.imageWrappersMap[i] = this.imageWrappersMask.length;
			if(wides.indexOf(i) > -1 || wides.indexOf(i+1) > -1){
				spreadOffset++;

			}
			if(spreadOffset >= spreadCount - 1 || i >= images.length - 1) {
				if(wides.indexOf(i) > -1)
					spreadOffset = Settings.get('adv.spreadOffset');
				else
					spreadOffset = 0;
				this.imageWrappersMask.push(imageIndices);
				imageIndices = [];
			}else{
				spreadOffset++;
			}
		}

		this.imageWrappers = this.imageWrappersMask.map(wrapper => 
			new UI_ReaderImageWrapper({
				imageObjects: wrapper.map(index => ({
					url: images[index],
					index: index,
				}))
			})
		);

		this.imageList = [];

		this.imageWrappers.forEach(wrapper => {
			wrapper.S.link(Reader.selector_page);
			this.imageList = this.imageList.concat(wrapper.get());
		})
		if(Settings.get('lyt.direction') == 'rtl') {
			this.imageWrappers.reverse();
			this.imageWrappers.forEach(i => i.reverse());
		}
		this.imageContainer.add(this.imageWrappers);

		scroll(this.imageContainer.$, 0,0);
		
		
		if(Settings.get('lyt.direction') == 'ttb') {
		var butt = new UI_Dummy();
			butt.$.classList.add('nextCha');
			butt.$.onmousedown = e => {
				e.preventDefault();
				Reader.nextChapter(0);
			}
			this.imageContainer.add(butt);
		}
	}

	this.selectPage = function(index, dry) {
		if(index < 0 || index >= this.imageList.length)
			return;

		this.selectedPage = this.imageList[index];
		this.wrappers.current = this.selectedPage.parentWrapper;
	var wrapperIndex = this.imageWrappers.indexOf(this.wrappers.current);
		this.wrappers.left = this.imageWrappers[wrapperIndex - 1] || null;
		this.wrappers.right = this.imageWrappers[wrapperIndex + 1] || null;
		this.visiblePages = this.wrappers.current.getIndices();
		if(Settings.get('lyt.direction') == 'ttb') {
			if (!dry){	
				setTimeout(this.getScrollElement().focus(), 1);
				if(IS_MOBILE) {
					scroll(this.getScrollElement(), 0, this.wrappers.current.$.getBoundingClientRect().top + this.getScrollElement().scrollTop);
				}else{
					scroll(this.getScrollElement(), 0,this.wrappers.current.$.offsetTop);
				}
			}
		}else{
			if(this.touch.transitionTimer) {
				this.touch.transitionTimer.then(() => {
					this.moveContainer(wrapperIndex);
				})
			}else{
				this.moveContainer(wrapperIndex);
			}
			//this.getScrollElement().focus();
			if(Settings.get('bhv.resetScroll')) scroll(this.getScrollElement(), 0, 0);
		}
	var spreadCount = Settings.get('adv.spreadCount');
	var toPreload = Settings.get('bhv.preload');
		if(toPreload == 100) {
			toPreload = this.imageList.length;
		}
		toPreload = toPreload * spreadCount;
		for (var i = index - 3; i < index + Math.max(toPreload, Settings.get('adv.spreadCount')); i++) {
			if(this.imageList[i]) {
				this.imageList[i].load();
			}else if(this.imageList.length < i)
				break;
		}
		if(spreadCount == 2) {
			Reader.enqueuePreload([
				this.imageList[index-2],
				this.imageList[index-1],
				this.imageList[index+2],
				this.imageList[index+3]
			]);
		}else{
			Reader.enqueuePreload([
				this.imageList[index-1],
				this.imageList[index+1]
			]);
		}
		this.S.out('event', {type: 'newPageIndex', data: index})
	}

	this.prev = () => {
		this.S.out('event', {type: 'prevPage'});

	}
	this.next = () => {
		this.S.out('event', {type: 'nextPage'})
	}

	this.moveContainer = (index) => {
		this.containerOffset = ( -100 * index);
		// this.imageContainer.$.style.transform = 'translateX(' + this.containerOffset + '%)';
		this.imageContainer.$.style.marginLeft = this.containerOffset + '%';
	}

	this.moveWrappers = (offset, snap) => {
		if(!this.touch.affectedWrappers) {
			this.touch.affectedWrappers = [];
			if(this.wrappers.left) this.touch.affectedWrappers.push(this.wrappers.left);
			this.touch.affectedWrappers.push(this.wrappers.current);
			if(this.wrappers.right) this.touch.affectedWrappers.push(this.wrappers.right);
		}
		if(snap) {
			this.touch.affectedWrappers.forEach(wrapper => wrapper.$.style.transition = `transform ${this.touch.transitionTime}s cubic-bezier(${this.touch.transitionTime},.55,.4,1)`);
			this.touch.transitionTimer = promiseTimeout(Math.round(this.touch.transitionTime*1000), true);
			this.touch.transitionTimer.then(() => {
					this.touch.affectedWrappers.forEach(wrapper => wrapper.$.style = '');
					this.touch.affectedWrappers = null;
					delete this.touch.transitionTimer;
				}).catch(() => {delete this.touch.transitionTimer;})	
		}else{
			//for regrab
			if(this.touch.transitionTimer) {
				this.touch.transitionTimer.cancel();
				this.touch.transitionTimer = false;
				this.touch.affectedWrappers = null;
			}
		}
		if(this.wrappers.left) this.wrappers.left.$.style.transform = `translateX(${offset * 100}%)`;
		this.wrappers.current.$.style.transform = `translateX(${offset * 100}%)`;
		if(this.wrappers.right) this.wrappers.right.$.style.transform = `translateX(${offset * 100}%)`;
	}

const SCROLL = 1;
const SWIPE = 2;
const SCROLL_X = 3;

	this.setTouchHandlers = (state) => {
		if(state) {
			this._.image_container.ontouchstart = this.touch.startHandler;
			this._.image_container.addEventListener('touchmove', this.touch.moveHandler, {passive: false});
			this._.image_container.ontouchend = this.touch.endHandler;
			this._.image_container.ontouchcancel = this.touch.endHandler;
		}else{
			this._.image_container.ontouchstart = undefined;
            this._.image_container.removeEventListener('touchmove', this.touch.moveHandler);
            this._.image_container.ontouchend = undefined;
			this._.image_container.ontouchcancel = undefined;
		}
	}

	this.touch = {
		start: 0,
		startY: 0,
		initialX: 0,
		scrollY: 0,
		transitionTimer: null,
		delta: 0,
		deltaY: 0,
		em: parseFloat(getComputedStyle(document.body).fontSize),
		gesture: null,
		time: null,
		escapeVelocity: 0.07,
		escapeDelta: 0.40,
		imagePosition: 0,
		a: null
	};
	
	this.touch.startHandler = e => {
		if(this.touch.transitionTimer) return;
		if(e.touches.length > 1) return;
		this.touch.initialX = 0;
		this.touch.x = e.touches[0].pageX;
		this.touch.y = e.touches[0].pageY;
		this.touch.containerWidth = this._.image_container.offsetWidth;
		this.touch.startX = this.touch.x;
		this.touch.startY = this.touch.y;
		this._.image_container.style.transition = '';
		this.touch.gesture = null;
		this.touch.delta = 0;
		this.touch.deltaY = 0;
		this.touch.scrollY = window.scrollY;
		this.touch.measures = [];
		this.touch.times = [];
		if(this.touch.affectedWrappers) this.touch.affectedWrappers.forEach(wrapper => wrapper.$.style = '');
		this.touch.affectedWrappers = null;
	var maxScroll = this.wrappers.current.get().map(img => img.$.offsetWidth).reduce((i, k) => i + k) - this.wrappers.current.$.offsetWidth;
		if(maxScroll <= 0){
			this.touch.imagePosition = null;
		}else if(Math.abs(this.wrappers.current.$.scrollLeft) >= maxScroll-2) {
			this.touch.imagePosition = 1;
		}else if(Math.abs(this.wrappers.current.$.scrollLeft) == 0) {
			this.touch.imagePosition = -1;
		}else{
			this.touch.imagePosition = 0;
		}
	}
	
	this.touch.moveHandler = e => {
		if(this.touch.transitionTimer) return;
		this.touch.x = e.touches[0].pageX;
		this.touch.y = e.touches[0].pageY;
		// this.touch.a = requestAnimationFrame(this.touch.anim);
		if(this.touch.gesture == SCROLL) return;
		if(Settings.get('lyt.direction') == 'ttb') return;

		this.touch.delta = (this.touch.x - this.touch.startX) / this.touch.containerWidth;
		if(this.touch.imagePosition == 0
		|| this.touch.imagePosition == 1 && this.touch.delta > 0
		|| this.touch.imagePosition == -1 && this.touch.delta < 0) {
			this.touch.gesture = SCROLL_X;
			return;
		}
		this.touch.deltaY = this.touch.y - this.touch.startY;

		if(Settings.get('lyt.direction') == 'rtl'){
			if((Reader.SCP.page == Reader.SCP.lastPage && this.touch.delta > 0)
			|| (Reader.SCP.page == 0 && this.touch.delta < 0)) {
				this.wrappers.current.$.style.opacity = (0.6-Math.abs(this.touch.delta))/0.6;
			}
		}else{
			if((Reader.SCP.page == Reader.SCP.lastPage && this.touch.delta < 0)
			|| (Reader.SCP.page == 0 && this.touch.delta > 0)) {
				this.wrappers.current.$.style.opacity = (0.6-Math.abs(this.touch.delta))/0.6;
			}
		}

		this.touch.measures.push(this.touch.x);
		this.touch.times.push(Date.now());
		this.moveWrappers(this.touch.delta);


		if(Math.abs(this.touch.delta) > 0.030 || this.touch.gesture == SWIPE) {
			this.touch.gesture = SWIPE;
			e.preventDefault();
			if(this.touch.scrollLocked == true) return;
			document.documentElement.style.overflow = "hidden";
			this.touch.scrollLocked = true;
			return;
		}
		if(Math.abs(this.touch.deltaY) > this.touch.em) {
			this.touch.gesture = SCROLL;
			this.moveWrappers(0);
			if(this.touch.scrollLocked == false) return;
			document.documentElement.style.overflow = "auto";
			this.touch.scrollLocked = false;
			return;
		}
	}

	this.touch.endHandler = e => {
		if(this.touch.gesture == SCROLL_X || this.touch.gesture == SCROLL) return;
		if(this.touch.transitionTimer) return;
		//cancelAnimationFrame(this.touch.a);
		//this._.image_container.style.touchAction = 'unset';
	var times = this.touch.times.slice(-4);
	var measures = this.touch.measures.slice(-4);
	var ms = times[times.length-1] - times[0];
	var delta = measures[measures.length-1] - measures[0];
	var velocity = (delta / ms) * this.touch.em / 100;
		this.touch.times = [];
		this.touch.measures = [];
		this.touch.transitionTime = Math.max(0, 0.30 - Math.abs(velocity)/2.5);
		if(isNaN(this.touch.transitionTime)) this.touch.transitionTime = 0;
		if(isNaN(this.touch.transitionTime)) debugger;
		if((velocity < this.touch.escapeVelocity * -1
		|| this.touch.delta < this.touch.escapeDelta * -1)
		&& !(Reader.SCP.chapter == Reader.SCP.lastChapter
		&& Reader.SCP.page == Reader.SCP.lastPage)) {
			this.moveWrappers(-1, true);
			switch(Settings.get('lyt.direction')){
				case 'ltr':
					if(this.touch.transitionTimer)
						this.touch.transitionTimer.then(this.next)
					else
						this.next();
					break; 
				case 'rtl': 
					if(this.touch.transitionTimer)
						this.touch.transitionTimer.then(this.prev)
					else
						this.prev();
					break;
			}
		}else
		if((velocity > this.touch.escapeVelocity
		|| this.touch.delta > this.touch.escapeDelta)
		&& !(Reader.SCP.chapter == Reader.SCP.firstChapter
		&& Reader.SCP.page == 0)) {
			this.moveWrappers(1, true);
			switch(Settings.get('lyt.direction')){
				case 'ltr':
					if(this.touch.transitionTimer)
						this.touch.transitionTimer.then(this.prev)
					else
						this.prev();
					break; 
				case 'rtl': 
					if(this.touch.transitionTimer)
						this.touch.transitionTimer.then(this.next)
					else
						this.next();
					break;
			}
		}else{
			this.moveWrappers(0, true);
		}
	}

	this.mouseHandler = function(e) {
		if(e.type == 'mousedown') {
			this.mouseHandler.dead = false;
			this.mouseHandler.active = true;
			this.mouseHandler.initPos = {x: e.pageX, y: e.pageY};
			return;
		}
		if(e.type == 'mousemove') {
			if(this.mouseHandler.dead || !this.mouseHandler.active) {
				this.mouseHandler.justHover = true;
			}else{
				if(Math.abs(this.mouseHandler.initPos.x - e.pageX) > 20 ||
				Math.abs(this.mouseHandler.initPos.y - e.pageY) > 20) {
					this.mouseHandler.dead = true;
				}
				return;
			}
		}
		if(e.type == 'click') {
			this.mouseHandler.active = false;
			if(this.mouseHandler.dead) {
				return;
			}
		}
		if(e.type == 'mouseleave') {
			this._.hover_prev.classList.add('nodelay');
			this._.hover_next.classList.add('nodelay');
			this._.hover_prev.classList.remove('viz');
			this._.hover_next.classList.remove('viz');
			setTimeout(t => {
				this._.hover_prev.classList.remove('nodelay');
				this._.hover_next.classList.remove('nodelay');
			}, 1)
			this.mouseHandler.previousArea = null;
			clearTimeout(this.mouseHandler.arrowTimeout);
			return;
		}
		if(e.button != 0) return;
		if(Settings.get('bhv.clickTurnPage') === false) return;
	var box = this.$.getBoundingClientRect();
	var areas = [
			0,
			box.width * 0.35 + box.left,
			box.width * 0.5 + box.left,
			box.width * 0.65 + box.left,
			box.width + box.left
		];
		areas.push(e.pageX);
		areas.sort((a,b) => a - b);
		if(e.type == 'click') {
			switch (areas.indexOf(e.pageX)) {
				case 1:
					(Settings.get('lyt.direction') == 'rtl')?
						this.next(e):
						this.prev(e);
					break;
				case 2:
				case 3:
					if(IS_MOBILE)
						Settings.cycle('apr.selPinned', undefined, undefined, true); //RMD: notip
					break;
				case 4:
					(Settings.get('lyt.direction') == 'rtl')?
						this.prev(e):
						this.next(e);
					break;
				default:
					break;
			}
		}else{
			if(this.mouseHandler.previousArea == areas.indexOf(e.pageX))
				return;
			this.mouseHandler.previousArea = areas.indexOf(e.pageX);
			clearTimeout(this.mouseHandler.arrowTimeout);
			switch (this.mouseHandler.previousArea) {
				case 1:
					if(!IS_MOBILE) {
						this._.hover_prev.classList.add('viz');
						this._.hover_next.classList.remove('viz');
						this.mouseHandler.arrowTimeout = setTimeout(t => {
							this._.hover_prev.classList.remove('viz');
							this.mouseHandler.previousArea = null;
						}, 1000) //MAGICNUM
					}
					break;
				case 2:
				case 3:
						this._.hover_prev.classList.remove('viz');
						this._.hover_next.classList.remove('viz');
					break;
				case 4:
					if(!IS_MOBILE) {
						this._.hover_next.classList.add('viz');
						this._.hover_prev.classList.remove('viz');
						this.mouseHandler.arrowTimeout = setTimeout(t => {
							this._.hover_next.classList.remove('viz');
							this.mouseHandler.previousArea = null;
						}, 1000) //MAGICNUM
					}
					break;
				default:
					break;
			}
		}
	}

	this.displayNotice = function() {
		this.imageContainer.clear();
		this.imageWrappersMask = [[0]];
		this.imageWrappersMap = {0: 0};

	var notice = new UI_ReaderNoticeWrapper({});
		this.wrappers = []
		this.imageWrappers = [notice];
		this.imageList = notice.get();
		this.imageContainer.add(this.imageWrappers);
	}

	this.$.onmousedown = e => this.mouseHandler(e);
	this.$.onmousemove = e => this.mouseHandler(e);
	this.$.onclick = e => this.mouseHandler(e);
	this.$.onmouseleave = e => this.mouseHandler(e);

	this.resizeSensor = new ResizeSensor(this.$, this.updateWides);

	// this.S.mapIn({
	// 	'imageWidth': this.
	// })
}


function UI_ReaderImageWrapper(o) {
	o=be(o);
	UI_List.call(this, {
		node: o.node,
		kind: ['ReaderImageWrapper'].concat(o.kind || []),
		html: o.html || '<div tabindex="-1"></div>'
	});
	Linkable.call(this);

	this.imageInstances = [];
	this.totalWidth = 0;
	//imageObject = {url, index}
	if(o.imageObjects) {
		o.imageObjects.forEach(img => {
		let image = new UI_ReaderImage({
				url: img.url,
				index: img.index,
				parentWrapper: this
			})
			image.S.link(this);
			this.imageInstances.push(image);
		})
	}else{
		console.error(this, 'No images supplied!')
	}
	this.add(this.imageInstances);

	if(this.imageInstances.length > 1) {
		this.$.classList.add('two-page');
	}

	this.load = function() {
		this.imageInstances.forEach(img => img.load());
	}
	this.getIndices = function() {
		return this.get().map(img => img.index)
	}
	this.checkTooWide = width => {
		this.totalWidth += width;
		if(this.totalWidth > this.$.clientWidth) {
			this.$.classList.add('too-wide');
		}
		if(Settings.get('lyt.direction') == 'rtl') {
			scroll(this.$, this.totalWidth,0)
		}
	}

	this.destroy = () => {
		var children = this.$.children.slice()
		for(var i=0; i<children.length; i++) {
			if(children[i]._struct) children[i]._struct.destroy();
		}
		alg.discardElement(this.$);
		if(this.S) this.S.destroy();
	}

	this.S.mapIn({
		'imageWidth': this.checkTooWide
	})
	this.S.proxyOut('loaded');
	this.S.proxyOut('imageHeight');
}


function UI_ReaderNoticeWrapper(o) {
	o=be(o);
	UI_List.call(this, {
		node: o.node,
		kind: ['ReaderImageWrapper'].concat(o.kind || []),
		html: o.html || '<div tabindex="-1"></div>'
	});
	Linkable.call(this);

	this.imageInstances = [];
	this.totalWidth = 0;

	function countdown(time) {
		time = new Date(time * 1000);
		var t = time.getTime() - Date.now()
		var times = [
			Math.floor( t/(1000*60*60*24) ) + ' days',
			Math.floor( (t/(1000*60*60)) % 24 ) + ' hours',
			Math.floor( (t/1000/60) % 60 ) + ' minutes'
		].slice(0,-1);
		for(var i=0; i<times.length; i++) {
			if(times[i][0] == 0) {
				times.shift();
				i--;
				continue;
			}
			break;
		}
		times = times.slice(0,2);
		times = times.map(item => {
			if(parseInt(item) == 1) return item.replace(/s$/, '');
			else
			return item;
		});
		if(t < 0) return 'Should be soon!';
		return times.join(' ');
	}
	let release;
		if(Reader.current.next_release_time)
			release = Reader.current.next_release_time;
		else
			release = Reader.SCP.chapterObject.release_date[Object.keys(Reader.SCP.chapterObject.release_date)[0]] + 7 * 24 * 60 * 60;
var notice = new UI_Dummy({
		html: ('<div class="ReaderNotice">' +
			(Reader.current.next_release_html || `<h2>You're caught up!</h2>
			<p>Next chapter should come out in about:</p>
			<div class="timer">$countdown</div>
			<a href="https://discord.gg/BDpCRUJ" target="_blank">Discuss the chapter in the Kaguya Discord</a>
			<a href="https://twitter.com/GuyaMoe" target="_blank">Follow our Twitter for updates</a>
			<a href="https://www.viz.com/read/manga/kaguya-sama-love-is-war/all" target="_blank">Buy the official volumes</a>`
		) + '</div>').replace('$countdown', countdown(release))
	});
	notice.parentWrapper = this;
	notice.load = () => {};
	this.imageInstances.push(notice);
	this.add(notice);

	this.load = function() {};
	this.getIndices = function() {return [1]}
	this.checkTooWide = width => {}

	this.destroy = () => {
		var children = this.$.children.slice()
		for(var i=0; i<children.length; i++) {
			if(children[i]._struct) children[i]._struct.destroy();
		}
		alg.discardElement(this.$);
		if(this.S) this.S.destroy();
	}
	this.S.proxyOut('loaded');
}

function UI_ReaderImage(o) {
	o=be(o);
	UI.call(this, {
		node: o.node,
		kind: ['ReaderImage'].concat(o.kind || []),
		html: o.html || '<img src="" />'
	});
	Linkable.call(this);

	this.index = o.index;
	this.url = o.url;
	this.parentWrapper = o.parentWrapper;

	this.onloadHandler = function(e) {
		if(e.type == 'load') {
			this.S.out('loaded', this.index);
			cancelAnimationFrame(this.RAF);
			return;
		}
		//if(!IS_MOBILE) dragscroll.reset([this.$])
		//if(this.fore) this._.image.style.background = 'url('+this.fore+') no-repeat scroll 0% 0% / 0%';
	}

	this.watchImageDimensions = () => {
		this.RAF = requestAnimationFrame(this.watchImageDimensions);
		if(this.$.naturalWidth > 0) {
			this.S.out('imageWidth', this.$.offsetWidth);
			this.S.out('imageHeight', this.$.offsetHeight);
			cancelAnimationFrame(this.RAF);
			this.RAF = null;
			return;
		}
	}

	this.load = function() {
		if(this.loaded) return;
		this.RAF = requestAnimationFrame(this.watchImageDimensions);
		this.$.loading = 'eager';
		this.$.src = this.url;
		this.$.onload = e => this.onloadHandler(e);
		this.loaded = true;
	}

	this.destroy = () => {
		this.$.src = 'data:image/gif;base64, R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAI=';
		if(this.RAF) cancelAnimationFrame(this.RAF);
		alg.discardElement(this.$);
		if(this.S) this.S.destroy();
		this.load = () => {}
	}

}

function UI_PageSelector(o) {
	o=be(o);
	UI.call(this, {
		node: o.node,
		kind: ['PageSelector'].concat(o.kind || []),
	});
	Linkable.call(this);

	this.keys = new UI_Tabs({
		node: this._.page_keys
	});

	this.render = function(SCP) {
		if(SCP.pageCount != this.keys.$.children.length) {
		var keys = [];
			for (var i = 0; i < SCP.pageCount; i++) {
			var key = new UI_Dummy();
				// key.$.onmouseover = e => this.hoverChange(e);
				key.$.innerHTML = i+1;
				keys.push(key);
			}
			this.keys.clear().add(keys)
		}
		this.keys.select(SCP.page, undefined, undefined, true)
	var keys = this.keys.get();
		keys.forEach((key, i) => {
			if(SCP.visiblePages.indexOf(i) > -1) {
				key.$.classList.add('shown');
			}else{
				key.$.classList.remove('shown');
			}
		})
		this._.page_keys_count.innerHTML = SCP.page + 1 + '/' + (SCP.pageCount);
	}
	this.proxy = function(i) {
		this.S.out('page', i);
	}

	this.displayPreload = function(index) {
		this.keys.$.children[+index].classList.add('preloaded');
	}
	this.clearPreload = function() {
		this.keys.$.children.forEach(key => key.classList.remove('preloaded'));
	}
	// this.hoverChange = function(e){
	// 	this._.page_keys_count.innerHTML = this.keys.$.children.indexOf(e.target) + 1;
	// }

	// this.$.onmouseleave = e => {
	// 	this._.page_keys_count.innerHTML = SCP.page + 1;
	// };

	this.S.mapIn({
		'number': this.proxy,
		'SCP': dpraw(data => this.render(data.payload)),
		'loaded': this.displayPreload
	})


	this.keys.S.link(this);
}

function URLChanger(o) {
	o=be(o);
	Linkable.call(this);
	this.hostname = location.hostname[0].toUpperCase() + location.hostname.slice(1);
	this.recentState = {};

	this.updateURL = function(SCP) {
		if(Reader.SCP.chapterObject.notice)
			return;
		if(this.recentState.chapter == SCP.chapter && this.recentState.page == SCP.page)
			return;
	var pathSplit = location.pathname.split("/");
		pathSplit = pathSplit.slice(0, pathSplit.indexOf(SCP.series));
	var pathName = pathSplit
			.concat([SCP.series, SCP.chapter.replace('.', '-'), SCP.page + 1, ''])
			.join('/');

		switch(Settings.get('bhv.historyUpdate')) {
			case 'none':
			var	title = `${Reader.current.title} | ${this.hostname}`;
				window.history.replaceState(null, title, pathName);
				document.title = title;
				break;
			case 'replace':
				title = `${SCP.chapter} - ${SCP.chapterName}, Page ${SCP.page + 1} - ${Reader.current.title} | ${this.hostname}`
				window.history.replaceState(null, title, pathName);
				document.title = title;
				break;
			case 'chap':
				title = `${SCP.chapter} - ${SCP.chapterName}, Page ${SCP.page + 1} - ${Reader.current.title} | ${this.hostname}`
				window.history.replaceState(null, title, pathName);
				document.title = title;
				if(SCP.chapter == this.chapter) return;
				window.history.pushState({chapter: SCP.chapter, page: SCP.page}, title, pathName);
				break;
			case 'jump':
				title = `${SCP.chapter} - ${SCP.chapterName}, Page ${SCP.page + 1} - ${Reader.current.title} | ${this.hostname}`
				if(Math.abs(this.page - SCP.page) > 2 || SCP.chapter != this.chapter) {
					window.history.pushState({chapter: SCP.chapter, page: SCP.page}, title, pathName);
				}else{
					window.history.replaceState(null, title, pathName);
				}
				document.title = title;
				break;
			case 'all':
				if(this.page != SCP.page || SCP.chapter != this.chapter) {
					title = `${SCP.chapter} - ${SCP.chapterName}, Page ${SCP.page + 1} - ${Reader.current.title} | ${this.hostname}`
					window.history.pushState({chapter: SCP.chapter, page: SCP.page}, title, pathName);
					document.title = title;
				}
				break;
		}
		if(Reader.getGroup(undefined, true) !== Reader.SCP.group)
			location.hash = '#' + Reader.SCP.group;
		this.page = SCP.page;
		this.chapter = SCP.chapter;
	}

	this.onHistory = (e) => {
		if(!e.state) return;
		this.recentState = e.state;
		if(Reader.SCP.chapter != e.state.chapter)
			Reader.initChapter(e.state.chapter, e.state.page);
		else
			Reader.displayPage(e.state.page);
	}
	window.addEventListener('popstate', this.onHistory);

	this.S.mapIn({
		SCP: this.updateURL
	})
}

function UI_MessageBox(o) {
	o=be(o);
	UI.call(this, {
		node: o.node,
		kind: ['MessageBox'].concat(o.kind || []),
	});
	Linkable.call(this);

	this.allowedStyles = ['flash', 'fade', 'slide', 'none']
	this.fadeTime = 500;

	this.timers = [];

	this.displayMessage = function(text, style, time) {
		time = time || 2000;
		style = style || 'flash';
		this.timers.forEach(timer => window.clearTimeout(timer));
		if(this.allowedStyles.indexOf(style) > -1) {
			this.allowedStyles.forEach(style => this.$.classList.remove(style));
			setTimeout(() => {
				this.$.classList.add(style);
				this.$.classList.remove('fadeOut');
			}, 1)
		}
		this.$.innerHTML = text;
		this.timers.push(setTimeout(() => this.$.classList.add('fadeOut'), time));
		this.timers.push(setTimeout(() => {
			this.$.innerHTML = '';
			this.allowedStyles.forEach(style => this.$.classList.remove(style));
		}, time + this.fadeTime));
	}

	this.S.mapIn({
		text: this.displayMessage
	});
}


function UI_FauxDrop(o) {
	o=be(o);
	UI.call(this, {
		node: o.node,
		kind: ['FauxDrop'].concat(o.kind || []),
	});
	Linkable.call(this);

	this._.label = this.$.querySelector('label');
	this._.drop = this.$.querySelector('select');

	this.drop = new UI_SimpleList({
		node: this._.drop
	})

	this.handler = e => {
		this._.label.innerHTML = this._.drop.options[this._.drop.selectedIndex].text;
	}

	this.add = this.drop.add.bind(this.drop);
	this.clear = this.drop.clear.bind(this.drop);
	this.get = this.drop.get.bind(this.drop);
	this.set = function (value, dry) {
		this.drop.set(value, dry);
		this.handler();
	}


	this._.drop.addEventListener('change', e => this.handler(e));

	this.S.proxyOut('value', this.drop)
}

function UI_SimpleList(o) {
	o=be(o);
	UI_List.call(this, {
		node: o.node,
		kind: ['SimpleList'].concat(o.kind || []),
	});
	Linkable.call(this);

	this.handler = e => {
		this.S.out('value', this.$.value);
		this.$.blur();
	}

	this.set = function (value, dry) {
		this.$.value = value;
		if(!dry)
			this.S.out('value', this.$.value);
	}

	this.add = function(pairs) {
		this.lastAdded = [];
		pairs.forEach(pair => {
		var item = new UI_SimpleListItem(pair);
			this.$.appendChild(item.$);
			this.lastAdded.push(item);
		});
		return this;
	}

	this.$.onchange = this.handler;


}

function UI_SimpleListItem(o) {
	o=be(o);
	UI.call(this, {
		node: o.node,
		kind: ['SimpleListItem'].concat(o.kind || []),
		html: o.html || '<option></option>'
	});
	this.value = o.value;
	this.$.value = o.value;
	if(this.$.innerHTML.length < 1)
		this.$.innerHTML = o.text || o.value || 'List Element';
}


function UI_LodaManager(o) {
	o=be(o);
	UI.call(this, {
		node: o.node,
		kind: ['LodaManager'].concat(o.kind || []),
		html: o.html || '<div></div>'
	});
	Linkable.call(this);

	this.library = {
		test: new UI_Loda().S.link(this),
		search: new UI_Loda_Search().S.link(this),
		settings: new UI_Loda_Settings().S.link(this),
		jump: new UI_Loda_Jump().S.link(this)
	}

	this.scrollTop = 0;

	this.display = function(loda) {
		this.open = true;
		this.$.classList.remove('hidden');
		this.$.innerHTML = '';
		this.$.appendChild(this.library[loda].$);

		this.$.focus();
		this.keyListener.noPropagation(!!this.library[loda].noPropagation);
		if(this.currentLoda == loda && this.scrollTop > 0)
			scroll(this.$, 0, this.scrollTop)
		else
			setTimeout(() => this.library[loda].focus(), 100);
		this.currentLoda = loda;
	}

	this.close = function() {
		this.$.classList.add('hidden');
		this.$.innerHTML = '';
		Reader.$.focus();
		this.open = false;
	}

	this.keyListener = new KeyListener(this.$)
		.noPropagation(true)
		.attach('close', ['Escape'], this.close.bind(this))

	this.$.onmousedown = (e) => {
		if(e.target == this.$) {
			this.close();
		}
	}

	this.$.onscroll = (e) => {
		this.scrollTop = this.$.scrollTop; 
	}
	
	this.S.mapIn({
		'close': this.close
	})
}

function UI_Loda(o) {
	o=be(o);
	UI.call(this, {
		node: o.node,
		kind: ['Loda'].concat(o.kind || []),
		html: o.html || '<div class="Loda-window" tabindex="-1"><header data-bind="header"></header><button class="ico-btn close" data-bind="close"></button><content data-bind="content"></content></div>'
	});
	Linkable.call(this);
	this.manager = o.manager;
	if(o.name) this._.header.innerHTML = o.name;

	this.close = function() {
		this.S.out('close');
	}

	this.focus = function() {
		this.focusElement.focus();
		if(this.focusElement.select) this.focusElement.select();
	}

	this._.close.onclick = this.close.bind(this)
}

function UI_Loda_Search(o) {
	o=be(o);
	UI_Loda.call(this, {
		node: o.node,
		kind: ['Loda_Search'].concat(o.kind || []),
		name: 'Search',
		html: o.html || `<div class="Loda-window" tabindex="-1"><header data-bind="header"></header><button class="ico-btn close" data-bind="close"></button><content data-bind="content">
				<input type="text" data-bind="input" placeholder="⌕" />
				<div class="search-tabs" data-bind="tabs">
				</div>
				<div class="list-container" data-bind="container">
					<div class="list" data-bind="lookup"></div>
					<div class="list is-hidden" data-bind="indexer"></div>
				</div>
			</content></div>`
	});
	this.manager = o.manager;
	this.name = 'Indexer';
	this.noPropagation = true;
	this.focusElement = this._.input;
	this.isIndexed = typeof(IS_INDEXED) !== "undefined" ? IS_INDEXED : false;
	this.container = new UI_ContainerList({
		node: this._.container
	});

	this.lookup = new UI_MangaSearch({
		node: this._.lookup
	})

	this.tabs = new UI_Tabs({
			node: this._.tabs
		})
		.add(new UI_Tab({
			text: 'Title search'
		}))
		.S.link(this.container)
		.S.linkAnonymous('number', num => {
			this._.input.focus();
		});

	this.tabs.select(0);

	this.lookup.S.link(this.tabs.get(0));
	this.input = new UI_Input({
		node: this._.input
		})
		.S.link(this.lookup)

	if (this.isIndexed) {
		this.indexer = new UI_IndexSearch({
			node: this._.indexer
		});

		this.tabs.add(new UI_Tab({
			text: 'Text search',
			counterText: 'Press <span class="inline-icon">⮠</span>'
		}))

		this.tabs.get(1).$.onmousedown = e => {
			this.input.handler(e);
		}

		this.indexer.S.link(this.tabs.get(1));


		this.input.S.link(this.indexer)
		.S.linkAnonymous('text', text => {
			this.tabs.select(1);
			this.tabs.get(1).update('Loading...');
		})
	}

}

function UI_Loda_Jump(o) {
	o=be(o);
	UI_Loda.call(this, {
		node: o.node,
		kind: ['Loda_Jump'].concat(o.kind || []),
		name: 'Jump',
		html: o.html || `<div class="Loda-window" tabindex="-1"><header data-bind="header"></header><button class="ico-btn close" data-bind="close"></button><content data-bind="content">
				<div class="Jump-Wrapper">
					<input type="tel" data-bind="input_chap" class="UI Input" placeholder="Chapter">
					<input type="tel" data-bind="input_page" placeholder="Page" class="UI Input">
					<button data-bind="btn" class="Jump-Btn UI Button ico-btn"></button>
				</div>
			</content></div>`
	});
	this.manager = o.manager;
	this.name = 'Jumper';
	this.noPropagation = true;
	this.focusElement = this._.input_chap;

	this.btn = new UI_Button({
		node: this._.btn,
		text: 'Go'
	});

	this.input_chap = new UI_Input({
		node: this._.input_chap
		})

	this.input_page = new UI_Input({
		node: this._.input_page
		})


	this.jump = async () => {
		let chap = this._.input_chap.value || Reader.SCP.chapter, page = parseInt(this._.input_page.value) || 1;
		try {
			await Reader.fetchChapter(chap);
			if (page > Reader.current.chapters[chap].images[Reader.getGroup(chap)].length) throw "Invalid Chapter or Page!"
			this._.input_chap.value = this._.input_page.value = "";
			Loda.close();
			Reader.initChapter(chap, page-1);
		}
		catch (err) {
			Tooltippy.set('Please enter valid chapter and page!');
		}
	}

	this.chapPrev = "", this.pagePrev = "", this.cursorPrev = "";

	this.prejump = (el) => {

		if(isNaN(this._.input_chap.value)) {
			this._.input_chap.value = this.chapPrev;
			this._.input_chap.setSelectionRange(this.cursorPrev,this.cursorPrev); 
		}

		if(this._.input_page.value.includes(".") || isNaN(this._.input_page.value)) {
			this._.input_page.value = this.pagePrev;
			this._.input_page.setSelectionRange(this.cursorPrev,this.cursorPrev); 
		}

		if(parseInt(el.value) > parseInt(Reader.SCP.lastChapter) && this.chapPrev.length <= Reader.SCP.lastChapter.length && el.selectionStart === el.value.length && !el.value.substring(el.selectionStart, el.selectionEnd) && this._.input_chap === document.activeElement && el.value.length > this.chapPrev.length && !el.value.endsWith(".")) {
			this._.input_page.value = el.value.charAt(el.value.length-1);
			el.value = el.value.substring(0, el.value.length-1);
			this._.input_page.focus();
		}

		this.chapPrev = this._.input_chap.value;
		this.pagePrev = this._.input_page.value;
	}

	this._.btn.onclick = this.jump;
	[this._.input_chap, this._.input_page].forEach(el => { 
		el.oninput = e => {
		 this.prejump(el); 
		}
	});

	[this._.input_chap, this._.input_page].forEach(el => { 
		el.onkeydown = e => {
			this.cursorPrev = el.selectionEnd;		  
		}
	}); 

	[this._.input_chap, this._.input_page].forEach(el => { new KeyListener(el)
		.attach('Jump', ['Enter'], e => this.jump())
	});

}

function UI_IndexSearch(o) {
	o=be(o);
	UI_Tabs.call(this, {
		node: o.node,
		kind: ['IndexSearch'].concat(o.kind || []),
		html: o.html || `<div></div>`
	});
	Loadable.call(this);

	this.search = function(query) {
		if(query.length < 3) {
			return this.clear();
		}
		API.requestIndex({
			query: query,
			slug: Reader.SCP.series
		}).then(data => {
			for(var searchWord in data.result) {
			var searchResult = data.result[searchWord];
				if(!searchResult._merged) searchResult._merged = {};
				for(var wordVariant in searchResult) {
				var chapters = searchResult[wordVariant];
					if(wordVariant[0] == '_') continue;
					for(var chapter in chapters) {
					var pageList = chapters[chapter];
						if(!searchResult._merged[chapter])
							searchResult._merged[chapter] = pageList || [];
						else {
							pageList.forEach(page => {
								if(searchResult._merged[chapter].indexOf(page) < 0)
									searchResult._merged[chapter].push(page);
							})
						}
					}
				}
			}

		var wordAddrMap = {};
			if(Object.keys(data.result).length > 1) {
				for(var word in data.result) {
				var chapters = data.result[word]._merged;
					for(var chapter in chapters) {
					var pageArray = chapters[chapter];
						pageArray.forEach(page => {
						var id = '' + chapter + '/' + page;
							if(!wordAddrMap[id]) wordAddrMap[id] = 0;
							wordAddrMap[id] += 1;
						})
					}
				}
			var wordAddrMap = Object.filter(wordAddrMap, id => {
					return id == Object.keys(data.result).length;
				})
			var chapters = {};
				for(var key in wordAddrMap) {
				var id = key.split('/')
					if(!chapters[id[0]]) chapters[id[0]] = [];
					chapters[id[0]].push(id[1]);
				}
			}else{
				chapters = data.result[Object.keys(data.result)[0]]._merged;
			}


			// if(Object.keys(data.result).length > 1) {
			// var chapters = Object.keys(data.result[firstWord]._merged).filter((item, key) => {
			// 		for(var word in data.result) {
			// 			if(word == firstWord) continue;
			// 		var chapters = Object.keys(data.result[word]._merged);
			// 			if(chapters.indexOf(item) < 0)
			// 				return false;
			// 		}
			// 		return true;
			// 	})	
			// }else{
			// 	var chapters = Object.keys(data.result[firstWord]._merged);
			// }

		var chapterElements = [];
		var chapKeys = Object.keys(chapters).sort((a,b) => parseFloat(a) - parseFloat(b));
			for(var i=0;i<chapKeys.length;i++) {
			var key = chapKeys[i];
			var item = chapters[key];
				try{
				chapterElements.push(new UI_ChapterUnit({
					chapter: Reader.current.chapters[key.replace('-', '.')],
				//	substring: Object.keys(data.result)[0],
					pages: item.sort((a,b) => a-b)
				}))	
				}catch(e){
					console.warn('Chapter', key, 'wasn\'t found?')
				}	
			};

			this.clear().add(chapterElements);

		}).catch(err => {throw new Error(err)})

	}

	this.S.mapIn({
		'text': this.search,
		// 'quickText': this.clear
	})
}

function UI_MangaSearch(o) {
	o=be(o);
	UI_Tabs.call(this, {
		node: o.node,
		kind: ['MangaSearch'].concat(o.kind || []),
		html: o.html || `<div></div>`
	});

	this.search = function(query, force) {
	this.query = query;
		if(query.length < 1) {
			this.clear(); return;
		}
		if(this.debounce) {
			clearTimeout(this.debouncer);
			this.debouncer = setTimeout(e => {
				this.debounce = false;
				this.search(this.query, true);
			}, 200);
			return;
		}
		if(!force) this.debounce = true;

	var chapters = {};
		if(isNaN(this.query) == false) {
			Reader.current.chaptersIndex.filter(id => {
				return (''+id).indexOf(this.query) > -1;
			}).map(id => {
				return Reader.current.chapters[id];
			}).forEach(chapter => {
				chapters[chapter.id] = chapter;
			})
		}else{
			if(this.query.length < 3) return;
		}
		for(var id in Reader.current.chapters) {
		var chapter = Reader.current.chapters[id];
			if(chapter.title.toLowerCase().indexOf(this.query.toLowerCase()) > -1) {
				chapters[id] = chapter;
			}
		}
	var chapterElements = [];
		for(var id in chapters) {
		var chapter = chapters[id];
			chapterElements.push(new UI_ChapterUnit({
				chapter: chapter,
				substring: query
			}))
		}
		
		this.clear().add(chapterElements);
	}

	this.S.mapIn({
		'text': this.search,
		'quickText': this.search
	})
}


function UI_ChapterUnit(o) {
	o=be(o);
	UI.call(this, {
		node: o.node,
		kind: ['ChapterUnit'].concat(o.kind || []),
		name: 'ChapterUnit',
		html: o.html || `<div><figure data-bind="figure"></figure><content><h2 data-bind="title"></h2><blockquote data-bind="text"></blockquote><div class="pages" data-bind="pages"></div></content></div>`
	});

	this.chapter = o.chapter;
	this.pages = o.pages;
	this.substring = o.substring
	this.pageList = new UI_Tabs({
		node: this._.pages,
		held: true
	})
	this._.title.innerHTML = (o.chapter.id + ' - ' + o.chapter.title).replace(new RegExp('('+o.substring+')', 'gi'), '<i>$1</i>');
	for(var group in o.chapter.images) {
		this._.figure.style.backgroundImage = 'url('+(this.pages?o.chapter.previews[group][+this.pages[0]-1]:o.chapter.previews[group][0])+')';
		break;
	}
	if(this.pages) {
		this.pages.forEach(page => {
		var pageButton = new UI_Dummy({text: page});
			pageButton.$.onclick = e => {
				e.stopPropagation();
				e.preventDefault();
			var pg = +e.target.innerHTML-1;
				Loda.close();
				Reader.initChapter(this.chapter.id, pg);
				return false;
			}
			this.pageList.add(pageButton);
		})
	}

	this.$.onclick = e => {
		Reader.initChapter(this.chapter.id, 0);
		Loda.close();
	}
}

function UI_Loda_Settings(o) {
	o=be(o);
	UI_Loda.call(this, {
		node: o.node,
		kind: ['Loda_Settings'].concat(o.kind || []),
		name: 'Settings',
		html: o.html || `<div class="Loda-window UI Loda Loda_Settings" tabindex="-1">
			<aside>
				<button class="ico-btn close" data-bind="close"></button>
				<header data-bind="header">Settings</header>
				<div class="settings-tabs" data-bind="tabs">
				</div>
			</aside>
			<content data-bind="content">
			</content>
		</div>`
	});
	this.focusElement = this.$;
	this.manager = o.manager;
	this.name = 'Settings';
	this.noPropagation = false;

	this.content = new UI_ContainerList({
		node: this._.content
	});
	this.tabs = new UI_Tabs({
		node: this._.tabs
	}).S.link(this.content);

	this.createCategory = (tabName, content) => {
		this.tabs.add(new UI_IconTab({
			text: tabName
		}));
		this.content.add(content);
		return this;
	} 

	for(let category in Settings.settings) {
		if(Settings.settings[category].hidden) continue;
	var container = new UI_Dummy();
		for(let setting in Settings.settings[category]) {
			if(Settings.settings[category][setting].hidden) continue;
		let sU = new UI_SettingUnit({
				setting: Settings.settings[category][setting]
			});
			Settings.S.link(sU);
			container.$.appendChild(sU.$);
		}
		this.createCategory(Settings.settings[category].name, container);
	}

	this.tabs.select(0);
}

function UI_SettingUnit(o) {
	o=be(o);
	Linkable.call(this);
	UI.call(this, {
		node: o.node,
		kind: ['SettingUnit'].concat(o.kind || []),
		name: 'SettingUnit',
		html: o.html || `
		<div class="setting-wrapper">
			<header class="setting-header" data-bind="header"></header>
			<div class="setting-field" data-bind="field"></div>
		</div>`
	});

	this.setting = o.setting;

	this._.header.innerHTML = this.setting.prettyName;
	this.controls = new UI_SettingDisplay({
		node: this._.field,
		setting: this.setting
	})

	this.packetHandler = (packet) => {
		if(packet.setting != this.setting.addr) return;
		if(packet.type == 'disable')
			this.hide();
		else if(packet.type == 'enable')
			this.show();
	}
	this.hide = () => {
		this._.header.classList.add('disabled');
		this._.field.classList.add('disabled');
	}
	this.show = () => {
		this._.header.classList.remove('disabled');
		this._.field.classList.remove('disabled');
	}

	if(this.setting.disabled)
		this.hide()

	if(this.setting.nomobile)
		this.$.classList.add('nomobile');

	if(this.setting.compact)
		this.$.classList.add('compact');

	this.S.mapIn({
		settingsPacket: this.packetHandler
	})
}

function UI_SettingDisplay(o) {
	o=be(o);
	UI.call(this, Object.assign(o, {
		kind: ['SettingDisplay'].concat(o.kind || [])
	}));
	this.setting = o.setting;
	this.disabled = o.disabled || false;
	this.entity = null;
	switch(this.setting.type) {
		case SETTING_MULTI:
		case SETTING_BOOLEAN:
			this.entity = new UI_ButtonGroup({
				html: this.setting.html,
				setting: this.setting
			}).S.biLink(Settings);
			break;
		case SETTING_VALUE:
		case SETTING_VALUE_STEPPED:
			this.entity = new UI_Slider({
				setting: this.setting
			}).S.biLink(Settings);
			break;
		case SETTING_COLOR:
			this.entity = new UI_ColorPicker({
				setting: this.setting
			}).S.biLink(Settings);
			break;
		case SETTING_BUTTON: 
			this.entity = new UI_ResetButton({
				setting: this.setting,
				html: `<button class="reset-btn"></button>`,
				text: 'Reset'
			}).S.link(Settings);
			break;
		case SETTING_MULTI_DROPDOWN:
		this.entity = new UI_Dropdown({
			setting: this.setting,
			options: this.setting.optionsPrimitive,
			disabled: false
		}).S.link(Settings);
		break;
	}


	if(this.entity) this.$.appendChild(this.entity.$);

	return this;
}


const WIDE_FLAG = "_w.";

function firstPartySeriesHandler(mediaURL, chapter, group, slug) {
	for (let i = 0; i < chapter.groups[group].length; i++) {
		chapter.images[group].push(
			mediaURL
				+ slug 
				+ '/chapters/' 
				+ chapter.folder 
				+ '/' 
				+ group 
				+ '/' 
				+ chapter.groups[group][i]
		)
		chapter.blurs[group].push(
			mediaURL
				+ slug 
				+ '/chapters/' 
				+ chapter.folder 
				+ '/' 
				// + "shrunk_blur_"+ group
				+ group+"_shrunk_blur" 
				+ '/' 
				+ chapter.groups[group][i]
		)
		chapter.previews[group].push(
			mediaURL
				+ slug 
				+ '/chapters/' 
				+ chapter.folder 
				+ '/' 
				// + "shrunk_"+ group
				+ group+"_shrunk" 
				+ '/' 
				+ chapter.groups[group][i]
		)
		if (chapter.groups[group][i].includes(WIDE_FLAG)) {
			chapter.wides[group].push(i);
		}
	}
	chapter.loaded[group] = true;
}

// NH API response returns an array, whereas others returns a chapter ID
function thirdPartySeriesHandler(url, chapter, group) {
	if (Array.isArray(chapter.groups[group])) {
		// TODO page handling is pretty ugly here. I'd recommend a refactor someday.
		for (let i = 0; i < chapter.groups[group].length; i++) {
			let image = chapter.groups[group][i];
			if (typeof image === 'string' || image instanceof String) {
				chapter.images[group].push(image);
				if (image.includes(WIDE_FLAG)) {
					chapter.wides[group].push(i);
				}
			} else {
				chapter.descriptions[group].push(image.description);
				chapter.images[group].push(image.src);
				if (image.src.includes(WIDE_FLAG)) {
					chapter.wides[group].push(i);
				}
			}
		}
		chapter.loaded[group] = true;
	} else {
		if (!chapter.pageRequest) chapter.pageRequest = {};
		chapter.loaded[group] = false;
		chapter.pageRequest[group] = async () => {
			let images = chapter.images[group];
			try {
				// Each group/chapter pair has a unique ID, returned by API
				let pages = await fetch(`${chapter.groups[group]}`)
								.then(r => r.json());
				pages.forEach(p => {
					if (typeof p === 'string' || p instanceof String) {
						images.push(p);
					} else {
						images.push(p.src);
					}
				});
				return pages.length;
			} catch (e) {
				console.log(e);
				return 0;
			}
		}
	}
}

function DownloadManager() {
	this.chapterDownloadURL = "";
	continueDownload = false;
	this.downloadChapter = async function() {
		if(this.chapterDownloadURL) {
			URL.revokeObjectURL(this.chapterDownloadURL)
		}
		Reader._.download_chapter.classList.add("hidden");
		Reader._.downloading_chapter.textContent = `Ch.${Reader.SCP.chapter} : 0%`;
		Reader._.download_wrapper.classList.remove("hidden");
		let mimeMap = {
			'image/gif': '.gif',
			'image/jpeg': '.jpg',
			'image/png': '.png',
			'image/webp': '.webp',
		}
		await Reader.fetchChapter(Reader.SCP.chapter)
		let chapURLArray = Reader.SCP.chapterObject.images[Reader.getGroup(Reader.SCP.chapter)];
		if (await shouldUseProxy(chapURLArray[0])) {
			chapURLArray = chapURLArray.map((url) => `${IMAGE_PROXY_URL}/${url}`);
		}
		continueDownload = true;
		try {
			let parallelDownloads = Settings.get("adv.parallelDownloads");
			let zip = new JSZip();
			let progress = 0;
			for (let i = 0; i < chapURLArray.length; i += parallelDownloads) {
				if (!continueDownload) return;
				let imageBlobs = await Promise.all(
					chapURLArray
					.slice(i, i + parallelDownloads)
					.map((url, subIndex) => {
						return (async () => {
							let contents = await downloadHandler(url);
							progress++;
							Reader._.downloading_chapter.textContent = `Ch.${Reader.SCP.chapter} : ${Math.round(progress / chapURLArray.length * 98)}%`;
							return {
								contents,
								"fileIndex": i + subIndex + 1,
							};
						})();
					})
				);
				imageBlobs.forEach((data) => {
					zip.file(data.fileIndex + mimeMap[data.contents.type], data.contents, { binary: true });
				});
			}

			let zipBlob = await zip.generateAsync({type:"blob"});
			if(!continueDownload) return;
			this.chapterDownloadURL = URL.createObjectURL(zipBlob);
			initiateDownload(this.chapterDownloadURL);
		} catch (err) {
			TooltippyError.set("An error occured while downloading: " + err.message);
		} finally {
			wrapUp()
		}
	}

	async function shouldUseProxy(testUrl) {
		// We don't know the actual error so we'll play it
		// safe and assume this error is due to CORS
		try {
			await fetch(testUrl);
			return false;
		} catch (err) {
			return true;
		}
	}

	async function downloadHandler(url) {
		const TRIES = 3;
		for (let attempt = 1; attempt <= TRIES; attempt++) {
			try {
				return (await fetch(url)).blob();
			} catch (e) {
				await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
			}
		}
		throw new Error(`Failed to download after exhausting all ${TRIES} tries.`);
	}

	function wrapUp() {
		Reader._.download_wrapper.classList.add("hidden");
		Reader._.download_chapter.classList.remove("hidden");
		continueDownload = false;
	}

	this.cancelDownload = function() {
		wrapUp();
	}

	function initiateDownload(url) {
		let elem = window.document.createElement('a');
		elem.href = url;
		elem.download = Reader.SCP.chapter + ".zip";        
		document.body.appendChild(elem);
		elem.click();        
		document.body.removeChild(elem);
	}
}

function UI_About(o) {
	o=be(o);
	UI.call(this, Object.assign(o, {
		kind: ['About'].concat(o.kind || []),
		html: `<div>
			<hr>
			<p class="muted">Powered by</p>
			<a href="https://github.com/appu1232/guyamoe" target="_blank"><div class="cubari" data-bind="cubari"><div></div></div></a>
			<hr>
			<p>Design, UX: Algoinde</p>
			<p>Reader code: Algoinde, funkyhippo, Einlion</p>
			<p>Backend: appu</p>
		</div>`
	}));

	this.cubariMove = (e) => {
		var x = e.pageX;
		var y = e.pageY;
		var	cCR = this._.cubari.getBoundingClientRect();	
		var cX = cCR.left + cCR.width / 2;
		var cY = cCR.top + cCR.height / 2;
		var	xDist = (cX - x) / (cX - x<0?document.documentElement.clientWidth - cX:cX) * -16;
		var yDist = (cY - y) / (cY - y<0?document.documentElement.clientHeight - cY:cY) * -12;
			this._.cubari.children[0].style.transform = `translate3d(${xDist}%, ${yDist}%, 0)`
		}
	this._.cubari.onmouseover = () => {
		if(this.listener) return;
		this.listener = true;
		document.addEventListener('mousemove', this.cubariMove);
		this._.cubari.children[0].style.transition = '';
		setTimeout(() => {
			document.removeEventListener('mousemove', this.cubariMove);
			this._.cubari.children[0].style.transform = '';
			this._.cubari.children[0].style.transition = 'transform 0.3s ease';
			this.listener = false;
		}, 5000);
	}

	return this;
}

alg.createBin();

API = new ReaderAPI();
Settings = new SettingsHandler();

Tooltippy = new UI_Tooltippy({
	node: document.querySelector('.Tooltippy'),
});

TooltippyError = new UI_Tooltippy({
	node: document.querySelector('.Tooltippy.Error'),
	kind: 'Error'
})

Reader = new UI_Reader({
	node: document.getElementById('rdr-main'),
});
Loader = new LoadHandler();
URLC = new URLChanger();
Loda = new UI_LodaManager({
	node: document.querySelector('.LodaManager'),
});
ThemeManager = new themeHandler();
DownloadManagerObj = new DownloadManager()

Loda.library.settings.createCategory('About', new UI_About());

API.S.link(Reader);
Settings.S.link(Reader);
Reader.S.link(URLC);
Reader.S.link(Settings);
Reader.$.focus();
ThemeManager.S.link(Settings);
//Settings.sendInit();
ThemeManager.themeUpdated();

if(window.location.hash == '#s') Loda.display('search');


function debug() {
	var el = document.createElement('div');
	el.id = 'test_element';
	document.getElementsByClassName('rdr-image-wrap')[0].appendChild(el)
}


// This is a hacky fix that prevents the last div of a
// flexbox from not receiving the scroll event from a
// mousewheel. Probably requires some more investigation.
// window.addEventListener("wheel", () => {});
