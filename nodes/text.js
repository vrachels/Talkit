joint.shapes.dialogue.Text = joint.shapes.devs.Model.extend(
    {
        defaults: joint.util.deepSupplement(
            {
                type: 'dialogue.Text',
                inPorts: ['input'],
                outPorts: ['output'],
                actor: '',
                textarea: 'Start writing',
            },
            joint.shapes.dialogue.Base.prototype.defaults
        ),
    });
joint.shapes.dialogue.TextView = joint.shapes.dialogue.BaseView;

allTypes['dialogue.Text'] = true;
allTypesExceptChoice['dialogue.Text'] = true;
allowableConnections['dialogue.Text'] = allTypesExceptChoice;

AddNodeType('Text', joint.shapes.dialogue.Text);
NodeScriptDone();