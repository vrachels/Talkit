joint.shapes.dialogue.Set = joint.shapes.devs.Model.extend(
    {
        defaults: joint.util.deepSupplement
            (
            {
                type: 'dialogue.Set',
                inPorts: ['input'],
                outPorts: ['output'],
                size: { width: 200, height: 100, },
                value: '',
            },
            joint.shapes.dialogue.Base.prototype.defaults
            ),
    });

joint.shapes.dialogue.SetView = joint.shapes.dialogue.BaseView.extend(
    {
        template:
            [
                '<div class="node">',
                '<span class="label"></span>',
                '<button class="delete">x</button>',
                '<input type="text" class="text" placeholder="Variable" />',
                '<input type="text" class="value" placeholder="Value" />',
                '</div>',
            ].join(''),

        initialize: function () {
            joint.shapes.dialogue.BaseView.prototype.initialize.apply(this, arguments);

            this.$box.find('input.text').on('change', _.bind(function (evt) {
                this.model.set('variable', $(evt.target).val());
            }, this));

            this.$box.find('input.value').on('change', _.bind(function (evt) {
                this.model.set('value', $(evt.target).val());
            }, this));

            // fixups
            this.model.set('variable', this.model.get('variable') || this.model.get('text') || this.model.get('name'));
        },

        updateBox: function () {
            joint.shapes.dialogue.BaseView.prototype.updateBox.apply(this, arguments);

            var varField = this.$box.find('input.text');
            if (!varField.is(':focus'))
                varField.val(this.model.get('variable') || this.model.get('text') || this.model.get('name'));

            var valField = this.$box.find('input.value');
            if (!valField.is(':focus'))
                valField.val(this.model.get('value'));
        },
    });


gameDataHandler['dialogue.Set'] = function (cell, node) {
    node.variable = cell.variable;
    node.value = cell.value;
    node.next = null;
}

allTypes['dialogue.Set'] = true;
allTypesExceptChoice['dialogue.Set'] = true;
allowableConnections['dialogue.Set'] = allTypesExceptChoice;

AddNodeType('Set', joint.shapes.dialogue.Set);