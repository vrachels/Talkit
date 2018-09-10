joint.shapes.dialogue.EventSpec = joint.shapes.devs.Model.extend({
    defaults: joint.util.deepSupplement(
        {
            type: 'dialogue.EventSpec',
            size: { width: 200, height: 235 },
            inPorts: ['input'],
            parameters: [
                'Action: Action: ?',
            ]
        },
        joint.shapes.dialogue.Base.prototype.defaults
    )
});

joint.shapes.dialogue.EventSpecView = joint.shapes.dialogue.BaseView.extend({
    template:
        `
        <div class="node EventSpec">
            <span class="label"></span>
            <button class="delete">x</button>
            <input type="text" id="name" class="noprop" placeholder="Name" />
            <input type="text" id="party" class="noprop" placeholder="PartyId" />
            <p>
                <input type="checkbox" id="isIdentityCheck" />
                <label>Validate Subject by Identity</label>
            </p>
            <p>
                <input type="text" id="Activity" placeholder="Activity" />
                <input type="text" id="DirectObject" placeholder="DirectObject" />
                <input type="text" id="IndirectObject" placeholder="IndirectObject" />
            </p>
            <p>
                <input type="checkbox" id="isRestriction" />
                <label>Restriction</label>
                <input type="checkbox" id="isOngoing" />
                <label>Ongoing</label>
            </p>
        </div>
        `,

    initialize: function () {
        joint.shapes.dialogue.BaseView.prototype.initialize.apply(this, arguments);

        this.$box.find('#name').on('change', _.bind(function (e) {
            this.model.set('name', $(e.target).val());
        }, this));
        this.$box.find('#party').on('change', _.bind(function (e) {
            this.model.set('party', $(e.target).val());
        }, this));

        this.$box.find('#Activity').on('change', _.bind(function (e) {
            this.model.set('activity', $(e.target).val());
        }, this));
        this.$box.find('#DirectObject').on('change', _.bind(function (e) {
            this.model.set('directobject', $(e.target).val());
        }, this));
        this.$box.find('#IndirectObject').on('change', _.bind(function (e) {
            this.model.set('indirectobject', $(e.target).val());
        }, this));

        this.$box.find('#isRestriction').on('change', _.bind(function (e) {
            var value = $(e.target).prop("checked");
            this.model.set('isRestriction', value);
        }, this));
        this.$box.find('#isOngoing').on('change', _.bind(function (e) {
            var value = $(e.target).prop("checked");
            this.model.set('isOngoing', value);
        }, this));
        this.$box.find('#isIdentityCheck').on('change', _.bind(function (e) {
            var value = $(e.target).prop("checked");
            this.model.set('isIdentityCheck', value);
        }, this));

        this.$box.find('input').on('mousedown click', function (evt) { evt.stopPropagation(); });
    },

    updateBox: function () {
        joint.shapes.dialogue.BaseView.prototype.updateBox.apply(this, arguments);

        var name = this.$box.find('#name');
        if (!name.is(':focus')) {
            name.val(this.model.get('name'));
        }
        var party = this.$box.find('#party');
        if (!party.is(':focus')) {
            party.val(this.model.get('party'));
        }

        var activity = this.$box.find('#Activity');
        if (!activity.is(':focus')) {
            activity.val(this.model.get('activity'));
        }
        var directobject = this.$box.find('#DirectObject');
        if (!directobject.is(':focus')) {
            directobject.val(this.model.get('directobject'));
        }
        var indirectobject = this.$box.find('#IndirectObject');
        if (!indirectobject.is(':focus')) {
            indirectobject.val(this.model.get('indirectobject'));
        }

        this.$box.find('#isRestriction').prop("checked", this.model.get('isRestriction'));
        this.$box.find('#isOngoing').prop("checked", this.model.get('isOngoing'));
        this.$box.find('#isIdentityCheck').prop("checked", this.model.get('isIdentityCheck'));
    },
});

gameDataHandler['dialogue.EventSpec'] = function (cell, node) {
    node.name = cell.name;
    node.party = cell.party;
    node.activity = cell.activity;
    node.directobject = cell.directobject;
    node.indirectobject = cell.indirectobject;
    node.isRestriction = cell.isRestriction;
    node.isOngoing = cell.isOngoing;
    node.isIdentityCheck = cell.isIdentityCheck;
    node.next = null;
}


allTypes['dialogue.EventSpec'] = true;
allContractTypes['dialogue.EventSpec'] = true;

AddNodeType('EventSpec', joint.shapes.dialogue.EventSpec, 'Contracts');