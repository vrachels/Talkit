joint.shapes.dialogue.Contract = joint.shapes.devs.Model.extend({
    defaults: joint.util.deepSupplement(
        {
            type: 'dialogue.Contract',
            size: { width: 300, height: 760, },
            inPorts: ['input'],
            outPorts: ['output'],
            attrs:
            {
                '.outPorts circle': { unlimitedConnections: ['dialogue.EventSpec'], }
            },

            parties: [
                'Leasee',
                'Leasor'
            ],
        },
        joint.shapes.dialogue.Base.prototype.defaults
    )
});

joint.shapes.dialogue.ContractView = joint.shapes.dialogue.BaseView.extend({
    template:
        `
        <div class="node">
            <span class="label"></span>
            <button class="delete">x</button>
            <input type="text" class="name" placeholder="Contract Name" />
            <p>
                <label>Bounty Def:</label>
                <div id="Bounty1">
                    <input type="text" id="partyId" placeholder="PartyId" />
                    <div id="Option1">
                        <div id="Thing1">
                            <input type="text" class="Thing" placeholder="Thing" />
                            <input type="text" class="Count" placeholder="Count" />
                        </div>
                        <button id="addThing" class="add">+</button>
                        <button id="delThing" class="remove">-</button>
                    </div>
                    <br>
                    <button id="addOption" class="add">+</button>
                    <button id="delOption" class="remove">-</button>
                </div>
                <br>
                <button id="addBounty" class="add">+</button>
                <button id="delBounty" class="remove">-</button>
            </p>
        </div>
        `,

    initialize: function () {
        joint.shapes.dialogue.BaseView.prototype.initialize.apply(this, arguments);
        this.$box.find('.add').on('click', _.bind(this.addParameter, this));
        this.$box.find('.remove').on('click', _.bind(this.removeParameter, this));
        this.$box.find('input').on('change', _.bind(function (e) {
            var target = $(e.target);
            var value = target.val();
            var varName = target.id ? target.id : target.className;
            var parentNode = target.parentNode;
            while (parentNode) {
                var parentId = parentNode.id ? parentNode.id : parentNode.className;
                if (parentId === 'node') break;
                varName = parentId + '_' + varName;
                parentNode = parentNode.parentNode;
            }

            this.model.set('varName', value);
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
        var context = this.$box.find('input');
        if (!context.is(':focus')) {
            context.val(this.model.get('context'));
        }
        var method = this.$box.find('input.method');
        if (!method.is(':focus')) {
            method.val(this.model.get('method'));
        }
        var parties = this.model.get('parties');
        var parameterFields = this.$box.find('input.parameter');

        for (var i = parameterFields.length; i < parties.length; i++) {
            // parameter boxes
            var field1 = $('<input type="text" class="parameter" />');
            field1.attr('placeholder', 'Arg: Value');
            field1.attr('index', i);
            this.$box.append(field1);

            // Prevent paper from handling pointerdown.
            field1.on('mousedown click', function (evt) { evt.stopPropagation(); });

            field1.on('change', _.bind(function (evt) {
                var parties = this.model.get('parties').slice(0);
                parties[$(evt.target).attr('index')] = $(evt.target).val();
                this.model.set('parties', parties);
            }, this));
        }

        // Remove value fields if necessary
        for (var j = parties.length; j < parameterFields.length; j++) {
            $(parameterFields[j]).remove();
        }

        // Update value fields
        parameterFields = this.$box.find('input.parameter');
        for (var k = 0; k < parameterFields.length; k++) {
            var field2 = $(parameterFields[k]);
            if (!field2.is(':focus')) {
                field2.val(parties[k]);
            }
        }
    },

    updateSize: function () {
        var width = this.model.get('size').width;
        this.model.set('size', { width, height: 101 + Math.max(0, (this.model.get('parties').length - 1) * 25) });
    }
});

gameDataHandler['dialogue.Contract'] = function (cell, node) {
    node.name = cell.name;
    node.next = null;
}

linkDataHandler['Party'] = function (cell, source, target) {
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
AddNodeScript('nodes/contracts/bountyspec.js');
AddNodeScript('nodes/contracts/eventsequence.js');
AddNodeScript('nodes/contracts/eventspec.js');
AddNodeScript('nodes/contracts/party.js');

allTypes['dialogue.Contract'] = true;
allTypesExceptChoice['dialogue.Contract'] = true;
allowableConnections['dialogue.Contract'] = allContractTypes;

AddNodeType('Contract', joint.shapes.dialogue.Contract, 'Contracts');
