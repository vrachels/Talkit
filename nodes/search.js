joint.shapes.dialogue.Search = joint.shapes.devs.Model.extend(
    {
        defaults: joint.util.deepSupplement(
            {
                size: { width: 250, height: 136 },
                type: 'dialogue.Search',
                inPorts: ['input'],
                outPorts: ['NoResults', 'WithResults'],
                values: [null, null],
                tag: '',
            },
            joint.shapes.dialogue.Base.prototype.defaults
        ),
    });

joint.shapes.dialogue.SearchView = joint.shapes.dialogue.BaseView.extend(
    {
        template:
            [
                '<div class="node search">',
                '<span class="label"> </span>',
                '<button class="delete">x</button>',
                '<input id="noResults" type="text" value="NoResults" readonly/>',
                '<input id="withResults" type="text" value="WithResults" readonly/>',
                '<p>',
                '   <label>Tags:</label>',
                '   <input id="tag" type="text" class="tag" placeholder="Tag" />',
                '</p>',

            ].join(''),

        initialize: function () {
            joint.shapes.dialogue.BaseView.prototype.initialize.apply(this, arguments);

            // Prevent paper from handling pointerdown.
            this.$box.find('input').on('mousedown click', function (evt) { evt.stopPropagation(); });
            this.$box.find('input.tag').on('change', _.bind(function (evt) {
                this.model.set('tag', $(evt.target).val());
            }, this));

        },

        updateBox: function () {
            joint.shapes.dialogue.BaseView.prototype.updateBox.apply(this, arguments);

            var tagField = this.$box.find('input.tag');
            if (!tagField.is(':focus'))
                tagField.val(this.model.get('tag'));
        },
    });

gameDataHandler['dialogue.Search'] = function (cell, node) {
    node.tag = cell.tag
    node.noResults = null;
    node.withResults = null;
}

linkDataHandler['Search'] = function (cell, source, target) {
    //var portNumber = parseInt(cell.source.port.slice('output'.length));
    var targetId = target ? target.id : null;
    switch (cell.source.port) {
        case 'NoResults': source.noResults = targetId;  break;
        case 'WithResults': source.withResults = targetId;  break;
        default: return false;
    }
    return true;
}

allTypes['dialogue.Search'] = true;
allChoiceTypes['dialogue.Search'] = true;
allowableConnections['dialogue.Search'] = allChoiceTypes;

AddNodeType('Search', joint.shapes.dialogue.Search);
NodeScriptDone();