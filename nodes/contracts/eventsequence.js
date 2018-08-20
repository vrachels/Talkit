joint.shapes.dialogue.EventSeq = joint.shapes.devs.Model.extend({
    defaults: joint.util.deepSupplement(
        {
            type: 'dialogue.EventSeq',
            size: { width: 200, height: 50 },
            inPorts: ['input'],
            outPorts: ['next', 'events'],
            attrs:
            {
                '.outPorts>.port0>circle': { allowedConnections: ['dialogue.EventSeq'] },
                '.outPorts>.port1>circle': { unlimitedConnections: ['dialogue.EventSpec'], allowedConnections: ['dialogue.EventSpec'] },
            },
        },
        joint.shapes.dialogue.Base.prototype.defaults
    )
});

joint.shapes.dialogue.EventSeqView = joint.shapes.dialogue.BaseView.extend({
    template:
        `
        <div class="node EventSeq">
            <span class="label"></span>
            <button class="delete">x</button>
        </div>
        `,
});

linkDataHandler['EventSeq'] = function (cell, source, target) {
    if (!target) return false;

    switch(target.type)
    {
        case 'EventSeq':
        {
            source.next = target.id;
            break;
        }
        case 'EventSpec':
        {
            if(!source.events) source.events = [];
            source.events.push(target.id);
            break;
        }

        default: return false;
    }

    return true;
}

allTypes['dialogue.EventSeq'] = true;
allContractTypes['dialogue.EventSeq'] = true;

AddNodeType('EventSeq', joint.shapes.dialogue.EventSeq, 'Contracts');