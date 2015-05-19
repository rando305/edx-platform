;(function (define, undefined) {
    'use strict';
    define(['gettext', 'jquery', 'underscore', 'backbone', 'moment'],
        function (gettext, $, _, Backbone, _moment) {

        var moment = _moment || window.moment;

        return Backbone.View.extend({

            el: '.courseware-results-list',
            coursewareContentElement: '#course-content',

            errorIcon: '<i class="fa fa-fw fa-exclamation-triangle message-error" aria-hidden="true"></i>',
            loadingIcon: '<i class="fa fa-fw fa-spinner fa-pulse message-in-progress" aria-hidden="true"></i>',

            errorMessage: gettext('An error has occurred. Please try again.'),
            loadingMessage: gettext('Loading'),

            url: '/api/bookmarks/v0/bookmarks/',

            events : {
                'click .bookmarks-results-list-item': 'visitBookmark'
            },

            initialize: function (options) {
                this.template = _.template($('#bookmarks_list-tpl').text());
                this.loadingMessageView = options.loadingMessageView;
                this.errorMessageView = options.errorMessageView;
                this.courseId = $(this.el).data('courseId');
                this.langCode = $(this.el).data('langCode');
                _.bindAll(this, 'render', 'breadcrumbTrail', 'humanFriendlyDate', 'createBookmarkUrl');
            },

            render: function () {
                var data = {
                    bookmarks: this.collection.models,
                    breadcrumbTrail: this.breadcrumbTrail,
                    humanFriendlyDate: this.humanFriendlyDate,
                    createBookmarkUrl: this.createBookmarkUrl
                };
                this.$el.html(this.template(data));
                this.delegateEvents();
                return this;
            },

            showBookmarksList: function () {
                var view = this;

                this.hideErrorMessage();
                this.showBookmarksContainer();
                this.showLoadingMessage();

                this.collection.url = this.url;
                this.collection.fetch({
                    reset: true,
                    data: {course_id: this.courseId, fields: 'display_name,path'}
                }).done(function () {
                    view.hideLoadingMessage();
                    view.render();
                    view.focusBookmarksElement();
                }).fail(function () {
                    view.hideLoadingMessage();
                    view.showErrorMessage();
                });
            },

            visitBookmark: function (event) {
                window.location = event.target.pathname;
            },

            /**
             * Create a breadcrumb trail from section, subsection and unit display names.
             * @param {Array} bookmarkPath - Contains 2 objects of info related to section and subsection.
             * @param {String} unitDisplayName - Unit display name.
             */
            breadcrumbTrail: function (bookmarkPath, unitDisplayName) {
                var separator = ' <i class="icon fa fa-caret-right" aria-hidden="true"></i><span class="sr">-</span> ';
                var names = _.pluck(bookmarkPath, 'display_name');
                names.push(unitDisplayName);
                return names.join(separator);
            },

            /**
             * Convert ISO 8601 formatted date into human friendly format. e.g, `2014-05-23T14:00:00Z` to `May 23, 2014`
             * @param {String} isoDate - ISO 8601 formatted date string.
             */
            humanFriendlyDate: function (isoDate) {
                moment.locale(this.langCode);
                return moment(isoDate).format('LL');
            },

            createBookmarkUrl: function (courseId, usageId) {
                return '/courses/' + courseId + '/jump_to/' + usageId
            },

            isVisible: function () {
                return this.$('#my-bookmarks').is(":visible");
            },

            hideBookmarks: function () {
              this.$el.hide();
              $(this.coursewareContentElement).show();
            },

            showBookmarksContainer: function () {
                $(this.coursewareContentElement).hide();
                // Empty el if it's not empty to get the clean state.
                this.$el.html('');
                this.$el.show();
            },

            showLoadingMessage: function () {
                this.loadingMessageView.showMessage(this.loadingMessage, this.loadingIcon);
            },

            hideLoadingMessage: function () {
                this.loadingMessageView.hideMessage();
            },

            showErrorMessage: function () {
                this.errorMessageView.showMessage(this.errorMessage, this.errorIcon);
            },

            hideErrorMessage: function () {
                this.errorMessageView.hideMessage();
            },

            focusBookmarksElement: function () {
                this.$('#my-bookmarks').focus();
            }
        });
    });
}).call(this, define || RequireJS.define);
