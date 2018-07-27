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
                '<input type="text" class="name" placeholder="Variable" />',
                '<input type="text" class="value" placeholder="Value" />',
                '</div>',
            ].join(''),

        initialize: function () {
            joint.shapes.dialogue.BaseView.prototype.initialize.apply(this, arguments);
            this.$box.find('input.value').on('change', _.bind(function (evt) {
                this.model.set('value', $(evt.target).val());
            }, this));
        },

        updateBox: function () {
            joint.shapes.dialogue.BaseView.prototype.updateBox.apply(this, arguments);
            var field = this.$box.find('input.value');
            if (!field.is(':focus'))
                field.val(this.model.get('value'));
        },
    });


gameDataHandler['dialogue.Set'] = function (cell, node) {
    node.variable = cell.name;
    node.value = cell.value;
    node.next = null;
}

allTypes['dialogue.Set'] = true;
allTypesExceptChoice['dialogue.Set'] = true;
allowableConnections['dialogue.Set'] = allTypesExceptChoice;

AddNodeType('Set', joint.shapes.dialogue.Set);
NodeScriptDone();