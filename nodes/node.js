joint.shapes.dialogue.Node = joint.shapes.devs.Model.extend(
	{
		defaults: joint.util.deepSupplement
			(
			{
				type: 'dialogue.Node',
				inPorts: ['input'],
				outPorts: ['output'],
				attrs:
				{
					'.outPorts circle': { unlimitedConnections: ['dialogue.Choice'], }
				},
			},
			joint.shapes.dialogue.Base.prototype.defaults
			),
	});
joint.shapes.dialogue.NodeView = joint.shapes.dialogue.BaseView;

allTypes['dialogue.Node'] = true;
allTypesExceptChoice['dialogue.Node'] = true;
allowableConnections['dialogue.Node'] = allTypes;

AddNodeType('Node', joint.shapes.dialogue.Node);
NodeScriptDone();