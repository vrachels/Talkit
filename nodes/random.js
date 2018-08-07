// Todo: derive from Select
joint.shapes.dialogue.Random = joint.shapes.devs.Model.extend({
    defaults: joint.util.deepSupplement(
        {
            type: 'dialogue.Random',
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

joint.shapes.dialogue.RandomView = joint.shapes.dialogue.BaseView.extend(
    {
        template:
            [
                '<div class="node">',
                '<span class="label"></span>',
                '<button class="delete">x</button>',
                '</div>',
            ].join(''),
    });


linkDataHandler['Random'] = function (cell, source, target) {
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

allTypes['dialogue.Random'] = true;
allTypesExceptChoice['dialogue.Random'] = true;
allowableConnections['dialogue.Random'] = allChoiceTypes;

AddNodeType('Random', joint.shapes.dialogue.Random);