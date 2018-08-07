joint.shapes.dialogue.SubGraph = joint.shapes.devs.Model.extend(
    {
        defaults: joint.util.deepSupplement
            (
            {
                type: 'dialogue.SubGraph',
                inPorts: ['input'],
                outPorts: ['output'],
                size: { width: 200, height: 60, },
                value: '',
            },
            joint.shapes.dialogue.Base.prototype.defaults
            ),
    });

joint.shapes.dialogue.SubGraphView = joint.shapes.dialogue.BaseView.extend(
    {
        template:
            [
                '<div class="node">',
                '<span class="label"></span>',
                '<button class="delete">x</button>',
                '<input type="text" class="text" placeholder="Graph Name" />',
                '</div>',
            ].join(''),

        initialize: function () {
            joint.shapes.dialogue.BaseView.prototype.initialize.apply(this, arguments);

            this.$box.find('input.text').on('change', _.bind(function (evt) {
                this.model.set('graphName', $(evt.target).val());
            }, this));
        },

        updateBox: function () {
            joint.shapes.dialogue.BaseView.prototype.updateBox.apply(this, arguments);

            var varField = this.$box.find('input.text');
            if (!varField.is(':focus'))
                varField.val(this.model.get('graphName'));
        },
    });


gameDataHandler['dialogue.SubGraph'] = function (cell, node) {
    node.graphName = cell.graphName;
    node.next = null;
}

allTypes['dialogue.SubGraph'] = true;
allTypesExceptChoice['dialogue.SubGraph'] = true;
allowableConnections['dialogue.SubGraph'] = allTypesExceptChoice;

AddNodeType('SubGraph', joint.shapes.dialogue.SubGraph, 'Behavior');
AddNodeType('SubGraph', joint.shapes.dialogue.SubGraph, 'Interaction');