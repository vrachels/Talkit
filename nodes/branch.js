joint.shapes.dialogue.Branch = joint.shapes.devs.Model.extend(
	{
		defaults: joint.util.deepSupplement
			(
			{
				type: 'dialogue.Branch',
				size: { width: 200, height: 76, },
				inPorts: ['input'],
				outPorts: ['output0'],
				values: [],
			},
			joint.shapes.dialogue.Base.prototype.defaults
			),
	});
joint.shapes.dialogue.BranchView = joint.shapes.dialogue.BaseView.extend(
	{
		template:
			[
				'<div class="node">',
				'<span class="label"></span>',
				'<button class="delete">x</button>',
				'<button class="add">+</button>',
				'<button class="remove">-</button>',
				'<input type="text" class="text" placeholder="Variable" />',
				'<input type="text" value="Default" readonly/>',
				'</div>',
			].join(''),

		initialize: function () {
			joint.shapes.dialogue.BaseView.prototype.initialize.apply(this, arguments);

			this.$box.find('input.text').on('change', _.bind(function (evt) {
				this.model.set('text', $(evt.target).val());
			}, this));

			this.$box.find('.add').on('click', _.bind(this.addPort, this));
			this.$box.find('.remove').on('click', _.bind(this.removePort, this));

			// fixups
			this.model.set('text', this.model.get('text') || this.model.get('name'));
		},

		removePort: function () {
			if (this.model.get('outPorts').length > 1) {
				var outPorts = this.model.get('outPorts').slice(0);
				outPorts.pop();
				this.model.set('outPorts', outPorts);
				var values = this.model.get('values').slice(0);
				values.pop();
				this.model.set('values', values);
				this.updateSize();
			}
		},

		addPort: function () {
			var outPorts = this.model.get('outPorts').slice(0);
			outPorts.push('output' + outPorts.length.toString());
			this.model.set('outPorts', outPorts);
			var values = this.model.get('values').slice(0);
			values.push(null);
			this.model.set('values', values);
			this.updateSize();
		},

		updateBox: function () {
			joint.shapes.dialogue.BaseView.prototype.updateBox.apply(this, arguments);

			var actorField = this.$box.find('input.text');
			if (!actorField.is(':focus'))
				actorField.val(this.model.get('text') || this.model.get('name'));

			var values = this.model.get('values');
			var valueFields = this.$box.find('input.value');

			// Add value fields if necessary
			for (var i = valueFields.length; i < values.length; i++) {
				// Prevent paper from handling pointerdown.
				var field = $('<input type="text" class="value" />');
				field.attr('placeholder', 'Value ' + (i + 1).toString());
				field.attr('index', i);
				this.$box.append(field);
				field.on('mousedown click', function (evt) { evt.stopPropagation(); });

				// This is an example of reacting on the input change and storing the input data in the cell model.
				field.on('change', _.bind(function (evt) {
					var values = this.model.get('values').slice(0);
					values[$(evt.target).attr('index')] = $(evt.target).val();
					this.model.set('values', values);
				}, this));
			}

			// Remove value fields if necessary
			for (var i = values.length; i < valueFields.length; i++)
				$(valueFields[i]).remove();

			// Update value fields
			valueFields = this.$box.find('input.value');
			for (var i = 0; i < valueFields.length; i++) {
				var field = $(valueFields[i]);
				if (!field.is(':focus'))
					field.val(values[i]);
			}
		},

		updateSize: function () {
			var width = this.model.get('size').width;
			var height = 76 + Math.max(0, (this.model.get('outPorts').length - 1) * 25);
			this.model.set('size', { width, height });
			this.resize(width, height);
		}
	});

gameDataHandler['dialogue.Branch'] = function (cell, node) {
	node.variable = cell.name;
	node.branches = {};
	for (var j = 0; j < cell.values.length; j++) {
		var branch = cell.values[j];
		node.branches[branch] = null;
	}
}

linkDataHandler['Branch'] = function (cell, source, target, scope) {
	var portNumber = parseInt(cell.source.port.slice('output'.length));
	var value;
	if (portNumber == 0)
		value = '_default';
	else {
		var sourceCell = scope.cellsByID[source.id];
		value = sourceCell.values[portNumber - 1];
	}
	source.branches[value] = target ? target.id : null;

	return true;
}

allTypes['dialogue.Branch'] = true;
allTypesExceptChoice['dialogue.Branch'] = true;
allowableConnections['dialogue.Branch'] = allTypesExceptChoice;

AddNodeType('Branch', joint.shapes.dialogue.Branch);
NodeScriptDone();