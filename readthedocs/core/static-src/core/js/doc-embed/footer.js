var rtd = require('./rtd-data');


function init(build) {

    var get_data = {
        project: rtd['project'],
        version: rtd['version'],
        page: rtd['page'],
        theme: rtd['theme'],
        format: "jsonp",
    };


    // Crappy heuristic, but people change the theme name on us.
    // So we have to do some duck typing.
    if ("docroot" in rtd) {
        get_data['docroot'] = rtd['docroot'];
    }

    if ("source_suffix" in rtd) {
        get_data['source_suffix'] = rtd['source_suffix'];
    }

    if (window.location.pathname.indexOf('/projects/') === 0) {
        get_data['subproject'] = true;
    }

    // Theme popout code
    $.ajax({
        url: rtd.api_host + "/api/v2/footer_html/",
        crossDomain: true,
        xhrFields: {
        withCredentials: true,
        },
        dataType: "jsonp",
        data: get_data,
        success: function (data) {
            // If the theme looks like ours, update the existing badge
            // otherwise throw a a full one into the page.
            if (build.is_rtd_theme()) {
                $("div.rst-other-versions").html(data['html']);
            } else {
                $("body").append(data['html']);
            }

            if (!data['version_active']) {
                $('.rst-current-version').addClass('rst-out-of-date');
            } else if (!data['version_supported']) {
                //$('.rst-current-version').addClass('rst-active-old-version')
            }

            // Show promo selectively
            if (data.promo && build.show_promo()) {
                var promo = new sponsorship.Promo(
                    data.promo_data.id,
                    data.promo_data.text,
                    data.promo_data.link,
                    data.promo_data.image
                )
                if (promo) {
                    promo.display();
                }
            }

            // using jQuery
            function getCookie(name) {
                var cookieValue = null;
                if (document.cookie && document.cookie !== '') {
                    var cookies = document.cookie.split(';');
                    for (var i = 0; i < cookies.length; i++) {
                        var cookie = jQuery.trim(cookies[i]);
                        // Does this cookie string begin with the name we want?
                        if (cookie.substring(0, name.length + 1) == (name + '=')) {
                            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                            break;
                        }
                    }
                }
                return cookieValue;
            }

                function csrfSafeMethod(method) {
                    // these HTTP methods do not require CSRF protection
                    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
                }
                $.ajaxSetup({
                    beforeSend: function(xhr, settings) {
                        if (!csrfSafeMethod(settings.type)) {
                            xhr.setRequestHeader("X-CSRFToken", $('a.bookmark[token]').attr('token'));
                        }
                    }
                });
        },
        error: function () {
            console.log('Error loading Read the Docs footer');
        }
    });

}

module.exports = {
    init: init
};
