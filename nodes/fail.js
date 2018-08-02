joint.shapes.dialogue.Fail = joint.shapes.devs.Model.extend(
    {
        defaults: joint.util.deepSupplement
            (
            {
                type: 'dialogue.Fail',
                size: { width: 150, height: 60, },
                inPorts: ['input'],
                values: [],
            },
            joint.shapes.dialogue.Base.prototype.defaults
            ),
    });
joint.shapes.dialogue.FailView = joint.shapes.dialogue.BaseView.extend(
    {
        template:
            [
                '<div class="node">',
                '<span class="label"></span>',
                '<button class="delete">x</button>',
                '<input type="text" class="text" placeholder="Message" />',
                '</div>',
            ].join(''),

        initialize: function () {
            joint.shapes.dialogue.BaseView.prototype.initialize.apply(this, arguments);

            this.$box.find('input').on('change', _.bind(function (evt) {
                this.model.set('text', $(evt.target).val());
            }, this));
        },

        updateBox: function () {
            joint.shapes.dialogue.BaseView.prototype.updateBox.apply(this, arguments);

            // Update the HTML with a data stored in the cell model.
            var msgField = this.$box.find('input');
            if (!msgField.is(':focus'))
                msgField.val(this.model.get('text'));
        }
    });

allTypes['dialogue.Fail'] = true;
allTypesExceptChoice['dialogue.Fail'] = true;
allowableConnections['dialogue.Fail'] = allTypesExceptChoice;

AddNodeType('Fail', joint.shapes.dialogue.Fail, 'Behavior');
AddNodeType('Fail', joint.shapes.dialogue.Fail, 'Interaction');