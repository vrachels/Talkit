joint.shapes.dialogue.Start = joint.shapes.devs.Model.extend(
    {
        defaults: joint.util.deepSupplement
            (
            {
                type: 'dialogue.Start',
                size: { width: 100, height: 30, },
                outPorts: ['output'],
                values: [],
            },
            joint.shapes.dialogue.Base.prototype.defaults
            ),
    });
joint.shapes.dialogue.StartView = joint.shapes.dialogue.BaseView.extend(
    {
        template:
            [
                '<div class="node">',
                '<span class="label"></span>',
                '<button class="delete">x</button>',
                '',
                '</div>',
            ].join(''),
    });

allowableConnections['dialogue.Start'] = allTypesExceptChoice;

AddNodeType('Start', joint.shapes.dialogue.Start);