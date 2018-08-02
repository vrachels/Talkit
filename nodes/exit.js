joint.shapes.dialogue.Exit = joint.shapes.devs.Model.extend(
    {
        defaults: joint.util.deepSupplement
            (
            {
                type: 'dialogue.Exit',
                size: { width: 100, height: 30, },
                inPorts: ['input'],
                values: [],
            },
            joint.shapes.dialogue.Base.prototype.defaults
            ),
    });
joint.shapes.dialogue.ExitView = joint.shapes.dialogue.BaseView.extend(
    {
        template:
            [
                '<div class="node">',
                '<span class="label"></span>',
                '<button class="delete">x</button>',
                '</div>',
            ].join(''),
    });

allTypes['dialogue.Exit'] = true;
allTypesExceptChoice['dialogue.Exit'] = true;
allowableConnections['dialogue.Exit'] = allTypesExceptChoice;

AddNodeType('Exit', joint.shapes.dialogue.Exit, 'Behavior');
AddNodeType('Exit', joint.shapes.dialogue.Exit, 'Interaction');