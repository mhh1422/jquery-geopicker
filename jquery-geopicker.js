(function ($) {
    var setGeolocation;

    function vfunc() {
    }
    ;

    $.fn.geoPicker = function (param, param2, param3, param4) {

        var _private = {
            address2geo: function (address, callback) {
                GMaps.geocode({
                    address: address,
                    callback: callback,
                });
            },
            setSearchMarker: function (gmap, marker, lat, lng, zoom) {
                gmap.setCenter(lat, lng);
                gmap.setZoom(zoom ? zoom : 6);
                if (options.searchMarker)
                    gmap.removeMarker(options.searchMarker);
                options.searchMarker = gmap.addMarker({
                    lat: lat,
                    lng: lng,
                    title: $(inputElement).data('geopicker').searchTitle,
                    icon: $(inputElement).data('geopicker').searchIcon,
                    click: function (e) {
                        setGeolocation({latLng: e.position});
                        gmap.removeMarker(options.searchMarker);
                    }
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
                            $(mapElement).on('click', 'button.geopicker-btn', function (e) {
                                doSearch.call($(this).parent().children('input.geopicker-search').get(0));
                            });
                            $(mapElement).on('keypress', 'input.geopicker-search', function (e) {
                                if (e.keyCode == 13) {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    doSearch.call(this);
                                }
                            });
                        }
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
                        }

                        setGeolocation = function (e) {
                            if (options.hasOwnProperty('onPick') && typeof options.onPick == 'function' && options.onPick.call(inputElement, [e.latLng.lat(), e.latLng.lng()], e) === false) {
                                return;
                            }
                            if (marker) {
                                map.removeMarker(marker);
                            }
                            marker = map.addMarker({
                                title: options.pickedTitle,
                                lng: e.latLng.lng(),
                                lat: e.latLng.lat(),
                                icon: options.chooseIcon,
                            });
                            map.setCenter(e.latLng.lat(), e.latLng.lng());
                            inputElement.val(e.latLng.lat() + "," + e.latLng.lng());
                        };

                        map.on('click', setGeolocation);

                    }
                });
                break;
            case 'string':
                switch (param) {
                    case 'gmap':
                        return $(this).first().data('gmap');
                        break;
                    case 'set':
                        setGeolocation({latLng: new google.maps.LatLng(param2, param3)});
                        return this;
                    case 'options':
                        return $(this).first().data('geopicker');
                        break;
                    case 'map':
                        return $(this).first().data('map');
                        break;
                    case 'remove':
                        return this.each(function () {
                            var cgmap = $(this).data('map');
                            if (cgmap) {
                                cgmap.remove();
                                $(this).removeData('geopicker').removeData('gmap').removeData('map');
                            }
                        });
                        break;
                    case 'search':
                        inputElement = $(this).first();
                        if ($(inputElement).data().hasOwnProperty('geopicker')) {
                            var options = $(inputElement).data('geopicker');
                            var gmap = $(inputElement).data('gmap');
                            _private.address2geo(param2, function (results, status) {
                                if (status === 'OK') {
                                    if (results.length === 0) {
                                        return;
                                    }
                                    var latlng = results[0].geometry.location;
                                    _private.setSearchMarker(gmap, options.searchMarker, latlng.lat(), latlng.lng(), 10);
                                    gmap.fitLatLngBounds([results[0].geometry.viewport.getNorthEast(), results[0].geometry.viewport.getSouthWest()]);
                                    $(inputElement).data('geopicker', options);
                                }
                            });
                        }
                        return this;
                        break;
                    case 'suggest':
                        inputElement = $(this).first();
                        if ($(inputElement).data().hasOwnProperty('geopicker') && param2 && param3) {
                            var options = $(inputElement).data('geopicker');
                            var gmap = $(inputElement).data('gmap');
                            lat = param2;
                            lng = param3;
                            _private.setSearchMarker(gmap, options.searchMarker, lat, lng, param4 ? param4 : 10);
                            $(inputElement).data('geopicker', options);
                        }
                        return this;
                        break;
                }
                break;
        }
    };

    $.fn.geoPicker.defaults = {
        template: "<div id=':id' style=':style' class='geopicker-container :class'></div>",
        searchTemplate: "<input class='geopicker-search' placeholder=':searchPlaceholder' /><button class='geopicker-btn' type='button'>:searchLabel</button>",
        searchLabel: "Search",
        searchPlaceholder: "Search",
        searchTitle: 'Search result',
        searchIcon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
        class: "gllpMaps",
        style: "height: 200px; width: 100%; position: relative;",
        lat: 21.4224843,
        lng: 39.8262017,
        zoom: 12,
        autoFit: true,
        disableDefaultUI: false,
        streetViewControl: false,
        mapTypeControl: false,
        onPick: vfunc,
        addSearch: true,
    };

})(jQuery);
