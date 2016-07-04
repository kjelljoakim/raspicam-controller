$(document).ready(function() {
  var MAX_FPS_1080 = 30
  var MIN_FPS_1080 = 1
  var MAX_FPS_720 = 90
  var MIN_FPS_720 = 40
  var MAX_FPS_480 = 90
  var MIN_FPS_480 = 40

  var $sliders = $("[type='range']")
  var $numberBoxes = $(".slider-text")
  var $settings = $("form")


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
    toggleOptionsOnRecord()
  });

  $('#recBtn').on('click', function(event) {
    var button = $(this)

    if(button.hasClass('recording')) {
      stopRecording(button)
    } else {
      startRecording(button)
    }
  });

  function startRecording(recBtn) {
    var icon = recBtn.children(".glyphicon");
    var playBtn = recBtn.siblings('#playBtn');

    $.ajax({
      url: '/record',
      type: 'POST',
      dataType: 'json'
    })
    .done(function(response) {
      if(response.recording) {
        recBtn.addClass('recording');
        playBtn.prop('disabled', true)
        recBtn.addClass('btn-danger').removeClass('btn-default');
        icon.addClass('glyphicon-stop').removeClass('glyphicon-record');
        recBtn.contents().slice(2).replaceWith(" Stop");
        toggleOptionsOnRecord()
      } else {
        alert("Recording not started due to failure!")
      }
    })
    .fail(function() {
      console.log("error");
    })
    .always(function() {
      console.log("complete");
    });

  }

  function stopRecording(recBtn) {
    var icon = recBtn.children(".glyphicon");
    var playBtn = recBtn.siblings('#playBtn');

    $.ajax({
      url: '/stopRecord',
      type: 'POST',
      dataType: 'json'
    })
    .done(function(response) {
      if(response.stopped) {
        recBtn.removeClass('recording')
        playBtn.prop("disabled", false);
        recBtn.addClass("btn-default").removeClass('btn-danger');
        icon.addClass('glyphicon-record').removeClass('glyphicon-stop');
        recBtn.contents().slice(2).replaceWith(" Record");
        toggleOptionsOnRecord()
      } else {
        alert("Recording not stopped due to failure!")
      }
    })
    .fail(function() {
      console.log("error");
    })
    .always(function() {
      console.log("complete");
    });

  }

  $("[name='resolution']").on('change', function(event) {
    //TODO: Gör en forEach och hidea bitrate också! Om det ska vara så
    var btn = $(this)
    var id = btn.attr("id")
    var fps = $("#fps-slider")
    var box = fps.siblings('.slider-text')
    var alertBox = $("#fps-alert")
    var group = $("#fps-group")
    group.removeClass('hidden')
    alertBox.addClass('hidden')
    switch(id) {
      case "1080p":
        console.log("hej")
        box.attr({"max": MAX_FPS_1080, "min": MIN_FPS_1080});
        fps.attr({"max" : MAX_FPS_1080, "min" : MIN_FPS_1080}).change()
        break
      case "720p":
        box.attr({"max": MAX_FPS_720, "min": MIN_FPS_1080});
        fps.attr({"max" : MAX_FPS_720, "min" : MIN_FPS_720}).change()
        break
      case "480p":
        box.attr({"max": MAX_FPS_480, "min": MIN_FPS_480});
        fps.attr({"max" : MAX_FPS_480, "min" : MIN_FPS_480}).change()
        break
      case "auto-res":
        //TODO: Fixa alerten vid medium. Wrappar konstigt
        alertBox.removeClass('hidden')
        group.addClass('hidden')
        break
      default:
        //TODO: Remove this or something
        console.log("WTF!?")
        break
    }
  });

  $sliders.on('input change', function(event) {
    var slider = $(this)
    var box = slider.siblings('.slider-text')

    if(!box.hasClass('settings-success')) {
      $numberBoxes.each(function(index, el) {
        $(el).blur();
      });
    }
    clearSuccessBoxes()
    box.addClass('settings-success')
    box.val(slider.val()).change();
  });

  $numberBoxes.on('input change', function(event) {
    var box = $(this);
    var slider = box.siblings("[type='range']");
    var value = Number(box.val())
    var max = Number(box.attr("max"))
    var min = Number(box.attr("min"))
    var fg = box.parent('.form-group')

    if(value < min || value > max || box.val() == "") {
      fg.addClass('has-error').removeClass('has-success')
      box.addClass('settings-error').removeClass('settings-success')
    } else if(fg.hasClass('has-error')) {
      fg.removeClass('has-error').addClass('has-success')
      box.removeClass('settings-error').addClass('settings-success')
    }
    //Exposure modes are only available if ISO == 0 (auto)
    if(slider.attr("name") == "iso") {
      var exposure = $("[name='exposure_mode']")
      var alert = exposure.siblings('#iso-alert')
      if(slider.val() != 0 || box.val() != 0) {
        exposure.addClass('hidden')
        exposure.prop('disabled', true)
        alert.removeClass('hidden')
      } else if(exposure.hasClass('hidden')) {
        exposure.removeClass('hidden')
        exposure.prop('disabled', false)
        alert.addClass('hidden')
      }
    }
    slider.val(box.val())
  });

  $numberBoxes.on('focus', function(event) {
    var box = $(this);
    var value = Number(box.val())
    var max = Number(box.attr("max"))
    var min = Number(box.attr("min"))
    clearSuccessBoxes()
    if((value >= min || value <= max)) {
      box.addClass('settings-success')
    }
  });

  $numberBoxes.on('blur', function(event) {
    var box = $(this)
    if(box.hasClass('settings-success')) {
      box.removeClass('settings-success')
    }
  });


  $('#applyBtn').on('click', function(event) {
    var validSettings = true
    $numberBoxes.each(function(index, setting) {
      var min = Number(setting.min)
      var max = Number(setting.max)
      var value = Number(setting.value)
      if(value < min || value > max) {
        alert("FIXA ALERT MODAL!")
        //Eller disable apply tidigare, så fort en setting är fel?
        validSettings = false
        return false
      }
    });
    if(validSettings) {
      var newSettings = $settings.serializeArray()
      applySettingsAsync(newSettings)
    } else {
      //Använd den i each loopen. Eftersom det går att skriva ut vilken som är fel då (Första)
      //Så ta bort denna else
      alert("Some settings are poopy!")
    }
  });

  function applySettingsAsync(settings) {
    //Check setttings om valid, annars modal/alert
    //ELler nej, gör appybtn disabled/alert över om någon setting är fel.
    console.log("Sending AJAX")
    $.ajax({
      url: '/apply',
      type: 'POST',
      dataType: 'json',
      data: JSON.stringify(settings),
      contentType: 'application/json'
    })
    .done(function(response) {
      console.log("received response");
      console.log(response.applied)
      if(response.applied) {
          //Ta bort spinning
      } else {
        console.log(response.error)
        //modal Alert
      }
    })
    .fail(function() {
      console.log("error");
    })
    .always(function(response) {
      console.log("always");
    });
    //snurrande grej
  }



  function findMinMax(name) {
    var element = $("[name='"+name+"']")
    var min = $(element).attr("min")
    var max = $(element).attr("max")
    return {min, max}
  }

  function clearSuccessBoxes() {
    $numberBoxes.each(function(index, element) {
      $(element).removeClass('settings-success')
      //$(element).blur();
    });
  }

  function toggleOptionsOnRecord() {
    var options = $(".disable-when-recording")
    options.each(function(index, element) {
      var $element = $(element)
      //Toggles disabled value for inputs.
      if($element.hasClass("dropdowns")) {
        $element.prop('disabled', function(i, v) { return !v; });
      } else {
        $element.find('input').prop('disabled', function(i, v) { return !v; });
      }
      $element.toggleClass('hidden')
      $element.siblings('.rec-alert').toggleClass('hidden')
    });
  }

});
