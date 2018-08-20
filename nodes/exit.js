joint.shapes.dialogue.Exit = joint.shapes.devs.Model.extend(
    {
        defaults: joint.util.deepSupplement
            (
            {
                type: 'dialogue.Exit',
                size: { width: 100, height: 60, },
                inPorts: ['input'],
                values: [],
            },
            joint.shapes.dialogue.Base.prototype.defaults
            ),
    });
joint.shapes.dialogue.ExitView = joint.shapes.dialogue.BaseView.extend(
    {
        template:
            `<div class="node">
                <span class="label"></span>
                <button class="delete">x</button>
                <p>
                    <input type="checkbox" id="Success" />
                    <label>Success</label>
                </p>
            </div>
            `,

        initialize: function () {
            joint.shapes.dialogue.BaseView.prototype.initialize.apply(this, arguments);

            this.$box.find('input.checkbox').on('mousedown click', function (evt) { evt.stopPropagation(); });

            this.$box.find('#Success').on('change', _.bind(function (evt) {
                this.model.set('success', $(evt.target).prop("checked"));
            }, this));
        },

        updateBox: function () {
            joint.shapes.dialogue.BaseView.prototype.updateBox.apply(this, arguments);

            this.$box.find('#Success').prop("checked", this.model.get('success'));
        },
    });

gameDataHandler['dialogue.Exit'] = function (cell, node) {
    node.success = cell.success;
}

allTypes['dialogue.Exit'] = true;
allTypesExceptChoice['dialogue.Exit'] = true;
allowableConnections['dialogue.Exit'] = allTypesExceptChoice;

AddNodeType('Exit', joint.shapes.dialogue.Exit, 'Behavior');
AddNodeType('Exit', joint.shapes.dialogue.Exit, 'Interaction');