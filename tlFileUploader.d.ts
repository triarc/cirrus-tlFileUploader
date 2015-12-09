declare module Triarc {
    class FileUploaderWrapper {
        private supportedDocumentTypes;
        uploader: any;
        static $inject: string[];
        constructor($fileUploader: any, $scope: angular.IScope, supportedDocumentTypes?: string);
        removeFromQueue(file: File): void;
        cancelAll(): void;
    }
}
declare module Triarc.FileUploader {
    class FileUploaderService {
        private FileUploader;
        private $rootScope;
        static serviceId: string;
        static $inject: string[];
        fileUploader: any;
        constructor(FileUploader: any, $rootScope: angular.IRootScopeService);
        create(): any;
    }
}
