joint.shapes.dialogue.Contract = joint.shapes.devs.Model.extend({
    defaults: joint.util.deepSupplement(
        {
            type: 'dialogue.Contract',
            size: { width: 200, height: 140, },
            inPorts: ['input'],
            outPorts: ['parties', 'simple', 'seq'],
            attrs:
            {
                '.outPorts>.port0>circle': { unlimitedConnections: ['dialogue.Party'], allowedConnections: ['dialogue.Party'] },
                '.outPorts>.port1>circle': { unlimitedConnections: ['dialogue.EventSpec'], allowedConnections: ['dialogue.EventSpec'] },
                '.outPorts>.port2>circle': { unlimitedConnections: ['dialogue.EventSeq'], allowedConnections: ['dialogue.EventSeq'] },
            },
        },
        joint.shapes.dialogue.Base.prototype.defaults
    )
});

joint.shapes.dialogue.ContractView = joint.shapes.dialogue.BaseView.extend({
    template:
        `
        <div class="node Contract">
            <span class="label"></span>
            <button class="delete">x</button>
            <input type="text" class="name" placeholder="Contract Name" />
        </div>
        `,

    initialize: function () {
        joint.shapes.dialogue.BaseView.prototype.initialize.apply(this, arguments);
        this.$box.find('input.name').on('change', _.bind(function (e) {
            this.model.set('name', $(e.target).val());
        }, this));
    },

    removeParameter: function () {
        if (this.model.get('parties').length > 0) {
            var parties = this.model.get('parties').slice(0);
            parties.pop();
            this.model.set('parties', parties);
            this.updateSize();
        }
    },

    addParameter: function () {
        var parties = this.model.get('parties').slice(0);
        parties.push(null);
        this.model.set('parties', parties);
        this.updateSize();
    },

    updateBox: function () {
        joint.shapes.dialogue.BaseView.prototype.updateBox.apply(this, arguments);

        var name = this.$box.find('input.name');
        if (!name.is(':focus')) {
            name.val(this.model.get('name'));
        }
   },
});

gameDataHandler['dialogue.Contract'] = function (cell, node) {
    node.name = cell.name;
    node.next = null;
}

linkDataHandler['Contract'] = function (cell, source, target) {
    if (!target) return false;

    delete source.next;

    switch(target.type)
    {
        case 'Party':
        {
            if(!source.parties) source.parties = [];
            source.parties.push(target.id);
            break;
        }
        case 'EventSpec':
        {
            if(!source.simple) source.simple = [];
            source.simple.push(target.id);
            break;
        }
        case 'EventSeq':
        {
            source.sequence = target.id;
            break;
        }
        default: return false;
    }

    return true;
}

var allContractTypes = {};
AddNodeScript('nodes/contracts/bountyopt.js');
AddNodeScript('nodes/contracts/eventsequence.js');
AddNodeScript('nodes/contracts/eventspec.js');
AddNodeScript('nodes/contracts/party.js');

allTypes['dialogue.Contract'] = true;
allTypesExceptChoice['dialogue.Contract'] = true;
allowableConnections['dialogue.Contract'] = allContractTypes;

AddNodeType('Contract', joint.shapes.dialogue.Contract, 'Contracts');
