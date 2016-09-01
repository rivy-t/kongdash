app.controller('ApiListController', ['$scope', 'kdAjax', 'kdToast', 'viewFactory', function ($scope, kdAjax, kdToast, viewFactory) {

    viewFactory.title = 'API List';
    viewFactory.prevUrl = null;

    $scope.formInput = {
        apiName: '',
        requestHost: '',
        requestPath: '',
        upstreamUrl: '',
        preserveHost: true,
        stripRequestPath: false
    };

    $scope.apiList = [];
    $scope.fetchApiList = function (url) {
        kdAjax.get({
            resource: url
        }).then(function (response) {
            $scope.nextUrl = response.data.next || '';

            for (var i=0; i<response.data.data.length; i++ ) {
                $scope.apiList.push(response.data.data[i])
            }

        }, function () {
            kdToast.error('Could not load list of APIs')
        })
    };

    var panelAdd = angular.element('div#panelAdd');
    var apiForm = panelAdd.children('div.panel__body').children('form');

    var table = angular.element('table#apiTable');

    table.on('click', 'i.state-highlight', function (event) {
        var icon = angular.element(event.target);
        var payload = {};
        var attribute = icon.data('attribute');

        payload[attribute] = ((icon.hasClass('success')) ? false : true );

        kdAjax.patch({
            resource: '/apis/' + icon.data('api-id')
        }).then(function () {
            if ( payload[attribute] == true) {
                icon.removeClass('default').addClass('success');

            } else {
                icon.removeClass('success').addClass('default');
            }

            kdToast.success('Attribute ' + attribute + ' set to ' + payload[attribute]);

        }, function () {
            kdToast.error('Unable to update ' + attribute);
        })
    });

    panelAdd.children('div.panel__heading').on('click', function () {
        apiForm.slideToggle(300)
    });

    apiForm.on('submit', function (event) {
        event.preventDefault();

        var payload = {};

        if ($scope.formInput.apiName.trim().length > 1) {
            payload.name = $scope.formInput.apiName;
        }

        if ($scope.formInput.requestHost.trim().length > 1) {
            payload.request_host = $scope.formInput.requestHost;
        }

        if (typeof payload.name === 'undefined' &&
                typeof payload.request_host === 'undefined') {
            apiForm.find('input[name="apiName"]').focus();
            return false;
        }

        if ($scope.formInput.requestPath.trim().length > 1) {
            payload.request_path = $scope.formInput.requestPath;
        }

        if ( typeof payload.request_path === 'undefined' &&
            typeof payload.request_host === 'undefined') {
            apiForm.find('input[name="requestPath"]').focus();
            return false;
        }

        if ($scope.formInput.upstreamUrl.trim().length > 1) {
            payload.upstream_url = $scope.formInput.upstreamUrl;
        } else {
            apiForm.find('input[name="upstreamUrl"]').focus();
            return false;
        }

        payload.strip_request_path = $scope.formInput.stripRequestPath;
        payload.preserve_host = $scope.formInput.preserveHost;

        kdAjax.post({
            resource: '/apis/',
            data: payload
        }).then(function (response) {
            $scope.apiList.push(response.data);

            kdToast.success('New API added')

        }, function (response) {
            kdToast.error(response.data)
        });

        return false
    });

    apiForm.on('click', 'button[name="actionCancel"]', function () {
        apiForm.slideUp(300);
    });

    $scope.fetchApiList('/apis');
}]);