$(document).ready(function() {
  var MAX_FPS_1080 = 30
  var MAX_FPS_720 = 49
  var MAX_FPS_480 = 90

  $(window).on('resize', function(event) {
    //TODO: Fixa col-md problem här. Mindre knappar osv. Hide
  });

  $('#playBtn').click(function(event) {
    var button = $(this)
    var icon = button.children(".glyphicon");
    var recBtn = button.siblings('#recBtn');
    button.toggleClass('streaming');
    if(button.hasClass('streaming')) {
      recBtn.prop('disabled', true);
      button.addClass('btn-danger').removeClass('btn-default');
      icon.addClass('glyphicon-stop').removeClass('glyphicon-play');
      button.contents().slice(2).replaceWith(" Stop");
    } else {
      recBtn.prop('disabled', false)
      button.addClass("btn-default").removeClass('btn-danger');
      icon.addClass('glyphicon-play').removeClass('glyphicon-stop');
      button.contents().slice(2).replaceWith(" Stream");
    }
  });

  $('#recBtn').on('click', function(event) {
    var button = $(this)
    var icon = button.children(".glyphicon");
    var playBtn = button.siblings('#playBtn');
    button.toggleClass('recording');
    if(button.hasClass('recording')) {
      playBtn.prop('disabled', true)
      button.addClass('btn-danger').removeClass('btn-default');
      icon.addClass('glyphicon-stop').removeClass('glyphicon-record');
      button.contents().slice(2).replaceWith(" Stop");
    } else {
      playBtn.prop("disabled", false);
      button.addClass("btn-default").removeClass('btn-danger');
      icon.addClass('glyphicon-record').removeClass('glyphicon-stop');
      button.contents().slice(2).replaceWith(" Record");
    }
  });

  $("[name='resolutions']").on('change', function(event) {
    //TODO: Gör en forEach och hidea bitrate också! Om det ska vara så
    var btn = $(this)
    var id = btn.attr("id")
    var fps = $("#fps-slider")
    var alertBox = $("#fps-alert")
    var group = $(".fps-group")
    group.removeClass('hidden')
    alertBox.addClass('hidden')
    switch(id) {
      case "1080p":
        fps.attr("max", MAX_FPS_1080).change()
        break
      case "720p":
        fps.attr("max", MAX_FPS_720).change()
        break
      case "480p":
        fps.attr("max", MAX_FPS_480).change()
        break
      case "auto-res":
        //TODO: Fixa alerten vid medium. Wrappar konstigt
        alertBox.removeClass('hidden')
        group.addClass('hidden')
        // $(".fps-group").addClass('hidden')
        break
      default:
        //TODO: Remove this or something
        console.log("WTF!?")
        break
    }
  });


  $("[type='range']").on('input change', function(event) {
    var slider = $(this)
    var box = slider.siblings('.slider-text')
    var fg = box.parent('.form-group')
    if(fg.hasClass('has-error')) {
      fg.addClass('has-success').removeClass('has-error')
      box.removeClass('settings-error')
    }
    box.val(slider.val())
  });

  $(".slider-text").on('input change', function(event) {
    var box = $(this);
    var slider = box.siblings("[type='range']");
    var value = Number(box.val())
    var max = Number(box.attr("max"))
    var min = Number(box.attr("min"))
    var fg = box.parent('.form-group')
    if(value < min || value > max || value == "") {
      fg.addClass('has-error').removeClass('has-success')
      box.addClass('settings-error').removeClass('settings-success')
    } else if(fg.hasClass('has-error')) {
      fg.removeClass('has-error').addClass('has-success')
      box.removeClass('settings-error').addClass('settings-success')
    }
    slider.val(box.val())
  });

  $(".slider-text").on('focus', function(event) {
    var box = $(this);
    var value = Number(box.val())
    var max = Number(box.attr("max"))
    var min = Number(box.attr("min"))
    if((value >= min || value <= max)) {
      box.addClass('settings-success')
    }
  });

  $(".slider-text").on('blur', function(event) {
    var box = $(this)
    if(box.hasClass('settings-success')) {
      box.removeClass('settings-success')
    }
  });

  $('#applyBtn').on('click', function(event) {
    var res = $("[name='resolutions']:checked").val();
    console.log(res);
    //Kalla på submit? Om submit ens ska finnas
  });

  $(".video-form").on('submit', function(event) {
    //Ajax och skicka till server för uppdatering
    //Eller ska man måste fylla i allt först och sedan apply?
    console.log("ApplyBTn plz")
    event.preventDefault();
  });

});
