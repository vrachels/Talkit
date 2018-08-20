joint.shapes.dialogue.Party = joint.shapes.devs.Model.extend({
    defaults: joint.util.deepSupplement(
        {
            type: 'dialogue.Party',
            size: { width: 200, height: 95 },
            inPorts: ['input'],
            outPorts: ['bounties'],
            attrs:
            {
                '.outPorts circle': { unlimitedConnections: ['dialogue.BountyOpt'], allowedConnections: ['dialogue.BountyOpt'] },
            },
        },
        joint.shapes.dialogue.Base.prototype.defaults
    )
});

joint.shapes.dialogue.PartyView = joint.shapes.dialogue.BaseView.extend({
    template:
        `
        <div class="node Party">
            <span class="label"></span>
            <button class="delete">x</button>
            <input type="text" id="name" class="noprop" placeholder="Name" />
            <p>
                <div id="Members">
                    <label>Members:</label>
                    <button class="add">+</button>
                    <button class="remove">-</button>
                </div>
            </p>
        </div>
        `,

    initialize: function () {
        joint.shapes.dialogue.BaseView.prototype.initialize.apply(this, arguments);
        var membersDiv = this.$box.find('#Members');
        membersDiv.find('.add').on('click', _.bind(this.addMember, this));
        membersDiv.find('.remove').on('click', _.bind(this.removeMember, this));
        this.$box.find('#name').on('change', _.bind(function (e) {
            this.model.set('name', $(e.target).val());
        }, this));

        this.$box.find('input').on('mousedown click', function (evt) { evt.stopPropagation(); });

        this.$box.find('input.member').on('change', _.bind(function (evt) {
            var members = this.model.get('members');
            var target = $(evt.target);
            members[0] = target.val();
            this.model.set('members', members);
        }, this));
    },

    removeMember: function () {
        if (this.model.get('members').length > 0) {
            var members = this.model.get('members').slice(0);
            members.pop();
            this.model.set('members', members);
            this.updateSize();
        }
    },

    addMember: function () {
        var members = this.model.get('members').slice(0);
        members.push(null);
        this.model.set('members', members);
        this.updateSize();
    },

    updateBox: function () {
        joint.shapes.dialogue.BaseView.prototype.updateBox.apply(this, arguments);

        var name = this.$box.find('#name');
        if (!name.is(':focus')) {
            name.val(this.model.get('name'));
        }
        var scriptLong = this.$box.find('#scriptLong');
        if (!scriptLong.is(':focus')) {
            scriptLong.val(this.model.get('scriptLong'));
        }

        var members = this.model.get('members');
        var memberFields = this.$box.find('input.member');
        var membersDiv = this.$box.find('#Members');

        for (var i = memberFields.length; i < members.length; i++) {
            // member boxes
            var field = $('<input type="text" class="member" />');
            field.attr('placeholder', 'Identity Id');
            field.attr('index', i);
            membersDiv.append(field);

            // Prevent paper from handling pointerdown.
            field.on('mousedown click', function (evt) { evt.stopPropagation(); });

            field.on('change', _.bind(function (evt) {
                var members = this.model.get('members').slice(0);
                var target = $(evt.target);
                members[target.attr('index')] = target.val();
                this.model.set('members', members);
            }, this));
        }

        // Remove value fields if necessary
        for (var j = members.length; j < memberFields.length; j++) {
            $(memberFields[j]).remove();
        }

        // Update value fields
        memberFields = this.$box.find('input.member');
        for (var k = 0; k < memberFields.length; k++) {
            var field2 = $(memberFields[k]);
            if (!field2.is(':focus')) {
                field2.val(members[k]);
            }
        }
    },

    updateSize: function () {
        var width = this.model.get('size').width;
        this.model.set('size', { width, height: 95 + Math.max(0, (this.model.get('members').length) * 25) });
    }
});

gameDataHandler['dialogue.Party'] = function (cell, node) {
    node.name = cell.name;
    node.members = cell.members;
    node.next = null;
}

linkDataHandler['Party'] = function (cell, source, target) {
    if (!target) return false;
    if (target.type !== 'BountySpec') return false;

    delete source.next;

    if(!source.bountyOpts) source.bountyOpts = [];
    source.bountyOpts.push(target.id);

    return true;
}

allTypes['dialogue.Party'] = true;
allContractTypes['dialogue.Party'] = true;
allowableConnections['dialogue.Party'] = { ['dialogue.BountyOpt']: true };

AddNodeType('Party', joint.shapes.dialogue.Party, 'Contracts');