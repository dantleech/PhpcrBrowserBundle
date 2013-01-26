/**
* Tree Browser
 *
 * Browser for looking at and modifying  
 * document / node hierarchies
 *
 * Depends on:
 *
 *  - underscore.js
 *  - jquery
 *  - jquery-ui
 *
 * @author Daniel Leech <daniel@dantleech.com>
 */
(function($) {
    $.widget("dtl.treeBrowser", {
        options: {

            /** 
             * Tree data object 
             */
            data: {},

            /**
             * Templates
             */
            template: {
                baseListEl: '<ul class="tbRootEl"/>',
                nodeEl: '<li><i class="icon-folder-open"/>&nbsp;<%= name %></li>',
                nodeExpandEl: '<i class="icon-plus"/>',
                nodeCollapseEl: '<i class="icon-minus"/>',
                nodeChildrenEl: '<ul/>',
                nodePropertiesEl: '<ul/>',
                nodePropertyEl: '<li><i class="icon-flag"/><%= name %> = <%= value %>(<%= type %>)</li>',
            }
        },

        /**
         * Cache of compiled templates
         *
         * @var object
         */
        _compiledTemplate: {},

        /**
         * Constructor
         */
        _create: function () {
        },

        /**
         * Render the named template
         *
         * @private
         *
         * @param string name
         * @param object params
         *
         * @return DOMElement
         */
        _template: function (name, params) {
            if (this.options.template[name] == undefined) {
                $.error('Template ' + name + ' is undefined');
            }

            if (this._compiledTemplate[name] != undefined) {
                return $(this._compiledTemplate[name](params));
            }

            this._compiledTemplate[name] = _.template(this.options.template[name]);

            return this._template(name, params);
        },

        /**
         * Render a given node object recursively
         *
         * @private
         *
         * @param DOMElement parentEl
         * @param object data
         */
        _renderNode: function (parentEl, data) {
            var $this = this;
            var nodeEl = this._template('nodeEl', data);

            if (data.id == undefined) {
                console.log(data);
                $.error('Data element has no ID');
            }

            nodeEl.attr('_tbId', data.id);
            nodeEl.addClass('tbNode');

            // render node children
            if (data.children != undefined) {
                var nodeChildrenEl = this._template('nodeChildrenEl', {});
                $.each(data.children, function (i, child) {
                    var childEl = $this._renderNode(nodeChildrenEl, child);
                    nodeChildrenEl.append(childEl);
                });
                nodeEl.append(nodeChildrenEl);
            }

            // render node properties
            if (data.properties != undefined) {
                var nodePropertiesEl = this._template('nodePropertiesEl', {});
                $.each(data.properties, function (name, prop) {
                    var propData = $.extend(prop, {'name': name});
                    var propertyEl = $this._template('nodePropertyEl', propData);
                    nodePropertiesEl.append(propertyEl);
                });

                nodeEl.append(nodePropertiesEl);
            }

            // expand / collapse element
            nodeEl.prepend('<span class="tbToggleExpand"/>');
            this._collapseNode(nodeEl);

            return nodeEl;
        },

        _collapseNode: function (nodeEl) {
            nodeEl.attr('_expanded', 'no');
            var toggleExpansionNode = nodeEl.find('.tbToggleExpand').first();
            var expandEl = this._template('nodeExpandEl', {});
            toggleExpansionNode.empty().append(expandEl);
            nodeEl.find('> ul').hide();
        },

        _expandNode: function (nodeEl) {
            nodeEl.attr('_expanded', 'yes');
            var toggleExpansionNode = nodeEl.find('.tbToggleExpand').first();
            var collapseEl = this._template('nodeCollapseEl', {});
            toggleExpansionNode.empty().append(collapseEl);

            nodeEl.find('> ul').show();
        },

        /**
         * Apply some generic CSS fixes on the base element
         * before adding to the DOM
         */
        _applyCssHacks: function (baseEl) {
            baseEl.find('ul').css('list-style', 'none');
            baseEl.css('list-style', 'none');
        },

        /**
         * Bind events to the tree
         */
        _applyEvents: function (baseEl) {
            var $this = this;
            baseEl.find('.tbToggleExpand').unbind('click').bind('click', function () {
                var nodeEl = $(this).closest('.tbNode');
                if (nodeEl.attr('_expanded') == 'yes') {
                    $this._collapseNode(nodeEl);
                } else {
                    $this._expandNode(nodeEl);
                }
            });
        },

        /**
         * Set the data object
         *
         * @param object data
         */
        setData: function (data) {
            this._setOption("data", data);
        },

        /**
         * Refresh the tree
         */
        refresh: function () {
            var baseEl = this._template('baseListEl', this.options.data);
            var childEl = this._renderNode(baseEl, this.options.data);
            baseEl.append(childEl);
            this._applyCssHacks(baseEl);
            this._applyEvents(baseEl);
            this.element.empty();
            this.element.append(baseEl);
        }
    });
}) (jQuery)
