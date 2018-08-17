joint.shapes.dialogue.BountySpec = joint.shapes.devs.Model.extend({
    defaults: joint.util.deepSupplement(
        {
            type: 'dialogue.BountySpec',
            size: { width: 200, height: 120, },
            inPorts: ['input'],
            outPorts: ['opts'],
            attrs:
            {
            },
        },
        joint.shapes.dialogue.Base.prototype.defaults
    )
});

joint.shapes.dialogue.BountySpecView = joint.shapes.dialogue.BaseView.extend({
    template:
        `
        <div class="node BountySpec">
            <span class="label"></span>
            <button class="delete">x</button>
        </div>
        `,
});

gameDataHandler['dialogue.BountySpec'] = function (cell, node) {
    node.next = null;
}

linkDataHandler['BountySpec'] = function (cell, source, target) {
    if (!target) return false;
    if (target.type !== 'BountySpec') return false;

    delete source.next;


    return true;
}


allTypes['dialogue.BountySpec'] = true;
allContractTypes['dialogue.BountySpec'] = true;
allowableConnections['dialogue.BountySpec'] = { ['dialog.BountyOpt']: true };

AddNodeType('BountySpec', joint.shapes.dialogue.BountySpec, 'Contracts');
