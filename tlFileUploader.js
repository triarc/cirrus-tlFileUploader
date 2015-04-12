var Triarc;
(function (Triarc) {
    var FileUploaderWrapper = (function () {
        function FileUploaderWrapper($fileUploader, $scope, supportedDocumentTypes) {
            var _this = this;
            this.supportedDocumentTypes = supportedDocumentTypes;
            this.uploader = $fileUploader.create();
            if (Triarc.hasValue(this.supportedDocumentTypes && this.supportedDocumentTypes.length > 0)) {
                this.uploader.filters.push({
                    name: 'supportedImageTypes',
                    fn: function (item) {
                        var type = _this.uploader.isHTML5 ? item.type : '/' + item.value.slice(item.value.lastIndexOf('.') + 1);
                        var ext = item.name.toLowerCase().substring(item.name.lastIndexOf('.'), item.name.length);
                        return supportedDocumentTypes.split(",").contains(ext);
                    }
                });
            }
            // this.uploader.addToQueue();
            this.uploader.progress = 100;
        }
        FileUploaderWrapper.prototype.removeFromQueue = function (file) {
            this.uploader.removeFromQueue(file);
        };
        FileUploaderWrapper.prototype.cancelAll = function () {
            this.uploader.cancelAll();
        };
        FileUploaderWrapper.$inject = ["$fileUploader", "$scope"];
        return FileUploaderWrapper;
    })();
    Triarc.FileUploaderWrapper = FileUploaderWrapper;
})(Triarc || (Triarc = {}));
/// <reference path="fileuploaderwrapper.ts" />
var Triarc;
(function (Triarc) {
    var FileUploader;
    (function (_FileUploader) {
        var FileUploaderService = (function () {
            function FileUploaderService(FileUploader, $rootScope) {
                this.FileUploader = FileUploader;
                this.$rootScope = $rootScope;
            }
            FileUploaderService.prototype.create = function () {
                return new this.FileUploader({
                    scope: this.$rootScope
                });
            };
            FileUploaderService.serviceId = "$fileUploader";
            FileUploaderService.$inject = ['FileUploader', '$rootScope'];
            return FileUploaderService;
        })();
        _FileUploader.FileUploaderService = FileUploaderService;
        angular.module("tlFileUploader", ["angularFileUpload"]).service(FileUploaderService.serviceId, FileUploaderService).directive('tlFileSelect', [
            '$parse',
            'FileUploader',
            function ($parse, FileUploader) {
                return {
                    scope: {
                        tlFileSelect: '='
                    },
                    link: function (scope, element, attributes) {
                        scope.$watch('tlFileSelect', function (newVal, oldVal) {
                            if (newVal instanceof FileUploader) {
                                var object = new FileUploader.FileSelect({
                                    uploader: scope.tlFileSelect,
                                    element: element
                                });
                                object.getOptions = $parse(attributes.options).bind(object, scope);
                                object.getFilters = function () { return attributes.filters; };
                            }
                            else {
                                return;
                            }
                        });
                    }
                };
            }
        ]).directive('tlFileDrop', [
            '$parse',
            'FileUploader',
            function ($parse, FileUploader) {
                FileUploader.FileDrop.prototype.events = {
                    $destroy: 'destroy',
                    drop: 'onDrop',
                    dragover: 'onDragOver',
                    dragbetterenter: 'dummy',
                    dragbetterleave: 'onDragLeave'
                };
                // needed, else the dragbetter complains
                FileUploader.FileDrop.prototype.dummy = function () {
                };
                FileUploader.FileDrop.prototype.onDragLeave = function (event) {
                    if (event.target !== this.element[0]) {
                        return;
                    }
                    console.log("remove leave");
                    this._preventAndStop(event);
                    angular.forEach(this.uploader._directives.over, this._removeOverClass, this);
                };
                return {
                    scope: {
                        tlFileDrop: '='
                    },
                    link: function (scope, element, attributes) {
                        scope.$watch('tlFileDrop', function (newVal, oldVal) {
                            if (newVal instanceof FileUploader) {
                                if (!scope.tlFileDrop.isHTML5)
                                    return;
                                var object = new FileUploader.FileDrop({
                                    uploader: scope.tlFileDrop,
                                    element: scope.$eval(attributes.fullBody) ? $(document) : element
                                });
                                object.getOptions = $parse(attributes.options).bind(object, scope);
                                object.getFilters = function () { return attributes.filters; };
                            }
                            else {
                                return;
                            }
                        });
                    }
                };
            }
        ]).directive('tlFileOver', [
            'FileUploader',
            function (FileUploader) {
                return {
                    scope: {
                        tlFileOver: '='
                    },
                    link: function (scope, element, attributes) {
                        scope.$watch('tlFileOver', function (newVal, oldVal) {
                            if (newVal instanceof FileUploader) {
                                var object = new FileUploader.FileOver({
                                    uploader: scope.tlFileOver,
                                    element: element
                                });
                                object.getOverClass = function () { return (attributes.overClass || "tl-file-over"); };
                            }
                            else {
                                return;
                            }
                        });
                    }
                };
            }
        ]);
        ;
        (function ($) {
            "use strict";
            $.event.special.dragbetterenter = {
                setup: function () {
                    var _this = this;
                    var self = this, $self = $(self);
                    self.dragbetterCollection = [];
                    $self.on('dragenter.dragbetterenter', function (event) {
                        if (_this.dragbetterCollection.length === 0) {
                            $self.triggerHandler('dragbetterenter');
                        }
                        _this.dragbetterCollection.push(event.target);
                    });
                    $self.on('drop.dragbetterenter dragend.dragbetterenter', function () {
                        _this.dragbetterCollection = [];
                        $self.triggerHandler('dragbetterleave');
                    });
                },
                teardown: function () {
                    $(this).off('.dragbetterenter');
                }
            };
            $.event.special.dragbetterleave = {
                setup: function () {
                    if (!this.dragbetterCollection)
                        throw "Triggered dragbetterleave without dragbetterenter. Do you listen to dragbetterenter?";
                    var self = this, $self = $(self);
                    $self.on('dragleave.dragbetterleave', function (event) {
                        // Timeout is needed to ensure that the leave event on the previous element
                        // fires AFTER the enter event on the next element.
                        setTimeout(function () {
                            var currentElementIndex = this.dragbetterCollection.indexOf(event.target);
                            if (currentElementIndex > -1)
                                this.dragbetterCollection.splice(currentElementIndex, 1);
                            if (this.dragbetterCollection.length === 0) {
                                $self.triggerHandler('dragbetterleave');
                            }
                        }, 1);
                    });
                },
                teardown: function () {
                    $(this).off('.dragbetterleave');
                }
            };
        })($);
    })(FileUploader = Triarc.FileUploader || (Triarc.FileUploader = {}));
})(Triarc || (Triarc = {}));

