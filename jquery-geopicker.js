(function ($) {

    function vfunc() {
    }
    ;

    $.fn.geoPicker = function (param, param2) {

        var _private = {
            address2geo: function (address, callback) {
                GMaps.geocode({
                    address: address,
                    callback: callback,
                });
            },
        };

        switch (typeof param) {

            case 'undefined':
            case 'object':

                return this.each(function () {

                    var map, marker, searchMarker, inputElement, mapElement;

                    if ($(this).data().hasOwnProperty("geopicker")) {

                        return;

                    } else {

                        var doSearch = function () {
                            $(inputElement).geoPicker('search', this.value);
                        };

                        inputElement = $(this);

                        options = $.extend({id: inputElement.attr("id") + "-geopicker", insertAfter: inputElement}, $.fn.geoPicker.defaults, param || {}, {searchMarker: searchMarker});
                        options.el = options.id;
                        mapElement = $(options.template.replace(/:id/g, options.id).replace(":class", options.class).replace(":style", options.style)).insertAfter(options.insertAfter);


                        map = new GMaps(options);

                        if (options.addSearch) {
                            map.addControl({
                                content: options.searchTemplate.replace(':searchLabel', options.searchLabel).replace(':searchPlaceholder', options.searchPlaceholder),
                                position: 'top_right',
                            });
                            $(mapElement).on('change', 'input.geopicker-search', doSearch);
                            $(mapElement).on('click', 'button.geopicker-btn', doSearch);
                            $(mapElement).on('keypress', 'input.geopicker-search', function (e) {
                                if (e.keyCode == 13) {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    doSearch.call(this);
                                }
                            });
                        }

                        map.on('click', function (e) {
                            if (marker) {
                                map.removeMarker(marker);
                            }
                            marker = map.addMarker({
                                title: options.pickedTitle,
                                lat: e.latLng.lng(),
                                lng: e.latLng.lat(),
                                icon: options.chooseIcon,
                            });
                            map.setCenter(e.latLng.lng(), e.latLng.lat());
                            options.onPick.call(inputElement, [e.latLng.lat(), e.latLng.lng()], e);
                            inputElement.val(e.latLng.lat() + "," + e.latLng.lng());
                        });
                        $(this).data('geopicker', options).data('gmap', map).data('map', mapElement);
                        $(mapElement).data('input', inputElement);

                        if (inputElement.val()) {
                            var point = inputElement.val().split(",");
                            marker = map.addMarker({
                                lat: point[0],
                                lng: point[1],
                                icon: options.chooseIcon,
                            });
                            map.setCenter(point[0], point[1]);
                            map.fitZoom();
                            map.zoomOut(6);
                        }

                    }
                });
                break;
            case 'string':
                switch (param) {
                    case 'gmap':
                        return $(this).first().data('gmap');
                        break;
                    case 'options':
                        return $(this).first().data('geopicker');
                        break;
                    case 'map':
                        return $(this).first().data('map');
                        break;
                    case 'remove':
                        return this.each(function () {
                            $(this).data('map').remove();
                            $(this).removeData('geopicker').removeData('gmap').removeData('map');
                        });
                        break;
                    case 'search':
                        inputElement = $(this).first();
                        if ($(inputElement).data().hasOwnProperty('geopicker')) {
                            var options = $(inputElement).data('geopicker');
                            var gmap = $(inputElement).data('gmap');
                            _private.address2geo(param2, function (results, status) {
                                if (status === 'OK') {
                                    var latlng = results[0].geometry.location;
                                    gmap.setCenter(latlng.lat(), latlng.lng());
                                    if (options.searchMarker)
                                        gmap.removeMarker(options.searchMarker);
                                    options.searchMarker = gmap.addMarker({
                                        lat: latlng.lat(),
                                        lng: latlng.lng(),
                                        title: $(inputElement).data('geopicker').searchTitle,
                                        icon: $(inputElement).data('geopicker').searchIcon,
                                    });
                                    $(inputElement).data('geopicker', options);
                                }
                            });
                        }
                        return this;
                        break;
                }
                break;
        }
    };

    $.fn.geoPicker.defaults = {
        template: "<div id=':id' style=':style' class='geopicker-container :class'></div>",
        searchTemplate: "<input class='geopicker-search' placeholder=':searchPlaceholder' /><button class='geopicker-btn'>:searchLabel</button>",
        searchLabel: "Search",
        searchPlaceholder: "Search",
        searchTitle: 'Search result',
        searchIcon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
        class: "gllpMaps",
        style: "height: 200px; width: 100%; position: relative;",
        lat: 21.4224843,
        lng: 39.8262017,
        zoom: 8,
        autoFit: false,
        disableDefaultUI: false,
        streetViewControl: false,
        mapTypeControl: false,
        onPick: vfunc,
        addSearch: true,
    };

})(jQuery);
