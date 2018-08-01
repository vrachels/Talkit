joint.shapes.dialogue.Sequence = joint.shapes.devs.Model.extend(
	{
		defaults: joint.util.deepSupplement
			(
			{
				type: 'dialogue.Sequence',
				size: { width: 200, height: 90, },
				inPorts: ['input'],
				outPorts: ['output0', 'output1'],
			},
			joint.shapes.dialogue.Base.prototype.defaults
			),
	});
joint.shapes.dialogue.SequenceView = joint.shapes.dialogue.BaseView.extend(
	{
		template:
			`<div class="node">
				<span class="label"></span>
				<button class="delete">x</button>
				<button class="add">+</button>
				<button class="remove">-</button>
                <p>
					<input type="checkbox" id="StopOnFirstSuccess" />
					<label>Stop On First Success</label>
                </p>
                <p>
					<input type="checkbox" id="IgnoreResult" />
					<label>Ignore Result</label>
                </p>
			</div>
			`,

		initialize: function () {
			joint.shapes.dialogue.BaseView.prototype.initialize.apply(this, arguments);

			this.$box.find('input.checkbox').on('mousedown click', function (evt) { evt.stopPropagation(); });

			this.$box.find('#StopOnFirstSuccess').on('change', _.bind(function (evt) {
				this.model.set('StopOnFirstSuccess', $(evt.target).prop("checked"));
			}, this));

			this.$box.find('#IgnoreResult').on('change', _.bind(function (evt) {
				this.model.set('IgnoreResult', $(evt.target).prop("checked"));
			}, this));

			this.$box.find('.add').on('click', _.bind(this.addPort, this));
			this.$box.find('.remove').on('click', _.bind(this.removePort, this));
		},

		removePort: function () {
			if (this.model.get('outPorts').length > 1) {
				var outPorts = this.model.get('outPorts').slice(0);
				outPorts.pop();
				this.model.set('outPorts', outPorts);
				this.updateSize();
			}
		},

		addPort: function () {
			var outPorts = this.model.get('outPorts').slice(0);
			outPorts.push('output' + outPorts.length.toString());
			this.model.set('outPorts', outPorts);
			this.updateSize();
		},

		updateBox: function () {
			joint.shapes.dialogue.BaseView.prototype.updateBox.apply(this, arguments);

			this.$box.find('#StopOnFirstSuccess').prop("checked", this.model.get('StopOnFirstSuccess'));
			this.$box.find('#IgnoreResult').prop("checked", this.model.get('IgnoreResult'));
		},

		updateSize: function () {
			var width = this.model.get('size').width;
			var height = Math.max(90, (this.model.get('outPorts').length - 1) * 35);
			this.model.set('size', { width, height });
			this.resize(width, height);
		}
	});

gameDataHandler['dialogue.Sequence'] = function (cell, node) {
	node.StopOnFirstSuccess = cell.StopOnFirstSuccess;
	node.IgnoreResult = cell.IgnoreResult;
	node.Actions = new Array(cell.outPorts.length);
}

linkDataHandler['Sequence'] = function (cell, source, target, scope) {
	var portNumber = parseInt(cell.source.port.slice('output'.length));
	source.Actions[portNumber] = target ? target.id : null;
	return true;
}

allTypes['dialogue.Sequence'] = true;
allTypesExceptChoice['dialogue.Sequence'] = true;
allowableConnections['dialogue.Sequence'] = Object.assign({}, allTypesExceptChoice, { 'dialogue.Search': true });

AddNodeType('Sequence', joint.shapes.dialogue.Sequence, 'Behavior');
AddNodeType('Sequence', joint.shapes.dialogue.Sequence, 'Interaction');