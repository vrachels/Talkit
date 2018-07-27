joint.shapes.dialogue.Select = joint.shapes.devs.Model.extend({
    defaults: joint.util.deepSupplement(
        {
            type: 'dialogue.Select',
            size: { width: 200, height: 76, },
            inPorts: ['input'],
            outPorts: ['WithOpts', 'NoOpts', 'Rest'],
            attrs:
            {
                '.outPorts>.port2>circle': { 
                    //? body: { fill: 'Tomato', },
                    unlimitedConnections: ['dialogue.Choice'],
                }
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
				'<input type="text" value="WithOpts" readonly/>',
				'<input type="text" value="NoOpts" readonly/>',
				'</div>',
			].join(''),
	});

gameDataHandler['dialogue.Branch'] = function (cell, node) {
    node.variable = cell.name;
    node.branches = {};
    for (var j = 0; j < cell.values.length; j++) {
        var branch = cell.values[j];
        node.branches[branch] = null;
    }
}

allTypes['dialogue.Select'] = true;
allTypesExceptChoice['dialogue.Select'] = true;
allowableConnections['dialogue.Select'] = allChoiceTypes;

AddNodeType('Select', joint.shapes.dialogue.Select);
NodeScriptDone();