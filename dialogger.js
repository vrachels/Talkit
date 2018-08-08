function getURLParameter(name) {
	return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [, ""])[1].replace(/\+/g, '%20')) || null
}

function onError(e) {
	console.log('Error', e);
}

var fs = null;
var loadOnStart = getURLParameter('load');
var importOnStart = getURLParameter('import');

addEventListener('app-ready', function (e) {
	fs = require('fs');
	$('#import').hide();
	$('#export').hide();
	$('#export-game').hide();
});

var graph = new joint.dia.Graph();

var defaultLink = new joint.dia.Link(
	{
		attrs:
		{
			'.marker-target': { d: 'M 10 0 L 0 5 L 10 10 z', },
			'.link-tools .tool-remove circle, .marker-vertex': { r: 8 },
		},
	});


defaultLink.set('smooth', true);

// added to by node definition scripts
var allTypes = {};
var allTypesExceptChoice = {};
var allChoiceTypes = {};

/**
 * Map of node cell type to a map of node cell types for validation.
 * Lookup is allowableConnections[output node owner type][input node owner type]
 * 
 * type is: { [outputOwnerNodeType: string]: { [inputOwnerNodeType: string]: boolean }}
 * 
 * So that future nodes are automatically added in the general case, the
 * suggested implementation is to use a reference to the maps above ('alltypes', 'allTypesExcept...', etc)
 */
var allowableConnections = {};

function validateConnection(cellViewS, magnetS, cellViewT, magnetT, end, linkView) {
	// Prevent loop linking
	if (magnetS == magnetT)
		return false;

	if (cellViewS == cellViewT)
		return false;

	if (!magnetT) return false;

	// Can't connect to an output port
	if (magnetT.attributes.magnet.nodeValue !== 'passive')
		return false;

	var sourceType = cellViewS.model.attributes.type;
	var targetType = cellViewT.model.attributes.type;

	var forSource = allowableConnections[sourceType];
	var allowable = forSource[targetType];

	return allowable;
}

function validateMagnet(cellView, magnet) {
	if (magnet.getAttribute('magnet') === 'passive')
		return false;

	// If unlimited connections attribute is null, we can only ever connect to one object
	// If it is not null, it is an array of type strings which are allowed to have unlimited connections
	var unlimitedConnections = magnet.getAttribute('unlimitedConnections');
	var links = graph.getConnectedLinks(cellView.model);
	for (var i = 0; i < links.length; i++) {
		var link = links[i];
		if (link.attributes.source.id === cellView.model.id && link.attributes.source.port === magnet.attributes.port.nodeValue) {
			// This port already has a connection
			if (unlimitedConnections && link.attributes.target.id) {
				var targetCell = graph.getCell(link.attributes.target.id);
				if (unlimitedConnections.indexOf(targetCell.attributes.type) !== -1)
					// It's okay because this target type has unlimited connections
					return true;
			}
			return false;
		}
	}

	return true;
}

joint.shapes.dialogue = {};

joint.shapes.dialogue.Base = joint.shapes.devs.Model.extend(
	{
		defaults: joint.util.deepSupplement(
			{
				type: 'dialogue.Base',
				size: { width: 250, height: 135 },
				name: '',
				attrs:
				{
					rect: { stroke: 'none', 'fill-opacity': 0 },
					text: { display: 'none' },
					'.inPorts circle': { magnet: 'passive' },
					'.outPorts circle': { magnet: true, },
				},
			},
			joint.shapes.devs.Model.prototype.defaults
		),
	});

joint.shapes.dialogue.BaseView = joint.shapes.devs.ModelView.extend({
	defaults: joint.util.deepSupplement(
		{
			type: 'dialogue.Unknown',
			inPorts: ['input'],
			outPorts: ['output'],
			attrs: {
				'.outPorts circle': { unlimitedConnections: ['dialogue.Choice'] }
			}
		},
		joint.shapes.dialogue.Base.prototype.defaults
	),

	template: [
		'<div class="node">',
		'<span class="label"></span>',
		'<button class="delete">x</button>',
		'<input type="actor" class="actor" placeholder="Actor" />',
		'<p> <textarea type="text" class="text" rows="4" cols="27" placeholder="Speech"></textarea></p>',
		'</div>',
	].join(''),

	initialize: function () {


		_.bindAll(this, 'updateBox');
		joint.shapes.devs.ModelView.prototype.initialize.apply(this, arguments);

		this.$box = $(_.template(this.template)());

		// Prevent paper from handling pointerdown.
		this.$box.find('input').on('mousedown click', function (evt) { evt.stopPropagation(); });
		this.$box.find('textarea').on('mousedown click', function (evt) { evt.stopPropagation(); });

		// delete this object
		this.$box.find('.delete').on('click', _.bind(this.model.remove, this.model));

		// Store the data in the cell model on input change

		this.$box.find('input.actor').on('change', _.bind(function (evt) {
			this.model.set('actor', $(evt.target).val());
		}, this));

		this.$box.find('textarea.text').on('change', _.bind(function (evt) {
			this.model.set('text', $(evt.target).val());
		}, this));

		// Update the box position whenever the underlying model changes.
		this.model.on('change', this.updateBox, this);
		// Remove the box when the model gets removed from the graph.
		this.model.on('remove', this.removeBox, this);

		// fixups
		this.model.set('text', this.model.get('text') || this.model.get('name'));

		this.updateBox();
	},

	render: function () {
		joint.shapes.devs.ModelView.prototype.render.apply(this, arguments);
		this.paper.$el.prepend(this.$box);
		this.updateBox();
		return this;
	},

	updateBox: function () {
		// Set the position and dimension of the box so that it covers the JointJS element.
		var bbox = this.model.getBBox();

		// Update the HTML with a data stored in the cell model.
		var actorField = this.$box.find('input.actor');
		if (!actorField.is(':focus'))
			actorField.val(this.model.get('actor'));

		var textAreaField = this.$box.find('textarea.text');
		if (!textAreaField.is(':focus'))
			textAreaField.val(this.model.get('text') || this.model.get('name'));

		var label = this.$box.find('.label');
		var type = this.model.get('type').slice('dialogue.'.length);
		label.text(type);
		label.attr('class', 'label ' + type);
		this.$box.css({ width: bbox.width, height: bbox.height, left: bbox.x, top: bbox.y, transform: 'rotate(' + (this.model.get('angle') || 0) + 'deg)' });
	},

	removeBox: function (evt) {
		this.$box.remove();
	},
});

var gameDataHandler = {};
var linkDataHandler = {};

// deprecated: text and node allowed 'choices'.  Use Search and Select nodes
linkDataHandler['Text'] = linkDataHandler['Node'] = function (cell, source, target) {
	if (!target || target.type !== 'Choice') return false;

	if (!source.choices) {
		source.choices = [];
		delete source.next;
	}

	source.choices.push(target.id);
}

function gameData() {
	var cells = graph.toJSON().cells;
	var nodesByID = {};
	var cellsByID = {};
	var nodes = [];
	for (var i = 0; i < cells.length; i++) {
		var cell = cells[i];
		if (cell.type === 'link') continue;

		var node = {
			type: cell.type.slice('dialogue.'.length),
			id: cell.id,
		};

		var handler = gameDataHandler[cell.type];
		if (handler)
		{
			handler(cell, node);
		}
		else
		{
			node.text = cell.text ? cell.text : undefined;
			node.actor = cell.actor ? cell.actor : undefined;
		}

		nodes.push(node);
		nodesByID[cell.id] = node;
		cellsByID[cell.id] = cell;
	}
	for (var i = 0; i < cells.length; i++) {
		var cell = cells[i];
		if (cell.type == 'link') {
			var source = nodesByID[cell.source.id];
			var target = cell.target ? nodesByID[cell.target.id] : null;
			if (source) {
				var handler = linkDataHandler[source.type];
				var handled = handler ? handler(cell, source, target, { nodesByID, cellsByID }) : false;

				if (!handled) source.next = target ? target.id : null;
			}
		}
	}
	return nodes;
}


var filename = null;
var defaultFilename = 'dialogue.json';

function setFilename(name) {
	filename = name;
	document.title = `Dialogger${name ? ': ' : ''}${name}`;
}

function flash(text) {
	var $flash = $('#flash');
	$flash.text(text);
	$flash.stop(true, true);
	$flash.show();
	$flash.css('opacity', 1.0);
	$flash.fadeOut({ duration: 1500 });
}

function offerDownload(name, data) {
	var a = $('<a>');
	a.attr('download', name);
	a.attr('href', 'data:application/json,' + encodeURIComponent(JSON.stringify(data, undefined, 1)));
	a.attr('target', '_blank');
	a.hide();
	$('body').append(a);
	a[0].click();
	a.remove();
}

function promptFilename(callback) {
	if (fs) {
		setFilename(null);
		window.frame.openDialog(
			{
				type: 'save',
			}, function (err, files) {
				if (!err && files.length == 1) {
					setFilename(files[0]);
					callback(filename);
				}
			});
	}
	else {
		setFilename(prompt('Enter filename to save:', defaultFilename));
		callback(filename);
	}
}

function applyTextFields() {
	$('input[type=text]').blur();
}

var autosaveid;
var flashsetids = [];
var flashids = [];
function autosave() {
	if (!filename)
		promptFilename(doSave);

	if (!filename) {
		alert('You must have a save target in order to autosave');
		return;
	}
	if (autosaveid === undefined) {
		flash('autosave in 60s');
		autosaveid = window.setInterval(save, 60000);

		function warnAuto(pre) {
			var startId = window.setTimeout(() => {
				flashsetids = flashsetids.filter((v) => v !== startId);
				var msg = `autosave in ${pre}s`;
				flash(msg);
				var repeatId = window.setInterval(function () { flash(msg) }, 60000);
				flashids.push(repeatId);
			}, 60000 - (1000 * pre));
			flashsetids.push(startId);
		}
		[1, 2, 3, 4, 5, 10, 20, 30, 40, 50].forEach(warnAuto);
	} else {
		window.clearInterval(autosaveid);
		flashsetids.forEach(window.clearInterval);
		flashids.forEach(window.clearInterval);
		autosaveid = undefined;
		flash('disabled autosave');
	}
}

function save() {
	applyTextFields();
	if (!filename)
		promptFilename(doSave);
	else
		doSave();
}

function doSave() {
	if (filename) {
		if (fs) {
			fs.writeFileSync(filename, JSON.stringify(graph), 'utf8');
			fs.writeFileSync(gameFilenameFromNormalFilename(filename), JSON.stringify(gameData()), 'utf8');
		}
		else {
			if (!localStorage[filename])
				addFileEntry(filename);

			const graphObj = graph.toJSON();
			const editorOpts = {
				doAutoSave: !!autosaveid,
				currentCategory
			};
			localStorage[filename] = JSON.stringify({ graphObj, editorOpts });
		}
		flash('Saved ' + filename);
	}
}

function load() {
	if (fs) {
		window.frame.openDialog(
			{
				type: 'open',
				multiSelect: false,
			}, function (err, files) {
				if (!err && files.length == 1) {
					graph.clear();
					setFilename(files[0]);
					const filedata = fs.readFileSync(filename, 'utf8');
					parseFile(filedata);
				}
			});
	}

	else {

		$('#menu').show();
	}
}

function exportFile() {
	if (!fs) {
		applyTextFields();
		offerDownload(filename ? filename : defaultFilename, graph);
	}
}

function gameFilenameFromNormalFilename(f) {
	return f.substring(0, f.length - 2) + 'on';
}

function exportGameFile() {
	if (!fs) {
		applyTextFields();
		offerDownload(gameFilenameFromNormalFilename(filename ? filename : defaultFilename), gameData());
	}
}

function importFile() {
	if (!fs)
		$('#file').click();
}

function add(constructor) {
	return function () {
		var position = $('#cmroot').position();
		var container = $('#container')[0];
		var element = new constructor(
			{
				position: { x: position.left + container.scrollLeft, y: position.top + container.scrollTop },
			});
		graph.addCells([element]);
	};
}

function clear() {
	graph.clear();
	setFilename(null);
}

var paper = new joint.dia.Paper(
	{
		el: $('#paper'),
		width: 16000,
		height: 8000,
		model: graph,
		gridSize: 16,
		defaultLink: defaultLink,
		validateConnection: validateConnection,
		validateMagnet: validateMagnet,
		defaultRouter: {
			name: 'manhattan',
			args: {
				step: 1
			},
		},
	});

var panning = false;
var mousePosition = { x: 0, y: 0 };
paper.on('blank:pointerdown', function (e, x, y) {
	panning = true;
	mousePosition.x = e.pageX;
	mousePosition.y = e.pageY;
	$('body').css('cursor', 'move');
	applyTextFields();
});
paper.on('cell:pointerdown', function (e, x, y) {
	applyTextFields();
});

$('#container').mousemove(function (e) {
	if (panning) {
		var $this = $(this);
		$this.scrollLeft($this.scrollLeft() + mousePosition.x - e.pageX);
		$this.scrollTop($this.scrollTop() + mousePosition.y - e.pageY);
		mousePosition.x = e.pageX;
		mousePosition.y = e.pageY;
	}
});

$('#container').mouseup(function (e) {
	panning = false;
	$('body').css('cursor', 'default');
});

function parseFile(filedata) {
	graph.clear();

	const loadObj = JSON.parse(filedata);
	if (loadObj.hasOwnProperty('graphObj')) {
		graph.fromJSON(loadObj.graphObj);
		if (loadObj.editorOpts.doAutoSave) {
			autosave();
		}
		ChangeCategory(loadObj.editorOpts.currentCategory);
	}
	else {
		graph.fromJSON(loadObj);
	}
}

function handleFiles(files) {
	setFilename(files[0].name);
	var fileReader = new FileReader();
	fileReader.onload = function (e) {
		parseFile(e.target.result);
	};
	fileReader.readAsText(files[0]);
}

$('#file').on('change', function () {
	handleFiles(this.files);
});

$('body').on('dragenter', function (e) {
	e.stopPropagation();
	e.preventDefault();
});

$('body').on('dragexit', function (e) {
	e.stopPropagation();
	e.preventDefault();
});

$('body').on('dragover', function (e) {
	e.stopPropagation();
	e.preventDefault();
});

$('body').on('drop', function (e) {
	e.stopPropagation();
	e.preventDefault();
	handleFiles(e.originalEvent.dataTransfer.files);
});

$(window).on('keydown', function (event) {
	// Catch Ctrl-S or key code 19 on Mac (Cmd-S)
	if (((event.ctrlKey || event.metaKey) && String.fromCharCode(event.which).toLowerCase() == 's') || event.which == 19) {
		event.stopPropagation();
		event.preventDefault();
		save();
		return false;
	}
	else if ((event.ctrlKey || event.metaKey) && String.fromCharCode(event.which).toLowerCase() == 'o') {
		event.stopPropagation();
		event.preventDefault();
		load();
		return false;
	}
	else if ((event.ctrlKey || event.metaKey) && String.fromCharCode(event.which).toLowerCase() == 'e') {
		event.stopPropagation();
		event.preventDefault();
		exportFile();
		return false;
	}
	return true;
});



$(window).resize(function () {
	applyTextFields();
	var $window = $(window);
	var $container = $('#container');
	$container.height($window.innerHeight());
	$container.width($window.innerWidth());
	var $menu = $('#menu');
	$menu.css('top', Math.max(0, (($window.height() - $menu.outerHeight()) / 2)) + 'px');
	$menu.css('left', Math.max(0, (($window.width() - $menu.outerWidth()) / 2)) + 'px');
	return this;
});

function addFileEntry(name) {
	if (!name.endsWith('.json')) return;

	var entry = $('<div>');
	entry.text(name);
	var deleteButton = $('<button class="delete">-</button>');
	entry.append(deleteButton);
	$('#menu').append(entry);

	deleteButton.on('click', function (event) {
		localStorage.removeItem(name);
		entry.remove();
		event.stopPropagation();
	});

	entry.on('click', function (event) {
		setFilename(name);
		parseFile(localStorage[name]);
		$('#menu').hide();
	});
}

(function () {
	for (var i = 0; i < localStorage.length; i++)
		addFileEntry(localStorage.key(i));
})();

$('#menu button.close').click(function () {
	$('#menu').hide();
	panning = false;
});

$(window).trigger('resize');

var nodeCreateLists = {};
var currentCategory = 'Dialog';

function AddNodeType(text, obj, category) {
	if (category === undefined) category = 'Default';

	var aliasIdx = (category === 'Default') ? 0 : 1;

	var nodeCreateList = nodeCreateLists[category];
	if (nodeCreateList === undefined) nodeCreateList = nodeCreateLists[category] = [];

	var newObj = {
		text,
		alias: `${aliasIdx}-${nodeCreateList.length + 1}`,
		action: add(obj),
	}

	// sorted insertion would be 'better', but these lists will be very small, so keep it simple.
	nodeCreateList.push(newObj)
	nodeCreateList.sort((a, b) => a.text.localeCompare(b.text));
	CreateContextMenu();
}

function AddNodeScript(url) {
	var script = document.createElement("script");
	script.src = url;
	document.head.appendChild(script);
}

function ChangeCategory(newCategory) {
	if (!newCategory) newCategory = 'Dialog';
	if (!Object.keys(nodeCreateLists).includes(newCategory)) newCategory = 'Dialog';

	currentCategory = newCategory;
	CreateContextMenu();
}

function CreateContextMenu() {
	// clone the lists, becuase building the menu modifies the arrays
	var defaultNodeList = nodeCreateLists.Default;
	var nodeCreateList = nodeCreateLists[currentCategory];

	var items = [];

	if (defaultNodeList) items.push({ type: 'group', text: `Nodes`, alias: '0-0', items: defaultNodeList.slice() });
	if (nodeCreateList) items.push({ type: 'group', text: `${currentCategory} Nodes`, alias: '1-0', items: nodeCreateList.slice() });

	items = items.concat([
		{ type: 'splitLine' },
		{
			type: 'group', text: 'File', alias: '2-0', items: [
				{ text: 'AutoSave', alias: '2-1', action: autosave },
				{ text: 'Save', alias: '2-2', action: save },
				{ text: 'Load', alias: '2-3', action: load },
				{ text: 'Import', id: 'import', alias: '2-4', action: importFile },
				{ text: 'New', alias: '2-5', action: clear },
				{ text: 'Export', id: 'export', alias: '2-6', action: exportFile },
				{ text: 'Export game file', id: 'export-game', alias: '2-7', action: exportGameFile },
			]
		},
	]);

	const categories = Object.keys(nodeCreateLists).filter(category => category !== 'Default');
	if (categories.length > 1) {
		items.push({
			type: 'group',
			text: 'Style',
			alias: '3-0',
			items: categories.map((category, idx) => ({
				text: category,
				alias: `3-${idx + 1}`,
				action: () => ChangeCategory(category),
			})),
		});
	}

	$('#paper').contextmenu({ width: 150, items });
}

// Import support node files
//#region
AddNodeScript('nodes/start.js');
AddNodeScript('nodes/call.js');
AddNodeScript('nodes/set.js');
AddNodeScript('nodes/branch.js');
AddNodeScript('nodes/text.js');
AddNodeScript('nodes/node.js');
AddNodeScript('nodes/choice.js');
AddNodeScript('nodes/select.js');
AddNodeScript('nodes/search.js');
AddNodeScript('nodes/result.js');
AddNodeScript('nodes/sequence.js');
AddNodeScript('nodes/exit.js');
AddNodeScript('nodes/fail.js');
AddNodeScript('nodes/subGraph.js');
AddNodeScript('nodes/random.js');
//#endregion

///AUTOLOAD IF URL HAS ? WILDCARD
if (loadOnStart != null) {
	loadOnStart += '.json';
	console.log(loadOnStart);
	graph.clear();
	setFilename(loadOnStart);
	parseFile(localStorage[loadOnStart]);
}