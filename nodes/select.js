joint.shapes.dialogue.Select = joint.shapes.devs.Model.extend({
    defaults: joint.util.deepSupplement(
        {
            type: 'dialogue.Select',
            size: { width: 200, height: 32, },
            inPorts: ['input'],
            outPorts: ['Rest'],
            attrs:
            {
                '.outPorts circle': { unlimitedConnections: ['dialogue.Choice', 'dialogue.Search'], }
            },
        },
        joint.shapes.dialogue.Base.prototype.defaults
    )
});

joint.shapes.dialogue.SelectView = joint.shapes.dialogue.BaseView.extend(
    {
        template:
            [
                '<div class="node">',
                '<span class="label"></span>',
                '<button class="delete">x</button>',
                '</div>',
            ].join(''),
    });


linkDataHandler['Select'] = function (cell, source, target) {
    if (!target) return false;
    switch(target.type)
    {
        case 'Choice': break;
        case 'Search': break;
        default: return false;
    }

	if (!source.choices) {
		source.choices = [];
		delete source.next;
	}

    source.choices.push(target.id);
    return true;
}

allTypes['dialogue.Select'] = true;
allTypesExceptChoice['dialogue.Select'] = true;
allowableConnections['dialogue.Select'] = allChoiceTypes;

AddNodeType('Select', joint.shapes.dialogue.Select);
NodeScriptDone();