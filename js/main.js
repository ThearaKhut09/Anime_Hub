/*  ---------------------------------------------------
    Theme Name: Anime
    Description: Anime video tamplate
    Author: Colorib
    Author URI: https://colorib.com/
    Version: 1.0
    Created: Colorib
---------------------------------------------------------  */

'use strict';

(function ($) {

    /*------------------
        Preloader
    --------------------*/
    $(window).on('load', function () {
        $(".loader").fadeOut();
        $("#preloder").delay(200).fadeOut("slow");

        /*------------------
            FIlter
        --------------------*/
        $('.filter__controls li').on('click', function () {
            $('.filter__controls li').removeClass('active');
            $(this).addClass('active');
        });
        if ($('.filter__gallery').length > 0) {
            var containerEl = document.querySelector('.filter__gallery');
            var mixer = mixitup(containerEl);
        }
    });

    /*------------------
        Background Set
    --------------------*/
    $('.set-bg').each(function () {
        var bg = $(this).data('setbg');
        $(this).css('background-image', 'url(' + bg + ')');
    });

    // Search model
    $('.search-switch').on('click', function () {
        $('.search-model').fadeIn(400);
    });

    $('.search-close-switch').on('click', function () {
        $('.search-model').fadeOut(400, function () {
            $('#search-input').val('');
        });
    });

    /*------------------
		Navigation & Dropdown
	--------------------*/
    $(".mobile-menu").slicknav({
        prependTo: '#mobile-menu-wrap',
        allowParentLinks: true
    });

    $('.header__menu ul li').has('.dropdown').each(function () {
        var $parentLi = $(this);
        var $trigger = $parentLi.children('a');

        $trigger.on('click', function (e) {
            if ($(window).width() > 768) {
                e.preventDefault();
                $parentLi.toggleClass('active-dropdown');
                $('.header__menu ul li').not($parentLi).removeClass('active-dropdown');
            }
        });
    });

    $(document).on('click', function (e) {
        if (!$(e.target).closest('.header__menu ul li').length) {
            $('.header__menu ul li').removeClass('active-dropdown');
        }
    });

    /*------------------
		Category Filter By URL Parameter
	--------------------*/
    var urlParams = new URLSearchParams(window.location.search);
    var categoryType = urlParams.get('type') || urlParams.get('genre');

    var categoryNames = {
        'all': 'All Anime',
        'action': 'Action & Adventure',
        'romance': 'Romance & Drama',
        'fantasy': 'Fantasy & Magic',
        'movies': 'Anime Movies',
        'tv': 'TV Series',
        'live': 'Live Action'
    };

    if (categoryType && categoryNames[categoryType.toLowerCase()]) {
        var catTitle = categoryNames[categoryType.toLowerCase()];
        $('#category-title, .product__page__title .section-title h4').text(catTitle);
        $('#breadcrumb-current, .breadcrumb__links span').text(catTitle);
        document.title = 'Anime | ' + catTitle;

        if ($('.product__page__content [data-category]').length > 0) {
            $('.product__page__content [data-category]').each(function () {
                var itemCat = $(this).attr('data-category') || '';
                if (categoryType.toLowerCase() === 'all' || itemCat.indexOf(categoryType.toLowerCase()) !== -1) {
                    $(this).fadeIn(300);
                } else {
                    $(this).hide();
                }
            });
        }
    } else if (window.location.pathname.indexOf('categories.html') !== -1) {
        $('#category-title').text('All Anime');
        $('#breadcrumb-current').text('All Anime');
        document.title = 'Anime | All Anime';
    }

    /*------------------
		Hero Slider
	--------------------*/
    var hero_s = $(".hero__slider");
    hero_s.owlCarousel({
        loop: true,
        margin: 0,
        items: 1,
        dots: true,
        nav: true,
        navText: ["<span class='arrow_carrot-left'></span>", "<span class='arrow_carrot-right'></span>"],
        animateOut: 'fadeOut',
        animateIn: 'fadeIn',
        smartSpeed: 1200,
        autoHeight: false,
        autoplay: true,
        mouseDrag: false
    });

    /*------------------
        Video Player
    --------------------*/
    if ($('#player').length > 0) {
        window.player = new Plyr('#player', {
            controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'captions', 'settings', 'fullscreen'],
            seekTime: 25
        });
    }

    /*------------------
        Niceselect
    --------------------*/
    $('select').niceSelect();

    /*------------------
        Scroll To Top
    --------------------*/
    $("#scrollToTopButton").click(function() {
        $("html, body").animate({ scrollTop: 0 }, "slow");
        return false;
     });

})(jQuery);